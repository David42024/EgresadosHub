import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Egresado } from './entities/egresado.entity';
import {
  CreateEgresadoDto, UpdateEgresadoDto,
  PaginatedResult, EstadisticaCohorteDto, EgresadoStatsDto,
  EgresadoFilter,
} from '@repo/trpc-contract';

// Tipo para perfil público de egresado (sin datos sensibles)
export interface EgresadoPublicProfile {
  id: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  carrera: string;
  anioEgreso: number;
  resumenProfesional: string | null;
  fotoUrl: string | null;
  cvUrl: string | null;
  habilidades: Array<{ nombre: string; nivel?: number; categoria?: string }>;
  experiencias: Array<any>;
  formacion: Array<any>;
  redesSociales: { linkedin?: string; github?: string; portfolio?: string };
  ubicacion: string | null;
}

@Injectable()
export class EgresadosService {
  constructor(
    @InjectRepository(Egresado)
    private readonly repo: Repository<Egresado>,
  ) { }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  async findAll(filter: EgresadoFilter): Promise<PaginatedResult<Egresado>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = filter.skip ?? 0;
    console.log(`\n>>> [DEBUG] EgresadosService.findAll`);
    console.log(`    - Params: limit=${limit}, skip=${skip}, search=${filter.search}`);

    const qb = this.repo.createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'u')
      .where('u.is_active = true')
      .orderBy('e.apellidos', 'ASC');

    if (filter.carrera && filter.carrera !== 'ALL') {
      qb.andWhere('e.carrera ILIKE :carrera', { carrera: `%${filter.carrera}%` });
    }
    if (filter.anioEgreso) {
      qb.andWhere('e.anio_egreso = :anio', { anio: filter.anioEgreso });
    }
    if (filter.ubicacion) {
      qb.andWhere('e.ubicacion ILIKE :ubicacion', { ubicacion: `%${filter.ubicacion}%` });
    }
    if (filter.habilidades?.length) {
      qb.andWhere('e.habilidades @> :habs::jsonb', {
        habs: JSON.stringify(filter.habilidades.map(h => ({ nombre: h }))),
      });
    }
    if (filter.search) {
      qb.andWhere(
        "(e.nombres || ' ' || e.apellidos) ILIKE :search OR e.carrera ILIKE :search",
        { search: `%${filter.search}%` },
      );
    }

    const [rows, total] = await qb
      .offset(skip)
      .limit(limit)
      .addOrderBy('e.id', 'ASC')
      .getManyAndCount();

    console.error(`\n!!! [BACKEND DEBUG] Egresados.findAll: total=${total}, returned=${rows.length}, skip=${skip}, limit=${limit}`);
    if (rows.length > 0) console.error(`!!! [BACKEND DEBUG] First ID: ${rows[0].id}`);



    return {
      data: rows,
      nextCursor: null,
      total,
    };
  }

  async findOne(id: string): Promise<Egresado> {
    const e = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (!e) throw new NotFoundException('Egresado no encontrado');
    return e;
  }

  // ─── PERFIL PÚBLICO ──────────────────────────────────────────────────────────
  
  async findOnePublic(id: string): Promise<EgresadoPublicProfile | null> {
    const e = await this.repo.findOne({ 
      where: { id }, 
      relations: ['user'],
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        carrera: true,
        anioEgreso: true,
        resumenProfesional: true,
        fotoUrl: true,
        cvUrl: true,
        habilidades: true,
        experiencias: true,
        formacion: true,
        redesSociales: true,
        ubicacion: true,
      }
    });
    
    if (!e || !e.user?.isActive) return null;

    // Transformar a DTO público (omitir datos sensibles)
    return {
      id: e.id,
      nombres: e.nombres,
      apellidos: e.apellidos,
      nombreCompleto: `${e.nombres} ${e.apellidos}`,
      carrera: e.carrera,
      anioEgreso: e.anioEgreso,
      resumenProfesional: e.resumenProfesional,
      fotoUrl: e.fotoUrl,
      cvUrl: e.cvUrl,
      habilidades: e.habilidades || [],
      experiencias: e.experiencias || [],
      formacion: e.formacion || [],
      redesSociales: e.redesSociales || {},
      ubicacion: e.ubicacion,
    };
  }

  async findByUserId(userId: string): Promise<Egresado> {
    const e = await this.repo.findOne({ where: { userId }, relations: ['user'] });
    if (!e) throw new NotFoundException('Perfil no encontrado');
    return e;
  }

  async create(userId: string, dto: CreateEgresadoDto): Promise<Egresado> {
    const exists = await this.repo.findOne({ where: { userId } });
    if (exists) {
      throw new BadRequestException('El perfil de egresado ya existe para este usuario');
    }

    const egresado = this.repo.create({
      ...dto,
      userId,
      codigoEstudiante: dto.codigoEstudiante || null,
      fotoUrl: dto.fotoUrl || 'https://res.cloudinary.com/dra8rje99/image/upload/v1777703567/default.png'
    });

    return this.repo.save(egresado) as unknown as Promise<Egresado>;
  }

  async update(id: string, userId: string, dto: UpdateEgresadoDto, isAdmin = false): Promise<Egresado> {
    const egresado = await this.repo.findOne({ where: { id } });
    if (!egresado) throw new NotFoundException('Egresado no encontrado');

    if (isAdmin === false && egresado.userId !== userId) {
      throw new ForbiddenException('No puedes editar el perfil de otro egresado');
    }

     
    const updateData: any = {};
    if (dto.nombres !== undefined) updateData.nombres = dto.nombres;
    if (dto.apellidos !== undefined) updateData.apellidos = dto.apellidos;
    if (dto.carrera !== undefined) updateData.carrera = dto.carrera;
    if (dto.anioEgreso !== undefined) updateData.anioEgreso = dto.anioEgreso;
    if (dto.telefono !== undefined) updateData.telefono = dto.telefono;
    if (dto.ubicacion !== undefined) updateData.ubicacion = dto.ubicacion;
    if (dto.resumenProfesional !== undefined) updateData.resumenProfesional = dto.resumenProfesional;
    if (dto.fotoUrl !== undefined) updateData.fotoUrl = dto.fotoUrl;
    if (dto.cvUrl !== undefined) updateData.cvUrl = dto.cvUrl;
    if (dto.habilidades !== undefined) updateData.habilidades = dto.habilidades;
    if (dto.experiencias !== undefined) updateData.experiencias = dto.experiencias;
    if (dto.formacion !== undefined) updateData.formacion = dto.formacion;
    if (dto.redesSociales !== undefined) updateData.redesSociales = dto.redesSociales;
    if (dto.codigoEstudiante !== undefined) {
      updateData.codigoEstudiante = (dto.codigoEstudiante === '' || dto.codigoEstudiante === null) ? null : dto.codigoEstudiante;
    }

    // Actualización vía QueryBuilder
    await this.repo.createQueryBuilder()
      .update(Egresado)
      .set(updateData)
      .where('id = :id', { id })
      .execute();

    // 🚀 FUERZA BRUTA: Asegurar codigo_estudiante vía SQL puro
    if (dto.codigoEstudiante !== undefined) {
      const valorFinal = (dto.codigoEstudiante === '' || dto.codigoEstudiante === null) ? null : dto.codigoEstudiante;
      await this.repo.query(
        'UPDATE egresados SET codigo_estudiante = $1 WHERE id = $2',
        [valorFinal, id]
      );
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const egresado = await this.findOne(id);
    await this.repo.remove(egresado);
  }

  // ─── Estadísticas ─────────────────────────────────────────────────────────────

  async getEstadisticasCohortes(): Promise<EstadisticaCohorteDto[]> {
    const rows = await this.repo.query(`
      SELECT
        e.anio_egreso,
        e.carrera,
        COUNT(DISTINCT e.id) as total_egresados,
        COUNT(DISTINCT e.id) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM postulaciones p
            WHERE p.egresado_id = e.id AND p.estado = 'CONTRATADO'
          )
        ) as total_contratados,
        ROUND(
          COUNT(DISTINCT e.id) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM postulaciones p
              WHERE p.egresado_id = e.id AND p.estado = 'CONTRATADO'
            )
          )::numeric / COUNT(DISTINCT e.id)::numeric * 100,
          2
        ) as tasa_empleabilidad,
        ROUND(
          AVG(o.salario_max) FILTER (WHERE p.estado = 'CONTRATADO')::numeric,
          2
        ) as salario_promedio
      FROM egresados e
      LEFT JOIN postulaciones p ON p.egresado_id = e.id
      LEFT JOIN ofertas o ON o.id = p.oferta_id
      GROUP BY e.anio_egreso, e.carrera
      ORDER BY e.anio_egreso DESC, e.carrera ASC
    `);

     
    return rows.map((r: any) => ({
      anioEgreso: Number(r.anio_egreso),
      carrera: r.carrera,
      totalEgresados: Number(r.total_egresados),
      totalContratados: Number(r.total_contratados),
      tasaEmpleabilidad: Number(r.tasa_empleabilidad),
      salarioPromedio: r.salario_promedio ? Number(r.salario_promedio) : null,
      salarioMediana: null,
      salarioDesviacion: null,
      tiempoPromedioEmpleoMeses: null,
    }));
  }

  async getEgresadoStats(egresadoId: string): Promise<EgresadoStatsDto> {
    const rows = await this.repo.query(`
      SELECT
        (SELECT COUNT(*) FROM postulaciones WHERE egresado_id = $1) as total_postulaciones,
        (SELECT COUNT(*) FROM postulaciones WHERE egresado_id = $1 AND estado = 'EN_REVISION') as total_en_revision,
        (SELECT COUNT(*) FROM postulaciones WHERE egresado_id = $1 AND estado = 'ENTREVISTA') as total_entrevistas,
        (SELECT COUNT(*) FROM ofertas WHERE estado = 'ACTIVA') as total_ofertas
    `, [egresadoId]);

    const r = rows[0];
    const total = Number(r.total_postulaciones);
    const entrevistas = Number(r.total_entrevistas);

    return {
      totalPostulaciones: total,
      totalEnRevision: Number(r.total_en_revision),
      totalEntrevistas: entrevistas,
      totalOfertasDisponibles: Number(r.total_ofertas),
      tasaRespuesta: total > 0 ? Math.round((entrevistas / total) * 100) : 0,
    };
  }
}