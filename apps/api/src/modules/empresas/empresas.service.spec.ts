import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmpresasService } from './empresas.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('EmpresasService', () => {
  let service: EmpresasService;
  const mockRepo = {
    createQueryBuilder: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  beforeEach(() => {
    service = new EmpresasService(mockRepo as any);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated empresas', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        take: vi.fn().mockReturnThis(),
        andWhere: vi.fn().mockReturnThis(),
        getCount: vi.fn().mockResolvedValue(1),
        getMany: vi.fn().mockResolvedValue([{ id: 'e1', razonSocial: 'Test' }]),
      };
      mockRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll({});

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return empresa if found', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'e1' });
      const result = await service.findOne('e1');
      expect(result.id).toBe('e1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('e1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('verificar', () => {
    it('should mark empresa as verified', async () => {
      const empresa = { id: 'e1', verificada: false };
      mockRepo.findOne.mockResolvedValue(empresa);
      mockRepo.save.mockImplementation((e) => Promise.resolve(e));

      const result = await service.verificar('e1');

      expect(result.verificada).toBe(true);
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ verificada: true }));
    });
  });

  describe('findByUserId', () => {
    it('should return empresa for userId', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'e1' });
      const result = await service.findByUserId('u1');
      expect(result?.id).toBe('e1');
    });
  });

  describe('create', () => {
    it('should create and save empresa', async () => {
      const dto = { razonSocial: 'New' };
      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue({ ...dto, id: 'e1' });
      const result = await service.create('u1', dto as any);
      expect(result.id).toBe('e1');
    });
  });

  describe('update', () => {
    it('should update empresa if owner', async () => {
      const empresa = { id: 'e1', userId: 'u1', razonSocial: 'Old' };
      mockRepo.findOne.mockResolvedValue(empresa);
      mockRepo.save.mockImplementation((x) => Promise.resolve(x));
      const result = await service.update('e1', 'u1', { razonSocial: 'New' });
      expect(result.razonSocial).toBe('New');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'e1', userId: 'u1' });
      await expect(service.update('e1', 'u2', {})).rejects.toThrow(ForbiddenException);
    });
  });
});
