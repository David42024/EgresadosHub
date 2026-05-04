import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  router, protectedProc, adminProc, egresadoProc,
} from '../../trpc/trpc.service';
import { EgresadosService } from './egresados.service';
import {
  CreateEgresadoProfileSchema,
  UpdateEgresadoProfileSchema,
  AnalyticsFilterSchema,
} from '@repo/trpc-contract';

@Injectable()
export class EgresadosRouter {
  constructor(private readonly service: EgresadosService) { }

  get router() {
    return router({
      list: protectedProc
        .input(z.object({
          limit: z.coerce.number().default(20),
          skip: z.coerce.number().default(0),
          search: z.string().optional(),
          carrera: z.string().optional(),
          anioEgreso: z.number().optional(),
        }))
        .query(({ input }) => {
          console.error(`\n!!! [ROUTER DEBUG] Egresados.list input:`, input);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return this.service.findAll(input as any);
        }),

      getById: protectedProc
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => this.service.findOne(input.id)),

      getMyProfile: egresadoProc
        .query(async ({ ctx }) => {
          const profile = await this.service.findByUserId(ctx.userId);
          return profile || null;
        }),

      createProfile: egresadoProc
        .input(CreateEgresadoProfileSchema)
        .mutation(({ ctx, input }) => this.service.create(ctx.userId, input)),

      updateProfile: egresadoProc
        .input(z.any())
        .mutation(async ({ ctx, input }) => {
          const profile = await this.service.findByUserId(ctx.userId);
          if (!profile) throw new TRPCError({ code: 'NOT_FOUND' });
          return this.service.update(profile.id as string, ctx.userId as string, input);
        }),

      adminUpdate: adminProc
        .input(z.object({
          id: z.string().uuid(),
          data: UpdateEgresadoProfileSchema,
        }))
        .mutation(({ ctx, input }) =>
          this.service.update(input.id as string, ctx.userId as string, input.data, true)
        ),

      adminDelete: adminProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => this.service.remove(input.id)),

      getEstadisticasPorCohorte: protectedProc
        .input(AnalyticsFilterSchema.pick({
          anioEgreso: true,
          carrera: true,
        }).extend({ limit: z.number().int().min(1).max(50).optional() }))
        .query(() => this.service.getEstadisticasCohortes()),

      getMisEstadisticas: egresadoProc
        .query(async ({ ctx }) => {
          const profile = await this.service.findByUserId(ctx.userId);
          if (!profile) throw new TRPCError({ code: 'NOT_FOUND', message: 'Perfil no encontrado' });
          return this.service.getEgresadoStats(profile.id);
        }),
    });
  }
}