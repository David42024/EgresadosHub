import { redirect } from 'next/navigation';
import { createServerTrpcClient } from '@/lib/trpc/server';

export default async function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const api = await createServerTrpcClient();
    const user = await (api as any).auth.me.query();

    if (user?.role !== 'EMPRESA') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/auth/login');
  }

  return <>{children}</>;
}
