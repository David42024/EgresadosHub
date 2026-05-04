'use client';

import { useEffect, useState, createContext, useContext, useReducer } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { authApi, egresadosApi, empresasApi } from '../../../../../lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap, Building2, CheckCircle2, ChevronLeft,
  ArrowRight, UserPlus, SkipForward, Check, Loader2
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type UserRole = 'EGRESADO' | 'EMPRESA' | 'ADMIN';

type StepStatus = 'completed' | 'current' | 'pending' | 'skipped';

interface StepInfo {
  id: number;
  label: string;
  status: StepStatus;
}

interface RegisterState {
  isRegistered: boolean;
  isProfileCreated: boolean;
  skippedSteps: number[];
  role: UserRole | null;
  egresadoData: any;
  empresaData: any;
}

type RegisterAction =
  | { type: 'SET_REGISTERED'; payload: boolean }
  | { type: 'SET_PROFILE_CREATED'; payload: boolean }
  | { type: 'SKIP_STEP'; payload: number }
  | { type: 'SET_ROLE'; payload: UserRole }
  | { type: 'SET_EGRESADO_DATA'; payload: any }
  | { type: 'SET_EMPRESA_DATA'; payload: any };

// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const RegisterContext = createContext<{
  state: RegisterState;
  dispatch: React.Dispatch<RegisterAction>;
} | null>(null);

function registerReducer(state: RegisterState, action: RegisterAction): RegisterState {
  switch (action.type) {
    case 'SET_REGISTERED':      return { ...state, isRegistered: action.payload };
    case 'SET_PROFILE_CREATED': return { ...state, isProfileCreated: action.payload };
    case 'SKIP_STEP':           return { ...state, skippedSteps: [...state.skippedSteps, action.payload] };
    case 'SET_ROLE':            return { ...state, role: action.payload };
    case 'SET_EGRESADO_DATA':   return { ...state, egresadoData: action.payload };
    case 'SET_EMPRESA_DATA':    return { ...state, empresaData: action.payload };
    default: return state;
  }
}

function RegisterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(registerReducer, {
    isRegistered: false,
    isProfileCreated: false,
    skippedSteps: [],
    role: null,
    egresadoData: null,
    empresaData: null,
  });
  return (
    <RegisterContext.Provider value={{ state, dispatch }}>
      {children}
    </RegisterContext.Provider>
  );
}

function useRegister() {
  const ctx = useContext(RegisterContext);
  if (!ctx) throw new Error('useRegister must be used within RegisterProvider');
  return ctx;
}

// ─── STEP INDICATOR ──────────────────────────────────────────────────────────
function StepIndicator({ steps, currentStep }: { steps: StepInfo[]; currentStep: number }) {
  return (
    <div className="w-full border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="font-black text-text-primary hidden sm:block">EgresadosHub</span>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-1 sm:gap-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all",
                    step.status === 'completed' && "bg-primary-600 text-white",
                    step.status === 'current'   && "bg-primary-600 text-white ring-4 ring-primary-100",
                    step.status === 'pending'   && "bg-bg-subtle text-text-muted border-2 border-border",
                    step.status === 'skipped'   && "bg-warning/20 text-warning border-2 border-warning/50",
                  )}>
                    {step.status === 'completed' ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <span className={cn(
                    "text-xs font-bold hidden md:block",
                    step.status === 'current'   && "text-primary-600",
                    step.status === 'completed' && "text-text-secondary",
                    step.status === 'pending'   && "text-text-muted",
                    step.status === 'skipped'   && "text-warning",
                  )}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    "h-px w-4 sm:w-8 transition-all",
                    step.status === 'completed' ? "bg-primary-600" : "bg-border"
                  )} />
                )}
              </div>
            ))}
          </div>

          <Badge variant="secondary" className="font-black text-xs">
            {currentStep}/{steps.length}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ─── SKIP BANNER ─────────────────────────────────────────────────────────────
function SkipBanner({ onSkip, isOptional }: { onSkip: () => void; isOptional: boolean }) {
  if (!isOptional) return null;
  return (
    <div className="bg-warning/10 border-b border-warning/20">
      <div className="max-w-4xl mx-auto px-6 py-2 flex items-center justify-between">
        <p className="text-sm font-medium text-warning-700 dark:text-warning">
          Este paso es opcional — puedes completarlo después desde tu perfil.
        </p>
        <Button variant="ghost" size="sm" onClick={onSkip}
          className="text-warning font-black gap-1.5 hover:bg-warning/10">
          <SkipForward className="h-4 w-4" /> Saltar
        </Button>
      </div>
    </div>
  );
}

