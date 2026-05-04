'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/contexts/RegisterContext';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  ArrowRight, 
  Globe,
  Upload,
  Building2,
  Clock,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

const empresaPresentacionSchema = z.object({
  descripcion: z.string().max(1000, "Máximo 1000 caracteres").optional(),
  logoUrl: z.string().optional(),
  sitioWeb: z.string().url("URL inválida").optional().or(z.literal("")),
});

type EmpresaPresentacionForm = z.infer<typeof empresaPresentacionSchema>;

export function EmpresaPresentacionStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors } 
  } = useForm<EmpresaPresentacionForm>({
    resolver: zodResolver(empresaPresentacionSchema),
    defaultValues: {
      descripcion: state.descripcion || '',
      logoUrl: state.logoUrl || '',
      sitioWeb: state.sitioWeb || '',
    }
  });

  const descripcion = watch('descripcion');
  const logoUrl = watch('logoUrl');
  const sitioWeb = watch('sitioWeb');

  const updateProfileMutation = (trpc as any).empresas.updateProfile.useMutation({
    onSuccess: (data: any) => {
      dispatch({ 
        type: 'SET_EMPRESA_DATA', 
        payload: {
          descripcion: data.descripcion,
          logoUrl: data.logoUrl,
          sitioWeb: data.sitioWeb,
        }
      });

      toast({ 
        title: "¡Presentación guardada!", 
        description: "Tu empresa está lista para publicar ofertas." 
      });
      
      router.push('/auth/register/step/5');
    },
    onError: (e: any) => {
      toast({ 
        variant: "destructive", 
        title: "Error al guardar", 
        description: e.message 
      });
    },
  }) as any;

  const onSubmit = (data: EmpresaPresentacionForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleSkip = () => {
    updateProfileMutation.mutate({
      descripcion: undefined,
      logoUrl: undefined,
      sitioWeb: undefined,
    });
  };

  const handleBack = () => {
    router.push('/auth/register/step/3');
  };

  const hasAnyValue = () => {
    return descripcion || logoUrl || sitioWeb;
  };

  // Preview card
  const PreviewCard = () => (
    <Card className="border-none shadow-lg bg-gradient-to-br from-success/10 to-success/5 dark:from-success/5 dark:to-success/10">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-success/20 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-success" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-text-primary text-lg">
              {state.razonSocial}
            </h3>
            <Badge variant="outline" className="mb-2">
              {state.sector}
            </Badge>
            <p className="text-sm text-text-secondary mb-2">
              {state.ubicacion}
            </p>
            {descripcion && (
              <p className="text-sm text-text-muted line-clamp-3 mb-3">
                {descripcion}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-text-muted">
              {sitioWeb && (
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Sitio web</span>
                </div>
              )}
              {state.ruc && (
                <div className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-success" />
                  <span>RUC verificado</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 text-success font-black text-lg mb-4">
                4
              </div>
              <h1 className="text-3xl font-black tracking-tight text-text-primary">
                Presentación de la Empresa
              </h1>
              <p className="text-text-secondary font-medium">
                Completa el perfil para atraer mejor talento
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                className="mb-4 p-0 h-auto font-bold text-text-muted hover:text-text-primary gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Volver
              </Button>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Descripción
                </label>
                <div className="relative">
                  <Textarea
                    {...register("descripcion")}
                    placeholder="Describe tu empresa, cultura, valores y lo que ofreces a tus empleados..."
                    className="min-h-[120px] rounded-xl resize-none"
                    maxLength={1000}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-text-muted">
                    {descripcion?.length || 0}/1000
                  </div>
                </div>
                {errors.descripcion && (
                  <p className="text-xs text-red-500 font-medium">{errors.descripcion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Logo de la Empresa
                </label>
                <ImageUpload
                  value={logoUrl}
                  onChange={(url) => setValue('logoUrl', url)}
                  folder="logo"
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-success-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Sitio Web
                </label>
                <div className="relative">
                  <Input
                    {...register("sitioWeb")}
                    placeholder="https://empresa.com"
                    className={cn(
                      "h-12 rounded-xl pl-10",
                      errors.sitioWeb && "border-red-500 focus:ring-red-500"
                    )}
                  />
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                </div>
                {errors.sitioWeb && (
                  <p className="text-xs text-red-500 font-medium">{errors.sitioWeb.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Puedes completar esta información más tarde desde tu perfil
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1 h-12 rounded-xl font-medium text-text-muted hover:text-text-primary"
                >
                  Saltar por ahora
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 h-12 rounded-xl font-black gap-2 shadow-lg hover:shadow-xl transition-all"
                  disabled={!hasAnyValue() || updateProfileMutation.isPending}
                  loading={updateProfileMutation.isPending}
                >
                  Completar ahora
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-bold text-text-primary mb-2">Vista Previa</h3>
              <p className="text-sm text-text-secondary">
                Así se verá tu empresa en la plataforma
              </p>
            </div>
            <PreviewCard />
          </div>
        </div>
      </div>
    </div>
  );
}
