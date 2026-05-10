'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  DollarSign, 
  Wrench, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  Rocket,
  Info,
  Save,
  ArrowLeft,
  CheckCircle2,
  Layout
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 1, title: 'Básicos', icon: Layout },
  { id: 2, title: 'Requisitos', icon: Wrench },
  { id: 3, title: 'Confirmar', icon: CheckCircle2 },
];

export default function EditarOfertaPage() {
  const { id } = useParams() as { id: string };
  const [step, setStep] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const router = useRouter();

  const { data: oferta, isLoading } = (trpc as any).ofertas.getById.useQuery({ id }) as any;

  const updateMutation = (trpc as any).ofertas.update.useMutation({
    onSuccess: () => {
      toast({ title: "Oferta actualizada", description: "Los cambios han sido guardados correctamente." });
      router.push(`/dashboard/empresa/ofertas/${id}`);
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  }) as any;

  const ofertaSchema = z.object({
    titulo: z.string().min(5, "El título es muy corto"),
    descripcion: z.string().min(50, "Mínimo 50 caracteres"),
    modalidad: z.enum(['PRESENCIAL', 'REMOTO', 'HIBRIDO']),
    ubicacion: z.string().min(3, "Requerido"),
    salarioMin: z.number().min(1, "Obligatorio"),
    salarioMax: z.number().min(1, "Obligatorio"),
    habilidadesReq: z.array(z.any()).min(1, "Añade al menos una habilidad"),
    cierraAt: z.string().optional().refine(val => {
      if (!val) return true;
      const date = new Date(`${val}T23:59:59`);
      const today = new Date();
      return date >= today;
    }, "La fecha límite no puede ser en el pasado"),
    documentosRequeridos: z.array(z.any()).optional(),
  });

  const { register, control, trigger, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      modalidad: 'PRESENCIAL',
      ubicacion: '',
      salarioMin: 1,
      salarioMax: 1,
      habilidadesReq: [],
      documentosRequeridos: [],
      cierraAt: '',
    }
  });

  useEffect(() => {
    if (oferta) {
      reset({
        titulo: oferta.titulo,
        descripcion: oferta.descripcion,
        modalidad: oferta.modalidad,
        ubicacion: oferta.ubicacion,
        salarioMin: Number(oferta.salarioMin),
        salarioMax: Number(oferta.salarioMax),
        habilidadesReq: oferta.habilidadesReq?.map((h: string) => ({ nombre: h })) || [],
        documentosRequeridos: oferta.documentosRequeridos?.map((d: string) => ({ nombre: d })) || [{ nombre: 'CV Base' }],
        cierraAt: oferta.cierraAt ? (() => {
          const d = new Date(oferta.cierraAt);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })() : '',
      });
    }
  }, [oferta, reset]);

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: "habilidadesReq" as never,
  });
  const [newSkill, setNewSkill] = useState('');

  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({
    control,
    name: "documentosRequeridos" as never,
  });
  const [newDocReq, setNewDocReq] = useState('');

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed) {
      if (skillFields.some((f: any) => f.nombre.toLowerCase() === trimmed.toLowerCase())) {
        toast({ title: "Habilidad duplicada", description: "Ya ha sido añadida.", variant: "destructive" });
      } else {
        appendSkill({ nombre: trimmed } as any);
        setNewSkill('');
      }
    }
  };

  const addDoc = () => {
    const trimmed = newDocReq.trim();
    if (trimmed) {
      if (docFields.some((f: any) => f.nombre.toLowerCase() === trimmed.toLowerCase())) {
        toast({ title: "Documento duplicado", description: "Ya requerido.", variant: "destructive" });
      } else {
        appendDoc({ nombre: trimmed } as any);
        setNewDocReq('');
      }
    }
  };

  const handleFinalSubmit = (data: any) => {
    let cierraAtIso = undefined;
    if (data.cierraAt) {
      cierraAtIso = new Date(`${data.cierraAt}T23:59:59`).toISOString();
    }

    const payload = {
      id,
      data: {
        ...data,
        habilidadesReq: data.habilidadesReq?.map((h: any) => h.nombre || h) || [],
        documentosRequeridos: data.documentosRequeridos?.map((d: any) => d.nombre || d) || [],
        cierraAt: cierraAtIso
      }
    };
    updateMutation.mutate(payload);
  };

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (step === 1) fieldsToValidate = ['titulo', 'descripcion', 'modalidad', 'ubicacion'];
    if (step === 2) fieldsToValidate = ['salarioMin', 'salarioMax', 'habilidadesReq'];

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) setStep(s => Math.min(s + 1, 3));
    else toast({ variant: "destructive", title: "Revisa los campos", description: "Faltan datos obligatorios." });
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isLoading) return <div className="p-8 space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-[500px] w-full rounded-3xl" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="flex items-center gap-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-xl bg-bg-base/50 hover:bg-bg-elevated transition-all">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-text-primary">Editar Oferta</h1>
          <p className="text-sm text-text-secondary font-medium uppercase tracking-widest">{oferta?.titulo}</p>
        </div>
      </div>

      <div className="relative max-w-lg mx-auto">
        <div className="flex justify-between items-center mb-2">
          {STEPS.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center border transition-all duration-500",
                step === s.id ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20 scale-110" : 
                step > s.id ? "bg-success border-success text-white" : "bg-surface border-border text-text-muted"
              )}>
                {step > s.id ? <CheckCircle2 className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                step >= s.id ? "text-text-primary" : "text-text-muted"
              )}>{s.title}</span>
            </div>
          ))}
        </div>
        <Progress value={((step - 1) / (STEPS.length - 1)) * 100} className="absolute top-5 left-0 w-full -z-0 h-[2px] bg-border" />
      </div>

      <Card variant="elevated" className="border border-border/50 shadow-2xl bg-surface/60 backdrop-blur-md rounded-3xl overflow-hidden">
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Título del Puesto</label>
                  <Input {...register("titulo")} placeholder="Ej. Arquitecto Cloud" className="h-12 text-lg font-bold bg-bg-base/30 border-border focus:border-primary-500 rounded-xl transition-all" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Modalidad</label>
                    <Controller
                      name="modalidad"
                      control={control}
                      render={({ field }) => (
                        <Select key={field.value} onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="h-12 bg-bg-base/30 border-border rounded-xl font-bold">
                            <SelectValue placeholder="Seleccionar..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-surface">
                            <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                            <SelectItem value="REMOTO">Remoto</SelectItem>
                            <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Fecha Límite (Postulación)</label>
                    <Input 
                      type="date" 
                      {...register("cierraAt")} 
                      className={cn(
                        "h-12 bg-bg-base/30 border-border rounded-xl font-bold",
                        errors.cierraAt && "border-red-500 focus:ring-red-500"
                      )} 
                    />
                    {errors.cierraAt && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.cierraAt.message as string}</p>}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Ubicación</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input {...register("ubicacion")} className="pl-10 h-12 bg-bg-base/30 border-border rounded-xl font-bold" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Descripción del Puesto</label>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", watch("descripcion").length >= 50 ? "text-success border-success/20 bg-success/5" : "text-amber-500 border-amber-500/20 bg-amber-500/5")}>
                      {watch("descripcion").length} / 50 caracteres mín.
                    </span>
                  </div>
                  <textarea 
                    {...register("descripcion")}
                    className={cn(
                      "flex min-h-[200px] w-full rounded-2xl border border-border bg-bg-base/20 px-4 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all",
                      errors.descripcion && "border-error ring-error"
                    )}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-text-primary">Habilidades Requeridas</h4>
                      <p className="text-xs text-text-muted font-medium">Añade tags técnicos para que los egresados te encuentren.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ej. React, SQL, Java..." 
                        className="h-12 rounded-xl border-border bg-bg-base/30 font-bold"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      />
                      <Button type="button" onClick={addSkill} variant="secondary" className="h-12 px-6 rounded-xl font-bold">Añadir</Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {skillFields.map((field, index) => (
                        <Badge key={field.id} variant="outline" className="pl-3 pr-1.5 py-1.5 gap-2 text-xs font-bold border-border bg-bg-base/50">
                          {(field as any).nombre}
                          <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-bold text-text-primary">Documentos a Subir</h4>
                      <p className="text-xs text-text-muted font-medium">Define qué archivos debe adjuntar el egresado.</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Ej. Certificado de Inglés, Portafolio..." 
                        className="h-12 rounded-xl border-border bg-bg-base/30 font-bold"
                        value={newDocReq}
                        onChange={(e) => setNewDocReq(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDoc(); } }}
                      />
                      <Button type="button" onClick={addDoc} variant="secondary" className="h-12 px-6 rounded-xl font-bold">Añadir</Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {docFields.map((field, index) => (
                        <Badge key={field.id} variant="outline" className="pl-3 pr-1.5 py-1.5 gap-2 text-xs font-bold border-primary-500/30 bg-primary-500/5 text-primary-600">
                          {(field as any).nombre}
                          {(field as any).nombre !== 'CV Base' && (
                            <button type="button" onClick={() => removeDoc(index)} className="hover:text-red-500 transition-colors"><Trash2 className="h-3 w-3" /></button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-10 border-t border-border/50">
                   <h4 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-success" /> Presupuesto
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Sueldo Mínimo</p>
                      <div className="flex items-center h-12 bg-bg-base/40 border border-border rounded-xl px-4 focus-within:ring-2 ring-primary-500/20 transition-all">
                        <span className="text-sm font-black text-text-muted mr-2">S/</span>
                        <input 
                          {...register("salarioMin", { valueAsNumber: true })} 
                          type="number" 
                          className="w-full bg-transparent border-none focus:outline-none font-bold text-text-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Sueldo Máximo</p>
                      <div className="flex items-center h-12 bg-bg-base/40 border border-border rounded-xl px-4 focus-within:ring-2 ring-primary-500/20 transition-all">
                        <span className="text-sm font-black text-text-muted mr-2">S/</span>
                        <input 
                          {...register("salarioMax", { valueAsNumber: true })} 
                          type="number" 
                          className="w-full bg-transparent border-none focus:outline-none font-bold text-text-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                    <Save className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-text-primary">Confirmar Modificaciones</h3>
                    <p className="text-sm text-text-secondary font-medium">Revisa que los cambios sean correctos antes de actualizar la oferta.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Posición</p>
                      <p className="text-xl font-black text-text-primary">{watch("titulo")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="bg-primary-600/10 text-primary-600 border-none font-bold uppercase text-[10px]">{watch("modalidad")}</Badge>
                      <Badge variant="secondary" className="bg-bg-base text-text-secondary border-none font-bold text-[10px] uppercase">{watch("ubicacion")}</Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Nuevo Presupuesto</p>
                    <p className="text-2xl font-black text-text-primary">
                      S/ {Number(watch("salarioMin")).toLocaleString()} - S/ {Number(watch("salarioMax")).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Sueldo mensual actualizado</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="p-8 bg-bg-base/30 border-t border-border flex justify-between">
            <Button type="button" variant="ghost" onClick={prevStep} disabled={step === 1} className="font-bold rounded-xl h-12 px-6">
              <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
            </Button>
            
            {step < 3 ? (
              <Button type="button" onClick={nextStep} className="font-bold rounded-xl h-12 px-8">
                Continuar <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button type="button" className="font-black rounded-xl h-12 px-10 bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-500/20">
                    Guardar Cambios
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-border bg-surface p-8">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black">¿Confirmar Cambios?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base font-medium text-text-secondary pt-2">
                      La oferta se actualizará con la nueva información. Los egresados verán estos cambios de inmediato.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-6 gap-3">
                    <AlertDialogCancel className="rounded-xl font-bold border-border">Volver</AlertDialogCancel>
                    <AlertDialogAction 
                      className="rounded-xl font-black bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/10"
                      onClick={handleSubmit(handleFinalSubmit)}
                    >
                      Sí, actualizar ahora
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
