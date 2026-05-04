'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Users, 
  Building2, 
  Briefcase, 
  Download, 
  Clock, 
  FileBarChart,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { toast } from '@/components/ui/use-toast';

const REPORT_TYPES = [
  {
    id: 'LISTADO_EGRESADOS',
    title: 'Padrón de Egresados',
    description: 'Listado completo de egresados con datos de contacto y situación laboral actual.',
    icon: Users,
    color: 'text-primary-600 dark:text-primary-400',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
  },
  {
    id: 'DEMANDA_LABORAL',
    title: 'Demanda Laboral',
    description: 'Empresas registradas, sectores dominantes y volumen de contratación.',
    icon: Building2,
    color: 'text-success dark:text-green-400',
    bgColor: 'bg-success/10 dark:bg-green-900/20',
  },
  {
    id: 'LISTADO_OFERTAS',
    title: 'Análisis de Ofertas',
    description: 'Tendencias salariales, modalidades más buscadas y brechas de habilidades.',
    icon: Briefcase,
    color: 'text-warning dark:text-amber-400',
    bgColor: 'bg-warning/10 dark:bg-amber-900/20',
  },
  {
    id: 'HISTORIAL_POSTULACIONES',
    title: 'Reporte de Colocación',
    description: 'Efectividad de las postulaciones y tiempos promedio de contratación.',
    icon: FileBarChart,
    color: 'text-info dark:text-blue-400',
    bgColor: 'bg-info/10 dark:bg-blue-900/20',
  }
];

const TIPO_LABELS: Record<string, string> = {
  LISTADO_EGRESADOS: 'Padrón Egresados',
  DEMANDA_LABORAL: 'Demanda Laboral',
  LISTADO_OFERTAS: 'Análisis Ofertas',
  HISTORIAL_POSTULACIONES: 'Colocación',
  EMPLEABILIDAD_COHORTE: 'Empleabilidad',
  COMPARATIVO_CARRERAS: 'Carreras',
};

export default function AdminReportesPage() {
  const [generating, setGenerating] = useState<string | null>(null);

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = (trpc as any).reportes.listar.useQuery({ limit: 20 }) as any;

  const generarMutation = (trpc as any).reportes.generar.useMutation({
    onSuccess: () => {
      toast({ title: "Reporte solicitado", description: "El reporte se está generando en segundo plano." });
      setTimeout(() => refetchJobs(), 2000);
    },
    onSettled: () => {
      setGenerating(null);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
      setGenerating(null);
    }
  }) as any;

  const handleGenerate = (type: string) => {
    setGenerating(type);
    generarMutation.mutate({ tipo: type, formato: 'PDF' });
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  const pendingJobs = (jobs ?? []).filter((j: any) => j.estado === 'PENDIENTE' || j.estado === 'PROCESANDO');
  const completedJobs = (jobs ?? []).filter((j: any) => j.estado === 'COMPLETADO');
  const errorJobs = (jobs ?? []).filter((j: any) => j.estado === 'ERROR');

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `Hace ${diffHrs}h`;
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Generación de Reportes" 
        description="Genera documentos PDF bajo demanda o en segundo plano."
      />

      {/* Grid de Tipos de Reporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REPORT_TYPES.map((report) => (
          <Card key={report.id} variant="elevated" className="group overflow-hidden dark:border-gray-800">
            <CardHeader>
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", report.bgColor, report.color)}>
                <report.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg text-text-primary">{report.title}</CardTitle>
              <CardDescription className="line-clamp-2 min-h-[40px] dark:text-gray-400">
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                className="w-full gap-2 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 dark:border-gray-700 dark:text-gray-300 dark:group-hover:text-white transition-all"
                onClick={() => handleGenerate(report.id)}
                loading={generating === report.id}
              >
                {generating === report.id ? "Generando..." : "Generar PDF"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Jobs en Proceso */}
        <Card variant="elevated" className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-text-primary">
              <Clock className="h-4 w-4 text-text-muted" />
              Tareas en Proceso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {jobsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
            ) : pendingJobs.length === 0 && errorJobs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No hay tareas activas.</p>
            ) : (
              [...pendingJobs, ...errorJobs].map((job: any) => (
                <div key={job.jobId} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                      {TIPO_LABELS[job.tipo] ?? job.tipo}
                    </span>
                    {job.estado === 'ERROR' ? (
                      <Badge variant="error" className="text-[9px] px-2 py-0.5">Error</Badge>
                    ) : (
                      <Badge className="text-[9px] px-2 py-0.5 bg-warning/20 dark:bg-amber-900/30 text-warning dark:text-amber-400">{job.estado}</Badge>
                    )}
                  </div>
                  {job.estado === 'ERROR' && job.error && (
                    <p className="text-[10px] text-error dark:text-red-400 font-medium">{job.error}</p>
                  )}
                  <div className="flex items-center gap-2 text-[10px] text-text-muted font-medium">
                    {job.estado !== 'ERROR' && <Loader2 className="h-3 w-3 animate-spin" />}
                    {job.estado === 'ERROR' ? 'Falló la generación' : 'Generando...'}
                  </div>
                  <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2" onClick={() => refetchJobs()}>
                    Refrescar
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Historial de Reportes */}
        <Card variant="elevated" className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2 text-text-primary">
                <FileText className="h-4 w-4 text-text-muted" />
                Historial de Descargas
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => refetchJobs()}>Refrescar</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {jobsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-text-muted" /></div>
            ) : completedJobs.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-12">No hay reportes generados aún.</p>
            ) : (
            <div className="divide-y divide-border">
              {completedJobs.map((job: any) => (
                <div key={job.jobId} className="flex items-center justify-between p-4 hover:bg-bg-base/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-bg-elevated dark:bg-bg-elevated flex items-center justify-center text-text-muted group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{TIPO_LABELS[job.tipo] ?? job.tipo}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        <span className="text-[10px] text-text-muted font-medium">{formatDate(job.creadoAt)}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-text-muted hover:text-primary-600 dark:hover:text-primary-400"
                    onClick={() => job.url && handleDownload(job.url)}
                    disabled={!job.url}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
