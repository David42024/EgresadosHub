import { Suspense }           from 'react';
import { createServerTrpcClient } from '@/lib/trpc/server';
import { KpiCard, SalaryStatsCard, CohorteTable } from '@/components/dashboard/KpiCard';
import { EvolucionChart, DemandaHabilidadesChart } from '@/components/dashboard/EvolucionChart';
import { ReportesPanel }   from '@/components/dashboard/ReportesPanel';
import { formatPct }       from '@/lib/utils';
import type { Metadata }   from 'next';
import type { RouterOutputs } from '@/lib/trpc/router.types';

// Solo los tipos que realmente se usan con anotación explícita
type AdminKpis           = RouterOutputs['analytics']['getAdminKpis'];
type EstadisticasCohorte = RouterOutputs['egresados']['getEstadisticasPorCohorte'];

export const metadata: Metadata = { title: 'Dashboard Administrador' };
export const revalidate = 300;

export default async function AdminDashboardPage() {
  const api = await createServerTrpcClient();

  const [kpisRes, evolucionRes, demandaRes, cohortesRes] = await Promise.allSettled([
    api.analytics.getAdminKpis.query(),
    api.analytics.getEvolucionMensual.query({ meses: 12 }),
    api.analytics.getDemandaHabilidades.query({ limit: 10 }),
    api.egresados.getEstadisticasPorCohorte.query({ limit: 10 }),
  ]);

  const kpisData: AdminKpis | null = kpisRes.status === 'fulfilled' ? kpisRes.value : null;
  const evolucionData = evolucionRes.status === 'fulfilled' ? evolucionRes.value : [];
  const demandaData = demandaRes.status === 'fulfilled' ? demandaRes.value : [];
  const cohortesData: EstadisticasCohorte = cohortesRes.status === 'fulfilled' ? cohortesRes.value : [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Panel de Control <span className="text-primary-600 italic">Estratégico</span>
          </h1>
          <p className="text-sm font-bold text-text-muted uppercase tracking-widest opacity-70">
            Monitor de rendimiento global y analítica predictiva
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-bg-base/50 border border-border/50 shadow-sm">
           <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
           <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">En Tiempo Real</span>
        </div>
      </div>

      {/* Indicadores Principales */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
           <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Métricas Fundamentales</h2>
           <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Total Egresados"
            value={kpisData !== null ? kpisData.totalEgresados.toLocaleString('es-PE') : '—'}
            variacion={kpisData?.variacionEgresados}
            icon="🎓"
            color="blue"
          />
          <KpiCard
            title="Ofertas Activas"
            value={kpisData !== null ? kpisData.totalOfertasActivas.toLocaleString('es-PE') : '—'}
            variacion={kpisData?.variacionOfertas}
            icon="💼"
            color="green"
          />
          <KpiCard
            title="Empresas Verificadas"
            value={kpisData !== null ? kpisData.totalEmpresas.toLocaleString('es-PE') : '—'}
            icon="🏢"
            color="purple"
          />
          <KpiCard
            title="Empleabilidad Global"
            value={kpisData !== null ? formatPct(kpisData.tasaEmpleabilidadGlobal) : '—'}
            icon="📊"
            color="amber"
            highlight
          />
        </div>
      </section>

      {kpisData !== null && (
        <section className="space-y-6">
           <div className="flex items-center gap-3">
             <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Análisis de Compensación</h2>
             <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
          </div>
          <SalaryStatsCard
            salarioPromedio={kpisData.salarioPromedioGlobal}
            salarioDesviacion={kpisData.salarioDesviacionGlobal}
          />
        </section>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Dinámica de Mercado</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <Suspense fallback={<div className="h-[400px] bg-bg-base/30 animate-pulse rounded-[2.5rem] border border-border/50"/>}>
              <EvolucionChart data={evolucionData} />
            </Suspense>
          </section>

          <section className="space-y-6">
             <div className="flex items-center gap-3">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Rendimiento Académico</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <Suspense fallback={<div className="h-64 bg-bg-base/30 animate-pulse rounded-[2.5rem] border border-border/50"/>}>
              <CohorteTable cohortes={cohortesData} />
            </Suspense>
          </section>
        </div>

        <div className="space-y-12">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Brecha de Skills</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <Suspense fallback={<div className="h-[400px] bg-bg-base/30 animate-pulse rounded-[2.5rem] border border-border/50"/>}>
              <DemandaHabilidadesChart data={demandaData} />
            </Suspense>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Centro de Reportes</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <ReportesPanel />
          </section>
        </div>
      </div>
    </div>
  );
}