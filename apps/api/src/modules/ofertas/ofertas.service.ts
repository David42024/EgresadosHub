import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository, DataSource } from 'typeorm';
import { Oferta } from './entities/oferta.entity';
import { Empresa } from '../empresas/entities/empresa.entity';
import { CreateOfertaDto, UpdateOfertaDto, OfertaFilter, EstadoOferta, PaginatedResult } from '@repo/trpc-contract';

interface OfertaFilterInternal {
  // Campos de paginación
  cursor?:     string;
  limit?:      number;
  skip?:       number;
  // Campos de filtro de ofertas
  empresaId?:  string;
  estado?:     string;
  modalidad?:  string;
  ubicacion?:  string;
  salarioMin?: number;
  salarioMax?: number;
  habilidades?: string[];
  search?:     string;
}

@Injectable()
export class OfertasService implements OnModuleInit {
  private readonly logger = new Logger(OfertasService.name);

  constructor(
    @InjectRepository(Oferta)
    private readonly repo: Repository<Oferta>,
    private readonly events: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.dataSource.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ofertas' AND column_name='vistas') THEN
            ALTER TABLE ofertas ADD COLUMN vistas INTEGER DEFAULT 0;
          END IF;
        END $$;
      `);
      this.logger.log('Sincronización de columna vistas completada');
    } catch (e) {
      this.logger.error('Error sincronizando columna vistas:', e);
    }
  }

  async findAll(filter: OfertaFilterInternal): Promise<PaginatedResult<Oferta>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = filter.skip ?? 0;
    console.error(`!!! [SERVICE DEBUG] filter.skip=${filter.skip}, skip variable=${skip}`);
    console.log(`\n>>> [DEBUG] OfertasService.findAll`);
    console.log(`    - Params: limit=${limit}, skip=${skip}, search=${filter.search}`);

    // Auto-cerrar las ofertas cuya fecha límite ya ha expirado
    await this.repo.createQueryBuilder()
      .update()
      .set({ estado: EstadoOferta.CERRADA })
      .where('estado = :activa AND cierraAt < :hoy', { 
        activa: EstadoOferta.ACTIVA, 
        hoy: new Date() 
      })
      .execute();
    
    const qb = this.repo.createQueryBuilder('o')
      .leftJoinAndSelect('o.empresa', 'emp')
      .loadRelationCountAndMap('o.totalPostulaciones', 'o.postulaciones')
      .orderBy('o.createdAt', 'DESC');

    if (filter.empresaId != null && filter.empresaId !== '') qb.andWhere('o.empresaId = :eid', { eid: filter.empresaId });
    if (filter.estado !== undefined && filter.estado !== null && filter.estado !== '' && filter.estado !== 'ALL') {
      qb.andWhere('o.estado = :estado', { estado: filter.estado });
    }
    
    if (filter.search) {
      qb.andWhere('(o.titulo ILIKE :search OR o.descripcion ILIKE :search OR emp.razonSocial ILIKE :search)', { search: `%${filter.search}%` });
    }
    if (filter.modalidad != null) qb.andWhere('o.modalidad = :m', { m: filter.modalidad });
    if (filter.ubicacion != null && filter.ubicacion !== '') qb.andWhere('o.ubicacion ILIKE :u', { u: `%${filter.ubicacion}%` });
    if (filter.salarioMin !== undefined && filter.salarioMin !== null && filter.salarioMin > 0) qb.andWhere('o.salarioMin >= :sm', { sm: filter.salarioMin });
    if (filter.salarioMax !== undefined && filter.salarioMax !== null) qb.andWhere('o.salarioMax <= :sx', { sx: filter.salarioMax });
    if (filter.habilidades !== undefined && filter.habilidades !== null && filter.habilidades.length > 0) {
      qb.andWhere('o.habilidadesReq @> :habs::jsonb', {
        habs: JSON.stringify(filter.habilidades),
      });
    }
    if (filter.search != null && filter.search !== '') {
      qb.andWhere('o.titulo ILIKE :s OR o.descripcion ILIKE :s', { s: `%${filter.search}%` });
    }

    const [rows, total] = await qb
      .offset(skip)
      .limit(limit)
      .addOrderBy('o.id', 'ASC')
      .getManyAndCount();
    
    console.error(`\n!!! [BACKEND DEBUG] Ofertas.findAll: total=${total}, returned=${rows.length}, skip=${skip}, limit=${limit}`);
    if (rows.length > 0) console.error(`!!! [BACKEND DEBUG] First ID: ${rows[0].id}`);
    

    
    // Aseguramos que el conteo sea numérico
    const mappedRows = rows.map(o => ({
      ...o,
      totalPostulaciones: Number(o.totalPostulaciones || 0)
    }));

    return {
      data: mappedRows as unknown as Oferta[],
      nextCursor: null,
      total,
    };
  }

  async findByEmpresa(empresaId: string, filter: OfertaFilter): Promise<PaginatedResult<Oferta>> {
    return this.findAll({ ...filter, empresaId });  
  }

  async findByEmpresaUserId(userId: string, filter: OfertaFilter): Promise<PaginatedResult<Oferta>> {
    const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
    if (empresa === null || empresa === undefined) throw new NotFoundException('Perfil de empresa no encontrado');
    return this.findAll({ ...filter, empresaId: empresa.id }); 
  }

  async findOne(id: string): Promise<Oferta> {
    const o = await this.repo.createQueryBuilder('o')
      .leftJoinAndSelect('o.empresa', 'emp')
      .leftJoinAndSelect('emp.user', 'empUser')
      .leftJoinAndSelect('o.postulaciones', 'p')
      .leftJoinAndSelect('p.egresado', 'eg')
      .leftJoinAndSelect('eg.user', 'egUser')
      .loadRelationCountAndMap('o.totalPostulaciones', 'o.postulaciones')
      .where('o.id = :id', { id })
      .getOne();
    if (o === null || o === undefined) throw new NotFoundException(`Oferta ${id} no encontrada`);
    return o;
  }

  async incrementVistas(id: string): Promise<void> {
    await this.repo.increment({ id }, 'vistas', 1);
  }

  async create(userId: string, dto: CreateOfertaDto): Promise<Oferta> {
    const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
    if (empresa === null || empresa === undefined) {
      throw new NotFoundException('Perfil de empresa no encontrado');
    }
    
    this.logger.log(`Creando oferta para empresa ${empresa.id} con estado: ${dto.estado || 'DEFAULT'}`);
    
    // Forzamos el mapeo del DTO a la entidad asegurando que el estado se procese
    const oferta = this.repo.create({ 
      ...dto, 
      empresaId: empresa.id,
      estado: dto.estado || EstadoOferta.ACTIVA // Por defecto activa si viene del panel
    }) as unknown as Oferta;
    
    const saved  = await this.repo.save(oferta) as unknown as Oferta;
    void this.events.emit('oferta.creada', saved);
    return saved;
  }

  async update(id: string, userId: string, dto: UpdateOfertaDto, isAdmin = false): Promise<Oferta> {
    const oferta = await this.findOne(id);
    if (isAdmin === false) {
      const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
      if (empresa === null || empresa === undefined || oferta.empresaId !== empresa.id) throw new ForbiddenException();
    }
    Object.assign(oferta, dto);
    return this.repo.save(oferta);
  }

  async publicar(id: string, userId: string): Promise<Oferta> {
    const oferta = await this.findOne(id);
    const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
    if (empresa === null || empresa === undefined || oferta.empresaId !== empresa.id) throw new ForbiddenException();
    if (oferta.estado !== EstadoOferta.BORRADOR && oferta.estado !== EstadoOferta.PAUSADA) {
      throw new BadRequestException('Solo se puede publicar una oferta en borrador o pausada');
    }
    oferta.estado = EstadoOferta.ACTIVA;
    oferta.publicadaAt = new Date();
    const saved = await this.repo.save(oferta);
    void this.events.emit('oferta.publicada', saved);
    return saved;
  }

  async pausar(id: string, userId: string): Promise<Oferta> {
    const oferta = await this.findOne(id);
    const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
    if (empresa === null || empresa === undefined || oferta.empresaId !== empresa.id) throw new ForbiddenException();
    
    oferta.estado = EstadoOferta.BORRADOR;
    const saved = await this.repo.save(oferta);
    void this.events.emit('oferta.pausada', saved);
    return saved;
  }

  async cerrar(id: string, userId: string): Promise<Oferta> {
    const oferta = await this.findOne(id);
    const empresa = await this.repo.manager.getRepository(Empresa).findOne({ where: { userId } });
    if (empresa === null || empresa === undefined || oferta.empresaId !== empresa.id) throw new ForbiddenException();
    oferta.estado = EstadoOferta.CERRADA;
    return this.repo.save(oferta);
  }
}
