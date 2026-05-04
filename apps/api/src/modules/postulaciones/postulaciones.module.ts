import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulacion, PostulacionAudit } from './entities/postulacion.entity';
import { PostulacionesService } from './postulaciones.service';
import { PostulacionesRouter } from './postulaciones.router';

@Module({
  imports:   [TypeOrmModule.forFeature([Postulacion, PostulacionAudit])],
  providers: [PostulacionesService, PostulacionesRouter],
  exports:   [PostulacionesService, PostulacionesRouter],
})
export class PostulacionesModule {}
