import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bull';
import { InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as Handlebars from 'handlebars';
import { TipoReporte } from '@repo/trpc-contract';
import { AnalyticsService } from '../analytics/analytics.service';
import { ReporteJob } from './entities/reporte-job.entity';

interface RawEgresadoReporte {
  nombres: string;
  apellidos: string;
  carrera: string;
  anio_egreso: number;
  ubicacion: string | null;
  email: string;
}

@Injectable()
export class ReportesService {
  private readonly logger = new Logger(ReportesService.name);

  constructor(
    @InjectRepository(ReporteJob)
    private readonly jobRepo: Repository<ReporteJob>,
    @InjectQueue('reportes')
    private readonly queue: Queue,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  onModuleInit() {
    this.logger.log('ReportesService inicializado — modo on-demand (sin almacenamiento en disco)');
  }

  async generarReporte(
    dto: { tipo: TipoReporte; filtros?: unknown; asincrono?: boolean },
    userId: string,
  ): Promise<{ jobId: string; base64?: string; filename?: string }> {
    const job = await this.jobRepo.save(
      this.jobRepo.create({
        tipo: dto.tipo,
        filtros: dto.filtros as Record<string, unknown>,
        creadoPor: userId,
      }),
    );

    if (dto.asincrono === true) {
      // Generar en background — el PDF se guarda como base64 en la BD
      void this.queue.add('generar-pdf', { jobId: job.id, dto }, { jobId: job.id });
      return { jobId: job.id };
    }

    // Generación síncrona — devolver el base64 directamente
    const result = await this.generarPDF(job.id, dto as { tipo: TipoReporte; filtros?: Record<string, unknown> });
    return { jobId: job.id, base64: result.base64, filename: result.filename };
  }

  async getJobStatus(jobId: string) {
    const job = await this.jobRepo.findOne({
      select: ['id', 'estado', 'url', 'error', 'creadoAt'],
      where: { id: jobId },
    });
    if (job === null || job === undefined) throw new NotFoundException(`Job ${jobId} no encontrado`);
    return {
      jobId:       job.id,
      estado:      job.estado,
      url:         job.url,
      error:       job.error,
      creadoAt:    job.creadoAt.toISOString(),
      // El PDF está disponible para descarga cuando el estado es COMPLETADO
      pdfDisponible: job.estado === 'COMPLETADO',
    };
  }

  /**
   * Recupera el PDF base64 de un job completado para descarga directa.
   */
  async getJobPdf(jobId: string): Promise<{ base64: string; filename: string }> {
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (job === null || job === undefined) {
      throw new NotFoundException(`Job ${jobId} no encontrado`);
    }
    if (job.estado !== 'COMPLETADO' || !job.pdfBase64) {
      throw new NotFoundException(`El PDF del job ${jobId} aún no está disponible`);
    }
    const filename = `${job.tipo}_${job.id}.pdf`;
    return { base64: job.pdfBase64, filename };
  }

  async listarJobs(limit = 20) {
    const jobs = await this.jobRepo.find({
      select: ['id', 'tipo', 'estado', 'url', 'error', 'creadoAt', 'completadoAt'],
      order: { creadoAt: 'DESC' },
      take: limit,
    });
    return jobs.map((job) => ({
      jobId:        job.id,
      tipo:         job.tipo,
      estado:       job.estado,
      url:          job.url,
      error:        job.error,
      creadoAt:     job.creadoAt.toISOString(),
      completadoAt: job.completadoAt?.toISOString() ?? null,
    }));
  }

  async generarPDF(
    jobId: string,
    dto: { tipo: TipoReporte; filtros?: Record<string, unknown> },
  ): Promise<{ base64: string; filename: string }> {
    let browser: puppeteer.Browser | null = null;
    try {
      this.logger.log(`Iniciando generación de PDF para job ${jobId}...`);
      
      // Marcar como PROCESANDO al iniciar
      await this.jobRepo.update(jobId, { estado: 'PROCESANDO' });

      // Obtener datos según tipo de reporte
      const data = await this.obtenerDatos(dto.tipo, dto.filtros);

      // Usar template embebido (no depende de filesystem)
      const templateSrc = this.getDefaultTemplate(dto.tipo);

      // Registrar helpers
      Handlebars.registerHelper('isArray', (value) => Array.isArray(value));
      Handlebars.registerHelper('keys', (value) => value && typeof value === 'object' ? Object.keys(value) : []);
      Handlebars.registerHelper('values', (value) => value && typeof value === 'object' ? Object.values(value) : []);
      Handlebars.registerHelper('json', (value) => JSON.stringify(value, null, 2));
      Handlebars.registerHelper('eq', (a, b) => a === b);
      Handlebars.registerHelper('gt', (a, b) => Number(a) > Number(b));
      Handlebars.registerHelper('lookup', (obj, index) => obj && obj[index]);

      const template = Handlebars.compile(templateSrc);
      const html = template({ data, filtros: dto.filtros, generadoEn: new Date().toLocaleString('es-PE') });

      // Generar PDF con Puppeteer
      const chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

      this.logger.log(`Lanzando Puppeteer para job ${jobId}...`);
      browser = await puppeteer.launch({
        headless: true,
        executablePath: chromePath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process'],
      });
      
      const page = await browser.newPage();
      
      // Timeout defensivo de 30 segundos
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

      this.logger.log(`Generando buffer PDF para job ${jobId}...`);
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
        timeout: 30000,
      });

      // Convertir a base64 en memoria (sin escribir a disco)
      const base64 = Buffer.from(pdfBuffer).toString('base64');
      const filename = `${dto.tipo}_${jobId}.pdf`;

      this.logger.log(`PDF generado en memoria: ${filename} (${pdfBuffer.length} bytes)`);

      // Actualizar job en la BD — guardar base64 para descarga posterior
      await this.jobRepo.update(jobId, {
        estado: 'COMPLETADO',
        pdfBase64: base64,
        completadoAt: new Date(),
      });

      return { base64, filename };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`Error generando PDF para job ${jobId}: ${errorMsg}`);
      await this.jobRepo.update(jobId, {
        estado: 'ERROR',
        error: errorMsg,
      });
      throw error;
    } finally {
      if (browser !== null) {
        void browser.close();
      }
    }
  }

  private async obtenerDatos(tipo: TipoReporte, filtros?: Record<string, unknown>): Promise<unknown> {
    switch (tipo) {
      case 'EMPLEABILIDAD_COHORTE':
        return {
          cohortes: await this.analyticsService.getAdminKpis(filtros),
          distribucion: await this.analyticsService.getDistribucionCarrera(),
        };
      case 'DEMANDA_LABORAL': {
        const meses = filtros && typeof filtros === 'object' && 'meses' in filtros ? Number(filtros.meses) : 12;
        return {
          habilidades: await this.analyticsService.getDemandaHabilidades(50),
          evolucion: await this.analyticsService.getEvolucionMensual(meses),
          kpis: await this.analyticsService.getAdminKpis(),
          meses,
        };
      }
      case 'LISTADO_EGRESADOS':
        return this.dataSource.query(`
          SELECT eg.nombres, eg.apellidos, eg.carrera, eg.anio_egreso,
                 eg.ubicacion, u.email
          FROM egresados eg JOIN users u ON u.id = eg.user_id
          WHERE u.is_active = true ORDER BY eg.apellidos, eg.nombres
          LIMIT 1000
        `);
      case 'LISTADO_EMPRESAS':
        return this.dataSource.query(`
          SELECT razon_social, ruc, sector, ubicacion, verificada
          FROM empresas
          ORDER BY razon_social ASC
          LIMIT 1000
        `);
      case 'LISTADO_OFERTAS':
        return this.dataSource.query(`
          SELECT o.titulo, e.razon_social as empresa, o.modalidad, o.estado,
                 o.publicada_at as created_at, COUNT(p.id) as postulaciones
          FROM ofertas o
          LEFT JOIN empresas e ON e.id = o.empresa_id
          LEFT JOIN postulaciones p ON p.oferta_id = o.id
          GROUP BY o.id, e.razon_social
          ORDER BY o.publicada_at DESC
          LIMIT 1000
        `);
      case 'HISTORIAL_POSTULACIONES':
        return this.dataSource.query(`
          SELECT p.postulado_at as created_at, e.nombres, e.apellidos, o.titulo as oferta,
                 em.razon_social as empresa, p.estado
          FROM postulaciones p
          JOIN egresados e ON e.id = p.egresado_id
          JOIN ofertas o ON o.id = p.oferta_id
          JOIN empresas em ON em.id = o.empresa_id
          ORDER BY p.postulado_at DESC
          LIMIT 1000
        `);
      case 'COMPARATIVO_CARRERAS':
        return this.analyticsService.getDistribucionCarrera();
      default:
        return {};
    }
  }

  private getDefaultTemplate(tipo: string): string {
    const templates: Record<string, string> = {
      'EMPLEABILIDAD_COHORTE': this.getEmpleabilidadTemplate(),
      'DEMANDA_LABORAL': this.getDemandaTemplate(),
      'LISTADO_EGRESADOS': this.getEgresadosTemplate(),
      'LISTADO_OFERTAS': this.getOfertasTemplate(),
      'HISTORIAL_POSTULACIONES': this.getPostulacionesTemplate(),
    };
    return templates[tipo] || this.getGenericTemplate(tipo);
  }

  private getEmpleabilidadTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
    .kpi-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
    .kpi-card.blue { border-color: #3b82f6; }
    .kpi-card.green { border-color: #10b981; }
    .kpi-card.purple { border-color: #8b5cf6; }
    .kpi-card.amber { border-color: #f59e0b; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 6px; }
    .kpi-value { font-size: 28px; font-weight: 700; color: #1e293b; }
    .kpi-suffix { font-size: 14px; color: #64748b; margin-left: 4px; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 18px; font-weight: 700; color: #1e40af; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: #3b82f6; border-radius: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f1f5f9; color: #475569; padding: 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #fafafa; }
    tr:hover { background: #f1f5f9; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .progress-bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-top: 6px; }
    .progress-fill { height: 100%; border-radius: 4px; }
    .progress-fill.high { background: #10b981; }
    .progress-fill.medium { background: #f59e0b; }
    .progress-fill.low { background: #ef4444; }
    .number { font-family: 'Segoe UI', monospace; font-weight: 600; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; }
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .stat-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; }
    .stat-label { color: #64748b; font-size: 12px; }
    .stat-value { font-weight: 600; color: #1e293b; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Reporte de Empleabilidad por Cohorte</h1>
    <p>Generado el {{generadoEn}} | Sistema de Egresados UNT</p>
  </div>
  <div class="container">
    <!-- KPIs -->
    <div class="kpi-grid">
      <div class="kpi-card blue">
        <div class="kpi-label">Total Egresados</div>
        <div class="kpi-value number">{{data.cohortes.totalEgresados}}<span class="kpi-suffix"></span></div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-label">Tasa Empleabilidad</div>
        <div class="kpi-value number">{{data.cohortes.tasaEmpleabilidadGlobal}}<span class="kpi-suffix">%</span></div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-label">Salario Promedio</div>
        <div class="kpi-value number">S/ {{data.cohortes.salarioPromedioGlobal}}<span class="kpi-suffix"></span></div>
      </div>
      <div class="kpi-card amber">
        <div class="kpi-label">Ofertas Activas</div>
        <div class="kpi-value number">{{data.cohortes.totalOfertasActivas}}<span class="kpi-suffix"></span></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="section">
        <div class="section-title">Métricas Adicionales</div>
        <div class="stat-row"><span class="stat-label">Total Empresas</span><span class="stat-value number">{{data.cohortes.totalEmpresas}}</span></div>
        <div class="stat-row"><span class="stat-label">Postulaciones este Mes</span><span class="stat-value number">{{data.cohortes.totalPostulacionesMes}}</span></div>
        <div class="stat-row"><span class="stat-label">Variación Egresados</span><span class="stat-value number" style="color: {{#if (gt data.cohortes.variacionEgresados 0)}}#10b981{{else}}#ef4444{{/if}}">{{data.cohortes.variacionEgresados}}%</span></div>
        <div class="stat-row"><span class="stat-label">Variación Ofertas</span><span class="stat-value number" style="color: {{#if (gt data.cohortes.variacionOfertas 0)}}#10b981{{else}}#ef4444{{/if}}">{{data.cohortes.variacionOfertas}}%</span></div>
      </div>
      <div class="section">
        <div class="section-title">Resumen por Carrera</div>
        {{#if data.distribucion}}
          {{#each data.distribucion}}
          <div class="stat-row">
            <span class="stat-label">{{carrera}}</span>
            <span class="stat-value number">{{#if total_egresados}}{{total_egresados}}{{else}}0{{/if}} egresados</span>
          </div>
          {{/each}}
        {{else}}
          <p style="color:#94a3b8; font-size:12px;">No hay datos de distribución por carrera.</p>
        {{/if}}
      </div>
    </div>
  </div>
  <div class="footer">📄 Documento generado automáticamente | Sistema de Egresados UNT</div>
</body>
</html>`;
  }

  private getDemandaTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
    .kpi-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
    .kpi-card.teal { border-color: #14b8a6; }
    .kpi-card.orange { border-color: #f97316; }
    .kpi-card.red { border-color: #ef4444; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 6px; }
    .kpi-value { font-size: 24px; font-weight: 700; color: #1e293b; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 18px; font-weight: 700; color: #0f766e; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: #14b8a6; border-radius: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { background: #f1f5f9; color: #475569; padding: 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 10px; border-bottom: 2px solid #e2e8f0; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #fafafa; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .badge-tech { background: #dbeafe; color: #1e40af; }
    .badge-soft { background: #fce7f3; color: #be185d; }
    .badge-lang { background: #dcfce7; color: #166534; }
    .bar-container { display: flex; align-items: center; gap: 8px; }
    .bar { height: 20px; border-radius: 4px; min-width: 4px; }
    .bar-demand { background: #f97316; }
    .bar-supply { background: #14b8a6; }
    .brecha { font-weight: 700; }
    .brecha.positive { color: #10b981; }
    .brecha.negative { color: #ef4444; }
    .number { font-family: 'Segoe UI', monospace; font-weight: 600; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📈 Análisis de Demanda Laboral y Mercado</h1>
    <p>Generado el {{generadoEn}} | Periodo de análisis: Últimos {{data.meses}} meses | Sistema de Egresados UNT</p>
  </div>
  <div class="container">
    <div class="kpi-grid" style="grid-template-columns: repeat(4, 1fr); margin-bottom: 20px;">
      <div class="kpi-card teal">
        <div class="kpi-label">Tasa de Empleabilidad</div>
        <div class="kpi-value number">{{data.kpis.tasaEmpleabilidadGlobal}}%</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-label">Salario Promedio</div>
        <div class="kpi-value number">S/ {{data.kpis.salarioPromedioGlobal}}</div>
      </div>
      <div class="kpi-card red">
        <div class="kpi-label">Ofertas Activas</div>
        <div class="kpi-value number">{{data.kpis.totalOfertasActivas}}</div>
      </div>
      <div class="kpi-card" style="border-color: #3b82f6;">
        <div class="kpi-label">Empresas Registradas</div>
        <div class="kpi-value number">{{data.kpis.totalEmpresas}}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Flujo Mensual (Últimos {{data.meses}} meses)</div>
      <table>
        <thead>
          <tr>
            <th>Mes</th>
            <th style="text-align:center">Ofertas Publicadas</th>
            <th style="text-align:center">Postulaciones Recibidas</th>
          </tr>
        </thead>
        <tbody>
          {{#each data.evolucion}}
          <tr>
            <td><strong>{{mes}}</strong></td>
            <td style="text-align:center" class="number">{{ofertas}}</td>
            <td style="text-align:center" class="number">{{postulaciones}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Top Habilidades Más Demandadas</div>
      <table>
        <thead>
          <tr>
            <th>Habilidad</th>
            <th>Categoría</th>
            <th style="text-align:center">Ofertas</th>
            <th style="text-align:center">Egresados</th>
            <th style="text-align:center">Brecha</th>
            <th>Visualización</th>
          </tr>
        </thead>
        <tbody>
          {{#each data.habilidades}}
          <tr>
            <td><strong>{{habilidad}}</strong></td>
            <td><span class="badge badge-{{#if (eq categoria 'TECNICA')}}tech{{else}}{{#if (eq categoria 'BLANDA')}}soft{{else}}lang{{/if}}{{/if}}">{{categoria}}</span></td>
            <td class="number" style="text-align:center">{{totalOfertas}}</td>
            <td class="number" style="text-align:center">{{totalEgresados}}</td>
            <td class="number brecha {{#if (gt brecha 0)}}positive{{else}}negative{{/if}}" style="text-align:center">{{#if (gt brecha 0)}}+{{/if}}{{brecha}}</td>
            <td>
              <div class="bar-container">
                <div class="bar bar-demand" style="width: {{totalOfertas}}px; max-width: 100px;"></div>
                <span class="number" style="font-size:10px; color:#64748b;">{{totalOfertas}}</span>
              </div>
            </td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </div>
  <div class="footer">📄 Documento generado automáticamente | Sistema de Egresados UNT</div>
</body>
</html>`;
  }

  private getEgresadosTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: #3b82f6; border-radius: 2px; }
    .count-badge { background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #1e3a8a; color: white; padding: 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #fafafa; }
    tr:hover { background: #eff6ff; }
    .name { font-weight: 600; color: #1e293b; }
    .email { color: #64748b; font-size: 9px; }
    .carrera { display: inline-block; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; }
    .anio { font-family: monospace; color: #475569; font-weight: 600; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>👨‍🎓 Padrón de Egresados</h1>
    <p>Generado el {{generadoEn}} | Sistema de Egresados UNT</p>
  </div>
  <div class="container">
    <div class="section">
      <div class="section-title" style="display:flex; justify-content:space-between;">
        <span>Listado Completo de Egresados</span>
        <span class="count-badge">{{data.length}} registros</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Carrera</th>
            <th>Año Egreso</th>
            <th>Ubicación</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {{#each data}}
          <tr>
            <td class="name">{{nombres}}</td>
            <td class="name">{{apellidos}}</td>
            <td><span class="carrera">{{carrera}}</span></td>
            <td class="anio">{{anio_egreso}}</td>
            <td>{{ubicacion}}</td>
            <td class="email">{{email}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </div>
  <div class="footer">📄 Documento generado automáticamente | Sistema de Egresados UNT</div>
</body>
</html>`;
  }

  private getOfertasTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 18px; font-weight: 700; color: #7c3aed; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: #a855f7; border-radius: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #7c3aed; color: white; padding: 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #fafafa; }
    .titulo { font-weight: 600; color: #1e293b; }
    .empresa { color: #64748b; font-size: 9px; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; text-transform: uppercase; }
    .badge-activa { background: #dcfce7; color: #166534; }
    .badge-pausada { background: #fef3c7; color: #92400e; }
    .badge-cerrada { background: #fee2e2; color: #991b1b; }
    .badge-presencial { background: #dbeafe; color: #1e40af; }
    .badge-remoto { background: #e0e7ff; color: #3730a3; }
    .badge-hibrido { background: #fce7f3; color: #be185d; }
    .postulaciones { font-weight: 700; color: #7c3aed; font-family: monospace; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>💼 Listado de Ofertas Laborales</h1>
    <p>Generado el {{generadoEn}} | Sistema de Egresados UNT</p>
  </div>
  <div class="container">
    <div class="section">
      <div class="section-title">Ofertas Registradas en el Sistema</div>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Empresa</th>
            <th>Modalidad</th>
            <th>Estado</th>
            <th style="text-align:center">Postulaciones</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {{#each data}}
          <tr>
            <td class="titulo">{{titulo}}</td>
            <td class="empresa">{{empresa}}</td>
            <td><span class="badge badge-{{modalidad}}">{{modalidad}}</span></td>
            <td><span class="badge badge-{{#if (eq estado 'ACTIVA')}}activa{{else}}{{#if (eq estado 'PAUSADA')}}pausada{{else}}cerrada{{/if}}{{/if}}">{{estado}}</span></td>
            <td class="postulaciones" style="text-align:center">{{postulaciones}}</td>
            <td>{{created_at}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </div>
  <div class="footer">📄 Documento generado automáticamente | Sistema de Egresados UNT</div>
</body>
</html>`;
  }

  private getPostulacionesTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #be123c 0%, #f43f5e 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .section { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 18px; font-weight: 700; color: #be123c; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ''; width: 4px; height: 20px; background: #f43f5e; border-radius: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #be123c; color: white; padding: 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #fafafa; }
    .egresado { font-weight: 600; color: #1e293b; }
    .oferta { color: #475569; font-weight: 500; }
    .empresa { color: #64748b; font-size: 9px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 9px; font-weight: 700; text-transform: uppercase; }
    .badge-postulado { background: #dbeafe; color: #1e40af; }
    .badge-revision { background: #fef3c7; color: #92400e; }
    .badge-entrevista { background: #e0e7ff; color: #3730a3; }
    .badge-contratado { background: #dcfce7; color: #166534; }
    .badge-rechazado { background: #fee2e2; color: #991b1b; }
    .fecha { font-family: monospace; color: #64748b; font-size: 9px; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎯 Reporte de Colocación Laboral</h1>
    <p>Generado el {{generadoEn}} | Sistema de Egresados UNT</p>
  </div>
  <div class="container">
    <div class="section">
      <div class="section-title">Historial de Postulaciones</div>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Egresado</th>
            <th>Oferta</th>
            <th>Empresa</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {{#each data}}
          <tr>
            <td class="fecha">{{created_at}}</td>
            <td class="egresado">{{nombres}} {{apellidos}}</td>
            <td class="oferta">{{oferta}}</td>
            <td class="empresa">{{empresa}}</td>
            <td><span class="badge badge-{{#if (eq estado 'POSTULADO')}}postulado{{else}}{{#if (eq estado 'EN_REVISION')}}revision{{else}}{{#if (eq estado 'ENTREVISTA')}}entrevista{{else}}{{#if (eq estado 'CONTRATADO')}}contratado{{else}}rechazado{{/if}}{{/if}}{{/if}}{{/if}}">{{estado}}</span></td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  </div>
  <div class="footer">📄 Documento generado automáticamente | Sistema de Egresados UNT</div>
</body>
</html>`;
  }

  private getGenericTemplate(tipo: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 700; text-transform: uppercase; }
    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; }
    .container { max-width: 1200px; margin: 0 auto; padding: 30px; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .section-title { font-size: 18px; font-weight: 700; color: #1e40af; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #1e40af; color: white; padding: 12px; text-align: left; font-weight: 600; text-transform: uppercase; font-size: 9px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { text-align: center; font-size: 11px; color: #94a3b8; padding: 20px; margin-top: 30px; border-top: 1px solid #e2e8f0; }
    pre { background: #f1f5f9; padding: 16px; border-radius: 8px; font-size: 10px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📄 Reporte: ${tipo.replace(/_/g, ' ')}</h1>
    <p>Generado el {{generadoEn}} | Sistema de Egresados UNT</p>
  </div>
  <div class="container">
    {{#if (isArray data)}}
      <div class="section">
        <div class="section-title">Resultados ({{data.length}} registros)</div>
        <table>
          <thead>
            <tr>{{#each (keys data.[0])}}<th>{{this}}</th>{{/each}}</tr>
          </thead>
          <tbody>
            {{#each data}}<tr>{{#each (values this)}}<td>{{this}}</td>{{/each}}</tr>{{/each}}
          </tbody>
        </table>
      </div>
    {{else}}
      {{#each data}}
        <div class="section">
          <div class="section-title">{{@key}}</div>
          {{#if (isArray this)}}
            {{#if this.length}}
              <table>
                <thead><tr>{{#each (keys this.[0])}}<th>{{this}}</th>{{/each}}</tr></thead>
                <tbody>{{#each this}}<tr>{{#each (values this)}}<td>{{this}}</td>{{/each}}</tr>{{/each}}</tbody>
              </table>
            {{else}}
              <p style="color:#94a3b8;">Sin registros.</p>
            {{/if}}
          {{else}}
            <pre>{{json this}}</pre>
          {{/if}}
        </div>
      {{/each}}
    {{/if}}
  </div>
  <div class="footer">📄 Documento generado automáticamente | Sistema de Egresados UNT</div>
</body>
</html>`;
  }
}