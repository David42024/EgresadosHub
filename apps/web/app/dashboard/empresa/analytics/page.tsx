'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from 'recharts';
import {
  Users,
  Briefcase,
  Target,
  Download,
  Calendar,
  Zap,
  MousePointer2,
  Clock,
  ArrowUpRight,
  Filter,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export default function EmpresaAnalyticsPage() {
  const [periodo, setPeriodo] = useState('Este Mes');
  const { data: resumen, isLoading: resumenLoading } = (trpc as any).analytics.getResumenEmpresa.useQuery() as any;
  const { data: rendimiento, isLoading: rendimientoLoading } = (trpc as any).analytics.getRendimientoOfertas.useQuery() as any;

  const exportarResumenCSV = () => {
    if (!resumen) return;
    const rows = [
      ["Metrica", "Valor"],
      ["Ofertas Activas", resumen.totalOfertasActivas],
      ["Postulaciones Totales", resumen.totalPostulaciones],
      ["Tasa de Contratacion", `${resumen.tasaContratacion}%`],
      ["CTR Promedio", `${resumen.ctrPromedio}%`],
      ["Tiempo de Cierre (Días)", resumen.diasPromedioCierre],
      ["Postulados", resumen.totalPostulados],
      ["En Revision", resumen.totalEnRevision],
      ["Entrevistas", resumen.totalEntrevistas],
      ["Contratados", resumen.totalContratados],
      ["Rechazados", resumen.totalRechazados]
    ];
    descargarCSV(rows, `resumen_analytics_${periodo.replace(' ', '_').toLowerCase()}`);
  };

  const exportarReporteOfertas = () => {
    if (!rendimiento) return;
    const rows = [
      ["ID", "Titulo", "Vistas", "Postulaciones", "Tasa Conversion (%)", "Estado", "Fecha Creacion"],
      ...rendimiento.map((o: any) => [
        o.id,
        o.titulo,
        o.vistas,
        o.postulaciones,
        o.conversion_rate,
        o.estado,
        new Date(o.created_at).toLocaleDateString()
      ])
    ];
    descargarCSV(rows, `reporte_detallado_ofertas`);
  };

  const descargarCSV = (rows: any[][], filename: string) => {
    const csvContent = rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: "Archivo generado", description: `El reporte ${filename} se ha descargado correctamente.` });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <PageHeader
        title="Rendimiento y Analytics"
        description="Analiza la efectividad de tus publicaciones con métricas avanzadas de reclutamiento."
      >
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 font-bold shadow-sm rounded-xl">
                <Calendar className="h-4 w-4" />
                {periodo}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-xl">
              {['Este Mes', 'Últimos 3 Meses', 'Últimos 6 Meses', 'Todo el año'].map((p) => (
                <DropdownMenuItem key={p} className="font-medium" onClick={() => setPeriodo(p)}>
                  {p}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="primary"
            size="sm"
            className="gap-2 font-bold shadow-lg shadow-primary-500/20 rounded-xl px-6"
            onClick={exportarResumenCSV}
            disabled={resumenLoading}
          >
            <Download className="h-4 w-4" />
            Exportar Resumen
          </Button>
        </div>
      </PageHeader>

      {/* KPIs Estratégicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Ofertas Activas"
          value={resumen?.totalOfertasActivas ?? 0}
          icon={Briefcase}
          description="En proceso de captación"
        />
        <StatsCard
          title="Interesados Totales"
          value={resumen?.totalPostulaciones ?? 0}
          icon={Users}
          description="Candidatos históricos"
        />
        <StatsCard
          title="Tasa de Eficiencia"
          value={`${resumen?.tasaContratacion ?? 0}%`}
          icon={Target}
          className="text-success"
          description="Conversión a contrato"
        />
        <StatsCard
          title="Tiempo de Cierre"
          value={`${resumen?.diasPromedioCierre ?? 0}d`}
          icon={Clock}
          className="text-amber-500"
          description="Días promedio vacante"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Embudo de Conversión */}
        <Card variant="elevated" className="lg:col-span-2 border-none shadow-xl bg-surface/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black">Flujo de Candidatos</CardTitle>
                <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-text-muted mt-1">Embudo de conversión por etapas</CardDescription>
              </div>
              <Badge className="bg-primary-600/10 text-primary-600 border-none font-bold">
                Data Real
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] px-4 pb-8">
            {resumenLoading ? (
              <Skeleton className="w-full h-full rounded-2xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { stage: 'Postulados', count: resumen?.totalPostulados ?? 0 },
                    { stage: 'En Revisión', count: resumen?.totalEnRevision ?? 0 },
                    { stage: 'Entrevistas', count: resumen?.totalEntrevistas ?? 0 },
                    { stage: 'Contratados', count: resumen?.totalContratados ?? 0 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="stage"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: '900' }}
                  />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'var(--bg-surface)',
                      borderColor: 'var(--border)',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                      border: 'none',
                      padding: '12px'
                    }}
                    itemStyle={{ fontWeight: '900', color: 'var(--primary-600)', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Eficiencia de Ofertas */}
        <Card variant="elevated" className="border-none shadow-xl bg-surface/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
          <CardHeader className="px-8 pt-8">
            <CardTitle className="text-xl font-black">Métricas de Valor</CardTitle>
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-text-muted">KPIs de impacto directo</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Éxito de Contratación</p>
                  <p className="text-4xl font-black text-primary-600">{resumen?.tasaContratacion ?? 0}%</p>
                </div>
                <div className="text-right">
                  <Badge
                    className={cn(
                      "gap-1 px-2 font-bold rounded-lg shadow-sm border-none",
                      (resumen?.tasaContratacion ?? 0) > 70 ? "bg-success/20 text-success" :
                        (resumen?.tasaContratacion ?? 0) > 40 ? "bg-warning/20 text-warning" :
                          "bg-destructive/20 text-destructive"
                    )}
                  >
                    {(resumen?.tasaContratacion ?? 0) > 70 ? "Alto" : (resumen?.tasaContratacion ?? 0) > 40 ? "Medio" : "Bajo"}
                  </Badge>
                </div>
              </div>
              <div className="h-3 w-full bg-bg-base rounded-full overflow-hidden shadow-inner ring-1 ring-border/30">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full transition-all duration-1000 shadow-lg"
                  style={{ width: `${Math.min(resumen?.tasaContratacion ?? 0, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
                  <MousePointer2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">CTR Promedio</p>
                  <p className="text-lg font-black text-text-primary leading-tight">{resumen?.ctrPromedio ?? 0}% <span className="text-[10px] text-text-muted font-bold tracking-tight">Efectividad</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 transition-transform group-hover:scale-110">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-tighter">Time-to-Hire</p>
                  <p className="text-lg font-black text-text-primary leading-tight">{resumen?.diasPromedioCierre ?? 0} días <span className="text-[10px] text-text-muted font-bold tracking-tight">Velocidad</span></p>
                </div>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full gap-2 mt-4 font-black h-12 rounded-2xl shadow-md group hover:bg-bg-elevated transition-all"
              onClick={exportarReporteOfertas}
              disabled={rendimientoLoading}
            >
              <FileText className="h-5 w-5 text-primary-600 group-hover:scale-110 transition-transform" />
              Descargar Reporte Detallado
              <ArrowUpRight className="h-4 w-4 opacity-30" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comparativa entre Ofertas */}
      <Card variant="elevated" className="border-none shadow-xl bg-surface/40 backdrop-blur-md rounded-[2rem] overflow-hidden">
        <CardHeader className="px-8 pt-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black">Rendimiento por Publicación</CardTitle>
            <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-text-muted">Postulantes vs Tasa de Conversión Real</CardDescription>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-bg-base shadow-sm">
            <Filter className="h-5 w-5 text-text-muted" />
          </Button>
        </CardHeader>
        <CardContent className="h-[450px] px-4 pb-8">
          {rendimientoLoading ? (
            <Skeleton className="w-full h-full rounded-2xl" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={rendimiento}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis
                  dataKey="titulo"
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text x={x} y={y + 10} textAnchor="end" fill="var(--text-secondary)" fontSize={9} fontWeight="900" transform={`rotate(-25, ${x}, ${y})`}>
                      {payload.value.length > 20 ? `${payload.value.substring(0, 20)}...` : payload.value}
                    </text>
                  )}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} />
                <RechartsTooltip
                  cursor={{ fill: 'var(--bg-elevated)', opacity: 0.2 }}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                    border: 'none',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                />
                <Bar dataKey="postulaciones" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={40} name="Interesados">
                  {rendimiento.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fillOpacity={0.8} />
                  ))}
                </Bar>
                <Bar dataKey="conversion_rate" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} name="% Conversión" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
