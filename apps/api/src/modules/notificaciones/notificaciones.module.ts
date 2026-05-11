import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entities/notificacion.entity';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesRouter } from './notificaciones.router';
import { NotificacionesInitializer } from './notificaciones-initializer.service';

@Module({
  imports:   [TypeOrmModule.forFeature([Notificacion])],
  providers: [NotificacionesService, NotificacionesRouter, NotificacionesInitializer],
  exports:   [NotificacionesService, NotificacionesRouter],
})
export class NotificacionesModule {}
