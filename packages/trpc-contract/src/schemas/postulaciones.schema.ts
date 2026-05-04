// packages/trpc-contract/src/schemas/postulaciones.schema.ts
import { z } from 'zod';

export enum EstadoPostulacion {
  POSTULADO    = 'POSTULADO',
  EN_REVISION  = 'EN_REVISION',
  ENTREVISTA   = 'ENTREVISTA',
  CONTRATADO   = 'CONTRATADO',
  RECHAZADO    = 'RECHAZADO',
}

/** Transiciones válidas del flujo — única fuente de verdad */
export const TRANSICIONES_VALIDAS: Record<EstadoPostulacion, EstadoPostulacion[]> = {
  [EstadoPostulacion.POSTULADO]:   [EstadoPostulacion.EN_REVISION, EstadoPostulacion.ENTREVISTA, EstadoPostulacion.RECHAZADO, EstadoPostulacion.CONTRATADO],
  [EstadoPostulacion.EN_REVISION]: [EstadoPostulacion.ENTREVISTA, EstadoPostulacion.CONTRATADO, EstadoPostulacion.RECHAZADO],
  [EstadoPostulacion.ENTREVISTA]:  [EstadoPostulacion.CONTRATADO, EstadoPostulacion.RECHAZADO, EstadoPostulacion.EN_REVISION],
  [EstadoPostulacion.CONTRATADO]:  [EstadoPostulacion.RECHAZADO], // Permitir anular contrato
  [EstadoPostulacion.RECHAZADO]:   [EstadoPostulacion.EN_REVISION, EstadoPostulacion.ENTREVISTA], // Permitir reconsiderar
};

export const CambiarEstadoSchema = z.object({
  postulacionId: z.string().uuid(),
  nuevoEstado:   z.nativeEnum(EstadoPostulacion),
  comentario:    z.string().max(500).optional(),
});

export const CreatePostulacionSchema = z.object({
  ofertaId:          z.string().uuid(),
  cartaPresentacion: z.string().max(2000).optional(),
});

export type CambiarEstadoDto = z.infer<typeof CambiarEstadoSchema>;
export type CreatePostulacionDto = z.infer<typeof CreatePostulacionSchema>;