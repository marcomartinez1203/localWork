-- Agregar contador de vistas a los empleos para las analíticas
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0;
