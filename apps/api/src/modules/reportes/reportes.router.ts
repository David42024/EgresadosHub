import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { GenerarReporteSchema } from '@repo/trpc-contract';
import { router, adminProc, protectedProc } from '../../trpc/trpc.service';
import { ReportesService } from './reportes.service';

@Injectable()
export class ReportesRouter {
  constructor(private readonly service: ReportesService) {}

  get router() {
    return router({
      generar: adminProc
        .input(GenerarReporteSchema)
        .mutation(({ ctx, input }) => this.service.generarReporte(input, ctx.userId)),

      estado: protectedProc
        .input(z.object({ jobId: z.string().uuid() }))
        .query(({ input }) => this.service.getJobStatus(input.jobId)),

      listar: adminProc
        .input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional())
        .query(({ input }) => this.service.listarJobs(input?.limit ?? 20)),
    });
  }
}
