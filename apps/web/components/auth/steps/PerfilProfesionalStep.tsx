'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/contexts/RegisterContext';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText,
  Upload,
  User,
  Clock,
  Check
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { ImageUpload } from '@/components/ui/ImageUpload';

const perfilProfesionalSchema = z.object({
  resumenProfesional: z.string().max(500, "Máximo 500 caracteres").optional(),
  fotoUrl: z.string().optional(),
  cvUrl: z.string().optional(),
});

type PerfilProfesionalForm = z.infer<typeof perfilProfesionalSchema>;

export function PerfilProfesionalStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors } 
  } = useForm<PerfilProfesionalForm>({
    resolver: zodResolver(perfilProfesionalSchema),
    defaultValues: {
      resumenProfesional: state.resumenProfesional || '',
      fotoUrl: state.fotoUrl || '',
      cvUrl: state.cvUrl || '',
    }
  });

  const resumenProfesional = watch('resumenProfesional');
  const fotoUrl = watch('fotoUrl');
  const cvUrl = watch('cvUrl');

  const updateProfileMutation = (trpc as any).egresados.updateProfile.useMutation({
    onSuccess: (data: any) => {
      dispatch({ 
        type: 'SET_EGRESADO_DATA', 
        payload: {
          resumenProfesional: data.resumenProfesional,
          fotoUrl: data.fotoUrl,
          cvUrl: data.cvUrl,
        }
      });

      toast({ 
        title: "¡Perfil profesional guardado!", 
        description: "Continúa con tus habilidades." 
      });
      
      router.push('/auth/register/step/6');
    },
    onError: (e: any) => {
      toast({ 
        variant: "destructive", 
        title: "Error al guardar", 
        description: e.message 
      });
    },
  }) as any;

  const onSubmit = (data: PerfilProfesionalForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleSkip = () => {
    updateProfileMutation.mutate({
      resumenProfesional: undefined,
      fotoUrl: undefined,
      cvUrl: undefined,
    });
  };

  const handleBack = () => {
    router.push('/auth/register/step/4');
  };

  const hasAnyValue = () => {
    return resumenProfesional || fotoUrl || cvUrl;
  };

  // Preview card
  const PreviewCard = () => (
    <Card className="border-none shadow-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
            {fotoUrl ? (
              <img src={fotoUrl} alt="Foto" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary-600 dark:text-primary-300" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-text-primary">
              {state.nombres} {state.apellidos}
            </h3>
            <p className="text-sm text-text-secondary mb-2">{state.carrera}</p>
            {resumenProfesional && (
              <p className="text-sm text-text-muted line-clamp-3">
                {resumenProfesional}
              </p>
            )}
          </div>
        </div>
        
        {cvUrl && (
          <div className="mt-4 flex items-center gap-2 text-sm text-primary-600">
            <FileText className="w-4 h-4" />
            <span>CV adjuntado</span>
          </div>
        )}
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
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-black text-lg mb-4">
                5
              </div>
              <h1 className="text-3xl font-black tracking-tight text-text-primary">
                Perfil Profesional
              </h1>
              <p className="text-text-secondary font-medium">
                Completa tu perfil para destacar
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
                  Resumen Profesional
                </label>
                <div className="relative">
                  <Textarea
                    {...register("resumenProfesional")}
                    placeholder="Describe tu experiencia, habilidades y objetivos profesionales..."
                    className="min-h-[120px] rounded-xl resize-none"
                    maxLength={500}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-text-muted">
                    {resumenProfesional?.length || 0}/500
                  </div>
                </div>
                {errors.resumenProfesional && (
                  <p className="text-xs text-red-500 font-medium">{errors.resumenProfesional.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Foto de Perfil
                </label>
                <ImageUpload
                  value={fotoUrl}
                  onChange={(url) => setValue('fotoUrl', url)}
                  folder="avatar"
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  CV (PDF)
                </label>
                <ImageUpload
                  value={cvUrl}
                  onChange={(url) => setValue('cvUrl', url)}
                  folder="cv"
                  className="w-full h-32 rounded-xl border-2 border-dashed border-border hover:border-primary-500 transition-colors"
                />
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
                Así se verá tu perfil en la plataforma
              </p>
            </div>
            <PreviewCard />
          </div>
        </div>
      </div>
    </div>
  );
}
