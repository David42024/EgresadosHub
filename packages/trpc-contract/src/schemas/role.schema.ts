export const Role = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  EGRESADO:      'EGRESADO',
  EMPRESA:       'EMPRESA',
} as const;

export type Role = typeof Role[keyof typeof Role];