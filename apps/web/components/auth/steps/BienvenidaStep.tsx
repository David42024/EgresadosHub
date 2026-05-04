'use client';

import { useRouter } from 'next/navigation';
import { useRegister } from '@/contexts/RegisterContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

export function BienvenidaStep() {
  const router = useRouter();
  const { state } = useRegister();

  // Calcular porcentaje de completado
  const calculateCompletion = () => {
    const requiredFields = ['razonSocial', 'sector', 'ubicacion'];
    const optionalFields = ['descripcion', 'logoUrl', 'sitioWeb', 'ruc'];
    
    const requiredCompleted = requiredFields.filter(field => state[field as keyof typeof state]).length;
    const optionalCompleted = optionalFields.filter(field => state[field as keyof typeof state]).length;
    
    const requiredWeight = 0.7; // 70% peso para campos obligatorios
    const optionalWeight = 0.3; // 30% peso para campos opcionales
    
    return Math.round(
      (requiredCompleted / requiredFields.length) * requiredWeight * 100 +
      (optionalCompleted / optionalFields.length) * optionalWeight * 100
    );
  };

  const completionPercentage = calculateCompletion();

  const handleGoToDashboard = () => {
    router.push('/dashboard/empresa');
  };

  const handlePublishOffer = () => {
    router.push('/dashboard/empresa/ofertas/nueva');
  };

  const completionItems = [
    { 
      key: 'razonSocial', 
      label: 'Razón Social', 
      completed: !!state.razonSocial,
      required: true 
    },
    { 
      key: 'sector', 
      label: 'Sector', 
      completed: !!state.sector,
      required: true 
    },
    { 
      key: 'ubicacion', 
      label: 'Ubicación', 
      completed: !!state.ubicacion,
      required: true 
    },
    { 
      key: 'ruc', 
      label: 'RUC', 
      completed: !!state.ruc,
      required: false 
    },
    { 
      key: 'descripcion', 
      label: 'Descripción', 
      completed: !!state.descripcion,
      required: false 
    },
    { 
      key: 'logoUrl', 
      label: 'Logo', 
      completed: !!state.logoUrl,
      required: false 
    },
    { 
      key: 'sitioWeb', 
      label: 'Sitio Web', 
      completed: !!state.sitioWeb,
      required: false 
    },
  ];

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success-600 text-white font-black text-2xl mb-6">
            ✓
          </div>
          <h1 className="text-4xl font-black tracking-tight text-text-primary">
            ¡Bienvenido a {state.razonSocial}!
          </h1>
          <p className="text-xl text-text-secondary font-medium max-w-2xl mx-auto">
            Tu cuenta empresarial ha sido creada exitosamente. Estás listo para publicar ofertas y encontrar el talento perfecto para tu empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Resumen del perfil */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Perfil Completado</h2>
                  <p className="text-sm text-text-secondary">Tu información empresarial</p>
                </div>
              </div>

              {/* Progreso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text-primary">Completado</span>
                  <Badge variant="outline" className="font-black">
                    {completionPercentage}%
                  </Badge>
                </div>
                <div className="w-full bg-border rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-success to-success-600 transition-all duration-500 rounded-full"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              {/* Lista de completados */}
              <div className="space-y-3">
                {completionItems.map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        item.completed 
                          ? "bg-success text-white" 
                          : "bg-border text-text-muted"
                      )}>
                        {item.completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        item.completed ? "text-text-primary" : "text-text-muted"
                      )}>
                        {item.label}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                    {item.completed && (
                      <Badge variant="outline" className="text-xs text-success">
                        Completado
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Próximos pasos */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-text-primary">Próximos Pasos</h2>
                    <p className="text-sm text-text-secondary">Maximiza tu experiencia</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <Briefcase className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-text-primary mb-1">Publica tu primera oferta</h3>
                      <p className="text-sm text-text-secondary">
                        Crea ofertas laborales atractivas para encontrar el talento ideal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-text-primary mb-1">Revisa postulaciones</h3>
                      <p className="text-sm text-text-secondary">
                        Evalúa los perfiles y contacta a los candidatos más prometedores
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-surface">
                    <ShieldCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-bold text-text-primary mb-1">Verificación pendiente</h3>
                      <p className="text-sm text-text-secondary">
                        Tu cuenta está siendo verificada por el administrador
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-primary mb-4">Plataforma en números</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-black text-primary">2,847</div>
                    <div className="text-xs text-text-muted">Egresados activos</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-primary">156</div>
                    <div className="text-xs text-text-muted">Empresas verificadas</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-primary">423</div>
                    <div className="text-xs text-text-muted">Ofertas publicadas</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Principal */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl max-w-md mx-auto">
            <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Tu cuenta está pendiente de verificación por el administrador
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Button
              variant="outline"
              onClick={handleGoToDashboard}
              className="h-14 px-8 rounded-xl font-medium"
            >
              Ir al Dashboard
            </Button>
            
            <Button
              onClick={handlePublishOffer}
              size="lg"
              className="h-14 px-8 rounded-xl font-black gap-3 shadow-lg hover:shadow-xl transition-all"
            >
              Publicar mi primera oferta
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
