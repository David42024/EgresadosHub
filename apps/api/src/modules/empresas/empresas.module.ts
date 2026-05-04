import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { EmpresasService } from './empresas.service';
import { EmpresasRouter } from './empresas.router';

@Module({
  imports:   [TypeOrmModule.forFeature([Empresa])],
  providers: [EmpresasService, EmpresasRouter],
  exports:   [EmpresasService, EmpresasRouter],
})
export class EmpresasModule {}
