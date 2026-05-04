import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { CreatePostulacionSchema, CambiarEstadoSchema, PaginationSchema, EstadoPostulacion } from '@repo/trpc-contract';
import { router, protectedProc, egresadoProc, adminOrEmpresa } from '../../trpc/trpc.service';
import { PostulacionesService } from './postulaciones.service';

@Injectable()
export class PostulacionesRouter {
  constructor(private readonly service: PostulacionesService) {}

  get router() {
    return router({
      misPostulaciones: egresadoProc
        .input(PaginationSchema.extend({
          limit: z.number().default(50),
          estado: z.nativeEnum(EstadoPostulacion).optional(),
          ordenFecha: z.enum(['RECENT', 'OLDEST']).default('RECENT'),
        }))
        .query(async ({ ctx, input }) => {
          const profile = await this.service.findEgresadoByUserId(ctx.userId);
          if (profile === null) {
            throw new Error('Perfil no encontrado');
          }
          return this.service.findByEgresado(profile.id, input);
        }),

      postulantesDeOferta: adminOrEmpresa
        .input(PaginationSchema.extend({
          ofertaId: z.string().uuid(),
          estado: z.nativeEnum(EstadoPostulacion).optional(),
        }))
        .query(({ input }) => this.service.findByOferta(input.ofertaId, input)),

      misPostulantes: adminOrEmpresa
        .input(PaginationSchema.extend({
          estado: z.nativeEnum(EstadoPostulacion).optional(),
        }))
        .query(async ({ ctx, input }) => {
          const empresa = await this.service.findEmpresaByUserId(ctx.userId);
          return this.service.findByEmpresa(empresa.id, input);
        }),

      list: adminOrEmpresa
        .input(z.object({
          limit: z.coerce.number().default(20),
          skip: z.coerce.number().default(0),
          estado: z.string().optional(),
          search: z.string().optional(),
        }))
        .query(({ input }) => {
          console.error(`\n!!! [ROUTER DEBUG] Postulaciones.list input:`, input);
          return this.service.findAll(input);
        }),


      getById: protectedProc
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => this.service.findOne(input.id)),

      postular: egresadoProc
        .input(CreatePostulacionSchema)
        .mutation(async ({ ctx, input }) => {
          console.log('🔍 DEBUG - postular mutation started');
          console.log('🔍 DEBUG - ctx.userId (should be user):', ctx.userId);
          const profile = await this.service.findEgresadoByUserId(ctx.userId);
          if (profile === null) {
            throw new Error('Perfil no encontrado');
          }
          console.log('🔍 DEBUG - profile.id (should be egresado):', profile.id);
          console.log('🔍 DEBUG - Calling service.create with:', {
            egresadoId: profile.id,
            userId: ctx.userId
          });
          return this.service.create(profile.id, ctx.userId, input);
        }),

      cambiarEstado: adminOrEmpresa
        .input(CambiarEstadoSchema)
        .mutation(({ ctx, input }) => this.service.cambiarEstado(input, ctx.userId)),

      embudo: adminOrEmpresa
        .input(z.object({ ofertaId: z.string().uuid() }))
        .query(({ input }) => this.service.getEmbudoPorOferta(input.ofertaId)),

      getAuditHistory: adminOrEmpresa
        .input(z.object({ postulacionId: z.string().uuid() }))
        .query(({ input }) => this.service.getAuditHistory(input.postulacionId)),
    });
  }
}
