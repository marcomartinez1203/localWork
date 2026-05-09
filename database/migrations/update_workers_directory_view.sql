-- Recrear la vista workers_directory para incluir verification_status
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
    unaccent(LOWER(full_name)) as search_name
FROM profiles 
WHERE role = 'seeker';
