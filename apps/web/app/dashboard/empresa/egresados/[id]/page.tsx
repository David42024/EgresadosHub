'use client';

import { useParams, useRouter } from 'next/navigation';
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
  Download
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function EgresadoPerfilEmpresaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const { data: egresado, isLoading } = (trpc as any).egresados.getById.useQuery({ id }) as any;

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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="elevated" className="border-none shadow-xl bg-surface/60 backdrop-blur-md overflow-hidden rounded-3xl">
            <div className="h-32 bg-primary-600 relative">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <Avatar className="h-24 w-24 rounded-2xl border-4 border-surface shadow-2xl">
                  <AvatarImage src={egresado.fotoUrl} className="object-cover" />
                  <AvatarFallback className="text-2xl font-black bg-primary-50 text-primary-600">
                    {egresado.nombres[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-16 pb-8 px-8 text-center space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-text-primary">
                  {egresado.nombres} {egresado.apellidos}
                </h3>
                <p className="text-sm font-bold text-primary-600 uppercase tracking-widest">{egresado.carrera}</p>
                <div className="flex items-center justify-center gap-2 text-text-secondary pt-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xs font-medium">{egresado.user?.email}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-border/50 space-y-4">
                <div className="flex justify-center gap-4">
                  {egresado.linkedinUrl && (
                    <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 shadow-sm" asChild>
                      <a href={egresado.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {egresado.githubUrl && (
                    <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 shadow-sm" asChild>
                      <a href={egresado.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  {egresado.webPersonal && (
                    <Button variant="secondary" size="icon" className="rounded-xl h-10 w-10 shadow-sm" asChild>
                      <a href={egresado.webPersonal} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
                <Button className="w-full rounded-xl font-bold gap-2 h-11" asChild>
                  <a href={`mailto:${egresado.user?.email}`}>
                    <Mail className="h-4 w-4" /> Contactar Candidato
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="border-none shadow-lg bg-surface/40 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <FileText className="h-4 w-4" /> Documentación
            </h4>
            {egresado.cvUrl ? (
              <Button 
                variant="outline" 
                className="w-full justify-between h-12 rounded-xl group border-2"
                asChild
              >
                <a href={egresado.cvUrl} target="_blank" rel="noopener noreferrer" download>
                  <span className="flex items-center gap-2 font-bold text-sm">
                    <FileText className="h-5 w-5 text-text-muted group-hover:text-primary-600" />
                    Curriculum Vitae.pdf
                  </span>
                  <Download className="h-4 w-4 text-text-muted" />
                </a>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                disabled 
                className="w-full justify-between h-12 rounded-xl group border-2 opacity-50 cursor-not-allowed"
              >
                <span className="flex items-center gap-2 font-bold text-sm text-text-muted">
                  <FileText className="h-5 w-5" />
                  Sin CV cargado
                </span>
              </Button>
            )}
            <h4 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
              <Award className="h-4 w-4" /> Logros Académicos
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-bg-base/50 border border-border/30">
                <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-text-primary">Egresado {egresado.anioEgreso}</p>
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-tight">Universidad Nacional de Trujillo</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          <Card variant="elevated" className="border-none shadow-xl bg-surface/40 rounded-3xl">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-600/10 flex items-center justify-center text-primary-600">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black">Resumen Profesional</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="text-text-secondary leading-relaxed text-base">
                {egresado.resumenProfesional || "El candidato aún no ha proporcionado una descripción profesional."}
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated" className="border-none shadow-xl bg-surface/40 rounded-3xl overflow-hidden">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-600/10 flex items-center justify-center text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl font-black">Competencias y Habilidades</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 space-y-8">
              {/* Categorías de habilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Habilidades Técnicas</h5>
                  <div className="flex flex-wrap gap-2">
                    {egresado.habilidades?.map((h: any) => (
                      <Badge key={h.nombre} variant="secondary" className="px-3 py-1.5 rounded-lg bg-bg-base text-text-primary border border-border/50 font-bold hover:border-primary-500/50 transition-colors">
                        {h.nombre}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated" className="border-none shadow-xl bg-surface/40 rounded-3xl overflow-hidden">
            <CardHeader className="px-8 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-600/10 flex items-center justify-center text-amber-600">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl font-black">Experiencia Laboral</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {(!egresado.experiencias || egresado.experiencias.length === 0) ? (
                <div className="py-12 text-center bg-bg-base/30 rounded-2xl border border-dashed border-border/50">
                  <Briefcase className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-20" />
                  <p className="text-text-secondary font-medium">No se ha registrado experiencia laboral detallada.</p>
                </div>
              ) : (
                <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                  {egresado.experiencias.map((exp: any, idx: number) => (
                    <div key={idx} className="relative pl-12">
                      <div className="absolute left-0 top-1.5 h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-primary-600 shadow-sm z-10">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-black text-text-primary">{exp.cargo}</h4>
                          <span className="text-[10px] font-black uppercase bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-2 py-1 rounded-md">
                            {exp.desde} - {exp.actual ? 'Actualidad' : exp.hasta}
                          </span>
                        </div>
                        <p className="font-bold text-primary-600">{exp.empresa}</p>
                        <p className="text-sm text-text-secondary leading-relaxed pt-2">
                          {exp.descripcion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
