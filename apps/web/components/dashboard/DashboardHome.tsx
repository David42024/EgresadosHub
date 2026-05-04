'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { formatPct } from '@/lib/utils';
import {
  Briefcase, Users, UserCircle, LineChart, Search, ClipboardList,
  Building2, GraduationCap, FileText, ArrowRight, Loader2, MapPin
} from 'lucide-react';

interface DashboardHomeProps {
  user: { email: string; role: string; avatarUrl?: string };
}

export function DashboardHome({ user }: DashboardHomeProps) {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');

    setCurrentDate(new Intl.DateTimeFormat('es-PE', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    }).format(new Date()));
  }, []);

  if (user.role === 'EGRESADO') return <EgresadoHome user={user} greeting={greeting} />;
  if (user.role === 'EMPRESA') return <EmpresaHome user={user} greeting={greeting} />;
  if (user.role === 'ADMINISTRADOR') return <AdminHome user={user} currentDate={currentDate} />;

  return null;
}

function EgresadoHome({ user, greeting }: { user: DashboardHomeProps['user']; greeting: string }) {
  const { data: profile, isLoading: loadingProfile } = (trpc as any).egresados.getMyProfile.useQuery() as any;
  const { data: stats, isLoading: loadingStats } = (trpc as any).egresados.getMisEstadisticas.useQuery() as any;
  const { data: ofertasRes, isLoading: loadingOfertas } = (trpc as any).ofertas.list.useQuery({ limit: 3 }) as any;

  if (loadingProfile || loadingStats || loadingOfertas) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  }

  const nombres = profile?.nombres ?? user.email.split('@')[0];
  const fotoUrl = profile?.fotoUrl ?? user.avatarUrl ?? '';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-900 dark:to-gray-950 p-8 sm:p-10 border border-white/20 shadow-xl shadow-blue-500/5">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 to-primary-600 opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-primary-100 flex items-center justify-center">
              {fotoUrl !== '' ? (
                <img src={fotoUrl} alt={nombres} className="h-full w-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-primary-600">{nombres[0].toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="text-center sm:text-left mt-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
              {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-primary-500">{nombres}</span>
            </h1>
            <p className="mt-2 text-base font-medium text-gray-600 dark:text-gray-400">
              Aquí está tu resumen de actividad de hoy
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Postulaciones activas', value: stats?.totalPostulaciones ?? 0 },
          { label: 'Entrevistas obtenidas', value: stats?.totalEntrevistas ?? 0 },
          { label: 'Tasa de respuesta', value: formatPct(stats?.tasaRespuesta ?? 0) },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center sm:items-start p-2">
            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Acceso rápido */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { href: '/dashboard/egresado/ofertas', label: 'Buscar Ofertas', icon: Search, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
            { href: '/dashboard/egresado/postulaciones', label: 'Mis Postulaciones', icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/40' },
            { href: '/dashboard/egresado/perfil', label: 'Mi Perfil', icon: UserCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/40' },
            { href: '/dashboard/egresado/estadisticas', label: 'Mis Estadísticas', icon: LineChart, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <Card className="h-full border border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-300 group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <item.icon className={`h-7 w-7 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.label}</h3>
                    <p className="text-sm text-gray-500 font-medium group-hover:text-primary-600 transition-colors flex items-center gap-1">
                      Acceder <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recomendadas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recomendadas</h2>
          </div>
          <div className="space-y-3">
            {ofertasRes?.data?.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay ofertas destacadas.</p>
            ) : (
              ofertasRes?.data?.map((oferta: any) => (
                <Link key={oferta.id} href={`/dashboard/egresado/ofertas/${oferta.id}`}>
                  <Card className="border border-white/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:border-primary-200 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">{oferta.titulo}</h4>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{oferta.empresa?.razonSocial}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{oferta.modalidad}</Badge>
                        {oferta.salarioMin && <span className="text-xs font-bold text-green-600 dark:text-green-400">S/ {oferta.salarioMin}</span>}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmpresaHome({ user, greeting }: { user: DashboardHomeProps['user']; greeting: string }) {
  const { data: profile, isLoading: loadingProfile } = (trpc as any).empresas.getMyProfile.useQuery() as any;
  const { data: stats, isLoading: loadingStats } = (trpc as any).analytics.getResumenEmpresa.useQuery() as any;

  if (loadingProfile || loadingStats) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  }

  const razonSocial = profile?.razonSocial ?? user.email.split('@')[0];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-gray-950 p-8 sm:p-10 border border-white/20 shadow-xl shadow-indigo-500/5">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            {profile?.verificada && (
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 border-none px-3 py-1 font-bold">✓ Cuenta Verificada</Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {greeting}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">{razonSocial}</span>
          </h1>
          <p className="mt-2 text-base font-medium text-gray-600 dark:text-gray-400">
            Resumen de tu actividad de reclutamiento
          </p>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Ofertas activas', value: stats?.totalOfertasActivas ?? 0 },
          { label: 'Nuevos postulantes hoy', value: stats?.postulacionesHoy ?? 0 },
          { label: 'Tasa de conversión', value: `${stats?.tasaContratacion ?? 0}%` },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center sm:items-start p-2">
            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/empresa/ofertas', label: 'Mis Ofertas', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
          { href: '/dashboard/empresa/ofertas/nueva', label: 'Nueva Oferta', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
          { href: '/dashboard/empresa/postulantes', label: 'Postulantes', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/40' },
          { href: '/dashboard/empresa/analytics', label: 'Analytics', icon: LineChart, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/40' },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="h-full border border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className={`h-16 w-16 rounded-2xl ${item.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.label}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AdminHome({ user, currentDate }: { user: DashboardHomeProps['user']; currentDate: string }) {
  const { data: kpis, isLoading, error } = (trpc as any).analytics.getAdminKpis.useQuery() as any;

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary-500" /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30">
        <p className="text-red-600 dark:text-red-400 font-bold mb-2">Error cargando estadísticas</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Hubo un problema al conectar con el servidor.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => window.location.reload()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-gray-950 p-8 sm:p-10 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Panel de Control
          </h1>
          <p className="mt-2 text-base font-medium text-gray-400 capitalize">
            {currentDate}
          </p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <LineChart className="w-64 h-64 -mt-10 -mr-10 text-white" />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Egresados', value: kpis?.totalEgresados ?? 0 },
          { label: 'Total Empresas', value: kpis?.totalEmpresas ?? 0 },
          { label: 'Ofertas Activas', value: kpis?.totalOfertasActivas ?? 0 },
          { label: 'Postulaciones', value: kpis?.totalPostulacionesMes ?? 0 },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center sm:items-start p-2">
            <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Acceso rápido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/dashboard/admin/egresados', label: 'Egresados', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/40' },
          { href: '/dashboard/admin/empresas', label: 'Empresas', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/40' },
          { href: '/dashboard/admin/ofertas', label: 'Ofertas', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
          { href: '/dashboard/admin/analytics', label: 'Analytics', icon: LineChart, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/40' },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="h-full border border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{item.label}</h3>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
