import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteJob } from './entities/reporte-job.entity';
import { ReportesService } from './reportes.service';
import { ReportesRouter } from './reportes.router';
import { ReportesProcessor } from './reportes.queue';
import { ReportesFilesController } from './reportes-files.controller';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReporteJob]),
    BullModule.registerQueue({ name: 'reportes' }),
    AnalyticsModule,
  ],
  controllers: [ReportesFilesController],
  providers: [ReportesService, ReportesRouter, ReportesProcessor],
  exports:   [ReportesService, ReportesRouter, ReportesProcessor],
})
export class ReportesModule {}
