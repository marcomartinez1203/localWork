-- 1. Agregar columnas de verificación de identidad (si no existen)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS identity_document_url text;

-- 2. Agregar columna de portafolio visual
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS portfolio_images text[] DEFAULT '{}';

-- 3. Recrear vista workers_directory con todos los campos
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
    verification_status,
    portfolio_images,
    unaccent(LOWER(full_name)) as search_name
FROM profiles 
WHERE role = 'seeker';
