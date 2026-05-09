import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ReportesService } from './reportes.service';
import { TipoReporte } from '@repo/trpc-contract';

@Processor('reportes')
export class ReportesProcessor {
  constructor(private readonly service: ReportesService) {}

  @Process({ name: 'generar-pdf', concurrency: 3 })
  async handleGenerarPdf(job: Job<{ jobId: string; dto: { tipo: TipoReporte; filtros?: Record<string, unknown> } }>) {
    const { jobId, dto } = job.data;
    await this.service.generarPDF(jobId, dto);
  }
}