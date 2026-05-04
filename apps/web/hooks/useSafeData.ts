import { useMemo } from 'react';

/**
 * Hook para validar que los datos recibidos (ej. de una API) contienen
 * las propiedades críticas necesarias antes de proceder con el renderizado.
 * 
 * @param data El objeto a validar
 * @param criticalKeys Las llaves que DEBEN estar presentes y no ser null/undefined
 * @returns { isSafe: boolean, safeData: T | null }
 */
export function useSafeData<T extends object>(
  data: T | null | undefined,
  criticalKeys: (keyof T)[]
) {
  return useMemo(() => {
    if (!data) return { isSafe: false, safeData: null };

    const isSafe = criticalKeys.every((key) => {
      const value = data[key];
      return value !== undefined && value !== null;
    });

    return {
      isSafe,
      safeData: isSafe ? data : null,
    };
  }, [data, criticalKeys]);
}
