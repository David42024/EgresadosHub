'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/auth-store';
import { cn } from '../../../lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { 
  GraduationCap, 
  Building2, 
  ArrowRight, 
  ChevronLeft, 
  UserPlus, 
  CheckCircle2, 
  ShieldCheck,
  Briefcase,
  Star
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const ROLES = [
  {
    value: 'EGRESADO',
    label: 'Soy Egresado',
    desc: 'Busco empleo y quiero potenciar mi carrera.',
    icon: GraduationCap,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
  },
  {
    value: 'EMPRESA',
    label: 'Soy Empresa',
    desc: 'Quiero publicar ofertas y encontrar talento.',
    icon: Building2,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

const registerEgresadoSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  nombre: z.string().min(2, "Ingresa tu nombre"),
  apellido: z.string().min(2, "Ingresa tu apellido"),
  dni: z.string().min(8, "DNI inválido"),
  carrera: z.string().optional(),
  anioEgreso: z.number().optional(),
});

const registerEmpresaSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  nombreComercial: z.string().min(2, "Ingresa el nombre comercial"),
  razonSocial: z.string().min(2, "Ingresa la razón social"),
  ruc: z.string().min(11, "RUC inválido"),
  sector: z.string().optional(),
});

function RegisterPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { setAuth } = useAuthStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<'EGRESADO' | 'EMPRESA'>(
    (params.get('role') as 'EGRESADO' | 'EMPRESA') ?? 'EGRESADO'
  );
  const [isLoading, setIsLoading] = useState(false);

  const egresadoForm = useForm({
    resolver: zodResolver(registerEgresadoSchema),
  });

  const empresaForm = useForm({
    resolver: zodResolver(registerEmpresaSchema),
  });

  const onSubmit = async (data: any) => {
    if (step === 1) { setStep(2); return; }
    setIsLoading(true);
    try {
      let res: any;
      if (selectedRole === 'EGRESADO') {
        res = await authApi.registerEgresado(data);
      } else {
        res = await authApi.registerEmpresa(data);
      }

      localStorage.setItem('access_token', res.accessToken);
      setAuth(res.user, res.accessToken);

      toast({ title: "¡Cuenta creada!", description: "Redirigiendo al panel..." });
      router.push('/dashboard');
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description: e.response?.data?.message || 'Error al crear la cuenta',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentForm = selectedRole === 'EGRESADO' ? egresadoForm : empresaForm;
  const { register, handleSubmit, formState: { errors } } = currentForm as any;

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background transition-colors duration-500">
      {/* Columna Izquierda: Formulario */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="absolute top-8 right-8"><ThemeToggle /></div>
        <div className="w-full max-w-md space-y-10">
          {/* Logo */}
          <Link href="/auth/login" className="flex items-center gap-3 w-fit group">
            <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl">E</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-text-primary">EgresadosHub</span>
          </Link>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight text-text-primary">Crea tu cuenta</h1>
              <Badge variant="secondary" className="font-black">Paso {step}/2</Badge>
            </div>
            <p className="text-text-secondary font-medium">Únete a la comunidad profesional más grande.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* PASO 1 — Selección de rol */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <h2 className="text-sm font-black uppercase tracking-widest text-text-muted">¿Cuál es tu rol?</h2>
                <div className="grid grid-cols-1 gap-4">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setSelectedRole(r.value as any)}
                      className={cn(
                        'flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left group',
                        selectedRole === r.value
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                          : 'border-border bg-surface hover:border-border-hover'
                      )}
                    >
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", r.bgColor, r.color)}>
                        <r.icon className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <p className={cn("font-black text-lg", selectedRole === r.value ? "text-primary-700 dark:text-primary-400" : "text-text-primary")}>
                          {r.label}
                        </p>
                        <p className="text-sm text-text-secondary font-medium leading-tight">{r.desc}</p>
                      </div>
                      <div className={cn(
                        "ml-auto h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                        selectedRole === r.value ? "border-primary-600 bg-primary-600" : "border-border"
                      )}>
                        {selectedRole === r.value && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
                <Button type="button" onClick={() => setStep(2)} className="w-full h-12 rounded-xl font-black gap-2">
                  Continuar <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* PASO 2 — Datos según rol */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}
                  className="p-0 h-auto font-bold text-text-muted hover:text-text-primary gap-2">
                  <ChevronLeft className="h-4 w-4" /> Volver a selección
                </Button>

                {/* Campos comunes */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted">Correo Electrónico</label>
                  <Input {...register("email")} type="email" placeholder="nombre@ejemplo.com" className="h-12 rounded-xl" />
                  {(errors as any).email && <p className="text-xs text-error font-bold">{(errors as any).email?.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted">Contraseña</label>
                  <Input {...register("password")} type="password" placeholder="••••••••" className="h-12 rounded-xl" />
                  {(errors as any).password && <p className="text-xs text-error font-bold">{(errors as any).password?.message}</p>}
                </div>

                {/* Campos de Egresado */}
                {selectedRole === 'EGRESADO' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted">Nombre</label>
                        <Input {...register("nombre")} placeholder="Juan" className="h-12 rounded-xl" />
                        {(errors as any).nombre && <p className="text-xs text-error font-bold">{(errors as any).nombre?.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted">Apellido</label>
                        <Input {...register("apellido")} placeholder="Pérez" className="h-12 rounded-xl" />
                        {(errors as any).apellido && <p className="text-xs text-error font-bold">{(errors as any).apellido?.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">DNI</label>
                      <Input {...register("dni")} placeholder="12345678" className="h-12 rounded-xl" />
                      {(errors as any).dni && <p className="text-xs text-error font-bold">{(errors as any).dni?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Carrera (opcional)</label>
                      <Input {...register("carrera")} placeholder="Ingeniería de Sistemas" className="h-12 rounded-xl" />
                    </div>
                  </>
                )}

                {/* Campos de Empresa */}
                {selectedRole === 'EMPRESA' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Nombre Comercial</label>
                      <Input {...register("nombreComercial")} placeholder="TechPeru SAC" className="h-12 rounded-xl" />
                      {(errors as any).nombreComercial && <p className="text-xs text-error font-bold">{(errors as any).nombreComercial?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Razón Social</label>
                      <Input {...register("razonSocial")} placeholder="Technology Peru SAC" className="h-12 rounded-xl" />
                      {(errors as any).razonSocial && <p className="text-xs text-error font-bold">{(errors as any).razonSocial?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">RUC</label>
                      <Input {...register("ruc")} placeholder="20601234567" className="h-12 rounded-xl" />
                      {(errors as any).ruc && <p className="text-xs text-error font-bold">{(errors as any).ruc?.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted">Sector (opcional)</label>
                      <Input {...register("sector")} placeholder="Tecnología" className="h-12 rounded-xl" />
                    </div>
                  </>
                )}

                <Button type="submit" className="w-full h-12 rounded-xl font-black gap-2" disabled={isLoading}>
                  {isLoading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <> Crear Cuenta <UserPlus className="h-5 w-5" /> </>}
                </Button>
              </div>
            )}
          </form>

          <p className="text-center text-sm font-medium text-text-secondary">
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className="text-primary-600 font-black hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha */}
      <div className="hidden md:flex flex-1 bg-surface relative overflow-hidden items-center justify-center p-12 lg:p-24 border-l border-border">
        <div className="absolute inset-0 bg-bg-base opacity-50">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        </div>
        <div className="relative z-10 w-full max-w-xl space-y-12 animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <h2 className="text-5xl font-black tracking-tighter text-text-primary">
              Empieza tu viaje profesional con nosotros.
            </h2>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: "Perfiles Verificados",  desc: "Seguridad y confianza en cada interacción." },
                { icon: Briefcase,   title: "Ofertas Exclusivas",    desc: "Accede a vacantes diseñadas para tu carrera." },
                { icon: Star,        title: "Match Inteligente",     desc: "Te conectamos con las empresas que buscan tu perfil." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0 text-primary-600">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-text-primary">{item.title}</p>
                    <p className="text-sm text-text-secondary font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-none shadow-2xl bg-white dark:bg-gray-900">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <Avatar key={i} className="border-2 border-surface h-10 w-10">
                      <AvatarImage src={`https://i.pravatar.cc/100?u=${i}`} />
                    </Avatar>
                  ))}
                  <div className="h-10 w-10 rounded-full bg-bg-elevated border-2 border-surface flex items-center justify-center text-[10px] font-black text-text-muted">
                    +12k
                  </div>
                </div>
                <Badge className="font-black bg-green-100 text-green-700">SISTEMA ACTIVO</Badge>
              </div>
              <p className="text-sm text-text-secondary font-medium leading-relaxed">
                "La plataforma me ayudó a organizar mi CV y postular a empresas que no conocía. El proceso fue muy transparente."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <RegisterPageContent />
    </Suspense>
  );
}