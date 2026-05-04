import { redirect } from 'next/navigation';
import { createServerTrpcClient } from '@/lib/trpc/server';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  try {
    const api = await createServerTrpcClient();
    const user = await (api as any).auth.me.query();

    if (!user) {
      redirect('/auth/login');
    }

    return <DashboardHome user={user} />;
  } catch {
    redirect('/auth/login');
  }
}
