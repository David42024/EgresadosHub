'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/contexts/RegisterContext';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus,
  X,
  Clock,
  Code,
  Users,
  Languages
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Habilidad {
  nombre: string;
  nivel: number;
  categoria: 'TECNICA' | 'BLANDA' | 'IDIOMA';
}

const HABILIDADES_PREDEFINIDAS = {
  TECNICA: [
    'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
    'Python', 'Java', 'C#', 'PHP', 'Go', 'Rust',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Git', 'CI/CD', 'Agile', 'Scrum', 'TDD'
  ],
  BLANDA: [
    'Liderazgo', 'Comunicación', 'Trabajo en equipo', 'Resolución de problemas',
    'Pensamiento crítico', 'Creatividad', 'Adaptabilidad', 'Gestión del tiempo',
    'Negociación', 'Presentación', 'Escucha activa', 'Empatía',
    'Toma de decisiones', 'Planificación', 'Delegación', 'Mentoría'
  ],
  IDIOMA: [
    'Inglés', 'Español', 'Portugués', 'Francés', 'Alemán',
    'Italiano', 'Chino Mandarín', 'Japonés', 'Coreano', 'Árabe'
  ]
};

const CATEGORIAS = [
  { key: 'TECNICA', label: 'Técnicas', icon: Code, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { key: 'BLANDA', label: 'Blandas', icon: Users, color: 'bg-green-50 text-green-600 border-green-200' },
  { key: 'IDIOMA', label: 'Idiomas', icon: Languages, color: 'bg-purple-50 text-purple-600 border-purple-200' }
];

export function HabilidadesStep() {
  const router = useRouter();
  const { state, dispatch } = useRegister();
  const { data: user } = (trpc as any).auth.me.useQuery({ retry: false }) as any;
  const { data: egresadoProfile } = (trpc as any).egresados.getMyProfile.useQuery(
    { 
      enabled: !!user && user.role === 'EGRESADO',
      retry: false 
    }
  ) as any;
  const [habilidades, setHabilidades] = useState<Habilidad[]>(egresadoProfile?.habilidades?.map((h: any) => ({
    nombre: h.nombre,
    nivel: h.nivel ?? 3,
    categoria: h.categoria as 'TECNICA' | 'BLANDA' | 'IDIOMA'
  })) || []);
  const [customHabilidad, setCustomHabilidad] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<'TECNICA' | 'BLANDA' | 'IDIOMA'>('TECNICA');

  const updateProfileMutation = (trpc as any).egresados.updateProfile.useMutation({
    onSuccess: (data: any) => {
      dispatch({ 
        type: 'SET_EGRESADO_DATA', 
        payload: {
          habilidades: habilidades
        }
      });

      toast({ 
        title: "¡Habilidades guardadas!", 
        description: "Tu perfil está completo. ¡Bienvenido a la plataforma!" 
      });
      
      router.push('/dashboard/egresado');
    },
    onError: (e: any) => {
      toast({ 
        variant: "destructive", 
        title: "Error al guardar", 
        description: e.message 
      });
    },
  }) as any;

  const addHabilidad = (nombre: string, categoria: 'TECNICA' | 'BLANDA' | 'IDIOMA') => {
    if (habilidades.length >= 10) {
      toast({
        title: "Límite alcanzado",
        description: "Puedes agregar máximo 10 habilidades en este paso",
        variant: "destructive"
      });
      return;
    }

    if (habilidades.some(h => h.nombre.toLowerCase() === nombre.toLowerCase())) {
      toast({
        title: "Habilidad duplicada",
        description: "Esta habilidad ya está en tu lista",
        variant: "destructive"
      });
      return;
    }

    setHabilidades([...habilidades, { nombre, nivel: 3, categoria }]);
  };

  const addCustomHabilidad = () => {
    if (customHabilidad.trim()) {
      addHabilidad(customHabilidad.trim(), selectedCategoria);
      setCustomHabilidad('');
    }
  };

  const removeHabilidad = (index: number) => {
    setHabilidades(habilidades.filter((_, i) => i !== index));
  };

  const updateNivel = (index: number, nivel: number) => {
    const nuevasHabilidades = [...habilidades];
    nuevasHabilidades[index].nivel = nivel;
    setHabilidades(nuevasHabilidades);
  };

  const handleSubmit = () => {
    updateProfileMutation.mutate({
      habilidades: habilidades
    });
  };

  const handleSkip = () => {
    updateProfileMutation.mutate({
      habilidades: undefined
    });
  };

  const handleBack = () => {
    router.push('/auth/register/step/5');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-black text-lg mb-4">
            6
          </div>
          <h1 className="text-3xl font-black tracking-tight text-text-primary">
            Habilidades
          </h1>
          <p className="text-text-secondary font-medium">
            Selecciona tus habilidades principales (máximo 10)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categorías y habilidades predefinidas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs de categorías */}
            <div className="flex gap-2 p-1 bg-surface rounded-xl">
              {CATEGORIAS.map(categoria => (
                <button
                  key={categoria.key}
                  onClick={() => setSelectedCategoria(categoria.key as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                    selectedCategoria === categoria.key
                      ? "bg-background text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-primary"
                  )}
                >
                  <categoria.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{categoria.label}</span>
                </button>
              ))}
            </div>

            {/* Lista de habilidades predefinidas */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {HABILIDADES_PREDEFINIDAS[selectedCategoria].map(habilidad => {
                    const isSelected = habilidades.some(
                      h => h.nombre === habilidad && h.categoria === selectedCategoria
                    );
                    return (
                      <button
                        key={habilidad}
                        onClick={() => !isSelected && addHabilidad(habilidad, selectedCategoria)}
                        disabled={isSelected}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          "border-2 cursor-pointer hover:scale-105",
                          isSelected
                            ? "border-primary-500 bg-primary-50 text-primary-700 cursor-not-allowed"
                            : "border-border hover:border-primary-300 hover:bg-primary-50/50"
                        )}
                      >
                        {habilidad}
                        {isSelected && <span className="ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Agregar habilidad personalizada */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-text-primary mb-4">Agregar habilidad personalizada</h3>
                <div className="flex gap-2">
                  <Input
                    value={customHabilidad}
                    onChange={(e) => setCustomHabilidad(e.target.value)}
                    placeholder="Ej: Machine Learning"
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomHabilidad()}
                  />
                  <Button
                    onClick={addCustomHabilidad}
                    disabled={!customHabilidad.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Habilidades seleccionadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-primary">
                Seleccionadas ({habilidades.length}/10)
              </h3>
              {habilidades.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {habilidades.length} habilidades
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              {habilidades.map((habilidad, index) => (
                <Card key={index} className="border-none shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-text-primary">{habilidad.nombre}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs mt-1", 
                            CATEGORIAS.find(c => c.key === habilidad.categoria)?.color
                          )}
                        >
                          {CATEGORIAS.find(c => c.key === habilidad.categoria)?.label}
                        </Badge>
                      </div>
                      <button
                        onClick={() => removeHabilidad(index)}
                        className="text-text-muted hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-text-muted">Nivel</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(nivel => (
                          <button
                            key={nivel}
                            onClick={() => updateNivel(index, nivel)}
                            className={cn(
                              "flex-1 h-6 rounded transition-all",
                              nivel <= habilidad.nivel
                                ? "bg-primary-500 text-white"
                                : "bg-border text-text-muted hover:bg-border-hover"
                            )}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-text-muted">
                        <span>Básico</span>
                        <span>Experto</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {habilidades.length === 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3">
                    <Code className="h-6 w-6 text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">
                    No has seleccionado habilidades aún
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Elige de la lista o agrega habilidades personalizadas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl mt-6">
          <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Puedes actualizar tus habilidades más tarde desde tu perfil
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
            className="flex-1 h-12 rounded-xl font-medium text-text-muted hover:text-text-primary"
          >
            Saltar por ahora
          </Button>
          
          <Button
            onClick={handleSubmit}
            className="flex-1 h-12 rounded-xl font-black gap-2 shadow-lg hover:shadow-xl transition-all"
            disabled={updateProfileMutation.isPending}
            loading={updateProfileMutation.isPending}
          >
            Finalizar Registro
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
