import { z } from 'zod';
import { PaginationSchema } from './common.schema';

// ─── Schemas de Egresados ────────────────────────────────────────────────────

export const HabilidadSchema = z.object({
  nombre: z.string().min(1).max(100),
  nivel: z.number().int().min(1).max(5).optional(),
  categoria: z.enum(['TECNICA', 'BLANDA', 'IDIOMA', 'CERTIFICACION']),
});

export const ExperienciaSchema = z.object({
  empresa: z.string(),
  cargo: z.string(),
  desde: z.string(),
  hasta: z.string().optional(),
  actual: z.boolean().default(false),
  descripcion: z.string().max(1000).optional(),
});

export const FormacionSchema = z.object({
  institucion: z.string(),
  titulo: z.string(),
  desde: z.string(),
  hasta: z.string().optional(),
  actual: z.boolean().default(false),
});

export const CreateEgresadoProfileSchema = z.object({
  nombres: z.string().min(2).max(150),
  apellidos: z.string().min(2).max(150),
  codigoEstudiante: z.string().max(50).optional(),
  carrera: z.string().min(2).max(200),
  anioEgreso: z.number().int().min(1990).max(new Date().getFullYear()),
  telefono: z.string().regex(/^\+?[0-9]{7,15}$/).optional(),
  ubicacion: z.string().max(200).optional(),
  resumenProfesional: z.string().max(2000).optional(),
  fotoUrl: z.string().url().optional().or(z.literal('')),
  cvUrl: z.string().url().optional().or(z.literal('')),
  habilidades: z.array(HabilidadSchema).max(30).optional(),
  experiencias: z.array(ExperienciaSchema).max(20).optional(),
  formacion: z.array(FormacionSchema).max(10).optional(),
  redesSociales: z.record(z.string().url()).optional(),
});

export const UpdateEgresadoProfileSchema = CreateEgresadoProfileSchema.partial();

export const EgresadoFilterSchema = PaginationSchema.extend({
  carrera: z.string().optional(),
  anioEgreso: z.number().int().optional(),
  habilidades: z.array(z.string()).optional(),
  ubicacion: z.string().optional(),
  search: z.string().max(200).optional(),
});

export type CreateEgresadoDto = z.infer<typeof CreateEgresadoProfileSchema>;
export type UpdateEgresadoDto = z.infer<typeof UpdateEgresadoProfileSchema>;
export type EgresadoFilter = z.infer<typeof EgresadoFilterSchema>;
