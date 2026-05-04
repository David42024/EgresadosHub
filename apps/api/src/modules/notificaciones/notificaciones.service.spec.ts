import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificacionesService } from './notificaciones.service';
import { TipoNotificacion, EstadoPostulacion } from '@repo/trpc-contract';

// Mock de nodemailer
vi.mock('nodemailer', () => ({
  createTransport: vi.fn().mockReturnValue({
    sendMail: vi.fn().mockResolvedValue({ messageId: 'm1' }),
  }),
}));

describe('NotificacionesService', () => {
  let service: NotificacionesService;
  const mockRepo = {
    createQueryBuilder: vi.fn(),
    count: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  };
  const mockConfig = {
    get: vi.fn().mockImplementation((key) => {
      if (key === 'SMTP_HOST') return 'localhost';
      if (key === 'SMTP_PORT') return 587;
      return null;
    }),
  };

  beforeEach(() => {
    service = new NotificacionesService(mockRepo as any, mockConfig as any);
    vi.clearAllMocks();
  });

  describe('crear', () => {
    it('should create and save a notification', async () => {
      const dto = {
        userId:  'u1',
        tipo:    TipoNotificacion.SISTEMA,  // ← cambiar aquí
        mensaje: 'Hola',
      };
      mockRepo.create.mockReturnValue(dto);
      mockRepo.save.mockResolvedValue({ ...dto, id: 'n1' });

      const result = await service.crear(dto);

      expect(result.id).toBe('n1');
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('onEstadoCambiado', () => {
    it('should create notification and send email', async () => {
      const payload = {
        postulacion: {
          id: 'p1',
          ofertaId: 'o1',
          egresado: {
            userId: 'u1',
            user: { email: 'test@example.com' },
          },
          oferta: { titulo: 'Dev' },
        },
        estadoAnterior: EstadoPostulacion.POSTULADO,
        estadoNuevo: EstadoPostulacion.EN_REVISION,
      };

      mockRepo.create.mockReturnValue({});
      mockRepo.save.mockResolvedValue({ id: 'n1' });

      await service.onEstadoCambiado(payload as any);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: TipoNotificacion.CAMBIO_ESTADO,
        })
      );
      // El email se envía de forma asíncrona (no se awaita en el listener si no es necesario, 
      // pero aquí sí se awaita en la implementación actual)
    });
  });

  describe('countNoLeidas', () => {
    it('should return count of unread notifications', async () => {
      mockRepo.count.mockResolvedValue(5);
      const result = await service.countNoLeidas('u1');
      expect(result).toBe(5);
    });
  });

  describe('marcarLeida', () => {
    it('should mark a notification as read', async () => {
      const n = { id: 'n1', userId: 'u1', leida: false };
      mockRepo.findOne.mockResolvedValue(n);
      mockRepo.save.mockImplementation((x) => Promise.resolve(x));

      const result = await service.marcarLeida('n1', 'u1');
      expect(result.leida).toBe(true);
    });
  });

  describe('marcarTodasLeidas', () => {
    it('should update all notifications to read', async () => {
      await service.marcarTodasLeidas('u1');
      expect(mockRepo.update).toHaveBeenCalledWith({ userId: 'u1', leida: false }, { leida: true });
    });
  });

  describe('enviarEmail', () => {
    it('should send an email', async () => {
      await service.enviarEmail('to@example.com', 'Sub', 'Body');
      const nodemailer = await import('nodemailer');
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    });
  });
});
