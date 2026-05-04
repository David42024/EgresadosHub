import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  // IMPORTANTE: En producción, API_INTERNAL_URL debe apuntar a la URL interna del backend (ej: http://api:8080)
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
  
  // eslint-disable-next-line no-console
  console.log(`[TRPC Proxy] ${req.method} ${url.pathname} → ${targetUrl}`);

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('connection');

  try {
    const body = req.method === 'POST' ? await req.arrayBuffer() : undefined;
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('TRPC Proxy Error:', error);
    
    // Devolver un error en formato tRPC para que el cliente no falle con "json fallido"
    return new Response(
      JSON.stringify({
        error: {
          message: 'Error de conexión con el backend',
          code: -32603,
          data: { code: 'INTERNAL_SERVER_ERROR', httpStatus: 500 }
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
