'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Mail, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Globe, 
  Linkedin, 
  Github, 
  FileText,
  Calendar,
  Award,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PDFViewer } from '@/components/ui/pdf-viewer';

export default function EgresadoPerfilEmpresaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const queryClient = useQueryClient();
  const { data: egresado, isLoading, refetch } = (trpc as any).egresados.getById.useQuery({ id }, {
    staleTime: 0, // Siempre refetch cuando se monta
    refetchOnMount: 'always',
  }) as any;
  
  // Función para refrescar datos
  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: [['egresados', 'getById']] });
    await refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-1 rounded-3xl" />
          <Skeleton className="h-[600px] lg:col-span-2 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!egresado) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="h-20 w-20 bg-bg-base rounded-full flex items-center justify-center text-text-muted">
          <FileText className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black">Egresado no encontrado</h2>
        <Button variant="ghost" onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()} 
          className="h-12 w-12 rounded-xl bg-surface/50 hover:bg-surface shadow-sm"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <PageHeader 
          title="Perfil del Talento" 
          description="Información detallada del candidato para tu evaluación."
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="ml-auto rounded-xl"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md overflow-hidden rounded-3xl">
            <div className="h-32 bg-primary-600 relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Avatar className="h-24 w-24 rounded-2xl border-4 border-surface shadow-2xl">
                  <AvatarImage src={egresado?.fotoUrl} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black bg-primary-50 text-primary-600">
                    {egresado?.nombres?.[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-16 pb-8 px-8 text-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text-primary">
                  {egresado?.nombres} {egresado?.apellidos}
                </h3>
                <p className="text-sm font-bold text-primary-600 uppercase tracking-widest">{egresado?.carrera}</p>
                <div className="flex items-center justify-center gap-2 text-text-secondary pt-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-medium">{egresado?.user?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CV Section */}
          <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md overflow-hidden rounded-3xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <FileText className="h-5 w-5 text-primary-600" />
                Curriculum Vitae
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {egresado?.cvUrl ? (
                <PDFViewer 
                  url={egresado.cvUrl} 
                  title={`CV de ${egresado.nombres || 'Candidato'}`}
                >
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-12 rounded-xl group border-2"
                  >
                    <span className="flex items-center gap-2 font-bold text-sm">
                      <FileText className="h-5 w-5 text-text-muted group-hover:text-primary-600" />
                      Curriculum Vitae.pdf
                    </span>
                    <Download className="h-4 w-4 text-text-muted" />
                  </Button>
                </PDFViewer>
              ) : (
                <div className="text-center py-6 text-text-muted">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay CV disponible</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habilidades */}
          {egresado?.habilidades && egresado.habilidades.length > 0 && (
            <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <Award className="h-5 w-5 text-primary-600" />
                  Habilidades
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {egresado.habilidades.map((h: any, i: number) => (
                    <Badge key={i} variant="secondary" className="rounded-lg px-3 py-1">
                      {h.nombre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Resumen Profesional */}
          {egresado?.resumenProfesional && (
            <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <Briefcase className="h-5 w-5 text-primary-600" />
                  Resumen Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {egresado.resumenProfesional}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Experiencia */}
          {egresado?.experiencias && egresado.experiencias.length > 0 && (
            <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                  Experiencia Laboral
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {egresado.experiencias.map((exp: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary-200 pl-4 py-2">
                    <h4 className="font-bold text-text-primary">{exp.cargo}</h4>
                    <p className="text-sm text-text-secondary">{exp.empresa}</p>
                    <p className="text-xs text-text-muted mt-1">{exp.periodo}</p>
                    {exp.descripcion && (
                      <p className="text-sm text-text-secondary mt-2">{exp.descripcion}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Formación */}
          {egresado?.formacion && egresado.formacion.length > 0 && (
            <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md rounded-3xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-text-primary">
                  <GraduationCap className="h-5 w-5 text-primary-600" />
                  Formación Académica
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {egresado.formacion.map((form: any, i: number) => (
                  <div key={i} className="border-l-2 border-primary-200 pl-4 py-2">
                    <h4 className="font-bold text-text-primary">{form.titulo}</h4>
                    <p className="text-sm text-text-secondary">{form.institucion}</p>
                    <p className="text-xs text-text-muted mt-1">{form.anio}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
