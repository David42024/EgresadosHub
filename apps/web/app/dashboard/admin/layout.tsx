import { redirect } from 'next/navigation';
import { createServerTrpcClient } from '@/lib/trpc/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const api = await createServerTrpcClient();
    const user = await api.auth.me.query();

    if (user?.role !== 'ADMINISTRADOR') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
