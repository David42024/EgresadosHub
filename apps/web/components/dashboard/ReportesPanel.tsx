'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
  tipo?:    string;           // ← campo local para mostrar el label
  pdfDisponible?: boolean;    // ← indica si el PDF está listo para descarga
}

/**
 * Convierte un string base64 a un Blob PDF y dispara la descarga en el navegador.
 */
function descargarBase64ComoPdf(base64: string, filename: string) {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Limpiar después de la descarga
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

export function ReportesPanel() {
  const [activeJobs,  setActiveJobs]  = useState<JobStatus[]>([]);
  const [generating,  setGenerating]  = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  // hasPending drive the refetchInterval reactivamente
  const [hasPending, setHasPending] = useState(false);

  // IDs de jobs lanzados en ESTA sesión (para distinguir descargas nuevas de las históricas)
  const newJobIdsRef = React.useRef<Set<string>>(new Set());

  // Jobs cuya descarga ya se disparó (evita doble-descarga)
  const downloadedRef = React.useRef<Set<string>>(new Set());

  const utils = (trpc as any).useUtils();

  /* ────── Descarga PDF directa (siempre ejecuta — usada por el botón) ────── */
  const handleDescargarManual = useCallback(async (jobId: string, filename?: string) => {
    setDownloading(jobId);
    try {
      console.log('[Descarga manual] Solicitando PDF para job:', jobId);
      const result = await (utils as any).reportes.descargar.fetch({ jobId });
      if (result?.base64) {
        descargarBase64ComoPdf(result.base64, filename || result.filename || `reporte_${jobId}.pdf`);
        downloadedRef.current.add(jobId); // marcar como descargado tras éxito
      } else {
        console.warn('[Descarga manual] No se recibió base64 para job:', jobId);
      }
    } catch (err) {
      console.error('[Descarga manual] Error al descargar el PDF:', err);
    } finally {
      setDownloading(null);
    }
  }, [utils]);

  /* ────── Descarga PDF automática (deduplicada — usada por el polling) ────── */
  const handleAutoDescargar = useCallback(async (jobId: string) => {
    if (downloadedRef.current.has(jobId)) return;
    downloadedRef.current.add(jobId);
    try {
      console.log('[Auto-descarga] Descargando PDF completado, job:', jobId);
      const result = await (utils as any).reportes.descargar.fetch({ jobId });
      if (result?.base64) {
        descargarBase64ComoPdf(result.base64, result.filename || `reporte_${jobId}.pdf`);
      } else {
        downloadedRef.current.delete(jobId); // fallback: permite reintento manual
      }
    } catch (err) {
      console.error('[Auto-descarga] Error:', err);
      downloadedRef.current.delete(jobId);
    }
  }, [utils]);

  /* ────── Mutación generar ────── */
  const generarMutation = (trpc as any).reportes.generar.useMutation({
    onSuccess: (data: any, variables: any) => {
      setGenerating(null);
      const tipoLabel = TIPOS_REPORTE.find(t => t.tipo === variables.tipo)?.label ?? variables.tipo;

      if (data.base64) {
        // Respuesta síncrona directa
        descargarBase64ComoPdf(data.base64, data.filename || `${variables.tipo}_reporte.pdf`);
      } else if (data.jobId) {
        // Job asíncrono — registrar como "nuevo" y activar polling
        newJobIdsRef.current.add(data.jobId);
        setHasPending(true);
        setActiveJobs(prev => [{
          jobId:    data.jobId,
          estado:   'PENDIENTE',
          creadoAt: new Date().toISOString(),
          tipo:     tipoLabel,
        }, ...prev]);
      }
    },
    onError: () => setGenerating(null),
  });

  /* ────── Polling historial ────── */
  const { data: historyJobs } = (trpc as any).reportes.listar.useQuery(
    { limit: 10 },
    {
      // refetchInterval con función para que React Query lo re-evalúe en cada tick
      refetchInterval: (data: any) => {
        const jobs: any[] = data ?? [];
        const pending = jobs.some(j => j.estado === 'PENDIENTE' || j.estado === 'PROCESANDO');
        return pending ? 2000 : false;
      },
      refetchOnWindowFocus: true,
    }
  ) as any;

  /* ────── Sincronizar historial → estado local ────── */
  const initializedRef = React.useRef(false);

  useEffect(() => {
    if (!historyJobs) return;

    const mapped: JobStatus[] = historyJobs.map((j: any) => ({
      ...j,
      pdfDisponible: j.estado === 'COMPLETADO',
    }));

    // Primera carga: marcar todos los COMPLETADO existentes como ya "descargados"
    // para evitar auto-descarga de reportes históricos
    if (!initializedRef.current) {
      initializedRef.current = true;
      historyJobs.forEach((j: any) => {
        if (j.estado === 'COMPLETADO') downloadedRef.current.add(j.jobId);
      });
    }

    setActiveJobs(mapped);

    // Actualizar hasPending para que el intervalo funcione reactivamente
    const stillPending = mapped.some(j => j.estado === 'PENDIENTE' || j.estado === 'PROCESANDO');
    setHasPending(stillPending);

    // Auto-descarga: solo para jobs lanzados en esta sesión que acaban de completar
    mapped.forEach(j => {
      if (
        j.estado === 'COMPLETADO' &&
        j.pdfDisponible &&
        newJobIdsRef.current.has(j.jobId) &&
        !downloadedRef.current.has(j.jobId)
      ) {
        void handleAutoDescargar(j.jobId);
      }
    });
  }, [historyJobs, handleAutoDescargar]);

  /* ────── Handler generar ────── */
  const handleGenerar = (tipo: string) => {
    setGenerating(tipo);
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
                onClick={() => handleGenerar(r.tipo)}
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

                  {(job.estado === 'COMPLETADO' && job.pdfDisponible) ? (
                    <button
                      onClick={() => { void handleDescargarManual(job.jobId); }}
                      disabled={downloading === job.jobId}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 disabled:opacity-50"
                    >
                      {downloading === job.jobId ? (
                        <Loader2 className="h-3 w-3 animate-spin inline" />
                      ) : (
                        'Descargar'
                      )}
                    </button>
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