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
  Building2,
  Check,
  X,
  Shield
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

const empresaDatosSchema = z.object({
  razonSocial: z.string().min(2, "Ingresa la razón social"),
  sector: z.string().min(1, "Selecciona el sector"),
  ubicacion: z.string().min(2, "Ingresa la ubicación"),
  ruc: z.string().regex(/^\d{11}$/, "RUC debe tener 11 dígitos").optional().or(z.literal("")),
});

type EmpresaDatosForm = z.infer<typeof empresaDatosSchema>;

const SECTORES = [
  'Tecnología',
  'Banca y Finanzas',
  'Educación',
  'Salud',
  'Retail',
  'Consultoría',
  'Manufactura',
  'Telecomunicaciones',
  'Energía',
  'Construcción',
  'Transporte',
  'Alimentos y Bebidas',
  'Turismo',
  'Medios y Entretenimiento',
  'Gobierno',
  'Otro',
];

export function EmpresaDatosStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors, isValid } 
  } = useForm<EmpresaDatosForm>({
    resolver: zodResolver(empresaDatosSchema),
    defaultValues: {
      razonSocial: state.razonSocial || '',
      sector: state.sector || '',
      ubicacion: state.ubicacion || '',
      ruc: state.ruc || '',
    }
  });

  const createProfileMutation = (trpc as any).empresas.createProfile.useMutation({
    onSuccess: (data: any) => {
      dispatch({ 
        type: 'SET_EMPRESA_DATA', 
        payload: {
          razonSocial: data.razonSocial,
          sector: data.sector,
          ubicacion: data.ubicacion,
          ruc: data.ruc,
        }
      });

      toast({ 
        title: "¡Datos de empresa guardados!", 
        description: "Continúa con la presentación de tu empresa." 
      });
      
      router.push('/auth/register/step/4');
    },
    onError: (e: any) => {
      toast({ 
        variant: "destructive", 
        title: "Error al guardar", 
        description: e.message 
      });
    },
  }) as any;

  const onSubmit = (data: EmpresaDatosForm) => {
    createProfileMutation.mutate(data);
  };

  const handleBack = () => {
    router.push('/auth/register/step/2');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-black text-lg mb-4">
            3
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Datos de la Empresa
          </h1>
          <p className="text-text-secondary font-medium">
            Información obligatoria para tu perfil empresarial
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
              Razón Social *
            </label>
            <div className="relative">
              <Input
                {...register("razonSocial")}
                placeholder="Empresa SAC"
                className={cn(
                  "h-12 rounded-xl pr-10",
                  errors.razonSocial && "border-red-500 focus:ring-red-500",
                  !errors.razonSocial && watch('razonSocial') && "border-green-500 focus:ring-green-500"
                )}
              />
              {!errors.razonSocial && watch('razonSocial') && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {errors.razonSocial && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.razonSocial && (
              <p className="text-xs text-red-500 font-medium">{errors.razonSocial.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-muted">
              Sector *
            </label>
            <div className="relative">
              <select
                {...register("sector")}
                className={cn(
                  "w-full h-12 rounded-xl border-2 bg-background px-4 pr-10 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  "transition-all duration-200 appearance-none cursor-pointer",
                  errors.sector && "border-red-500 focus:ring-red-500",
                  !errors.sector && watch('sector') && "border-green-500 focus:ring-green-500"
                )}
              >
                <option value="">Selecciona el sector</option>
                {SECTORES.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {!errors.sector && watch('sector') && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {errors.sector && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {errors.sector && (
              <p className="text-xs text-red-500 font-medium">{errors.sector.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-muted">
              Ubicación *
            </label>
            <div className="relative">
              <Input
                {...register("ubicacion")}
                placeholder="Trujillo, Perú"
                className={cn(
                  "h-12 rounded-xl pr-10",
                  errors.ubicacion && "border-red-500 focus:ring-red-500",
                  !errors.ubicacion && watch('ubicacion') && "border-green-500 focus:ring-green-500"
                )}
              />
              {!errors.ubicacion && watch('ubicacion') && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {errors.ubicacion && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.ubicacion && (
              <p className="text-xs text-red-500 font-medium">{errors.ubicacion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                RUC
              </label>
              <Badge variant="outline" className="text-xs">Recomendado</Badge>
            </div>
            <div className="relative">
              <Input
                {...register("ruc")}
                placeholder="20123456789"
                maxLength={11}
                className={cn(
                  "h-12 rounded-xl pr-10",
                  errors.ruc && "border-red-500 focus:ring-red-500",
                  !errors.ruc && watch('ruc')?.length === 11 && "border-green-500 focus:ring-green-500"
                )}
              />
              {!errors.ruc && watch('ruc')?.length === 11 && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {errors.ruc && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.ruc && (
              <p className="text-xs text-red-500 font-medium">{errors.ruc.message}</p>
            )}
            <p className="text-xs text-text-muted">
              Número de 11 dígitos para verificación empresarial
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <Shield className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Los campos marcados con * son obligatorios y no podrán ser modificados después del registro
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-black gap-2 shadow-lg hover:shadow-xl transition-all"
            disabled={!isValid || createProfileMutation.isPending}
            loading={createProfileMutation.isPending}
          >
            Continuar
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
