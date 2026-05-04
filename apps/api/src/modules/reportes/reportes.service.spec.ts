import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportesService } from './reportes.service';
import { TipoReporte } from '@repo/trpc-contract';
import { NotFoundException } from '@nestjs/common';

// Mock de puppeteer
vi.mock('puppeteer', () => ({
  launch: vi.fn().mockResolvedValue({
    newPage: vi.fn().mockResolvedValue({
      setContent: vi.fn(),
      pdf: vi.fn().mockResolvedValue(Buffer.from('mock-pdf')),
    }),
    close: vi.fn(),
  }),
}));

// Mock de fs
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('mock-template'),
  mkdir: vi.fn(),
  writeFile: vi.fn(),
}));

describe('ReportesService', () => {
  let service: ReportesService;
  const mockJobRepo = {
    create: vi.fn(),
    save: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
  };
  const mockQueue = {
    add: vi.fn(),
  };
  const mockDataSource = {
    query: vi.fn(),
  };
  const mockConfig = {
    get: vi.fn().mockReturnValue('mock-val'),
  };
  const mockAnalytics = {
    getAdminKpis: vi.fn(),
    getDistribucionCarrera: vi.fn(),
    getDemandaHabilidades: vi.fn(),
    getEvolucionMensual: vi.fn(),
  };

  beforeEach(() => {
    service = new ReportesService(
      mockJobRepo as any,
      mockQueue as any,
      mockDataSource as any,
      mockConfig as any,
      mockAnalytics as any,
    );
    vi.clearAllMocks();
  });

  describe('generarReporte', () => {
    it('should create a job and return jobId (asynchronous)', async () => {
      const dto = { tipo: 'DEMANDA_LABORAL' as TipoReporte, asincrono: true };
      mockJobRepo.create.mockReturnValue(dto);
      mockJobRepo.save.mockResolvedValue({ ...dto, id: 'j1' });

      const result = await service.generarReporte(dto, 'u1');

      expect(result.jobId).toBe('j1');
      expect(mockQueue.add).toHaveBeenCalled();
    });
  });

  describe('generarPDF', () => {
    it('should generate a PDF and update job status', async () => {
      const dto = { tipo: 'DEMANDA_LABORAL' as TipoReporte };
      mockAnalytics.getDemandaHabilidades.mockResolvedValue([]);
      mockAnalytics.getEvolucionMensual.mockResolvedValue([]);
      
      mockJobRepo.update.mockResolvedValue({});

      const url = await service.generarPDF('j1', dto);

      expect(url).toContain('mock-val/DEMANDA_LABORAL_j1.pdf');
      expect(mockJobRepo.update).toHaveBeenCalledWith('j1', expect.objectContaining({
        estado: 'COMPLETADO',
      }));
    });
  });

  describe('getJobStatus', () => {
    it('should return job status if found', async () => {
      const job = { id: 'j1', estado: 'COMPLETADO', creadoAt: new Date() };
      mockJobRepo.findOne.mockResolvedValue(job);
      const result = await service.getJobStatus('j1');
      expect(result.jobId).toBe('j1');
    });

    it('should throw NotFoundException if not found', async () => {
      mockJobRepo.findOne.mockResolvedValue(null);
      await expect(service.getJobStatus('j1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerDatos', () => {
    it('should return data for EMPLEABILIDAD_COHORTE', async () => {
      mockAnalytics.getAdminKpis.mockResolvedValue({});
      mockAnalytics.getDistribucionCarrera.mockResolvedValue([]);
      
      const result = await (service as any).obtenerDatos('EMPLEABILIDAD_COHORTE');
      expect(result).toHaveProperty('cohortes');
    });

    it('should return data for LISTADO_EGRESADOS from raw SQL', async () => {
      mockDataSource.query.mockResolvedValue([]);
      const result = await (service as any).obtenerDatos('LISTADO_EGRESADOS');
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
