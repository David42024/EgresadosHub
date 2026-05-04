import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { EgresadosModule } from './modules/egresados/egresados.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { OfertasModule } from './modules/ofertas/ofertas.module';
import { PostulacionesModule } from './modules/postulaciones/postulaciones.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ReportesModule } from './modules/reportes/reportes.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { UploadModule } from './modules/upload/upload.module';
import { TrpcModule } from './trpc/trpc.module';
import { HealthModule } from './modules/health/health.module';
import { databaseConfig } from './database/database.config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // ─── Configuración global ──────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
    }),

    // ─── Base de datos ─────────────────────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),

    // ─── Redis + Queues ────────────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get<string>('REDIS_URL'),
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 100,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    // ─── Eventos internos ──────────────────────────────────────────────────
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      global: true,
    }),

    // ─── Rate limiting ─────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),

    // ─── Módulos de dominio ────────────────────────────────────────────────
    AuthModule,
    EgresadosModule,
    EmpresasModule,
    OfertasModule,
    PostulacionesModule,
    AnalyticsModule,
    ReportesModule,
    NotificacionesModule,
    UploadModule,

    // ─── tRPC ──────────────────────────────────────────────────────────────
    TrpcModule,

    // ─── Health Check ─────────────────────────────────────────────────────
    HealthModule,

    // ─── Archivos Estáticos ────────────────────────────────────────────────
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
  ],
})
export class AppModule { }