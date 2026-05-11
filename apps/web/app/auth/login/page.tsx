'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '../../../lib/api';
import { useAuthStore } from '../../../lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Users, 
  Building2,
  Eye,
  EyeOff,
  Github
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);

      // 1. Guardar en cookie PRIMERO (accesible por middleware)
      document.cookie = `access_token=${res.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      
      // 2. Guardar en localStorage para peticiones directas al API
      localStorage.setItem('access_token', res.accessToken);
      
      setAuth(res.user, res.accessToken);

      const destinos: Record<string, string> = {
        ADMIN: '/dashboard',
        EGRESADO: '/dashboard/egresado',
        EMPRESA: '/dashboard/empresa',
      };

      toast({ title: "¡Bienvenido de nuevo!", description: "Iniciando sesión..." });
      
      // 3. Esperar un tick para que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 4. Redirigir usando replace (no push)
      router.replace(destinos[res.user.role] ?? '/dashboard');
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error de acceso",
        description: e.response?.data?.message || 'Credenciales incorrectas',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background transition-colors duration-500">
      {/* Columna Izquierda: Formulario */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 md:p-16 lg:p-24 animate-in fade-in slide-in-from-left-4 duration-700">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-xl shadow-primary-500/20">
              <span className="text-white font-black text-2xl">E</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-text-primary">
              Egresados<span className="text-primary-600">Hub</span>
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-text-primary">Inicia Sesión</h1>
            <p className="text-text-secondary font-medium">Conecta con tu futuro profesional hoy mismo.</p>
          </div>

          {/* Acceso rápido demo */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '🛡 Admin',    email: 'admin@demo.edu.pe',  password: 'Admin123*'   },
              { label: '🏢 Empresa',  email: 'empresa@demo.pe',    password: 'Empresa123*' },
              { label: '🎓 Egresado', email: 'egresado@demo.pe',   password: 'Egresado123*'},
            ].map(({ label, email, password }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  (document.querySelector('input[name="email"]') as HTMLInputElement).value = email;
                  (document.querySelector('input[name="password"]') as HTMLInputElement).value = password;
                  void onSubmit({ email, password });
                }}
                className="text-xs py-2 px-3 rounded-xl font-semibold border border-border hover:bg-bg-subtle transition-all text-text-secondary"
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                  Correo Electrónico
                </label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  className="h-12 rounded-xl bg-bg-base border-border focus:ring-2"
                />
                {errors.email && (
                  <p className="text-xs text-error font-bold">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                    Contraseña
                  </label>
                  <Link href="/auth/forgot" className="text-xs font-bold text-primary-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="h-12 rounded-xl bg-bg-base border-border focus:ring-2 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error font-bold">{errors.password.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary-500/20 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Entrar al Portal <ArrowRight className="h-5 w-5" /></>
              )}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
                <span className="bg-background px-4 text-text-muted">O continúa con</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-12 rounded-xl font-bold gap-2 border-2" 
                type="button"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/google`}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button 
                variant="outline" 
                className="h-12 rounded-xl font-bold gap-2 border-2" 
                type="button"
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/github`}
              >
                <Github className="h-5 w-5" />
                GitHub
              </Button>
            </div>
          </form>

          <p className="text-center text-sm font-medium text-text-secondary">
            ¿Aún no tienes cuenta?{" "}
            <Link href="/auth/register" className="text-primary-600 font-black hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>

      {/* Columna Derecha: Ilustración / Stats */}
      <div className="hidden md:flex flex-1 bg-primary-600 relative overflow-hidden items-center justify-center p-12 lg:p-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-900 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-xl space-y-12 text-white animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-4 py-1.5 text-sm font-black uppercase tracking-widest">
              Plataforma Premium
            </Badge>
            <h2 className="text-5xl lg:text-6xl font-black leading-[1.1] tracking-tighter">
              El puente entre el talento y la industria.
            </h2>
            <p className="text-xl text-primary-100 font-medium leading-relaxed">
              Únete a la red más grande de egresados y empresas verificadas de la región.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-3xl font-black font-mono">15k+</span>
              </div>
              <p className="text-sm font-bold text-primary-200 uppercase tracking-widest">Egresados Activos</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <span className="text-3xl font-black font-mono">450+</span>
              </div>
              <p className="text-sm font-bold text-primary-200 uppercase tracking-widest">Empresas TOP</p>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl space-y-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-black text-lg italic leading-tight">
                  "Gracias a EgresadosHub conseguí mi primer empleo como Senior Dev en una multinacional."
                </p>
                <p className="text-sm font-bold text-primary-200 mt-1">— Maria García, Ing. Sistemas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}