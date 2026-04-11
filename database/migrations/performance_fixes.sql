-- ============================================
-- Performance fixes
-- ============================================

-- 1. Índice compuesto para getForJob() en applications
CREATE INDEX IF NOT EXISTS idx_applications_job_created
  ON applications(job_id, created_at DESC);


-- 2. Función RPC para getEmployerStats() — reemplaza 4 queries por 1
CREATE OR REPLACE FUNCTION get_employer_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  WITH company AS (
    SELECT id FROM companies WHERE owner_id = p_user_id LIMIT 1
  ),
  job_stats AS (
    SELECT
      COUNT(*)                                  AS total_jobs,
      COUNT(*) FILTER (WHERE j.status = 'active') AS active_jobs
    FROM jobs j
    WHERE j.company_id = (SELECT id FROM company)
  ),
  app_stats AS (
    SELECT COUNT(*) AS total_applications
    FROM applications a
    WHERE a.job_id IN (
      SELECT id FROM jobs WHERE company_id = (SELECT id FROM company)
    )
  ),
  save_stats AS (
    SELECT COUNT(*) AS total_saves
    FROM saved_jobs s
    WHERE s.job_id IN (
      SELECT id FROM jobs WHERE company_id = (SELECT id FROM company)
    )
  )
  SELECT json_build_object(
    'active_jobs',         js.active_jobs,
    'total_jobs',          js.total_jobs,
    'total_applications',  aps.total_applications,
    'total_saves',         ss.total_saves
  )
  FROM job_stats js, app_stats aps, save_stats ss;
$$;


-- 3. Vista jobs_with_details — reemplaza subqueries correlacionadas por LEFT JOINs
CREATE OR REPLACE VIEW jobs_with_details AS
SELECT
  j.*,
  c.name        AS company_name,
  c.logo_url    AS company_logo_url,
  c.verified    AS company_verified,
  cat.name      AS category_name,
  cat.slug      AS category_slug,
  cat.icon      AS category_icon,
  COALESCE(agg_a.total_applications, 0) AS total_applications,
  COALESCE(agg_s.total_saves, 0)        AS total_saves,
  unaccent(lower(
    coalesce(j.title, '')       || ' ' ||
    coalesce(j.description, '') || ' ' ||
    coalesce(c.name, '')        || ' ' ||
    coalesce(j.location, '')    || ' ' ||
    coalesce(cat.name, '')
  )) AS search_text
FROM jobs j
JOIN companies  c   ON c.id   = j.company_id
JOIN categories cat ON cat.id = j.category_id
LEFT JOIN (
  SELECT job_id, COUNT(*) AS total_applications
  FROM applications
  GROUP BY job_id
) agg_a ON agg_a.job_id = j.id
LEFT JOIN (
  SELECT job_id, COUNT(*) AS total_saves
  FROM saved_jobs
  GROUP BY job_id
) agg_s ON agg_s.job_id = j.id;
