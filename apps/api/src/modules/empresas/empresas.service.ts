import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { PaginatedResult, CreateEmpresaDto } from '@repo/trpc-contract';

@Injectable()
export class EmpresasService {
  private readonly logger = new Logger(EmpresasService.name);

  constructor(
    @InjectRepository(Empresa)
    private readonly repo: Repository<Empresa>,
    private readonly events: EventEmitter2,
  ) {}

  async findAll(filter: { cursor?: string; limit?: number; skip?: number; sector?: string; verificada?: boolean, search?: string; }): Promise<PaginatedResult<Empresa>> {
    const limit = Math.min(filter.limit ?? 20, 100);
    const skip = filter.skip ?? 0;
    console.error(`!!! [SERVICE DEBUG] filter.skip=${filter.skip}, skip variable=${skip}`);
    console.log(`\n>>> [DEBUG] EmpresasService.findAll`);
    console.log(`    - Params: limit=${limit}, skip=${skip}, search=${filter.search}, sector=${filter.sector}, verificada=${filter.verificada}`);

    const qb = this.repo.createQueryBuilder('e')
      .leftJoinAndSelect('e.user', 'u')
      .orderBy('e.id', 'ASC');

    if (filter.search) {
      qb.andWhere('(e.razonSocial ILIKE :search OR e.descripcion ILIKE :search OR e.ruc ILIKE :search)', { search: `%${filter.search}%` });
    }

    if (filter.sector && filter.sector !== 'ALL') {
      qb.andWhere('e.sector ILIKE :sector', { sector: `%${filter.sector}%` });
    }

    if (filter.verificada !== undefined) {
      qb.andWhere('e.verificada = :verificada', { verificada: filter.verificada });
    }

    let rows: Empresa[];
    let total: number;
    try {
      [rows, total] = await qb
        .offset(skip)
        .limit(limit)
        .getManyAndCount();
    } catch (e: unknown) {
      console.error(`!!! [SQL ERROR] EmpresasService.findAll:`, e);
      throw e;
    }

    const companyIds = rows.map(r => r.id);
    const postulationCounts: Record<string, number> = {};
    const ofertaCounts: Record<string, number> = {};

    if (companyIds.length > 0) {
      // Conteo de postulaciones
      const pCounts = await this.repo.createQueryBuilder('e')
        .select('e.id', 'empresaId')
        .addSelect('COUNT(p.id)', 'count')
        .leftJoin('e.ofertas', 'o')
        .leftJoin('o.postulaciones', 'p')
        .where('e.id IN (:...ids)', { ids: companyIds })
        .groupBy('e.id')
        .getRawMany();

      console.log(`!!! [SERVICE DEBUG] raw counts (pCounts):`, pCounts);
      pCounts.forEach(c => {
        postulationCounts[c.empresaId || c.empresaid] = parseInt(c.count || c.cnt || 0);
      });

      // Conteo de ofertas activas
      const oCounts = await this.repo.manager
        .createQueryBuilder('ofertas', 'o')
        .select('o.empresa_id', 'empresaId')
        .addSelect('COUNT(*)', 'count')
        .where('o.empresa_id IN (:...ids)', { ids: companyIds })
        .andWhere("o.estado = 'ACTIVA'")
        .groupBy('o.empresa_id')
        .getRawMany();
      
      console.log(`!!! [SERVICE DEBUG] raw counts (oCounts):`, oCounts);
      oCounts.forEach(c => {
        ofertaCounts[c.empresaId || c.empresaid] = parseInt(c.count || c.cnt || 0);
      });
    }

    const data = rows.map(r => ({
      ...r,
      totalPostulaciones: postulationCounts[r.id] || 0,
      totalOfertas: ofertaCounts[r.id] || 0
    }));

     
    return { data: data as any, nextCursor: null, total };
  }

  async findOne(id: string): Promise<Empresa> {
    const e = await this.repo.findOne({ where: { id }, relations: ['user'] });
    if (e === null || e === undefined) throw new NotFoundException(`Empresa ${id} no encontrada`);
    return e;
  }

  async findByUserId(userId: string): Promise<(Empresa & { _count: { ofertas: number } }) | null> {
    const empresa = await this.repo.findOne({ where: { userId }, relations: ['user'] });
    if (!empresa) return null;

    const ofertasCount = await this.repo.manager.query(
      `SELECT COUNT(*) as count FROM ofertas WHERE empresa_id = $1 AND estado = 'ACTIVA'`,
      [empresa.id]
    );

    return {
      ...empresa,
      _count: {
        ofertas: Number(ofertasCount[0]?.count || 0)
      }
    };
  }

  async create(userId: string, dto: CreateEmpresaDto): Promise<Empresa> {
    const e = this.repo.create({ 
      userId, 
      ...dto,
      logoUrl: dto.logoUrl || 'https://res.cloudinary.com/dra8rje99/image/upload/v1777703567/default.png'
    }) as unknown as Empresa;
    const saved = await this.repo.save(e) as unknown as Empresa;
    void this.events.emit('empresa.creada', saved);
    return saved;
  }

  async update(id: string, userId: string, dto: Partial<CreateEmpresaDto>, isAdmin = false): Promise<Empresa> {
    const e = await this.findOne(id);
    if (isAdmin === false && e.userId !== userId) throw new ForbiddenException();
    Object.assign(e, dto);
    return this.repo.save(e);
  }

  async verificar(id: string): Promise<Empresa> {
    const e = await this.findOne(id);
    e.verificada = true;
    const saved = await this.repo.save(e);
    void this.events.emit('empresa.verificada', saved);
    return saved;
  }

  async getPublicProfile(id: string) {
    const empresa = await this.findOne(id);
    const ofertas = await this.repo.manager.query(`
      SELECT o.*, (SELECT COUNT(*) FROM postulaciones p WHERE p.oferta_id = o.id) as postulaciones_count
      FROM ofertas o
      WHERE o.empresa_id = $1 AND o.estado = 'ACTIVA'
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [id]);
    
    return {
      ...empresa,
       
      ofertas: ofertas.map((o: any) => ({
        id: o.id,
        titulo: o.titulo,
        descripcion: o.descripcion,
        requisitos: o.requisitos,
        beneficios: o.beneficios,
        salarioMin: o.salario_min,
        salarioMax: o.salario_max,
        modalidad: o.modalidad,
        ubicacion: o.ubicacion,
        experienciaMin: o.experiencia_min,
        estado: o.estado,
        createdAt: o.created_at,
        _count: { postulaciones: Number(o.postulaciones_count) }
      }))
    };
  }
}
