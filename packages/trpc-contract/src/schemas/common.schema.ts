import { z } from 'zod';

// ─── Schemas de paginación ────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  skip:   z.coerce.number().int().min(0).default(0).optional(),
  limit:  z.coerce.number().int().min(1).max(100).default(20).optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data:       z.array(itemSchema),
    nextCursor: z.string().uuid().nullable(),
    total:      z.number().int(),
  });

export type Paginacion = z.infer<typeof PaginationSchema>;
