-- ============================================
-- LocalWork — Supabase Database Schema
-- Plataforma de empleo local — Aguachica, Cesar
-- ============================================

-- ══════════════════════════════════════════════
-- 0. EXTENSIONES
-- ══════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";          -- búsqueda de texto
CREATE EXTENSION IF NOT EXISTS "unaccent";         -- búsqueda sin acentos


-- ══════════════════════════════════════════════
-- 1. TIPOS ENUMERADOS
-- ══════════════════════════════════════════════
CREATE TYPE user_role       AS ENUM ('seeker', 'employer', 'admin');
CREATE TYPE job_status      AS ENUM ('active', 'paused', 'closed', 'draft');
CREATE TYPE job_modality    AS ENUM ('Presencial', 'Remoto', 'Híbrido');
CREATE TYPE application_status AS ENUM (
  'pending',      -- postulación recibida
  'reviewed',     -- el empleador la revisó
  'shortlisted',  -- preseleccionado
  'interview',    -- citado a entrevista
  'accepted',     -- aceptado
  'rejected'      -- rechazado
);
CREATE TYPE notification_type AS ENUM (
  'application_received',
  'application_status_changed',
  'profile_viewed',
  'new_job_match',
  'system'
);


-- ══════════════════════════════════════════════
-- 2. TABLAS
-- ══════════════════════════════════════════════

-- ── 2.1  Perfiles de usuario ──
-- Se enlaza 1-a-1 con auth.users de Supabase
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role         user_role     NOT NULL DEFAULT 'seeker',
  full_name    TEXT          NOT NULL,
  email        TEXT          NOT NULL UNIQUE,
  phone        TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  location     TEXT,         -- zona: Centro, Norte, Sur, etc.
  service_public BOOLEAN     NOT NULL DEFAULT FALSE, -- visible en el directorio de trabajadores
  resume_url   TEXT,         -- URL del CV en Supabase Storage
  education    JSONB         DEFAULT '[]'::jsonb,  -- historial educativo
  experience   JSONB         DEFAULT '[]'::jsonb,  -- experiencia laboral
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE profiles IS 'Perfiles públicos de los usuarios (buscadores y empleadores)';


-- ── 2.2  Empresas ──
CREATE TABLE companies (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT          NOT NULL,
  nit          TEXT,
  description  TEXT,
  logo_url     TEXT,
  website      TEXT,
  phone        TEXT,
  address      TEXT,
  location     TEXT,         -- zona dentro de Aguachica
  verified     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE companies IS 'Empresas registradas por empleadores';

CREATE INDEX idx_companies_owner ON companies(owner_id);


-- ── 2.3  Categorías de empleo ──
CREATE TABLE categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT          NOT NULL UNIQUE,
  slug         TEXT          NOT NULL UNIQUE,
  icon         TEXT,          -- emoji o nombre de icono
  description  TEXT,
  sort_order   INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE categories IS 'Categorías predefinidas de empleo';


-- ── 2.4  Ofertas de empleo ──
CREATE TABLE jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID          NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id  UUID          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title        TEXT          NOT NULL,
  description  TEXT          NOT NULL,
  requirements TEXT,         -- requisitos del cargo
  benefits     TEXT,         -- beneficios ofrecidos
  modality     job_modality  NOT NULL DEFAULT 'Presencial',
  location     TEXT,         -- zona específica
  salary_min   NUMERIC(12,2),
  salary_max   NUMERIC(12,2),
  salary_text  TEXT,         -- texto libre: "$1.800.000 – $2.200.000"
  vacancies    INT           NOT NULL DEFAULT 1,
  status       job_status    NOT NULL DEFAULT 'active',
  expires_at   TIMESTAMPTZ,

  CONSTRAINT chk_salary_range CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT now()
);

COMMENT ON TABLE jobs IS 'Ofertas de empleo publicadas por empresas';

