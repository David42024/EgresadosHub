'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  Upload, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function EmpresaPerfilPage() {
  const { data: profile, isLoading, refetch } = (trpc as any).empresas.getMyProfile.useQuery() as any;
  
  const updateMutation = (trpc as any).empresas.updateProfile.useMutation({
    onSuccess: () => {
      toast({ title: "Perfil actualizado", description: "Los datos de la empresa se han guardado con éxito." });
      void refetch();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }) as any;

  const createMutation = (trpc as any).empresas.createProfile.useMutation({
    onSuccess: () => {
      toast({ title: "Perfil creado", description: "El perfil de tu empresa ha sido creado con éxito." });
      void refetch();
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }) as any;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(z.any()) as any,
    values: profile ? {
      razonSocial: profile.razonSocial,
      ruc: profile.ruc,
      sector: profile.sector,
      ubicacion: profile.ubicacion,
      descripcion: profile.descripcion,
      sitioWeb: profile.sitioWeb,
      logoUrl: profile.logoUrl,
    } : {
      razonSocial: '',
      ruc: '',
      sector: '',
      ubicacion: '',
      descripcion: '',
      sitioWeb: '',
      logoUrl: '',
    }
  });

  const onSubmit = (data: any) => {
    if (profile) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Errores de validación:", errors);
    toast({
      variant: "destructive",
      title: "Error de validación",
      description: "Por favor, revisa los campos marcados en rojo.",
    });
  };

  if (isLoading) return <div className="p-8 space-y-8"><Skeleton className="h-10 w-64" /><div className="grid grid-cols-3 gap-8"><Skeleton className="col-span-2 h-[500px]" /><Skeleton className="h-[400px]" /></div></div>;

  return (
    <div className="space-y-8">
      <PageHeader 
        title={profile ? "Perfil de Empresa" : "Registrar Empresa"} 
        description={profile ? "Gestiona la identidad de tu organización en la plataforma." : "Completa la información de tu empresa para empezar a publicar ofertas."}
      >
        <Button variant="primary" onClick={handleSubmit(onSubmit, onInvalid)} loading={updateMutation.isPending || createMutation.isPending}>
          {profile ? "Guardar Cambios" : "Crear Perfil"}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario Izquierda */}
        <div className="lg:col-span-2 space-y-8">
          <Card variant="elevated">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Información Corporativa</CardTitle>
                <CardDescription>Datos legales y comerciales de la empresa</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Razón Social</label>
                <Input {...register("razonSocial")} placeholder="Nombre legal" error={!!errors.razonSocial} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">RUC</label>
                <Input {...register("ruc")} placeholder="11 dígitos" error={!!errors.ruc} maxLength={11} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Sector</label>
                <Input {...register("sector")} placeholder="Ej. Tecnología, Banca..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Ubicación Sede</label>
                <Input {...register("ubicacion")} placeholder="Ciudad, País" />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Sitio Web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <Input {...register("sitioWeb")} className="pl-10" placeholder="https://tuempresa.com" />
                </div>
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Descripción de la Empresa</label>
                <textarea 
                  {...register("descripcion")}
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-surface px-4 py-3 text-sm ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all"
                  placeholder="Cuenta sobre la cultura, misión y valores de tu organización..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentación / Logo */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="text-base">Marca y Logotipo</CardTitle>
              <CardDescription>Cómo verán los egresados tu marca</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-2xl border-2 border-dashed border-border bg-bg-base/30">
                <ImageUpload 
                  value={watch("logoUrl")}
                  onChange={(url) => setValue("logoUrl", url, { shouldDirty: true })}
                  folder="logo"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Preview */}
        <div className="space-y-6">
          <Card variant="elevated" className="sticky top-24 overflow-hidden">
            <div className="p-6 border-b border-border bg-bg-base/50 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">Vista Previa</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {profile?.verificada ? (
                      <Badge variant="success" className="gap-1.5 px-2.5 py-1">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verificada
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="gap-1.5 px-2.5 py-1">
                        <ShieldAlert className="h-3.5 w-3.5" /> Pendiente
                      </Badge>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      {profile?.verificada 
                        ? "Esta empresa ha validado sus datos legales y cuenta con el sello de confianza de la plataforma."
                        : "Estamos validando la información legal de tu empresa. Este proceso toma usualmente 24-48 horas."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <CardContent className="p-8 space-y-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20 rounded-2xl shadow-xl">
                  <AvatarImage src={watch("logoUrl") || profile?.logoUrl} />
                  <AvatarFallback className="rounded-2xl text-2xl font-bold bg-primary-50 text-primary-600">
                    {(watch("razonSocial")?.[0] || profile?.razonSocial?.[0] || "E").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-black text-text-primary">{watch("razonSocial") || profile?.razonSocial || "Tu Empresa"}</h3>
                  <p className="text-sm font-medium text-primary-600 mt-1">{watch("sector") || profile?.sector || "Sector no definido"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-bg-base border border-border/50 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Ubicación</p>
                  <p className="text-xs font-bold text-text-primary mt-1 flex items-center justify-center gap-1">
                    <MapPin className="h-3 w-3" /> {watch("ubicacion") || "..."}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-bg-base border border-border/50 text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Ofertas</p>
                  <p className="text-xs font-bold text-text-primary mt-1">
                    {profile?._count?.ofertas ?? 0} Activas
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Sobre nosotros</p>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-6 italic">
                  "{watch("descripcion") || "Aquí aparecerá la descripción que los egresados leerán sobre tu empresa..."}"
                </p>
              </div>

              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full justify-between group" asChild>
                  <a href={watch("sitioWeb")} target="_blank" rel="noopener noreferrer">
                    Sitio Web
                    <ExternalLink className="h-4 w-4 text-text-muted group-hover:text-primary-600" />
                  </a>
                </Button>
                {profile?.id && (
                  <Button variant="secondary" className="w-full gap-2" asChild>
                    <a href={`/empresas/${profile.id}`} target="_blank" rel="noopener noreferrer">
                      <CheckCircle2 className="h-4 w-4" /> Ver Perfil Público
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
