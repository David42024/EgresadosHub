import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  const mockDataSource = {
    query: vi.fn(),
  };

  beforeEach(() => {
    service = new AnalyticsService(mockDataSource as any);
    vi.clearAllMocks();
  });

  describe('getAdminKpis', () => {
    it('should return admin KPIs mapped from raw SQL', async () => {
      const mockRawKpis = [{
        total_egresados: '100',
        total_empresas: '10',
        ofertas_activas: '5',
        postulaciones_mes: '20',
        tasa_empleabilidad: '80.0',
        salario_promedio: '3500',
        salario_desviacion: '400',
        variacion_egresados: '5.0',
        variacion_ofertas: '10.0',
      }];
      mockDataSource.query.mockResolvedValue(mockRawKpis);

      const result = await service.getAdminKpis();

      expect(result.totalEgresados).toBe(100);
      expect(result.tasaEmpleabilidadGlobal).toBe(80.0);
      expect(mockDataSource.query).toHaveBeenCalled();
    });
  });

  describe('getDemandaHabilidades', () => {
    it('should return skills demand data', async () => {
      const mockRawSkills = [
        {
          habilidad: 'TypeScript',
          categoria: 'TECNICA',
          total_ofertas: '50',
          total_egresados: '30',
          brecha: '20',
        },
      ];
      mockDataSource.query.mockResolvedValue(mockRawSkills);

      const result = await service.getDemandaHabilidades(10);

      expect(result).toHaveLength(1);
      expect(result[0].habilidad).toBe('TypeScript');
      expect(result[0].brecha).toBe(20);
    });
  });

  describe('getResumenEmpresa', () => {
    it('should return empresa summary', async () => {
      const mockRawResumen = [{
        total_ofertas_activas: '5',
        total_postulaciones: '15',
        postulaciones_hoy: '2',
        total_postulados: '8',
        total_en_revision: '4',
        total_entrevistas: '2',
        total_contratados: '1',
        tasa_contratacion: '6.67',
      }];
      mockDataSource.query.mockResolvedValue(mockRawResumen);

      const result = await service.getResumenEmpresa('e1');

      expect(result.totalOfertasActivas).toBe(5);
      expect(result.tasaContratacion).toBe(6.67);
    });
  });
});
