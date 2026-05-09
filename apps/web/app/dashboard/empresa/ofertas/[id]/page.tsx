'use client';

import { useParams, useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Edit,
  PauseCircle,
  PlayCircle,
  XCircle,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

export default function OfertaDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: oferta, isLoading, refetch } = (trpc as any).ofertas.getById.useQuery({ id }) as any;

  const publicarMutation = (trpc as any).ofertas.publicar.useMutation({
    onSuccess: async () => {
      toast({ title: "Oferta activada", description: "La oferta ahora es visible para los egresados." });
      await refetch();
    }
  }) as any;

  const pausarMutation = (trpc as any).ofertas.pausar.useMutation({
    onSuccess: async () => {
      toast({ title: "Oferta pausada", description: "La oferta se ha guardado como borrador." });
      await refetch();
    }
  }) as any;

  const cerrarMutation = (trpc as any).ofertas.cerrar.useMutation({
    onSuccess: async () => {
      toast({ title: "Oferta cerrada", description: "La oferta ya no es visible para los egresados." });
      await refetch();
    }
  }) as any;

  if (isLoading) return <div className="p-8 space-y-8"><Skeleton className="h-10 w-64" /><Skeleton className="h-[400px] w-full" /></div>;
  if (!oferta) return <div className="p-8 text-center"><p>Oferta no encontrada.</p></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" className="gap-2 font-bold" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> Volver a la lista
        </Button>
      </div>

      <PageHeader
        title={oferta.titulo}
        description={`Publicada el ${new Date(oferta.createdAt).toLocaleDateString()}`}
      >
        <div className="flex flex-wrap gap-3">
          {oferta.estado === 'BORRADOR' && (
            <Button
              variant="primary"
              className="gap-2 font-bold bg-success hover:bg-success/90 text-white border-none shadow-lg shadow-success/20"
              onClick={() => publicarMutation.mutate({ id })}
              disabled={publicarMutation.isPending}
            >
              <PlayCircle className="h-4 w-4" /> Activar Oferta
            </Button>
          )}

          {oferta.estado === 'ACTIVA' && (
            <Button
              variant="outline"
              className="gap-2 font-bold border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10"
              onClick={() => pausarMutation.mutate({ id })}
              disabled={pausarMutation.isPending}
            >
              <PauseCircle className="h-4 w-4" /> Pausar
            </Button>
          )}

          <Button variant="secondary" className="gap-2 font-bold" asChild>
            <Link href={`/dashboard/empresa/ofertas/editar/${id}`}>
              <Edit className="h-4 w-4" /> Editar
            </Link>
          </Button>

          <Button
            variant="destructive"
            className="gap-2 font-bold"
            onClick={() => {
              if (confirm("¿Estás seguro de cerrar esta oferta definitivamente?")) {
                cerrarMutation.mutate({ id });
              }
            }}
            disabled={cerrarMutation.isPending}
          >
            <XCircle className="h-4 w-4" /> Cerrar
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Detalles Principales */}
          <Card variant="elevated" className="border-none shadow-xl overflow-hidden bg-surface/50 backdrop-blur-md">
            <CardHeader className="bg-bg-base/30 border-b border-border p-8">
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="px-3 py-1 font-black uppercase tracking-widest border-primary-500 text-primary-600 bg-primary-50/50">{oferta.modalidad}</Badge>
                <Badge variant={oferta.estado === 'ACTIVA' ? 'success' : oferta.estado === 'CERRADA' ? 'secondary' : 'warning'} className="px-3 py-1 font-black uppercase tracking-widest shadow-sm">
                  {oferta.estado}
                </Badge>
                <div className="flex items-center gap-2 text-sm font-bold text-text-muted ml-auto">
                  <MapPin className="h-4 w-4" /> {oferta.ubicacion}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h3 className="text-xl font-black text-text-primary mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary-600" /> Descripción del Puesto
                  </h3>
                  <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-base italic">
                    "{oferta.descripcion}"
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" /> Cronograma de Convocatoria
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-muted">Fecha de Creación:</span>
                        <span className="text-sm font-black text-text-primary">{new Date(oferta.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-text-muted">Fecha Límite:</span>
                        <Badge variant="outline" className={cn(
                          "font-black border-none",
                          oferta.cierraAt && new Date(oferta.cierraAt) < new Date() ? "bg-red-500/10 text-red-600" : "bg-primary-600/10 text-primary-600"
                        )}>
                          {oferta.cierraAt ? new Date(oferta.cierraAt).toLocaleDateString() : 'Sin fecha límite'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {oferta.documentosRequeridos && oferta.documentosRequeridos.length > 0 && (
                    <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                      <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2 mb-3">
                        <Wrench className="h-4 w-4" /> Documentos Solicitados
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {oferta.documentosRequeridos.map((doc: string) => (
                          <Badge key={doc} variant="secondary" className="bg-bg-base font-bold text-[10px] uppercase">
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {oferta.habilidadesReq && oferta.habilidadesReq.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-border/50">
                  <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-600" /> Habilidades Técnicas Buscadas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {oferta.habilidadesReq.map((h: string) => (
                      <Badge key={h} variant="secondary" className="bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400 px-4 py-1.5 font-bold border-none shadow-sm">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidatos Recientes */}
          <Card variant="elevated" className="border-none shadow-lg bg-surface/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black">Candidatos Recientes</CardTitle>
                <CardDescription>Egresados que han postulado a esta vacante</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="font-bold text-primary-600 hover:bg-primary-50" asChild>
                <Link href={`/dashboard/empresa/postulantes?ofertaId=${id}`}>
                  Ver todos <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="p-12 text-center border-2 border-dashed border-border rounded-[2rem] bg-bg-base/30">
                <Users className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-20" />
                <p className="text-text-secondary font-bold">No hay postulaciones registradas todavía.</p>
                <p className="text-xs text-text-muted mt-1">Las nuevas postulaciones aparecerán aquí automáticamente.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Informativo */}
        <div className="space-y-6">
          <Card variant="elevated" className="border-none shadow-lg bg-surface">
            <CardHeader>
              <CardTitle className="text-base font-black uppercase tracking-widest text-text-muted">Resumen Financiero</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-5 rounded-2xl bg-bg-base border border-border/50 flex items-center gap-4 shadow-inner">
                <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Presupuesto Mensual</p>
                  <p className="text-base font-black text-text-primary">
                    S/ {Number(oferta.salarioMin).toLocaleString()} - S/ {Number(oferta.salarioMax || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bg-base border border-border/50 flex items-center gap-4 shadow-inner">
                <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Interesados</p>
                  <p className="text-base font-black text-text-primary">{oferta.totalPostulaciones || 0} postulantes</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-bg-base border border-border/50 flex items-center gap-4 shadow-inner">
                <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Estado Actual</p>
                  <p className="text-base font-black text-text-primary">{oferta.estado}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" className="bg-primary-600 text-white border-none p-8 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-2xl font-black">Gestión de Talento</h4>
              <p className="text-sm text-primary-50 leading-relaxed font-medium">
                Recuerda que una oferta activa atrae candidatos constantemente. Si ya encontraste a alguien, puedes pausarla para revisar los CVs con calma.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/10 rounded-full blur-3xl" />
          </Card>
        </div>
      </div>
    </div>
  );
}
