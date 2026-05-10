'use client';

import { useState, useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { 
  Briefcase, 
  User, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Filter, 
  History,
  Download,
  Mail,
  CheckCircle,
  PauseCircle,
  Users
} from 'lucide-react';
import { cn, descargarBase64ComoPdf } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsCard } from '@/components/shared/StatsCard';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

type Postulacion = {
  id: string;
  estado: string;
  postuladoAt: string;
  egresado: {
    id: string;
    nombres: string;
    apellidos: string;
    fotoUrl?: string;
    cvUrl?: string;
    carrera: string;
    user: { email: string };
  };
  oferta: {
    id: string;
    titulo: string;
    empresa: { razonSocial: string };
  };
};

const ESTADOS = [
  { id: 'POSTULADO', label: 'Postulados', color: 'bg-primary-500' },
  { id: 'EN_REVISION', label: 'En Revisión', color: 'bg-warning' },
  { id: 'ENTREVISTA', label: 'Entrevista', color: 'bg-info' },
  { id: 'CONTRATADO', label: 'Contratados', color: 'bg-success' },
  { id: 'RECHAZADO', label: 'Rechazados', color: 'bg-error' },
];

export default function AdminPostulacionesPage() {
  const [selectedOferta, setSelectedOferta] = useState<string>('ALL');
  const [selectedPostulacion, setSelectedPostulacion] = useState<Postulacion | null>(null);
  const [tableEstadoFilter, setTableEstadoFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const PAGE_SIZE = 10;

  const { data: ofertas } = (trpc as any).ofertas.list.useQuery({ limit: 100 }) as any;
  
  // General view query
  const { data: allData, isLoading: isLoadingAll, refetch: refetchAll } = (trpc as any).postulaciones.list.useQuery(
    { 
      estado: tableEstadoFilter === 'ALL' ? undefined : tableEstadoFilter,
      limit: PAGE_SIZE, 
      skip: (page - 1) * PAGE_SIZE
    },
    { enabled: selectedOferta === 'ALL' }
  ) as any;

  // Specific offer view query (Kanban)
  const { data: ofertaData, isLoading: isLoadingOferta, refetch: refetchOferta } = (trpc as any).postulaciones.postulantesDeOferta.useQuery(
    { ofertaId: selectedOferta },
    { enabled: selectedOferta !== 'ALL' }
  ) as any;

  const { data: statsData, isLoading: isLoadingStats } = (trpc as any).analytics.getPostulacionesStatsAdmin.useQuery() as any;

  const updateEstado = (trpc as any).postulaciones.cambiarEstado.useMutation({
    onSuccess: () => {
      if (selectedOferta === 'ALL') refetchAll();
      else refetchOferta();
    },
  }) as any;

  const { data: audits, isLoading: isLoadingAudits } = (trpc as any).postulaciones.getAuditHistory.useQuery(
    { postulacionId: selectedPostulacion?.id ?? '' },
    { enabled: !!selectedPostulacion }
  ) as any;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const postulaciones = selectedOferta === 'ALL' ? (allData?.data ?? []) : (ofertaData?.data ?? []);
  const total = selectedOferta === 'ALL' ? (allData?.total ?? 0) : (ofertaData?.total ?? 0);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const embudo = useMemo(() => {
    if (selectedOferta === 'ALL') return {};
    return postulaciones.reduce((acc: any, curr: any) => {
      if (!acc[curr.estado]) acc[curr.estado] = [];
      acc[curr.estado].push(curr);
      return acc;
    }, {});
  }, [postulaciones, selectedOferta]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const postulacionId = active.id as string;
    const nuevoEstado = over.id as string;

    const currentPostulacion = postulaciones?.find((p: any) => p.id === postulacionId);
    if (currentPostulacion && currentPostulacion.estado !== nuevoEstado) {
      updateEstado.mutate({ 
        postulacionId: postulacionId, 
        nuevoEstado: nuevoEstado,
        comentario: `Movido en el tablero a ${nuevoEstado}`
      });
    }
  };

  const generarReporte = (trpc as any).reportes.generar.useMutation({
    onSuccess: (data: any) => {
      setDownloadingPdf(false);
      if (data.base64) {
        descargarBase64ComoPdf(data.base64, data.filename || 'postulaciones.pdf');
        toast({ title: "Reporte listo", description: "El PDF se ha descargado." });
      }
    },
    onError: () => {
      setDownloadingPdf(false);
      toast({ title: "Error", description: "No se pudo generar el reporte.", variant: "destructive" });
    }
  }) as any;

  const handleExportPDF = () => {
    setDownloadingPdf(true);
    toast({ title: "Generando PDF", description: "Espera unos segundos mientras se genera..." });
    generarReporte.mutate({ tipo: 'HISTORIAL_POSTULACIONES', formato: 'PDF' });
  };

  useEffect(() => {
    setPage(1);
  }, [selectedOferta, tableEstadoFilter]);

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
      <PageHeader
        title="Gestión de Candidatos"
        description="Seguimiento y administración de procesos de selección."
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold h-10 px-4" onClick={handleExportPDF} disabled={downloadingPdf}>
            <Download className="h-4 w-4" />
            Reporte PDF
          </Button>
          <Select value={selectedOferta} onValueChange={setSelectedOferta}>
            <SelectTrigger className="w-[320px] bg-surface rounded-2xl border-none shadow-lg h-12 font-bold px-6">
              <Briefcase className="h-5 w-5 mr-3 text-primary-600" />
              <SelectValue placeholder="Selecciona una oferta" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-none shadow-2xl">
              <SelectItem value="ALL" className="font-bold">Vista General (Todas)</SelectItem>
              {ofertas?.data?.map((o: any) => (
                <SelectItem key={o.id} value={o.id}>{o.titulo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <StatsCard
          title="Total Postulaciones"
          value={isLoadingStats ? '...' : statsData?.total ?? 0}
          icon={Users}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg py-3 px-4"
        />
        <StatsCard
          title="En Revisión"
          value={isLoadingStats ? '...' : statsData?.enRevision ?? 0}
          icon={PauseCircle}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-warning py-3 px-4"
        />
        <StatsCard
          title="Entrevistas"
          value={isLoadingStats ? '...' : statsData?.entrevistas ?? 0}
          icon={Calendar}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-info py-3 px-4"
        />
        <StatsCard
          title="Contratados"
          value={isLoadingStats ? '...' : statsData?.contratados ?? 0}
          icon={CheckCircle}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-success py-3 px-4"
        />
      </div>

      {selectedOferta === 'ALL' ? (
        <Card variant="elevated" className="border-none shadow-2xl bg-surface/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-border/50 flex flex-wrap gap-4 items-center justify-between bg-bg-base/30">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">Registro General</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">Explora todas las postulaciones del sistema</p>
            </div>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-text-muted" />
              <Select value={tableEstadoFilter} onValueChange={setTableEstadoFilter}>
                <SelectTrigger className="w-[180px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm">
                  <SelectValue placeholder="Filtrar estado" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="ALL" className="font-bold">Todos los estados</SelectItem>
                  {ESTADOS.map(e => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-bg-base/40">
                <tr className="border-b border-border/50">
                  <th className="px-8 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Candidato</th>
                  <th className="py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Oferta & Empresa</th>
                  <th className="py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Fecha</th>
                  <th className="py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Estado</th>
                  <th className="text-right px-8 py-4 text-[9px] font-black text-text-muted uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAll ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="px-8 py-4"><Skeleton className="h-10 w-full rounded-xl" /></td>
                      <td className="py-4"><Skeleton className="h-10 w-full rounded-xl" /></td>
                      <td className="py-4"><Skeleton className="h-10 w-full rounded-xl" /></td>
                      <td className="py-4"><Skeleton className="h-7 w-24 rounded-lg" /></td>
                      <td className="px-8 py-4"><Skeleton className="h-10 w-10 ml-auto rounded-xl" /></td>
                    </tr>
                  ))
                ) : postulaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12">
                      <EmptyState title="Sin resultados" description="No se encontraron postulaciones con los filtros actuales." />
                    </td>
                  </tr>
                ) : (
                  postulaciones.map((postulacion: any) => (
                    <tr key={postulacion.id} className="group hover:bg-primary-600/5 border-b border-border/30 transition-all duration-300">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-xl shadow-md border-2 border-surface">
                            <AvatarImage src={postulacion.egresado?.fotoUrl} className="object-cover" />
                            <AvatarFallback className="text-xs font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                              {postulacion.egresado?.nombres?.[0] || 'T'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-text-primary text-sm tracking-tight">{postulacion.egresado?.nombres} {postulacion.egresado?.apellidos}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">{postulacion.egresado?.carrera}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-sm text-text-primary tracking-tight">{postulacion.oferta?.titulo}</span>
                          <span className="text-[11px] text-primary-600 font-black">{postulacion.oferta?.empresa?.razonSocial}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-text-muted text-xs font-bold">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(postulacion.postuladoAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge 
                          className={cn(
                            "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg border-none shadow-sm",
                            postulacion.estado === 'CONTRATADO' ? 'bg-success/20 text-success' : 
                            postulacion.estado === 'RECHAZADO' ? 'bg-error/20 text-error' :
                            postulacion.estado === 'ENTREVISTA' ? 'bg-info/20 text-info' :
                            postulacion.estado === 'EN_REVISION' ? 'bg-warning/20 text-warning' : 'bg-primary-500/20 text-primary-600'
                          )}
                        >
                          {postulacion.estado.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="text-right px-8 py-4">
                        <Button variant="ghost" size="sm" className="font-bold rounded-xl" onClick={() => setSelectedPostulacion(postulacion)}>
                          Expediente <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="p-4 bg-bg-base/30 border-t border-border/50 flex items-center justify-between">
              <p className="text-xs text-text-muted font-bold">
                Página <span className="text-text-primary">{page}</span> de <span className="text-text-primary">{totalPages || 1}</span>
                <span className="ml-2 opacity-50 font-medium">({total} registros)</span>
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg h-8 text-[10px] font-black px-4 bg-surface/60 border-none">Ant.</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg h-8 text-[10px] font-black px-4 bg-surface/60 border-none">Sig.</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="pb-6 overflow-x-auto custom-scrollbar">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex gap-6 min-w-[1400px] pb-4">
              {ESTADOS.map((col) => (
                <KanbanColumn key={col.id} id={col.id} title={col.label} color={col.color} count={embudo?.[col.id]?.length ?? 0}>
                  <SortableContext items={embudo?.[col.id]?.map((p: any) => p.id) || []} strategy={verticalListSortingStrategy}>
                    {isLoadingOferta ? (
                      Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-2xl mb-4" />)
                    ) : (
                      embudo?.[col.id]?.map((postulacion: any) => (
                        <SortableCard 
                          key={postulacion.id} 
                          id={postulacion.id} 
                          postulacion={postulacion as Postulacion}
                          onClick={() => setSelectedPostulacion(postulacion as Postulacion)}
                        />
                      ))
                    )}
                  </SortableContext>
                </KanbanColumn>
              ))}
            </div>
          </DndContext>
        </div>
      )}

      <Sheet open={!!selectedPostulacion} onOpenChange={() => setSelectedPostulacion(null)}>
        <SheetContent className="sm:max-w-xl rounded-l-[2.5rem] border-none shadow-2xl bg-surface overflow-y-auto">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-600">
                <User className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black">Expediente del Candidato</SheetTitle>
                <SheetDescription className="font-bold text-[10px] uppercase tracking-widest text-text-muted">Gestión administrativa de postulación</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          {selectedPostulacion && (
            <div className="space-y-10 pb-10">
              <div className="p-6 rounded-[2rem] bg-bg-base/50 border border-border/50 shadow-inner flex items-center gap-6">
                <Avatar className="h-20 w-20 rounded-2xl shadow-xl ring-4 ring-surface">
                  <AvatarImage src={selectedPostulacion.egresado?.fotoUrl} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    {selectedPostulacion.egresado?.nombres?.[0] || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-2xl font-black text-text-primary tracking-tight">
                    {selectedPostulacion.egresado?.nombres} {selectedPostulacion.egresado?.apellidos}
                  </h4>
                  <p className="text-sm font-bold text-primary-600 uppercase tracking-widest">{selectedPostulacion.egresado?.carrera}</p>
                  <Link href={`/dashboard/admin/egresados/${selectedPostulacion.egresado?.id}`}>
                    <Button variant="link" className="p-0 h-auto text-xs font-bold text-text-muted hover:text-primary-600 gap-1 mt-2">
                      Ver perfil completo <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <History className="h-4 w-4" /> Línea de Tiempo
                </h5>
                {isLoadingAudits ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ) : (
                  <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                    {audits?.map((audit: any, i: number) => (
                      <div key={i} className="relative">
                        <div className={cn(
                          "absolute -left-8 top-1 h-6 w-6 rounded-full border-4 border-surface shadow-sm z-10",
                          audit.estadoNuevo === 'CONTRATADO' ? 'bg-success' :
                          audit.estadoNuevo === 'RECHAZADO' ? 'bg-error' :
                          audit.estadoNuevo === 'ENTREVISTA' ? 'bg-info' :
                          audit.estadoNuevo === 'EN_REVISION' ? 'bg-warning' : 'bg-primary-500'
                        )} />
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-border/50">{audit.estadoNuevo}</Badge>
                            <span className="text-[10px] text-text-muted font-bold">{new Date(audit.cambiadoAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-bold text-text-primary mt-1">{audit.comentario || 'Sin comentario.'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border/50 grid grid-cols-2 gap-4">
                <Button variant="secondary" className="font-black rounded-2xl h-12 gap-2 shadow-sm" asChild>
                  <a href={selectedPostulacion.egresado?.cvUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" /> CV
                  </a>
                </Button>
                <Button variant="outline" className="font-black rounded-2xl h-12 gap-2 border-2" asChild>
                   <a href={`mailto:${selectedPostulacion.egresado?.user?.email}`}>
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function KanbanColumn({ id, title, color, count, children }: any) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex flex-col w-[320px] shrink-0 bg-bg-elevated/20 backdrop-blur-sm rounded-[2rem] border border-border/40 shadow-sm">
      <div className="p-6 flex items-center justify-between border-b border-border/30 bg-bg-base/30 rounded-t-[2rem]">
        <div className="flex items-center gap-3">
          <div className={cn("h-3 w-3 rounded-full shadow-lg", color)} />
          <h3 className="font-black text-text-primary text-xs uppercase tracking-widest">{title}</h3>
        </div>
        <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5 h-6 bg-surface shadow-sm">{count}</Badge>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function SortableCard({ id, postulacion, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.3 : 1, zIndex: isDragging ? 50 : 1 };
  return (
    <Card ref={setNodeRef} style={style} variant="elevated" className={cn("cursor-grab active:cursor-grabbing hover:border-primary-500/50 transition-all duration-300 border-none shadow-md bg-surface/80 rounded-[1.5rem] group overflow-hidden", isDragging && "ring-2 ring-primary-500 shadow-2xl scale-[1.02]")} onClick={onClick} {...attributes} {...listeners}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 rounded-xl shadow-md border-2 border-surface">
            <AvatarImage src={postulacion.egresado?.fotoUrl} className="object-cover" />
            <AvatarFallback className="text-[12px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">{postulacion.egresado?.nombres?.[0] || 'T'}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-text-primary truncate tracking-tight">{postulacion.egresado?.nombres} {postulacion.egresado?.apellidos}</p>
            <p className="text-[10px] text-text-muted font-bold truncate uppercase tracking-tighter opacity-70">{postulacion.egresado?.carrera}</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] font-bold text-text-muted pt-3 border-t border-border/30">
          <div className="flex items-center gap-1.5 opacity-60"><Clock className="h-3.5 w-3.5" />{new Date(postulacion.postuladoAt).toLocaleDateString()}</div>
          <div className="h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
