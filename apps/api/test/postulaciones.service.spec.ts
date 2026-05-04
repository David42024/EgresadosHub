import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PostulacionesService } from '../src/modules/postulaciones/postulaciones.service';
import { EstadoPostulacion }    from '@repo/trpc-contract';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPostulacion = {
  id:         'uuid-1',
  egresadoId: 'eg-1',
  ofertaId:   'of-1',
  estado:     EstadoPostulacion.POSTULADO,
  audits:     [],
  postuladoAt: new Date(),
  updatedAt:   new Date(),
};

const mockRepo = {
  findOne:  vi.fn(),
  find:     vi.fn(),
  create:   vi.fn((d) => d),
  save:     vi.fn((d) => Promise.resolve({ ...mockPostulacion, ...d })),
  createQueryBuilder: vi.fn(() => ({
    leftJoinAndSelect: vi.fn().mockReturnThis(),
    where:     vi.fn().mockReturnThis(),
    andWhere:  vi.fn().mockReturnThis(),
    orderBy:   vi.fn().mockReturnThis(),
    take:      vi.fn().mockReturnThis(),
    getCount:  vi.fn().mockResolvedValue(1),
    getMany:   vi.fn().mockResolvedValue([mockPostulacion]),
  })),
  update:   vi.fn(),
};

const mockAuditRepo = {
  create: vi.fn((d) => d),
  save:   vi.fn((d) => Promise.resolve(d)),
};

const mockEvents = { emit: vi.fn() };

describe('PostulacionesService', () => {
  let service: PostulacionesService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PostulacionesService(
      mockRepo as any,
      mockAuditRepo as any,
      mockEvents as any,
    );
  });

  describe('create()', () => {
    it('crea una postulación y registra auditoría inicial', async () => {
      mockRepo.findOne.mockResolvedValue(null);  // No existe

      const result = await service.create('eg-1', {
        ofertaId:          'of-1',
        cartaPresentacion: 'Hola',
      });

      expect(mockRepo.save).toHaveBeenCalledOnce();
      expect(mockAuditRepo.save).toHaveBeenCalledOnce();
      expect(mockEvents.emit).toHaveBeenCalledWith('postulacion.creada', expect.any(Object));
    });

    it('lanza BadRequestException si ya existe una postulación', async () => {
      mockRepo.findOne.mockResolvedValue(mockPostulacion);

      await expect(
        service.create('eg-1', { ofertaId: 'of-1' }),
      ).rejects.toThrow('Ya postulaste a esta oferta');
    });
  });

  describe('cambiarEstado()', () => {
    it('permite transición válida POSTULADO → EN_REVISION', async () => {
      mockRepo.findOne.mockResolvedValue({ ...mockPostulacion, audits: [] });

      await service.cambiarEstado(
        {
          postulacionId: 'uuid-1',
          nuevoEstado:   EstadoPostulacion.EN_REVISION,
          comentario:    'Revisando CV',
        },
        'user-empresa-1',
      );

      expect(mockAuditRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          estadoAnterior: EstadoPostulacion.POSTULADO,
          estadoNuevo:    EstadoPostulacion.EN_REVISION,
        }),
      );
      expect(mockEvents.emit).toHaveBeenCalledWith(
        'postulacion.estado_cambiado',
        expect.any(Object),
      );
    });

    it('rechaza transición inválida EN_REVISION → POSTULADO', async () => {
      mockRepo.findOne.mockResolvedValue({
        ...mockPostulacion,
        estado: EstadoPostulacion.EN_REVISION,
        audits: [],
      });

      await expect(
        service.cambiarEstado(
          { postulacionId: 'uuid-1', nuevoEstado: EstadoPostulacion.POSTULADO },
          'user-empresa-1',
        ),
      ).rejects.toThrow('Transición inválida');
    });

    it('rechaza transición desde estado terminal CONTRATADO', async () => {
      mockRepo.findOne.mockResolvedValue({
        ...mockPostulacion,
        estado: EstadoPostulacion.CONTRATADO,
        audits: [],
      });

      await expect(
        service.cambiarEstado(
          { postulacionId: 'uuid-1', nuevoEstado: EstadoPostulacion.ENTREVISTA },
          'user-empresa-1',
        ),
      ).rejects.toThrow('Transición inválida');
    });
  });

  describe('findByEgresado()', () => {
    it('retorna postulaciones paginadas', async () => {
      const result = await service.findByEgresado('eg-1', { limit: 10 });

      expect(result).toMatchObject({
        data:       expect.arrayContaining([expect.any(Object)]),
        nextCursor: null,
        total:      1,
      });
    });
  });
});