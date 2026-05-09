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

export default function PublicOfertaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [carta, setCarta] = useState('');
  const [documentos, setDocumentos] = useState<{ tipo: 'CV' | 'CERTIFICADO' | 'CARTA' | 'PORTAFOLIO' | 'OTRO', nombre: string, url: string }[]>([]);

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
      setDocumentos([]); // Limpiar tras éxito
      await refetchPostulaciones();
    },
    onError: (e: any) => {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  }) as any;

  const yaPostulado = misPostulaciones?.data?.some((p: any) => p.oferta?.id === oferta?.id);

  const handlePostular = () => {
    if (!oferta?.id) return;
    postularMutation.mutate({ ofertaId: oferta.id, cartaPresentacion: carta, documentos });
  };

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

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Descripción del puesto</h3>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
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
                    <Briefcase className="h-4 w-4" /> Modalidad
                  </span>
                  <Badge variant="outline" className="font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                    {oferta.modalidad}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Salario
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {oferta.salarioMin ? (
                      `S/ ${oferta.salarioMin.toLocaleString()} - ${oferta.salarioMax?.toLocaleString()}`
                    ) : (
                      'No especificado'
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Users className="h-4 w-4" /> Postulantes
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {((oferta as unknown) as { _count?: { postulaciones: number } })._count?.postulaciones || 0} postulantes
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {!user ? (
                  <>
                    <Link href={`/auth/login?redirect=/ofertas/${id}`} className="inline-flex items-center justify-center w-full h-12 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 text-lg rounded-md shadow-md shadow-blue-100 dark:shadow-none transition-colors font-medium">
                      Postular ahora
                    </Link>
                    <p className="text-xs text-center text-slate-400 dark:text-slate-500">
                      Requiere iniciar sesión como Egresado
                    </p>
                  </>
                ) : user.role === 'EGRESADO' ? (
                  yaPostulado ? (
                    <Button disabled className="w-full h-12 text-lg font-medium opacity-50 cursor-not-allowed">
                      Ya estás postulado
                    </Button>
                  ) : (
                    <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <ModalTrigger asChild>
                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium">
                          Postular ahora
                        </Button>
                      </ModalTrigger>
                      <ModalContent>
                        <ModalHeader>
                          <ModalTitle>Postular a {oferta.titulo}</ModalTitle>
                          <ModalDescription>
                            Envía tu postulación. Puedes incluir una carta de presentación opcional.
                          </ModalDescription>
                        </ModalHeader>
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Carta de presentación (Opcional)
                            </label>
                            <Textarea 
                              placeholder="Destaca por qué eres el candidato ideal..."
                              rows={3}
                              value={carta}
                              onChange={(e) => setCarta(e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              Documentos Adjuntos (CV, Certificados, etc.)
                            </label>
                            <UploadDropzone
                              endpoint="documentUploader"
                              onClientUploadComplete={(res) => {
                                const newDocs = res.map((file) => ({
                                  tipo: 'OTRO' as const,
                                  nombre: file.name,
                                  url: file.url
                                }));
                                setDocumentos((prev) => [...prev, ...newDocs]);
                                toast({ title: 'Archivo subido', description: 'Documento adjuntado correctamente.' });
                              }}
                              onUploadError={(error: Error) => {
                                toast({ variant: 'destructive', title: 'Error al subir', description: error.message });
                              }}
                              className="ut-button:bg-blue-600 ut-button:ut-readying:bg-blue-600/50 ut-label:text-blue-600 ut-button:ut-uploading:bg-blue-600/50 ut-button:ut-uploading:after:bg-blue-600"
                            />
                            {documentos.length > 0 && (
                              <ul className="mt-3 space-y-2">
                                {documentos.map((doc, i) => (
                                  <li key={i} className="flex items-center justify-between p-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
                                    <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300 font-medium" title={doc.nombre}>{doc.nombre}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => setDocumentos(documentos.filter((_, idx) => idx !== i))}
                                      className="text-red-500 hover:text-red-700 font-bold px-2"
                                    >
                                      ✕
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                        <ModalFooter>
                          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancelar
                          </Button>
                          <Button 
                            disabled={postularMutation.isPending} 
                            onClick={handlePostular}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {postularMutation.isPending ? 'Enviando...' : 'Enviar postulación'}
                          </Button>
                        </ModalFooter>
                      </ModalContent>
                    </Modal>
                  )
                ) : (
                  <p className="text-sm text-center text-red-500 font-medium">
                    Solo los egresados pueden postular a ofertas.
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