CREATE INDEX idx_jobs_company    ON jobs(company_id);
CREATE INDEX idx_jobs_category   ON jobs(category_id);
CREATE INDEX idx_jobs_status     ON jobs(status);
CREATE INDEX idx_jobs_modality   ON jobs(modality);
CREATE INDEX idx_jobs_created    ON jobs(created_at DESC);
CREATE INDEX idx_jobs_salary     ON jobs(salary_min, salary_max);

-- Índice GIN para búsqueda de texto libre (trigrams)
CREATE INDEX idx_jobs_title_trgm ON jobs USING gin (title gin_trgm_ops);
CREATE INDEX idx_jobs_desc_trgm  ON jobs USING gin (description gin_trgm_ops);


-- ── 2.5  Postulaciones ──
CREATE TABLE applications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id       UUID               NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id    UUID               NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status       application_status NOT NULL DEFAULT 'pending',
  cover_letter TEXT,
  resume_url   TEXT,             -- puede sobrescribir el CV del perfil
  notes        TEXT,             -- notas internas del empleador
  created_at   TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ        NOT NULL DEFAULT now(),

  UNIQUE (job_id, seeker_id)     -- un usuario no puede postularse dos veces
);

COMMENT ON TABLE applications IS 'Postulaciones de buscadores a ofertas de empleo';

CREATE INDEX idx_applications_job    ON applications(job_id);
CREATE INDEX idx_applications_seeker ON applications(seeker_id);
CREATE INDEX idx_applications_status ON applications(status);


-- ── 2.6  Calificaciones ──
CREATE TABLE ratings (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rater_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rated_id     UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id       UUID          REFERENCES jobs(id) ON DELETE SET NULL,
  score        SMALLINT      NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment      TEXT,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- la unicidad se aplica con dos índices parciales (ver abajo) porque
  -- UNIQUE(a, b, NULL) no funciona en PostgreSQL (NULLs se tratan como distintos)
);

COMMENT ON TABLE ratings IS 'Calificaciones mutuas entre empleadores y buscadores';

CREATE INDEX idx_ratings_rated ON ratings(rated_id);

CREATE UNIQUE INDEX ratings_unique_with_job
  ON ratings (rater_id, rated_id, job_id)
  WHERE job_id IS NOT NULL;

CREATE UNIQUE INDEX ratings_unique_no_job
  ON ratings (rater_id, rated_id)
  WHERE job_id IS NULL;


-- ── 2.7  Notificaciones ──
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID              NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type         notification_type NOT NULL,
  title        TEXT              NOT NULL,
  message      TEXT              NOT NULL,
  data         JSONB,            -- datos extra (IDs relacionados, etc.)
  read         BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ       NOT NULL DEFAULT now()
);

COMMENT ON TABLE notifications IS 'Notificaciones para los usuarios';

CREATE INDEX idx_notifications_user   ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;


-- ── 2.8  Empleos guardados / favoritos ──
CREATE TABLE saved_jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_id       UUID          NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT now(),

  UNIQUE (user_id, job_id)
);

COMMENT ON TABLE saved_jobs IS 'Empleos guardados por buscadores';

CREATE INDEX idx_saved_jobs_user ON saved_jobs(user_id);


-- ══════════════════════════════════════════════
-- 3. FUNCIONES Y TRIGGERS
-- ══════════════════════════════════════════════

-- ── 3.1  Actualizar updated_at automáticamente ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_companies_updated
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_jobs_updated
  BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ── 3.2  Crear perfil automáticamente al registrar usuario ──
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'seeker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 3.3  Notificar al empleador cuando recibe una postulación ──
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title  TEXT;
  v_company_owner UUID;
  v_seeker_name   TEXT;
