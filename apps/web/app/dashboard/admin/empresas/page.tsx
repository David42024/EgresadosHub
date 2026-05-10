'use client';

import { useState, useMemo } from 'react';
import { trpc } from '@/lib/trpc/client';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDebounce } from '@/hooks/use-debounce';
import { 
  Search, 
  Building2, 
  ExternalLink, 
  Filter,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  Download
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatsCard } from '@/components/shared/StatsCard';
import { toast } from '@/components/ui/use-toast';

export default function AdminEmpresasPage() {
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState<string>('ALL');
  const [verificada, setVerificada] = useState<string>('ALL');
  
  const debouncedSearch = useDebounce(search, 300);

  const queryInput = useMemo(() => ({
    limit:  PAGE_SIZE,
    skip:   (page - 1) * PAGE_SIZE,
    search: debouncedSearch,
    sector: sector === 'ALL' ? undefined : sector,
    verificada: verificada === 'ALL' ? undefined : verificada === 'VERIFIED',
  }), [page, debouncedSearch, sector, verificada]);

  const { data, isLoading, refetch } = (trpc as any).empresas.list.useQuery(queryInput, {
    keepPreviousData: false,
  }) as any;
  
  const verificarMutation = (trpc as any).empresas.verificar.useMutation({
    onSuccess: async () => {
      toast({
        title: "Empresa verificada",
        description: "El estado de verificación ha sido actualizado correctamente.",
      });
      await refetch();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  }) as any;

  const { data: statsData, isLoading: isLoadingStats } = (trpc as any).analytics.getEmpresasStatsAdmin.useQuery() as any;

  const empresas = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-700">
      <PageHeader 
        title="Directorio de Empresas" 
        description="Gestiona las empresas que publican ofertas en la plataforma."
      >
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2 rounded-xl font-bold h-10 px-4" onClick={async () => {
             try {
               toast({ title: "Generando PDF", description: "Espera unos segundos mientras se genera el reporte..." });
               const res = await (trpc as any).reportes.generar.mutateAsync({ tipo: 'LISTADO_EMPRESAS', formato: 'PDF' });
               if (res.base64) {
                 const { descargarBase64ComoPdf } = require('@/lib/utils');
                 descargarBase64ComoPdf(res.base64, res.filename || 'empresas.pdf');
                 toast({ title: "Reporte listo", description: "El PDF se ha descargado." });
               }
             } catch (e) {
               toast({ title: "Error", description: "No se pudo generar el reporte.", variant: "destructive" });
             }
          }}>
            <Download className="h-4 w-4" />
            Reporte PDF
          </Button>
          <Button 
            variant="primary" 
            size="sm"
            className="gap-2 shadow-lg shadow-primary-500/20 font-bold rounded-xl h-10 px-4"
            onClick={() => setVerificada('PENDING')}
          >
            <ShieldAlert className="h-4 w-4" />
            Pendientes
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <StatsCard 
          title="Total Empresas" 
          value={isLoadingStats ? '...' : statsData?.total ?? 0} 
          icon={Building2} 
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg py-3 px-4"
        />
        <StatsCard 
          title="Verificadas" 
          value={isLoadingStats ? '...' : statsData?.verificadas ?? 0} 
          icon={ShieldCheck} 
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-success py-3 px-4"
        />
        <StatsCard 
          title="Ofertas Activas" 
          value={isLoadingStats ? '...' : statsData?.activas ?? 0} 
          icon={Briefcase} 
          className="bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-lg text-info py-3 px-4"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-surface/40 backdrop-blur-md rounded-[2rem] border-none shadow-xl bg-bg-base/30 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <Input 
            placeholder="Buscar por nombre, RUC..." 
            className="pl-10 h-10 bg-surface/60 border-none rounded-xl font-bold shadow-inner"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={sector} onValueChange={(val) => { setSector(val); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[160px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm">
              <Filter className="h-4 w-4 mr-2 text-primary-600" />
              <SelectValue placeholder="Sector" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="ALL" className="font-bold text-xs">Todos los sectores</SelectItem>
              {['Construcción', 'Tecnología', 'Logística', 'Retail', 'Medios', 'Energías Renovables', 'Educación', 'Consultoría', 'Agricultura', 'Minería', 'Turismo', 'Finanzas', 'Salud', 'Alimentos'].map(s => (
                <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={verificada} onValueChange={(val) => { setVerificada(val); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[150px] h-10 rounded-xl bg-surface/60 border-none font-bold shadow-sm">
              <ShieldCheck className="h-4 w-4 mr-2 text-primary-600" />
              <SelectValue placeholder="Verificación" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="ALL" className="font-bold text-xs">Todos</SelectItem>
              <SelectItem value="VERIFIED" className="text-xs">Verificadas</SelectItem>
              <SelectItem value="PENDING" className="text-xs">Pendientes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse rounded-[1.5rem]">
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : empresas.length === 0 ? (
        <EmptyState 
          title="No hay empresas" 
          description="No se encontraron registros con los criterios actuales."
          action={<Button variant="outline" size="sm" onClick={() => { setSearch(''); setSector('ALL'); setVerificada('ALL'); }}>Limpiar filtros</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
          {empresas.map((empresa: any) => (
            <Card key={empresa.id} variant="elevated" className="group rounded-[2rem] border-none shadow-md hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 py-4 px-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-xl border-2 border-surface shadow-sm">
                    <AvatarImage src={empresa.logoUrl ?? ''} />
                    <AvatarFallback className="rounded-xl bg-primary-50 text-primary-600 font-bold text-base">
                      {empresa.razonSocial[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm font-black tracking-tight group-hover:text-primary-600 transition-colors">
                      {empresa.razonSocial}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-0.5 text-[10px] font-bold uppercase tracking-wider">
                      <Building2 className="h-3 w-3" />
                      {empresa.sector}
                    </CardDescription>
                  </div>
                </div>
                {empresa.verificada ? (
                  <Badge variant="success" className="h-6 w-6 p-0 flex items-center justify-center rounded-full shadow-sm bg-success/20 text-success border-none">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </Badge>
                ) : (
                  <Badge variant="warning" className="h-6 w-6 p-0 flex items-center justify-center rounded-full shadow-sm bg-warning/20 text-warning border-none">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="py-2 px-6">
                <div className="grid grid-cols-2 gap-4 py-3 px-4 rounded-xl bg-bg-base/30 border border-border/50 backdrop-blur-sm">
                  <div className="text-center border-r border-border/50">
                    <p className="text-[8px] uppercase tracking-[0.2em] font-black text-text-muted mb-0.5">Ofertas</p>
                    <p className="text-base font-black text-primary-600 font-mono tracking-tighter">
                      {empresa.totalOfertas ?? 0}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] uppercase tracking-[0.2em] font-black text-text-muted mb-0.5">Postulantes</p>
                    <p className="text-base font-black text-text-primary font-mono tracking-tighter">
                      {empresa.totalPostulaciones ?? 0}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 py-4 px-6">
                {!empresa.verificada && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 h-9 border-success/30 text-success hover:bg-success hover:text-white rounded-xl font-bold transition-all text-xs"
                    onClick={() => verificarMutation.mutate({ id: empresa.id })}
                    loading={verificarMutation.isPending}
                  >
                    Verificar
                  </Button>
                )}
                <Button variant="secondary" size="sm" className="flex-1 h-9 gap-2 rounded-xl text-xs font-bold">
                  Detalles
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {empresas.length > 0 && (
        <div className="mt-auto p-4 bg-surface/40 backdrop-blur-md rounded-[1.5rem] border-none shadow-xl flex items-center justify-between shrink-0">
          <p className="text-xs text-text-muted font-bold">
            <span className="text-text-primary">{page}</span> de <span className="text-text-primary">{totalPages || 1}</span>
            <span className="ml-2 opacity-50 font-medium">({total} empresas)</span>
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest bg-surface/60 border-none shadow-sm px-4"
            >
              Ant.
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest bg-surface/60 border-none shadow-sm px-4"
            >
              Sig.
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
