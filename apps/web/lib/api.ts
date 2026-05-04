'use client';

import { createTRPCClient, httpBatchLink } from '@trpc/client';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length < 2) return null;
  return parts.pop()?.split(';').shift() ?? null;
}

function getTrpcUrl() {
  // Si estamos en el browser y no es localhost, usar proxy relativo
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return '/api/trpc';
  }
  // En desarrollo local, conectar directo al backend
  const base =
    process.env.NEXT_PUBLIC_API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://127.0.0.1:3001/api/v1';

  return `${base}/trpc`;
}

const trpcClient: any = createTRPCClient({
  links: [
    httpBatchLink({
      url: getTrpcUrl(),
      async headers() {
        const token = typeof window !== 'undefined'
          ? (getCookie('access_token') ?? window.localStorage.getItem('access_token'))
          : null;

        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

export const trpc = trpcClient;

export const authApi = {
  login: (email: string, password: string) =>
    trpcClient.auth.login.mutate({ email, password }),

  registerEgresado: (data: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
  }) =>
    trpcClient.auth.register.mutate({
      email: data.email,
      password: data.password,
      nombres: data.nombre,
      apellidos: data.apellido,
      role: 'EGRESADO',
    }),

  registerEmpresa: (data: {
    email: string;
    password: string;
    nombreComercial: string;
    razonSocial: string;
  }) =>
    trpcClient.auth.register.mutate({
      email: data.email,
      password: data.password,
      nombres: data.razonSocial || data.nombreComercial,
      apellidos: data.razonSocial || data.nombreComercial,
      role: 'EMPRESA',
    }),
};

export const egresadosApi = {
  update: (userId: string, data: unknown) =>
    trpcClient.egresados.updateProfile.mutate(data),

  agregarHabilidad: (userId: string, data: unknown) =>
    trpcClient.egresados.addHabilidad?.mutate?.(data) ?? Promise.resolve(null),
};

export const empresasApi = {
  update: (userId: string, data: unknown) =>
    trpcClient.empresas.updateProfile.mutate(data),
};

export const habilidadesApi = {
  list: async () => {
    // No hay router dedicado en el backend actual; devolver lista vacía.
    return [] as Array<{ id: string; nombre: string; tipo?: string }>;
  },
};
