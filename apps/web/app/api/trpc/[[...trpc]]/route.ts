import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  const apiHost =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_INTERNAL_URL ??
    'http://127.0.0.1:3001';
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  const url = new URL(req.url);
  
  // Reemplazamos el path local por el del backend
  const path = url.pathname.replace('/api/trpc', '');
  const searchParams = url.search;

  const targetUrl = `${apiHost}/${apiPrefix}/trpc${path}${searchParams}`;

  const headers = new Headers(req.headers);
  // Importante: No reenviar el host original para evitar problemas de SSL/CORS en el backend
  headers.delete('host');

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method === 'POST' ? await req.blob() : undefined,
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    // Eliminar headers que puedan causar conflictos con el streaming de Next.js
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('TRPC Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to proxy request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
