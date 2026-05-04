import { z } from 'zod';
import { Role } from './role.schema';

// ─── Schemas de Auth ─────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const RegisterSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(8).max(72),
  nombres:   z.string().min(2).max(100),
  apellidos: z.string().min(2).max(100),
  role:      z.nativeEnum(Role).default(Role.EGRESADO),
});

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  user: z.object({
    id:     z.string().uuid(),
    email:  z.string().email(),
    role:   z.nativeEnum(Role),
    nombre: z.string(),
  }),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
