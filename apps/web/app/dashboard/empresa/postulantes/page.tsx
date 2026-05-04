'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreVertical,
  Briefcase,
  ExternalLink,
  History,
  FileText,
  Star,
  GraduationCap,
  Eye,
  User,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';
import type { RouterOutputs } from '@/lib/trpc/router.types';

type Postulacion = RouterOutputs['postulaciones']['postulantesDeOferta']['data'][number];

const ESTADOS = [
  { id: 'POSTULADO',   label: 'Postulados',   color: 'bg-blue-500' },
  { id: 'EN_REVISION', label: 'En Revisión',  color: 'bg-amber-500' },
  { id: 'ENTREVISTA',  label: 'Entrevista',   color: 'bg-purple-500' },
  { id: 'CONTRATADO',  label: 'Contratados',  color: 'bg-green-500' },
  { id: 'RECHAZADO',   label: 'Rechazados',   color: 'bg-red-500' },
];

export default function EmpresaPostulantesPage() {
  const searchParams = useSearchParams();
  const router      = useRouter();
  const ofertaId    = searchParams.get('ofertaId') ?? 'ALL';

  const [selectedPostulacion, setSelectedPostulacion] = useState<Postulacion | null>(null);
  const [showConfirmModal, setShowConfirmModal]       = useState<{ state: string; label: string } | null>(null);
  const [comentario, setComentario]                  = useState('');

  const { data: misOfertas } = (trpc as any).ofertas.misOfertas.useQuery({ limit: 100 }) as any;

  // Usamos el nuevo query para "Todas las vacantes" o el específico para una oferta
  const queryToUse = ofertaId === 'ALL' ? (trpc as any).postulaciones.misPostulantes : (trpc as any).postulaciones.postulantesDeOferta;
  const { data: postulantesData, isLoading, refetch } = queryToUse.useQuery(
    { ...(ofertaId !== 'ALL' ? { ofertaId } : {}), limit: 100 }
  ) as any;

  // Agrupar postulaciones por estado para el Kanban (solo si hay oferta seleccionada)
  const porEstado = (postulantesData?.data ?? []).reduce(
    (acc: any, p: any) => {
      if (acc[p.estado] === undefined) acc[p.estado] = [];
      acc[p.estado]!.push(p);
      return acc;
    },
    {},
  );

  const cambiarEstadoMutation = (trpc as any).postulaciones.cambiarEstado.useMutation({
    onSuccess: () => {
      toast({ title: 'Estado actualizado', description: 'El candidato ha sido movido con éxito.' });
      setShowConfirmModal(null);
      setComentario('');
      void refetch();
    },
    onError: (e: any) => {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: e.message });
    }
  }) as any;

  const handleOfertaChange = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id === 'ALL') params.delete('ofertaId');
    else params.set('ofertaId', id);
    router.push(`/dashboard/empresa/postulantes?${params.toString()}`);
  };

  const handleCambiarEstado = () => {
    if (selectedPostulacion === null || showConfirmModal === null) return;
    cambiarEstadoMutation.mutate({
      postulacionId: selectedPostulacion.id,
      nuevoEstado:   showConfirmModal.state,
      comentario:    comentario || undefined,
    });
  };

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in duration-700">
      <PageHeader 
        title="Gestión de Talentos" 
        description="Evalúa y selecciona a los mejores candidatos para tus vacantes."
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-text-muted uppercase hidden md:block">Vacante:</span>
            <Select value={ofertaId} onValueChange={handleOfertaChange}>
              <SelectTrigger className="w-[280px] bg-surface rounded-xl border-none shadow-sm h-11 font-bold">
                <Briefcase className="h-4 w-4 mr-2 text-primary-600" />
                <SelectValue placeholder="Selecciona una vacante" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-xl">
                <SelectItem value="ALL" className="font-bold">Todas las vacantes</SelectItem>
                {misOfertas?.data.map((o: any) => (
                  <SelectItem key={o.id} value={o.id}>{o.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageHeader>

      {/* Vista de "Todas las vacantes" (Lista Simple) */}
      {ofertaId === 'ALL' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Users className="h-4 w-4" /> Candidatos Recientes ({postulantesData?.total ?? 0})
            </h3>
          </div>
          
          <Card className="border-none shadow-xl bg-surface/40 backdrop-blur-md rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-bg-base/30">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Candidato</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Oferta</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Fecha</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5} className="px-6 py-4"><Skeleton className="h-10 w-full rounded-xl" /></td></tr>
                    ))
                  ) : postulantesData?.data.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted font-bold">No hay postulaciones registradas.</td></tr>
                  ) : (
                    postulantesData?.data.map((p: any) => (
                      <tr key={p.id} className="group hover:bg-bg-base/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 rounded-xl">
                              <AvatarImage src={p.egresado?.fotoUrl} />
                              <AvatarFallback className="font-bold bg-primary-100 text-primary-700">{p.egresado?.nombres[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary text-sm">{p.egresado?.nombres} {p.egresado?.apellidos}</span>
                              <span className="text-[10px] text-text-muted font-bold uppercase">{p.egresado?.carrera}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="border-primary-100 text-primary-600 font-bold bg-primary-50/30">
                            {p.oferta?.titulo}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={cn(
                            "px-3 py-1 text-[9px] font-black uppercase tracking-widest",
                            p.estado === 'POSTULADO' ? 'bg-blue-500 text-white' :
                            p.estado === 'EN_REVISION' ? 'bg-amber-500 text-white' :
                            p.estado === 'ENTREVISTA' ? 'bg-purple-500 text-white' :
                            p.estado === 'CONTRATADO' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          )}>
                            {p.estado}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-text-muted">
                          {new Date(p.postuladoAt).toLocaleDateString('es-PE')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-primary-50 hover:text-primary-600" onClick={() => setSelectedPostulacion(p)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Link href={`/dashboard/empresa/egresados/${p.egresado?.id}`}>
                              <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-amber-50 hover:text-amber-600">
                                <User className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        /* Vista de Kanban (Solo para oferta específica) */
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 h-full min-w-[1400px]">
            {ESTADOS.map((col) => (
              <div key={col.id} className="flex flex-col w-80 shrink-0 bg-bg-elevated/40 rounded-3xl border border-border/50 shadow-sm">
                <div className="p-5 flex items-center justify-between border-b border-border/30 bg-bg-base/30 rounded-t-3xl">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", col.color)} />
                    <h3 className="font-black text-text-primary text-xs uppercase tracking-widest">{col.label}</h3>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] px-2 py-0.5 h-6 bg-surface shadow-sm">
                    {porEstado[col.id]?.length ?? 0}
                  </Badge>
                </div>
                
                <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                    ))
                  ) : (
                    porEstado[col.id]?.map((postulacion: Postulacion) => (
                      <Card 
                        key={postulacion.id} 
                        variant="elevated" 
                        className="group hover:border-primary-500/50 transition-all duration-300 cursor-pointer active:scale-[0.98] border-none shadow-md bg-surface/80"
                        onClick={() => setSelectedPostulacion(postulacion)}
                      >
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 rounded-xl">
                                <AvatarImage src={postulacion.egresado?.fotoUrl} />
                                <AvatarFallback className="rounded-xl font-bold bg-primary-100 text-primary-700">
                                  {postulacion.egresado?.nombres?.[0] ?? '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate text-text-primary">
                                  {postulacion.egresado?.nombres} {postulacion.egresado?.apellidos}
                                </p>
                                <p className="text-[10px] text-text-muted truncate font-bold uppercase tracking-tight">
                                  {postulacion.egresado?.carrera}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {postulacion.egresado?.habilidades?.slice(0, 3).map((h: any) => (
                              <Badge key={h.nombre} variant="secondary" className="text-[9px] font-bold px-1.5 py-0 bg-bg-base/50">
                                {h.nombre}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                              <Clock className="h-3 w-3" />
                              {new Date(postulacion.postuladoAt).toLocaleDateString('es-PE')}
                            </div>
                            <Link href={`/dashboard/empresa/egresados/${postulacion.egresado?.id}`} onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-primary-50 hover:text-primary-600">
                                <User className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drawer Detalle Candidato */}
      <Sheet open={!!selectedPostulacion} onOpenChange={() => setSelectedPostulacion(null)}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto rounded-l-[2rem] border-none shadow-2xl bg-surface">
          <SheetHeader className="mb-8">
            <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-600">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black">Detalle de Postulación</SheetTitle>
                <SheetDescription className="font-bold text-text-muted uppercase text-[10px] tracking-widest">Estado actual: {selectedPostulacion?.estado}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {selectedPostulacion && (
            <div className="space-y-10 pb-10">
              <div className="flex items-center justify-between p-6 rounded-3xl bg-bg-base/50 border border-border/50 shadow-inner">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 rounded-2xl shadow-lg ring-4 ring-surface">
                    <AvatarImage src={selectedPostulacion.egresado?.fotoUrl} />
                    <AvatarFallback className="text-2xl font-bold bg-primary-100 text-primary-700">{selectedPostulacion.egresado?.nombres[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-text-primary">
                      {selectedPostulacion.egresado?.nombres} {selectedPostulacion.egresado?.apellidos}
                    </h3>
                    <p className="text-sm font-bold text-primary-600 uppercase tracking-widest">{selectedPostulacion.egresado?.carrera}</p>
                    <Link href={`/dashboard/empresa/egresados/${selectedPostulacion.egresado?.id}`}>
                      <Button variant="link" className="p-0 h-auto text-xs font-bold text-text-muted hover:text-primary-600 gap-1 mt-2">
                        <User className="h-3 w-3" /> Ver perfil completo profesional <ExternalLink className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" /> Habilidades Clave
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedPostulacion.egresado?.habilidades?.map((h: any) => (
                      <Badge key={h.nombre} variant="secondary" className="font-bold px-3 py-1 bg-bg-base text-text-primary border border-border/50">
                        {h.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" /> Documentación
                  </h4>
                  {selectedPostulacion.egresado?.cvUrl ? (
                    <Button 
                      variant="outline" 
                      className="w-full justify-between h-12 rounded-2xl group border-2 border-border/50 hover:border-primary-500/30 bg-bg-base/30"
                      asChild
                    >
                      <a href={selectedPostulacion.egresado.cvUrl} target="_blank" rel="noopener noreferrer" download>
                        <span className="flex items-center gap-2 font-bold text-sm">
                          <FileText className="h-5 w-5 text-text-muted group-hover:text-primary-600" />
                          Descargar CV Académico
                        </span>
                        <Download className="h-4 w-4 text-text-muted" />
                      </a>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      disabled 
                      className="w-full justify-between h-12 rounded-2xl group border-2 border-border/50 opacity-50 cursor-not-allowed bg-bg-base/30"
                    >
                      <span className="flex items-center gap-2 font-bold text-sm text-text-muted">
                        <FileText className="h-5 w-5" />
                        Sin CV cargado
                      </span>
                    </Button>
                  )}
                </div>
              </div>

              {selectedPostulacion.cartaPresentacion && (
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Mensaje del Candidato</h4>
                  <div className="p-6 rounded-3xl bg-bg-base/50 border border-border/50 relative">
                     <div className="absolute top-4 right-4 opacity-10">
                      <MessageSquare className="h-10 w-10" />
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed italic font-medium">
                      "{selectedPostulacion.cartaPresentacion}"
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                  <History className="h-4 w-4" /> Historial de Selección
                </h4>
                <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                  {selectedPostulacion.audits?.map((audit: any, i: any) => (
                    <div key={i} className="relative">
                      <div className={cn(
                        'absolute -left-8 top-1 h-6 w-6 rounded-full border-4 border-surface shadow-sm z-10',
                        audit.estadoNuevo === 'CONTRATADO' ? 'bg-green-500' :
                        audit.estadoNuevo === 'RECHAZADO'  ? 'bg-red-500'   :
                        audit.estadoNuevo === 'ENTREVISTA' ? 'bg-purple-500' :
                        audit.estadoNuevo === 'EN_REVISION'? 'bg-amber-500'  : 'bg-blue-500'
                      )} />
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Badge variant="outline" className="text-[10px] font-black uppercase border-border/50 text-text-muted">
                            {audit.estadoNuevo}
                          </Badge>
                          <span className="text-[10px] text-text-muted font-bold">
                            {new Date(audit.cambiadoAt).toLocaleDateString('es-PE')}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-text-primary">{audit.comentario ?? 'Sin observaciones registradas.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-border/50 flex flex-wrap gap-3">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white font-black flex-1 rounded-2xl h-12 gap-2 shadow-lg shadow-green-500/20"
                  onClick={() => setShowConfirmModal({ state: 'CONTRATADO', label: 'Contratar' })}
                >
                  <CheckCircle2 className="h-5 w-5" /> Contratar
                </Button>
                <Button
                  variant="secondary"
                  className="font-black flex-1 rounded-2xl h-12 gap-2 shadow-sm"
                  onClick={() => setShowConfirmModal({ state: 'ENTREVISTA', label: 'Citar a Entrevista' })}
                >
                  <MessageSquare className="h-5 w-5" /> Entrevista
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:bg-red-50 font-black flex-1 rounded-2xl h-12 gap-2"
                  onClick={() => setShowConfirmModal({ state: 'RECHAZADO', label: 'Descartar' })}
                >
                  <XCircle className="h-5 w-5" /> Descartar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal Confirmación Cambio Estado */}
      <Modal open={!!showConfirmModal} onOpenChange={() => setShowConfirmModal(null)}>
        <ModalContent className="rounded-[2.5rem] p-10 border-none shadow-2xl bg-surface">
          <ModalHeader>
            <ModalTitle className="text-2xl font-black">Confirmar Acción</ModalTitle>
            <ModalDescription className="text-base font-medium text-text-secondary">
              ¿Deseas mover a <span className="text-primary-600 font-black">{selectedPostulacion?.egresado?.nombres}</span> a la etapa de <span className="font-black text-text-primary underline decoration-primary-500/30 decoration-4">{showConfirmModal?.label}</span>?
            </ModalDescription>
          </ModalHeader>
          <div className="py-6 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Observaciones del Reclutador</label>
            <textarea 
              className="flex min-h-[120px] w-full rounded-2xl border-none bg-bg-base/50 px-4 py-3 text-sm font-medium shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all"
              placeholder="Escribe aquí los motivos o notas sobre el candidato..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
            />
          </div>
          <ModalFooter className="gap-3">
            <Button variant="ghost" onClick={() => setShowConfirmModal(null)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button
              className={cn(
                'font-black px-10 rounded-xl h-12 shadow-xl',
                showConfirmModal?.state === 'RECHAZADO' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/20' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-primary-500/20',
              )}
              onClick={handleCambiarEstado}
              disabled={cambiarEstadoMutation.isPending}
            >
              {cambiarEstadoMutation.isPending ? 'Procesando...' : 'Confirmar Acción'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
