import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PaginationSchema } from '@repo/trpc-contract';
import { router, protectedProc } from '../../trpc/trpc.service';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class NotificacionesRouter {
  constructor(private readonly service: NotificacionesService) {}

  private transformNotificacion(n: any) {
    return {
      ...n,
      creadaAt: n.creadaAt instanceof Date ? n.creadaAt.toISOString() : n.creadaAt,
      actualizadaAt: n.actualizadaAt instanceof Date ? n.actualizadaAt.toISOString() : n.actualizadaAt,
    };
  }

  get router() {
    return router({
      list: protectedProc
        .input(PaginationSchema)
        .query(async ({ ctx, input }) => {
          const result = await this.service.findByUser(ctx.userId, input);
          return {
            ...result,
            data: result.data.map(n => this.transformNotificacion(n)),
          };
        }),

      countNoLeidas: protectedProc
        .query(({ ctx }) => this.service.countNoLeidas(ctx.userId)),

      marcarLeida: protectedProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(async ({ ctx, input }) => {
          const n = await this.service.marcarLeida(input.id, ctx.userId);
          return this.transformNotificacion(n);
        }),

      marcarTodasLeidas: protectedProc
        .mutation(({ ctx }) => this.service.marcarTodasLeidas(ctx.userId)),
    });
  }
}
