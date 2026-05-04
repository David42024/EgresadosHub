import { Test, TestingModule } from '@nestjs/testing';
import { EgresadosService } from '../src/modules/egresados/egresados.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Egresado } from '../src/modules/egresados/entities/egresado.entity';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EgresadosService', () => {
  let service: EgresadosService;
  let repo: any;

  const mockRepo = {
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    query: vi.fn(),
    createQueryBuilder: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EgresadosService,
        {
          provide: getRepositoryToken(Egresado),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EgresadosService>(EgresadosService);
    repo = module.get(getRepositoryToken(Egresado));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEstadisticas', () => {
    it('should return mapped statistics from query', async () => {
      const mockResult = [{
        total_postulaciones: '10',
        total_en_revision: '2',
        total_entrevistas: '3',
        total_ofertas: '1',
        tasa_respuesta: '50.00'
      }];
      
      repo.query.mockResolvedValue(mockResult);

      const stats = await service.getEstadisticas('some-id');

      expect(stats).toEqual({
        totalPostulaciones: 10,
        totalEnRevision: 2,
        totalEntrevistas: 3,
        totalOfertas: 1,
        tasaRespuesta: 50,
        salarioPromedioMatch: null,
        ofertasMatch: 0
      });
      expect(repo.query).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if egresado not found', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return egresado if found', async () => {
      const mockEgresado = { id: '1', nombres: 'Juan' };
      repo.findOne.mockResolvedValue(mockEgresado);
      const result = await service.findOne('1');
      expect(result).toEqual(mockEgresado);
    });
  });
});
