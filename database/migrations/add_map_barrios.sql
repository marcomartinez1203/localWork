-- ============================================
-- Migration: Add Map Barrios
-- ============================================

-- 1. Create barrios table
CREATE TABLE IF NOT EXISTS barrios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  lat DECIMAL(10, 6) NOT NULL,
  lng DECIMAL(10, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE barrios IS 'Barrios predefinidos de Aguachica para agrupar ofertas en el mapa';

-- 2. Modify jobs table
ALTER TABLE jobs
  ADD COLUMN barrio_id UUID REFERENCES barrios(id) ON DELETE SET NULL,
  ADD COLUMN location_lat DECIMAL(10, 6),
  ADD COLUMN location_lng DECIMAL(10, 6);

-- 3. Insert predefined barrios
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

-- 4. Migrate existing jobs
-- Fallback to 'Centro' if no match, else match by location name if possible.
DO $$ 
DECLARE
  v_centro_id UUID;
BEGIN
  SELECT id INTO v_centro_id FROM barrios WHERE nombre = 'Centro' LIMIT 1;
  
  -- Update existing jobs assigning Centro as default if no direct match, 
  -- and applying a random offset of ~±200m (±0.0018 degrees)
  UPDATE jobs 
  SET 
    barrio_id = COALESCE((SELECT id FROM barrios WHERE nombre = jobs.location LIMIT 1), v_centro_id);

  UPDATE jobs
  SET
    location_lat = (SELECT lat FROM barrios WHERE id = jobs.barrio_id) + (random() * 0.0036 - 0.0018),
    location_lng = (SELECT lng FROM barrios WHERE id = jobs.barrio_id) + (random() * 0.0036 - 0.0018)
  WHERE barrio_id IS NOT NULL;
END $$;