BEGIN
  -- Obtener datos del empleo y la empresa
  SELECT j.title, c.owner_id
  INTO v_job_title, v_company_owner
  FROM jobs j
  JOIN companies c ON c.id = j.company_id
  WHERE j.id = NEW.job_id;

  -- Obtener nombre del postulante
  SELECT full_name INTO v_seeker_name
  FROM profiles WHERE id = NEW.seeker_id;

  -- Crear notificación
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (
    v_company_owner,
    'application_received',
    'Nueva postulación recibida',
    v_seeker_name || ' se postuló a "' || v_job_title || '"',
    jsonb_build_object(
      'application_id', NEW.id,
      'job_id', NEW.job_id,
      'seeker_id', NEW.seeker_id
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_new_application
  AFTER INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_new_application();


-- ── 3.4  Notificar al buscador cuando cambia el estado de su postulación ──
CREATE OR REPLACE FUNCTION notify_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_job_title TEXT;
  v_status_label TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    SELECT title INTO v_job_title FROM jobs WHERE id = NEW.job_id;

    -- Traducir estados a español
    v_status_label := CASE NEW.status
      WHEN 'reviewed'     THEN 'revisada'
      WHEN 'shortlisted'  THEN 'preseleccionada'
      WHEN 'interview'    THEN 'citado a entrevista'
      WHEN 'accepted'     THEN 'aceptada'
      WHEN 'rejected'     THEN 'rechazada'
      ELSE NEW.status::TEXT
    END;

    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.seeker_id,
      'application_status_changed',
      'Actualización de tu postulación',
      'Tu postulación a "' || v_job_title || '" fue ' || v_status_label,
      jsonb_build_object(
        'application_id', NEW.id,
        'job_id', NEW.job_id,
        'new_status', NEW.status
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_application_status
  AFTER UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION notify_application_status_change();


-- ── 3.5  Bloquear auto-verificación de empresas ──
CREATE OR REPLACE FUNCTION prevent_self_verify()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified THEN
    IF (SELECT role FROM profiles WHERE id = auth.uid()) <> 'admin' THEN
      RAISE EXCEPTION 'No tienes permiso para cambiar el estado de verificación';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_self_verify
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION prevent_self_verify();


-- ══════════════════════════════════════════════
-- 4. VISTAS ÚTILES
-- ══════════════════════════════════════════════

-- ── Vista de empleos con datos de empresa y categoría ──
CREATE OR REPLACE VIEW jobs_with_details AS
SELECT
  j.*,
  c.name        AS company_name,
  c.logo_url    AS company_logo_url,
  c.verified    AS company_verified,
  cat.name      AS category_name,
  cat.slug      AS category_slug,
  cat.icon      AS category_icon,
  (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id)        AS total_applications,
  (SELECT COUNT(*) FROM saved_jobs s WHERE s.job_id = j.id)          AS total_saves,
  unaccent(lower(
    coalesce(j.title, '')       || ' ' ||
    coalesce(j.description, '') || ' ' ||
    coalesce(c.name, '')        || ' ' ||
    coalesce(j.location, '')    || ' ' ||
    coalesce(cat.name, '')
  )) AS search_text
FROM jobs j
JOIN companies  c   ON c.id   = j.company_id
JOIN categories cat ON cat.id = j.category_id;


-- ── Vista de trabajadores con campo de búsqueda normalizado ──
CREATE OR REPLACE VIEW workers_directory AS
SELECT
  id,
  full_name,
  avatar_url,
  bio,
  location,
  skills,
  work_type,
  service_public,
  availability,
  hourly_rate,
  role,
  education,
  experience,
  unaccent(lower(coalesce(full_name, ''))) AS search_name
FROM profiles;


-- ── Vista de estadísticas generales (para el dashboard) ──
CREATE OR REPLACE VIEW platform_stats AS
SELECT
  (SELECT COUNT(*) FROM jobs WHERE status = 'active')                 AS active_jobs,
  (SELECT COUNT(DISTINCT company_id) FROM jobs WHERE status = 'active') AS active_companies,
  (SELECT COUNT(*) FROM applications
   WHERE created_at >= CURRENT_DATE)                                  AS applications_today,
  (SELECT COUNT(*) FROM profiles WHERE role = 'seeker')               AS total_seekers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'employer')             AS total_employers;


-- ══════════════════════════════════════════════
-- 5. ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories    ENABLE ROW LEVEL SECURITY;


-- ── PROFILES ──
CREATE POLICY "Perfiles visibles para todos"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Usuarios editan su propio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- ── COMPANIES ──
CREATE POLICY "Empresas visibles para todos"
  ON companies FOR SELECT USING (true);

CREATE POLICY "Empleadores crean su empresa"
  ON companies FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Empleadores editan su empresa"
  ON companies FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Empleadores eliminan su empresa"
  ON companies FOR DELETE USING (auth.uid() = owner_id);


-- ── CATEGORIES ──
CREATE POLICY "Categorías visibles para todos"
  ON categories FOR SELECT USING (true);

-- Solo admins insertan/editan categorías (se hace desde el dashboard de Supabase)


-- ── JOBS ──
CREATE POLICY "Empleos activos visibles para todos"
  ON jobs FOR SELECT USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = jobs.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Empleadores crean ofertas de su empresa"
  ON jobs FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = jobs.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Empleadores editan ofertas de su empresa"
  ON jobs FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = jobs.company_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Empleadores eliminan ofertas de su empresa"
  ON jobs FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = jobs.company_id AND c.owner_id = auth.uid()
    )
  );


