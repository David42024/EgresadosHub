import { z } from 'zod';

// ─── Schemas de Analytics ────────────────────────────────────────────────────

export const AnalyticsFilterSchema = z.object({
  fechaDesde: z.string().datetime().optional(),
  fechaHasta: z.string().datetime().optional(),
  carrera:    z.string().optional(),
  anioEgreso: z.number().int().optional(),
  sector:     z.string().optional(),
  ubicacion:  z.string().optional(),
}).catchall(z.any());

export type AnalyticsFilter = z.infer<typeof AnalyticsFilterSchema>;
