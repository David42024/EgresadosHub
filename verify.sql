-- ============================================================
-- SQL de Verificación de Esquema: Sistema de Egresados
-- ============================================================

\set QUIET on
\set ON_ERROR_STOP on

-- Tabla temporal para resultados
CREATE TEMP TABLE schema_results (
    check_name TEXT,
    status TEXT
);

-- ─── 1. Extensiones ───────────────────────────────────────────────────────────
INSERT INTO schema_results
SELECT 'Extensión: ' || extname, '✅' FROM pg_extension WHERE extname IN ('uuid-ossp', 'pg_trgm');
INSERT INTO schema_results
SELECT 'Extensión: uuid-ossp', '❌' WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp');
INSERT INTO schema_results
SELECT 'Extensión: pg_trgm', '❌' WHERE NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm');

-- ─── 2. Tablas ───────────────────────────────────────────────────────────────
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY['users', 'egresados', 'habilidades_catalogo', 'empresas', 'ofertas', 'postulaciones', 'postulacion_audit', 'notificaciones', 'reportes_jobs'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t) THEN
            INSERT INTO schema_results VALUES ('Tabla: ' || t, '✅');
        ELSE
            INSERT INTO schema_results VALUES ('Tabla: ' || t, '❌');
        END IF;
    END LOOP;
END $$;

-- ─── 3. Índices Críticos (GIN para JSONB) ────────────────────────────────────
INSERT INTO schema_results
SELECT 'Índice GIN: egresados_habilidades', CASE WHEN count(*) > 0 THEN '✅' ELSE '❌' END
FROM pg_indexes WHERE tablename = 'egresados' AND indexdef LIKE '%USING gin (habilidades)%';

INSERT INTO schema_results
SELECT 'Índice GIN: ofertas_habilidades', CASE WHEN count(*) > 0 THEN '✅' ELSE '❌' END
FROM pg_indexes WHERE tablename = 'ofertas' AND indexdef LIKE '%USING gin (habilidades_req)%';

INSERT INTO schema_results
SELECT 'Índice GIN: egresados_trgm', CASE WHEN count(*) > 0 THEN '✅' ELSE '❌' END
FROM pg_indexes WHERE tablename = 'egresados' AND indexdef LIKE '%gin_trgm_ops%';

-- ─── 4. Triggers (updated_at) ────────────────────────────────────────────────
DO $$ 
DECLARE 
    t TEXT;
    tables TEXT[] := ARRAY['users', 'egresados', 'empresas', 'ofertas', 'postulaciones'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (SELECT 1 FROM information_schema.triggers WHERE event_object_table = t AND trigger_name = 'trg_updated_at') THEN
            INSERT INTO schema_results VALUES ('Trigger: updated_at en ' || t, '✅');
        ELSE
            INSERT INTO schema_results VALUES ('Trigger: updated_at en ' || t, '❌');
        END IF;
    END LOOP;
END $$;

-- ─── 5. Foreign Keys (ON DELETE CASCADE) ─────────────────────────────────────
INSERT INTO schema_results
SELECT 'FK: ' || conname || ' (CASCADE)', '✅'
FROM pg_constraint 
WHERE contype = 'f' 
AND confdeltype = 'c' 
AND conname IN ('egresados_user_id_fkey', 'empresas_user_id_fkey', 'ofertas_empresa_id_fkey', 'postulaciones_egresado_id_fkey', 'postulaciones_oferta_id_fkey');

-- ─── Resumen Final ───────────────────────────────────────────────────────────
\echo '===================================================='
\echo '      RESULTADOS DE VERIFICACIÓN DE ESQUEMA         '
\echo '===================================================='
SELECT status || ' ' || check_name AS "Verificación" FROM schema_results ORDER BY status DESC, check_name;

\echo '----------------------------------------------------'
SELECT 
    (SELECT count(*) FROM schema_results WHERE status = '✅') AS "Pasados",
    (SELECT count(*) FROM schema_results WHERE status = '❌') AS "Fallidos",
    ROUND((SELECT count(*)::numeric FROM schema_results WHERE status = '✅') * 100 / (SELECT count(*)::numeric FROM schema_results), 1) || '%' AS "Éxito";

DROP TABLE schema_results;
\set QUIET off
