import { describe, it, expect, vi } from 'vitest';
import { createAppRouter } from './app.router';
import { Role } from '@repo/trpc-contract';
import { TRPCError } from '@trpc/server';
import { createCallerFactory, router, publicProc, protectedProc, adminProc } from './trpc.service';

describe('AppRouter', () => {
  // Mocks de los routers/servicios
  const mockAuthService = {
    validateUser: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
  };
  const mockEgresadosService = {
    findByUserId: vi.fn(),
  };

  const authRouter = {
    router: {
      me: vi.fn(),
      login: vi.fn(),
    }
  };

  // En lugar de mockear el router completo, mockeamos los servicios y usamos el router real
  // Pero para simplicidad en este test de integración de tRPC, mockeamos la estructura que espera createAppRouter
  
  const mockDeps = {
    auth: { router: vi.fn() },
    egresados: { router: vi.fn() },
    empresas: { router: vi.fn() },
    ofertas: { router: vi.fn() },
    postulaciones: { router: vi.fn() },
    analytics: { router: vi.fn() },
    reportes: { router: vi.fn() },
    notificaciones: { router: vi.fn() },
  } as any;

  // Contexto de test
  function makeCtx(overrides: any = {}) {
    return {
      req: {} as any,
      res: { cookie: vi.fn(), clearCookie: vi.fn() } as any,
      userId: null,
      role: null,
      ...overrides,
    };
  }

  it('should allow public access to public procedures', async () => {
    // Implementación mínima para probar la estructura
    const testRouter = router({
      health: publicProc.query(() => ({ ok: true })),
    });
    
    const createCaller = createCallerFactory(testRouter);
    const caller = createCaller(makeCtx());
    
    const result = await caller.health();
    expect(result).toEqual({ ok: true });
  });

  it('should throw UNAUTHORIZED for protected procedures without session', async () => {
    const testRouter = router({
      secret: protectedProc.query(() => ({ data: 'secret' })),
    });
    
    const createCaller = createCallerFactory(testRouter);
    const caller = createCaller(makeCtx());
    
    await expect(caller.secret()).rejects.toThrow(TRPCError);
    await expect(caller.secret()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('should throw FORBIDDEN for procedures with wrong role', async () => {
    const testRouter = router({
      adminOnly: adminProc.query(() => ({ data: 'admin' })),
    });
    
    const createCaller = createCallerFactory(testRouter);
    const caller = createCaller(makeCtx({ userId: 'u1', role: Role.EGRESADO }));
    
    await expect(caller.adminOnly()).rejects.toThrow(TRPCError);
    await expect(caller.adminOnly()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('should allow access with correct role', async () => {
    const testRouter = router({
      adminOnly: adminProc.query(() => ({ data: 'admin' })),
    });
    
    const createCaller = createCallerFactory(testRouter);
    const caller = createCaller(makeCtx({ userId: 'u1', role: Role.ADMINISTRADOR }));
    
    const result = await caller.adminOnly();
    expect(result).toEqual({ data: 'admin' });
  });
});
