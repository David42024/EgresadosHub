/**
 * Re-exportación del tipo TAppRouter para consumo desde el frontend.
 * Usa @repo/trpc-contract que exporta los tipos compartidos entre API y Web.
 */
export type { TAppRouter, RouterInputs, RouterOutputs } from '@repo/trpc-contract';
