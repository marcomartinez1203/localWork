-- ============================================
-- Migración: Sistema de Calificaciones Post-Servicio
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Nuevos campos en tabla ratings
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE CASCADE;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS rating_type VARCHAR(20) NOT NULL DEFAULT 'general' CHECK (rating_type IN ('general', 'post_service'));
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS punctuality SMALLINT CHECK (punctuality BETWEEN 1 AND 5);
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS quality SMALLINT CHECK (quality BETWEEN 1 AND 5);
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS communication SMALLINT CHECK (communication BETWEEN 1 AND 5);
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS would_recommend BOOLEAN;
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS is_visible BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Índice único: un usuario solo califica una vez por postulación
CREATE UNIQUE INDEX IF NOT EXISTS ratings_unique_application_rater
ON ratings (application_id, rater_id)
WHERE application_id IS NOT NULL;

-- 3. Índice para consultas de calificaciones por postulación
CREATE INDEX IF NOT EXISTS idx_ratings_application_id ON ratings(application_id) WHERE application_id IS NOT NULL;

-- 4. Actualizar función avg_rating para considerar solo visibles
CREATE OR REPLACE FUNCTION avg_rating(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0)
  FROM ratings
  WHERE rated_id = p_user_id
    AND is_visible = TRUE;
$$;

-- 5. Función para obtener desglose de calificaciones
CREATE OR REPLACE FUNCTION rating_breakdown(p_user_id UUID)
RETURNS TABLE(
  avg_score NUMERIC,
  avg_punctuality NUMERIC,
  avg_quality NUMERIC,
  avg_communication NUMERIC,
  total_ratings BIGINT,
  recommend_pct NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    COALESCE(ROUND(AVG(score)::numeric, 1), 0) AS avg_score,
    COALESCE(ROUND(AVG(punctuality)::numeric, 1), 0) AS avg_punctuality,
    COALESCE(ROUND(AVG(quality)::numeric, 1), 0) AS avg_quality,
    COALESCE(ROUND(AVG(communication)::numeric, 1), 0) AS avg_communication,
    COUNT(*) AS total_ratings,
    COALESCE(
      ROUND(
        (COUNT(*) FILTER (WHERE would_recommend = TRUE)::numeric / NULLIF(COUNT(*) FILTER (WHERE would_recommend IS NOT NULL), 0)) * 100,
        0
      ),
      0
    ) AS recommend_pct
  FROM ratings
  WHERE rated_id = p_user_id
    AND is_visible = TRUE;
$$;

-- 6. Agregar tipo de notificación para calificaciones
-- (si notification_type es un ENUM, descomentar la siguiente línea)
-- ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'rating_request';
-- ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'new_rating';
