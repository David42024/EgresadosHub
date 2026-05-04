'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Globe, Briefcase, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

export default function EmpresaPerfilPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: empresa, isLoading, error } = (trpc as any).empresas.getPublicProfile.useQuery(
    { id },
    { enabled: !!id }
  ) as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Empresa no encontrada o error al cargar.</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  const companyName = empresa.nombreComercial ?? empresa.razonSocial ?? 'Empresa';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title="Perfil de Empresa" 
          description={`Conoce más sobre ${companyName}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles de la Empresa */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Avatar className="h-32 w-32 mx-auto rounded-xl border-4 border-white shadow-lg mb-4">
                <AvatarImage src={empresa.logoUrl} />
                <AvatarFallback className="text-4xl font-bold bg-blue-50 text-blue-600">
                  {companyName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold">{companyName}</h2>
              <Badge className="mt-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {empresa.sector}
              </Badge>
              {empresa.verificada && (
                <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  Verificada
                </Badge>
              )}
              
              <div className="mt-6 space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{empresa.ubicacion}</span>
                </div>
                {empresa.sitioWeb && (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Globe className="h-4 w-4" />
                    <a href={empresa.sitioWeb} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                      Visitar sitio web
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {empresa.descripcion && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acerca de la Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {empresa.descripcion}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Derecha: Ofertas Activas */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Ofertas Activas ({empresa.ofertas?.length || 0})
          </h3>
          
          {empresa.ofertas?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Esta empresa no tiene ofertas activas en este momento.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {empresa.ofertas?.map((oferta: any) => (
                <Card key={oferta.id} className="hover:border-blue-500/30 transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors">
                          {oferta.titulo}
                        </h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs font-normal">
                            {oferta.modalidad}
                          </Badge>
                          <Badge variant="outline" className="text-xs font-normal">
                            {oferta.ubicacion}
                          </Badge>
                          {(oferta.salarioMin || oferta.salarioMax) && (
                            <Badge variant="outline" className="text-xs font-normal text-green-600 border-green-200">
                              {oferta.salarioMin} - {oferta.salarioMax}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button onClick={() => router.push(`/ofertas/${oferta.id}`)} variant="outline" className="shrink-0 gap-2">
                        Ver Oferta <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
