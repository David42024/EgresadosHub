import { z } from 'zod';
import { AnalyticsFilterSchema } from './analytics.schema';

// ─── Schemas de Reportes ──────────────────────────────────────────────────────

export const TipoReporteSchema = z.enum([
  'LISTADO_EGRESADOS',
  'LISTADO_OFERTAS',
  'HISTORIAL_POSTULACIONES',
  'EMPLEABILIDAD_COHORTE',
  'DEMANDA_LABORAL',
  'COMPARATIVO_CARRERAS',
]);

export const GenerarReporteSchema = z.object({
  tipo:      TipoReporteSchema,
  filtros:   AnalyticsFilterSchema.optional(),
  formato:   z.enum(['PDF', 'CSV']).default('PDF'),
  asincrono: z.boolean().default(false),
});

export type GenerarReporteDto = z.infer<typeof GenerarReporteSchema>;
export type TipoReporte = z.infer<typeof TipoReporteSchema>;
