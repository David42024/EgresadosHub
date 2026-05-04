'use client';

import { EmbudoConversionChart } from '@/components/dashboard/EvolucionChart';
import { formatPct }             from '@/lib/utils';
import Link                      from 'next/link';
import { Button }                from '@/components/ui/button';
import { trpc }                  from '@/lib/trpc/client';

export default function EgresadoDashboardPage() {
  const {
    data: profileData,
    isLoading: loadingProfile,
  } = (trpc as any).egresados.getMyProfile.useQuery(undefined, {
    retry: false,
  }) as { data: any; isLoading: boolean };

  const {
    data: statsData,
    isLoading: loadingStats,
  } = (trpc as any).egresados.getMisEstadisticas.useQuery(undefined, {
    retry: false,
  }) as { data: any; isLoading: boolean };

  // ─── Loading state ───────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
        <div className="h-10 bg-gray-100 dark:bg-gray-900 rounded-xl w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-900 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded-2xl" />
      </div>
    );
  }

  // ─── Helpers seguros ─────────────────────────────────────────────────────
  const hasProfile   = profileData != null;
  const habilidades  = profileData?.habilidades  ?? [];
  const hasStats     = statsData   != null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {hasProfile
              ? `Hola, ${profileData.nombres ?? profileData.nombre ?? 'Egresado'} 👋`
              : 'Mi dashboard'}
          </h1>
          {hasProfile && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {profileData.carrera ?? '—'} · Egresado {profileData.anioEgreso ?? '—'}
            </p>
          )}
        </div>
        {!hasProfile && (
          <Link href="/dashboard/egresado/perfil">
            <Button>Completar perfil</Button>
          </Link>
        )}
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────────────── */}
      {hasStats && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Mis estadísticas de postulación
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Postulaciones enviadas', value: statsData.totalPostulaciones ?? 0, icon: '📤' },
              { label: 'Entrevistas obtenidas',  value: statsData.totalEntrevistas   ?? 0, icon: '🤝' },
              { label: 'Ofertas recibidas',       value: statsData.totalOfertas       ?? 0, icon: '✅' },
              { label: 'Tasa de respuesta',        value: formatPct(statsData.tasaRespuesta ?? 0), icon: '📊' },
            ].map((k) => (
              <div
                key={k.label}
                className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-shadow hover:shadow-md dark:hover:shadow-gray-900/50"
              >
                <div className="text-2xl mb-2">{k.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{k.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{k.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* ── Habilidades ──────────────────────────────────────────────── */}
          {habilidades.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Mis habilidades</h2>
              <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  {habilidades.map((h: any, i: number) => (
                    <span
                      key={i}
                      className={`text-xs font-medium px-3 py-1.5 rounded-full ${
                        h.categoria === 'TECNICA' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'   :
                        h.categoria === 'BLANDA'  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        h.categoria === 'IDIOMA'  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {h.nombre ?? h.habilidad?.nombre ?? '—'}
                      {(h.nivel ?? 0) > 0 && (
                        <span className="ml-1 opacity-60">{'★'.repeat(h.nivel)}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Si no hay habilidades, mostrar CTA para agregarlas */}
          {hasProfile && habilidades.length === 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Mis habilidades</h2>
              <div className="rounded-2xl border border-dashed dark:border-gray-600 bg-white dark:bg-gray-800 p-8 text-center shadow-sm">
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">
                  Aún no has agregado habilidades a tu perfil.
                </p>
                <Link href="/dashboard/egresado/perfil">
                  <Button variant="outline" size="sm">Agregar habilidades</Button>
                </Link>
              </div>
            </section>
          )}

          {/* ── Embudo de conversión ─────────────────────────────────────── */}
          {hasStats && (
            <section>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Estado de mis postulaciones
              </h2>
              <EmbudoConversionChart
                data={{
                  postulados:     statsData.totalPostulaciones ?? 0,
                  enRevision:     statsData.totalEnRevision    ?? 0,
                  entrevista:     statsData.totalEntrevistas   ?? 0,
                  contratados:    statsData.totalOfertas       ?? 0,
                  rechazados:     0,
                  tasaConversion: statsData.tasaRespuesta      ?? 0,
                }}
              />
            </section>
          )}
        </div>

        {/* ── Accesos rápidos ──────────────────────────────────────────────── */}
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Acciones rápidas</h2>
            <div className="space-y-4">
              {[
                {
                  href:  '/dashboard/egresado/ofertas',
                  label: 'Buscar ofertas',
                  desc:  'Encuentra oportunidades que coincidan con tu perfil',
                  icon:  '🔍',
                },
                {
                  href:  '/dashboard/egresado/postulaciones',
                  label: 'Ver mis postulaciones',
                  desc:  'Revisa el estado de todas tus postulaciones activas',
                  icon:  '📋',
                },
                {
                  href:  '/dashboard/egresado/perfil',
                  label: 'Editar mi perfil',
                  desc:  'Actualiza tus habilidades, experiencia y formación',
                  icon:  '✏️',
                },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow block group"
                >
                  <div className="text-2xl mb-3">{a.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {a.label}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}