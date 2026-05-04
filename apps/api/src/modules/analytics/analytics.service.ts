import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource }   from '@nestjs/typeorm';
import { DataSource }         from 'typeorm';
import type { AdminKpisDto, DemandaHabilidadDto } from '@repo/trpc-contract/src/types';


export interface EvolucionMensualRow {
  mes:           string;
  ofertas:       number;
  postulaciones: number;
}


interface RawAdminKpis {
  total_egresados: string;
  total_empresas: string;
  ofertas_activas: string;
  postulaciones_mes: string;
  tasa_empleabilidad: string | null;
  salario_promedio: string | null;
  salario_desviacion: string | null;
  variacion_egresados: string | null;
  variacion_ofertas: string | null;
}


interface RawDemandaHabilidad {
  habilidad:       string;
  categoria:       string;
  total_ofertas:   string;  // bigint → string en pg driver
  total_egresados: string;
  brecha:          number;  // ::int cast → number directo
}

interface RawEmpresaResumen {
  total_ofertas_activas: string;
  total_postulaciones: string;
  postulaciones_hoy: string;
  total_postulados: string;
  total_en_revision: string;
  total_entrevistas: string;
  total_contratados: string;
  tasa_contratacion: string | null;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectDataSource()
    public readonly dataSource: DataSource,
  ) {}

  async getAdminKpis(_filter?: unknown): Promise<AdminKpisDto> {
    const rows = await this.dataSource.query(`
      WITH base AS (
        SELECT
          (SELECT COUNT(*) FROM egresados)                                          AS total_egresados,
          (SELECT COUNT(*) FROM empresas  WHERE verificada = true)                 AS total_empresas,
          (SELECT COUNT(*) FROM ofertas   WHERE estado = 'ACTIVA')                 AS ofertas_activas,
          (SELECT COUNT(*) FROM postulaciones
            WHERE postulado_at >= date_trunc('month', NOW()))                      AS postulaciones_mes,
          (SELECT COUNT(*) FROM egresados
            WHERE created_at < date_trunc('month', NOW()))                         AS egresados_anterior,
          (SELECT COUNT(*) FROM ofertas
            WHERE estado = 'ACTIVA'
              AND publicada_at < date_trunc('month', NOW()))                       AS ofertas_anterior,
          (SELECT
            ROUND(
              COUNT(*) FILTER (WHERE p.estado = 'CONTRATADO')::numeric
              / NULLIF(COUNT(DISTINCT eg.id), 0) * 100, 2
            )
           FROM egresados eg
           LEFT JOIN postulaciones p ON p.egresado_id = eg.id)                    AS tasa_empleabilidad,
          (SELECT ROUND(AVG(salario_max)::numeric, 2)
           FROM ofertas WHERE estado = 'ACTIVA' AND salario_max IS NOT NULL)       AS salario_promedio,
          (SELECT ROUND(STDDEV_POP(salario_max)::numeric, 2)
           FROM ofertas WHERE estado = 'ACTIVA' AND salario_max IS NOT NULL)       AS salario_desviacion
      )
      SELECT
        total_egresados,
        total_empresas,
        ofertas_activas,
        postulaciones_mes,
        tasa_empleabilidad,
        salario_promedio,
        salario_desviacion,
        ROUND(
          (total_egresados - egresados_anterior)::numeric
          / NULLIF(egresados_anterior, 0) * 100, 1
        ) AS variacion_egresados,
        ROUND(
          (ofertas_activas - ofertas_anterior)::numeric
          / NULLIF(ofertas_anterior, 0) * 100, 1
        ) AS variacion_ofertas
      FROM base
    `) as RawAdminKpis[];

    const kpis = rows[0];

    return {
      totalEgresados:          Number(kpis.total_egresados),
      totalEmpresas:           Number(kpis.total_empresas),
      totalOfertasActivas:     Number(kpis.ofertas_activas),
      totalPostulacionesMes:   Number(kpis.postulaciones_mes),
      tasaEmpleabilidadGlobal: Number(kpis.tasa_empleabilidad ?? 0),
      variacionEgresados:      Number(kpis.variacion_egresados ?? 0),
      variacionOfertas:        Number(kpis.variacion_ofertas ?? 0),
      salarioPromedioGlobal:   kpis.salario_promedio    != null ? Number(kpis.salario_promedio)    : null,
      salarioDesviacionGlobal: kpis.salario_desviacion  != null ? Number(kpis.salario_desviacion)  : null,
    };
  }

  async getOfertasStatsAdmin() {
    const rows = await this.dataSource.query(`
      SELECT
        COUNT(*)                                          AS total,
        COUNT(*) FILTER (WHERE estado = 'ACTIVA')         AS activas,
        COUNT(*) FILTER (WHERE estado = 'BORRADOR')       AS pendientes,
        (SELECT COUNT(*) FROM postulaciones)              AS postulaciones
      FROM ofertas
    `) as any[];
    
    const stats = rows[0] || {};
    return {
      total:         Number(stats.total || 0),
      activas:       Number(stats.activas || 0),
      pendientes:    Number(stats.pendientes || 0),
      postulaciones: Number(stats.postulaciones || 0),
    };
  }

  async getEgresadosStatsAdmin() {
    const rows = await this.dataSource.query(`
      WITH stats AS (
        SELECT
          COUNT(*)                                          AS total,
          COUNT(DISTINCT carrera)                           AS carreras,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW())) AS nuevos_mes,
          COUNT(*) FILTER (WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month') 
                            AND created_at < date_trunc('month', NOW())) AS anterior_mes
        FROM egresados
      )
      SELECT
        total,
        carreras,
        nuevos_mes,
        ROUND(
          (nuevos_mes - anterior_mes)::numeric
          / NULLIF(anterior_mes, 0) * 100, 1
        ) AS variacion
      FROM stats
    `) as any[];

    const s = rows[0] || {};
    return {
      total:     Number(s.total || 0),
      carreras:  Number(s.carreras || 0),
      nuevosMes: Number(s.nuevos_mes || 0),
      variacion: Number(s.variacion || 0),
    };
  }

  async getEmpresasStatsAdmin() {
    const stats = await this.dataSource.query(`
      SELECT
        (SELECT COUNT(*) FROM empresas) as total,
        (SELECT COUNT(*) FROM empresas WHERE verificada = true) as verificadas,
        (SELECT COUNT(*) FROM ofertas WHERE estado = 'ACTIVA') as activas
    `) as any[];

    const s = stats[0] || {};
    return {
      total:      Number(s.total || 0),
      verificadas: Number(s.verificadas || 0),
      activas:    Number(s.activas || 0),
    };
  }

  async getPostulacionesStatsAdmin() {
    const rows = await this.dataSource.query(`
      SELECT
        COUNT(*)                                              AS total,
        COUNT(*) FILTER (WHERE estado = 'EN_REVISION')       AS en_revision,
        COUNT(*) FILTER (WHERE estado = 'ENTREVISTA')        AS entrevistas,
        COUNT(*) FILTER (WHERE estado = 'CONTRATADO')        AS contratados
      FROM postulaciones
    `) as any[];

    const s = rows[0] || {};
    return {
      total:       Number(s.total || 0),
      enRevision:  Number(s.en_revision || 0),
      entrevistas: Number(s.entrevistas || 0),
      contratados: Number(s.contratados || 0),
    };
  }

  async getEmpresasPorSector() {
    const rows = await this.dataSource.query(`
      SELECT sector, COUNT(*) AS total
      FROM empresas
      WHERE sector IS NOT NULL
      GROUP BY sector
      ORDER BY total DESC
    `) as any[];

    return rows.map((r: any) => ({
      sector: r.sector,
      total:  Number(r.total),
    }));
  }

  async getEvolucionMensual(meses = 12): Promise<EvolucionMensualRow[]> {
    const rows = await this.dataSource.query(`
      SELECT
        TO_CHAR(date_trunc('month', g.mes), 'YYYY-MM') AS mes,
        COALESCE(o.total_ofertas, 0)::int               AS ofertas,
        COALESCE(p.total_postulaciones, 0)::int         AS postulaciones
      FROM generate_series(
        date_trunc('month', NOW() - INTERVAL '${meses - 1} months'),
        date_trunc('month', NOW()),
        INTERVAL '1 month'
      ) g(mes)
      LEFT JOIN (
        SELECT date_trunc('month', publicada_at) AS mes, COUNT(*) AS total_ofertas
        FROM ofertas WHERE publicada_at IS NOT NULL GROUP BY 1
      ) o ON o.mes = g.mes
      LEFT JOIN (
        SELECT date_trunc('month', postulado_at) AS mes, COUNT(*) AS total_postulaciones
        FROM postulaciones GROUP BY 1
      ) p ON p.mes = g.mes
      ORDER BY g.mes
    `) as EvolucionMensualRow[];

    // PostgreSQL devuelve números como strings — convertir explícitamente
    return rows.map((r) => ({
      mes:           r.mes,
      ofertas:       Number(r.ofertas),
      postulaciones: Number(r.postulaciones),
    }));
  }

  async getDemandaHabilidades(limit = 20): Promise<DemandaHabilidadDto[]> {
    const rows = await this.dataSource.query(`
      WITH habilidades_oferta AS (
        SELECT elem AS habilidad, COUNT(DISTINCT id) AS total_ofertas
        FROM ofertas CROSS JOIN LATERAL
            jsonb_array_elements_text(CASE WHEN habilidades_req IS NOT NULL AND jsonb_typeof(habilidades_req) = 'array' THEN habilidades_req ELSE '[]'::jsonb END) AS elem
        WHERE estado = 'ACTIVA'
        GROUP BY elem
      ),
      habilidades_egresado AS (
        SELECT h->>'nombre'    AS habilidad,
              h->>'categoria' AS categoria,
              COUNT(DISTINCT id) AS total_egresados
        FROM egresados CROSS JOIN LATERAL
            jsonb_array_elements(CASE WHEN habilidades IS NOT NULL AND jsonb_typeof(habilidades) = 'array' THEN habilidades ELSE '[]'::jsonb END) AS h
        GROUP BY h->>'nombre', h->>'categoria'
      )
      SELECT
        COALESCE(ho.habilidad, he.habilidad)                              AS habilidad,
        COALESCE(he.categoria, 'TECNICA')                                 AS categoria,
        COALESCE(ho.total_ofertas, 0)                                     AS total_ofertas,
        COALESCE(he.total_egresados, 0)                                   AS total_egresados,
        COALESCE(ho.total_ofertas, 0)::int - COALESCE(he.total_egresados, 0)::int AS brecha
      FROM habilidades_oferta ho
      FULL OUTER JOIN habilidades_egresado he
        ON LOWER(ho.habilidad) = LOWER(he.habilidad)
      ORDER BY total_ofertas DESC
      LIMIT $1
    `, [limit]) as RawDemandaHabilidad[];

    return rows.map((r): DemandaHabilidadDto => ({
      habilidad:      r.habilidad,
      categoria:      r.categoria,
      totalOfertas:   Number(r.total_ofertas),
      totalEgresados: Number(r.total_egresados),
      brecha:         Number(r.brecha),
    }));
  }

  async getDistribucionCarrera(): Promise<unknown[]> {
    return this.dataSource.query(`
      SELECT
        carrera,
        COUNT(*)                   AS total_egresados,
        MIN(anio_egreso)           AS primer_anio,
        MAX(anio_egreso)           AS ultimo_anio,
        ROUND(AVG(anio_egreso), 0) AS anio_promedio
      FROM egresados
      GROUP BY carrera
      ORDER BY total_egresados DESC
    `) as Promise<unknown[]>;
  }

  async getStatsEmpresa(empresaId: string): Promise<unknown> {
    const rows = await this.dataSource.query(`
      SELECT
        COUNT(DISTINCT o.id)                              AS total_ofertas,
        COUNT(DISTINCT o.id) FILTER (WHERE o.estado = 'ACTIVA') AS ofertas_activas,
        COUNT(p.id)                                       AS total_postulantes,
        COUNT(p.id) FILTER (WHERE p.estado = 'CONTRATADO') AS total_contratados,
        ROUND(
          COUNT(p.id) FILTER (WHERE p.estado = 'CONTRATADO')::numeric
          / NULLIF(COUNT(p.id), 0) * 100, 2
        )                                                 AS tasa_conversion,
        ROUND(AVG(o.salario_max)::numeric, 2)             AS salario_promedio_ofertado
      FROM empresas emp
      LEFT JOIN ofertas      o ON o.empresa_id = emp.id
      LEFT JOIN postulaciones p ON p.oferta_id = o.id
      WHERE emp.id = $1
    `, [empresaId]) as unknown[];
    return rows[0];
  }

  async getResumenEmpresa(empresaId: string) {
    const rows = await this.dataSource.query(`
      WITH stats_postulaciones AS (
        SELECT
          COUNT(p.id)                                       AS total_postulaciones,
          COUNT(p.id) FILTER (WHERE p.postulado_at >= CURRENT_DATE) AS postulaciones_hoy,
          COUNT(p.id) FILTER (WHERE p.estado = 'POSTULADO') AS total_postulados,
          COUNT(p.id) FILTER (WHERE p.estado = 'EN_REVISION') AS total_en_revision,
          COUNT(p.id) FILTER (WHERE p.estado = 'ENTREVISTA') AS total_entrevistas,
          COUNT(p.id) FILTER (WHERE p.estado = 'CONTRATADO') AS total_contratados,
          COUNT(p.id) FILTER (WHERE p.estado = 'RECHAZADO')  AS total_rechazados
        FROM ofertas o
        LEFT JOIN postulaciones p ON p.oferta_id = o.id
        WHERE o.empresa_id = $1
      ),
      stats_ofertas AS (
        SELECT
          COUNT(id) FILTER (WHERE estado = 'ACTIVA') AS total_ofertas_activas,
          SUM(vistas)                                AS total_vistas,
          ROUND(AVG(EXTRACT(EPOCH FROM (cierra_at - publicada_at)) / 86400)::numeric, 1) AS dias_promedio_cierre
        FROM ofertas
        WHERE empresa_id = $1
      )
      SELECT
        so.total_ofertas_activas,
        sp.total_postulaciones,
        sp.postulaciones_hoy,
        sp.total_postulados,
        sp.total_en_revision,
        sp.total_entrevistas,
        sp.total_contratados,
        sp.total_rechazados,
        so.dias_promedio_cierre,
        ROUND(
          sp.total_contratados::numeric / NULLIF(sp.total_postulaciones, 0) * 100, 2
        ) AS tasa_contratacion,
        ROUND(
          sp.total_postulaciones::numeric / NULLIF(so.total_vistas, 0) * 100, 2
        ) AS ctr_promedio
      FROM stats_postulaciones sp, stats_ofertas so
    `, [empresaId]) as any[];

    const resumen = rows[0] || {};

    return {
      totalOfertasActivas: Number(resumen.total_ofertas_activas || 0),
      totalPostulaciones:  Number(resumen.total_postulaciones || 0),
      postulacionesHoy:    Number(resumen.postulaciones_hoy || 0),
      totalPostulados:     Number(resumen.total_postulados || 0),
      totalEnRevision:     Number(resumen.total_en_revision || 0),
      totalEntrevistas:    Number(resumen.total_entrevistas || 0),
      totalContratados:    Number(resumen.total_contratados || 0),
      totalRechazados:     Number(resumen.total_rechazados || 0),
      tasaContratacion:    Number(resumen.tasa_contratacion || 0),
      diasPromedioCierre:  Number(resumen.dias_promedio_cierre || 0),
      ctrPromedio:         Number(resumen.ctr_promedio || 0),
    };
  }

  async getRendimientoOfertas(empresaId: string) {
    return this.dataSource.query(`
      SELECT 
        o.id,
        o.titulo,
        o.vistas,
        COUNT(p.id) as postulaciones,
        ROUND((COUNT(p.id)::numeric / NULLIF(o.vistas, 0)) * 100, 2) as conversion_rate,
        o.estado,
        o.created_at
      FROM ofertas o
      LEFT JOIN postulaciones p ON p.oferta_id = o.id
      WHERE o.empresa_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [empresaId]);
  }
}
