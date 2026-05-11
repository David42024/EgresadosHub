'use client';

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { LogOut, User, Search, Settings } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NotificacionesBell } from './NotificacionesBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  user: { id?: string; email: string; role: string; avatarUrl?: string };
}

export function Topbar({ user }: TopbarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Notificaciones ya se manejan en NotificacionesBell component

  const { data: egresadoProfile } = (trpc as any).egresados.getMyProfile.useQuery(undefined, {
    enabled: user.role === 'EGRESADO',
    retry: false,
  }) as any;

  const { data: empresaProfile } = (trpc as any).empresas.getMyProfile.useQuery(undefined, {
    enabled: user.role === 'EMPRESA',
    retry: false,
  }) as any;


  const logoutMutation = (trpc as any).auth.logout.useMutation({
    onSuccess: () => {
      // FIX 4: Limpiar TODO el caché de React Query al hacer logout
      queryClient.clear();
      queryClient.removeQueries();
      
      // Limpiar localStorage
      localStorage.removeItem('access_token');
      
      // FIX 4: Usar router.replace en lugar de push + refresh para limpiar caché de Next.js
      router.replace('/auth/login');
      router.refresh();
    },
  }) as any;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    const roleRoutes: Record<string, string> = {
      ADMINISTRADOR: '/dashboard/admin',
      EGRESADO:      '/dashboard/egresado/perfil',
      EMPRESA:       '/dashboard/empresa/perfil',
    };
    router.push(roleRoutes[user.role] ?? '/dashboard');
  };

  // ─── Lógica de Visualización (Nombre, Avatar, Badge) ───
  let displayName = user.email.split('@')[0];
  let displayAvatar = user.avatarUrl ?? '';
  let avatarFallback = user.email[0].toUpperCase();
  let badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  let displayRole = 'Administrador';

  if (user.role === 'EGRESADO') {
    displayRole = 'Egresado';
    badgeColor = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    if (egresadoProfile) {
      displayName = `${egresadoProfile.nombres} ${egresadoProfile.apellidos}`;
      displayAvatar = egresadoProfile.fotoUrl ?? user.avatarUrl ?? '';
      avatarFallback = egresadoProfile.nombres[0].toUpperCase();
    }
  } else if (user.role === 'EMPRESA') {
    displayRole = 'Empresa';
    badgeColor = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    if (empresaProfile) {
      displayName = empresaProfile.razonSocial;
      displayAvatar = empresaProfile.logoUrl ?? '';
      avatarFallback = empresaProfile.razonSocial[0].toUpperCase();
    }
  }

  const hasFoto = displayAvatar !== '';

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        {user.role !== 'EMPRESA' && (
          <div className="relative max-w-md w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10 bg-bg-base border-none focus-visible:ring-1 focus-visible:ring-primary-500 h-9"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* Notificaciones - Componente funcional */}
        <NotificacionesBell userId={user.id || ''} />

        <div className="w-px h-6 bg-border mx-2" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-1 h-auto hover:bg-bg-elevated rounded-full gap-3 pl-3 pr-1 py-1 transition-all duration-200">
              <div className="text-right hidden sm:flex flex-col items-end">
                <p className="text-sm font-bold text-text-primary leading-tight">{displayName}</p>
                <span className={`mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {displayRole}
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-surface shadow-sm">
                {hasFoto ? (
                  <AvatarImage src={displayAvatar} alt={displayName} className="object-cover" />
                ) : (
                  <AvatarFallback className="text-[12px] font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                    {avatarFallback}
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-bold text-text-primary leading-tight">{displayName}</p>
                <p className="text-xs text-text-muted leading-tight">{user.email}</p>
                <span className={`w-fit mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {displayRole}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 py-2.5" onClick={handleProfileClick}>
              <User className="h-4 w-4 text-text-muted" />
              <span className="font-medium">Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer gap-2 py-2.5 text-error focus:text-error focus:bg-error/10 transition-colors"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
              <span className="font-bold">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
