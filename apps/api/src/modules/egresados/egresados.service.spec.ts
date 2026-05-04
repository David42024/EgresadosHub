import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EgresadosService } from './egresados.service';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';

describe('EgresadosService', () => {
  let service: EgresadosService;
  const mockRepo = {
    createQueryBuilder: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    query: vi.fn(),
  };

  beforeEach(() => {
    service = new EgresadosService(mockRepo as any);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockEgresados = [{ id: '1', nombres: 'John' }];
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
        getMany: vi.fn().mockResolvedValue(mockEgresados),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({ limit: 10 });

      expect(result.data).toEqual(mockEgresados);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an egresado if found', async () => {
      const egresado = { id: '1', nombres: 'John' };
      mockRepo.findOne.mockResolvedValue(egresado);

      const result = await service.findOne('1');

      expect(result).toEqual(egresado);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new egresado if not exists', async () => {
      const dto = { nombres: 'John', apellidos: 'Doe', carrera: 'Ing', anioEgreso: 2020 };
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ ...dto, userId: 'u1' });
      mockRepo.save.mockResolvedValue({ ...dto, id: 'e1', userId: 'u1' });

      const result = await service.create('u1', dto as any);

      expect(result.id).toBe('e1');
      expect(mockRepo.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if already exists', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'e1' });

      await expect(service.create('u1', {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getEstadisticasCohortes', () => {
    it('should return raw SQL query results mapped', async () => {
      const mockRows = [
        {
          anio_egreso: 2020,
          carrera: 'Ingeniería',
          total_egresados: 100,
          total_contratados: 80,
          tasa_empleabilidad: 80.0,
        },
      ];
      mockRepo.query.mockResolvedValue(mockRows);

      const result = await service.getEstadisticasCohortes();

      expect(result).toHaveLength(1);
      expect(result[0].anioEgreso).toBe(2020);
      expect(result[0].tasaEmpleabilidad).toBe(80.0);
    });
  });

  describe('findByUserId', () => {
    it('should return egresado if found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      const result = await service.findByUserId('u1');
      expect(result.id).toBe('e1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findByUserId('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update egresado if owner or admin', async () => {
      const egresado = { id: 'e1', userId: 'u1', nombres: 'Old' };
      mockRepo.findOne.mockResolvedValue(egresado);
      
      const mockQueryBuilder = {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        execute: vi.fn().mockResolvedValue({}),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockRepo.findOne.mockResolvedValueOnce(egresado).mockResolvedValueOnce({ ...egresado, carrera: 'Ing. Sistemas' });

      const result = await service.update('e1', 'u1', { carrera: 'Ing. Sistemas' });

      expect(result.carrera).toBe('Ing. Sistemas');
    });

    it('should throw ForbiddenException if not owner and not admin', async () => {
      const egresado = { id: 'e1', userId: 'u1' };
      mockRepo.findOne.mockResolvedValue(egresado);

      await expect(service.update('e1', 'u2', { carrera: 'Ing. Sistemas' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove egresado', async () => {
      const egresado = { id: 'e1' };
      mockRepo.findOne.mockResolvedValue(egresado);
      await service.remove('e1');
      expect(mockRepo.remove).toHaveBeenCalledWith(egresado);
    });
  });

  describe('getEgresadoStats', () => {
    it('should return personal stats from raw SQL', async () => {
      const mockStats = [{
        total_postulaciones: 10,
        total_en_revision: 5,
        total_entrevistas: 2,
        total_ofertas: 1,
      }];
      mockRepo.query.mockResolvedValue(mockStats);

      const result = await service.getEgresadoStats('e1');

      expect(result.totalPostulaciones).toBe(10);
      expect(result.totalEntrevistas).toBe(2);
    });
  });
});
