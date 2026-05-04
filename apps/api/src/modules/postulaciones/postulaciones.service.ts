import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Postulacion, PostulacionAudit } from './entities/postulacion.entity';
import { Egresado } from '../egresados/entities/egresado.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CreatePostulacionDto, CambiarEstadoDto, EstadoPostulacion, TRANSICIONES_VALIDAS, PaginatedResult } from '@repo/trpc-contract';

export interface PostulacionesFilter {
  limit?: number;
  cursor?: string;
  skip?: number;
  estado?: EstadoPostulacion;
  ordenFecha?: 'RECENT' | 'OLDEST';
}

@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(Postulacion)
    private readonly repo: Repository<Postulacion>,
    @InjectRepository(PostulacionAudit)
    private readonly auditRepo: Repository<PostulacionAudit>,
    private readonly events: EventEmitter2,
  ) { }

  async findEgresadoByUserId(userId: string) {
    const egresado = await this.repo.manager.getRepository(Egresado).findOne({ where: { userId } });
    if (egresado === null || egresado === undefined) throw new NotFoundException('Perfil de egresado no encontrado');
    return egresado;
  }

  async findEmpresaByUserId(userId: string) {
    const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
    if (empresa === null || empresa === undefined) throw new NotFoundException('Perfil de empresa no encontrado');
    return empresa;
  }

  async findByEgresado(egresadoId: string, filter: PostulacionesFilter): Promise<PaginatedResult<Postulacion>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = filter.skip ?? 0;
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.oferta', 'o')
      .leftJoinAndSelect('o.empresa', 'e')
      .leftJoinAndSelect('p.audits', 'a')
      .leftJoinAndSelect('a.cambiadoPorUser', 'cpu')
      .where('p.egresadoId = :egresadoId', { egresadoId })
      .take(limit)
      .skip(skip);

    if (filter.estado !== null && filter.estado !== undefined) qb.andWhere('p.estado = :estado', { estado: filter.estado });

    const orderDirection = filter.ordenFecha === 'OLDEST' ? 'ASC' : 'DESC';
    qb.orderBy('p.postuladoAt', orderDirection)
      .addOrderBy('a.cambiadoAt', 'DESC');

    const total = await qb.getCount();
    const rows = await qb.getMany();
    const mapped = rows.map((p) => {
      const auditsSorted = (p.audits ?? []).slice().sort((x, y) => {
        const aTime = x.cambiadoAt?.getTime?.() ?? 0;
        const bTime = y.cambiadoAt?.getTime?.() ?? 0;
        return bTime - aTime;
      });

      return {
        ...p,
        oferta: p.oferta
          ? {
            ...p.oferta,
            empresa: p.oferta.empresa
              ? {
                ...p.oferta.empresa,
                nombreComercial: p.oferta.empresa.razonSocial,
              }
              : null,
          }
          : null,
        historial_estados_postulacion: auditsSorted.map((a) => ({
          estadoAnterior: a.estadoAnterior,
          estadoNuevo: a.estadoNuevo,
          createdAt: a.cambiadoAt,
          comentario: a.comentario,
          cambiadoPor: a.cambiadoPor,
          cambiadoPorUser: a.cambiadoPorUser,
        })),
      };
    });

    return {
      data: mapped as unknown as Postulacion[],
      nextCursor: null,
      total,
    };
  }

  async findAll(filter: PostulacionesFilter & { search?: string }): Promise<PaginatedResult<Postulacion>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = filter.skip ?? 0;
    console.error(`!!! [SERVICE DEBUG] filter.skip=${filter.skip}, skip variable=${skip}`);
    console.log(`\n>>> [DEBUG] PostulacionesService.findAll`);
    console.log(`    - Params: limit=${limit}, skip=${skip}, estado=${filter.estado}, search=${filter.search}`);
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.egresado', 'eg')
      .leftJoinAndSelect('eg.user', 'u')
      .leftJoinAndSelect('p.oferta', 'o')
      .leftJoinAndSelect('o.empresa', 'emp')
      .orderBy('p.postuladoAt', 'DESC');

    if (filter.estado !== null && filter.estado !== undefined) qb.andWhere('p.estado = :estado', { estado: filter.estado });

    if (filter.search) {
      qb.andWhere('(u.email ILIKE :search OR eg.nombres ILIKE :search OR eg.apellidos ILIKE :search OR o.titulo ILIKE :search)', { search: `%${filter.search}%` });
    }

    const [rows, total] = await qb
      .offset(skip)
      .limit(limit)
      .addOrderBy('p.id', 'ASC')
      .getManyAndCount();
      
    console.error(`\n!!! [BACKEND DEBUG] Postulaciones.findAll: total=${total}, returned=${rows.length}, skip=${skip}, limit=${limit}`);
    if (rows.length > 0) console.error(`!!! [BACKEND DEBUG] First ID: ${rows[0].id}`);

    return { data: rows, nextCursor: null, total };
  }

  async findByOferta(ofertaId: string, filter: PostulacionesFilter): Promise<PaginatedResult<Postulacion>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.egresado', 'eg')
      .leftJoinAndSelect('eg.user', 'u')
      .leftJoinAndSelect('p.oferta', 'o')
      .where('p.ofertaId = :ofertaId', { ofertaId })
      .orderBy('p.postuladoAt', 'DESC')
      .take(limit + 1);

    if (filter.cursor !== null && filter.cursor !== undefined) qb.andWhere('p.id > :cursor', { cursor: filter.cursor });
    if (filter.estado !== null && filter.estado !== undefined) qb.andWhere('p.estado = :estado', { estado: filter.estado });

    const total = await qb.getCount();
    const rows = await qb.getMany();
    const hasNext = rows.length > limit;
    return { data: hasNext ? rows.slice(0, limit) : rows, nextCursor: hasNext ? rows[limit - 1].id : null, total };
  }

  async findByEmpresa(empresaId: string, filter: PostulacionesFilter): Promise<PaginatedResult<Postulacion>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.egresado', 'eg')
      .leftJoinAndSelect('eg.user', 'u')
      .leftJoinAndSelect('p.oferta', 'o')
      .innerJoin('p.oferta', 'of', 'of.empresaId = :empresaId', { empresaId })
      .orderBy('p.postuladoAt', 'DESC')
      .take(limit + 1);

    if (filter.estado !== null && filter.estado !== undefined) qb.andWhere('p.estado = :estado', { estado: filter.estado });

    const total = await qb.getCount();
    const rows = await qb.getMany();
    const hasNext = rows.length > limit;
    return { data: hasNext ? rows.slice(0, limit) : rows, nextCursor: hasNext ? rows[limit - 1].id : null, total };
  }

  async findOne(id: string): Promise<Postulacion> {
    const p = await this.repo.findOne({
      where: { id },
      relations: ['egresado', 'oferta', 'oferta.empresa', 'audits', 'audits.cambiadoPorUser'],
    });
    if (p === null || p === undefined) throw new NotFoundException(`Postulación ${id} no encontrada`);
    return p;
  }

  async create(egresadoId: string, userId: string, dto: CreatePostulacionDto): Promise<Postulacion> {
    return this.repo.manager.transaction(async (manager) => {
      // Verificar duplicados dentro de la transacción
      const existing = await manager.findOne(Postulacion, {
        where: { egresadoId, ofertaId: dto.ofertaId },
      });
      if (existing) throw new BadRequestException('Ya postulaste a esta oferta');

      const postulacion = manager.create(Postulacion, { egresadoId, ...dto });
      const saved = await manager.save(postulacion);

      // Registro inicial de auditoría
      console.log('🔍 DEBUG - Saving audit entry with cambiadoPor:', userId);
      await manager.save(PostulacionAudit, manager.create(PostulacionAudit, {
        postulacionId: saved.id,
        estadoNuevo: EstadoPostulacion.POSTULADO,
        cambiadoPor: userId,
      }));

      this.events.emit('postulacion.creada', saved);
      return saved;
    });
  }

  async cambiarEstado(dto: CambiarEstadoDto, userId: string): Promise<Postulacion> {
    return this.repo.manager.transaction(async (manager) => {
      const postulacion = await manager.findOne(Postulacion, {
        where: { id: dto.postulacionId },
      });
      if (!postulacion) throw new NotFoundException(`Postulación ${dto.postulacionId} no encontrada`);

      const estadoActual = postulacion.estado;

      // Validar transición
      const transicionesPermitidas = TRANSICIONES_VALIDAS[estadoActual] || [];
      if (!transicionesPermitidas.includes(dto.nuevoEstado)) {
        throw new BadRequestException(
          `Transición inválida: ${estadoActual} → ${dto.nuevoEstado}. ` +
          `Permitidas: ${transicionesPermitidas.join(', ') || 'ninguna'}`,
        );
      }

      // Guardar auditoría (sin cargar la relación previa para evitar errores de TypeORM)
      const audit = manager.create(PostulacionAudit, {
        postulacionId: postulacion.id,
        estadoAnterior: estadoActual,
        estadoNuevo: dto.nuevoEstado,
        cambiadoPor: userId,
        comentario: dto.comentario,
      });
      await manager.save(PostulacionAudit, audit);

      postulacion.estado = dto.nuevoEstado;
      const saved = await manager.save(postulacion);

      this.events.emit('postulacion.estado_cambiado', {
        postulacion: saved,
        estadoAnterior: estadoActual,
        estadoNuevo: dto.nuevoEstado,
        cambiadoPor: userId,
      });

      return saved;
    });
  }

  async getEmbudoPorOferta(ofertaId: string) {
    const postulaciones = await this.repo.find({
      where: { ofertaId },
      relations: ['egresado', 'egresado.user'],
      order: { postuladoAt: 'DESC' }
    });

    const result: Record<string, Postulacion[]> = {
      POSTULADO: [],
      EN_REVISION: [],
      ENTREVISTA: [],
      CONTRATADO: [],
      RECHAZADO: [],
    };

    postulaciones.forEach(p => {
      if (result[p.estado]) {
        result[p.estado].push(p);
      }
    });

    return result;
  }

  async getAuditHistory(postulacionId: string) {
    return this.auditRepo.find({
      where: { postulacionId },
      relations: ['cambiadoPorUser'],
      order: { cambiadoAt: 'DESC' }
    });
  }
}
