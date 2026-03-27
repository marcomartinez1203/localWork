-- ============================================
-- LocalWork — Datos de prueba (Seed)
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- ══════════════════════════════════════════════
-- 1. CREAR USUARIOS DE PRUEBA
-- ══════════════════════════════════════════════

DO $$
DECLARE
  v_seeker_id UUID := gen_random_uuid();
  v_employer_id UUID := gen_random_uuid();
  v_company_id UUID;
  v_cat_comercio UUID;
  v_cat_salud UUID;
  v_cat_tech UUID;
  v_cat_restaurantes UUID;
  v_cat_construccion UUID;
BEGIN

  -- ── Usuario BUSCADOR ──
  -- Email: buscador@test.com | Contraseña: Test1234
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    aud, role, confirmation_token
  ) VALUES (
    v_seeker_id,
    '00000000-0000-0000-0000-000000000000',
    'buscador@test.com',
    crypt('Test1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "Juan Pérez", "role": "seeker", "phone": "3001234567"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_seeker_id,
    v_seeker_id,
    jsonb_build_object('sub', v_seeker_id::text, 'email', 'buscador@test.com'),
    'email',
    v_seeker_id::text,
    now(), now(), now()
  );

  -- ── Usuario EMPLEADOR ──
  -- Email: empleador@test.com | Contraseña: Test1234
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_user_meta_data, raw_app_meta_data,
    aud, role, confirmation_token
  ) VALUES (
    v_employer_id,
    '00000000-0000-0000-0000-000000000000',
    'empleador@test.com',
    crypt('Test1234', gen_salt('bf')),
    now(), now(), now(),
    '{"full_name": "María García", "role": "employer", "phone": "3009876543"}'::jsonb,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    'authenticated',
    'authenticated',
    ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_employer_id,
    v_employer_id,
    jsonb_build_object('sub', v_employer_id::text, 'email', 'empleador@test.com'),
    'email',
    v_employer_id::text,
    now(), now(), now()
  );

  -- Esperar que los triggers creen los perfiles
  PERFORM pg_sleep(1);

  -- ══════════════════════════════════════════════
  -- 2. CREAR EMPRESA DEL EMPLEADOR
  -- ══════════════════════════════════════════════
  INSERT INTO companies (owner_id, name, nit, description, phone, address, location, verified)
  VALUES (
    v_employer_id,
    'Supermercado Central',
    '900123456-1',
    'Cadena de supermercados líder en Aguachica con más de 10 años de experiencia.',
    '3009876543',
    'Calle 5 #10-20, Centro',
    'Centro',
    true
  ) RETURNING id INTO v_company_id;

  -- ══════════════════════════════════════════════
  -- 3. CREAR OFERTAS DE EMPLEO
  -- ══════════════════════════════════════════════
  SELECT id INTO v_cat_comercio FROM categories WHERE slug = 'comercio';
  SELECT id INTO v_cat_salud FROM categories WHERE slug = 'salud';
  SELECT id INTO v_cat_tech FROM categories WHERE slug = 'tecnologia';
  SELECT id INTO v_cat_restaurantes FROM categories WHERE slug = 'restaurantes';
  SELECT id INTO v_cat_construccion FROM categories WHERE slug = 'construccion';

  INSERT INTO jobs (company_id, category_id, title, description, requirements, modality, location, salary_min, salary_max, salary_text, vacancies) VALUES
    (v_company_id, v_cat_comercio, 'Coordinador de Ventas',
     'Buscamos un líder comercial con experiencia en ventas al detal. Será responsable de coordinar el equipo de vendedores y optimizar la experiencia del cliente.',
     'Experiencia mínima de 2 años en ventas.', 'Presencial', 'Centro', 1800000, 2200000, '$1.800.000 – $2.200.000', 1),

    (v_company_id, v_cat_comercio, 'Cajero/a Supermercado',
     'Se necesita cajero(a) con experiencia en manejo de caja registradora, atención al cliente y disponibilidad de horario.',
     'Bachiller. Experiencia mínima 6 meses.', 'Presencial', 'Centro', 1300000, 1500000, '$1.300.000 – $1.500.000', 3),

    (v_company_id, v_cat_tech, 'Desarrollador Web Junior',
     'Empresa busca programador con conocimientos en HTML, CSS, JavaScript. Se valorará experiencia con React o Vue.js. Trabajo 100% remoto.',
     'Conocimientos en HTML, CSS, JS.', 'Remoto', 'Centro', 1500000, 2000000, '$1.500.000 – $2.000.000', 2),

    (v_company_id, v_cat_salud, 'Enfermero/a Profesional',
     'Se requiere enfermero(a) con licencia vigente para turnos rotativos en urgencias. Experiencia mínima de 1 año.',
     'Título en enfermería. Licencia vigente.', 'Presencial', 'Norte', 2000000, 2500000, '$2.000.000 – $2.500.000', 3),

    (v_company_id, v_cat_restaurantes, 'Chef Ejecutivo',
     'Hotel boutique busca chef con experiencia en cocina colombiana e internacional. Capacidad de liderar equipo de cocina.',
     'Título en gastronomía. 3 años de experiencia.', 'Presencial', 'Norte', 2500000, 3200000, '$2.500.000 – $3.200.000', 1),

    (v_company_id, v_cat_construccion, 'Técnico en Mantenimiento',
     'Se necesita técnico en mantenimiento industrial con experiencia en equipos de procesamiento. Disponibilidad para turnos.',
     'Técnico en mantenimiento. 1 año experiencia.', 'Presencial', 'Sur', 1600000, 1800000, '$1.600.000 – $1.800.000', 2);

END $$;


-- ══════════════════════════════════════════════
-- VERIFICAR
-- ══════════════════════════════════════════════
SELECT 'USUARIOS' AS tabla, email, full_name, role FROM profiles;
SELECT 'EMPRESA' AS tabla, name, nit FROM companies;
SELECT 'EMPLEOS' AS tabla, title, modality, salary_text FROM jobs;
