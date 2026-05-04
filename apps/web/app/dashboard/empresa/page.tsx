import { createServerTrpcClient } from '@/lib/trpc/server';
import { EmbudoConversionChart } from '@/components/dashboard/EvolucionChart';
import type { Metadata }         from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Users, TrendingUp, Calendar, Settings, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

import type { RouterOutputs } from '@/lib/trpc/router.types';

type EmpresaProfile = RouterOutputs['empresas']['getMyProfile'];
type OfertasRecientes = RouterOutputs['ofertas']['misOfertas']['data'];
type EmpresaResumen = RouterOutputs['analytics']['getResumenEmpresa'];

export const metadata: Metadata = { title: 'Dashboard Empresa' };

export default async function EmpresaDashboardPage() {
  const api = await createServerTrpcClient();

  const [perfilRes, ofertasRes, statsRes] = await Promise.allSettled([
    api.empresas.getMyProfile.query(),
    api.ofertas.misOfertas.query({ limit: 5 }),
    api.analytics.getResumenEmpresa.query(),
  ]);

  const empresaPerfil = perfilRes.status === 'fulfilled' ? perfilRes.value as EmpresaProfile : null;
  const ofertas       = ofertasRes.status === 'fulfilled' ? (ofertasRes.value as { data: OfertasRecientes }).data : [];
  const statsData     = statsRes.status === 'fulfilled' ? statsRes.value as EmpresaResumen : null;

  const kpis = [
    { label: 'Ofertas activas', value: statsData?.totalOfertasActivas ?? 0, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Postulaciones', value: statsData?.totalPostulaciones ?? 0, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'CTR Promedio', value: `${statsData?.ctrPromedio ?? 0}%`, icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Eficiencia', value: `${statsData?.tasaContratacion ?? 0}%`, icon: TrendingUp, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            {empresaPerfil?.razonSocial ?? 'Mi Empresa'}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-text-secondary font-medium">
              {empresaPerfil?.sector || 'Sector no definido'} · {empresaPerfil?.ubicacion || 'Ubicación no definida'}
            </p>
            {empresaPerfil?.verificada === true && (
              <Badge variant="success" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Empresa Verificada
              </Badge>
            )}
          </div>
        </div>
        <Link href="/dashboard/empresa/ofertas/nueva">
          <Button size="lg" className="shadow-lg shadow-primary-500/20 font-bold px-8">
            Crear nueva oferta
          </Button>
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k: any) => (
          <Card key={k.label} variant="elevated" className="border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{k.label}</p>
                  <p className="text-2xl font-black text-text-primary mt-1">{k.value}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", k.bg, k.color)}>
                  <k.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Ofertas recientes */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-text-primary">Ofertas Recientes</h2>
              <Link href="/dashboard/empresa/ofertas">
                <Button variant="ghost" size="sm" className="text-primary-600 font-bold gap-2">
                  Ver todas <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid gap-4">
              {ofertas.length === 0 ? (
                <Card variant="glass" className="border-dashed border-2 p-12 text-center">
                  <Briefcase className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-20" />
                  <p className="text-text-secondary font-medium">No tienes ofertas activas actualmente.</p>
                  <Link href="/dashboard/empresa/ofertas/nueva" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">Publicar mi primera oferta</Button>
                  </Link>
                </Card>
              ) : (
                ofertas.map((o: any) => (
                  <Card key={o.id} className="hover:shadow-xl hover:translate-x-1 transition-all duration-300 border-none bg-surface/50 backdrop-blur-sm">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-text-primary text-lg">{o.titulo}</h3>
                        <div className="flex items-center gap-4 text-xs font-bold text-text-muted mt-1 uppercase tracking-tighter">
                          <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {o.modalidad}</span>
                          <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {o.salarioMin ? `S/ ${o.salarioMin.toLocaleString('es-PE')}+` : 'Negociable'}</span>
                        </div>
                      </div>
                      <Link href={`/dashboard/empresa/ofertas/${o.id}`}>
                        <Button variant="secondary" size="sm" className="font-bold">Gestionar</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </section>

          {/* Gráfico de embudo */}
          {statsData && (
            <section className="space-y-4">
              <h2 className="text-xl font-black text-text-primary">Embudo de Reclutamiento</h2>
              <Card variant="elevated" className="overflow-hidden border-none shadow-xl">
                <CardContent className="pt-8 bg-surface/30">
                  <EmbudoConversionChart data={{
                    postulados: statsData.totalPostulados ?? 0,
                    enRevision: statsData.totalEnRevision ?? 0,
                    entrevista: statsData.totalEntrevistas ?? 0,
                    contratados: statsData.totalContratados ?? 0,
                    rechazados: statsData.totalRechazados ?? 0,
                    tasaConversion: statsData.tasaContratacion ?? 0
                  }} />
                </CardContent>
              </Card>
            </section>
          )}
        </div>

        {/* Sidebar de acciones */}
        <div className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-text-primary">Acceso Rápido</h2>
            <div className="grid gap-4">
              {[
                { label: 'Mis Publicaciones', icon: Briefcase, href: '/dashboard/empresa/ofertas', desc: 'Gestionar vacantes' },
                { label: 'Candidatos', icon: Users, href: '/dashboard/empresa/postulantes', desc: 'Revisar currículums' },
                { label: 'Configuración', icon: Settings, href: '/dashboard/empresa/perfil', desc: 'Perfil corporativo' },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <Card variant="elevated" className="hover:bg-primary-600 group transition-all duration-300 cursor-pointer border-none shadow-md overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-bg-base flex items-center justify-center group-hover:bg-white/20 transition-colors shadow-inner">
                        <item.icon className="h-6 w-6 text-text-secondary group-hover:text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-text-primary group-hover:text-white block">{item.label}</span>
                        <span className="text-[10px] font-medium text-text-muted group-hover:text-white/70 uppercase">{item.desc}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
          
          {/* Tip de Reclutamiento */}
          <Card variant="glass" className="bg-primary-900 text-white border-none p-6 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <Badge className="bg-white/20 text-white border-none">Pro Tip</Badge>
              <h4 className="font-black text-lg">Optimiza tus vacantes</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Las ofertas con rangos salariales visibles reciben un 40% más de postulaciones calificadas.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
