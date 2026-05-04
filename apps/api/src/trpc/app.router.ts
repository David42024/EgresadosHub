import { router }     from './trpc.service';
import type { AuthRouter }           from '../modules/auth/auth.router';
import type { EgresadosRouter }      from '../modules/egresados/egresados.router';
import type { EmpresasRouter }       from '../modules/empresas/empresas.router';
import type { OfertasRouter }        from '../modules/ofertas/ofertas.router';
import type { PostulacionesRouter }  from '../modules/postulaciones/postulaciones.router';
import type { AnalyticsRouter }      from '../modules/analytics/analytics.router';
import type { ReportesRouter }       from '../modules/reportes/reportes.router';
import type { NotificacionesRouter } from '../modules/notificaciones/notificaciones.router';

/**
 * Función pura para construir el AppRouter combinando los sub-routers.
 * Esto evita el uso de @Injectable() en una clase que solo agrupa lógica.
 */
export const createAppRouter = (deps: {
  auth:           AuthRouter;
  egresados:      EgresadosRouter;
  empresas:       EmpresasRouter;
  ofertas:        OfertasRouter;
  postulaciones:  PostulacionesRouter;
  analytics:      AnalyticsRouter;
  reportes:       ReportesRouter;
  notificaciones: NotificacionesRouter;
}) => {
  return router({
    auth:           deps.auth.router,
    egresados:      deps.egresados.router,
    empresas:       deps.empresas.router,
    ofertas:        deps.ofertas.router,
    postulaciones:  deps.postulaciones.router,
    analytics:      deps.analytics.router,
    reportes:       deps.reportes.router,
    notificaciones: deps.notificaciones.router,
  });
};

export type TAppRouter = ReturnType<typeof createAppRouter>;