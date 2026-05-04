import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService }  from '@nestjs/config';
import cookieParser  from 'cookie-parser';
import compression   from 'compression';
import helmet             from 'helmet';
import { AppModule }      from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor }  from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const port   = config.get<number>('PORT', 3001);
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');

  // ─── Seguridad ─────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'"],
        styleSrc:   ["'self'", "'unsafe-inline'"],
        imgSrc:     ["'self'", 'data:', 'https:'],
      },
    },
  }));

  app.enableCors({
    origin:      frontendUrl,
    credentials: true,
    methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ─── Middlewares ────────────────────────────────────────────────────────────
  app.use(cookieParser());
  app.use(compression());

  // ─── Pipes globales ─────────────────────────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist:        true,
    forbidNonWhitelisted: true,
    transform:        true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // ─── Filtros e interceptores globales ────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // ─── Prefijo global de rutas REST ────────────────────────────────────────────
  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'));

  await app.listen(port);
  logger.log(`🚀 API corriendo en: http://localhost:${port}`);
  logger.log(`📡 tRPC disponible en: http://localhost:${port}/trpc`);
}

void bootstrap();