import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Sidebar } from '@/components/shared/Sidebar';
import { Topbar }  from '@/components/shared/Topbar';
import { createServerTrpcClient } from '@/lib/trpc/server';
import { clearAuthCookie } from './actions';

// ─── Tipo local para el usuario (sin depender de RouterOutputs) ───────────────
interface User {
  id: string;
  email: string;
  role: string;
  egresado?: any;
  empresa?: any;
  administrador?: any;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ─── 1. Verificar que existe la cookie ──────────────────────────────────────
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('access_token');

  if (!tokenCookie?.value) {
    redirect('/auth/login');
  }

  const token = tokenCookie.value;

  // ─── 2. Obtener datos del usuario via tRPC (SSR) ────────────────────────────
  let user: User | null = null;

  try {
    const api = await createServerTrpcClient();
    user = await api.auth.me.query();
  } catch (e) {
    // Si auth.me falla, redirigir (sin borrar cookie para evitar loops por fallos transitorios)
    redirect('/auth/login');
  }

  if (!user) {
    redirect('/auth/login');
  }

  // ─── 3. Renderizar layout con usuario verificado ─────────────────────────────
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden transition-colors duration-200">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="mx-auto max-w-screen-2xl h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}