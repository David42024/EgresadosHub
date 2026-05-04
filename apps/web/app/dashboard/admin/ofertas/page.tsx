'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Users,
  MoreVertical,
  CheckCircle,
  XCircle,
  PauseCircle,
  ExternalLink,
  PlusCircle,
  Download
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsCard } from '@/components/shared/StatsCard';

export default function AdminOfertasPage() {
  const [search, setSearch] = useState('');
  const [modalidad, setModalidad] = useState<string>('ALL');
  const [estado, setEstado] = useState<string>('ALL');

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search, 300);

  const queryInput = useMemo(() => ({
    search: debouncedSearch,
    modalidad: modalidad === 'ALL' ? undefined : modalidad,
    estado: estado === 'ALL' ? undefined : estado,
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
  }), [debouncedSearch, modalidad, estado, page]);

  const { data, isLoading } = (trpc as any).ofertas.list.useQuery(queryInput, {
    keepPreviousData: false,
  }) as any;

  const { data: statsData, isLoading: isLoadingStats } = (trpc as any).analytics.getOfertasStatsAdmin.useQuery() as any;

  const ofertas = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
      <PageHeader
        title="Control de Ofertas"
        description="Supervisa y gestiona todas las oportunidades laborales publicadas."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold h-10 px-4" onClick={async () => {
            try {
              const res = await (trpc as any).reportes.generar.mutateAsync({ tipo: 'LISTADO_OFERTAS', formato: 'PDF', asincrono: false });
              if (res.url) window.open(res.url, '_blank');
            } catch (e) {
              toast({ title: "Error", description: "No se pudo generar el reporte.", variant: "destructive" });
            }
          }}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white gap-2 shadow-lg shadow-primary-500/20 font-bold rounded-xl h-10 px-4">
            <PlusCircle className="h-4 w-4" /> Nueva
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <StatsCard
          title="Total Ofertas"
          value={isLoadingStats ? '...' : statsData?.total ?? 0}
          icon={Briefcase}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg py-3 px-4"
        />
        <StatsCard
          title="Activas"
          value={isLoadingStats ? '...' : statsData?.activas ?? 0}
          icon={CheckCircle}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-success py-3 px-4"
        />
        <StatsCard
          title="Pendientes"
          value={isLoadingStats ? '...' : statsData?.pendientes ?? 0}
          icon={PauseCircle}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-warning py-3 px-4"
        />
        <StatsCard
          title="Postulaciones"
          value={isLoadingStats ? '...' : statsData?.postulaciones ?? 0}
          icon={Users}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-info py-3 px-4"
        />
      </div>

      <div className="p-4 bg-surface/40 backdrop-blur-md rounded-[2rem] border-none shadow-xl bg-bg-base/30 flex flex-col md:flex-row gap-4 justify-between shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input
            placeholder="Buscar por cargo, empresa o descripción..."
            className="pl-10 h-10 bg-surface/60 border-none rounded-xl font-bold shadow-inner text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={modalidad} onValueChange={(val) => { setModalidad(val); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm text-xs">
              <MapPin className="h-4 w-4 mr-2 text-primary-600" />
              <SelectValue placeholder="Modalidad" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="ALL" className="font-bold text-xs">Todas</SelectItem>
              <SelectItem value="REMOTO" className="text-xs">Remoto</SelectItem>
              <SelectItem value="PRESENCIAL" className="text-xs">Presencial</SelectItem>
              <SelectItem value="HIBRIDO" className="text-xs">Híbrido</SelectItem>
            </SelectContent>
          </Select>

          <Select value={estado} onValueChange={(val) => { setEstado(val); setPage(1); }}>
            <SelectTrigger className="w-[150px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm text-xs">
              <Filter className="h-4 w-4 mr-2 text-primary-600" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="ALL" className="font-bold text-xs">Todos</SelectItem>
              <SelectItem value="ACTIVA" className="text-xs">Activa</SelectItem>
              <SelectItem value="CERRADA" className="text-xs">Cerrada</SelectItem>
              <SelectItem value="BORRADOR" className="text-xs">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card variant="elevated" className="border-none shadow-2xl bg-surface/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-bg-base/40">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[300px] px-8 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Oferta / Empresa</TableHead>
              <TableHead className="py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Detalles</TableHead>
              <TableHead className="py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Postulantes</TableHead>
              <TableHead className="py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Estado</TableHead>
              <TableHead className="text-right px-8 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="px-8 py-3"><Skeleton className="h-10 w-full rounded-xl" /></TableCell>
                  <TableCell className="py-3"><Skeleton className="h-10 w-full rounded-xl" /></TableCell>
                  <TableCell className="py-3"><Skeleton className="h-10 w-full rounded-xl" /></TableCell>
                  <TableCell className="py-3"><Skeleton className="h-7 w-20 rounded-lg" /></TableCell>
                  <TableCell className="px-8 py-3 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : ofertas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64">
                  <EmptyState title="No hay ofertas" description="Prueba ajustando los filtros." action={<Button variant="outline" size="sm" onClick={() => { setSearch(''); setModalidad('ALL'); setEstado('ALL'); }}>Limpiar</Button>} />
                </TableCell>
              </TableRow>
            ) : (
              ofertas.map((oferta: any) => (
                <TableRow key={oferta.id} className="group hover:bg-primary-600/5 border-border/30 transition-all duration-300">
                  <TableCell className="px-8 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-bg-base flex items-center justify-center border border-border/50">
                        {oferta.empresa?.logoUrl ? <img src={oferta.empresa.logoUrl} className="h-7 w-7 object-contain" alt="Logo" /> : <Building2 className="h-5 w-5 text-text-muted" />}
                      </div>
                      <div>
                        <p className="font-black text-text-primary text-sm tracking-tight">{oferta.titulo}</p>
                        <p className="text-[10px] text-primary-600 font-bold uppercase tracking-widest">{oferta.empresa?.razonSocial}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-text-primary uppercase tracking-tighter flex items-center gap-1"><MapPin className="h-3 w-3 text-text-muted" /> {oferta.modalidad}</span>
                      <span className="text-[10px] text-primary-600 font-black flex items-center gap-1 mt-0.5"><DollarSign className="h-3 w-3" /> S/ {oferta.salarioMin?.toLocaleString()} - {oferta.salarioMax?.toLocaleString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-bg-base flex items-center justify-center text-primary-600 shadow-inner"><Users className="h-4 w-4" /></div>
                      <span className="font-mono font-black text-base text-text-primary tracking-tighter">{oferta.totalPostulaciones ?? 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge className={cn("font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-md border-none shadow-sm", oferta.estado === 'ACTIVA' ? "bg-success/20 text-success" : oferta.estado === 'CERRADA' ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning")}>{oferta.estado}</Badge>
                  </TableCell>
                  <TableCell className="text-right px-8 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-2xl p-1">
                        <DropdownMenuItem className="gap-2 p-2 rounded-lg font-bold text-xs"><ExternalLink className="h-3.5 w-3.5 text-primary-600" /> Detalles</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/30 my-1" />
                        <DropdownMenuItem className="gap-2 p-2 rounded-lg font-bold text-xs text-destructive"><XCircle className="h-3.5 w-3.5" /> Cerrar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="p-4 bg-bg-base/30 border-t border-border/50 flex items-center justify-between shrink-0">
          <p className="text-xs text-text-muted font-bold"><span className="text-text-primary">{page}</span> de <span className="text-text-primary">{totalPages || 1}</span> <span className="ml-2 opacity-50 font-medium">({total} registros)</span></p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg h-8 text-[10px] font-black uppercase tracking-widest bg-surface/60 border-none px-4">Ant.</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg h-8 text-[10px] font-black uppercase tracking-widest bg-surface/60 border-none px-4">Sig.</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
