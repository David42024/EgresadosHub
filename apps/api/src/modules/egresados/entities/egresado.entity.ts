import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('egresados')
export class Egresado {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', unique: true })
  userId!: string;

  @Column({ length: 150 })
  nombres!: string;

  @Column({ length: 150 })
  apellidos!: string;

  get nombreCompleto(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  @Column({ name: 'codigo_estudiante', nullable: true, unique: true })
  codigoEstudiante?: string;

  @Column({ length: 200 })
  carrera!: string;

  @Column({ name: 'anio_egreso', type: 'smallint' })
  anioEgreso!: number;

  @Column({ nullable: true, length: 20 })
  telefono?: string;

  @Column({ nullable: true, length: 200 })
  ubicacion?: string;

  @Column({ name: 'resumen_profesional', type: 'text', nullable: true })
  resumenProfesional?: string;

  @Column({ name: 'foto_url', nullable: true })
  fotoUrl?: string;

  @Column({ name: 'cv_url', nullable: true })
  cvUrl?: string;

  @Column({ type: 'jsonb', default: [] })
  habilidades!: Array<{
    nombre:    string;
    nivel?:    number;
    categoria: string;
  }>;

  @Column({ type: 'jsonb', default: [] })
  experiencias!: Array<{
    empresa:     string;
    cargo:       string;
    desde:       string;
    hasta?:      string;
    actual:      boolean;
    descripcion?: string;
  }>;

  @Column({ type: 'jsonb', default: [] })
  formacion!: Array<{
    institucion: string;
    titulo:      string;
    desde:       string;
    hasta?:      string;
    actual:      boolean;
  }>;

  @Column({ name: 'redes_sociales', type: 'jsonb', default: {} })
  redesSociales!: Record<string, string>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}