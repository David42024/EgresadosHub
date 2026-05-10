'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Briefcase,
  MapPin,
  DollarSign,
  ChevronLeft,
  Building2,
  Calendar,
  Target,
  ArrowRight,
  GraduationCap,
  Users,
  Search
} from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuthStore } from '@/lib/auth-store';
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { UploadDropzone } from '@/lib/uploadthing';
import { cn, parseFechaLimite } from '@/lib/utils';

export default function PublicOfertaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carta, setCarta] = useState('');
  // Map de nombre-documento -> {nombre, url} para tracking por campo
  const [documentosMap, setDocumentosMap] = useState<Record<string, { nombre: string; url: string } | null>>({});

  // Increment vistas on load
  const incrementVistasMutation = (trpc as any).ofertas.incrementVistas.useMutation() as any;
  useEffect(() => {
    if (id) {
      incrementVistasMutation.mutate({ id });
    }
  }, [id]);

  const { data: oferta, isLoading, error } = (trpc as any).ofertas.publicGetById.useQuery({ id }) as any;

  const { data: misPostulaciones, refetch: refetchPostulaciones } = (trpc as any).postulaciones.misPostulaciones.useQuery(
    { limit: 100 },
    { enabled: user?.role === 'EGRESADO' }
  ) as any;

  const postularMutation = (trpc as any).postulaciones.postular.useMutation({
    onSuccess: async () => {
      toast({ title: '¡Postulación exitosa!', description: 'Has postulado a esta oferta laboral.' });
      setIsModalOpen(false);
      setDocumentosMap({}); // Limpiar tras éxito
      await refetchPostulaciones();
    },
    onError: (e: any) => {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  }) as any;

  const yaPostulado = misPostulaciones?.data?.some((p: any) => p.oferta?.id === oferta?.id);

  const handlePostular = () => {
    if (!oferta?.id) return;
    // Convertir el map a array de documentos para el payload
    const documentos = Object.values(documentosMap).filter(Boolean).map(d => ({
      tipo: 'OTRO' as const,
      nombre: d!.nombre,
      url: d!.url,
    }));
    console.log('[Postulación] Enviando documentos:', documentos);
    postularMutation.mutate({ ofertaId: oferta.id, cartaPresentacion: carta, documentos });
  };

  // Docs requeridos de la oferta (se inicializan en el modal al abrirse)
  const docsRequeridos: string[] = oferta?.documentosRequeridos ?? ['CV Base'];
  const allDocsUploaded = docsRequeridos.every(doc => documentosMap[doc]?.url);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
          <Skeleton className="h-10 w-32 dark:bg-slate-800" />
          <Card className="p-8 space-y-6 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex gap-6">
              <Skeleton className="h-20 w-20 rounded-2xl dark:bg-slate-800" />
              <div className="space-y-3 flex-grow">
                <Skeleton className="h-8 w-1/2 dark:bg-slate-800" />
                <Skeleton className="h-5 w-1/4 dark:bg-slate-800" />
              </div>
            </div>
            <Skeleton className="h-64 w-full dark:bg-slate-800" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !oferta) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
        <Card className="p-8 text-center max-w-md border-slate-200 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Oferta no encontrada</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">La oferta que buscas no existe o ha sido dada de baja.</p>
          <Link href="/ofertas" className="inline-flex items-center justify-center h-10 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md font-medium text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
            Volver al marketplace
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
      {/* Nav */}
      <nav className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <GraduationCap className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              Egresados<span className="text-blue-600 dark:text-blue-500">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/ofertas" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Search className="h-4 w-4" /> Ofertas Laborales
            </Link>
            <ThemeToggle />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            {user ? (
              <Link href={user.role === 'ADMINISTRADOR' ? '/dashboard/admin' : user.role === 'EMPRESA' ? '/dashboard/empresa/perfil' : '/dashboard/egresado/ofertas'} className="inline-flex items-center justify-center h-10 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
                Ir a mi Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="inline-flex items-center justify-center h-10 px-4 py-2 bg-slate-900 dark:bg-white text-slate-50 dark:text-slate-900 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/ofertas"
          className="inline-flex items-center text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-6 group"
        >
          <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver a todas las ofertas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-8">
                <div className="h-20 w-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                  {oferta.empresa?.logoUrl ? (
                    <img src={oferta.empresa.logoUrl} alt={oferta.empresa.razonSocial} className="h-12 w-12 object-contain" />
                  ) : (
                    <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                  )}
                </div>
                <div className="flex-grow">
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                    {oferta.titulo}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      {oferta.empresa?.razonSocial || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      {oferta.ubicacion || 'Remoto'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      Publicada el {new Date(oferta.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Descripción del puesto</h3>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                  {oferta.descripcion}
                </div>

                {oferta.requisitos && oferta.requisitos.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Requisitos</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0">
                      {oferta.requisitos.split('\n').filter((req: string) => req.trim().length > 0).map((req: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                          <Target className="h-4 w-4 text-blue-500 dark:text-blue-400 mt-1 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-24 transition-colors">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                Resumen de la oferta
              </h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Fecha Límite
                  </span>
                  <Badge variant="outline" className={cn(
                    "font-black border-none",
                    parseFechaLimite(oferta.cierraAt) && parseFechaLimite(oferta.cierraAt)! < new Date() ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
                  )}>
                    {parseFechaLimite(oferta.cierraAt)?.toLocaleDateString() ?? 'Sin límite'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Postulantes
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {Number(oferta.totalPostulaciones || 0)} postulantes
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {!user ? (
                  <>
                    <Link href={`/auth/login?redirect=/ofertas/${id}`} className="inline-flex items-center justify-center w-full h-12 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 text-lg rounded-xl shadow-lg shadow-blue-500/20 transition-all font-bold">
                      Postular ahora
                    </Link>
                    <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-widest">
                      Requiere cuenta de Egresado
                    </p>
                  </>
                ) : user.role === 'EGRESADO' ? (
                  yaPostulado ? (
                    <Button disabled className="w-full h-12 rounded-xl text-lg font-bold bg-slate-100 text-slate-400 border-none">
                      Ya estás postulado
                    </Button>
                  ) : (oferta.cierraAt && parseFechaLimite(oferta.cierraAt)! < new Date()) ? (
                    <Button disabled className="w-full h-12 rounded-xl text-lg font-bold bg-red-50 text-red-400 border-none">
                      Convocatoria Cerrada
                    </Button>
                  ) : (
                    <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <ModalTrigger asChild>
                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-500/20">
                          Postular ahora
                        </Button>
                      </ModalTrigger>
                      <ModalContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                          <ModalTitle className="text-2xl font-black">Postular a {oferta.titulo}</ModalTitle>
                          <ModalDescription className="text-blue-100 font-medium">
                            Completa los requisitos solicitados por la empresa para continuar.
                          </ModalDescription>
                        </div>

                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-950">
                          <div className="space-y-3">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                              <Target className="h-4 w-4" /> Carta de Presentación
                            </label>
                            <Textarea
                              placeholder="Escribe un breve mensaje para el reclutador..."
                              className="min-h-[120px] rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                              value={carta}
                              onChange={(e) => setCarta(e.target.value)}
                            />
                          </div>

                          <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="h-4 w-4 text-slate-400" />
                              <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                Documentos Requeridos
                              </label>
                              <span className="ml-auto text-[10px] font-bold text-slate-500 dark:text-slate-400">
                                {Object.values(documentosMap).filter(Boolean).length}/{docsRequeridos.length} subidos
                              </span>
                            </div>

                            {docsRequeridos.map((docNombre: string) => {
                              const uploaded = documentosMap[docNombre];
                              return (
                                <div key={docNombre} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                      {uploaded ? (
                                        <span className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px]">✓</span>
                                      ) : (
                                        <span className="h-4 w-4 rounded-full border-2 border-slate-300 dark:border-slate-600 inline-block" />
                                      )}
                                      {docNombre}
                                    </span>
                                    {uploaded && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDocumentosMap(prev => ({ ...prev, [docNombre]: null }));
                                          console.log('[Upload] Documento eliminado:', docNombre);
                                        }}
                                        className="text-xs text-red-400 hover:text-red-600 font-bold"
                                      >
                                        Quitar
                                      </button>
                                    )}
                                  </div>
                                  {uploaded ? (
                                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
                                      <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-500/20 flex items-center justify-center shrink-0">
                                        <Briefcase className="h-4 w-4 text-green-600 dark:text-green-400" />
                                      </div>
                                      <span className="truncate text-xs font-bold text-green-700 dark:text-green-400" title={uploaded.nombre}>
                                        {uploaded.nombre}
                                      </span>
                                    </div>
                                  ) : (
                                    <UploadDropzone
                                      endpoint="documentUploader"
                                      onClientUploadComplete={(res) => {
                                        const file = res[0];
                                        if (!file) return;
                                        console.log(`[Upload] ${docNombre} subido:`, file.url);
                                        setDocumentosMap(prev => ({
                                          ...prev,
                                          [docNombre]: { nombre: file.name, url: file.url }
                                        }));
                                        toast({ title: 'Archivo subido', description: `${docNombre} adjuntado correctamente.` });
                                      }}
                                      onUploadError={(error: Error) => {
                                        console.error(`[Upload Error] ${docNombre}:`, error.message);
                                        toast({ variant: 'destructive', title: `Error al subir ${docNombre}`, description: error.message });
                                      }}
                                      className="ut-button:bg-blue-600 ut-label:text-blue-600 dark:ut-label:text-blue-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors ut-upload-icon:hidden"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <ModalFooter className="p-8 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                          <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold dark:text-slate-300 dark:hover:bg-slate-800">
                            Cancelar
                          </Button>
                          <Button
                            disabled={postularMutation.isPending || !allDocsUploaded}
                            onClick={handlePostular}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
                          >
                            {postularMutation.isPending ? 'Enviando...' : !allDocsUploaded ? `Faltan ${docsRequeridos.filter(d => !documentosMap[d]?.url).length} documento(s)` : 'Confirmar Postulación'}
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  )
                ) : (
                  <p className="text-sm text-center text-red-500 font-medium">
                    Solo los egresados pueden postular.
                  </p>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Sobre la empresa</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{oferta.empresa?.razonSocial || 'N/A'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{oferta.empresa?.sector || 'Sector no especificado'}</p>
                  </div>
                </div>
                <Link href={`/empresas/${oferta.empresa?.id}`} className="inline-flex items-center justify-center w-full h-9 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-md transition-colors font-medium">
                  Ver perfil de empresa <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
