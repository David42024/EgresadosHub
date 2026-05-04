'use client';

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Search,
  Filter,
  Download,
  FileJson,
  MoreVertical,
  Eye,
  Trash2,
  Users,
  GraduationCap,
  Calendar,
  Mail
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsCard } from '@/components/shared/StatsCard';
import { Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

import { useToast } from '@/components/ui/use-toast';

import type { RouterOutputs } from '@/lib/trpc/router.types';

type Egresado = RouterOutputs['egresados']['list']['data'][number];

export default function AdminEgresadosPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [carrera, setCarrera] = useState<string>('ALL');
  const [anioEgreso, setAnioEgreso] = useState<string>('ALL');
  const [selectedEgresado, setSelectedEgresado] = useState<Egresado | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = (trpc as any).egresados.list.useQuery({
    limit: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    search: debouncedSearch,
    carrera: carrera === 'ALL' ? undefined : carrera,
    anioEgreso: anioEgreso === 'ALL' ? undefined : parseInt(anioEgreso),
  }) as any;

  const { data: statsData, isLoading: isLoadingStats } = (trpc as any).analytics.getEgresadosStatsAdmin.useQuery() as any;

  const egresados = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleExportCSV = () => {
    if (egresados.length === 0) return;
    const headers = ['Nombre', 'Apellido', 'Email', 'Carrera', 'Año Egreso', 'Habilidades'];
    const csvRows = egresados.map((e: any) => [
      e.nombres,
      e.apellidos,
      e.user.email,
      e.carrera,
      e.anioEgreso,
      (e.habilidades || []).map((h: any) => h.nombre).join('; ')
    ].map(val => `"${val}"`).join(','));
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `egresados_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exportación exitosa", description: "El archivo CSV ha sido generado." });
  };

  const handleExportPDF = async () => {
    try {
      await (trpc as any).reportes.generar.mutate({
        tipo: 'LISTADO_EGRESADOS',
        formato: 'PDF',
        filtros: {
          search: debouncedSearch,
          carrera: carrera === 'ALL' ? undefined : carrera,
          anioEgreso: anioEgreso === 'ALL' ? undefined : parseInt(anioEgreso),
        }
      });
      toast({ title: "Generando PDF", description: "Iniciando descarga..." });
    } catch (error) {
      toast({ title: "Error", description: "No se pudo generar el PDF.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
      <PageHeader
        title="Gestión de Egresados"
        description="Administra y supervisa a todos los graduados de la institución."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold h-10 px-4" onClick={handleExportPDF}>
            <Download className="h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold h-10 px-4" onClick={handleExportCSV}>
            <FileJson className="h-4 w-4" /> CSV
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <StatsCard
          title="Total Egresados"
          value={isLoadingStats ? '...' : statsData?.total ?? 0}
          icon={Users}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg py-3 px-4"
        />
        <StatsCard
          title="Carreras"
          value={isLoadingStats ? '...' : statsData?.carreras ?? 0}
          icon={GraduationCap}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg py-3 px-4"
        />
        <StatsCard
          title="Nuevos este mes"
          value={isLoadingStats ? '...' : statsData?.nuevosMes ?? 0}
          icon={Calendar}
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg py-3 px-4"
        />
      </div>

      <Card variant="elevated" className="border-none shadow-2xl bg-surface/40 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row gap-4 justify-between bg-bg-base/30 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Buscar por nombre, email o habilidades..."
              className="pl-10 h-10 bg-surface/60 border-none rounded-xl font-bold shadow-inner text-sm"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={carrera} onValueChange={(val) => { setCarrera(val); setPage(1); }}>
              <SelectTrigger className="w-[180px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm text-xs">
                <Filter className="h-4 w-4 mr-2 text-primary-600" />
                <SelectValue placeholder="Carrera" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="ALL" className="font-bold text-xs">Todas las carreras</SelectItem>
                {['Comunicación', 'Ingeniería Industrial', 'Diseño Gráfico', 'Administración', 'Ingeniería de Sistemas'].map(c => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={anioEgreso} onValueChange={(val) => { setAnioEgreso(val); setPage(1); }}>
              <SelectTrigger className="w-[120px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm text-xs">
                <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                <SelectItem value="ALL" className="font-bold text-xs">Todos</SelectItem>
                {['2026', '2025', '2024', '2023', '2022', '2021', '2020'].map(y => (
                  <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-bg-base/40">
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[300px] px-8 py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Egresado</TableHead>
              <TableHead className="py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Carrera & Año</TableHead>
              <TableHead className="py-3 text-[9px] font-black text-text-muted uppercase tracking-widest">Habilidades</TableHead>
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
                  <TableCell className="px-8 py-3 text-right"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></TableCell>
                </TableRow>
              ))
            ) : egresados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-64">
                  <EmptyState title="No hay registros" description="Prueba con otros filtros." action={<Button variant="outline" size="sm" onClick={() => { setSearch(''); setCarrera('ALL'); setAnioEgreso('ALL'); }}>Limpiar</Button>} />
                </TableCell>
              </TableRow>
            ) : (
              egresados.map((egresado: any) => (
                <TableRow key={egresado.id} className="group hover:bg-primary-600/5 border-border/30 transition-all duration-300">
                  <TableCell className="px-8 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-xl shadow-sm border-2 border-surface">
                        <AvatarImage src={egresado.fotoUrl} className="object-cover" />
                        <AvatarFallback className="text-xs font-bold bg-primary-50 text-primary-600">{egresado.nombres[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-black text-text-primary text-sm tracking-tight">{egresado.nombres} {egresado.apellidos}</p>
                        <p className="text-[10px] text-text-muted font-bold">{egresado.user?.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-col gap-0.5">
                      <Badge variant="secondary" className="w-fit bg-primary-50 text-primary-700 border-none rounded-md font-bold text-[9px] py-0 px-2 uppercase">{egresado.carrera}</Badge>
                      <span className="text-[10px] text-text-muted font-bold flex items-center gap-1 opacity-70">
                        <Calendar className="h-3 w-3" /> {egresado.anioEgreso}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(egresado.habilidades || []).slice(0, 2).map((h: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-[9px] font-bold border-border/50 bg-surface/50 px-1.5 py-0">{h.nombre}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-primary-50" onClick={() => { setSelectedEgresado(egresado); setIsSheetOpen(true); }}>
                        <Eye className="h-4 w-4 text-primary-600" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-2xl p-1">
                          <DropdownMenuItem className="rounded-lg font-bold gap-2 py-2 text-xs"><Mail className="h-3.5 w-3.5 text-primary-600" /> Contactar</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg font-bold gap-2 py-2 text-xs text-destructive"><Trash2 className="h-3.5 w-3.5" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-4 bg-bg-base/30 border-t border-border/50 flex items-center justify-between shrink-0">
          <p className="text-xs text-text-muted font-bold">
            <span className="text-text-primary">{page}</span> de <span className="text-text-primary">{totalPages || 1}</span>
            <span className="ml-2 opacity-50">({total} registros)</span>
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg h-8 text-[10px] font-black uppercase tracking-widest bg-surface/60 border-none px-4">Ant.</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg h-8 text-[10px] font-black uppercase tracking-widest bg-surface/60 border-none px-4">Sig.</Button>
          </div>
        </div>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedEgresado && (
            <div className="space-y-6 py-4">
              <SheetHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary-500/20">
                    <AvatarImage src={selectedEgresado.fotoUrl ?? ''} />
                    <AvatarFallback className="text-xl">{selectedEgresado.nombres[0]}{selectedEgresado.apellidos[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <SheetTitle className="text-2xl font-bold">{selectedEgresado.nombres} {selectedEgresado.apellidos}</SheetTitle>
                    <SheetDescription className="text-sm font-medium text-primary-600">{selectedEgresado.carrera} • Clase {selectedEgresado.anioEgreso}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-[10px] font-black uppercase text-text-muted flex items-center gap-2"><Mail className="h-3 w-3" /> Email</span><p className="text-sm font-bold">{selectedEgresado.user.email}</p></div>
                <div><span className="text-[10px] font-black uppercase text-text-muted flex items-center gap-2"><Phone className="h-3 w-3" /> Teléfono</span><p className="text-sm font-bold">{selectedEgresado.telefono || '---'}</p></div>
              </div>
              <div className="pt-4 flex gap-3"><Button className="flex-1 bg-primary-600 rounded-xl font-bold">Editar Perfil</Button><Button variant="outline" className="flex-1 rounded-xl font-bold">Descargar CV</Button></div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
