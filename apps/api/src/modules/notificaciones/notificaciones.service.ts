import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Notificacion } from './entities/notificacion.entity';
import { TipoNotificacion, EstadoPostulacion } from '@repo/trpc-contract';

interface NotificacionFilter {
  limit?:  number;
  cursor?: string;
}

interface PostulacionEstadoCambiadoPayload {
  postulacion: {
    id:       string;
    ofertaId: string;
    egresado?: {
      userId?: string;
      user?: { email?: string };
    };
    oferta?: { titulo?: string };
  };
  estadoAnterior: EstadoPostulacion;
  estadoNuevo:    EstadoPostulacion;
}

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Notificacion)
    private readonly repo: Repository<Notificacion>,
    private readonly config: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  async findByUser(userId: string, filter: NotificacionFilter) {
    const limit = Math.min(filter.limit ?? 20, 100);
    const qb = this.repo.createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.creada_at', 'DESC')
      .take(limit + 1);

    if (filter.cursor != null && filter.cursor !== '') qb.andWhere('n.id > :cursor', { cursor: filter.cursor });

    const total = await qb.getCount();
    const rows = await qb.getMany();
    const hasNext = rows.length > limit;
    return { data: hasNext ? rows.slice(0, limit) : rows, nextCursor: hasNext ? rows[limit - 1].id : null, total };
  }

  async countNoLeidas(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, leida: false } });
  }

  async marcarLeida(id: string, userId: string): Promise<Notificacion> {
    const n = await this.repo.findOne({ where: { id, userId } });
    if (n === null || n === undefined) throw new NotFoundException();
    n.leida = true;
    return this.repo.save(n);
  }

  async marcarTodasLeidas(userId: string): Promise<void> {
    await this.repo.update({ userId, leida: false }, { leida: true });
  }

  async crear(dto: {
    userId: string;
    tipo: TipoNotificacion;
    mensaje: string;
    metadata?: Record<string, unknown>;
  }): Promise<Notificacion> {
    const n = this.repo.create({
      userId: dto.userId,
      tipo: dto.tipo,
      mensaje: dto.mensaje,
      metadata: dto.metadata ?? {},
    });
    return this.repo.save(n);
  }

  async enviarEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('SMTP_FROM'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error('Error enviando email:', err);
    }
  }

  // ─── Listeners de eventos ─────────────────────────────────────────────────

  @OnEvent('postulacion.estado_cambiado')
  async onEstadoCambiado(payload: PostulacionEstadoCambiadoPayload) {
    const { postulacion, estadoNuevo } = payload;
    const egresadoUserId = postulacion.egresado?.userId;
    if (egresadoUserId == null || egresadoUserId === '') return;

    const mensajes: Record<string, string> = {
      [EstadoPostulacion.EN_REVISION]: 'Tu postulación está siendo revisada',
      [EstadoPostulacion.ENTREVISTA]:  '¡Fuiste seleccionado para una entrevista!',
      [EstadoPostulacion.CONTRATADO]:  '¡Felicidades! Has sido contratado',
      [EstadoPostulacion.RECHAZADO]:   'Tu postulación no fue seleccionada en esta oportunidad',
    };

    const mensaje = mensajes[estadoNuevo] || `Tu postulación cambió a estado: ${estadoNuevo}`;

    await this.crear({
      userId: egresadoUserId,
      tipo: TipoNotificacion.CAMBIO_ESTADO,
      mensaje,
      metadata: {
        postulacionId: postulacion.id,
        ofertaId: postulacion.ofertaId,
        estadoNuevo,
      },
    });

    // Email transaccional
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1e40af;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">Actualización de tu postulación</h2>
        </div>
        <div style="padding:24px;border:1px solid #e5e7eb;border-radius:0 0 8px 8px">
          <p>Hola,</p>
          <p><strong>${mensaje}</strong></p>
          <p>Oferta: <strong>${postulacion.oferta?.titulo ?? ''}</strong></p>
          <p>Estado: <strong>${estadoNuevo}</strong></p>
          <a href="${this.config.get('FRONTEND_URL')}/dashboard/egresado/postulaciones"
             style="background:#1e40af;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px">
            Ver mis postulaciones
          </a>
        </div>
      </div>
    `;

    if (postulacion.egresado?.user?.email != null && postulacion.egresado.user.email !== '') {
      await this.enviarEmail(
        postulacion.egresado.user.email,
        `Postulación: ${mensaje}`,
        emailHtml,
      );
    }
  }

  @OnEvent('oferta.creada')
  async onOfertaCreada(oferta: any) {
    if (!oferta.empresaId) return;
    const emp = await this.repo.manager.query(`SELECT user_id FROM empresas WHERE id = $1`, [oferta.empresaId]);
    if (emp && emp.length > 0 && emp[0].user_id) {
      await this.crear({
        userId: emp[0].user_id,
        tipo: TipoNotificacion.SISTEMA,
        mensaje: `Tu oferta "${oferta.titulo}" ha sido creada exitosamente.`,
        metadata: { ofertaId: oferta.id },
      });
    }
  }

  @OnEvent('empresa.verificada')
  async onEmpresaVerificada(empresa: any) {
    if (!empresa.userId) return;
    await this.crear({
      userId: empresa.userId,
      tipo: TipoNotificacion.SISTEMA,
      mensaje: `¡Felicidades! Tu empresa "${empresa.razonSocial}" ha sido verificada y aprobada.`,
      metadata: { empresaId: empresa.id },
    });
  }

  @OnEvent('postulacion.creada', { async: true })
  async onPostulacionCreada(postulacion: any) {
    this.logger.log(`[onPostulacionCreada] Evento recibido para postulacion: ${postulacion.id}`);
    
    try {
      // Notify Empresa
      const res = await this.repo.manager.query(`
        SELECT e.user_id, o.titulo, e.razon_social
        FROM ofertas o 
        JOIN empresas e ON o.empresa_id = e.id 
        WHERE o.id = $1
      `, [postulacion.ofertaId]);
      
      this.logger.log(`[onPostulacionCreada] Query empresa result: ${JSON.stringify(res)}`);
      
      if (res && res.length > 0 && res[0].user_id) {
        this.logger.log(`[onPostulacionCreada] Creando notificación para empresa user: ${res[0].user_id}`);
        await this.crear({
          userId: res[0].user_id,
          tipo: TipoNotificacion.NUEVA_POSTULACION,
          mensaje: `Has recibido una nueva postulación para la oferta "${res[0].titulo}".`,
          metadata: { postulacionId: postulacion.id, ofertaId: postulacion.ofertaId },
        });
        this.logger.log(`[onPostulacionCreada] Notificación creada exitosamente para empresa`);
      } else {
        this.logger.warn(`[onPostulacionCreada] No se encontró empresa para oferta: ${postulacion.ofertaId}`);
      }

      // Notify Egresado
      const eg = await this.repo.manager.query(`SELECT user_id FROM egresados WHERE id = $1`, [postulacion.egresadoId]);
      this.logger.log(`[onPostulacionCreada] Query egresado result: ${JSON.stringify(eg)}`);
      
      if (eg && eg.length > 0 && eg[0].user_id) {
        this.logger.log(`[onPostulacionCreada] Creando notificación para egresado user: ${eg[0].user_id}`);
        await this.crear({
          userId: eg[0].user_id,
          tipo: TipoNotificacion.SISTEMA,
          mensaje: `Te has postulado exitosamente a la oferta "${res?.[0]?.titulo || '...' }".`,
          metadata: { postulacionId: postulacion.id, ofertaId: postulacion.ofertaId },
        });
        this.logger.log(`[onPostulacionCreada] Notificación creada exitosamente para egresado`);
      } else {
        this.logger.warn(`[onPostulacionCreada] No se encontró egresado: ${postulacion.egresadoId}`);
      }
    } catch (error) {
      this.logger.error(`[onPostulacionCreada] Error creando notificaciones:`, error);
    }
  }

  @OnEvent('empresa.creada')
  async onEmpresaCreada(empresa: any) {
    const admins = await this.repo.manager.query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    for (const admin of admins) {
      await this.crear({
        userId: admin.id,
        tipo: TipoNotificacion.SISTEMA,
        mensaje: `Nueva empresa registrada: "${empresa.razonSocial}". Requiere verificación.`,
        metadata: { empresaId: empresa.id },
      });
    }
  }
}
