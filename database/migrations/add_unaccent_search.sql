-- ============================================
-- Migración: búsqueda sin acentos (unaccent)
-- ============================================

-- 1. Habilitar extensión unaccent
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Actualizar vista de empleos con columna search_text normalizada
CREATE OR REPLACE VIEW jobs_with_details AS
SELECT
  j.*,
  c.name        AS company_name,
  c.logo_url    AS company_logo_url,
  c.verified    AS company_verified,
  cat.name      AS category_name,
  cat.slug      AS category_slug,
  cat.icon      AS category_icon,
  (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id)        AS total_applications,
  (SELECT COUNT(*) FROM saved_jobs s WHERE s.job_id = j.id)          AS total_saves,
  unaccent(lower(
    coalesce(j.title, '')       || ' ' ||
    coalesce(j.description, '') || ' ' ||
    coalesce(c.name, '')        || ' ' ||
    coalesce(j.location, '')    || ' ' ||
    coalesce(cat.name, '')
  )) AS search_text
FROM jobs j
JOIN companies  c   ON c.id   = j.company_id
JOIN categories cat ON cat.id = j.category_id;

-- 3. Crear vista de trabajadores con campo de búsqueda normalizado
CREATE OR REPLACE VIEW workers_directory AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  skills,
  work_type,
  availability,
  hourly_rate,
  role,
  education,
  experience,
  unaccent(lower(coalesce(full_name, ''))) AS search_name
FROM profiles;
