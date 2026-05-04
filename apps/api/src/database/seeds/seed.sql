-- ============================================================
-- SEEDER COMPLETO: Sistema de Gestión de Egresados
-- ============================================================

BEGIN;

-- ─── 0. Limpieza de datos (Opcional, comentar si se prefiere mantener) ──────
-- TRUNCATE users, egresados, empresas, ofertas, postulaciones, postulacion_audit, notificaciones CASCADE;

-- ─── 1. Usuarios (Password: Test1234!) ──────────────────────────────────────
-- Hash: $2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2

INSERT INTO users (id, email, password_hash, role) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000000', 'admin@egresados.edu.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'ADMINISTRADOR'),
-- Egresados
('e0000000-0000-0000-0000-000000000001', 'juan.perez@gmail.com',   '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000002', 'maria.garcia@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000003', 'roberto.silva@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
-- Empresas
('b0000000-0000-0000-0000-000000000001', 'techcorp@empresa.com',    '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000002', 'consultora@empresa.com',  '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA')
ON CONFLICT (email) DO NOTHING;

-- ─── 2. Egresados (Perfiles) ────────────────────────────────────────────────
INSERT INTO egresados (id, user_id, nombres, apellidos, carrera, anio_egreso, ubicacion, habilidades, experiencias) VALUES
-- Juan Pérez
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Juan', 'Pérez López', 'Ingeniería de Sistemas', 2021, 'Lima', 
 '[{"nombre":"TypeScript", "categoria":"TECNICA"}, {"nombre":"React", "categoria":"TECNICA"}, {"nombre":"Node.js", "categoria":"TECNICA"}, {"nombre":"PostgreSQL", "categoria":"TECNICA"}, {"nombre":"Docker", "categoria":"TECNICA"}, {"nombre":"Trabajo en equipo", "categoria":"BLANDA"}, {"nombre":"Liderazgo", "categoria":"BLANDA"}, {"nombre":"Inglés B2", "categoria":"IDIOMA"}]',
 '[{"empresa":"Tech Solutions", "cargo":"Developer", "desde":"2021-01-01", "hasta":"2023-01-01", "actual":false, "descripcion":"Desarrollo de apps web"}]'),
-- María García
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'María', 'García Flores', 'Ingeniería Industrial', 2022, 'Trujillo', 
 '[{"nombre":"Python", "categoria":"TECNICA"}, {"nombre":"Power BI", "categoria":"TECNICA"}, {"nombre":"Excel avanzado", "categoria":"TECNICA"}, {"nombre":"SQL", "categoria":"TECNICA"}, {"nombre":"Comunicación efectiva", "categoria":"BLANDA"}, {"nombre":"Gestión de proyectos", "categoria":"BLANDA"}]',
 '[{"empresa":"Logistics Pro", "cargo":"Analista", "desde":"2022-03-01", "hasta":null, "actual":true, "descripcion":"Optimización de procesos"}]'),
-- Roberto Silva
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Roberto', 'Silva Mendoza', 'Administración', 2020, 'Lima', 
 '[{"nombre":"SAP", "categoria":"TECNICA"}, {"nombre":"Excel", "categoria":"TECNICA"}, {"nombre":"Análisis financiero", "categoria":"TECNICA"}, {"nombre":"Negociación", "categoria":"BLANDA"}, {"nombre":"Trabajo bajo presión", "categoria":"BLANDA"}, {"nombre":"Inglés C1", "categoria":"IDIOMA"}, {"nombre":"Portugués A2", "categoria":"IDIOMA"}]',
 '[{"empresa":"Banco Global", "cargo":"Ejecutivo", "desde":"2020-01-01", "hasta":null, "actual":true, "descripcion":"Gestión de cartera"}]')
ON CONFLICT (user_id) DO NOTHING;

-- ─── 3. Empresas (Verificadas) ──────────────────────────────────────────────
INSERT INTO empresas (id, user_id, razon_social, ruc, sector, ubicacion, verificada) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'TechCorp SAC', '20123456789', 'Tecnología', 'Lima', true),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Consultora Andina SRL', '20987654321', 'Consultoría', 'Trujillo', true)
ON CONFLICT (user_id) DO NOTHING;

