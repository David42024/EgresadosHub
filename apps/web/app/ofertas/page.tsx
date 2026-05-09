'use client';

import { useState, useEffect, Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Search, 
  Filter, 
  ChevronRight,
  Building2,
  Clock,
  GraduationCap
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { useAuthStore } from '@/lib/auth-store';
import { cn } from '@/lib/utils';

function PublicOfertasPageContent() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [modalidad, setModalidad] = useState<string>('TODAS');
  const [page, setPage] = useState(1);
  const LIMIT = 6;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = (trpc as any).ofertas.publicList.useQuery(
    {
      search: mounted ? debouncedSearch || '' : '',
      modalidad: mounted && modalidad !== 'TODAS' ? modalidad : undefined,
      limit: LIMIT,
      skip: (page - 1) * LIMIT,
    },
    {
      enabled: mounted,
    }
  ) as any;

  const ofertas = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, modalidad]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Nav */}
      <nav className="border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <GraduationCap className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              Egresados<span className="text-blue-600 dark:text-blue-500">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/ofertas" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Search className="h-4 w-4" /> Ofertas Laborales
            </Link>
            <ThemeToggle />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            {user ? (
              <Link href={user.role === 'ADMINISTRADOR' ? '/dashboard/admin' : user.role === 'EMPRESA' ? '/dashboard/empresa/perfil' : '/dashboard/egresado/ofertas'} className="inline-flex items-center justify-center h-10 px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
                Ir a mi Dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="inline-flex items-center justify-center h-10 px-4 py-2 bg-slate-900 dark:bg-white text-slate-50 dark:text-slate-900 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-5xl">
              Encuentra tu próximo <span className="text-blue-600 dark:text-blue-400">desafío profesional</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Explora cientos de oportunidades laborales de las mejores empresas del país.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <Input 
                  placeholder="Buscar por título, empresa o habilidades..." 
                  className="pl-10 h-12 text-lg shadow-sm border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:border-blue-500 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">Modalidad</label>
                  <div className="space-y-2">
                    {['TODAS', 'PRESENCIAL', 'REMOTO', 'HIBRIDO'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setModalidad(m)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          modalidad === m 
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium border border-blue-100 dark:border-blue-800/50' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {m === 'TODAS' ? 'Todas las modalidades' : m.charAt(0) + m.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-4 bg-blue-50 dark:bg-slate-900/50 border-blue-100 dark:border-slate-800 shadow-none">
              <h4 className="text-sm font-bold text-blue-900 dark:text-white mb-2">¿Eres egresado?</h4>
              <p className="text-xs text-blue-700 dark:text-slate-400 mb-4 leading-relaxed">
                Regístrate para ver recomendaciones personalizadas y postular a estas ofertas.
              </p>
              <Link href="/auth/register" className="inline-flex items-center justify-center w-full h-9 px-3 text-xs font-medium bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                Crear cuenta
              </Link>
            </Card>
          </aside>

          {/* Grid de Ofertas */}
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isLoading ? 'Buscando ofertas...' : `${ofertas.length} ofertas encontradas`}
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-none">
                    <div className="flex gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg shrink-0 dark:bg-slate-800" />
                      <div className="space-y-2 flex-grow">
                        <Skeleton className="h-5 w-2/3 dark:bg-slate-800" />
                        <Skeleton className="h-4 w-1/3 dark:bg-slate-800" />
                        <div className="flex gap-2 pt-2">
                          <Skeleton className="h-6 w-16 dark:bg-slate-800" />
                          <Skeleton className="h-6 w-16 dark:bg-slate-800" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : ofertas.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ofertas.map((oferta: any) => (
                    <Card key={oferta.id} className="p-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md dark:shadow-none transition-all group h-full flex flex-col">
                      <div className="flex gap-4 items-start mb-4">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors border border-slate-200 dark:border-slate-700 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                          {oferta.empresa?.logoUrl ? (
                            <img src={oferta.empresa.logoUrl} alt={oferta.empresa.razonSocial || 'N/A'} className="h-8 w-8 object-contain" />
                          ) : (
                            <Building2 className="h-6 w-6 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <Link href={`/ofertas/${oferta.id}`}>
                            <h3 className="font-bold text-slate-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                              {oferta.titulo}
                            </h3>
                          </Link>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            {oferta.empresa?.razonSocial || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium">
                          <MapPin className="h-3 w-3" />
                          {oferta.ubicacion || 'Remoto'}
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-medium">
                          <Briefcase className="h-3 w-3" />
                          {oferta.modalidad}
                        </Badge>
                        {oferta.cierraAt && (
                          <Badge variant="outline" className={cn(
                            "flex items-center gap-1 font-black border-none",
                            new Date(oferta.cierraAt) < new Date() ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-700"
                          )}>
                            <Clock className="h-3 w-3" />
                            Cierra: {new Date(oferta.cierraAt).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-widest">
                        <span>Publicada: {new Date(oferta.createdAt).toLocaleDateString()}</span>
                        <Link href={`/ofertas/${oferta.id}`} className="text-blue-600 dark:text-blue-400 font-black flex items-center hover:underline cursor-pointer">
                          Postular <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-xl font-bold"
                    >
                      Anterior
                    </Button>
                    <span className="text-sm font-bold text-slate-500">Página {page} de {totalPages}</span>
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
              </>
            ) : (
              <EmptyState 
                title="No se encontraron ofertas"
                description="Intenta ajustando los filtros o el término de búsqueda."
                icon={<Briefcase className="h-12 w-12 text-slate-300 dark:text-slate-600" />}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© {new Date().getFullYear()} EgresadosHub. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default function PublicOfertasPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando ofertas...</p>
        </div>
      </div>
    }>
      <PublicOfertasPageContent />
    </Suspense>
  );
}
