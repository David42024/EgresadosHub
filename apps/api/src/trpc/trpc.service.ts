import { Injectable }              from '@nestjs/common';
import { initTRPC, TRPCError }     from '@trpc/server';
import { Request, Response }       from 'express';
import { JwtService }              from '@nestjs/jwt';
import { ConfigService }           from '@nestjs/config';
import { Role }                    from '@repo/trpc-contract';


// TrpcContext — solo vive en el backend y contiene Express
export interface TrpcContext {
  req: Request;
  res: Response;
  userId: string | null;
  role:   Role    | null;
}

export interface AuthenticatedContext {
  req:    Request;
  res:    Response;
  userId: string;
  role:   Role;
}

// initTRPC usa TrpcContext para que req/res estén disponibles en los routers
export const t = initTRPC.context<TrpcContext>().create({
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof Error ? null : error.cause,
    },
  }),
});



export const router      = t.router;
export const publicProc  = t.procedure;
export const middleware  = t.middleware;
export const createCallerFactory = t.createCallerFactory;

const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (ctx.userId === null || ctx.userId === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Debes iniciar sesión' });
  }
  // ✅ next() con el contexto tipado correctamente
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,  // ahora TypeScript sabe que es string
      role:   ctx.role!,
    } satisfies AuthenticatedContext,
  });
});

const hasRole = (roles: Role[]) =>
  t.middleware(({ ctx, next }) => {
    if (ctx.role === null || ctx.role === undefined || !roles.includes(ctx.role as Role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Acceso denegado. Rol requerido: ${roles.join(' | ')}`,
      });
    }
    return next({ ctx });
  });

// Alternativa sin importar ProcedureBuilder
export const protectedProc  = publicProc.use(isAuthenticated) as ReturnType<typeof publicProc.use<any>>;
export const adminProc      = protectedProc.use(hasRole([Role.ADMINISTRADOR])) as ReturnType<typeof publicProc.use<any>>;
export const egresadoProc   = protectedProc.use(hasRole([Role.EGRESADO]))      as ReturnType<typeof publicProc.use<any>>;
export const empresaProc    = protectedProc.use(hasRole([Role.EMPRESA]))        as ReturnType<typeof publicProc.use<any>>;
export const adminOrEmpresa = protectedProc.use(hasRole([Role.ADMINISTRADOR, Role.EMPRESA])) as ReturnType<typeof publicProc.use<any>>;
@Injectable()
export class TrpcService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async createContext(req: Request, res: Response): Promise<TrpcContext> {
    let userId: string | null = null;
    let role:   Role    | null = null;

    const tokenFromCookie = req.cookies?.['access_token'] as string | undefined;
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    const token = tokenFromCookie ?? tokenFromHeader;

    if (token !== undefined && token !== '') {
      try {
        const payload = await this.jwtService.verifyAsync<{ sub: string; role: Role }>(token, {
          secret: this.configService.get<string>('JWT_SECRET'),
        });
        userId = payload.sub;
        role   = payload.role;
      } catch {
        // Token inválido — ctx sin usuario
      }
    }

    return { req, res, userId, role };
  }
}