// apps/web/lib/trpc/server.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { cookies } from 'next/headers';

// Cliente tRPC sin tipado estricto para evitar dependencia circular API ↔ Web
// FIXME: Implementar generación de tipos independiente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createServerTrpcClient(): Promise<any> {
  const cookieStore = await cookies();
  const internalUrl = process.env['API_INTERNAL_URL'] ?? 'http://localhost:3001';
  const apiUrl = `${internalUrl}/api/v1/trpc`;
  
  // eslint-disable-next-line no-console
  console.log(`[Server tRPC] Conectando a: ${apiUrl}`);

  return createTRPCProxyClient({
    links: [
      httpBatchLink({
        url: apiUrl,
        headers() {
          const token = cookieStore.get('access_token')?.value;
          return token !== undefined
            ? {
              authorization: `Bearer ${token}`,
              cookie: `access_token=${token}`,
            }
            : {};
        },
      }),
    ],
  });
}