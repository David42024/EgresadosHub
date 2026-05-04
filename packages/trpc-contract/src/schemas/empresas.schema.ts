import { z } from 'zod';

import { PaginationSchema } from './common.schema';

// ─── Schemas de Empresas ──────────────────────────────────────────────────────

export const CreateEmpresaProfileSchema = z.object({
  razonSocial: z.string().min(2).max(300),
  ruc:         z.string().regex(/^[0-9]{11}$/, 'RUC debe tener 11 dígitos'),
  sector:      z.string().max(100),
  ubicacion:   z.string().max(200),
  descripcion: z.string().max(2000).optional(),
  sitioWeb:    z.string().url().optional(),
  logoUrl:     z.string().url().optional(),
});

export const EmpresaFilterSchema = PaginationSchema.extend({
  sector:     z.string().optional(),
  verificada: z.boolean().optional(),
  search:     z.string().optional(),  // ← agregar
});

export type CreateEmpresaDto = z.infer<typeof CreateEmpresaProfileSchema>;
