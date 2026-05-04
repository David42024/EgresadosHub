// ─── KpiCard ──────────────────────────────────────────────────────────────────
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

type ColorKey = 'blue' | 'green' | 'purple' | 'amber' | 'red';

const COLOR_MAP: Record<ColorKey, { bg: string; text: string; icon: string; shadow: string }> = {
  blue:   { bg: 'bg-blue-600/10 dark:bg-blue-500/20',   text: 'text-blue-600 dark:text-blue-400',   icon: 'text-blue-600 dark:text-blue-400',   shadow: 'shadow-blue-500/10' },
  green:  { bg: 'bg-green-600/10 dark:bg-green-500/20',  text: 'text-green-600 dark:text-green-400',  icon: 'text-green-600 dark:text-green-400',  shadow: 'shadow-green-500/10' },
  purple: { bg: 'bg-purple-600/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', icon: 'text-purple-600 dark:text-purple-400', shadow: 'shadow-purple-500/10' },
  amber:  { bg: 'bg-amber-600/10 dark:bg-amber-500/20',  text: 'text-amber-600 dark:text-amber-400',  icon: 'text-amber-600 dark:text-amber-400',  shadow: 'shadow-amber-500/10' },
  red:    { bg: 'bg-red-600/10 dark:bg-red-500/20',    text: 'text-red-600 dark:text-red-400',    icon: 'text-red-600 dark:text-red-400',    shadow: 'shadow-red-500/10' },
};

interface KpiCardProps {
  title:     string;
  value:     string;
  variacion?: number | null;
  icon:      string;
  color:     ColorKey;
  highlight?: boolean;
}

export function KpiCard({ title, value, variacion, icon, color, highlight }: KpiCardProps) {
  const c = COLOR_MAP[color];
  const isPositive = (variacion ?? 0) >= 0;

  return (
    <Card className={cn(
      'rounded-[2rem] border-none shadow-xl bg-surface/40 backdrop-blur-md overflow-hidden group transition-all duration-300 hover:scale-[1.02]',
      highlight && 'ring-2 ring-primary-500/20 shadow-primary-500/10',
      c.shadow
    )}>
      <CardContent className="p-7">
        <div className="flex items-start justify-between">
          <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110', c.bg)}>
            {icon}
          </div>
          {variacion !== undefined && variacion !== null && (
            <div className={cn(
              'px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm',
              isPositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive',
            )}>
              {isPositive ? '↑' : '↓'} {Math.abs(variacion).toFixed(1)}%
            </div>
          )}
        </div>
        <div className="mt-6 space-y-1">
          <div className="text-[10px] font-black text-text-muted uppercase tracking-widest opacity-70">{title}</div>
          <div className={cn('text-4xl font-black tracking-tighter', c.text)}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── SalaryStatsCard ─────────────────────────────────────────────────────────

import { formatCurrency } from '@/lib/utils';

interface SalaryStatsCardProps {
  salarioPromedio:   number | null;
  salarioDesviacion: number | null;
  titulo?:           string;
}

export function SalaryStatsCard({
  salarioPromedio, salarioDesviacion, titulo = 'Estadísticas de salarios ofertados',
}: SalaryStatsCardProps) {
  const cv = (salarioPromedio !== null && salarioDesviacion !== null && salarioPromedio !== 0)
    ? ((salarioDesviacion / salarioPromedio) * 100).toFixed(1)
    : null;

  const stats = [
    {
      label: 'Salario promedio (μ)',
      value: formatCurrency(salarioPromedio),
      desc:  'Media aritmética de ofertas',
      icon:  '📊',
      color: 'blue'
    },
    {
      label: 'Desviación estándar (σ)',
      value: salarioDesviacion !== null ? `± ${formatCurrency(salarioDesviacion)}` : '—',
      desc:  'Dispersión del promedio',
      icon:  '📐',
      color: 'purple'
    },
    {
      label: 'Coeficiente Variación',
      value: cv !== null ? `${cv}%` : '—',
      desc:  'Homogeneidad relativa',
      icon:  '📉',
      color: 'amber'
    },
    {
      label: 'Intervalo Típico',
      value: (salarioPromedio !== null && salarioDesviacion !== null)
        ? `${formatCurrency(salarioPromedio - salarioDesviacion)} – ${formatCurrency(salarioPromedio + salarioDesviacion)}`
        : '—',
      desc:  '68% de las ofertas',
      icon:  '📏',
      color: 'green'
    },
  ];

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-surface/40 backdrop-blur-md overflow-hidden">
      <CardContent className="p-8">
        <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-6">{titulo}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="group p-5 rounded-[2rem] bg-bg-base/30 border border-border/50 transition-all hover:bg-bg-base/50">
              <div className="text-2xl mb-4 transition-transform group-hover:scale-110 flex">{s.icon}</div>
              <div className="text-xl font-black text-text-primary tracking-tight">{s.value}</div>
              <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{s.label}</div>
              <div className="text-[10px] text-text-muted mt-2 leading-relaxed font-medium opacity-60">{s.desc}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── CohorteTable ─────────────────────────────────────────────────────────────

import { Badge } from '@/components/ui/badge';

export function CohorteTable({ cohortes }: { cohortes: any[] }) {
  if (!cohortes.length) {
    return (
      <Card className="rounded-[2rem] border-none bg-surface/40 backdrop-blur-md p-12 text-center text-sm font-bold text-text-muted">
        No hay datos de cohortes disponibles
      </Card>
    );
  }

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl bg-surface/40 backdrop-blur-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-base/30 border-b border-border/50">
            <tr>
              <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Año</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-text-muted uppercase tracking-widest">Carrera</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Egresados</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Empleabilidad</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-text-muted uppercase tracking-widest">Sal. Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {cohortes.map((c) => (
              <tr key={`${c.anioEgreso}-${c.carrera}`} className="hover:bg-bg-base/30 transition-colors group">
                <td className="px-6 py-4 font-black text-text-primary">{c.anioEgreso}</td>
                <td className="px-6 py-4 text-text-secondary font-bold text-xs truncate max-w-40">{c.carrera}</td>
                <td className="px-6 py-4 text-right text-text-primary font-black font-mono">{c.totalEgresados}</td>
                <td className="px-6 py-4 text-right">
                   <Badge className={cn(
                    'font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm',
                    c.tasaEmpleabilidad >= 70 ? 'bg-success/20 text-success' :
                    c.tasaEmpleabilidad >= 50 ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive',
                  )}>
                    {c.tasaEmpleabilidad.toFixed(1)}%
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right text-primary-600 dark:text-primary-400 font-black">
                  {formatCurrency(c.salarioPromedio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
