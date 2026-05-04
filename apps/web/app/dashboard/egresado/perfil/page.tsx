'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User, Briefcase, Wrench, Plus, Trash2,
  ExternalLink, Linkedin, Github, Globe, Star, MapPin, GraduationCap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function EgresadoPerfilPage() {
  const { data: profile, isLoading, refetch } = (trpc as any).egresados.getMyProfile.useQuery() as any;

  const updateMutation = (trpc as any).egresados.updateProfile.useMutation({
    onSuccess: async () => {
      toast({ title: 'Perfil actualizado', description: 'Tus cambios se han guardado.' });
      await refetch();
    },
    onError: (e: any) => toast({ variant: 'destructive', title: 'Error', description: e.message }),
  }) as any;

  const createMutation = (trpc as any).egresados.createProfile.useMutation({
    onSuccess: async () => {
      toast({ title: 'Perfil creado', description: 'Tu perfil ha sido creado.' });
      await refetch();
    },
    onError: (e: any) => toast({ variant: 'destructive', title: 'Error', description: e.message }),
  }) as any;

  const form = useForm({
    resolver: zodResolver(z.any()) as any,
    values: {
      nombres: profile?.nombres ?? '',
      apellidos: profile?.apellidos ?? '',
      codigoEstudiante: profile?.codigoEstudiante ?? '',
      carrera: profile?.carrera ?? '',
      anioEgreso: profile?.anioEgreso ?? new Date().getFullYear(),
      telefono: profile?.telefono ?? '',
      ubicacion: profile?.ubicacion ?? '',
      resumenProfesional: profile?.resumenProfesional ?? '',
      fotoUrl: profile?.fotoUrl ?? '',
      cvUrl: profile?.cvUrl ?? '',
      habilidades: profile?.habilidades ?? [],
      experiencias: (profile?.experiencias ?? []).map((e: any) => ({
        ...e,
        actual: e.actual ?? false,
      })),
      formacion: profile?.formacion ?? [],
      redesSociales: profile?.redesSociales ?? {},
    },
  });

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;

  const { fields: expFields, append: appendExp, remove: removeExp } =
    useFieldArray({ control, name: 'experiencias' });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } =
    useFieldArray({ control, name: 'habilidades' });

  const { fields: formFields, append: appendForm, remove: removeForm } =
    useFieldArray({ control, name: 'formacion' });

  const onSubmit = handleSubmit(
    (data: any) => {
      const payload = {
        ...data,
        codigoEstudiante: data.codigoEstudiante || "",
      };

      if (profile) {
        updateMutation.mutate(payload as any);
      } else {
        createMutation.mutate(payload as any);
      }
    },
    (errs) => {
      console.error('Errores de validación:', errs);
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: 'Revisa los campos marcados.',
      });
    }
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  const isPending = updateMutation.isPending || createMutation.isPending;

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500">
      <PageHeader
        title="Mi Perfil Profesional"
        description="Gestiona tu información académica y profesional."
      >
        <Button
          form="perfil-form"
          type="submit"
          disabled={isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20"
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </PageHeader>

      <form id="perfil-form" onSubmit={onSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Información Básica */}
          <Card className="overflow-hidden border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center gap-4 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Información Básica</CardTitle>
                <CardDescription>Tus datos personales y de contacto</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Código de Estudiante</label>
                <Input {...register('codigoEstudiante')} placeholder="2020XXXX" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Teléfono</label>
                <Input {...register('telefono')} placeholder="+51 999 999 999" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Ubicación</label>
                <Input {...register('ubicacion')} placeholder="Trujillo, Perú" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Carrera *</label>
                <Input
                  {...register('carrera')}
                  placeholder="Ingeniería de Sistemas"
                  className={errors.carrera ? 'border-red-500' : ''}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Año de Egreso *</label>
                <Input
                  {...register('anioEgreso', { valueAsNumber: true })}
                  type="number"
                  placeholder="2024"
                  className={errors.anioEgreso ? 'border-red-500' : ''}
                />
              </div>
              <div className="col-span-full space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Resumen Profesional</label>
                <textarea
                  {...register('resumenProfesional')}
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Describe brevemente tu trayectoria y objetivos..."
                />
              </div>

              <div className="col-span-full pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-8">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <Avatar className="h-20 w-20 border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                      <AvatarImage src={watch('fotoUrl') ?? ''} />
                      <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-600">
                        {(watch('nombres')?.[0] ?? profile?.nombres?.[0] ?? 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[10px] text-gray-400 font-medium">Preview</span>
                  </div>
                  <div className="flex-1">
                    <ImageUpload
                      label="Foto de Perfil"
                      value={watch('fotoUrl') ?? ''}
                      onChange={(url) => setValue('fotoUrl', url, { shouldDirty: true })}
                      folder="avatar"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Experiencia */}
          <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Experiencia Laboral</CardTitle>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendExp({ empresa: '', cargo: '', desde: '', actual: false })}>
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {expFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 relative group">
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500" onClick={() => removeExp(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input {...register(`experiencias.${index}.empresa`)} placeholder="Empresa" />
                    <Input {...register(`experiencias.${index}.cargo`)} placeholder="Cargo" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Input {...register(`experiencias.${index}.desde`)} type="month" />
                    <Input {...register(`experiencias.${index}.hasta`)} type="month" disabled={watch(`experiencias.${index}.actual`)} />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" {...register(`experiencias.${index}.actual`)} className="rounded border-gray-300" />
                      Trabajo actual
                    </label>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Habilidades */}
          <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Habilidades</CardTitle>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendSkill({ nombre: '', nivel: 3, categoria: 'TECNICA' })}>
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                {skillFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2">
                    <Input {...register(`habilidades.${index}.nombre`)} className="h-7 w-28 border-none bg-transparent p-0 text-xs font-bold focus-visible:ring-0" placeholder="Habilidad" />
                    <select {...register(`habilidades.${index}.categoria`)} className="text-[9px] border-none bg-transparent font-bold text-gray-400 focus:outline-none">
                      <option value="TECNICA">TÉC</option>
                      <option value="BLANDA">BLA</option>
                      <option value="IDIOMA">IDI</option>
                    </select>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <Star key={lvl} onClick={() => setValue(`habilidades.${index}.nivel`, lvl)} className={cn('h-3 w-3 cursor-pointer', lvl <= (watch(`habilidades.${index}.nivel`) ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
                      ))}
                    </div>
                    <button type="button" onClick={() => removeSkill(index)} className="text-gray-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formación Académica */}
          <Card className="border-none shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base">Formación Académica</CardTitle>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendForm({ institucion: '', titulo: '', desde: '', actual: false })}>
                <Plus className="h-4 w-4 mr-1" /> Añadir
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {formFields.map((field, index) => (
                <div key={field.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 space-y-4 relative group">
                  <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-500" onClick={() => removeForm(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input {...register(`formacion.${index}.institucion`)} placeholder="Universidad / Instituto" />
                    <Input {...register(`formacion.${index}.titulo`)} placeholder="Título obtenido" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input {...register(`formacion.${index}.desde`)} type="month" />
                    <Input {...register(`formacion.${index}.hasta`)} type="month" disabled={watch(`formacion.${index}.actual`)} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Preview Column */}
        <div className="space-y-6">
          <Card className="sticky top-24 overflow-hidden border-none shadow-2xl">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-900" />
            <CardContent className="relative pt-0 px-6 pb-8">
              <div className="flex justify-center -mt-12">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-950 shadow-xl">
                  <AvatarImage src={watch('fotoUrl') || profile?.fotoUrl || ''} />
                  <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-600">U</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center mt-4 space-y-1">
                <h3 className="text-xl font-extrabold">{watch('nombres') || 'Tu Nombre'} {watch('apellidos') || ''}</h3>
                <p className="text-sm font-medium text-blue-600">{watch('carrera') || 'Tu Carrera'}</p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-1">
                  <MapPin className="h-3 w-3" /> {watch('ubicacion') || 'Sin ubicación'}
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Curriculum Vitae</p>
                <ImageUpload value={watch('cvUrl') ?? ''} onChange={(url) => setValue('cvUrl', url)} folder="cv" label="Sube tu CV en PDF" />
                <Input {...register('cvUrl')} placeholder="O pega un enlace público..." className="h-8 text-xs" />
              </div>

              <div className="mt-6 space-y-4">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Redes Sociales</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    <Input {...register('redesSociales.linkedin')} placeholder="LinkedIn" className="h-8 text-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    <Input {...register('redesSociales.github')} placeholder="GitHub" className="h-8 text-xs" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-4">
              {profile?.id && (
                <Button variant="secondary" className="w-full gap-2 text-xs h-9" asChild>
                  <a href={`/egresados/${profile.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" /> Ver Perfil Público
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}