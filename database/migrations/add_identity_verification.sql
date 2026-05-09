-- Agregar sistema de verificación de identidad a perfiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS identity_document_url TEXT;

-- Índice para búsquedas rápidas de trabajadores verificados
CREATE INDEX IF NOT EXISTS idx_profiles_verification ON profiles(verification_status) WHERE role = 'seeker';
