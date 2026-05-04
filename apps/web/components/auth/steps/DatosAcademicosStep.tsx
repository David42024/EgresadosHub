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
  GraduationCap,
  Check,
  X
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

const datosAcademicosSchema = z.object({
  nombres: z.string().min(2, "Ingresa tus nombres"),
  apellidos: z.string().min(2, "Ingresa tus apellidos"),
  carrera: z.string().min(1, "Selecciona tu carrera"),
  anioEgreso: z.number().min(2000).max(new Date().getFullYear()),
  codigoEstudiante: z.string().optional(),
});

type DatosAcademicosForm = z.infer<typeof datosAcademicosSchema>;

const CARRERAS = [
  'Ingeniería de Sistemas',
  'Ingeniería Civil',
  'Ingeniería Electrónica',
  'Ingeniería Mecánica',
  'Ingeniería Química',
  'Ingeniería Agrícola',
  'Medicina Humana',
  'Enfermería',
  'Odontología',
  'Administración',
  'Contabilidad',
  'Economía',
  'Derecho',
  'Psicología',
  'Educación',
  'Otra',
];

export function DatosAcademicosStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors, isValid } 
  } = useForm<DatosAcademicosForm>({
    resolver: zodResolver(datosAcademicosSchema),
    defaultValues: {
      nombres: state.nombres || '',
      apellidos: state.apellidos || '',
      carrera: state.carrera || '',
      anioEgreso: state.anioEgreso || new Date().getFullYear(),
      codigoEstudiante: state.codigoEstudiante || '',
    }
  });

  const createProfileMutation = (trpc as any).egresados.createProfile.useMutation({
    onSuccess: (data: any) => {
      dispatch({ 
        type: 'SET_EGRESADO_DATA', 
        payload: {
          nombres: data.nombres,
          apellidos: data.apellidos,
          carrera: data.carrera,
          anioEgreso: data.anioEgreso,
          codigoEstudiante: data.codigoEstudiante,
        }
      });

      toast({ 
        title: "¡Datos académicos guardados!", 
        description: "Continúa con tu información de contacto." 
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

  const onSubmit = (data: DatosAcademicosForm) => {
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
            Datos Académicos
          </h1>
          <p className="text-text-secondary font-medium">
            Información obligatoria para tu perfil
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                Nombres *
              </label>
              <div className="relative">
                <Input
                  {...register("nombres")}
                  placeholder="Juan"
                  className={cn(
                    "h-12 rounded-xl pr-10",
                    errors.nombres && "border-red-500 focus:ring-red-500",
                    !errors.nombres && watch('nombres') && "border-green-500 focus:ring-green-500"
                  )}
                />
                {!errors.nombres && watch('nombres') && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.nombres && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.nombres && (
                <p className="text-xs text-red-500 font-medium">{errors.nombres.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                Apellidos *
              </label>
              <div className="relative">
                <Input
                  {...register("apellidos")}
                  placeholder="Pérez"
                  className={cn(
                    "h-12 rounded-xl pr-10",
                    errors.apellidos && "border-red-500 focus:ring-red-500",
                    !errors.apellidos && watch('apellidos') && "border-green-500 focus:ring-green-500"
                  )}
                />
                {!errors.apellidos && watch('apellidos') && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                )}
                {errors.apellidos && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                )}
              </div>
              {errors.apellidos && (
                <p className="text-xs text-red-500 font-medium">{errors.apellidos.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-muted">
              Carrera *
            </label>
            <div className="relative">
              <select
                {...register("carrera")}
                className={cn(
                  "w-full h-12 rounded-xl border-2 bg-background px-4 pr-10 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  "transition-all duration-200 appearance-none cursor-pointer",
                  errors.carrera && "border-red-500 focus:ring-red-500",
                  !errors.carrera && watch('carrera') && "border-green-500 focus:ring-green-500"
                )}
              >
                <option value="">Selecciona tu carrera</option>
                {CARRERAS.map(carrera => (
                  <option key={carrera} value={carrera}>{carrera}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {!errors.carrera && watch('carrera') && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {errors.carrera && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {errors.carrera && (
              <p className="text-xs text-red-500 font-medium">{errors.carrera.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-muted">
              Año de Egreso *
            </label>
            <div className="relative">
              <select
                {...register("anioEgreso", { valueAsNumber: true })}
                className={cn(
                  "w-full h-12 rounded-xl border-2 bg-background px-4 pr-10 text-sm",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                  "transition-all duration-200 appearance-none cursor-pointer",
                  errors.anioEgreso && "border-red-500 focus:ring-red-500",
                  !errors.anioEgreso && watch('anioEgreso') && "border-green-500 focus:ring-green-500"
                )}
              >
                {Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => 2000 + i)
                  .reverse()
                  .map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {!errors.anioEgreso && watch('anioEgreso') && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
                {errors.anioEgreso && (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            {errors.anioEgreso && (
              <p className="text-xs text-red-500 font-medium">{errors.anioEgreso.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                Código de Estudiante
              </label>
              <Badge variant="outline" className="text-xs">Opcional</Badge>
            </div>
            <Input
              {...register("codigoEstudiante")}
              placeholder="202100123"
              className="h-12 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <GraduationCap className="h-4 w-4 text-amber-600 flex-shrink-0" />
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
