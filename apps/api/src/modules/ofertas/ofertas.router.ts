import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CreateOfertaSchema, UpdateOfertaSchema, OfertaFilterSchema, EstadoOferta } from '@repo/trpc-contract';
import { router, publicProc, protectedProc, adminProc, empresaProc } from '../../trpc/trpc.service';
import { OfertasService } from './ofertas.service';

@Injectable()
export class OfertasRouter {
  constructor(private readonly service: OfertasService) {}

  get router() {
    return router({
      list: protectedProc
        .input(z.object({
          limit: z.coerce.number().default(20),
          skip: z.coerce.number().default(0),
          search: z.string().optional(),
          estado: z.string().optional(),
          empresaId: z.string().optional(),
          modalidad: z.string().optional(),
        }))
        .query(({ input }) => {
          console.error(`\n!!! [ROUTER DEBUG] Ofertas.list input:`, input);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return this.service.findAll(input as any);
        }),

      publicList: publicProc
        .input(OfertaFilterSchema.extend({
          search:      z.string().default(''),
          salarioMin:  z.number().default(0),
          take:        z.number().default(50),
          skip:        z.number().default(0),
        }))
        .query(({ input }) => this.service.findAll({ ...input, estado: EstadoOferta.ACTIVA })),

      getById: protectedProc
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => this.service.findOne(input.id)),

      publicGetById: publicProc
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => this.service.findOne(input.id)),

      incrementVistas: publicProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => this.service.incrementVistas(input.id)),

      misOfertas: empresaProc
        .input(OfertaFilterSchema)
        .query(async ({ ctx, input }) => {
          const res = await this.service.findByEmpresaUserId(ctx.userId, input);
          return res;
        }),

      create: empresaProc
        .input(CreateOfertaSchema)
        .mutation(async ({ ctx, input }) => {
          return this.service.create(ctx.userId, input);
        }),

      update: empresaProc
        .input(z.object({ id: z.string().uuid(), data: UpdateOfertaSchema }))
        .mutation(({ ctx, input }) => {
          const userId = ctx.userId as string;
          return this.service.update(input.id as string, userId, input.data);
        }),

      publicar: empresaProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ ctx, input }) => this.service.publicar(input.id, ctx.userId)),

      pausar: empresaProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ ctx, input }) => this.service.pausar(input.id, ctx.userId)),

      cerrar: empresaProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ ctx, input }) => this.service.cerrar(input.id, ctx.userId)),

      adminUpdate: adminProc
        .input(z.object({ id: z.string().uuid(), data: UpdateOfertaSchema }))
        .mutation(({ ctx, input }) => {
          const userId = ctx.userId as string;
          return this.service.update(input.id as string, userId, input.data, true);
        }),
    });
  }
}