// ─── STEP 1: SELECCIÓN DE ROL ─────────────────────────────────────────────────
function RoleSelectionStep() {
  const { state, dispatch } = useRegister();
  const router = useRouter();
  const [selected, setSelected] = useState<UserRole>(state.role ?? 'EGRESADO');

  const ROLES = [
    { value: 'EGRESADO' as UserRole, label: 'Soy Egresado', desc: 'Busco empleo y quiero potenciar mi carrera profesional.', icon: GraduationCap, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { value: 'EMPRESA'  as UserRole, label: 'Soy Empresa',  desc: 'Quiero publicar ofertas y encontrar talento universitario.', icon: Building2, color: 'text-success', bg: 'bg-success/10' },
  ];

  const handleContinue = () => {
    dispatch({ type: 'SET_ROLE', payload: selected });
    router.push('/auth/register/step/2');
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">¿Cuál es tu rol?</h1>
        <p className="text-text-secondary font-medium">Selecciona cómo usarás la plataforma.</p>
      </div>

      <div className="space-y-4">
        {ROLES.map((r) => (
          <button key={r.value} type="button" onClick={() => setSelected(r.value)}
            className={cn(
              'w-full flex items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left',
              selected === r.value
                ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-surface hover:border-border-hover'
            )}>
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", r.bg, r.color)}>
              <r.icon className="h-6 w-6" />
            </div>
            <div className="space-y-1 flex-1">
              <p className={cn("font-black text-lg", selected === r.value ? "text-primary-700 dark:text-primary-400" : "text-text-primary")}>
                {r.label}
              </p>
              <p className="text-sm text-text-secondary font-medium leading-tight">{r.desc}</p>
            </div>
            <div className={cn(
              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all mt-1",
              selected === r.value ? "border-primary-600 bg-primary-600" : "border-border"
            )}>
              {selected === r.value && <CheckCircle2 className="h-4 w-4 text-white" />}
            </div>
          </button>
        ))}
      </div>

      <Button onClick={handleContinue} className="w-full h-12 rounded-xl font-black gap-2">
        Continuar <ArrowRight className="h-5 w-5" />
      </Button>

      <p className="text-center text-sm text-text-secondary">
        ¿Ya tienes cuenta?{' '}
        <a href="/auth/login" className="text-primary-600 font-black hover:underline">Inicia sesión</a>
      </p>
    </div>
  );
}

// ─── STEP 2: CREDENCIALES ─────────────────────────────────────────────────────
function CredentialsStep() {
  const { state, dispatch } = useRegister();
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const egresadoSchema = z.object({
    email:    z.string().email("Correo inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    nombre:   z.string().min(2, "Ingresa tu nombre"),
    apellido: z.string().min(2, "Ingresa tu apellido"),
    dni:      z.string().min(8, "DNI debe tener 8 dígitos"),
    carrera:  z.string().optional(),
  });

  const empresaSchema = z.object({
    email:           z.string().email("Correo inválido"),
    password:        z.string().min(6, "Mínimo 6 caracteres"),
    nombreComercial: z.string().min(2, "Ingresa el nombre comercial"),
    razonSocial:     z.string().min(2, "Ingresa la razón social"),
    ruc:             z.string().min(11, "RUC debe tener 11 dígitos"),
    sector:          z.string().optional(),
  });

  const isEgresado = state.role === 'EGRESADO';
  const schema = isEgresado ? egresadoSchema : empresaSchema;

  const { register, handleSubmit, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema as any),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let res: any;
      if (isEgresado) {
        res = await authApi.registerEgresado(data);
      } else {
        res = await authApi.registerEmpresa(data);
      }

      localStorage.setItem('access_token', res.accessToken);
      setAuth(res.user, res.accessToken);
      dispatch({ type: 'SET_REGISTERED', payload: true });

      toast({ title: "¡Cuenta creada!", description: "Completemos tu perfil..." });
      router.push('/auth/register/step/3');
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

  const err = errors as any;

  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.push('/auth/register/step/1')}
          className="p-0 h-auto font-bold text-text-muted hover:text-text-primary gap-1">
          <ChevronLeft className="h-4 w-4" /> Volver
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">
          {isEgresado ? 'Tus datos como Egresado' : 'Datos de tu Empresa'}
        </h1>
        <p className="text-text-secondary font-medium">Crea tu cuenta para continuar.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Campos comunes */}
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Correo Electrónico</label>
          <Input {...register("email")} type="email" placeholder="nombre@ejemplo.com" className="h-12 rounded-xl" />
          {err.email && <p className="text-xs text-error font-bold">{err.email.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Contraseña</label>
          <Input {...register("password")} type="password" placeholder="••••••••" className="h-12 rounded-xl" />
          {err.password && <p className="text-xs text-error font-bold">{err.password.message}</p>}
        </div>

        {/* Campos Egresado */}
        {isEgresado && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">Nombre</label>
                <Input {...register("nombre")} placeholder="Juan" className="h-12 rounded-xl" />
                {err.nombre && <p className="text-xs text-error font-bold">{err.nombre.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">Apellido</label>
                <Input {...register("apellido")} placeholder="Pérez" className="h-12 rounded-xl" />
                {err.apellido && <p className="text-xs text-error font-bold">{err.apellido.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">DNI</label>
              <Input {...register("dni")} placeholder="12345678" className="h-12 rounded-xl" />
              {err.dni && <p className="text-xs text-error font-bold">{err.dni.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">Carrera (opcional)</label>
              <Input {...register("carrera")} placeholder="Ingeniería de Sistemas" className="h-12 rounded-xl" />
            </div>
          </>
        )}

        {/* Campos Empresa */}
        {!isEgresado && (
          <>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">Nombre Comercial</label>
              <Input {...register("nombreComercial")} placeholder="TechPeru SAC" className="h-12 rounded-xl" />
              {err.nombreComercial && <p className="text-xs text-error font-bold">{err.nombreComercial.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">Razón Social</label>
              <Input {...register("razonSocial")} placeholder="Technology Peru SAC" className="h-12 rounded-xl" />
              {err.razonSocial && <p className="text-xs text-error font-bold">{err.razonSocial.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">RUC</label>
              <Input {...register("ruc")} placeholder="20601234567" className="h-12 rounded-xl" />
              {err.ruc && <p className="text-xs text-error font-bold">{err.ruc.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">Sector (opcional)</label>
              <Input {...register("sector")} placeholder="Tecnología" className="h-12 rounded-xl" />
            </div>
          </>
        )}

        <Button type="submit" className="w-full h-12 rounded-xl font-black gap-2" disabled={isLoading}>
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
            : <> Crear Cuenta <UserPlus className="h-5 w-5" /> </>}
        </Button>
      </form>
    </div>
  );
}

// ─── STEP 3: DATOS ACADÉMICOS / EMPRESA ──────────────────────────────────────
function DatosAcademicosStep() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    carrera:    z.string().min(2, "Ingresa tu carrera"),
    anioEgreso: z.number({ required_error: "Ingresa el año" }).min(2000).max(2030),
    telefono:   z.string().optional(),
    direccion:  z.string().optional(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await egresadosApi.update(user.id, {
        carrera: data.carrera,
        anioEgreso: Number(data.anioEgreso),
        telefono: data.telefono,
        direccion: data.direccion,
      });
      toast({ title: "Datos guardados", description: "Continuemos con tu perfil..." });
      router.push('/auth/register/step/4');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.response?.data?.message || 'Error al guardar' });
    } finally {
      setIsLoading(false);
    }
  };

  const err = errors as any;

  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">Datos Académicos</h1>
        <p className="text-text-secondary font-medium">Cuéntanos sobre tu formación universitaria.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Carrera *</label>
          <Input {...register("carrera")} placeholder="Ingeniería de Sistemas" className="h-12 rounded-xl" />
          {err.carrera && <p className="text-xs text-error font-bold">{err.carrera.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Año de Egreso *</label>
          <Input {...register("anioEgreso", { valueAsNumber: true })} type="number"
            placeholder="2022" min={2000} max={2030} className="h-12 rounded-xl" />
          {err.anioEgreso && <p className="text-xs text-error font-bold">{err.anioEgreso.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Teléfono (opcional)</label>
          <Input {...register("telefono")} placeholder="987654321" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Dirección (opcional)</label>
          <Input {...register("direccion")} placeholder="Av. Universitaria 123, Lima" className="h-12 rounded-xl" />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}
            className="flex-1 h-12 rounded-xl font-bold">
            Hacer después
          </Button>
          <Button type="submit" className="flex-1 h-12 rounded-xl font-black gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <> Guardar <ArrowRight className="h-4 w-4" /> </>}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── STEP 3 EMPRESA: DATOS EMPRESA ───────────────────────────────────────────
function EmpresaDatosStep() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const schema = z.object({
    sector:     z.string().min(2, "Ingresa el sector"),
    sitioWeb:   z.string().optional(),
    descripcion: z.string().optional(),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await empresasApi.update(user.id, data);
      toast({ title: "Datos guardados" });
      router.push('/auth/register/step/4');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.response?.data?.message || 'Error al guardar' });
    } finally {
      setIsLoading(false);
    }
  };

  const err = errors as any;

  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">Datos de tu Empresa</h1>
        <p className="text-text-secondary font-medium">Completa la información de tu organización.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Sector *</label>
          <Input {...register("sector")} placeholder="Tecnología" className="h-12 rounded-xl" />
          {err.sector && <p className="text-xs text-error font-bold">{err.sector.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Sitio Web</label>
          <Input {...register("sitioWeb")} placeholder="https://miempresa.pe" className="h-12 rounded-xl" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Descripción</label>
          <textarea {...register("descripcion")}
            placeholder="Describe brevemente tu empresa..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-border bg-bg-base text-sm outline-none focus:ring-2 focus:ring-primary-600 resize-none" />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}
            className="flex-1 h-12 rounded-xl font-bold">
            Hacer después
          </Button>
          <Button type="submit" className="flex-1 h-12 rounded-xl font-black gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <> Guardar <ArrowRight className="h-4 w-4" /> </>}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── STEP 4: CONTACTO / PRESENTACIÓN EMPRESA ─────────────────────────────────
function ContactoStep() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit } = useForm();

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await egresadosApi.update(user.id, data);
      toast({ title: "Contacto guardado" });
      router.push('/auth/register/step/5');
    } catch {
      toast({ variant: "destructive", title: "Error al guardar" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">Información de Contacto</h1>
        <p className="text-text-secondary font-medium">¿Cómo pueden contactarte las empresas?</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Teléfono</label>
          <Input {...register("telefono")} placeholder="987654321" className="h-12 rounded-xl" />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-text-muted">Dirección</label>
          <Input {...register("direccion")} placeholder="Lima, Perú" className="h-12 rounded-xl" />
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}
            className="flex-1 h-12 rounded-xl font-bold">Saltar</Button>
          <Button type="submit" className="flex-1 h-12 rounded-xl font-black gap-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Guardar <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EmpresaPresentacionStep() {
  const router = useRouter();
  router.push('/dashboard');
  return null;
}

// ─── STEP 5: PERFIL PROFESIONAL / BIENVENIDA ─────────────────────────────────
function PerfilProfesionalStep() {
  const router = useRouter();
  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-center">
      <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-primary-600" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">¡Perfil casi listo!</h1>
        <p className="text-text-secondary font-medium">
          Puedes agregar más detalles desde tu perfil en el dashboard.
        </p>
      </div>
      <Button onClick={() => router.push('/dashboard')} className="w-full h-12 rounded-xl font-black gap-2">
        Ir al Dashboard <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

function BienvenidaStep() {
  const router = useRouter();
  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-500 text-center">
      <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-10 w-10 text-success" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">¡Bienvenido a EgresadosHub!</h1>
        <p className="text-text-secondary font-medium">
          Tu empresa está lista para publicar ofertas y encontrar talento.
        </p>
      </div>
      <Button onClick={() => router.push('/dashboard')} className="w-full h-12 rounded-xl font-black gap-2">
        Ir al Dashboard <ArrowRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

// ─── STEP 6: HABILIDADES ─────────────────────────────────────────────────────
function HabilidadesStep() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [habilidades, setHabilidades] = useState<any[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void import('../../../../../lib/api').then(({ habilidadesApi }) => {
      habilidadesApi.list().then(setHabilidades).catch(() => {});
    });
  }, []);

  const toggle = (id: string) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
    );
  };

  const handleGuardar = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      for (const habilidadId of seleccionadas) {
        await egresadosApi.agregarHabilidad(user.id, { habilidadId, nivel: 'INTERMEDIO' });
      }
      toast({ title: "¡Habilidades guardadas!" });
      router.push('/dashboard');
    } catch {
      toast({ variant: "destructive", title: "Error al guardar habilidades" });
    } finally {
      setIsLoading(false);
    }
  };

  const tecnicas = habilidades.filter(h => h.tipo === 'TECNICA');
  const blandas  = habilidades.filter(h => h.tipo === 'BLANDA');

  return (
    <div className="max-w-lg mx-auto px-6 py-12 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-text-primary">Tus Habilidades</h1>
        <p className="text-text-secondary font-medium">
          Selecciona las habilidades que tienes. Esto mejora tu visibilidad ante las empresas.
        </p>
      </div>

      {tecnicas.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">Técnicas</p>
          <div className="flex flex-wrap gap-2">
            {tecnicas.map(h => (
              <button key={h.id} type="button" onClick={() => toggle(h.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-semibold border transition-all",
                  seleccionadas.includes(h.id)
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-surface text-text-secondary border-border hover:border-primary-400"
                )}>
                {h.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      {blandas.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-black uppercase tracking-widest text-text-muted">Blandas</p>
          <div className="flex flex-wrap gap-2">
            {blandas.map(h => (
              <button key={h.id} type="button" onClick={() => toggle(h.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-semibold border transition-all",
                  seleccionadas.includes(h.id)
                    ? "bg-success text-white border-success"
                    : "bg-surface text-text-secondary border-border hover:border-success"
                )}>
                {h.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-text-muted font-medium">
        {seleccionadas.length} habilidades seleccionadas
      </p>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}
          className="flex-1 h-12 rounded-xl font-bold">Saltar</Button>
        <Button onClick={handleGuardar} className="flex-1 h-12 rounded-xl font-black gap-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <> Finalizar <CheckCircle2 className="h-4 w-4" /> </>}
        </Button>
      </div>
    </div>
  );
}

// ─── CONTENIDO PRINCIPAL ─────────────────────────────────────────────────────
function RegisterContent() {
  const router = useRouter();
  const params = useParams();
  const { state, dispatch } = useRegister();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  const stepNumber = parseInt(params.step as string);

  useEffect(() => {
    if (!user && stepNumber > 2) {
      router.push('/auth/register/step/1');
      return;
    }
    if (user) {
      dispatch({ type: 'SET_REGISTERED', payload: true });
      dispatch({ type: 'SET_ROLE', payload: user.role as UserRole });
    }
    setIsLoading(false);
  }, [user, stepNumber, router, dispatch]);

  const getSteps = (): StepInfo[] => {
    const role = user?.role ?? state.role;

    const getStatus = (id: number): StepStatus => {
      if (id < stepNumber) return state.skippedSteps.includes(id) ? 'skipped' : 'completed';
      if (id === stepNumber) return 'current';
      return 'pending';
    };

    if (!user) {
      return [
        { id: 1, label: 'Rol',          status: stepNumber === 1 ? 'current' : 'completed' },
        { id: 2, label: 'Credenciales', status: stepNumber === 2 ? 'current' : 'pending' },
      ];
    }

    if (role === 'EGRESADO') {
      return [
        { id: 1, label: 'Rol',               status: 'completed' },
        { id: 2, label: 'Credenciales',       status: 'completed' },
        { id: 3, label: 'Datos Académicos',   status: getStatus(3) },
        { id: 4, label: 'Contacto',           status: getStatus(4) },
        { id: 5, label: 'Perfil',             status: getStatus(5) },
        { id: 6, label: 'Habilidades',        status: getStatus(6) },
      ];
    }

    if (role === 'EMPRESA') {
      return [
        { id: 1, label: 'Rol',           status: 'completed' },
        { id: 2, label: 'Credenciales',  status: 'completed' },
        { id: 3, label: 'Datos Empresa', status: getStatus(3) },
        { id: 4, label: 'Presentación',  status: getStatus(4) },
        { id: 5, label: 'Bienvenida',    status: getStatus(5) },
      ];
    }

    return [];
  };

  const isOptionalStep = () => {
    const role = user?.role ?? state.role;
    if (role === 'EGRESADO') return stepNumber >= 4 && stepNumber <= 6;
    if (role === 'EMPRESA')  return stepNumber === 4;
    return false;
  };

  const handleSkip = () => {
    dispatch({ type: 'SKIP_STEP', payload: stepNumber });
    router.push(`/auth/register/step/${stepNumber + 1}`);
  };

  const renderStep = () => {
    const role = user?.role ?? state.role;

    switch (stepNumber) {
      case 1: return <RoleSelectionStep />;
      case 2: return <CredentialsStep />;
      case 3:
        if (role === 'EGRESADO') return <DatosAcademicosStep />;
        if (role === 'EMPRESA')  return <EmpresaDatosStep />;
        return null;
      case 4:
        if (role === 'EGRESADO') return <ContactoStep />;
        if (role === 'EMPRESA')  return <EmpresaPresentacionStep />;
        return null;
      case 5:
        if (role === 'EGRESADO') return <PerfilProfesionalStep />;
        if (role === 'EMPRESA')  return <BienvenidaStep />;
        return null;
      case 6:
        return <HabilidadesStep />;
      default:
        router.push('/auth/register/step/1');
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950">
      <StepIndicator steps={getSteps()} currentStep={stepNumber} />
      <SkipBanner onSkip={handleSkip} isOptional={isOptionalStep()} />
      {renderStep()}
    </div>
  );
}

// ─── EXPORT PRINCIPAL ─────────────────────────────────────────────────────────
export default function RegisterStepPage() {
  return (
    <RegisterProvider>
      <RegisterContent />
    </RegisterProvider>
  );
}