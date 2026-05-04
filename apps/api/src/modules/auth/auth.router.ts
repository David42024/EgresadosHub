// ─── auth.router.ts ───────────────────────────────────────────────────────────
import { Injectable }       from '@nestjs/common';
import { TRPCError }        from '@trpc/server';
import { publicProc, protectedProc, router } from '../../trpc/trpc.service';
import { AuthService }      from './auth.service';
import { LoginSchema, RegisterSchema } from '@repo/trpc-contract';

@Injectable()
export class AuthRouter {
  constructor(private readonly authService: AuthService) {}

  get router() {
    return router({
      login: publicProc
        .input(LoginSchema)
        .mutation(async ({ input, ctx }) => {
          try {
            const result = await this.authService.login(input);
            
            // Setear cookie HttpOnly si estamos en una petición HTTP (Express)
            if (ctx.res) {
              ctx.res.cookie('access_token', result.accessToken, {
                httpOnly: true,
                secure:   process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge:   7 * 24 * 60 * 60 * 1000,
              });
            }
            
            return result;
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : '';
            if (message.includes('Credenciales incorrectas')) {
              throw new TRPCError({ 
                code: 'UNAUTHORIZED', 
                message: 'Credenciales incorrectas' 
              });
            }
            throw new TRPCError({ 
              code: 'INTERNAL_SERVER_ERROR', 
              message: 'Error al iniciar sesión' 
            });
          }
        }),

      register: publicProc
        .input(RegisterSchema)
        .mutation(async ({ input, ctx }) => {
          try {
            const result = await this.authService.register(input);
            
            if (ctx.res) {
              ctx.res.cookie('access_token', result.accessToken, {
                httpOnly: true,
                secure:   process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge:   7 * 24 * 60 * 60 * 1000,
              });
            }
            
            return result;
          } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Error desconocido';
            const isConflict = e instanceof Error && 'status' in e && (e as Record<string, unknown>).status === 409;
            const code = isConflict ? 'CONFLICT' : 'BAD_REQUEST';
            throw new TRPCError({ code, message });
          }
        }),

      logout: publicProc
        .mutation(({ ctx }) => {
          if (ctx.res) {
            ctx.res.clearCookie('access_token');
          }
          return { success: true };
        }),

      me: protectedProc
        .query(async ({ ctx }) => {
          const user = await this.authService.validateUser(ctx.userId);
          return {
            id:       user.id,
            email:    user.email,
            role:     user.role,
            isActive: user.isActive,
          };
        }),

      refresh: protectedProc
        .mutation(async ({ ctx }) => {
          return this.authService.refreshToken(ctx.userId);
        }),
    });
  }
}