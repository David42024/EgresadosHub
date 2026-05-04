import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { PaginationSchema } from '@repo/trpc-contract';
import { router, protectedProc } from '../../trpc/trpc.service';
import { NotificacionesService } from './notificaciones.service';

@Injectable()
export class NotificacionesRouter {
  constructor(private readonly service: NotificacionesService) {}

  get router() {
    return router({
      list: protectedProc
        .input(PaginationSchema)
        .query(({ ctx, input }) => this.service.findByUser(ctx.userId, input)),

      countNoLeidas: protectedProc
        .query(({ ctx }) => this.service.countNoLeidas(ctx.userId)),

      marcarLeida: protectedProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ ctx, input }) => this.service.marcarLeida(input.id, ctx.userId)),

      marcarTodasLeidas: protectedProc
        .mutation(({ ctx }) => this.service.marcarTodasLeidas(ctx.userId)),
    });
  }
}
