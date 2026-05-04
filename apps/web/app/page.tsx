import Link from 'next/link';
import { createServerTrpcClient } from '@/lib/trpc/server';
import type { RouterOutputs } from '@/lib/trpc/router.types';
import { Card, CardContent } from '@/components/ui/card';
import { 
  GraduationCap, 
  Briefcase, 
  Building2, 
  LineChart, 
  Target, 
  FileText, 
  ArrowRight,
  Sparkles,
  Search
} from 'lucide-react';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

type AdminKpis = RouterOutputs['analytics']['getAdminKpis'];

export default async function HomePage() {
  // Obtener estadísticas públicas para el hero
  let stats = { totalEgresados: 0, totalOfertasActivas: 0, totalEmpresas: 0 };
  try {
    const api = await createServerTrpcClient();
    const kpis: any = await (api as any).query('analytics.getAdminKpis');
    if (kpis !== null && kpis !== undefined) {
      stats = {
        totalEgresados:      Number(kpis.totalEgresados ?? 0),
        totalOfertasActivas: Number(kpis.totalOfertasActivas ?? 0),
        totalEmpresas:       Number(kpis.totalEmpresas ?? 0),
      };
    }
  } catch {
    // Fallback silencioso
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300">
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
            <Link href="/auth/login" className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Iniciar Sesión
            </Link>
            <Link href="/auth/register" className="inline-flex items-center justify-center h-10 px-4 py-2 bg-slate-900 dark:bg-white text-slate-50 dark:text-slate-900 rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm">
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 pt-20 pb-32 transition-colors duration-300">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200/40 dark:bg-blue-900/20 blur-3xl" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400 font-semibold text-sm mb-8 shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span>La plataforma definitiva para tu desarrollo profesional</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight mb-8">
              Tu carrera profesional <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                comienza aquí
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
              Conectamos talento emergente con las mejores oportunidades laborales. Construye tu perfil, postula con un clic y alcanza tus metas profesionales.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register?role=EGRESADO" className="inline-flex items-center justify-center bg-slate-900 dark:bg-blue-600 text-slate-50 dark:text-white w-full sm:w-auto h-14 px-8 text-lg rounded-2xl shadow-xl shadow-blue-500/20 dark:shadow-blue-900/40 hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:bg-blue-500 transition-all hover:-translate-y-1 font-bold">
                Soy Egresado <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/auth/register?role=EMPRESA" className="inline-flex items-center justify-center w-full sm:w-auto h-14 px-8 text-lg rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all hover:-translate-y-1 font-bold text-slate-700 dark:text-slate-300">
                Publicar Oferta Laboral
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-20 -mt-16 mb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Egresados Registrados', value: stats.totalEgresados.toLocaleString('es-PE'), icon: GraduationCap, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' },
            { label: 'Ofertas Activas', value: stats.totalOfertasActivas.toLocaleString('es-PE'), icon: Briefcase, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
            { label: 'Empresas Aliadas', value: stats.totalEmpresas.toLocaleString('es-PE'), icon: Building2, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' },
          ].map((s, i) => (
            <Card key={s.label} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg animate-in fade-in slide-in-from-bottom-4 duration-700 border dark:border-slate-800/50" style={{ animationDelay: `${i * 150}ms` }}>
              <CardContent className="p-8 flex items-center gap-6">
                <div className={`h-16 w-16 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-8 w-8 ${s.color}`} />
                </div>
                <div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{s.value}</div>
                  <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
              Todo lo que necesitas <br />para tu carrera
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
              Herramientas de última generación para potenciar tu empleabilidad.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: LineChart,
                title: 'Dashboard de Empleabilidad',
                desc: 'Estadísticas en tiempo real: tasa de contratación, salario promedio y distribución por carrera.',
                color: 'text-blue-600 dark:text-blue-400',
                bg: 'bg-blue-50 dark:bg-blue-900/20'
              },
              {
                icon: Target,
                title: 'Match Inteligente',
                desc: 'Nuestro sistema analiza tu perfil y te recomienda las ofertas laborales más compatibles contigo.',
                color: 'text-indigo-600 dark:text-indigo-400',
                bg: 'bg-indigo-50 dark:bg-indigo-900/20'
              },
              {
                icon: FileText,
                title: 'Reportes Profesionales',
                desc: 'Genera informes de gestión detallados y PDFs personalizados con gráficos integrados.',
                color: 'text-purple-600 dark:text-purple-400',
                bg: 'bg-purple-50 dark:bg-purple-900/20'
              },
            ].map((f, i) => (
              <Card key={f.title} className="border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-none hover:shadow-xl hover:shadow-blue-500/10 dark:hover:border-blue-900/50 transition-all duration-300 group bg-white dark:bg-slate-900">
                <CardContent className="p-8">
                  <div className={`h-14 w-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                    <f.icon className={`h-7 w-7 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{f.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 overflow-hidden bg-slate-900 dark:bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/30 dark:bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-xl text-slate-300 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium">
            Únete a cientos de egresados que ya están construyendo su futuro profesional en nuestra plataforma.
          </p>
          <Link href="/auth/register" className="inline-flex items-center justify-center h-14 px-10 text-lg rounded-2xl bg-white dark:bg-blue-600 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-blue-500 hover:scale-105 transition-all shadow-xl shadow-white/10 dark:shadow-blue-900/20 font-bold">
            Crear cuenta gratis ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12 text-center text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-50 mb-4">
            <GraduationCap className="h-6 w-6 text-white" />
            <span className="font-bold text-lg text-white">EgresadosHub</span>
          </div>
          <p className="font-medium text-sm tracking-wide">© {new Date().getFullYear()} EgresadosHub. Sistema de Gestión de Egresados.</p>
        </div>
      </footer>
    </main>
  );
}