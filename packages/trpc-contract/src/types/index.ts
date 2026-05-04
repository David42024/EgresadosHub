import type { Role, EstadoPostulacion, EstadoOferta, Modalidad, TipoNotificacion } from '../schemas/index';

// ─── Tipos de respuesta de la API ─────────────────────────────────────────────

export interface UserDto {
  id:        string;
  email:     string;
  role:      Role;
  isActive:  boolean;
  createdAt: string;
}

export interface EgresadoDto {
  id:                  string;
  userId:              string;
  nombres:             string;
  apellidos:           string;
  nombreCompleto:      string;
  carrera:             string;
  anioEgreso:          number;
  telefono?:           string;
  ubicacion?:          string;
  resumenProfesional?: string;
  cvUrl?:              string;
  habilidades:         HabilidadDto[];
  experiencias:        ExperienciaDto[];
  formacion:           FormacionDto[];
  redesSociales:       Record<string, string>;
  user:                UserDto;
  createdAt:           string;
  updatedAt:           string;
}

export interface HabilidadDto {
  nombre:    string;
  nivel?:    number;
  categoria: string;
}

export interface ExperienciaDto {
  empresa:     string;
  cargo:       string;
  desde:       string;
  hasta?:      string;
  actual:      boolean;
  descripcion?: string;
}

export interface FormacionDto {
  institucion: string;
  titulo:      string;
  desde:       string;
  hasta?:      string;
  actual:      boolean;
}

export interface EmpresaDto {
  id:          string;
  userId:      string;
  razonSocial: string;
  ruc:         string;
  sector:      string;
  ubicacion:   string;
  descripcion?: string;
  sitioWeb?:   string;
  logoUrl?:    string;
  verificada:  boolean;
  user:        UserDto;
  createdAt:   string;
}

export interface OfertaDto {
  id:             string;
  empresaId:      string;
  empresa:        EmpresaDto;
  titulo:         string;
  descripcion:    string;
  requisitos?:    string;
  beneficios?:    string;
  salarioMin?:    number;
  salarioMax?:    number;
  modalidad:      Modalidad;
  ubicacion:      string;
  experienciaMin?: number;
  habilidadesReq: string[];
  estado:         EstadoOferta;
  totalPostulantes: number;
  publicadaAt:    string;
  cierraAt?:      string;
  createdAt:      string;
}

export interface PostulacionDto {
  id:                string;
  egresadoId:        string;
  egresado:          EgresadoDto;
  ofertaId:          string;
  oferta:            OfertaDto;
  estado:            EstadoPostulacion;
  cartaPresentacion?: string;
  audits:            AuditDto[];
  postuladoAt:       string;
  updatedAt:         string;
}

export interface AuditDto {
  id:              string;
  estadoAnterior?: EstadoPostulacion;
  estadoNuevo:     EstadoPostulacion;
  cambiadoPor:     string;
  comentario?:     string;
  cambiadoAt:      string;
}

export interface NotificacionDto {
  id:        string;
  userId:    string;
  tipo:      TipoNotificacion;
  mensaje:   string;
  metadata:  Record<string, unknown>;
  leida:     boolean;
  creadaAt:  string;
}

// ─── Tipos de Analytics ───────────────────────────────────────────────────────

export interface AdminKpisDto {
  totalEgresados:         number;
  totalEmpresas:          number;
  totalOfertasActivas:    number;
  totalPostulacionesMes:  number;
  tasaEmpleabilidadGlobal: number;
  variacionEgresados:     number;   // % vs mes anterior
  variacionOfertas:       number;
  salarioPromedioGlobal:  number | null;
  salarioDesviacionGlobal: number | null;
}

export interface EstadisticaCohorteDto {
  anioEgreso:              number;
  carrera:                 string;
  totalEgresados:          number;
  totalContratados:        number;
  tasaEmpleabilidad:       number;
  salarioPromedio:         number | null;
  salarioMediana:          number | null;
  salarioDesviacion:       number | null;
  tiempoPromedioEmpleoMeses: number | null;
}

export interface DemandaHabilidadDto {
  habilidad:          string;
  categoria:          string;
  totalOfertas:       number;
  totalEgresados:     number;
  brecha:             number;   // diferencia oferta - egresados con esa skill
}

export interface EmbudoConversionDto {
  postulados:  number;
  enRevision:  number;
  entrevista:  number;
  contratados: number;
  rechazados:  number;
  tasaConversion: number;  // %
}

export interface EgresadoStatsDto {
  totalPostulaciones:   number;
  totalEnRevision:      number;  // ← agregar
  totalEntrevistas:     number;
  totalOfertas:         number;
  tasaRespuesta:        number;
  salarioPromedioMatch: number | null;
  ofertasMatch:         number;
}

export interface EmpresaOfertaStatsDto {
  ofertaId:       string;
  titulo:         string;
  totalPostulantes: number;
  embudo:         EmbudoConversionDto;
}

// ─── Tipos de Reportes ────────────────────────────────────────────────────────

export interface ReporteJobDto {
  jobId:     string;
  estado:    'PENDIENTE' | 'PROCESANDO' | 'COMPLETADO' | 'ERROR';
  url?:      string;
  error?:    string;
  creadoAt:  string;
}

// ─── Tipos de paginación ──────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data:       T[];
  nextCursor: string | null;
  total:      number;
}