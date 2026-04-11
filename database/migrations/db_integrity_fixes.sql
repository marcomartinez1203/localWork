-- ============================================
-- Integrity & cleanup fixes
-- ============================================


-- 1. Constraint salary_min <= salary_max
ALTER TABLE jobs
  ADD CONSTRAINT chk_salary_range
  CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);


-- 2. Corregir unicidad en ratings cuando job_id es NULL
--    UNIQUE(a, b, NULL) en Postgres siempre pasa porque NULL != NULL.
--    Reemplazamos con dos índices parciales.
ALTER TABLE ratings
  DROP CONSTRAINT ratings_rater_id_rated_id_job_id_key;

CREATE UNIQUE INDEX ratings_unique_with_job
  ON ratings (rater_id, rated_id, job_id)
  WHERE job_id IS NOT NULL;

CREATE UNIQUE INDEX ratings_unique_no_job
  ON ratings (rater_id, rated_id)
  WHERE job_id IS NULL;


-- 3. Bloquear auto-verificación de empresas
--    Los empleadores no deben poder poner verified = TRUE en su propia empresa.
CREATE OR REPLACE FUNCTION prevent_self_verify()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified THEN
    IF (SELECT role FROM profiles WHERE id = auth.uid()) <> 'admin' THEN
      RAISE EXCEPTION 'No tienes permiso para cambiar el estado de verificación';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_self_verify
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION prevent_self_verify();


-- 4. Eliminar columna is_featured (nunca fue usada)
--    La vista jobs_with_details usa j.* (incluye is_featured), hay que
--    descartarla primero y recrearla sin esa columna.
DROP VIEW IF EXISTS jobs_with_details;

ALTER TABLE jobs DROP COLUMN is_featured;

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
