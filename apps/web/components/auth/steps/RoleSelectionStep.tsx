'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/contexts/RegisterContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  GraduationCap, 
  Building, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

const ROLES = [
  {
    value: 'EGRESADO',
    label: 'Soy Egresado',
    desc: 'Busco empleo y quiero potenciar mi carrera profesional.',
    icon: GraduationCap,
    color: 'text-primary-600',
    bgColor: 'bg-primary-50 dark:bg-primary-900/20',
    borderColor: 'border-primary-200',
  },
  {
    value: 'EMPRESA',
    label: 'Soy Empresa',
    desc: 'Quiero publicar ofertas y encontrar talento calificado.',
    icon: Building,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/20',
  },
];

export function RoleSelectionStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();
  const [selectedRole, setSelectedRole] = useState<string>(state.role);

  const handleContinue = () => {
    dispatch({ 
      type: 'SET_CREDENTIALS', 
      payload: { 
        email: state.email, 
        password: state.password, 
        role: selectedRole 
      } 
    });
    router.push('/auth/register/step/2');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-6 mb-8">
          <h1 className="text-4xl font-black tracking-tight text-text-primary">
            ¿Qué tipo de cuenta necesitas?
          </h1>
          <p className="text-lg text-text-secondary font-medium">
            Selecciona el rol que mejor describe tu necesidad en la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {ROLES.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={cn(
                'relative p-8 rounded-2xl border-2 transition-all duration-300 text-left group',
                'hover:shadow-lg hover:scale-[1.02]',
                selectedRole === role.value
                  ? `${role.borderColor} ${role.bgColor} shadow-xl`
                  : 'border-border bg-surface hover:border-border-hover'
              )}
            >
              {/* Selection indicator */}
              <div className={cn(
                "absolute top-4 right-4 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                selectedRole === role.value 
                  ? "border-primary-600 bg-primary-600" 
                  : "border-border"
              )}>
                {selectedRole === role.value && (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Icon */}
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                role.bgColor,
                role.color
              )}>
                <role.icon className="h-8 w-8" />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className={cn(
                  "text-xl font-black",
                  selectedRole === role.value 
                    ? "text-primary-700 dark:text-primary-400" 
                    : "text-text-primary"
                )}>
                  {role.label}
                </h3>
                <p className="text-sm text-text-secondary font-medium leading-relaxed">
                  {role.desc}
                </p>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            size="lg"
            className="h-14 px-8 rounded-xl font-black text-base gap-3 shadow-lg hover:shadow-xl transition-all"
          >
            Continuar con {selectedRole === 'EGRESADO' ? 'Egresado' : 'Empresa'}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
