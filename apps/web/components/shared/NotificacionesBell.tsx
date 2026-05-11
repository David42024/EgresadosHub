'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  CheckCircle2,
  Briefcase,
  User,
  FileText,
  Info,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Tipos de notificación
const TIPO_ICONO: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  CAMBIO_ESTADO: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  NUEVA_OFERTA: { icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  NUEVO_POSTULANTE: { icon: User, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  REPORTE_LISTO: { icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  SISTEMA: { icon: Info, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
};

interface NotificacionesBellProps {
  userId: string;
}

export function NotificacionesBell({ userId }: NotificacionesBellProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Query de contador de no leídas (cada 30 segundos)
  const { data: noLeidasCount = 0 } = (trpc as any).notificaciones.countNoLeidas.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  // Query de lista de notificaciones
  const { 
    data: notificacionesData, 
    isLoading,
    refetch: refetchNotificaciones 
  } = (trpc as any).notificaciones.list.useQuery({ limit: 20, skip: 0 });

  // Mutación para marcar como leída
  const marcarLeidaMutation = (trpc as any).notificaciones.marcarLeida.useMutation({
    onSuccess: () => {
      refetchNotificaciones();
    },
  });

  // Mutación para marcar todas como leídas
  const marcarTodasLeidasMutation = (trpc as any).notificaciones.marcarTodasLeidas.useMutation({
    onSuccess: () => {
      refetchNotificaciones();
    },
  });

  // Al abrir el popover, marcar todas como leídas
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && noLeidasCount > 0) {
      // Pequeño delay para no bloquear la UI
      setTimeout(() => {
        marcarTodasLeidasMutation.mutate();
      }, 500);
    }
  };

  // Formatear tiempo relativo - soporta ISO strings, timestamps y Date objects
  const formatTimeAgo = (date: string | Date | number | null | undefined) => {
    if (!date) return 'Fecha desconocida';
    
    const now = new Date();
    let past: Date;
    
    try {
      // Intentar parsear como timestamp numérico primero
      if (typeof date === 'number') {
        past = new Date(date);
      } else if (typeof date === 'string') {
        // Limpiar la string y parsear
        const cleanDate = date.trim();
        past = new Date(cleanDate);
        
        // Si es inválido, intentar como timestamp
        if (isNaN(past.getTime()) && /^\d+$/.test(cleanDate)) {
          past = new Date(parseInt(cleanDate, 10));
        }
      } else {
        past = date;
      }
      
      if (isNaN(past.getTime())) return 'Fecha inválida';
    } catch (e) {
      console.error('Error parseando fecha:', date, e);
      return 'Fecha inválida';
    }
    
    const diffMs = now.getTime() - past.getTime();
    
    // Si la fecha es futura, mostrar fecha completa
    if (diffMs < 0) {
      return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return past.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Manejar click en una notificación
  const handleNotificacionClick = async (notificacion: any) => {
    if (!notificacion.leida) {
      await marcarLeidaMutation.mutateAsync({ id: notificacion.id });
    }
    
    // Navegar si hay metadata con link
    if (notificacion.metadata?.link) {
      router.push(notificacion.metadata.link);
      setOpen(false);
    }
  };

  const notificaciones = notificacionesData?.data || [];

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 rounded-lg text-text-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
        >
          <Bell className="h-5 w-5" />
          {noLeidasCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-error border-2 border-surface animate-pulse"/>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 md:w-96 p-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-t-lg">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          {noLeidasCount > 0 && (
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">
              {noLeidasCount} nuevas
            </span>
          )}
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            // Skeleton loading
            <div className="p-3 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notificaciones.length === 0 ? (
            // Estado vacío
            <div className="flex flex-col items-center justify-center h-40 text-center px-4">
              <Bell className="h-8 w-8 text-text-muted/50 mb-2" />
              <p className="text-sm text-text-muted">Sin notificaciones nuevas</p>
              <p className="text-xs text-text-muted/70 mt-1">
                Te notificaremos cuando haya actualizaciones importantes
              </p>
            </div>
          ) : (
            // Lista de notificaciones
            <div className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {notificaciones.map((notif: any) => {
                const tipoConfig = TIPO_ICONO[notif.tipo] || TIPO_ICONO.SISTEMA;
                const IconComponent = tipoConfig.icon;
                
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificacionClick(notif)}
                    className={cn(
                      "w-full text-left p-3 flex gap-3 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900",
                      !notif.leida && "bg-blue-50/50 dark:bg-blue-900/20"
                    )}
                  >
                    {/* Icono */}
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                      tipoConfig.bg
                    )}>
                      <IconComponent className={cn("h-4 w-4", tipoConfig.color)} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm leading-tight",
                        !notif.leida && "font-medium"
                      )}>
                        {notif.mensaje}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-text-muted/70" />
                        <span className="text-xs text-text-muted">
                          {formatTimeAgo(notif.creadaAt)}
                        </span>
                        {!notif.leida && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Footer - Marcar todas como leídas */}
        {notificaciones.length > 0 && (
          <div className="p-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 rounded-b-lg">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-text-muted hover:text-primary"
              onClick={() => marcarTodasLeidasMutation.mutate()}
              disabled={marcarTodasLeidasMutation.isPending || noLeidasCount === 0}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas como leídas
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
