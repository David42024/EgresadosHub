'use client';
import { useState, useEffect } from 'react';
import { trpc }                from '@/lib/trpc/client';
import { Button }              from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge }               from '@/components/ui/badge';
import { FileText, Download, Loader2, CheckCircle2, Clock } from 'lucide-react';

const TIPOS_REPORTE: {
  tipo:   string;
  label:  string;
  desc:   string;
  icon:   React.ReactNode;
  async?: boolean;
}[] = [
  {
    tipo:  'LISTADO_EGRESADOS',
    label: 'Listado de egresados',
    desc:  'Exporta el directorio completo de egresados.',
    icon:  <FileText className="h-4 w-4" />,
  },
  {
    tipo:  'LISTADO_OFERTAS',
    label: 'Listado de ofertas',
    desc:  'Historial de ofertas laborales activas e históricas.',
    icon:  <FileText className="h-4 w-4" />,
  },
  {
    tipo:  'EMPLEABILIDAD_COHORTE',
    label: 'Empleabilidad por cohorte',
    desc:  'Tasa de empleabilidad y salarios por año.',
    icon:  <Clock className="h-4 w-4" />,
    async: true,
  },
  {
    tipo:  'DEMANDA_LABORAL',
    label: 'Demanda laboral',
    desc:  'Habilidades más demandadas y brecha laboral.',
    icon:  <Clock className="h-4 w-4" />,
    async: true,
  },
];

// ✅ Interfaz completa con todos los campos usados
interface JobStatus {
  jobId:    string;
  estado:   string;
  url?:     string;
  error?:   string;
  creadoAt: string;
  tipo?:    string;   // ← campo local para mostrar el label
}

export function ReportesPanel() {
  const [activeJobs, setActiveJobs] = useState<JobStatus[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);

  const generarMutation = (trpc as any).reportes.generar.useMutation({
    onSuccess: (data: any, variables: any) => {
      setGenerating(null);
      const tipoLabel = TIPOS_REPORTE.find(t => t.tipo === variables.tipo)?.label ?? variables.tipo;

      if (data.url !== null && data.url !== undefined) {
        // Descarga inmediata
        window.open(data.url, '_blank');
      } else {
        // Job asíncrono — agregar al tracking
        setActiveJobs((prev) => [
          {
            jobId:    data.jobId,
            estado:   'PENDIENTE',
            creadoAt: new Date().toISOString(),
            tipo:     tipoLabel,
          },
          ...prev,
        ]);
      }
    },
    onError: () => setGenerating(null),
  });

  // Polling solo para jobs pendientes/procesando
  const pendingJob = activeJobs.find(
    j => j.estado === 'PENDIENTE' || j.estado === 'PROCESANDO',
  );

  const { data: jobStatus } = (trpc as any).reportes.estado.useQuery(
    { jobId: pendingJob?.jobId ?? '' },
    {
      enabled:         pendingJob !== undefined,
      refetchInterval: 3_000,
    },
  ) as any;

  // ✅ Actualizar el job en la lista cuando cambia el estado
  useEffect(() => {
    if (jobStatus === null || jobStatus === undefined) return;

    setActiveJobs((prev) =>
      prev.map((j): JobStatus =>
        j.jobId === jobStatus.jobId
          ? {
              ...j,
              estado: jobStatus.estado,
              url:    jobStatus.url    ?? undefined,
              error:  jobStatus.error  ?? undefined,
              creadoAt: new Date().toISOString(),
            }
          : j,
      ),
    );
  }, [jobStatus]);

  const handleGenerar = (tipo: string, _isAsync: boolean) => {
    setGenerating(tipo);
    // ✅ Siempre usamos asincrono: true para evitar timeouts en el proxy tRPC al usar Puppeteer
    generarMutation.mutate({ tipo, formato: 'PDF', asincrono: true });
  };

  return (
    <Card className="shadow-sm dark:border-gray-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-text-primary">Generación de Reportes</CardTitle>
        <CardDescription className="dark:text-gray-400">
          Genera documentos PDF bajo demanda o en segundo plano.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipos de reporte */}
        <div className="space-y-3">
          {TIPOS_REPORTE.map((r) => (
            <div
              key={r.tipo}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {r.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{r.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleGenerar(r.tipo, r.async === true)}
                disabled={generating === r.tipo}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                {generating === r.tipo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Jobs activos */}
        {activeJobs.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <h4 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Tareas recientes
            </h4>
            <div className="space-y-2">
              {activeJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-xs gap-3"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {job.estado === 'COMPLETADO' ? (
                      <CheckCircle2 className="h-3 w-3 text-green-500 dark:text-green-400 shrink-0" />
                    ) : job.estado === 'ERROR' ? (
                      <span className="h-3 w-3 rounded-full bg-red-500 dark:bg-red-400 shrink-0 inline-block" />
                    ) : (
                      <Loader2 className="h-3 w-3 text-blue-500 dark:text-blue-400 animate-spin shrink-0" />
                    )}
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {job.tipo ?? job.jobId.slice(0, 8)}
                    </span>
                  </div>

                  <span className="text-gray-400 dark:text-gray-500 shrink-0">
                    {new Date(job.creadoAt).toLocaleTimeString('es-PE')}
                  </span>

                  {(job.estado === 'COMPLETADO' && job.url !== undefined) ? (
                    <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0"
                  >
                    Descargar
                  </a>
                ) : (
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 uppercase shrink-0 dark:border-gray-700 dark:text-gray-400">
                    {job.estado}
                  </Badge>
                )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}