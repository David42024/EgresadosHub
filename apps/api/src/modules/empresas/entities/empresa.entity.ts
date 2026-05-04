// ─── empresa.entity.ts ───────────────────────────────────────────────────────
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Oferta } from '../../ofertas/entities/oferta.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => Oferta, (oferta) => oferta.empresa)
  ofertas!: Oferta[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', unique: true })
  userId!: string;

  @Column({ name: 'razon_social', length: 300 })
  razonSocial!: string;

  @Column({ nullable: true, length: 11, unique: true })
  ruc?: string;

  @Column({ length: 100 })
  sector!: string;

  @Column({ length: 200 })
  ubicacion!: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @Column({ name: 'sitio_web', nullable: true })
  sitioWeb?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ default: false })
  verificada!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}