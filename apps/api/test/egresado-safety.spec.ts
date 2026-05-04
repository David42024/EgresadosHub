import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock entities to avoid TypeORM decorator issues
vi.mock('../src/modules/egresados/entities/egresado.entity', () => ({
  Egresado: class {},
}));
vi.mock('../src/modules/auth/entities/user.entity', () => ({
  User: class {},
}));

import { EgresadosService } from '../src/modules/egresados/egresados.service';
import { Repository } from 'typeorm';
import { Egresado } from '../src/modules/egresados/entities/egresado.entity';

describe('EgresadosService Safety', () => {
  let service: EgresadosService;
  let repo: Repository<Egresado>;

  beforeEach(() => {
    repo = {
      query: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
      createQueryBuilder: vi.fn(),
    } as unknown as Repository<Egresado>;
    service = new EgresadosService(repo);
  });

  it('should handle empty results in getEstadisticas without throwing', async () => {
    // Simula que la base de datos devuelve un array vacío (antes esto rompía)
    vi.mocked(repo.query).mockResolvedValue([]);

    const stats = await service.getEstadisticas('some-id');

    expect(stats).toBeDefined();
    expect(stats.totalPostulaciones).toBe(0);
    expect(stats.tasaRespuesta).toBe(0);
  });

  it('should handle null values in query results in getEstadisticasPorCohorte', async () => {
    // Simula valores nulos de la base de datos (común con LEFT JOINs)
    vi.mocked(repo.query).mockResolvedValue([
      {
        anio_egreso: 2020,
        carrera: 'Ingeniería',
        total_egresados: 10,
        total_contratados: 0,
        tasa_empleabilidad: null,
        salario_promedio: null,
      }
    ]);

    const stats = await service.getEstadisticasPorCohorte({});

    expect(stats[0]).toBeDefined();
    expect(stats[0]?.tasaEmpleabilidad).toBe(0); // Transformado de null a 0
    expect(stats[0]?.salarioPromedio).toBeNull(); // Mantenido como null si es opcional
  });
});
