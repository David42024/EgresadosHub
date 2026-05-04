import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostulacionesService } from './postulaciones.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoPostulacion } from '@repo/trpc-contract';

describe('PostulacionesService', () => {
  let service: PostulacionesService;
  const mockManager = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const mockRepo = {
    createQueryBuilder: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    query: vi.fn(),
    manager: {
      getRepository: vi.fn().mockReturnThis(),
      findOne: vi.fn(),
      transaction: vi.fn().mockImplementation((cb) => cb(mockManager)),
    },
  };
  const mockAuditRepo = {
    create: vi.fn(),
    save: vi.fn(),
  };
  const mockEvents = {
    emit: vi.fn(),
  };

  beforeEach(() => {
    service = new PostulacionesService(
      mockRepo as any,
      mockAuditRepo as any,
      mockEvents as any,
    );
    vi.clearAllMocks();
  });

  describe('create', () => {
    const dto = { ofertaId: 'o1', cartaPresentacion: 'Hola' };

    it('should create a new postulacion if not exists', async () => {
      mockManager.findOne.mockResolvedValue(null);
      mockManager.create.mockReturnValue({ ...dto, egresadoId: 'e1' });
      mockManager.save.mockResolvedValue({ ...dto, id: 'p1', egresadoId: 'e1' });

      const result = await service.create('e1', 'u1', dto as any);

      expect(result.id).toBe('p1');
      expect(mockManager.save).toHaveBeenCalled();
      expect(mockEvents.emit).toHaveBeenCalledWith('postulacion.creada', expect.any(Object));
    });

    it('should throw BadRequestException if already applied', async () => {
      mockManager.findOne.mockResolvedValue({ id: 'p1' });

      await expect(service.create('e1', 'u1', dto as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cambiarEstado', () => {
    it('should change status if transition is valid', async () => {
      const postulacion = { id: 'p1', estado: EstadoPostulacion.POSTULADO };
      mockManager.findOne.mockResolvedValue(postulacion);
      mockManager.save.mockResolvedValue({ ...postulacion, estado: EstadoPostulacion.EN_REVISION });
      mockManager.create.mockReturnValue({});

      const result = await service.cambiarEstado({
        postulacionId: 'p1',
        nuevoEstado: EstadoPostulacion.EN_REVISION,
      }, 'u1');

      expect(result.estado).toBe(EstadoPostulacion.EN_REVISION);
      expect(mockEvents.emit).toHaveBeenCalledWith('postulacion.estado_cambiado', expect.any(Object));
    });

    it('should throw BadRequestException if transition is invalid', async () => {
      const postulacion = { id: 'p1', estado: EstadoPostulacion.POSTULADO };
      mockManager.findOne.mockResolvedValue(postulacion);

      await expect(service.cambiarEstado({
        postulacionId: 'p1',
        nuevoEstado: EstadoPostulacion.CONTRATADO, // Invalid from POSTULADO
      }, 'u1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByEgresado', () => {
    it('should return paginated postulaciones for an egresado', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
        getMany: vi.fn().mockResolvedValue([{ id: 'p1' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByEgresado('e1', { limit: 10, cursor: 'c1', estado: EstadoPostulacion.POSTULADO });

      expect(result.data).toHaveLength(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(2);
    });
  });

  describe('findByOferta', () => {
    it('should return paginated postulaciones for an oferta', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
        getMany: vi.fn().mockResolvedValue([{ id: 'p1' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findByOferta('o1', { limit: 10 });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a postulacion with relations', async () => {
      const postulacion = { id: 'p1' };
      mockRepo.findOne.mockResolvedValue(postulacion);

      const result = await service.findOne('p1');

      expect(result).toEqual(postulacion);
      expect(mockRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'p1' },
        relations: expect.arrayContaining(['egresado', 'oferta']),
      }));
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('p1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findEgresadoByUserId', () => {
    it('should return egresado if found', async () => {
      const egresado = { id: 'e1' };
      mockRepo.manager.getRepository.mockReturnValue({
        findOne: vi.fn().mockResolvedValue(egresado)
      });

      const result = await service.findEgresadoByUserId('u1');
      expect(result).toEqual(egresado);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.manager.getRepository.mockReturnValue({
        findOne: vi.fn().mockResolvedValue(null)
      });
      await expect(service.findEgresadoByUserId('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getEmbudoPorOferta', () => {
    it('should return embudo data from raw SQL', async () => {
      const mockEmbudo = { total: 10, contratados: 2, tasa_conversion: 20.0 };
      mockRepo.query.mockResolvedValue([mockEmbudo]);

      const result = await service.getEmbudoPorOferta('o1');

      expect(result).toEqual(mockEmbudo);
    });
  });
});
