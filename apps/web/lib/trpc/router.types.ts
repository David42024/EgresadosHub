/**
 * Re-exportación del tipo TAppRouter para consumo desde el frontend.
 * Importa desde archivo de tipos limpio que no incluye métodos del servicio NestJS.
 */
import type { TAppRouter as RealAppRouter, RouterInputs as RealRouterInputs, RouterOutputs as RealRouterOutputs } from '../../../../api/src/trpc/app-router.types';

export type TAppRouter = RealAppRouter;
export type RouterInputs = RealRouterInputs;
export type RouterOutputs = RealRouterOutputs;
