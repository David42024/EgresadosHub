-- ============================================================
-- Migración inicial: Sistema de Gestión de Egresados
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Para búsqueda full-text

-- ─── Tipos enumerados ─────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMINISTRADOR', 'EGRESADO', 'EMPRESA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE estado_postulacion AS ENUM (
    'POSTULADO', 'EN_REVISION', 'ENTREVISTA', 'CONTRATADO', 'RECHAZADO'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE estado_oferta AS ENUM ('BORRADOR', 'ACTIVA', 'PAUSADA', 'CERRADA');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE modalidad_oferta AS ENUM ('PRESENCIAL', 'REMOTO', 'HIBRIDO');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tipo_notificacion AS ENUM (
    'CAMBIO_ESTADO', 'NUEVA_OFERTA', 'NUEVO_POSTULANTE', 'REPORTE_LISTO', 'SISTEMA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── Tabla: users ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  role          user_role    NOT NULL DEFAULT 'EGRESADO',
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  google_id     VARCHAR(255) UNIQUE,
  avatar_url    VARCHAR(500),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email    ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role     ON users (role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_google   ON users (google_id) WHERE google_id IS NOT NULL;

-- ─── Tabla: egresados ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS egresados (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  nombres               VARCHAR(150) NOT NULL,
  apellidos             VARCHAR(150) NOT NULL,
  codigo_estudiante     VARCHAR(50) UNIQUE,
  carrera               VARCHAR(200) NOT NULL,
  anio_egreso           SMALLINT    NOT NULL CHECK (anio_egreso BETWEEN 1980 AND 2100),
  telefono              VARCHAR(20),
  ubicacion             VARCHAR(200),
  resumen_profesional   TEXT,
  foto_url              VARCHAR(500),
  cv_url                VARCHAR(500),
  habilidades           JSONB        NOT NULL DEFAULT '[]',
  experiencias          JSONB        NOT NULL DEFAULT '[]',
  formacion             JSONB        NOT NULL DEFAULT '[]',
  redes_sociales        JSONB        NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
-- Índices para filtros frecuentes del dashboard
CREATE INDEX IF NOT EXISTS idx_egresados_carrera_anio
  ON egresados (carrera, anio_egreso);
CREATE INDEX IF NOT EXISTS idx_egresados_habilidades
  ON egresados USING GIN (habilidades);
CREATE INDEX IF NOT EXISTS idx_egresados_ubicacion
  ON egresados (ubicacion) WHERE ubicacion IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_egresados_nombres_trgm
  ON egresados USING GIN ((nombres || ' ' || apellidos) gin_trgm_ops);

-- ─── Tabla: habilidades_catalogo ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS habilidades_catalogo (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre    VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(50)  NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_hab_cat_nombre ON habilidades_catalogo (nombre);
CREATE INDEX IF NOT EXISTS idx_hab_cat_cat    ON habilidades_catalogo (categoria);

-- ─── Tabla: empresas ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS empresas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  razon_social VARCHAR(300) NOT NULL,
  ruc         VARCHAR(11) UNIQUE,
  sector      VARCHAR(100) NOT NULL,
  ubicacion   VARCHAR(200) NOT NULL,
  descripcion TEXT,
  sitio_web   VARCHAR(500),
  logo_url    VARCHAR(500),
  verificada  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_empresas_sector    ON empresas (sector);
CREATE INDEX IF NOT EXISTS idx_empresas_ubicacion ON empresas (ubicacion);
CREATE INDEX IF NOT EXISTS idx_empresas_verificada ON empresas (verificada) WHERE verificada = true;

-- ─── Tabla: ofertas ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ofertas (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id       UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo           VARCHAR(200) NOT NULL,
  descripcion      TEXT NOT NULL,
  requisitos       TEXT,
  beneficios       TEXT,
  salario_min      DECIMAL(12,2) CHECK (salario_min > 0),
  salario_max      DECIMAL(12,2) CHECK (salario_max > 0),
  modalidad        modalidad_oferta NOT NULL,
  ubicacion        VARCHAR(200) NOT NULL,
  experiencia_min  SMALLINT DEFAULT 0 CHECK (experiencia_min >= 0),
  habilidades_req  JSONB NOT NULL DEFAULT '[]',
  estado           estado_oferta NOT NULL DEFAULT 'BORRADOR',
  publicada_at     TIMESTAMPTZ,
  cierra_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_salario CHECK (salario_max IS NULL OR salario_min IS NULL OR salario_max >= salario_min)
);
-- Índices optimizados para filtros del marketplace
CREATE INDEX IF NOT EXISTS idx_ofertas_estado_fecha
  ON ofertas (estado, publicada_at DESC) WHERE estado = 'ACTIVA';
CREATE INDEX IF NOT EXISTS idx_ofertas_empresa
  ON ofertas (empresa_id, estado);
CREATE INDEX IF NOT EXISTS idx_ofertas_modalidad
  ON ofertas (modalidad, estado);
CREATE INDEX IF NOT EXISTS idx_ofertas_ubicacion
  ON ofertas (ubicacion, estado);
CREATE INDEX IF NOT EXISTS idx_ofertas_habilidades
  ON ofertas USING GIN (habilidades_req);
CREATE INDEX IF NOT EXISTS idx_ofertas_salario
  ON ofertas (salario_min, salario_max) WHERE estado = 'ACTIVA';
CREATE INDEX IF NOT EXISTS idx_ofertas_titulo_trgm
  ON ofertas USING GIN (titulo gin_trgm_ops);

-- ─── Tabla: postulaciones ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS postulaciones (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  egresado_id        UUID NOT NULL REFERENCES egresados(id) ON DELETE CASCADE,
  oferta_id          UUID NOT NULL REFERENCES ofertas(id)   ON DELETE CASCADE,
  estado             estado_postulacion NOT NULL DEFAULT 'POSTULADO',
  carta_presentacion TEXT,
  postulado_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(egresado_id, oferta_id)  -- Un egresado no puede postular dos veces a la misma oferta
);
CREATE INDEX IF NOT EXISTS idx_postulaciones_egresado
  ON postulaciones (egresado_id, estado, postulado_at DESC);
CREATE INDEX IF NOT EXISTS idx_postulaciones_oferta
  ON postulaciones (oferta_id, estado);
CREATE INDEX IF NOT EXISTS idx_postulaciones_fecha
  ON postulaciones (postulado_at DESC);

-- ─── Tabla: postulacion_audit ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS postulacion_audit (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  postulacion_id  UUID NOT NULL REFERENCES postulaciones(id) ON DELETE CASCADE,
  estado_anterior estado_postulacion,
  estado_nuevo    estado_postulacion NOT NULL,
  cambiado_por    UUID NOT NULL REFERENCES users(id),
  comentario      TEXT,
  cambiado_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_postulacion
  ON postulacion_audit (postulacion_id, cambiado_at DESC);

-- ─── Tabla: notificaciones ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notificaciones (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo       tipo_notificacion NOT NULL,
  mensaje    TEXT NOT NULL,
  metadata   JSONB NOT NULL DEFAULT '{}',
  leida      BOOLEAN NOT NULL DEFAULT false,
  creada_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user_leida
  ON notificaciones (user_id, leida, creada_at DESC);

-- ─── Tabla: reportes_jobs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reportes_jobs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo       VARCHAR(100) NOT NULL,
  estado     VARCHAR(50)  NOT NULL DEFAULT 'PENDIENTE',
  filtros    JSONB,
  url        VARCHAR(500),
  pdf_base64 TEXT,
  error      TEXT,
  creado_por UUID REFERENCES users(id),
  creado_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completado_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_reportes_jobs_user
  ON reportes_jobs (creado_por, creado_at DESC);

-- ─── Triggers: updated_at automático ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','egresados','empresas','ofertas','postulaciones'] LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    ', t, t);
  END LOOP;
END $$;