import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  const allowed = ['avatar', 'logo', 'cv'];

  if (!allowed.includes(type)) {
    return NextResponse.json({ message: 'Tipo no permitido' }, { status: 400 });
  }

  // Reenviar el body al backend como FormData para manejar correctamente los boundaries de multipart
  let body: any;
  const headers = new Headers();

  // Reenviar la cookie de autenticación al backend
  const cookie = req.cookies.get('access_token');
  if (cookie !== undefined) {
    headers.set('cookie', `access_token=${cookie.value}`);
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      body = await req.formData();
      // No seteamos content-type manualmente para multipart, fetch lo hará con el boundary correcto
    } else {
      body = await req.blob();
      if (contentType) headers.set('content-type', contentType);
    }

    const res = await fetch(`${API_URL}/api/v1/upload/${type}`, {
      method: 'POST',
      headers,
      body,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error interno en el proxy' }, { status: 500 });
  }
}
