// Contexto mínimo exportable — sin dependencias de Express
export interface AppContext {
  userId: string | null;
  role:   'ADMINISTRADOR' | 'EGRESADO' | 'EMPRESA' | null;
}