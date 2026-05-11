import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createServerTrpcClient } from '@/lib/trpc/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Briefcase, 
  Wrench, 
  Linkedin, 
  Github, 
  Globe, 
  FileText,
  ExternalLink,
  Download,
} from 'lucide-react';

interface Props {
  params: { id: string };
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const api = await createServerTrpcClient();
    const profile = await api.egresados.getPublicProfile.query({ id: params.id });
    
    if (!profile) {
      return {
        title: 'Perfil no encontrado',
        description: 'El perfil del egresado no existe o no está disponible.',
      };
    }

    return {
      title: `${profile.nombreCompleto} — Egresado`,
      description: profile.resumenProfesional || `${profile.carrera} — Egresado de la UNT`,
      openGraph: {
        title: `${profile.nombreCompleto} — Egresado`,
        description: profile.resumenProfesional || `${profile.carrera} — Egresado de la UNT`,
        images: profile.fotoUrl ? [profile.fotoUrl] : undefined,
      },
    };
  } catch {
    return {
      title: 'Perfil no encontrado',
      description: 'El perfil del egresado no existe o no está disponible.',
    };
  }
}

export default async function EgresadoPublicProfilePage({ params }: Props) {
  let profile;
  
  try {
    const api = await createServerTrpcClient();
    profile = await api.egresados.getPublicProfile.query({ id: params.id });
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  const hasCv = !!profile.cvUrl;
  const hasSocials = profile.redesSociales && 
    (profile.redesSociales.linkedin || profile.redesSociales.github || profile.redesSociales.portfolio);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-gray-800 shadow-xl">
              <AvatarImage src={profile.fotoUrl || ''} />
              <AvatarFallback className="text-3xl md:text-4xl font-bold bg-blue-100 text-blue-600">
                {profile.nombres[0]}{profile.apellidos[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.nombreCompleto}</h1>
              <p className="text-lg text-blue-100 mt-1">{profile.carrera}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Egresado {profile.anioEgreso}
                </Badge>
                {profile.ubicacion && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    <MapPin className="h-3 w-3 mr-1" />
                    {profile.ubicacion}
                  </Badge>
                )}
                <Badge className="bg-green-500 text-white border-0">
                  Perfil Verificado
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen Profesional */}
            {profile.resumenProfesional && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Resumen Profesional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {profile.resumenProfesional}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experiencia Laboral */}
            {profile.experiencias && profile.experiencias.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-amber-600" />
                    Experiencia Laboral
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.experiencias.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{exp.cargo}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{exp.empresa}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {exp.desde} — {exp.actual ? 'Presente' : exp.hasta}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Formación Académica */}
            {profile.formacion && profile.formacion.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Formación Académica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.formacion.map((form: any, index: number) => (
                    <div key={index} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{form.titulo}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{form.institucion}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {form.desde} — {form.actual ? 'Presente' : form.hasta}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Habilidades */}
            {profile.habilidades && profile.habilidades.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" />
                    Habilidades
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.habilidades.map((hab: any, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className={`
                          ${hab.categoria === 'TECNICA' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                          ${hab.categoria === 'BLANDA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                          ${hab.categoria === 'IDIOMA' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        `}
                      >
                        {hab.nombre}
                        {hab.nivel && (
                          <span className="ml-1 opacity-70">• {hab.nivel}/5</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Redes Sociales */}
            {hasSocials && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-600" />
                    Redes Profesionales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile.redesSociales?.linkedin && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      asChild
                    >
                      <a href={profile.redesSociales.linkedin} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    </Button>
                  )}
                  {profile.redesSociales?.github && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      asChild
                    >
                      <a href={profile.redesSociales.github} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    </Button>
                  )}
                  {profile.redesSociales?.portfolio && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a href={profile.redesSociales.portfolio} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                        Portfolio
                        <ExternalLink className="h-3 w-3 ml-auto" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* CV Download */}
            {hasCv && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-red-600" />
                    Curriculum Vitae
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
                    asChild
                  >
                    <a href={profile.cvUrl!} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                      Descargar CV
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
