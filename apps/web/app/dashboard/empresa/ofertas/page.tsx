'use client';

import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Users, 
  Clock, 
  Target, 
  Briefcase, 
  Edit, 
  PauseCircle, 
  PlayCircle, 
  TrendingUp,
  XCircle,
  Eye,
  Calendar
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function EmpresaOfertasPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const router = useRouter();

  // Obtenemos todas las ofertas (la API por defecto filtra, así que pasamos un filtro vacío o específico)
  const { data, isLoading, refetch } = (trpc as any).ofertas.misOfertas.useQuery({
    search: debouncedSearch,
  }) as any;

  const publicarMutation = (trpc as any).ofertas.publicar.useMutation({
    onSuccess: async () => {
      toast({ title: "Oferta activada", description: "Tu oferta ahora es visible para los egresados." });
      await refetch();
    }
  }) as any;

  const pausarMutation = (trpc as any).ofertas.pausar.useMutation({
    onSuccess: async () => {
      toast({ title: "Oferta pausada", description: "La oferta se ha guardado como borrador." });
      await refetch();
    }
  }) as any;

  const cerrarMutation = (trpc as any).ofertas.cerrar.useMutation({
    onSuccess: async () => {
      toast({ title: "Oferta cerrada", description: "La oferta ha sido retirada del mercado." });
      await refetch();
    }
  }) as any;

  const ofertas = data?.data ?? [];

  const stats = useMemo(() => {
    const totalPostulantes = ofertas.reduce((acc: number, o: any) => acc + (o.totalPostulaciones || 0), 0);
    const activas = ofertas.filter((o: any) => o.estado === 'ACTIVA').length;
    const borradores = ofertas.filter((o: any) => o.estado === 'BORRADOR').length;
    return { totalPostulantes, activas, borradores };
  }, [ofertas]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <PageHeader 
        title="Mis Ofertas Laborales" 
        description="Gestiona tus publicaciones y supervisa el rendimiento de tus ofertas."
      >
        <Link href="/dashboard/empresa/ofertas/nueva">
          <Button variant="primary" className="gap-2 shadow-lg shadow-primary-500/20 font-bold">
            <Plus className="h-4 w-4" />
            Nueva Oferta
          </Button>
        </Link>
      </PageHeader>

      {/* Dashboard Mini con Datos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated" className="bg-primary-600 text-white border-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Briefcase className="h-24 w-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-100">Ofertas Activas</p>
            <h3 className="text-4xl font-black mt-1 font-mono">{stats.activas}</h3>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold bg-white/10 w-fit px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" /> Tiempo real
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated" className="overflow-hidden group border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Interesados</p>
                <h3 className="text-4xl font-black mt-1 font-mono text-text-primary">{stats.totalPostulantes}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-bg-base flex items-center justify-center text-text-muted group-hover:bg-primary-50 group-hover:text-primary-600 transition-all shadow-inner">
                <Users className="h-6 w-6" />
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-4 font-bold uppercase tracking-widest">
              Sincronizado <span className="text-primary-600">vía API</span>
            </p>
          </CardContent>
        </Card>

        <Card variant="elevated" className="overflow-hidden group border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Borradores / Pausadas</p>
                <h3 className="text-4xl font-black mt-1 font-mono text-text-primary">{stats.borradores}</h3>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-bg-base flex items-center justify-center text-text-muted group-hover:bg-amber-50 group-hover:text-amber-500 transition-all shadow-inner">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <p className="text-[10px] text-text-muted mt-4 font-bold uppercase tracking-widest">
              Total <span className="text-text-primary">Inactivas</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated" className="border-none shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-surface/50 backdrop-blur-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input 
                placeholder="Buscar por cargo..." 
                className="pl-10 h-11 bg-bg-base border-none shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-bg-base/30">
                <TableRow className="border-none">
                  <TableHead className="font-bold text-text-muted py-4">OFERTA</TableHead>
                  <TableHead className="font-bold text-text-muted py-4">POSTULANTES</TableHead>
                  <TableHead className="font-bold text-text-muted py-4">ESTADO</TableHead>
                  <TableHead className="font-bold text-text-muted py-4">FECHA</TableHead>
                  <TableHead className="text-right py-4 pr-6">ACCIONES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-12 w-full" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : ofertas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[300px]">
                      <EmptyState 
                        title="Aún no has publicado ofertas" 
                        description="Comienza a buscar talento publicando tu primera oferta laboral."
                        action={<Link href="/dashboard/empresa/ofertas/nueva"><Button variant="primary">Publicar mi primera oferta</Button></Link>}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  ofertas.map((oferta: any) => (
                    <TableRow 
                      key={oferta.id} 
                      className="group cursor-pointer hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors border-border/50"
                      onClick={() => router.push(`/dashboard/empresa/ofertas/${oferta.id}`)}
                    >
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary group-hover:text-primary-600 transition-colors text-base">
                            {oferta.titulo}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-text-muted mt-0.5 flex items-center gap-2">
                            <Badge variant="outline" className="px-1.5 py-0 border-primary-200 text-primary-600 font-black">{oferta.modalidad}</Badge>
                            {oferta.ubicacion}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="h-8 w-8 rounded-lg bg-bg-base flex items-center justify-center text-primary-600 font-black text-xs shadow-inner">
                            {(oferta as any).totalPostulaciones || 0}
                          </div>
                          <span className="text-xs font-bold text-text-secondary">interesados</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={oferta.estado === 'ACTIVA' ? 'success' : oferta.estado === 'CERRADA' ? 'secondary' : 'warning'}
                          className="px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm"
                        >
                          {oferta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-bold">
                          <Calendar className="h-3.5 w-3.5 opacity-50" />
                          {new Date(oferta.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-bg-base shadow-sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-xl border-border/50 bg-surface">
                            <DropdownMenuItem className="gap-3 py-2.5 rounded-xl cursor-pointer" asChild>
                              <Link href={`/dashboard/empresa/ofertas/${oferta.id}`}>
                                <Eye className="h-4 w-4 text-blue-500" /> 
                                <span className="font-bold">Ver Detalles</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-3 py-2.5 rounded-xl cursor-pointer" asChild>
                              <Link href={`/dashboard/empresa/postulantes?ofertaId=${oferta.id}`}>
                                <Users className="h-4 w-4 text-purple-500" /> 
                                <span className="font-bold">Ver Postulantes</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="my-1 opacity-50" />
                            
                            {oferta.estado === 'BORRADOR' && (
                              <DropdownMenuItem 
                                className="gap-3 py-2.5 rounded-xl cursor-pointer text-success"
                                onClick={() => publicarMutation.mutate({ id: oferta.id })}
                                disabled={publicarMutation.isPending}
                              >
                                <PlayCircle className="h-4 w-4" /> 
                                <span className="font-bold">Activar Oferta</span>
                              </DropdownMenuItem>
                            )}
                            
                            {oferta.estado === 'ACTIVA' && (
                              <DropdownMenuItem 
                                className="gap-3 py-2.5 rounded-xl cursor-pointer text-warning"
                                onClick={() => pausarMutation.mutate({ id: oferta.id })}
                                disabled={pausarMutation.isPending}
                              >
                                <PauseCircle className="h-4 w-4" /> 
                                <span className="font-bold">Pausar (Borrador)</span>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem className="gap-3 py-2.5 rounded-xl cursor-pointer" asChild>
                              <Link href={`/dashboard/empresa/ofertas/editar/${oferta.id}`}>
                                <Edit className="h-4 w-4 text-amber-500" /> 
                                <span className="font-bold">Editar Oferta</span>
                              </Link>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              className="gap-3 py-2.5 rounded-xl cursor-pointer text-error"
                              onClick={() => {
                                if(confirm("¿Estás seguro de cerrar esta oferta definitivamente?")) {
                                  cerrarMutation.mutate({ id: oferta.id });
                                }
                              }}
                              disabled={cerrarMutation.isPending}
                            >
                              <XCircle className="h-4 w-4" /> 
                              <span className="font-bold">Cerrar Oferta</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
