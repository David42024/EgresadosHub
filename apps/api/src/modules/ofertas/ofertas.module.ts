import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Oferta } from './entities/oferta.entity';
import { OfertasService } from './ofertas.service';
import { OfertasRouter } from './ofertas.router';

@Module({
  imports:   [TypeOrmModule.forFeature([Oferta])],
  providers: [OfertasService, OfertasRouter],
  exports:   [OfertasService, OfertasRouter],
})
export class OfertasModule {}
