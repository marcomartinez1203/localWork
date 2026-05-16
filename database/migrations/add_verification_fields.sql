-- ============================================
-- Migration: Add Verification Fields to Profiles
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS legal_name TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT;

-- Añadir restricción para que solo los usuarios verificados o pendientes puedan tener estos datos
COMMENT ON COLUMN public.profiles.legal_name IS 'Nombre legal exacto del documento de identidad';
COMMENT ON COLUMN public.profiles.id_number IS 'Número de identificación nacional (Cédula)';
