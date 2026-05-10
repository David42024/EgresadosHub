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

/**
 * Parsea una fecha límite de forma segura, evitando el bug de zona horaria.
 * - Si es un string date-only "YYYY-MM-DD" → parsea en hora local (noon) para evitar el -1 día UTC.
 * - Si ya es un ISO timestamp completo o un Date → lo usa directamente.
 * Retorna null si el valor está vacío o es inválido.
 */
export function parseFechaLimite(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  // Detectar si es solo "YYYY-MM-DD" (sin hora)
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0); // noon local para evitar UTC offset
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
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

/**
 * Convierte un string base64 a un Blob PDF y dispara la descarga en el navegador.
 */
export function descargarBase64ComoPdf(base64: string, filename: string) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Limpiar después de la descarga
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}