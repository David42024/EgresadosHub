'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Home,
  GraduationCap,
  Building2,
  Briefcase,
  FileText,
  LineChart,
  ClipboardList,
  Search,
  PlusCircle,
  Users,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { trpc } from '@/lib/trpc/client';

interface SidebarProps {
  user: { id?: string; email: string; role: string; avatarUrl?: string };
}

const NAV_LINKS: Record<string, { href: string; label: string; icon: LucideIcon }[]> = {
  ADMINISTRADOR: [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/admin/egresados', label: 'Egresados', icon: GraduationCap },
    { href: '/dashboard/admin/empresas', label: 'Empresas', icon: Building2 },
    { href: '/dashboard/admin/ofertas', label: 'Ofertas', icon: Briefcase },
    { href: '/dashboard/admin/postulaciones', label: 'Postulaciones', icon: ClipboardList },
    { href: '/dashboard/admin/analytics', label: 'Analytics', icon: LineChart },
    { href: '/dashboard/admin/reportes', label: 'Reportes PDF', icon: FileText },
  ],
  EGRESADO: [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/egresado', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/egresado/perfil', label: 'Mi perfil', icon: UserCircle },
    { href: '/dashboard/egresado/ofertas', label: 'Buscar ofertas', icon: Search },
    { href: '/dashboard/egresado/postulaciones', label: 'Mis postulaciones', icon: ClipboardList },
    { href: '/dashboard/egresado/estadisticas', label: 'Mis estadísticas', icon: LineChart },
  ],
  EMPRESA: [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/empresa', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/empresa/perfil', label: 'Mi Empresa', icon: Building2 },
    { href: '/dashboard/empresa/ofertas', label: 'Mis ofertas', icon: Briefcase },
    { href: '/dashboard/empresa/ofertas/nueva', label: 'Nueva oferta', icon: PlusCircle },
    { href: '/dashboard/empresa/postulantes', label: 'Postulantes', icon: Users },
    { href: '/dashboard/empresa/analytics', label: 'Analytics', icon: LineChart },
  ],
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = NAV_LINKS[user.role] ?? [];

  const { data: egresadoProfile } = (trpc as any).egresados.getMyProfile.useQuery(undefined, {
    enabled: user.role === 'EGRESADO',
    retry: false,
  }) as any;

  const { data: empresaProfile } = (trpc as any).empresas.getMyProfile.useQuery(undefined, {
    enabled: user.role === 'EMPRESA',
    retry: false,
  }) as any;

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

  return (
    <aside
      className={cn(
        "relative h-screen bg-surface border-r border-border transition-all duration-300 ease-in-out flex flex-col z-40",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border-border bg-surface shadow-md z-50 hover:bg-bg-elevated"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-border transition-all duration-300",
        collapsed ? "justify-center" : "px-6"
      )}>
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
            <span className="text-white font-extrabold text-lg">E</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-lg tracking-tight text-text-primary animate-in fade-in duration-500">
              Egresados<span className="text-primary-600">Hub</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href ||
            (link.href === '/dashboard/egresado' && pathname === '/dashboard/egresado') ||
            (link.href !== '/dashboard/admin' &&
             link.href !== '/dashboard/egresado' &&
             link.href !== '/dashboard/empresa' &&
             pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative',
                isActive
                  ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'text-text-secondary hover:bg-bg-elevated hover:text-text-primary',
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? link.label : ""}
            >
              <link.icon className={cn(
                "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-primary-600 dark:text-primary-400" : "text-text-muted group-hover:text-text-primary"
              )} />
              {!collapsed && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{link.label}</span>}
              {isActive && !collapsed && (
                <div className="absolute left-0 w-1 h-6 bg-primary-600 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Perfil Mini */}
      <div className={cn(
        "p-4 border-t border-border bg-bg-base/50 transition-all duration-300",
        collapsed ? "flex justify-center" : "px-4"
      )}>
        <div className={cn(
          "flex items-center gap-3 w-full",
          collapsed ? "justify-center" : "px-2"
        )}>
          <div className="relative h-9 w-9 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 text-xs font-bold border border-primary-200 dark:border-primary-800 shrink-0 shadow-sm">
            {displayAvatar !== '' ? (
              <img src={displayAvatar} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              avatarFallback
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 flex flex-col justify-center animate-in fade-in duration-500">
              <p className="text-sm font-bold text-text-primary truncate leading-tight">{displayName}</p>
              <span className={`w-fit mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${badgeColor}`}>
                {displayRole}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
