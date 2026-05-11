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
        </div>
      </div>
    </div>
  );
}
