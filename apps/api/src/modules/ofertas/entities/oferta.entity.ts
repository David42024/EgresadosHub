import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Empresa }     from '../../empresas/entities/empresa.entity';
import { Postulacion } from '../../postulaciones/entities/postulacion.entity';
import { EstadoOferta, Modalidad } from '@repo/trpc-contract';

@Entity('ofertas')
export class Oferta {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Empresa, (e) => e.ofertas, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa!: Empresa;

  @Column({ name: 'empresa_id' })
  empresaId!: string;

  @Column({ length: 200 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'text', nullable: true })
  requisitos?: string;

  @Column({ type: 'text', nullable: true })
  beneficios?: string;

  @Column({ name: 'salario_min', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salarioMin?: number;

  @Column({ name: 'salario_max', type: 'decimal', precision: 12, scale: 2, nullable: true })
  salarioMax?: number;

  @Column({ type: 'enum', enum: Modalidad })
  modalidad!: Modalidad;

  @Column({ length: 200 })
  ubicacion!: string;

  @Column({ name: 'experiencia_min', type: 'smallint', default: 0 })
  experienciaMin!: number;

  @Column({ name: 'habilidades_req', type: 'jsonb', default: [] })
  habilidadesReq!: string[];

  @Column({ name: 'documentos_requeridos', type: 'jsonb', default: ['CV Base'] })
  documentosRequeridos!: string[];

  @Column({ type: 'enum', enum: EstadoOferta, default: EstadoOferta.BORRADOR })
  estado!: EstadoOferta;

  @Column({ name: 'publicada_at', type: 'timestamptz', nullable: true })
  publicadaAt?: Date;

  @Column({ name: 'cierra_at', type: 'timestamptz', nullable: true })
  cierraAt?: Date;

  @Column({ type: 'int', default: 0 })
  vistas!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Postulacion, (p) => p.oferta)
  postulaciones!: Postulacion[];

  totalPostulaciones?: number;
}