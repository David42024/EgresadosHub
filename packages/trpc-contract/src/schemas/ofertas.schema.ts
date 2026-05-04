import { z } from 'zod';
import { PaginationSchema } from './common.schema';

// ─── Enumeradores del dominio ────────────────────────────────────────────────

export enum EstadoOferta {
  BORRADOR  = 'BORRADOR',
  ACTIVA    = 'ACTIVA',
  PAUSADA   = 'PAUSADA',
  CERRADA   = 'CERRADA',
}

export enum Modalidad {
  PRESENCIAL = 'PRESENCIAL',
  REMOTO     = 'REMOTO',
  HIBRIDO    = 'HIBRIDO',
}

// ─── Schemas de Ofertas ───────────────────────────────────────────────────────

export const CreateOfertaBaseSchema = z.object({
  titulo:         z.string().min(5).max(200),
  descripcion:    z.string().min(50).max(5000),
  requisitos:     z.string().max(3000).optional(),
  beneficios:     z.string().max(2000).optional(),
  salarioMin:     z.number().min(1),
  salarioMax:     z.number().min(1),
  modalidad:      z.nativeEnum(Modalidad),
  ubicacion:      z.string().max(200),
  experienciaMin: z.number().int().min(0).max(30).optional(),
  habilidadesReq: z.array(z.string()).max(20),
  cierraAt:       z.string().datetime().optional(),
  estado:         z.nativeEnum(EstadoOferta).optional(),
});

export const CreateOfertaSchema = CreateOfertaBaseSchema.refine(
  (d) => d.salarioMin === undefined || d.salarioMax === undefined || d.salarioMax >= d.salarioMin,
  { message: 'salarioMax debe ser >= salarioMin', path: ['salarioMax'] },
);

export const UpdateOfertaSchema = CreateOfertaBaseSchema.partial().refine(
  (d) => d.salarioMin === undefined || d.salarioMax === undefined || d.salarioMax >= d.salarioMin,
  { message: 'salarioMax debe ser >= salarioMin', path: ['salarioMax'] },
);

export const OfertaFilterSchema = PaginationSchema.extend({
  modalidad:   z.nativeEnum(Modalidad).optional(),
  ubicacion:   z.string().optional(),
  salarioMin:  z.number().optional(),
  salarioMax:  z.number().optional(),
  habilidades: z.array(z.string()).optional(),
  search:      z.string().optional(),
  estado:      z.nativeEnum(EstadoOferta).optional(),
});

export type CreateOfertaDto = z.infer<typeof CreateOfertaSchema>;
export type UpdateOfertaDto = z.infer<typeof UpdateOfertaSchema>;
export type OfertaFilter = z.infer<typeof OfertaFilterSchema>;
