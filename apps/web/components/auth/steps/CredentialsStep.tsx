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
  UserPlus, 
  Eye, 
  EyeOff,
  Check,
  X,
  Shield
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';

const credentialsSchema = z.object({
  nombres: z.string().min(2, "Ingresa tus nombres"),
  apellidos: z.string().min(2, "Ingresa tus apellidos"),
  email: z.string().email("Correo inválido"),
  password: z.string()
    .min(6, "Mínimo 6 caracteres")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Debe incluir mayúscula, minúscula y número"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type CredentialsForm = z.infer<typeof credentialsSchema>;

export function CredentialsStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch, 
    setValue,
    formState: { errors, isValid } 
  } = useForm<CredentialsForm>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      nombres: state.nombres || '',
      apellidos: state.apellidos || '',
      email: state.email || '',
      password: state.password || '',
      confirmPassword: '',
    }
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = [
      { strength: 0, label: 'Muy débil', color: 'text-red-500' },
      { strength: 1, label: 'Débil', color: 'text-red-400' },
      { strength: 2, label: 'Regular', color: 'text-yellow-500' },
      { strength: 3, label: 'Buena', color: 'text-blue-500' },
      { strength: 4, label: 'Fuerte', color: 'text-green-500' },
    ];

    return levels[Math.min(strength, 4)];
  };

  const passwordStrength = getPasswordStrength(password);

  const registerMutation = (trpc as any).auth.register.useMutation({
    onSuccess: (data: any) => {
      // Guardar token
      localStorage.setItem('access_token', data.accessToken);
      
      // Update context
      dispatch({ type: 'SET_REGISTERED', payload: true });
      dispatch({ 
        type: 'SET_CREDENTIALS', 
        payload: { 
          email: data.user.email, 
          password: '', // Don't store password
          role: data.user.role 
        } 
      });

      toast({ 
        title: "¡Cuenta creada!", 
        description: "Ahora completa tu perfil para empezar." 
      });
      
      router.push('/auth/register/step/3');
    },
    onError: (e: any) => {
      toast({ 
        variant: "destructive", 
        title: "Error al registrar", 
        description: e.message 
      });
    },
  }) as any;

  const onSubmit = (data: CredentialsForm) => {
    registerMutation.mutate({
      nombres: data.nombres,
      apellidos: data.apellidos,
      email: data.email,
      password: data.password,
      role: state.role,
    });
  };

  const handleBack = () => {
    dispatch({ 
      type: 'SET_EGRESADO_DATA', 
      payload: { 
        nombres: watch('nombres'),
        apellidos: watch('apellidos'),
        email: watch('email')
      } 
    });
    router.push('/auth/register/step/1');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Crea tu cuenta
          </h1>
          <p className="text-text-secondary font-medium">
            Completa tus datos para registrarte como {state.role === 'EGRESADO' ? 'egresado' : 'empresa'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            className="mb-4 p-0 h-auto font-bold text-text-muted hover:text-text-primary gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a selección
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-text-muted">
                Nombres
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
                Apellidos
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
              Correo electrónico
            </label>
            <div className="relative">
              <Input
                {...register("email")}
                type="email"
                placeholder="juan.perez@unitru.edu.pe"
                className={cn(
                  "h-12 rounded-xl pr-10",
                  errors.email && "border-red-500 focus:ring-red-500",
                  !errors.email && watch('email') && "border-green-500 focus:ring-green-500"
                )}
              />
              {!errors.email && watch('email') && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
              )}
              {errors.email && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
              )}
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-muted">
              Contraseña
            </label>
            <div className="relative">
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "h-12 rounded-xl pr-20",
                  errors.password && "border-red-500 focus:ring-red-500",
                  !errors.password && password && "border-green-500 focus:ring-green-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Fortaleza</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", passwordStrength.color)}
                  >
                    {passwordStrength.label}
                  </Badge>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      passwordStrength.strength <= 1 && "bg-red-500",
                      passwordStrength.strength === 2 && "bg-yellow-500",
                      passwordStrength.strength === 3 && "bg-blue-500",
                      passwordStrength.strength >= 4 && "bg-green-500"
                    )}
                    style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}
            {errors.password && (
              <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-text-muted">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "h-12 rounded-xl pr-20",
                  errors.confirmPassword && "border-red-500 focus:ring-red-500",
                  !errors.confirmPassword && confirmPassword && password === confirmPassword && "border-green-500 focus:ring-green-500"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Tu información está protegida con encriptación de nivel bancario
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-black gap-2 shadow-lg hover:shadow-xl transition-all"
            disabled={!isValid || registerMutation.isPending}
            loading={registerMutation.isPending}
          >
            Crear Cuenta
            <UserPlus className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
