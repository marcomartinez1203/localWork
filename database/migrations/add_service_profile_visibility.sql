-- Migración: visibilidad pública del perfil de servicios
-- Ejecutar en Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS service_public BOOLEAN NOT NULL DEFAULT FALSE;

-- Re-crear vista de trabajadores con bandera de publicación
-- Nota: en PostgreSQL, CREATE OR REPLACE VIEW no permite reordenar columnas existentes.
DROP VIEW IF EXISTS workers_directory;

CREATE VIEW workers_directory AS
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
  service_public,
  education,
  experience,
  unaccent(lower(coalesce(full_name, ''))) AS search_name
FROM profiles;
