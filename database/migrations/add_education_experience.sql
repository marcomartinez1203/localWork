-- Migración: agregar columnas a profiles para perfil profesional
-- Ejecutar en Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS education   JSONB  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS experience  JSONB  DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS skills      TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS work_type   TEXT   DEFAULT 'employee'
    CHECK (work_type IN ('employee', 'freelance', 'both')),
  ADD COLUMN IF NOT EXISTS availability TEXT,
  ADD COLUMN IF NOT EXISTS hourly_rate  TEXT;

-- Índice para búsqueda por habilidades
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING gin(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_work_type ON profiles(work_type)
  WHERE work_type IN ('freelance', 'both');
