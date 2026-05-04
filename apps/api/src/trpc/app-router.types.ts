/**
 * Tipos públicos del AppRouter para consumo desde el frontend.
 * Este archivo no importa código de NestJS, solo tipos de tRPC.
 */
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import type { TAppRouter as RealAppRouter } from './app.router';

// Tipo del router de la aplicación
export type TAppRouter = RealAppRouter;

// Tipos de utilidad para inputs y outputs
export type RouterInputs = inferRouterInputs<TAppRouter>;
export type RouterOutputs = inferRouterOutputs<TAppRouter>;
