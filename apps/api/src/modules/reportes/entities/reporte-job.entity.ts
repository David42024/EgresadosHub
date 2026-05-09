import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('reportes_jobs')
export class ReporteJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  tipo!: string;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado!: string;

  @Column({ type: 'jsonb', nullable: true })
  filtros?: Record<string, unknown> | null;

  @Column({ type: 'varchar', nullable: true })
  url?: string | null;

  @Column({ name: 'pdf_base64', type: 'text', nullable: true })
  pdfBase64?: string | null;

  @Column({ type: 'text', nullable: true })
  error?: string | null;

  @Column({ name: 'creado_por', type: 'varchar', nullable: true })
  creadoPor?: string | null;

  @CreateDateColumn({ name: 'creado_at' })
  creadoAt!: Date;

  @Column({ name: 'completado_at', type: 'timestamp', nullable: true })
  completadoAt?: Date | null;
}
