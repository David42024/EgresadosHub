'use client';

import { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/components/ui/use-toast';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  Target,
  Download,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalyticsPage() {
  const [meses, setMeses] = useState(12);
  const { data: kpis } = (trpc as any).analytics.getAdminKpis.useQuery() as any;
  const { data: demanda, isLoading: demandaLoading } = (trpc as any).analytics.getDemandaHabilidades.useQuery({ limit: 20 }) as any;
  const { data: evolucion, isLoading: evolucionLoading } = (trpc as any).analytics.getEvolucionMensual.useQuery({ meses }) as any;
  const { data: sectores, isLoading: sectoresLoading } = (trpc as any).analytics.getEmpresasPorSector.useQuery() as any;

  const generarReporte = (trpc as any).reportes.generar.useMutation() as any;

  const sectoresChart = useMemo(() => {
    if (!sectores || sectores.length === 0) return [];
    const top5 = sectores.slice(0, 5);
    const resto = sectores.slice(5);
    if (resto.length > 0) {
      const restoTotal = resto.reduce((sum: number, s: any) => sum + s.total, 0);
      return [...top5, { sector: 'Otros', total: restoTotal }];
    }
    return top5;
  }, [sectores]);

  const [downloadingJobId, setDownloadingJobId] = useState<string | null>(null);
  const { data: jobStatus } = (trpc as any).reportes.estado.useQuery(
    { jobId: downloadingJobId! },
    { enabled: !!downloadingJobId, refetchInterval: (data: any) => data?.estado === 'COMPLETADO' ? false : 2000 }
  ) as any;

  useEffect(() => {
    if (jobStatus?.estado === 'COMPLETADO' && jobStatus?.pdfDisponible) {
      // Descargar el PDF via base64
      (trpc as any).reportes.descargar.query({ jobId: downloadingJobId })
        .then((result: any) => {
          if (result?.base64) {
            const byteChars = atob(result.base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) {
              byteNumbers[i] = byteChars.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = result.filename || 'reporte.pdf';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
          }
          setDownloadingJobId(null);
          toast({ title: 'Reporte listo', description: 'El PDF se ha descargado correctamente.' });
        })
        .catch(() => {
          setDownloadingJobId(null);
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo descargar el PDF.' });
        });
    } else if (jobStatus?.estado === 'ERROR') {
      setDownloadingJobId(null);
      toast({ variant: 'destructive', title: 'Error', description: jobStatus.error || 'Falló la generación del reporte.' });
    }
  }, [jobStatus]);

  const handleDownload = () => {
    generarReporte.mutate(
      { tipo: 'DEMANDA_LABORAL', formato: 'PDF', asincrono: true },
      {
        onSuccess: (data: any) => {
          setDownloadingJobId(data.jobId);
          toast({ title: 'Generando reporte...', description: 'Se descargará automáticamente cuando esté listo.' });
        },
        onError: () => {
          toast({ variant: 'destructive', title: 'Error', description: 'No se pudo iniciar la generación del reporte.' });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Análisis de Datos" 
        description="Métricas estratégicas sobre la empleabilidad y el mercado laboral."
      >
        <div className="flex gap-2">
          <Select value={String(meses)} onValueChange={(v) => setMeses(Number(v))}>
            <SelectTrigger className="w-40 h-9 rounded-xl bg-surface/60 border-none font-bold shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6 meses</SelectItem>
              <SelectItem value="12">12 meses</SelectItem>
              <SelectItem value="24">24 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="primary" size="sm" className="gap-2" onClick={handleDownload} disabled={generarReporte.isLoading}>
            <Download className="h-4 w-4" />
            Descargar Reporte
          </Button>
        </div>
      </PageHeader>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Tasa de Empleabilidad" 
          value={`${kpis?.tasaEmpleabilidadGlobal ?? 0}%`} 
          icon={Target} 
          trend={{ value: kpis?.tasaEmpleabilidadGlobal ?? 0, isUp: (kpis?.tasaEmpleabilidadGlobal ?? 0) > 0 }}
          description="Egresados con trabajo"
        />
        <StatsCard 
          title="Salario Promedio" 
          value={`S/ ${kpis?.salarioPromedioGlobal?.toLocaleString() ?? 0}`} 
          icon={DollarSign} 
          description="Ofertas activas"
        />
        <StatsCard 
          title="Crecimiento Egresados" 
          value={`${kpis?.variacionEgresados ?? 0}%`} 
          icon={TrendingUp} 
          trend={{ value: kpis?.variacionEgresados ?? 0, isUp: (kpis?.variacionEgresados ?? 0) > 0 }}
          description="Vs. mes anterior"
        />
        <StatsCard 
          title="Ofertas Activas" 
          value={kpis?.totalOfertasActivas ?? 0} 
          icon={Briefcase} 
          trend={{ value: kpis?.variacionOfertas ?? 0, isUp: (kpis?.variacionOfertas ?? 0) > 0 }}
          description="Oportunidades hoy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolución Mensual */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evolución de Ofertas y Postulaciones</CardTitle>
                <CardDescription>Comparativa mensual del flujo de la plataforma</CardDescription>
              </div>
              <span className="text-xs text-text-muted font-bold">{meses} meses</span>
            </div>
          </CardHeader>
          <CardContent className="h-[350px]">
            {evolucionLoading ? (
              <Skeleton className="w-full h-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucion}>
                  <defs>
                    <linearGradient id="colorOfertas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPostulaciones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-surface)', 
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ofertas" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorOfertas)" 
                    name="Ofertas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="postulaciones" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPostulaciones)" 
                    name="Postulaciones"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribución por Sector */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Empresas por Sector</CardTitle>
            <CardDescription>Distribución del mercado</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center justify-center">
            {sectoresLoading ? (
              <Skeleton className="w-full h-full" />
            ) : sectoresChart.length === 0 ? (
              <p className="text-sm text-text-muted">Sin datos de sectores</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={sectoresChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="sector"
                    >
                      {sectoresChart.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-4 mt-4 w-full">
                  {sectoresChart.map((s: any, i: number) => (
                    <div key={s.sector} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-text-secondary font-medium">{s.sector} ({s.total})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart Habilidades */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Match de Habilidades</CardTitle>
            <CardDescription>Demanda de empresas vs. oferta de egresados</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {demandaLoading ? (
              <Skeleton className="w-full h-full" />
            ) : !demanda || demanda.length === 0 ? (
              <p className="text-sm text-text-muted text-center pt-20">Sin datos de habilidades</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={demanda.slice(0, 6)}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis 
                    dataKey="habilidad" 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <PolarRadiusAxis angle={30} tick={false} axisLine={false} />
                  <Radar
                    name="Demanda Empresas"
                    dataKey="totalOfertas"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.4}
                  />
                  <Radar
                    name="Oferta Egresados"
                    dataKey="totalEgresados"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <RechartsTooltip />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Habilidades Críticas */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Habilidades más Demandadas</CardTitle>
            <CardDescription>Top habilidades con mayor brecha de talento</CardDescription>
          </CardHeader>
          <CardContent>
            {!demanda || demanda.length === 0 ? (
              <p className="text-sm text-text-muted">Sin datos de habilidades demandadas</p>
            ) : (
            <div className="space-y-4">
              {demanda.slice(0, 5).map((item: any) => {
                const maxBrecha = Math.max(...demanda.slice(0, 5).map((d: any) => Math.abs(d.brecha)), 1);
                const barWidth = Math.min(100, (Math.abs(item.brecha) / maxBrecha) * 100);
                return (
                <div key={item.habilidad} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-primary">{item.habilidad}</span>
                    <span className="text-xs font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded">
                      Brecha: {item.brecha > 0 ? '+' : ''}{item.brecha}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.brecha > 0 ? 'bg-error' : 'bg-success'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    <span>{item.totalEgresados} Egresados</span>
                    <span>{item.totalOfertas} Ofertas</span>
                  </div>
                </div>
              );})}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
