'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatsCard } from '@/components/shared/StatsCard';
import { trpc } from '@/lib/trpc/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Target, 
  Briefcase, 
  MessageSquare, 
  TrendingUp,
  Trophy,
  Award
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function EgresadoEstadisticasPage() {
  const { data: stats, isLoading } = (trpc as any).egresados.getMisEstadisticas.useQuery() as any;

  if (isLoading) return <div className="p-8 space-y-8"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div><Skeleton className="h-[400px] w-full" /></div>;

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Mi Dashboard de Carrera" 
        description="Analiza tu progreso y compárate con las tendencias del mercado."
      />

      {/* KPIs Personales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Postulaciones Totales" 
          value={stats?.totalPostulaciones ?? 0} 
          icon={Briefcase} 
          description="Enviadas este ciclo"
        />
        <StatsCard 
          title="Tasa de Respuesta" 
          value={`${stats?.tasaRespuesta ?? 0}%`} 
          icon={MessageSquare} 
          trend={{ value: 12, isUp: true }}
          description="Feedback de empresas"
        />
        <StatsCard 
          title="Entrevistas Logradas" 
          value={stats?.totalEntrevistas ?? 0} 
          icon={Target} 
          className="text-info"
          description="Siguiente etapa"
        />
        <StatsCard 
          title="Ofertas Recibidas" 
          value={stats?.totalOfertas ?? 0} 
          icon={Trophy} 
          className="text-success"
          description="Contrataciones"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Embudo Personal */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mi Embudo de Conversión</CardTitle>
            <CardDescription>Efectividad de tus postulaciones por etapa</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={[
                  { name: 'Postulaciones', value: stats?.totalPostulaciones ?? 0, fill: '#3b82f6' },
                  { name: 'En Revisión', value: stats?.totalEnRevision ?? 0, fill: '#f59e0b' },
                  { name: 'Entrevistas', value: stats?.totalEntrevistas ?? 0, fill: '#8b5cf6' },
                  { name: 'Ofertas', value: stats?.totalOfertas ?? 0, fill: '#10b981' },
                ]}
                margin={{ left: 40, right: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold' }}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'var(--bg-elevated)', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Comparativa Salarial */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Potencial Salarial</CardTitle>
            <CardDescription>Tu perfil vs promedio de carrera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-text-muted mb-1">Promedio Mercado</p>
              <h3 className="text-3xl font-black text-primary-600 font-mono">S/ 4,500</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-secondary">Tu rango actual</span>
                  <span className="text-text-primary">S/ 3,800 - S/ 5,500</span>
                </div>
                <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-[70%] rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-success/5 border border-success/10 flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-success shrink-0 mt-0.5" />
                <p className="text-xs text-success-foreground leading-relaxed">
                  Tu perfil tiene un <span className="font-bold">15% más de demanda</span> que el promedio debido a tus habilidades en Cloud.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills más demandadas */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Skills con mayor Match</CardTitle>
            <CardDescription>Habilidades que las empresas buscan en ti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'React.js', match: 98, color: 'bg-primary-500' },
                { name: 'Node.js', match: 85, color: 'bg-success' },
                { name: 'PostgreSQL', match: 72, color: 'bg-info' },
                { name: 'TypeScript', match: 92, color: 'bg-primary-600' },
              ].sort((a, b) => b.match - a.match).map((skill) => (
                <div key={skill.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-text-primary">{skill.name}</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">{skill.match}% Match</Badge>
                  </div>
                  <div className="h-1.5 w-full bg-bg-elevated rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", skill.color)} style={{ width: `${skill.match}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logros/Badges */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Insignias y Logros</CardTitle>
            <CardDescription>Reconocimientos a tu actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-bg-base/50 flex flex-col items-center text-center gap-2 group hover:border-primary-500/30 transition-all">
                <div className="h-12 w-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Perfil Verificado</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Datos validados por la UNT</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-bg-base/50 flex flex-col items-center text-center gap-2 group hover:border-success/30 transition-all opacity-50">
                <div className="h-12 w-12 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">Top 10% Egresados</p>
                  <p className="text-[10px] text-text-muted mt-0.5">Próximamente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
