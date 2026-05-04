import type { AnyRouter, inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Placeholder — el tipo real se sobreescribe en el frontend via tsconfig paths
export type TAppRouter    = AnyRouter;
export type RouterInputs  = inferRouterInputs<TAppRouter>;
export type RouterOutputs = inferRouterOutputs<TAppRouter>;