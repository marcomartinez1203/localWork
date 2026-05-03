-- ============================================
-- Ejecutar esto en el SQL Editor de Supabase
-- ============================================

-- 1. Crear tabla barrios
CREATE TABLE IF NOT EXISTS barrios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Agregar columnas a jobs
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS barrio_id UUID REFERENCES barrios(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 6),
  ADD COLUMN IF NOT EXISTS location_lng DECIMAL(10, 6);

-- 3. Insertar barrios de Aguachica
INSERT INTO barrios (nombre, lat, lng) VALUES
  ('Centro', 8.3084, -73.6078),
  ('El Prado', 8.3120, -73.6050),
  ('Los Olivos', 8.3050, -73.6100),
  ('San Martín', 8.3150, -73.6120),
  ('Villa del Río', 8.3000, -73.6150),
  ('La Esperanza', 8.3200, -73.6000),
  ('El Carmen', 8.2950, -73.6050),
  ('Las Palmas', 8.3100, -73.6200),
  ('Urbanización Los Pinos', 8.3250, -73.6080),
  ('Barrio Nuevo', 8.2900, -73.6100),
  ('El Bosque', 8.3180, -73.5950),
  ('La Floresta', 8.3020, -73.6180),
  ('20 de Julio', 8.3300, -73.6150),
  ('7 de Agosto', 8.2850, -73.6000),
  ('Simón Bolívar', 8.3150, -73.6250)
ON CONFLICT DO NOTHING;

-- 4. Migrar empleos existentes → asignar barrio Centro por defecto
DO $$
DECLARE
  v_centro_id UUID;
BEGIN
  SELECT id INTO v_centro_id FROM barrios WHERE nombre = 'Centro' LIMIT 1;

  UPDATE jobs
  SET barrio_id = COALESCE(
    (SELECT id FROM barrios WHERE nombre = jobs.location LIMIT 1),
    v_centro_id
  )
  WHERE barrio_id IS NULL;

  UPDATE jobs
  SET
    location_lat = (SELECT lat FROM barrios WHERE id = jobs.barrio_id) + (random() * 0.0036 - 0.0018),
    location_lng = (SELECT lng FROM barrios WHERE id = jobs.barrio_id) + (random() * 0.0036 - 0.0018)
  WHERE barrio_id IS NOT NULL
    AND location_lat IS NULL;
END $$;

-- 5. Actualizar la vista jobs_with_details para incluir datos del barrio
-- (DROP necesario porque no se puede cambiar el orden de columnas con REPLACE)
DROP VIEW IF EXISTS jobs_with_details;

CREATE VIEW jobs_with_details AS
SELECT
  j.*,
  c.name        AS company_name,
  c.logo_url    AS company_logo_url,
  c.verified    AS company_verified,
  cat.name      AS category_name,
  cat.slug      AS category_slug,
  cat.icon      AS category_icon,
  b.nombre      AS barrio_nombre,
  b.lat         AS barrio_lat,
  b.lng         AS barrio_lng,
  (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id)  AS total_applications,
  (SELECT COUNT(*) FROM saved_jobs s WHERE s.job_id = j.id)    AS total_saves,
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
LEFT JOIN barrios b ON b.id   = j.barrio_id;

-- 6. Habilitar RLS en barrios (lectura pública)
ALTER TABLE barrios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barrios visibles para todos"
  ON barrios FOR SELECT USING (true);
