'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Clock3, 
  History,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { LucideIcon } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string, icon: LucideIcon, badgeClass: string, stepClass: string }> = {
  POSTULADO: {
    label: 'Postulado',
    icon: Clock,
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    stepClass: 'bg-blue-500 dark:bg-blue-400',
  },
  EN_REVISION: {
    label: 'En Revisión',
    icon: Clock3,
    badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    stepClass: 'bg-yellow-500 dark:bg-yellow-400',
  },
  ENTREVISTA: {
    label: 'Entrevista',
    icon: MessageSquare,
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    stepClass: 'bg-purple-500 dark:bg-purple-400',
  },
  CONTRATADO: {
    label: 'Contratado',
    icon: CheckCircle2,
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    stepClass: 'bg-green-500 dark:bg-green-400',
  },
  RECHAZADO: {
    label: 'Rechazado',
    icon: XCircle,
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    stepClass: 'bg-red-500 dark:bg-red-400',
  },
};

function formatDate(value: unknown) {
  const d = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}

export default function EgresadoPostulacionesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [ordenFecha, setOrdenFecha] = useState<'RECENT' | 'OLDEST'>('RECENT');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = (trpc as any).postulaciones.misPostulaciones.useQuery({
    limit: 50,
    estado: activeTab === 'ALL' ? undefined : activeTab,
    ordenFecha,
  }) as any;

  const postulaciones = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Mis Postulaciones" 
        description="Seguimiento en tiempo real de tus solicitudes de empleo."
      />

      <Tabs defaultValue="ALL" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <TabsList>
          <TabsTrigger value="ALL">Todas</TabsTrigger>
          <TabsTrigger value="POSTULADO">Activas</TabsTrigger>
          <TabsTrigger value="EN_REVISION">En Revisión</TabsTrigger>
          <TabsTrigger value="CONTRATADO">Contratado</TabsTrigger>
          <TabsTrigger value="RECHAZADO">Finalizadas</TabsTrigger>
          </TabsList>

          <div className="w-full md:w-56">
            <Select value={ordenFecha} onValueChange={(v) => setOrdenFecha(v as 'RECENT' | 'OLDEST')}>
              <SelectTrigger>
                <SelectValue placeholder="Orden" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECENT">Más reciente</SelectItem>
                <SelectItem value="OLDEST">Más antigua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-2xl" />
              ))}
            </div>
          ) : postulaciones.length === 0 ? (
            <EmptyState 
              title="No hay postulaciones" 
              description="Aún no has postulado a ninguna oferta. ¡Explora el mercado y da el primer paso!"
              action={<Button variant="primary">Explorar Ofertas</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {postulaciones.map((p: any) => {
                const config = STATUS_CONFIG[p.estado] || STATUS_CONFIG.POSTULADO;
                const companyName = p.oferta?.empresa?.nombreComercial ?? p.oferta?.empresa?.razonSocial;
                const logoUrl = p.oferta?.empresa?.logoUrl;
                const history = Array.isArray(p.historial_estados_postulacion) ? p.historial_estados_postulacion : [];
                const lastChange = history[0]?.createdAt;
                const steps = Object.keys(STATUS_CONFIG);
                const stepIndex = Math.max(0, steps.indexOf(p.estado));

                return (
                  <Card key={p.id} variant="elevated" className="group overflow-hidden hover:border-primary-500/30 transition-all">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Columna Info */}
                        <div className="flex-1 p-6 flex gap-4">
                          <Avatar className="h-14 w-14 rounded-xl shadow-sm bg-bg-elevated border border-border">
                            <AvatarImage src={logoUrl} />
                            <AvatarFallback className="rounded-xl text-lg font-bold">{companyName?.[0] ?? 'E'}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 space-y-1">
                            <h3 className="text-lg font-bold text-text-primary group-hover:text-primary-600 transition-colors">
                              {p.oferta?.titulo}
                            </h3>
                            <Link href={`/empresas/${p.oferta?.empresa?.id}`} className="text-sm font-medium text-text-secondary flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                              <Building2 className="h-3.5 w-3.5" />
                              {companyName}
                            </Link>
                            <div className="text-xs text-text-muted font-medium">
                              {p.oferta?.modalidad ? <span>{p.oferta.modalidad}</span> : null}
                              {p.oferta?.salarioMin != null || p.oferta?.salarioMax != null ? (
                                <span>{p.oferta?.modalidad ? ' • ' : ''}{p.oferta?.salarioMin ?? ''}{p.oferta?.salarioMin != null || p.oferta?.salarioMax != null ? ' - ' : ''}{p.oferta?.salarioMax ?? ''}</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-3 mt-3 text-xs text-text-muted font-medium">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Postulado el {formatDate(p.postuladoAt)}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <History className="h-3 w-3" />
                                {lastChange ? `Último cambio: ${formatDate(lastChange)}` : 'Sin cambios'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Columna Estado & Acciones */}
                        <div className="w-full md:w-64 bg-bg-base/30 border-t md:border-t-0 md:border-l border-border p-6 flex flex-col justify-center items-center md:items-end gap-4">
                          <div className="flex flex-col items-center md:items-end gap-1">
                            <Badge className={cn('px-3 py-1 text-xs font-bold uppercase tracking-wider gap-2', config.badgeClass)}>
                              <config.icon className="h-3 w-3" />
                              {config.label}
                            </Badge>
                            {p.estado === 'EN_REVISION' && (
                              <p className="text-[10px] text-warning font-bold mt-1">La empresa está revisando tu perfil</p>
                            )}
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 md:flex-none h-8 text-xs font-bold"
                              disabled={p.oferta?.id == null}
                              onClick={() => {
                                const ofertaId = p.oferta?.id;
                                if (ofertaId == null) return;
                                router.push(`/ofertas/${ofertaId}`);
                              }}
                            >
                              Ver Oferta
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="flex-1 md:flex-none h-8 text-xs font-bold"
                              disabled={p.id == null}
                              onClick={() => {
                                const postulacionId = p.id;
                                if (postulacionId == null) return;
                                router.push(`/dashboard/egresado/postulaciones/${postulacionId}`);
                              }}
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Sutil (Expandible en el futuro) */}
                      <div className="px-6 py-3 bg-bg-base/50 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                              <div key={i} className={cn(
                                "h-1.5 w-8 rounded-full border border-surface shadow-sm",
                                i <= stepIndex + 1 ? config.stepClass : "bg-border"
                              )} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                            Paso {stepIndex + 1} de 5
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId((prev) => (prev === p.id ? null : p.id))}
                          className="h-6 text-[10px] font-bold text-primary-600 gap-1 uppercase tracking-wider"
                        >
                          Ver Historial <ChevronRight className={cn('h-3 w-3 transition-transform', expandedId === p.id ? 'rotate-90' : '')} />
                        </Button>
                      </div>

                      {expandedId === p.id ? (
                        <div className="px-6 py-4 border-t border-border/50 bg-bg-base/30">
                          {history.length === 0 ? (
                            <p className="text-sm text-text-muted">No hay historial de cambios.</p>
                          ) : (
                            <div className="space-y-3">
                              {history.map((h: any, idx: number) => (
                                <div key={`${p.id}-${idx}`} className="flex items-start gap-3">
                                  <div className="mt-1 h-2 w-2 rounded-full bg-border" />
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-text-primary">
                                      {h.estadoNuevo}
                                    </div>
                                    <div className="text-xs text-text-muted">
                                      {formatDate(h.createdAt)}
                                    </div>
                                    {h.comentario ? (
                                      <div className="text-xs text-text-secondary mt-1">{h.comentario}</div>
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
