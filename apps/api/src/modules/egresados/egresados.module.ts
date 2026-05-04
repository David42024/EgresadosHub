import { Module }         from '@nestjs/common';
import { TypeOrmModule }  from '@nestjs/typeorm';
import { Egresado }       from './entities/egresado.entity';
import { EgresadosService } from './egresados.service';
import { EgresadosRouter }  from './egresados.router';

@Module({
  imports:  [TypeOrmModule.forFeature([Egresado])],
  providers: [EgresadosService, EgresadosRouter],
  exports:   [EgresadosService, EgresadosRouter],
})
export class EgresadosModule {}
