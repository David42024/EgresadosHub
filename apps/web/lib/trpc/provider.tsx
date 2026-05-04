// apps/web/lib/trpc/provider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState, type ReactNode } from 'react';
import { trpc } from './client';

let browserQueryClient: QueryClient | undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Servidor: siempre instancia nueva (no compartir estado entre requests)
    return makeQueryClient();
  }
  // Cliente: reutilizar la misma instancia para mantener la caché
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TrpcProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
  (trpc as any).createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        // ✅ En lugar de fetch personalizado, usa headers
        // Las cookies HttpOnly se envían automáticamente con credentials
        // cuando el servidor las setea correctamente
        headers() {
          return {};
        },
      }),
    ],
  }),
);

  return (
    // ✅ Usando "as any" para evitar errores de tipo con el router
    ((trpc as any).Provider as React.FC<{ client: any; queryClient: any; children: React.ReactNode }>)({
      client: trpcClient,
      queryClient: queryClient,
      children: (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      )
    })
  );
}