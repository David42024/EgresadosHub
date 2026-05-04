import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número como moneda peruana */
export function formatCurrency(value: number | null | undefined, compact = false): string {
  if (value == null) return '—';
  return new Intl.NumberFormat('es-PE', {
    style:    'currency',
    currency: 'PEN',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value);
}

/** Formatea un porcentaje */
export function formatPct(value: number | null | undefined, decimals = 1): string {
  if (value == null) return '—';
  return `${value.toFixed(decimals)}%`;
}

/** Formatea una fecha en español */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date));
}

/** Calcula la variación porcentual entre dos valores */
export function calcVariacion(actual: number, anterior: number): {
  valor: number;
  signo: '+' | '-' | '';
  positivo: boolean;
} {
  if (anterior === 0) return { valor: 0, signo: '', positivo: true };
  const diff = ((actual - anterior) / anterior) * 100;
  return {
    valor:    Math.abs(diff),
    signo:    diff >= 0 ? '+' : '-',
    positivo: diff >= 0,
  };
}