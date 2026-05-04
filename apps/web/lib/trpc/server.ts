// apps/web/lib/trpc/server.ts
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { cookies } from 'next/headers';
import type { TAppRouter } from './router.types';

export async function createServerTrpcClient() {
  const cookieStore = await cookies();

  return createTRPCProxyClient<TAppRouter>({
    links: [
      httpBatchLink({
        url: `${process.env['API_INTERNAL_URL'] ?? 'http://127.0.0.1:3001'}/api/v1/trpc`,
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