import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { TipoNotificacion } from '@repo/trpc-contract';

@Entity('notificaciones')
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: TipoNotificacion })
  tipo!: TipoNotificacion;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'jsonb', default: {} })
  metadata!: Record<string, unknown>;

  @Column({ default: false })
  leida!: boolean;

  @CreateDateColumn({ name: 'creada_at' })
  creadaAt!: Date;
}
