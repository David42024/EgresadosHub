import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

/**
 * Initializer para forzar la instanciación del NotificacionesService
 * y que sus listeners de eventos se registren correctamente.
 */
@Injectable()
export class NotificacionesInitializer implements OnModuleInit {
  private readonly logger = new Logger(NotificacionesInitializer.name);

  constructor(
    // Inyectar el servicio para forzar su instanciación
    private readonly notificacionesService: NotificacionesService,
  ) {}

  onModuleInit(): void {
    this.logger.log('NotificacionesService inicializado - listeners de eventos registrados');
  }
}
