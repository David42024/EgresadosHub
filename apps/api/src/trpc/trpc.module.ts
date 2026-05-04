import { Module, Controller, Req, Res, All }  from '@nestjs/common';
import { JwtModule }      from '@nestjs/jwt';
import { ConfigService }  from '@nestjs/config';
import * as trpcExpress   from '@trpc/server/adapters/express';
import { Request, Response } from 'express';
import { TrpcService }    from './trpc.service';
import { createAppRouter } from './app.router';
import { AuthModule }     from '../modules/auth/auth.module';
import { EgresadosModule } from '../modules/egresados/egresados.module';
import { EmpresasModule }  from '../modules/empresas/empresas.module';
import { OfertasModule }   from '../modules/ofertas/ofertas.module';
import { PostulacionesModule } from '../modules/postulaciones/postulaciones.module';
import { AnalyticsModule } from '../modules/analytics/analytics.module';
import { ReportesModule }  from '../modules/reportes/reportes.module';
import { NotificacionesModule } from '../modules/notificaciones/notificaciones.module';
import { AuthRouter }           from '../modules/auth/auth.router';
import { EgresadosRouter }      from '../modules/egresados/egresados.router';
import { EmpresasRouter }       from '../modules/empresas/empresas.router';
import { OfertasRouter }        from '../modules/ofertas/ofertas.router';
import { PostulacionesRouter }  from '../modules/postulaciones/postulaciones.router';
import { AnalyticsRouter }      from '../modules/analytics/analytics.router';
import { ReportesRouter }       from '../modules/reportes/reportes.router';
import { NotificacionesRouter } from '../modules/notificaciones/notificaciones.router';

@Controller('trpc')
export class TrpcController {
  private readonly appRouterInstance;

  constructor(
    private readonly trpcService: TrpcService,
    private readonly auth: AuthRouter,
    private readonly egresados: EgresadosRouter,
    private readonly empresas: EmpresasRouter,
    private readonly ofertas: OfertasRouter,
    private readonly postulaciones: PostulacionesRouter,
    private readonly analytics: AnalyticsRouter,
    private readonly reportes: ReportesRouter,
    private readonly notificaciones: NotificacionesRouter,
  ) {
    this.appRouterInstance = createAppRouter({
      auth: this.auth,
      egresados: this.egresados,
      empresas: this.empresas,
      ofertas: this.ofertas,
      postulaciones: this.postulaciones,
      analytics: this.analytics,
      reportes: this.reportes,
      notificaciones: this.notificaciones,
    });
  }

  @All('*')
  async handleTrpc(@Req() req: Request, @Res() res: Response) {
    return trpcExpress.createExpressMiddleware({
      router:     this.appRouterInstance,
      createContext: ({ req, res }) => this.trpcService.createContext(req, res),
      onError: ({ error, path }) => {
        if (error.code !== 'NOT_FOUND') {
          console.error(`tRPC error [${path}]:`, error.message);
        }
      },
    })(req, res, () => {});
  }
}

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:      config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') },
      }),
    }),
    AuthModule,
    EgresadosModule,
    EmpresasModule,
    OfertasModule,
    PostulacionesModule,
    AnalyticsModule,
    ReportesModule,
    NotificacionesModule,
  ],
  controllers: [TrpcController],
  providers: [
    TrpcService,
    AuthRouter,
    EgresadosRouter,
    EmpresasRouter,
    OfertasRouter,
    PostulacionesRouter,
    AnalyticsRouter,
    ReportesRouter,
    NotificacionesRouter,
  ],
  exports: [TrpcService],
})
export class TrpcModule {}