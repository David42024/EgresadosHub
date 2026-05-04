'use client';

import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Building2, CalendarDays, DollarSign, MapPin, Briefcase } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  POSTULADO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  EN_REVISION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  ENTREVISTA: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  CONTRATADO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  RECHAZADO: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function DetallePostulacionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { data: p, isLoading, error } = (trpc as any).postulaciones.getById.useQuery(
    { id },
    { enabled: !!id }
  ) as any;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !p) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">Postulación no encontrada o error al cargar.</p>
        <Button onClick={() => router.push('/dashboard/egresado/postulaciones')}>Volver</Button>
      </div>
    );
  }

  const empresa = p.oferta?.empresa;
  const companyName = empresa?.nombreComercial ?? empresa?.razonSocial ?? 'Empresa';
  const audits = p.audits || p.historial || [];
  // Ordenar el historial por fecha
  const historialOrdenado = [...audits].sort((a: any, b: any) => {
    const timeA = new Date(a.cambiadoAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.cambiadoAt || b.createdAt || 0).getTime();
    return timeA - timeB;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/egresado/postulaciones')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <PageHeader 
          title="Detalle de Postulación" 
          description="Revisa el estado y los datos de tu postulación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos de la Oferta y Empresa */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="h-20 w-20 rounded-xl border border-gray-200">
                  <AvatarImage src={empresa?.logoUrl} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-50 text-blue-600">
                    {companyName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">{p.oferta?.titulo}</h2>
                      <Link href={`/dashboard/empresa/${empresa?.id}`} className="text-blue-600 hover:underline flex items-center gap-2 mt-1 font-medium">
                        <Building2 className="h-4 w-4" />
                        {companyName} {empresa?.sector ? `(${empresa.sector})` : ''}
                      </Link>
                    </div>
                    <Badge className={cn('px-3 py-1 font-bold text-xs', STATUS_COLORS[p.estado] || STATUS_COLORS.POSTULADO)}>
                      {p.estado}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-4">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.oferta?.ubicacion}</span>
                    <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {p.oferta?.modalidad}</span>
                    {(p.oferta?.salarioMin != null || p.oferta?.salarioMax != null) && (
                      <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" /> {p.oferta?.salarioMin} - {p.oferta?.salarioMax}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles de la Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <h4 className="font-bold mb-2">Descripción</h4>
                <p className="whitespace-pre-wrap">{p.oferta?.descripcion}</p>
              </div>
              {p.oferta?.requisitos && (
                <div>
                  <h4 className="font-bold mb-2">Requisitos</h4>
                  <p className="whitespace-pre-wrap">{p.oferta?.requisitos}</p>
                </div>
              )}
              {p.cartaPresentacion && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold mb-2">Tu carta de presentación</h4>
                  <p className="whitespace-pre-wrap italic text-gray-600 dark:text-gray-400">{p.cartaPresentacion}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Timeline del Historial */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gray-400" />
                Historial de Estados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {historialOrdenado.map((h: any, i: number) => {
                  const isLast = i === historialOrdenado.length - 1;
                  const dateStr = h.cambiadoAt || h.createdAt;
                  const date = new Date(dateStr);
                  
                  return (
                    <div key={i} className="relative flex items-start gap-4">
                      <div className={cn(
                        "z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-white ring-4 ring-white/50 mt-1",
                        isLast ? "bg-blue-500" : "bg-gray-300"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {h.estadoNuevo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isNaN(date.getTime()) ? '' : date.toLocaleString()}
                        </p>
                        {h.comentario && (
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-2 rounded-md border border-gray-100 dark:border-gray-800">
                            {h.comentario}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
