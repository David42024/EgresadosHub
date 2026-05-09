import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { EstadoPostulacion } from '@repo/trpc-contract';
import { Egresado }          from '../../egresados/entities/egresado.entity';
import { Oferta }            from '../../ofertas/entities/oferta.entity';
import { User }              from '../../auth/entities/user.entity';

@Entity('postulaciones')
@Unique(['egresadoId', 'ofertaId'])
export class Postulacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Egresado, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'egresado_id' })
  egresado!: Egresado;

  @Column({ name: 'egresado_id' })
  egresadoId!: string;

  @ManyToOne(() => Oferta, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'oferta_id' })
  oferta!: Oferta;

  @Column({ name: 'oferta_id' })
  ofertaId!: string;

  @Column({ type: 'enum', enum: EstadoPostulacion, default: EstadoPostulacion.POSTULADO })
  estado!: EstadoPostulacion;

  @Column({ name: 'carta_presentacion', type: 'text', nullable: true })
  cartaPresentacion?: string;

  @Column({ type: 'jsonb', nullable: true, default: [] })
  documentos?: {
    tipo: 'CV' | 'CERTIFICADO' | 'CARTA' | 'PORTAFOLIO' | 'OTRO';
    nombre: string;
    url: string;
  }[];

  @OneToMany(() => PostulacionAudit, (a) => a.postulacion, { cascade: true })
  audits!: PostulacionAudit[];

  @CreateDateColumn({ name: 'postulado_at' })
  postuladoAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

@Entity('postulacion_audit')
export class PostulacionAudit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Postulacion, (p) => p.audits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postulacion_id' })
  postulacion!: Postulacion;

  @Column({ name: 'postulacion_id' })
  postulacionId!: string;

  @Column({ name: 'estado_anterior', type: 'enum', enum: EstadoPostulacion, nullable: true })
  estadoAnterior?: EstadoPostulacion;

  @Column({ name: 'estado_nuevo', type: 'enum', enum: EstadoPostulacion })
  estadoNuevo!: EstadoPostulacion;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cambiado_por' })
  cambiadoPorUser!: User;

  @Column({ name: 'cambiado_por' })
  cambiadoPor!: string;

  @Column({ type: 'text', nullable: true })
  comentario?: string;

  @CreateDateColumn({ name: 'cambiado_at' })
  cambiadoAt!: Date;
}