-- ─── 4. Ofertas ─────────────────────────────────────────────────────────────
INSERT INTO ofertas (id, empresa_id, titulo, descripcion, salario_min, salario_max, modalidad, ubicacion, habilidades_req, estado, publicada_at) VALUES
-- TechCorp
('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Desarrollador Full Stack Senior', 'Buscamos experto en Node y React', 5000, 8000, 'REMOTO', 'Lima', '["TypeScript", "React", "Node.js", "PostgreSQL"]', 'ACTIVA', NOW()),
('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'DevOps Engineer', 'Infraestructura como código', 6000, 9000, 'HIBRIDO', 'Lima', '["Docker", "Kubernetes", "AWS", "Linux"]', 'ACTIVA', NOW()),
('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Analista de Datos Junior', 'Minería de datos y visualización', 2500, 3500, 'PRESENCIAL', 'Lima', '["Python", "SQL", "Power BI"]', 'ACTIVA', NOW()),
-- Consultora Andina
('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000002', 'Consultor ERP SAP', 'Implementación de módulos financieros', 4000, 6000, 'PRESENCIAL', 'Trujillo', '["SAP", "Excel", "Análisis financiero"]', 'ACTIVA', NOW()),
('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'Gestor de Proyectos', 'Gestión bajo metodología PMI', 3500, 5000, 'HIBRIDO', 'Trujillo', '["Gestión de proyectos", "Excel", "Inglés B2"]', 'ACTIVA', NOW())
ON CONFLICT (id) DO NOTHING;

-- ─── 5. Postulaciones ───────────────────────────────────────────────────────
INSERT INTO postulaciones (id, egresado_id, oferta_id, estado, carta_presentacion) VALUES
-- Juan -> Full Stack (CONTRATADO)
('90000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'CONTRATADO', 'Me apasiona el desarrollo full stack'),
-- Juan -> DevOps (EN_REVISION)
('90000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'EN_REVISION', 'Tengo experiencia básica en Docker'),
-- María -> Analista Datos (ENTREVISTA)
('90000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'ENTREVISTA', 'Domino Power BI'),
-- María -> Gestor Proyectos (RECHAZADO)
('90000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', 'RECHAZADO', 'Interesada en la vacante'),
-- Roberto -> Consultor SAP (POSTULADO)
('90000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 'POSTULADO', 'Experto en SAP FI/CO')
ON CONFLICT (egresado_id, oferta_id) DO NOTHING;

-- ─── 6. Auditoría de Postulaciones ──────────────────────────────────────────
INSERT INTO postulacion_audit (postulacion_id, estado_anterior, estado_nuevo, cambiado_por) VALUES
-- Juan -> Full Stack Flow
('90000000-0000-0000-0000-000000000001', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000001'),
('90000000-0000-0000-0000-000000000001', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000001'),
('90000000-0000-0000-0000-000000000001', 'EN_REVISION', 'ENTREVISTA', 'b0000000-0000-0000-0000-000000000001'),
('90000000-0000-0000-0000-000000000001', 'ENTREVISTA', 'CONTRATADO', 'b0000000-0000-0000-0000-000000000001'),
-- Juan -> DevOps
('90000000-0000-0000-0000-000000000002', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000001'),
('90000000-0000-0000-0000-000000000002', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000001'),
-- María -> Analista Datos
('90000000-0000-0000-0000-000000000003', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000002'),
('90000000-0000-0000-0000-000000000003', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000001'),
('90000000-0000-0000-0000-000000000003', 'EN_REVISION', 'ENTREVISTA', 'b0000000-0000-0000-0000-000000000001'),
-- María -> Gestor Proyectos
('90000000-0000-0000-0000-000000000004', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000002'),
('90000000-0000-0000-0000-000000000004', 'POSTULADO', 'RECHAZADO', 'b0000000-0000-0000-0000-000000000002'),
-- Roberto -> SAP
('90000000-0000-0000-0000-000000000005', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000003');

-- ─── 7. Notificaciones ─────────────────────────────────────────────────────
INSERT INTO notificaciones (user_id, tipo, mensaje, metadata) VALUES
-- Cambio de estado Juan
('e0000000-0000-0000-0000-000000000001', 'CAMBIO_ESTADO', '¡Felicidades! Has sido contratado para Desarrollador Full Stack', '{"ofertaId": "c0000000-0000-0000-0000-000000000001", "estado": "CONTRATADO"}'),
-- Nueva oferta Roberto (SAP Match)
('e0000000-0000-0000-0000-000000000003', 'NUEVA_OFERTA', 'Nueva oferta de Consultor ERP SAP publicada', '{"ofertaId": "c0000000-0000-0000-0000-000000000004"}');

COMMIT;
