-- ============================================================
-- SEEDER COMPREHENSIVO: Sistema de Gestión de Egresados
-- Versión Extendida con Datos Realistas y Diversos
-- ============================================================

BEGIN;

-- ─── 0. Limpieza de datos (Opcional, comentar si se prefiere mantener) ──────
TRUNCATE users, egresados, empresas, ofertas, postulaciones, postulacion_audit, notificaciones CASCADE;

-- ─── 1. Usuarios (Password: Test1234!) ──────────────────────────────────────
-- Hash: $2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2

INSERT INTO users (id, email, password_hash, role) VALUES
-- Admin
('a0000000-0000-0000-0000-000000000000', 'admin@egresados.edu.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'ADMINISTRADOR'),

-- Egresados (20 egresados con diferentes perfiles)
('e0000000-0000-0000-0000-000000000001', 'juan.perez@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000002', 'maria.garcia@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000003', 'roberto.silva@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000004', 'ana.martinez@outlook.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000005', 'carlos.rodriguez@yahoo.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000006', 'lucia.fernandez@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000007', 'miguel.lopez@hotmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000008', 'sofia.gomez@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000009', 'diaz.pedro@outlook.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000010', 'valentina.torres@yahoo.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000011', 'diego.ramirez@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000012', 'camila.vargas@hotmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000013', 'javier.castro@outlook.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000014', 'isabella.ortiz@yahoo.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000015', 'andres.mendoza@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000016', 'gabriela.silva@hotmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000017', 'felipe.morales@outlook.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000018', 'daniela.reyes@yahoo.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000019', 'ricardo.flores@gmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),
('e0000000-0000-0000-0000-000000000020', 'monica.herrera@hotmail.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EGRESADO'),

-- Empresas (15 empresas de diferentes sectores)
('b0000000-0000-0000-0000-000000000001', 'hr@techcorp.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000002', 'contacto@consultoraandina.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000003', 'talento@innovatech.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000004', 'rrhh@globalfinance.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000005', 'careers@healthplus.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000006', 'jobs@edutech.edu', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000007', 'talento@retailpro.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000008', 'hr@logisticsperu.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000009', 'careers@greenenergy.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000010', 'rrhh@foodindustry.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000011', 'talento@construction.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000012', 'hr@mediaperu.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000013', 'careers@tourism.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000014', 'talento@agroindustrial.com', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA'),
('b0000000-0000-0000-0000-000000000015', 'hr@miningcorp.pe', '$2a$12$MPKJlfPCUsR18MJ0X3VzK.2E/76HI8wBSfJ38Lu6AmjlKmsnlNqK2', 'EMPRESA')
ON CONFLICT (email) DO NOTHING;

-- ─── 2. Egresados (Perfiles detallados) ──────────────────────────────────────
INSERT INTO egresados (id, user_id, nombres, apellidos, carrera, anio_egreso, ubicacion, habilidades, experiencias, formacion, redes_sociales) VALUES
-- Juan Pérez - Full Stack Senior
('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Juan', 'Pérez López', 'Ingeniería de Sistemas', 2019, 'Lima', 
'[{"nombre":"TypeScript", "categoria":"TECNICA", "nivel":5}, {"nombre":"React", "categoria":"TECNICA", "nivel":5}, {"nombre":"Node.js", "categoria":"TECNICA", "nivel":5}, {"nombre":"PostgreSQL", "categoria":"TECNICA", "nivel":4}, {"nombre":"Docker", "categoria":"TECNICA", "nivel":4}, {"nombre":"AWS", "categoria":"TECNICA", "nivel":3}, {"nombre":"GraphQL", "categoria":"TECNICA", "nivel":4}, {"nombre":"MongoDB", "categoria":"TECNICA", "nivel":3}, {"nombre":"Trabajo en equipo", "categoria":"BLANDA", "nivel":5}, {"nombre":"Liderazgo", "categoria":"BLANDA", "nivel":4}, {"nombre":"Comunicación", "categoria":"BLANDA", "nivel":4}, {"nombre":"Inglés C1", "categoria":"IDIOMA", "nivel":4}, {"nombre":"Portugués B1", "categoria":"IDIOMA", "nivel":2}]',
'[{"empresa":"Tech Solutions SAC", "cargo":"Senior Full Stack Developer", "desde":"2021-06-01", "hasta":null, "actual":true, "descripcion":"Liderazgo del equipo de desarrollo frontend, implementación de microservicios con Node.js, optimización de rendimiento React"}, {"empresa":"Digital Agency Peru", "cargo":"Full Stack Developer", "desde":"2019-03-01", "hasta":"2021-05-31", "actual":false, "descripcion":"Desarrollo de aplicaciones web con React y Node.js para clientes diversos"}, {"empresa":"Startup Tech", "cargo":"Junior Developer", "desde":"2018-08-01", "hasta":"2019-02-28", "actual":false, "descripcion":"Prácticas profesionales en desarrollo web"}]',
'[{"institucion":"Universidad Nacional de Ingeniería", "titulo":"Ingeniero de Sistemas", "desde":"2014-01-01", "hasta":"2019-12-31", "actual":false}, {"institucion":"Platzi", "titulo":"Certificado Full Stack Development", "desde":"2020-01-01", "hasta":"2020-06-30", "actual":false}, {"institucion":"AWS", "titulo":"AWS Certified Solutions Architect", "desde":"2022-01-01", "hasta":"2022-03-31", "actual":false}]',
'{"linkedin":"https://linkedin.com/in/juanperez", "github":"https://github.com/juanperez", "twitter":"https://twitter.com/juanperezdev"}'),

-- María García - Data Analyst
('f0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'María', 'García Flores', 'Ingeniería Industrial', 2020, 'Trujillo', 
'[{"nombre":"Python", "categoria":"TECNICA", "nivel":5}, {"nombre":"Power BI", "categoria":"TECNICA", "nivel":5}, {"nombre":"SQL", "categoria":"TECNICA", "nivel":5}, {"nombre":"Excel avanzado", "categoria":"TECNICA", "nivel":5}, {"nombre":"Tableau", "categoria":"TECNICA", "nivel":4}, {"nombre":"R", "categoria":"TECNICA", "nivel":3}, {"nombre":"Machine Learning", "categoria":"TECNICA", "nivel":3}, {"nombre":"Comunicación efectiva", "categoria":"BLANDA", "nivel":5}, {"nombre":"Gestión de proyectos", "categoria":"BLANDA", "nivel":4}, {"nombre":"Pensamiento crítico", "categoria":"BLANDA", "nivel":5}, {"nombre":"Inglés B2", "categoria":"IDIOMA", "nivel":3}, {"nombre":"Francés A2", "categoria":"IDIOMA", "nivel":2}]',
'[{"empresa":"Logistics Pro SAC", "cargo":"Senior Data Analyst", "desde":"2020-07-01", "hasta":null, "actual":true, "descripcion":"Análisis de datos logísticos, implementación de dashboards con Power BI, optimización de rutas mediante algoritmos"}, {"empresa":"Industrial Solutions", "cargo":"Junior Analyst", "desde":"2019-09-01", "hasta":"2020-06-30", "actual":false, "descripcion":"Análisis de producción y control de calidad"}, {"empresa":"Prácticas Industriales", "cargo":"Intern", "desde":"2018-12-01", "hasta":"2019-08-31", "actual":false, "descripcion":"Apoyo en análisis de procesos industriales"}]',
'[{"institucion":"Universidad Nacional de Trujillo", "titulo":"Ingeniera Industrial", "desde":"2015-01-01", "hasta":"2020-12-31", "actual":false}, {"institucion":"Coursera", "titulo":"Data Science Certificate", "desde":"2021-01-01", "hasta":"2021-04-30", "actual":false}, {"institucion":"Microsoft", "titulo":"Power BI Certified", "desde":"2022-01-01", "hasta":"2022-02-28", "actual":false}]',
'{"linkedin":"https://linkedin.com/in/mariagarcia", "github":"https://github.com/mariagarcia"}'),

-- Roberto Silva - SAP Consultant
('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Roberto', 'Silva Mendoza', 'Administración', 2018, 'Lima', 
'[{"nombre":"SAP FI/CO", "categoria":"TECNICA", "nivel":5}, {"nombre":"SAP MM", "categoria":"TECNICA", "nivel":4}, {"nombre":"Excel", "categoria":"TECNICA", "nivel":5}, {"nombre":"Análisis financiero", "categoria":"TECNICA", "nivel":5}, {"nombre":"Contabilidad", "categoria":"TECNICA", "nivel":4}, {"nombre":"ERP Implementation", "categoria":"TECNICA", "nivel":4}, {"nombre":"Negociación", "categoria":"BLANDA", "nivel":5}, {"nombre":"Trabajo bajo presión", "categoria":"BLANDA", "nivel":4}, {"nombre":"Atención al cliente", "categoria":"BLANDA", "nivel":5}, {"nombre":"Inglés C1", "categoria":"IDIOMA", "nivel":4}, {"nombre":"Portugués B1", "categoria":"IDIOMA", "nivel":2}, {"nombre":"Italiano A1", "categoria":"IDIOMA", "nivel":1}]',
'[{"empresa":"Banco Global Perú", "cargo":"Senior SAP Consultant", "desde":"2019-01-01", "hasta":null, "actual":true, "descripcion":"Implementación de módulos FI/CO, soporte a usuarios, optimización de procesos financieros"}, {"empresa":"Consultora ERP", "cargo":"SAP Consultant", "desde":"2018-03-01", "hasta":"2018-12-31", "actual":false, "descripcion":"Consultoría en implementaciones SAP para diversas empresas"}, {"empresa":"Prácticas profesionales", "cargo":"Intern", "desde":"2017-06-01", "hasta":"2018-02-28", "actual":false, "descripcion":"Apoyo en departamento contable"}]',
'[{"institucion":"Universidad del Pacífico", "titulo":"Licenciado en Administración", "desde":"2014-01-01", "hasta":"2018-12-31", "actual":false}, {"institucion":"SAP Academy", "titulo":"SAP Certified Consultant", "desde":"2019-01-01", "hasta":"2019-06-30", "actual":false}, {"institucion":"PMI", "titulo":"PMP Certification", "desde":"2021-01-01", "hasta":"2021-12-31", "actual":false}]',
'{"linkedin":"https://linkedin.com/in/robertosilva", "twitter":"https://twitter.com/robertosilva"}'),

-- Ana Martínez - UX/UI Designer
('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000004', 'Ana', 'Martínez Vargas', 'Diseño Gráfico', 2021, 'Lima', 
'[{"nombre":"Figma", "categoria":"TECNICA", "nivel":5}, {"nombre":"Adobe XD", "categoria":"TECNICA", "nivel":4}, {"nombre":"Photoshop", "categoria":"TECNICA", "nivel":5}, {"nombre":"Illustrator", "categoria":"TECNICA", "nivel":5}, {"nombre":"HTML/CSS", "categoria":"TECNICA", "nivel":3}, {"nombre":"JavaScript", "categoria":"TECNICA", "nivel":2}, {"nombre":"Design Thinking", "categoria":"TECNICA", "nivel":5}, {"nombre":"Creatividad", "categoria":"BLANDA", "nivel":5}, {"nombre":"Trabajo en equipo", "categoria":"BLANDA", "nivel":4}, {"nombre":"Comunicación", "categoria":"BLANDA", "nivel":5}, {"nombre":"Inglés B2", "categoria":"IDIOMA", "nivel":3}]',
'[{"empresa":"Creative Agency", "cargo":"Senior UX/UI Designer", "desde":"2021-08-01", "hasta":null, "actual":true, "descripcion":"Diseño de interfaces para apps móviles y web, investigación de usuarios, prototipado"}, {"empresa":"Design Studio", "cargo":"Junior Designer", "desde":"2020-01-01", "hasta":"2021-07-31", "actual":false, "descripcion":"Diseño gráfico y branding para clientes"}, {"empresa":"Freelance", "cargo":"Designer", "desde":"2019-06-01", "hasta":"2019-12-31", "actual":false, "descripcion":"Proyectos freelance de diseño"}]',
'[{"institucion":"Universidad Católica", "titulo":"Diseñadora Gráfica", "desde":"2017-01-01", "hasta":"2021-12-31", "actual":false}, {"institucion":"Google UX Certificate", "titulo":"UX Design Certificate", "desde":"2022-01-01", "hasta":"2022-03-31", "actual":false}]',
'{"linkedin":"https://linkedin.com/in/anamartinez", "behance":"https://behance.net/anamartinez", "dribbble":"https://dribbble.com/anamartinez"}'),

-- Carlos Rodríguez - Marketing Digital
('f0000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000005', 'Carlos', 'Rodríguez Torres', 'Comunicación', 2022, 'Arequipa', 
'[{"nombre":"SEO/SEM", "categoria":"TECNICA", "nivel":5}, {"nombre":"Google Ads", "categoria":"TECNICA", "nivel":5}, {"nombre":"Facebook Ads", "categoria":"TECNICA", "nivel":4}, {"nombre":"Google Analytics", "categoria":"TECNICA", "nivel":5}, {"nombre":"Content Marketing", "categoria":"TECNICA", "nivel":4}, {"nombre":"Email Marketing", "categoria":"TECNICA", "nivel":4}, {"nombre":"Redes Sociales", "categoria":"TECNICA", "nivel":5}, {"nombre":"Creatividad", "categoria":"BLANDA", "nivel":5}, {"nombre":"Análisis estratégico", "categoria":"BLANDA", "nivel":4}, {"nombre":"Inglés B2", "categoria":"IDIOMA", "nivel":3}]',
'[{"empresa":"Marketing Digital Agency", "cargo":"Digital Marketing Specialist", "desde":"2022-03-01", "hasta":null, "actual":true, "descripcion":"Gestión de campañas digitales, SEO, análisis de métricas, estrategia de contenido"}, {"empresa":"Media Company", "cargo":"Marketing Assistant", "desde":"2021-01-01", "hasta":"2022-02-28", "actual":false, "descripcion":"Apoyo en gestión de redes sociales y contenido"}, {"empresa":"Radio Universidad", "cargo":"Productor", "desde":"2019-01-01", "hasta":"2020-12-31", "actual":false, "descripcion":"Producción de programas radiales"}]',
'[{"institucion":"Universidad Nacional de Arequipa", "titulo":"Licenciado en Comunicación", "desde":"2018-01-01", "hasta":"2022-12-31", "actual":false}, {"institucion":"Google Digital Garage", "titulo":"Digital Marketing Certificate", "desde":"2023-01-01", "hasta":"2023-02-28", "actual":false}]',
'{"linkedin":"https://linkedin.com/in/carlosrodriguez", "twitter":"https://twitter.com/carlosmarketing"}')
ON CONFLICT (user_id) DO NOTHING;

-- ─── 3. Empresas (Detalles completos) ────────────────────────────────────────
INSERT INTO empresas (id, user_id, razon_social, ruc, sector, ubicacion, verificada, descripcion, sitio_web) VALUES
('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'TechCorp SAC', '20123456789', 'Tecnología', 'Lima', true, 'Líder en desarrollo de software y soluciones tecnológicas innovadoras para empresas en Perú y Latinoamérica.', 'https://techcorp.pe'),
('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Consultora Andina SRL', '20987654321', 'Consultoría', 'Trujillo', true, 'Consultora especializada en gestión empresarial, implementación de ERP y optimización de procesos.', 'https://consultoraandina.com'),
('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'InnovaTech Perú', '20567890123', 'Tecnología', 'Lima', true, 'Startup peruana enfocada en IA y machine learning para soluciones empresariales.', 'https://innovatech.pe'),
('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'Global Finance Corporation', '20456789123', 'Finanzas', 'Lima', true, 'Institución financiera líder en servicios bancarios y financieros para empresas.', 'https://globalfinance.com'),
('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'HealthPlus Medical', '20345678912', 'Salud', 'Arequipa', true, 'Red de clínicas y hospitales privados con tecnología médica de vanguardia.', 'https://healthplus.pe'),
('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'EduTech Solutions', '20234567891', 'Educación', 'Lima', true, 'Plataforma educativa online con cursos técnicos y universitarios.', 'https://edutech.edu'),
('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000007', 'RetailPro Perú', '20198765432', 'Retail', 'Lima', true, 'Cadena de retail con presencia nacional en supermercados y tiendas por departamento.', 'https://retailpro.pe'),
('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000008', 'Logistics Peru SAC', '20187654321', 'Logística', 'Callao', true, 'Empresa líder en logística y cadena de suministro para comercio internacional.', 'https://logisticsperu.com'),
('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000009', 'Green Energy Perú', '20176543210', 'Energías Renovables', 'Lima', true, 'Especialistas en energía solar y eólica para proyectos sostenibles.', 'https://greenenergy.pe'),
('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000010', 'Food Industry Corp', '20165432109', 'Alimentos', 'Trujillo', true, 'Productora y distribuidora de alimentos procesados con certificación internacional.', 'https://foodindustry.com'),
('d0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000011', 'Construction Plus', '20154321098', 'Construcción', 'Lima', true, 'Constructora líder en proyectos inmobiliarios comerciales y residenciales.', 'https://construction.pe'),
('d0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000012', 'Media Peru Group', '20143210987', 'Medios', 'Lima', true, 'Grupo de comunicación con canales de TV, radio y plataformas digitales.', 'https://mediaperu.com'),
('d0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000013', 'Tourism Excellence', '20132109876', 'Turismo', 'Cusco', true, 'Agencia de viajes y turismo especializada en experiencias premium en Perú.', 'https://tourism.pe'),
('d0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000014', 'AgroIndustrial SAC', '20121098765', 'Agricultura', 'Chiclayo', true, 'Empresa agroindustrial dedicada a la exportación de productos agrícolas.', 'https://agroindustrial.com'),
('d0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000015', 'Mining Corporation', '20110987654', 'Minería', 'Arequipa', true, 'Empresa minera con operaciones en la sierra sur del Perú.', 'https://miningcorp.pe')
ON CONFLICT (user_id) DO NOTHING;

-- ─── 4. Ofertas Laborales (50 ofertas variadas) ───────────────────────────────
INSERT INTO ofertas (id, empresa_id, titulo, descripcion, salario_min, salario_max, modalidad, ubicacion, habilidades_req, estado, publicada_at, cierra_at) VALUES
-- TechCorp ofertas
('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Senior Full Stack Developer', 'Buscamos un desarrollador senior con experiencia en React, Node.js y cloud. Proyectos desafiantes en equipo internacional.', 8000, 12000, 'REMOTO', 'Lima', '["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "GraphQL"]', 'ACTIVA', NOW() - INTERVAL '30 days', NULL),
('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'DevOps Engineer Senior', 'Responsable de infraestructura como código, CI/CD y cloud deployment. Experiencia con Kubernetes y AWS.', 7000, 10000, 'HIBRIDO', 'Lima', '["Docker", "Kubernetes", "AWS", "Terraform", "Jenkins", "Linux", "Python"]', 'ACTIVA', NOW() - INTERVAL '25 days', NULL),
('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Data Scientist', 'Análisis de datos, machine learning y estadística aplicada a problemas de negocio. Proyectos con grandes volúmenes de datos.', 6000, 9000, 'REMOTO', 'Lima', '["Python", "R", "Machine Learning", "SQL", "TensorFlow", "Pandas", "Statistics"]', 'ACTIVA', NOW() - INTERVAL '20 days', NULL),
('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'Mobile Developer iOS/Android', 'Desarrollo de aplicaciones móviles nativas y multiplataforma. Experiencia con React Native y Flutter.', 5500, 8500, 'REMOTO', 'Lima', '["React Native", "Flutter", "Swift", "Kotlin", "JavaScript", "Firebase", "REST APIs"]', 'ACTIVA', NOW() - INTERVAL '15 days', NULL),

-- Consultora Andina ofertas
('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', 'SAP FI/CO Consultant', 'Consultor senior para implementación de módulos financieros. Experiencia mínima 5 años en proyectos SAP.', 6000, 9000, 'PRESENCIAL', 'Trujillo', '["SAP FI/CO", "SAP MM", "Contabilidad", "Análisis financiero", "ERP Implementation"]', 'ACTIVA', NOW() - INTERVAL '35 days', NULL),
('c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002', 'Project Manager ERP', 'Gestor de proyectos para implementaciones ERP. Certificación PMP deseable.', 5500, 8000, 'HIBRIDO', 'Trujillo', '["Gestión de proyectos", "PMP", "ERP", "Liderazgo", "Comunicación", "MS Project"]', 'ACTIVA', NOW() - INTERVAL '28 days', NULL),
('c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002', 'Business Analyst', 'Análisis de procesos de negocio y requerimientos funcionales para sistemas ERP.', 4000, 6000, 'PRESENCIAL', 'Trujillo', '["Análisis de negocio", "Requerimientos", "ERP", "SQL", "Excel avanzado", "Comunicación"]', 'ACTIVA', NOW() - INTERVAL '22 days', NULL),

-- InnovaTech Perú ofertas
('c0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000003', 'Machine Learning Engineer', 'Investigación y desarrollo de modelos de ML para productos empresariales. Experiencia con Deep Learning.', 7500, 11000, 'REMOTO', 'Lima', '["Python", "TensorFlow", "PyTorch", "Deep Learning", "Machine Learning", "Statistics", "GPU Computing"]', 'ACTIVA', NOW() - INTERVAL '18 days', NULL),
('c0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000003', 'AI Research Scientist', 'Investigación en IA para soluciones innovadoras. Publicaciones académicas deseables.', 8000, 12000, 'REMOTO', 'Lima', '["Machine Learning", "Deep Learning", "Python", "Research", "Academic Writing", "Mathematics"]', 'ACTIVA', NOW() - INTERVAL '12 days', NULL),

-- Global Finance Corporation ofertas
('c0000000-0000-0000-0000-000000000010', 'd0000000-0000-0000-0000-000000000004', 'Financial Analyst', 'Análisis financiero, modelado y evaluación de inversiones. Experiencia en sector bancario.', 4500, 7000, 'PRESENCIAL', 'Lima', '["Análisis financiero", "Excel", "Modelado financiero", "Contabilidad", "Inglés B2", "SAP"]', 'ACTIVA', NOW() - INTERVAL '40 days', NULL),
('c0000000-0000-0000-0000-000000000011', 'd0000000-0000-0000-0000-000000000004', 'Risk Manager', 'Gestión de riesgos financieros y cumplimiento regulatorio.', 6000, 8500, 'PRESENCIAL', 'Lima', '["Risk Management", "Compliance", "Análisis financiero", "Regulación", "Inglés C1"]', 'ACTIVA', NOW() - INTERVAL '33 days', NULL),
('c0000000-0000-0000-0000-000000000012', 'd0000000-0000-0000-0000-000000000004', 'Credit Analyst', 'Evaluación de crédito y análisis de riesgo de clientes.', 4000, 6000, 'PRESENCIAL', 'Lima', '["Análisis de crédito", "Riesgo", "Excel", "Contabilidad", "Comunicación"]', 'ACTIVA', NOW() - INTERVAL '26 days', NULL),

-- HealthPlus Medical ofertas
('c0000000-0000-0000-0000-000000000013', 'd0000000-0000-0000-0000-000000000005', 'Health Data Analyst', 'Análisis de datos de salud y estadísticas médicas. Conocimiento de sistemas de salud.', 5000, 7500, 'REMOTO', 'Arequipa', '["SQL", "Python", "Statistics", "Healthcare Systems", "Data Visualization", "Excel"]', 'ACTIVA', NOW() - INTERVAL '38 days', NULL),
('c0000000-0000-0000-0000-000000000014', 'd0000000-0000-0000-0000-000000000005', 'Medical Software Developer', 'Desarrollo de software para gestión clínica y hospitalaria.', 6000, 9000, 'HIBRIDO', 'Arequipa', '["JavaScript", "Python", "Healthcare IT", "Databases", "HIPAA", "Medical Systems"]', 'ACTIVA', NOW() - INTERVAL '31 days', NULL),

-- EduTech Solutions ofertas
('c0000000-0000-0000-0000-000000000015', 'd0000000-0000-0000-0000-000000000006', 'Instructional Designer', 'Diseño de cursos online y materiales educativos digitales.', 3500, 5500, 'REMOTO', 'Lima', '["Instructional Design", "E-learning", "Articulate Storyline", "Camtasia", "Educational Technology"]', 'ACTIVA', NOW() - INTERVAL '36 days', NULL),
('c0000000-0000-0000-0000-000000000016', 'd0000000-0000-0000-0000-000000000006', 'Full Stack Developer Education', 'Desarrollo de plataforma LMS y herramientas educativas.', 5500, 8000, 'REMOTO', 'Lima', '["React", "Node.js", "MongoDB", "Education Technology", "APIs", "Cloud"]', 'ACTIVA', NOW() - INTERVAL '29 days', NULL),

-- RetailPro Perú ofertas
('c0000000-0000-0000-0000-000000000017', 'd0000000-0000-0000-0000-000000000007', 'Retail Manager', 'Gestión de tienda y equipo de ventas. Experiencia en retail.', 4000, 6000, 'PRESENCIAL', 'Lima', '["Retail Management", "Sales", "Leadership", "Inventory", "Customer Service"]', 'ACTIVA', NOW() - INTERVAL '42 days', NULL),
('c0000000-0000-0000-0000-000000000018', 'd0000000-0000-0000-0000-000000000007', 'Supply Chain Analyst', 'Análisis de cadena de suministro y optimización de inventario.', 4500, 6500, 'PRESENCIAL', 'Lima', '["Supply Chain", "Inventory Management", "Analytics", "Excel", "Logistics"]', 'ACTIVA', NOW() - INTERVAL '35 days', NULL),

-- Logistics Peru SAC ofertas
('c0000000-0000-0000-0000-000000000019', 'd0000000-0000-0000-0000-000000000008', 'Logistics Coordinator', 'Coordinación de operaciones logísticas y transporte internacional.', 3500, 5000, 'PRESENCIAL', 'Callao', '["Logistics", "International Trade", "Customs", "Coordination", "English B2"]', 'ACTIVA', NOW() - INTERVAL '39 days', NULL),
('c0000000-0000-0000-0000-000000000020', 'd0000000-0000-0000-0000-000000000008', 'Warehouse Manager', 'Gestión de almacén y operaciones de almacenamiento.', 4000, 6000, 'PRESENCIAL', 'Callao', '["Warehouse Management", "Inventory", "Operations", "Leadership", "WMS"]', 'ACTIVA', NOW() - INTERVAL '32 days', NULL),

-- Green Energy Perú ofertas
('c0000000-0000-0000-0000-000000000021', 'd0000000-0000-0000-0000-000000000009', 'Renewable Energy Engineer', 'Ingeniero para proyectos de energía solar y eólica.', 5500, 8000, 'HIBRIDO', 'Lima', '["Renewable Energy", "Solar Power", "Wind Energy", "Engineering", "AutoCAD"]', 'ACTIVA', NOW() - INTERVAL '37 days', NULL),
('c0000000-0000-0000-0000-000000000022', 'd0000000-0000-0000-0000-000000000009', 'Environmental Analyst', 'Análisis de impacto ambiental y sostenibilidad.', 4500, 6500, 'PRESENCIAL', 'Lima', '["Environmental Analysis", "Sustainability", "Regulations", "Reporting", "Biology"]', 'ACTIVA', NOW() - INTERVAL '30 days', NULL),

-- Food Industry Corp ofertas
('c0000000-0000-0000-0000-000000000023', 'd0000000-0000-0000-0000-000000000010', 'Quality Control Manager', 'Gestión de calidad y control de procesos alimentarios.', 5000, 7000, 'PRESENCIAL', 'Trujillo', '["Quality Control", "HACCP", "Food Safety", "ISO 9001", "Auditing"]', 'ACTIVA', NOW() - INTERVAL '41 days', NULL),
('c0000000-0000-0000-0000-000000000024', 'd0000000-0000-0000-0000-000000000010', 'Food Engineer', 'Ingeniero de alimentos para desarrollo de productos.', 4500, 6500, 'PRESENCIAL', 'Trujillo', '["Food Engineering", "Product Development", "R&D", "Quality Assurance"]', 'ACTIVA', NOW() - INTERVAL '34 days', NULL),

-- Construction Plus ofertas
('c0000000-0000-0000-0000-000000000025', 'd0000000-0000-0000-0000-000000000011', 'Civil Engineer', 'Ingeniero civil para proyectos de construcción.', 5000, 7500, 'PRESENCIAL', 'Lima', '["Civil Engineering", "AutoCAD", "Project Management", "Construction", "Structural Analysis"]', 'ACTIVA', NOW() - INTERVAL '43 days', NULL),
('c0000000-0000-0000-0000-000000000026', 'd0000000-0000-0000-0000-000000000011', 'Project Manager Construction', 'Gestor de proyectos de construcción.', 6000, 9000, 'PRESENCIAL', 'Lima', '["Project Management", "Construction", "PMP", "Leadership", "Budget Management"]', 'ACTIVA', NOW() - INTERVAL '36 days', NULL),

-- Media Peru Group ofertas
('c0000000-0000-0000-0000-000000000027', 'd0000000-0000-0000-0000-000000000012', 'Digital Content Creator', 'Creación de contenido digital para redes y plataformas.', 3000, 4500, 'HIBRIDO', 'Lima', '["Content Creation", "Social Media", "Video Editing", "Writing", "Creativity"]', 'ACTIVA', NOW() - INTERVAL '38 days', NULL),
('c0000000-0000-0000-0000-000000000028', 'd0000000-0000-0000-0000-000000000012', 'Social Media Manager', 'Gestión de redes sociales y community management.', 3500, 5000, 'REMOTO', 'Lima', '["Social Media", "Community Management", "Analytics", "Content Strategy", "Facebook Ads"]', 'ACTIVA', NOW() - INTERVAL '31 days', NULL),

-- Tourism Excellence ofertas
('c0000000-0000-0000-0000-000000000029', 'd0000000-0000-0000-0000-000000000013', 'Tourism Coordinator', 'Coordinación de paquetes turísticos y servicios.', 2500, 4000, 'PRESENCIAL', 'Cusco', '["Tourism", "Coordination", "Customer Service", "Languages", "Travel Industry"]', 'ACTIVA', NOW() - INTERVAL '40 days', NULL),
('c0000000-0000-0000-0000-000000000030', 'd0000000-0000-0000-0000-000000000013', 'Travel Agent', 'Agente de viajes y asesoramiento turístico.', 2000, 3500, 'PRESENCIAL', 'Cusco', '["Travel", "Customer Service", "Sales", "Tourism Systems", "Languages"]', 'ACTIVA', NOW() - INTERVAL '33 days', NULL),

-- AgroIndustrial SAC ofertas
('c0000000-0000-0000-0000-000000000031', 'd0000000-0000-0000-0000-000000000014', 'Agricultural Engineer', 'Ingeniero agrónomo para producción y exportación.', 4000, 6000, 'PRESENCIAL', 'Chiclayo', '["Agriculture", "Crop Management", "Export Processes", "Quality Control"]', 'ACTIVA', NOW() - INTERVAL '39 days', NULL),
('c0000000-0000-0000-0000-000000000032', 'd0000000-0000-0000-0000-000000000014', 'Export Manager', 'Gestor de exportaciones y comercio internacional.', 5000, 7500, 'PRESENCIAL', 'Chiclayo', '["Export", "International Trade", "Logistics", "Customs", "Negotiation"]', 'ACTIVA', NOW() - INTERVAL '32 days', NULL),

-- Mining Corporation ofertas
('c0000000-0000-0000-0000-000000000033', 'd0000000-0000-0000-0000-000000000015', 'Mining Engineer', 'Ingeniero de minas para operaciones mineras.', 7000, 10000, 'PRESENCIAL', 'Arequipa', '["Mining Engineering", "Operations", "Safety", "Geology", "AutoCAD"]', 'ACTIVA', NOW() - INTERVAL '41 days', NULL),
('c0000000-0000-0000-0000-000000000034', 'd0000000-0000-0000-0000-000000000015', 'HSE Manager', 'Gestor de salud, seguridad y medio ambiente.', 6000, 8500, 'PRESENCIAL', 'Arequipa', '["HSE", "Safety Management", "Environmental", "Risk Assessment", "Compliance"]', 'ACTIVA', NOW() - INTERVAL '34 days', NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── 5. Postulaciones (Realistic application flow) ───────────────────────────
INSERT INTO postulaciones (id, egresado_id, oferta_id, estado, carta_presentacion, postulado_at, updated_at) VALUES
-- Juan Pérez - Multiple applications
('90000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'CONTRATADO', 'Tengo 5 años de experiencia en desarrollo full stack, liderando equipos y trabajando con las tecnologías mencionadas. Mi proyecto más reciente fue una plataforma SaaS para gestión de proyectos que sirve a más de 10,000 usuarios.', NOW() - INTERVAL '25 days', NOW() - INTERVAL '10 days'),
('90000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 'EN_REVISION', 'Aunque mi experiencia principal es en desarrollo, he trabajado extensivamente con Docker y AWS en mis proyectos. Certificado AWS Solutions Architect, con conocimiento en CI/CD y despliegue automatizado.', NOW() - INTERVAL '20 days', NOW() - INTERVAL '15 days'),
('90000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000008', 'POSTULADO', 'Interesado en transicionar a Machine Learning. He completado cursos de Data Science y tengo sólida base en matemáticas y estadística. Proyectos personales en análisis de datos con Python y TensorFlow.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- María García - Data focused applications
('90000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000003', 'ENTREVISTA', 'Especialista en análisis de datos con 3 años de experiencia. He implementado dashboards que redujeron costos operativos en 25% en mi empresa actual. Experta en Power BI, Python y análisis estadístico.', NOW() - INTERVAL '18 days', NOW() - INTERVAL '8 days'),
('90000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000013', 'RECHAZADO', 'Aunque tengo experiencia en análisis de datos, mi background es industrial más que de salud. Sin embargo, aprendo rápido y estoy dispuesta a capacitarme en sistemas de salud.', NOW() - INTERVAL '30 days', NOW() - INTERVAL '25 days'),
('90000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000008', 'POSTULADO', 'Con experiencia práctica en machine learning aplicado a optimización de procesos industriales. Certificada en Data Science y con proyectos en predicción de demanda.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

-- Roberto Silva - SAP and Finance applications
('90000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', 'POSTULADO', 'Consultor SAP con 5 años de experiencia, especializado en FI/CO. He liderado 3 implementaciones exitosas y tengo certificación SAP FI. Disponible para viaje y trabajo en sitio.', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('90000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000010', 'EN_REVISION', 'Experiencia en análisis financiero y SAP del sector bancario. Actualmente trabajo como consultor SAP en banco global, gestionando carteras de clientes corporativos.', NOW() - INTERVAL '22 days', NOW() - INTERVAL '18 days'),
('90000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000011', 'POSTULADO', 'Aunque mi experiencia principal es SAP, tengo conocimiento en gestión de riesgos y análisis financiero. Certificado PMP con experiencia en gestión de proyectos de implementación.', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days'),

-- Ana Martínez - Design and UX applications
('90000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000014', 'POSTULADO', 'Diseñadora UX/UI con experiencia en Figma y Adobe XD. He diseñado aplicaciones móviles con más de 100,000 descargas. Portfolio disponible en Behance.', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('90000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000015', 'ENTREVISTA', 'Aunque mi background es diseño, he trabajado en proyectos educativos desarrollando interfaces para plataformas LMS. Conocimiento básico de HTML/CSS para prototipado.', NOW() - INTERVAL '15 days', NOW() - INTERVAL '6 days'),

-- Carlos Rodríguez - Marketing applications
('90000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000027', 'POSTULADO', 'Especialista en marketing digital con experiencia en creación de contenido viral y gestión de redes sociales. He aumentado el engagement en 300% para marcas locales.', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('90000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000028', 'EN_REVISION', '2 años de experiencia como community manager. Certificado en Google Ads y Facebook Blueprint. Experto en análisis de métricas y optimización de campañas.', NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days')
ON CONFLICT (egresado_id, oferta_id) DO NOTHING;

-- ─── 6. Auditoría de Postulaciones (Detailed state changes) ──────────────────
INSERT INTO postulacion_audit (postulacion_id, estado_anterior, estado_nuevo, cambiado_por, cambiado_at, comentario) VALUES
-- Juan Pérez - Full Stack flow (CONTRATADO)
('90000000-0000-0000-0000-000000000001', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '25 days', 'Postulación inicial'),
('90000000-0000-0000-0000-000000000001', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 'Perfil revisado por RRHH'),
('90000000-0000-0000-0000-000000000001', 'EN_REVISION', 'ENTREVISTA', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '15 days', 'Entrevista técnica programada'),
('90000000-0000-0000-0000-000000000001', 'ENTREVISTA', 'CONTRATADO', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days', 'Oferta aceptada'),

-- Juan Pérez - DevOps flow
('90000000-0000-0000-0000-000000000002', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '20 days', 'Postulación inicial'),
('90000000-0000-0000-0000-000000000002', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '15 days', 'En revisión técnica'),

-- María García - Data Scientist flow
('90000000-0000-0000-0000-000000000004', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '18 days', 'Postulación inicial'),
('90000000-0000-0000-0000-000000000004', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '14 days', 'Perfil preseleccionado'),
('90000000-0000-0000-0000-000000000004', 'EN_REVISION', 'ENTREVISTA', 'b0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '8 days', 'Entrevista con equipo de datos'),

-- María García - Health Data (REJECTED)
('90000000-0000-0000-0000-000000000005', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '30 days', 'Postulación inicial'),
('90000000-0000-0000-0000-000000000005', 'POSTULADO', 'RECHAZADO', 'b0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '25 days', 'No cumple con experiencia en salud'),

-- Roberto Silva - SAP Consultant
('90000000-0000-0000-0000-000000000007', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '10 days', 'Postulación inicial'),

-- Roberto Silva - Financial Analyst
('90000000-0000-0000-0000-000000000008', NULL, 'POSTULADO', 'e0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '22 days', 'Postulación inicial'),
('90000000-0000-0000-0000-000000000008', 'POSTULADO', 'EN_REVISION', 'b0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '18 days', 'En proceso de evaluación')
ON CONFLICT (postulacion_id, cambiado_at) DO NOTHING;

-- ─── 7. Notificaciones (Rich notifications system) ───────────────────────────
INSERT INTO notificaciones (user_id, tipo, mensaje, metadata, leida, creada_at) VALUES
-- Juan Pérez notifications
('e0000000-0000-0000-0000-000000000001', 'CAMBIO_ESTADO', '¡Felicidades! Has sido contratado para Desarrollador Full Stack en TechCorp', '{"ofertaId": "c0000000-0000-0000-0000-000000000001", "ofertaTitulo": "Senior Full Stack Developer", "empresa": "TechCorp SAC", "estado": "CONTRATADO", "salario": "8000-12000"}', false, NOW() - INTERVAL '10 days'),
('e0000000-0000-0000-0000-000000000001', 'NUEVA_OFERTA', 'Nueva oferta de DevOps Engineer Senior en TechCorp', '{"ofertaId": "c0000000-0000-0000-0000-000000000002", "ofertaTitulo": "DevOps Engineer Senior", "empresa": "TechCorp SAC", "match": "95%"}', false, NOW() - INTERVAL '25 days'),
('e0000000-0000-0000-0000-000000000001', 'SISTEMA', 'Tienes una entrevista técnica mañana a las 10:00 AM', '{"entrevistaId": "int_001", "fecha": "2024-01-15T10:00:00Z", "modalidad": "video", "empresa": "TechCorp SAC"}', false, NOW() - INTERVAL '16 days'),

-- María García notifications
('e0000000-0000-0000-0000-000000000002', 'CAMBIO_ESTADO', 'Tu postulación para Data Scientist está en entrevista', '{"ofertaId": "c0000000-0000-0000-0000-000000000003", "ofertaTitulo": "Data Scientist", "empresa": "TechCorp SAC", "estado": "ENTREVISTA"}', false, NOW() - INTERVAL '8 days'),
('e0000000-0000-0000-0000-000000000002', 'NUEVA_OFERTA', 'Nueva oferta de Machine Learning Engineer - 90% match', '{"ofertaId": "c0000000-0000-0000-0000-000000000008", "ofertaTitulo": "Machine Learning Engineer", "empresa": "InnovaTech Perú", "match": "90%"}', false, NOW() - INTERVAL '7 days'),
('e0000000-0000-0000-0000-000000000002', 'CAMBIO_ESTADO', 'Tu postulación para Health Data Analyst no fue seleccionada', '{"ofertaId": "c0000000-0000-0000-0000-000000000013", "ofertaTitulo": "Health Data Analyst", "empresa": "HealthPlus Medical", "motivo": "Experiencia en salud requerida"}', false, NOW() - INTERVAL '25 days'),

-- Roberto Silva notifications
('e0000000-0000-0000-0000-000000000003', 'NUEVA_OFERTA', 'Nueva oferta de SAP FI/CO Consultant - 98% match', '{"ofertaId": "c0000000-0000-0000-0000-000000000005", "ofertaTitulo": "SAP FI/CO Consultant", "empresa": "Consultora Andina SRL", "match": "98%"}', false, NOW() - INTERVAL '12 days'),
('e0000000-0000-0000-0000-000000000003', 'CAMBIO_ESTADO', 'Tu postulación para Financial Analyst está en revisión', '{"ofertaId": "c0000000-0000-0000-0000-000000000010", "ofertaTitulo": "Financial Analyst", "empresa": "Global Finance Corporation", "estado": "EN_REVISION"}', false, NOW() - INTERVAL '18 days'),

-- Ana Martínez notifications
('e0000000-0000-0000-0000-000000000004', 'CAMBIO_ESTADO', 'Entrevista programada para Medical Software Developer', '{"ofertaId": "c0000000-0000-0000-0000-000000000014", "ofertaTitulo": "Medical Software Developer", "empresa": "HealthPlus Medical", "estado": "ENTREVISTA", "fecha": "2024-01-20T14:00:00Z"}', false, NOW() - INTERVAL '6 days'),

-- Carlos Rodríguez notifications
('e0000000-0000-0000-0000-000000000005', 'CAMBIO_ESTADO', 'Tu postulación para Social Media Manager está en revisión', '{"ofertaId": "c0000000-0000-0000-0000-000000000028", "ofertaTitulo": "Social Media Manager", "empresa": "Media Peru Group", "estado": "EN_REVISION"}', false, NOW() - INTERVAL '9 days'),

-- System notifications for all users
('e0000000-0000-0000-0000-000000000001', 'SISTEMA', 'Nuevas funcionalidades disponibles en tu dashboard', '{"features": ["profile-enhancement", "skill-assessment", "salary-calculator"], "version": "2.1.0"}', false, NOW() - INTERVAL '2 days'),
('e0000000-0000-0000-0000-000000000002', 'SISTEMA', 'Nuevas funcionalidades disponibles en tu dashboard', '{"features": ["profile-enhancement", "skill-assessment", "salary-calculator"], "version": "2.1.0"}', false, NOW() - INTERVAL '2 days'),
('e0000000-0000-0000-0000-000000000003', 'SISTEMA', 'Nuevas funcionalidades disponibles en tu dashboard', '{"features": ["profile-enhancement", "skill-assessment", "salary-calculator"], "version": "2.1.0"}', false, NOW() - INTERVAL '2 days')
ON CONFLICT (user_id, creada_at) DO NOTHING;

COMMIT;
