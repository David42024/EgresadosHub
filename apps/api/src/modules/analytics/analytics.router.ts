import { Injectable }    from '@nestjs/common';
import { z }              from 'zod';
import { AnalyticsFilterSchema } from '@repo/trpc-contract';
import { router, publicProc, protectedProc, adminProc, empresaProc } from '../../trpc/trpc.service';
import { AnalyticsService } from './analytics.service';

@Injectable()
export class AnalyticsRouter {
  constructor(private readonly service: AnalyticsService) {}

  get router() {
    return router({
      getPublicStats: publicProc
        .query(() => this.service.getPublicStats()),

      getAdminKpis: adminProc
        .input(AnalyticsFilterSchema.optional())
        .query(({ input }) => this.service.getAdminKpis(input)),

      getOfertasStatsAdmin: adminProc
        .query(() => this.service.getOfertasStatsAdmin()),

      getEgresadosStatsAdmin: adminProc
        .query(() => this.service.getEgresadosStatsAdmin()),

      getEmpresasStatsAdmin: adminProc
        .query(() => this.service.getEmpresasStatsAdmin()),

      getPostulacionesStatsAdmin: adminProc
        .query(() => this.service.getPostulacionesStatsAdmin()),

      getEmpresasPorSector: adminProc
        .query(() => this.service.getEmpresasPorSector()),

      getEvolucionMensual: adminProc
        .input(z.object({ meses: z.number().int().min(3).max(36).default(12) }))
        .query(({ input }) => this.service.getEvolucionMensual(input.meses)),

      getDemandaHabilidades: protectedProc
        .input(z.object({ limit: z.number().int().min(5).max(50).default(20) }))
        .query(({ input }) => this.service.getDemandaHabilidades(input.limit)),

      getDistribucionCarrera: adminProc
        .query(() => this.service.getDistribucionCarrera()),

      getStatsEmpresa: empresaProc
        .query(async ({ ctx }) => {
          const empresa = await this.service.dataSource.getRepository('Empresa').findOne({ where: { userId: ctx.userId } });
          if (empresa === null || empresa === undefined) throw new Error('Empresa no encontrada');
          return this.service.getStatsEmpresa(empresa.id);
        }),

      getResumenEmpresa: empresaProc
        .query(async ({ ctx }) => {
          const empresa = await this.service.dataSource.getRepository('Empresa').findOne({ where: { userId: ctx.userId } });
          if (empresa === null || empresa === undefined) throw new Error('Empresa no encontrada');
          return this.service.getResumenEmpresa(empresa.id);
        }),

      getRendimientoOfertas: empresaProc
        .query(async ({ ctx }) => {
          const empresa = await this.service.dataSource.getRepository('Empresa').findOne({ where: { userId: ctx.userId } });
          if (empresa === null || empresa === undefined) throw new Error('Empresa no encontrada');
          return this.service.getRendimientoOfertas(empresa.id);
        }),
    });
  }
}
