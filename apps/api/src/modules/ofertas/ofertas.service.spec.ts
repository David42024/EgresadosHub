import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OfertasService } from './ofertas.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EstadoOferta } from '@repo/trpc-contract';

describe('OfertasService', () => {
  let service: OfertasService;

  const mockQb = {
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    orderBy:           vi.fn().mockReturnThis(),
    take:              vi.fn().mockReturnThis(),
    andWhere:          vi.fn().mockReturnThis(),
    getCount:          vi.fn().mockResolvedValue(1),
    getMany:           vi.fn().mockResolvedValue([{ id: 'o1', titulo: 'Dev' }]),
  };

  const mockOferta = {
    id:        'o1',
    empresaId: 'e1',
    titulo:    'Dev Senior',
    estado:    EstadoOferta.BORRADOR,
  };

  // ← Repositorio de Empresa separado
  const mockEmpresaRepo = {
    findOne: vi.fn(),
  };

  const mockRepo = {
    createQueryBuilder: vi.fn().mockReturnValue(mockQb),
    findOne:            vi.fn(),
    create:             vi.fn((d) => ({ ...d })),
    save:               vi.fn((d) => Promise.resolve(d)),
    // ← manager con getRepository que devuelve el repo de empresa
    manager: {
      getRepository: vi.fn().mockReturnValue(mockEmpresaRepo),
    },
  };

  const mockEvents = { emit: vi.fn() };
  const mockDataSource = { query: vi.fn().mockResolvedValue([]) };

  beforeEach(() => {
    vi.clearAllMocks();
    mockRepo.createQueryBuilder.mockReturnValue(mockQb);
    mockRepo.manager.getRepository.mockReturnValue(mockEmpresaRepo);
    service = new OfertasService(mockRepo as any, mockEvents as any, mockDataSource as any);
  });

  // ─── findAll ──────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('retorna listado paginado sin filtros', async () => {
      const result = await service.findAll({ limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.nextCursor).toBeNull();
    });

    it('aplica filtro de estado', async () => {
      await service.findAll({ limit: 10, estado: EstadoOferta.ACTIVA });
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('estado'), expect.any(Object)
      );
    });

    it('aplica filtro de modalidad', async () => {
      await service.findAll({ limit: 10, modalidad: 'REMOTO' } as any);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('modalidad'), expect.any(Object)
      );
    });

    it('aplica filtro de ubicacion', async () => {
      await service.findAll({ limit: 10, ubicacion: 'Lima' } as any);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('ubicacion'), expect.any(Object)
      );
    });

    it('aplica filtro de salario mínimo', async () => {
      await service.findAll({ limit: 10, salarioMin: 2000 } as any);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('salario'), expect.any(Object)
      );
    });

    it('aplica filtro de habilidades', async () => {
      await service.findAll({ limit: 10, habilidades: ['TypeScript'] } as any);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('habilidades'), expect.any(Object)
      );
    });

    it('aplica búsqueda por texto', async () => {
      await service.findAll({ limit: 10, search: 'backend' } as any);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('titulo'), expect.any(Object)
      );
    });

    it('aplica cursor de paginación', async () => {
      await service.findAll({ limit: 10, cursor: 'uuid-cursor' } as any);
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('id'), expect.objectContaining({ cursor: 'uuid-cursor' })
      );
    });

    it('detecta hasNextPage y retorna nextCursor', async () => {
      mockQb.getMany.mockResolvedValueOnce([
        { id: 'o1' }, { id: 'o2' }, { id: 'o3' },
      ]);
      const result = await service.findAll({ limit: 2 } as any);
      expect(result.nextCursor).toBe('o2');
      expect(result.data).toHaveLength(2);
    });
  });

  // ─── findOne ──────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('retorna la oferta si existe', async () => {
      mockRepo.findOne.mockResolvedValue(mockOferta);
      const result = await service.findOne('o1');
      expect(result.id).toBe('o1');
    });

    it('lanza NotFoundException si no existe', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow('no encontrada');
    });
  });

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('crea oferta y emite evento', async () => {
      // El servicio busca la empresa por userId via manager.getRepository
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockRepo.save.mockResolvedValue({ id: 'o-new', empresaId: 'e1' });

      const dto = {
        titulo: 'Nueva', descripcion: '....',
        modalidad: 'REMOTO', ubicacion: 'Lima', habilidadesReq: [],
      };
      const result = await service.create('u1', dto as any);

      expect(result.id).toBe('o-new');
      expect(mockEvents.emit).toHaveBeenCalledWith('oferta.creada', expect.any(Object));
    });

    it('lanza NotFoundException si la empresa no existe', async () => {
      mockEmpresaRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create('u-sin-empresa', {} as any)
      ).rejects.toThrow('empresa no encontrado');
    });
  });

  // ─── update ───────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('actualiza si el usuario es dueño', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockRepo.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.update('o1', 'u1', { titulo: 'Actualizado' } as any);
      expect(result.titulo).toBe('Actualizado');
    });

    it('lanza ForbiddenException si no es dueño', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, empresaId: 'e1' });
      // La empresa del userId 'otro' tiene id 'e2' ≠ 'e1'
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e2', userId: 'otro' });

      await expect(
        service.update('o1', 'otro', { titulo: 'X' } as any)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── publicar ─────────────────────────────────────────────────────────────

  describe('publicar()', () => {
    it('cambia estado a ACTIVA y emite evento', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, estado: EstadoOferta.BORRADOR });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockRepo.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.publicar('o1', 'u1');
      expect(result.estado).toBe(EstadoOferta.ACTIVA);
      expect(result.publicadaAt).toBeDefined();
      expect(mockEvents.emit).toHaveBeenCalledWith('oferta.publicada', expect.any(Object));
    });

    it('puede publicar desde estado PAUSADA', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, estado: EstadoOferta.PAUSADA });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockRepo.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.publicar('o1', 'u1');
      expect(result.estado).toBe(EstadoOferta.ACTIVA);
    });

    it('lanza BadRequestException si está CERRADA', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, estado: EstadoOferta.CERRADA });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });

      await expect(service.publicar('o1', 'u1')).rejects.toThrow(BadRequestException);
    });

    it('lanza ForbiddenException si no es dueño', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, empresaId: 'e1' });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e2', userId: 'otro' });

      await expect(service.publicar('o1', 'otro')).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── cerrar ───────────────────────────────────────────────────────────────

  describe('cerrar()', () => {
    it('marca la oferta como CERRADA', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, estado: EstadoOferta.ACTIVA });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      mockRepo.save.mockImplementation((o) => Promise.resolve(o));

      const result = await service.cerrar('o1', 'u1');
      expect(result.estado).toBe(EstadoOferta.CERRADA);
    });

    it('lanza ForbiddenException si no es dueño', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockOferta, empresaId: 'e1' });
      mockEmpresaRepo.findOne.mockResolvedValue({ id: 'e2', userId: 'otro' });

      await expect(service.cerrar('o1', 'otro')).rejects.toThrow(ForbiddenException);
    });
  });
});