-- ── APPLICATIONS ──
CREATE POLICY "Buscadores ven sus postulaciones"
  ON applications FOR SELECT USING (
    auth.uid() = seeker_id
    OR EXISTS (
      SELECT 1 FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Buscadores crean postulaciones"
  ON applications FOR INSERT WITH CHECK (auth.uid() = seeker_id);

CREATE POLICY "Empleadores actualizan estado de postulaciones"
  ON applications FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.owner_id = auth.uid()
    )
  );


-- ── RATINGS ──
CREATE POLICY "Calificaciones visibles para todos"
  ON ratings FOR SELECT USING (true);

CREATE POLICY "Usuarios crean sus calificaciones"
  ON ratings FOR INSERT WITH CHECK (auth.uid() = rater_id);


-- ── NOTIFICATIONS ──
CREATE POLICY "Usuarios ven sus notificaciones"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios marcan sus notificaciones como leídas"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);


-- ── SAVED JOBS ──
CREATE POLICY "Usuarios ven sus empleos guardados"
  ON saved_jobs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios guardan empleos"
  ON saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan empleos guardados"
  ON saved_jobs FOR DELETE USING (auth.uid() = user_id);


-- ══════════════════════════════════════════════
-- 6. STORAGE BUCKETS (ejecutar desde la UI o API)
-- ══════════════════════════════════════════════
-- Nota: Los buckets se crean desde el dashboard de Supabase.
-- Aquí se documentan para referencia:
--
-- Bucket: avatars
--   → Fotos de perfil de usuarios
--   → Público: SÍ
--   → Tamaño máximo: 2MB
--   → Formatos: jpg, png, webp
--
-- Bucket: resumes
--   → Hojas de vida / CVs
--   → Público: NO (requiere auth)
--   → Tamaño máximo: 5MB
--   → Formatos: pdf, doc, docx
--
-- Bucket: company-logos
--   → Logos de empresas
--   → Público: SÍ
--   → Tamaño máximo: 2MB
--   → Formatos: jpg, png, webp, svg


-- ══════════════════════════════════════════════
-- 7. DATOS INICIALES (SEED)
-- ══════════════════════════════════════════════

-- ── Categorías ──
INSERT INTO categories (name, slug, icon, sort_order) VALUES
  ('Salud',            'salud',          '🏥', 1),
  ('Tecnología',       'tecnologia',     '💻', 2),
  ('Comercio',         'comercio',       '🛒', 3),
  ('Construcción',     'construccion',   '🏗️', 4),
  ('Educación',        'educacion',      '🎓', 5),
  ('Agropecuario',     'agropecuario',   '🌾', 6),
  ('Servicios Varios', 'servicios',      '🔧', 7),
  ('Restaurantes',     'restaurantes',   '🍽️', 8),
  ('Transporte',       'transporte',     '🚛', 9),
  ('Administración',   'administracion', '📋', 10),
  ('Hotelería',        'hoteleria',      '🏨', 11),
  ('Otros',            'otros',          '✨', 99);
