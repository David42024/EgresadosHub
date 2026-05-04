// apps/web/components/dashboard/EvolucionChart.tsx
'use client';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── EvolucionChart ───────────────────────────────────────────────────────────

interface EvolucionItem {
  mes:           string;
  ofertas:       number;
  postulaciones: number;
}

export function EvolucionChart({ data }: { data: EvolucionItem[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center text-sm text-gray-400 dark:text-gray-500">
        Sin datos de evolución disponibles
      </div>
    );
  }

  const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  const formatted = data.map((d: EvolucionItem) => {
    const parts      = d.mes.split('-');
    const y          = parts[0] ?? '';
    const m          = parts[1] ?? '1';
    const monthIndex = parseInt(m, 10) - 1;
    return {
      ...d,
      mesLabel: `${MESES[monthIndex] ?? '???'} ${y.slice(2)}`,
    };
  });

  return (
    <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={formatted} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradOfertas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gradPostulaciones" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6"/>
          <XAxis
            dataKey="mesLabel"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}/>
          <Area
            type="monotone"
            dataKey="ofertas"
            name="Ofertas"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradOfertas)"
          />
          <Area
            type="monotone"
            dataKey="postulaciones"
            name="Postulaciones"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradPostulaciones)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── DemandaHabilidadesChart ──────────────────────────────────────────────────

interface DemandaItem {
  habilidad:      string;
  totalOfertas:   number;
  totalEgresados: number;
  brecha:         number;
}

export function DemandaHabilidadesChart({ data }: { data: DemandaItem[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center text-sm text-gray-400 dark:text-gray-500">
        Sin datos de demanda disponibles
      </div>
    );
  }

  const top10 = data.slice(0, 10);

  return (
    <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={top10}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false}/>
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="habilidad"
            type="category"
            tick={{ fontSize: 10, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            width={78}
          />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }}/>
          <Bar
            dataKey="totalOfertas"
            name="Ofertas que la piden"
            fill="#3b82f6"
            radius={[0, 4, 4, 0]}
            barSize={10}
          />
          <Bar
            dataKey="totalEgresados"
            name="Egresados con esa skill"
            fill="#10b981"
            radius={[0, 4, 4, 0]}
            barSize={10}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── EmbudoConversionChart ────────────────────────────────────────────────────

interface EmbudoData {
  postulados:     number;
  enRevision:     number;
  entrevista:     number;
  contratados:    number;
  rechazados:     number;
  tasaConversion: number;
}

export function EmbudoConversionChart({ data }: { data: EmbudoData }) {
  const stages = [
    { label: 'Postulados',  value: data.postulados  ?? 0, color: '#3b82f6' },
    { label: 'En revisión', value: data.enRevision  ?? 0, color: '#f59e0b' },
    { label: 'Entrevista',  value: data.entrevista  ?? 0, color: '#8b5cf6' },
    { label: 'Contratados', value: data.contratados ?? 0, color: '#10b981' },
  ];
  const max = (data.postulados ?? 0) !== 0 ? (data.postulados ?? 0) : (data.enRevision ?? 0) !== 0 ? (data.enRevision ?? 0) : (data.entrevista ?? 0) !== 0 ? (data.entrevista ?? 0) : (data.contratados ?? 0) !== 0 ? (data.contratados ?? 0) : 1;

  return (
    <div className="rounded-2xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Tasa de conversión global</span>
        <span className="text-lg font-bold text-green-600 dark:text-green-300">
          {(data.tasaConversion ?? 0).toFixed(1)}%
        </span>
      </div>
      {stages.map((s) => (
        <div key={s.label}>
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{s.label}</span>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {s.value.toLocaleString('es-PE')}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width:      `${(s.value / max) * 100}%`,
                background: s.color,
              }}
            />
          </div>
        </div>
      ))}
      {data.rechazados > 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 pt-2">
          {data.rechazados.toLocaleString('es-PE')} postulantes rechazados
        </p>
      )}
    </div>
  );
}