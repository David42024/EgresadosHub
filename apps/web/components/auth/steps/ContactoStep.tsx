'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/contexts/RegisterContext';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  ArrowRight, 
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Check,
  X,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

const contactoSchema = z.object({
  telefono: z.string().optional(),
  ubicacion: z.string().optional(),
  linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
  github: z.string().url("URL inválida").optional().or(z.literal("")),
  portfolio: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ContactoForm = z.infer<typeof contactoSchema>;

export function ContactoStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();
  const [showSkipConfirmation, setShowSkipConfirmation] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors } 
  } = useForm<ContactoForm>({
    resolver: zodResolver(contactoSchema),
    defaultValues: {
      telefono: state.telefono || '',
      ubicacion: state.ubicacion || '',
      linkedin: state.redesSociales?.linkedin || '',
      github: state.redesSociales?.github || '',
      portfolio: state.redesSociales?.portfolio || '',
    }
  });

  const updateProfileMutation = (trpc as any).egresados.updateProfile.useMutation({
    onSuccess: (data: any) => {
      dispatch({ 
        type: 'SET_EGRESADO_DATA', 
        payload: {
          telefono: data.telefono,
          ubicacion: data.ubicacion,
          redesSociales: {
            linkedin: data.redesSociales?.linkedin || '',
            github: data.redesSociales?.github || '',
            portfolio: data.redesSociales?.portfolio || '',
          }
        }
      });

      toast({ 
        title: "¡Datos de contacto guardados!", 
        description: "Continúa con tu perfil profesional." 
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

  const onSubmit = (data: ContactoForm) => {
    updateProfileMutation.mutate({
      telefono: data.telefono,
      ubicacion: data.ubicacion,
      redesSociales: {
        linkedin: data.linkedin,
        github: data.github,
        portfolio: data.portfolio,
      }
    });
  };

  const handleSkip = () => {
    updateProfileMutation.mutate({
      telefono: undefined,
      ubicacion: undefined,
      redesSociales: {
        linkedin: undefined,
        github: undefined,
        portfolio: undefined,
      }
    });
  };

  const handleBack = () => {
    router.push('/auth/register/step/3');
  };

  const hasAnyValue = () => {
    return watch('telefono') || watch('ubicacion') || watch('linkedin') || watch('github') || watch('portfolio');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-black text-lg mb-4">
            4
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Datos de Contacto
          </h1>
          <p className="text-text-secondary font-medium">
            Información para que las empresas puedan contactarte
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
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                Teléfono
              </label>
              <Badge variant="secondary" className="text-xs">Recomendado</Badge>
            </div>
            <div className="relative">
              <Input
                {...register("telefono")}
                placeholder="+51 987 654 321"
                className={cn(
                  "h-12 rounded-xl pl-10",
                  errors.telefono && "border-red-500 focus:ring-red-500"
                )}
              />
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            </div>
            {errors.telefono && (
              <p className="text-xs text-red-500 font-medium">{errors.telefono.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                Ubicación
              </label>
              <Badge variant="secondary" className="text-xs">Recomendado</Badge>
            </div>
            <div className="relative">
              <Input
                {...register("ubicacion")}
                placeholder="Trujillo, Perú"
                className={cn(
                  "h-12 rounded-xl pl-10",
                  errors.ubicacion && "border-red-500 focus:ring-red-500"
                )}
              />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            </div>
            {errors.ubicacion && (
              <p className="text-xs text-red-500 font-medium">{errors.ubicacion.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-text-muted">
              Redes Sociales (Opcional)
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">LinkedIn</label>
              <div className="relative">
                <Input
                  {...register("linkedin")}
                  placeholder="https://linkedin.com/in/juanperez"
                  className={cn(
                    "h-12 rounded-xl pl-10",
                    errors.linkedin && "border-red-500 focus:ring-red-500"
                  )}
                />
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              </div>
              {errors.linkedin && (
                <p className="text-xs text-red-500 font-medium">{errors.linkedin.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">GitHub</label>
              <div className="relative">
                <Input
                  {...register("github")}
                  placeholder="https://github.com/juanperez"
                  className={cn(
                    "h-12 rounded-xl pl-10",
                    errors.github && "border-red-500 focus:ring-red-500"
                  )}
                />
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              </div>
              {errors.github && (
                <p className="text-xs text-red-500 font-medium">{errors.github.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted">Portfolio</label>
              <div className="relative">
                <Input
                  {...register("portfolio")}
                  placeholder="https://juanperez.dev"
                  className={cn(
                    "h-12 rounded-xl pl-10",
                    errors.portfolio && "border-red-500 focus:ring-red-500"
                  )}
                />
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              </div>
              {errors.portfolio && (
                <p className="text-xs text-red-500 font-medium">{errors.portfolio.message}</p>
              )}
            </div>
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
    </div>
  );
}
