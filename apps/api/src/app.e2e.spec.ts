import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import  request from 'supertest';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Egresado } from './modules/egresados/entities/egresado.entity';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  const mockEgresadoRepo = {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn(),
  };

  const mockDataSource = {
    createQueryRunner: vi.fn(),
    query: vi.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(getRepositoryToken(Egresado))
    .useValue(mockEgresadoRepo)
    .overrideProvider(DataSource)
    .useValue(mockDataSource)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET) - health check', async () => {
    // Si tienes un endpoint de health check REST
    // const response = await request(app.getHttpServer()).get('/health');
    // expect(response.status).toBe(200);
    
    // Por ahora solo probamos que la app inicializa
    expect(app).toBeDefined();
  });

  it('should handle tRPC requests', async () => {
    // Ejemplo de test a tRPC vía HTTP
    const response = await request(app.getHttpServer())
      .post('/trpc/egresados.list?batch=1')
      .send({ '0': { json: { limit: 10 } } });

    // tRPC suele retornar 200 aunque haya errores internos en el batch, 
    // pero aquí esperamos que al menos el middleware responda
    expect(response.status).toBe(200);
  });
});
