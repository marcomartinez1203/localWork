-- ============================================
-- Migración: Sistema de ratings
-- ============================================

-- Función para calcular promedio de calificaciones de un usuario
CREATE OR REPLACE FUNCTION avg_rating(p_user_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(ROUND(AVG(score)::numeric, 1), 0)
  FROM ratings
  WHERE rated_id = p_user_id;
$$;
