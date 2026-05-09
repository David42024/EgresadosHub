'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  LayoutGrid,
  List,
  Filter,
  Sparkles,
  Bookmark,
  Send,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/components/ui/use-toast';
import type { RouterOutputs } from '@/lib/trpc/router.types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

type Oferta = RouterOutputs['ofertas']['publicList']['data'][number];

export default function EgresadoOfertasPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [salarioMin, setSalarioMin] = useState<number>(0);
  const [salarioMax, setSalarioMax] = useState<number>(20000);
  const [modalidad, setModalidad] = useState<'ALL' | 'REMOTO' | 'HIBRIDO' | 'PRESENCIAL'>('ALL');
  const [habilidades, setHabilidades] = useState<string[]>([]);
  const [soloRecomendadas, setSoloRecomendadas] = useState<boolean>(false);

  const [page, setPage] = useState(1);
  const LIMIT = 8;
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading } = (trpc as any).ofertas.publicList.useQuery({
    search: debouncedSearch,
    modalidad: modalidad === 'ALL' ? undefined : modalidad,
    salarioMin,
    salarioMax,
    habilidades: habilidades.length > 0 ? habilidades : undefined,
    limit: LIMIT,
    skip: (page - 1) * LIMIT,
  }) as any;

  const ofertas = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const ofertasFiltradas = soloRecomendadas
    ? ofertas.filter((o: any) => {
      const req: string[] = Array.isArray(o?.habilidadesReq) ? o.habilidadesReq : [];
      const egresadoSkills = ['React', 'Node.js', 'TypeScript']; // Simulación de habilidades del egresado
      if (egresadoSkills.length === 0) return req.length > 0;
      return req.some((s) => egresadoSkills.includes(s));
    })
    : ofertas;

  const clearFilters = () => {
    setSearch('');
    setSalarioMin(0);
    setSalarioMax(20000);
    setModalidad('ALL');
    setHabilidades([]);
    setSoloRecomendadas(false);
    setPage(1);
  };

  const toggleRecomendaciones = () => {
    setSoloRecomendadas(prev => !prev);
  };

  const toggleHabilidad = (skill: string) => {
    setHabilidades((prev) => prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]);
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Explorar Oportunidades" 
        description="Encuentra el próximo paso en tu carrera profesional."
      >
        <div className="flex bg-bg-elevated p-1 rounded-lg border border-border">
          <Button 
            variant={view === 'grid' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-8 w-8 p-0 rounded-md"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button 
            variant={view === 'list' ? 'secondary' : 'ghost'} 
            size="sm" 
            className="h-8 w-8 p-0 rounded-md"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </PageHeader>

      {/* Sección Recomendados */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-8 text-white shadow-xl shadow-primary-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-32 w-32" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <Badge className="bg-white/20 text-white border-none backdrop-blur-md">IA Matching</Badge>
          <h2 className="text-3xl font-extrabold tracking-tight">Ofertas con alto Match para ti</h2>
          <p className="text-primary-100 text-lg">
            Basado en tus habilidades de <span className="text-white font-bold">Node.js, React y TypeScript</span>, estas ofertas podrían interesarte.
          </p>
          <Button
            variant="secondary"
            className="bg-white text-primary-700 hover:bg-primary-50 border-none font-bold"
            onClick={toggleRecomendaciones}
          >
            {soloRecomendadas ? 'Ver todas las ofertas' : 'Ver recomendaciones'}
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filtros Sidebar */}
        <aside className="lg:col-span-1 space-y-6 sticky top-24 h-fit">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filtros Avanzados
            </h3>
            
            <Card variant="elevated">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-primary">Rango Salarial (S/)</label>
                  <div className="flex justify-between text-sm font-mono font-bold text-primary-600 mb-2">
                    <span>S/ {salarioMin} – S/ {salarioMax}</span>
                    {soloRecomendadas ? (
                      <Badge className="bg-primary-50 text-primary-700 border-none">Recomendadas</Badge>
                    ) : null}
                  </div>
                  <div className="range-slider">
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={salarioMin}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setSalarioMin(Math.min(next, salarioMax));
                      }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={20000}
                      step={500}
                      value={salarioMax}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setSalarioMax(Math.max(next, salarioMin));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-text-primary">Modalidad</label>
                  <Select value={modalidad} onValueChange={(v) => setModalidad(v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Modalidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="REMOTO">Remoto</SelectItem>
                      <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                      <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <label className="text-xs font-bold text-text-primary">Habilidades Match</label>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'SQL', 'AWS'].map(skill => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        onClick={() => toggleHabilidad(skill)}
                        className={cn(
                          'cursor-pointer hover:bg-primary-100 transition-colors',
                          habilidades.includes(skill) ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300' : ''
                        )}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Listado de Ofertas */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
            <Input 
              placeholder="Buscar por cargo, empresa o tecnología..." 
              className="pl-12 h-12 text-base rounded-2xl shadow-sm border-border focus-visible:ring-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className={cn("grid gap-6", view === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
            </div>
          ) : ofertasFiltradas.length === 0 ? (
            <EmptyState title="No se encontraron ofertas" description="Prueba ajustando los filtros o el término de búsqueda." />
          ) : (
            <div className={cn("grid gap-6", view === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
              {ofertasFiltradas.map((oferta: any) => (
                <Card 
                  key={oferta.id} 
                  variant="elevated" 
                  className="group flex flex-col h-full hover:border-primary-500/30 transition-all duration-300"
                >
                  <CardHeader className="relative pb-0">
                    <div className="absolute top-6 right-6">
                      <Badge className="bg-primary-50 text-primary-600 border-none font-bold">
                        95% Match
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                        <AvatarImage src={oferta.empresa?.logoUrl} />
                        <AvatarFallback className="rounded-xl bg-bg-elevated text-text-muted font-bold text-lg">
                          {(oferta.empresa?.nombreComercial ?? oferta.empresa?.razonSocial)?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 pr-16">
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {oferta.titulo}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-1 font-medium">
                          <Link href={`/empresas/${oferta.empresa?.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors z-10 relative">
                            {oferta.empresa?.nombreComercial ?? oferta.empresa?.razonSocial}
                          </Link>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 mt-6">
                      <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="secondary" className="bg-bg-elevated text-text-secondary gap-1 border-none">
                          <MapPin className="h-3 w-3" /> {oferta.modalidad}
                        </Badge>
                        <Badge variant="secondary" className="bg-bg-elevated text-text-secondary gap-1 border-none">
                          <DollarSign className="h-3 w-3" /> {oferta.salarioMin ? `S/ ${oferta.salarioMin}+` : 'Negociable'}
                        </Badge>
                        <Badge variant="secondary" className="bg-bg-elevated text-text-secondary gap-1 border-none">
                          <Clock className="h-3 w-3" /> 2 días
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {oferta.habilidadesReq?.slice(0, 4).map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-[10px] uppercase tracking-wider font-bold"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {(oferta.habilidadesReq?.length ?? 0) > 4 && (
                          <Badge variant="outline" className="text-[10px] text-text-muted">
                            +{oferta.habilidadesReq.length - 4} más
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  <CardFooter className="pt-0 flex gap-2 relative z-10">
                    <Link href={`/ofertas/${oferta.id}`} className="flex-1">
                      <Button className="w-full rounded-xl font-bold">
                        Ver Detalles y Postular
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl font-bold"
              >
                Anterior
              </Button>
              <span className="text-sm font-bold text-text-muted">
                Página {page} de {totalPages} &nbsp;·&nbsp; {total} ofertas
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl font-bold"
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
