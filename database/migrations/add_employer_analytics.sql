-- Agregar contador de vistas
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0;

-- RPC para incrementar vista (seguro, evita locks)
CREATE OR REPLACE FUNCTION increment_job_view(p_job_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE jobs
  SET views_count = views_count + 1
  WHERE id = p_job_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC para obtener analíticas del empleador para el dashboard
CREATE OR REPLACE FUNCTION get_employer_analytics(p_owner_id UUID)
RETURNS JSON AS $$
DECLARE
  v_company_id UUID;
  v_total_jobs INT;
  v_total_views INT;
  v_total_applications INT;
  v_chart_data JSON;
BEGIN
  -- Obtener la empresa del usuario
  SELECT id INTO v_company_id FROM companies WHERE owner_id = p_owner_id LIMIT 1;
  
  IF v_company_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Totales
  SELECT COUNT(*), COALESCE(SUM(views_count), 0)
  INTO v_total_jobs, v_total_views
  FROM jobs WHERE company_id = v_company_id;

  SELECT COUNT(*)
  INTO v_total_applications
  FROM applications a
  JOIN jobs j ON a.job_id = j.id
  WHERE j.company_id = v_company_id;

  -- Datos para la gráfica (últimos 7 días de postulaciones)
  WITH last_7_days AS (
    SELECT generate_series(
      date_trunc('day', NOW()) - interval '6 days',
      date_trunc('day', NOW()),
      interval '1 day'
    )::date AS date
  ),
  daily_apps AS (
    SELECT date_trunc('day', a.created_at)::date AS created_date, COUNT(*) as app_count
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    WHERE j.company_id = v_company_id
      AND a.created_at >= NOW() - interval '7 days'
    GROUP BY created_date
  )
  SELECT json_agg(
    json_build_object(
      'date', to_char(d.date, 'DD Mon'),
      'count', COALESCE(da.app_count, 0)
    ) ORDER BY d.date
  ) INTO v_chart_data
  FROM last_7_days d
  LEFT JOIN daily_apps da ON d.date = da.created_date;

  RETURN json_build_object(
    'total_jobs', v_total_jobs,
    'total_views', v_total_views,
    'total_applications', v_total_applications,
    'chart_data', COALESCE(v_chart_data, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
