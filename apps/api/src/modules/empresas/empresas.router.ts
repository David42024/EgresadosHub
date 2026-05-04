import { Injectable } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { CreateEmpresaProfileSchema, EmpresaFilterSchema } from '@repo/trpc-contract';
import { router, protectedProc, adminProc, empresaProc, publicProc } from '../../trpc/trpc.service';
import { EmpresasService } from './empresas.service';

@Injectable()
export class EmpresasRouter {
  constructor(private readonly service: EmpresasService) {}

  get router() {
    return router({
      list: protectedProc
        .input(z.object({
          limit: z.coerce.number().default(20),
          skip: z.coerce.number().default(0),
          search: z.string().optional(),
          sector: z.string().optional(),
          verificada: z.boolean().optional(),
        }))
        .query(({ input }) => {
          console.error(`\n!!! [ROUTER DEBUG] Empresas.list input:`, input);
          return this.service.findAll(input as any);
        }),

      getById: protectedProc
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => this.service.findOne(input.id)),

      getMyProfile: empresaProc
        .query(({ ctx }) => this.service.findByUserId(ctx.userId)),

      createProfile: empresaProc
        .input(CreateEmpresaProfileSchema)
        .mutation(({ ctx, input }) =>
          this.service.create(ctx.userId, input),
        ),

      updateProfile: empresaProc
        .input(CreateEmpresaProfileSchema.partial())
        .mutation(async ({ ctx, input }) => {
          const empresa = await this.service.findByUserId(ctx.userId);
          if (empresa === null || empresa === undefined) throw new TRPCError({ code: 'NOT_FOUND', message: 'Perfil de empresa no encontrado' });
          return this.service.update(empresa.id, ctx.userId, input);
        }),

      verificar: adminProc
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => this.service.verificar(input.id)),

      getPublicProfile: publicProc
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => this.service.getPublicProfile(input.id)),
    });
  }
}
