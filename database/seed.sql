-- ============================================
-- LocalWork — Seed Data
-- Ejecuta en el SQL Editor de Supabase
-- ============================================

-- ══════════════════════════════════════════════
-- PASO 1: Crear usuarios de prueba en auth.users
-- (Contraseña para todos: Test1234!)
-- ══════════════════════════════════════════════

-- Empleador 1: María López (Supermercado Central)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'maria@localwork.co',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"full_name": "María López", "role": "employer"}'::jsonb,
  now(), now(), '', ''
);

-- Empleador 2: Carlos Mendoza (Clínica Aguachica)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'a2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'carlos@localwork.co',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Carlos Mendoza", "role": "employer"}'::jsonb,
  now(), now(), '', ''
);

-- Empleador 3: Ana Rodríguez (Palm Oil S.A.S.)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'a3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'ana@localwork.co',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Ana Rodríguez", "role": "employer"}'::jsonb,
  now(), now(), '', ''
);

-- Buscador 1: Juan Pérez
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'juan@localwork.co',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Juan Pérez", "role": "seeker"}'::jsonb,
  now(), now(), '', ''
);

-- Buscador 2: Laura Gómez
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'b2222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'laura@localwork.co',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Laura Gómez", "role": "seeker"}'::jsonb,
  now(), now(), '', ''
);

-- Buscador 3: Pedro Ramírez
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token)
VALUES (
  'b3333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'pedro@localwork.co',
  crypt('Test1234!', gen_salt('bf')),
  now(),
  '{"full_name": "Pedro Ramírez", "role": "seeker"}'::jsonb,
  now(), now(), '', ''
);


-- ══════════════════════════════════════════════
-- PASO 2: Crear perfiles manualmente
-- (El trigger puede no haber disparado)
-- ══════════════════════════════════════════════

INSERT INTO profiles (id, role, full_name, email, phone, location, bio) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'employer', 'María López', 'maria@localwork.co', '3001234567', 'Centro', 'Gerente de Supermercado Central con 10 años de experiencia en retail.'),
  ('a2222222-2222-2222-2222-222222222222', 'employer', 'Carlos Mendoza', 'carlos@localwork.co', '3009876543', 'Norte', 'Director médico con amplia experiencia en gestión hospitalaria.'),
  ('a3333333-3333-3333-3333-333333333333', 'employer', 'Ana Rodríguez', 'ana@localwork.co', '3005551234', 'Vía al Mar', 'Directora de talento humano en el sector agroindustrial.'),
  ('b1111111-1111-1111-1111-111111111111', 'seeker', 'Juan Pérez', 'juan@localwork.co', '3107654321', 'Centro', 'Profesional en administración de empresas. Busco oportunidades en el área comercial y ventas.'),
  ('b2222222-2222-2222-2222-222222222222', 'seeker', 'Laura Gómez', 'laura@localwork.co', '3201234567', 'Norte', 'Enfermera titulada con 5 años de experiencia clínica. Disponibilidad inmediata.'),
  ('b3333333-3333-3333-3333-333333333333', 'seeker', 'Pedro Ramírez', 'pedro@localwork.co', '3158889999', 'Sur', 'Técnico en mantenimiento industrial con certificación SENA.')
ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  bio = EXCLUDED.bio;


-- ══════════════════════════════════════════════
-- PASO 3: Empresas
-- ══════════════════════════════════════════════

INSERT INTO companies (id, owner_id, name, nit, description, phone, address, location, verified) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111',
   'Supermercado Central', '900123456-1',
   'Cadena de supermercados líder en Aguachica con más de 15 años sirviendo a la comunidad.',
   '3001234567', 'Calle 5 #4-32, Centro', 'Centro', true),

  ('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222',
   'Clínica Aguachica', '800987654-3',
   'Centro de atención médica integral. Urgencias 24/7, consulta externa, laboratorio y cirugía.',
   '3009876543', 'Carrera 8 #10-15, Norte', 'Norte', true),

  ('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333',
   'Palm Oil S.A.S.', '901456789-7',
   'Empresa agroindustrial dedicada al cultivo y procesamiento de palma de aceite.',
   '3005551234', 'Km 5 Vía al Mar', 'Vía al Mar', true);


-- ══════════════════════════════════════════════
-- PASO 4: Ofertas de empleo (20 empleos variados)
-- ══════════════════════════════════════════════

-- Obtener IDs de categorías
DO $$
DECLARE
  cat_salud       UUID;
  cat_tech        UUID;
  cat_comercio    UUID;
  cat_construccion UUID;
  cat_educacion   UUID;
  cat_agro        UUID;
  cat_servicios   UUID;
  cat_restaurantes UUID;
  cat_transporte  UUID;
  cat_admin       UUID;
BEGIN
  SELECT id INTO cat_salud FROM categories WHERE slug = 'salud';
  SELECT id INTO cat_tech FROM categories WHERE slug = 'tecnologia';
  SELECT id INTO cat_comercio FROM categories WHERE slug = 'comercio';
  SELECT id INTO cat_construccion FROM categories WHERE slug = 'construccion';
  SELECT id INTO cat_educacion FROM categories WHERE slug = 'educacion';
  SELECT id INTO cat_agro FROM categories WHERE slug = 'agropecuario';
  SELECT id INTO cat_servicios FROM categories WHERE slug = 'servicios';
  SELECT id INTO cat_restaurantes FROM categories WHERE slug = 'restaurantes';
  SELECT id INTO cat_transporte FROM categories WHERE slug = 'transporte';
  SELECT id INTO cat_admin FROM categories WHERE slug = 'administracion';

  -- Supermercado Central (6 empleos)
  INSERT INTO jobs (company_id, category_id, title, description, requirements, modality, location, salary_min, salary_max, salary_text, vacancies, status) VALUES
    ('c1111111-1111-1111-1111-111111111111', cat_comercio,
     'Coordinador de Ventas',
     'Buscamos un coordinador de ventas con experiencia en retail para liderar el equipo comercial de nuestra sucursal principal. Responsable de cumplimiento de metas, capacitación del personal y estrategias de venta.',
     'Profesional en Administración o carreras afines. 3+ años de experiencia en ventas retail. Liderazgo demostrado. Manejo de Excel.',
     'Presencial', 'Centro', 1800000, 2200000, '$1.800.000 – $2.200.000', 1, 'active'),

    ('c1111111-1111-1111-1111-111111111111', cat_comercio,
     'Cajero/a',
     'Se requiere cajero/a para turnos rotativos. Atención al cliente, manejo de caja registradora, arqueos de caja y facturación electrónica.',
     'Bachiller. Experiencia mínima de 6 meses en caja. Excelente actitud de servicio. Honestidad comprobable.',
     'Presencial', 'Centro', 1300000, 1400000, '$1.300.000 – $1.400.000', 3, 'active'),

    ('c1111111-1111-1111-1111-111111111111', cat_admin,
     'Auxiliar Administrativo',
     'Apoyo en gestión documental, archivo, correspondencia, elaboración de reportes y atención al público.',
     'Técnico o tecnólogo en Administración. Manejo de herramientas ofimáticas. Organización y proactividad.',
     'Presencial', 'Centro', 1400000, 1600000, '$1.400.000 – $1.600.000', 1, 'active'),

    ('c1111111-1111-1111-1111-111111111111', cat_servicios,
     'Auxiliar de Bodega',
     'Recepción de mercancía, inventario, surtido de estanterías y despacho de pedidos. Trabajo en equipo.',
     'Bachiller. Condición física adecuada. Experiencia en manejo de inventarios deseable. Responsabilidad.',
     'Presencial', 'Centro', 1300000, 1500000, '$1.300.000 – $1.500.000', 2, 'active'),

    ('c1111111-1111-1111-1111-111111111111', cat_tech,
     'Técnico de Sistemas',
     'Soporte técnico a puntos de venta, mantenimiento de equipos, configuración de red y sistema POS. Disponibilidad para desplazamiento a sucursales.',
     'Técnico o tecnólogo en Sistemas. Conocimiento en redes, hardware y software POS. Mínimo 1 año de experiencia.',
     'Presencial', 'Centro', 1600000, 2000000, '$1.600.000 – $2.000.000', 1, 'active'),

    ('c1111111-1111-1111-1111-111111111111', cat_comercio,
     'Mercaderista',
     'Exhibición de productos, control de fechas de vencimiento, rotación de inventario y reportes de agotados.',
     'Bachiller. Experiencia en góndola o supermercado. Buena presentación personal.',
     'Presencial', 'Centro', 1300000, 1300000, '$1.300.000', 2, 'active');

  -- Clínica Aguachica (7 empleos)
  INSERT INTO jobs (company_id, category_id, title, description, requirements, modality, location, salary_min, salary_max, salary_text, vacancies, status) VALUES
    ('c2222222-2222-2222-2222-222222222222', cat_salud,
     'Enfermero/a Profesional',
     'Se requiere enfermero/a profesional para turno rotativo en área de hospitalización. Administración de medicamentos, cuidado directo al paciente, elaboración de notas de enfermería.',
     'Profesional en Enfermería con tarjeta profesional vigente. RETHUS actualizado. Mínimo 1 año de experiencia clínica.',
     'Presencial', 'Norte', 2200000, 2800000, '$2.200.000 – $2.800.000', 3, 'active'),

    ('c2222222-2222-2222-2222-222222222222', cat_salud,
     'Médico General',
     'Consulta ambulatoria, atención de urgencias, lectura de exámenes diagnósticos. Turnos de 12 horas.',
     'Médico titulado con tarjeta profesional. RETHUS. Experiencia mínima de 2 años. Curso BLS vigente.',
     'Presencial', 'Norte', 4500000, 6000000, '$4.500.000 – $6.000.000', 2, 'active'),

    ('c2222222-2222-2222-2222-222222222222', cat_salud,
     'Auxiliar de Enfermería',
     'Toma de signos vitales, asistencia en procedimientos, camillaje, preparación de pacientes y apoyo en urgencias.',
     'Técnico Auxiliar de Enfermería. RETHUS vigente. Disponibilidad para turnos nocturnos.',
     'Presencial', 'Norte', 1400000, 1700000, '$1.400.000 – $1.700.000', 4, 'active'),

    ('c2222222-2222-2222-2222-222222222222', cat_admin,
     'Recepcionista',
     'Atención al público, asignación de citas, registro de pacientes en el sistema, gestión de llamadas telefónicas.',
     'Técnico en Secretariado o Administración. Buena presentación. Manejo de computador. Excelente servicio al cliente.',
     'Presencial', 'Norte', 1300000, 1500000, '$1.300.000 – $1.500.000', 1, 'active'),

    ('c2222222-2222-2222-2222-222222222222', cat_salud,
     'Bacteriólogo/a',
     'Procesamiento de muestras clínicas, control de calidad del laboratorio, reportes de resultados.',
     'Profesional en Bacteriología. Tarjeta profesional. Experiencia en laboratorio clínico mínimo 2 años.',
     'Presencial', 'Norte', 2800000, 3500000, '$2.800.000 – $3.500.000', 1, 'active'),

    ('c2222222-2222-2222-2222-222222222222', cat_servicios,
     'Auxiliar de Servicios Generales',
     'Limpieza y desinfección de áreas hospitalarias siguiendo protocolos de bioseguridad.',
     'Bachiller. Experiencia en aseo hospitalario deseable. Curso de bioseguridad.',
     'Presencial', 'Norte', 1300000, 1300000, '$1.300.000', 2, 'active'),

    ('c2222222-2222-2222-2222-222222222222', cat_tech,
     'Ingeniero de Sistemas - TI Hospitalaria',
     'Administración del sistema HIS, soporte técnico a usuarios, gestión de base de datos de pacientes y reportes.',
     'Ingeniero de Sistemas. Experiencia en sistemas de información clínica. SQL y redes. Mínimo 3 años.',
     'Híbrido', 'Norte', 3000000, 4000000, '$3.000.000 – $4.000.000', 1, 'active');

  -- Palm Oil S.A.S. (7 empleos)
  INSERT INTO jobs (company_id, category_id, title, description, requirements, modality, location, salary_min, salary_max, salary_text, vacancies, status) VALUES
    ('c3333333-3333-3333-3333-333333333333', cat_agro,
     'Técnico en Mantenimiento Industrial',
     'Mantenimiento preventivo y correctivo de maquinaria de extracción de aceite. Soldadura, electricidad industrial y mecánica.',
     'Técnico SENA en Mantenimiento Industrial o Mecánica. 2+ años de experiencia. Disponibilidad para viajar.',
     'Presencial', 'Vía al Mar', 1800000, 2300000, '$1.800.000 – $2.300.000', 2, 'active'),

    ('c3333333-3333-3333-3333-333333333333', cat_agro,
     'Ingeniero Agrónomo',
     'Planificación de cultivos, control de plagas, supervisión de cosecha y asesoría técnica a personal de campo.',
     'Ingeniero Agrónomo titulado. Experiencia en palma de aceite o cultivos tropicales. Licencia de conducir.',
     'Presencial', 'Vía al Mar', 3500000, 4500000, '$3.500.000 – $4.500.000', 1, 'active'),

    ('c3333333-3333-3333-3333-333333333333', cat_agro,
     'Operario de Planta',
     'Operación de equipos de producción, cargue/descargue, limpieza de tanques y cumplimiento de normas de seguridad.',
     'Bachiller. Experiencia en planta industrial deseable. Trabajo en equipo. Disponibilidad de turnos rotativos.',
     'Presencial', 'Vía al Mar', 1400000, 1600000, '$1.400.000 – $1.600.000', 5, 'active'),

    ('c3333333-3333-3333-3333-333333333333', cat_admin,
     'Analista de Talento Humano',
     'Reclutamiento y selección, nómina, bienestar laboral, capacitaciones y gestión documental del personal.',
     'Profesional en Psicología, Administración o afines. 2+ años en gestión humana. Manejo de nómina.',
     'Híbrido', 'Vía al Mar', 2200000, 2800000, '$2.200.000 – $2.800.000', 1, 'active'),

    ('c3333333-3333-3333-3333-333333333333', cat_transporte,
     'Conductor de Vehículo Pesado',
     'Transporte de fruto de palma desde las fincas hasta la planta extractora. Rutas dentro del Cesar.',
     'Licencia C2 o C3 vigente. Experiencia mínima 2 años en conducción de volqueta o camión. Sin comparendos.',
     'Presencial', 'Vía al Mar', 1800000, 2200000, '$1.800.000 – $2.200.000', 3, 'active'),

    ('c3333333-3333-3333-3333-333333333333', cat_construccion,
     'Supervisor de Obra Civil',
     'Supervisión de proyectos de infraestructura interna: vías, campamentos, canales de riego.',
     'Tecnólogo o profesional en Construcción Civil o Ingeniería Civil. 3+ años de experiencia en obra. AutoCAD.',
     'Presencial', 'Vía al Mar', 2800000, 3500000, '$2.800.000 – $3.500.000', 1, 'active'),

    ('c3333333-3333-3333-3333-333333333333', cat_tech,
     'Desarrollador Web Junior',
     'Desarrollo y mantenimiento de la plataforma interna. HTML, CSS, JavaScript, Node.js. Trabajo remoto con reuniones presenciales una vez por semana.',
     'Técnico o estudiante de últimos semestres de Ingeniería de Sistemas. Portfolio o proyectos demostrables.',
     'Remoto', 'Vía al Mar', 1800000, 2500000, '$1.800.000 – $2.500.000', 1, 'active');

END $$;


-- ══════════════════════════════════════════════
-- PASO 5: Postulaciones de ejemplo
-- ══════════════════════════════════════════════

-- Juan se postula a Coordinador de Ventas y Cajero
INSERT INTO applications (job_id, seeker_id, status, cover_letter) VALUES
  ((SELECT id FROM jobs WHERE title = 'Coordinador de Ventas' LIMIT 1),
   'b1111111-1111-1111-1111-111111111111', 'reviewed',
   'Tengo 5 años de experiencia liderando equipos de ventas en el sector retail. Me apasiona superar metas y formar equipos de alto rendimiento.'),

  ((SELECT id FROM jobs WHERE title = 'Cajero/a' LIMIT 1),
   'b1111111-1111-1111-1111-111111111111', 'pending',
   'Busco empleo estable con horario flexible. Tengo experiencia previa en manejo de efectivo y atención al público.');

-- Laura se postula a puestos de salud
INSERT INTO applications (job_id, seeker_id, status, cover_letter) VALUES
  ((SELECT id FROM jobs WHERE title = 'Enfermero/a Profesional' LIMIT 1),
   'b2222222-2222-2222-2222-222222222222', 'shortlisted',
   'Soy enfermera titulada con 5 años de experiencia en hospitalización y urgencias. Disponibilidad inmediata para inicio.'),

  ((SELECT id FROM jobs WHERE title = 'Auxiliar de Enfermería' LIMIT 1),
   'b2222222-2222-2222-2222-222222222222', 'pending',
   'Aunque soy enfermera profesional, también tengo experiencia como auxiliar y estoy dispuesta a contribuir en cualquier área.');

-- Pedro se postula a puestos técnicos
INSERT INTO applications (job_id, seeker_id, status, cover_letter) VALUES
  ((SELECT id FROM jobs WHERE title = 'Técnico en Mantenimiento Industrial' LIMIT 1),
   'b3333333-3333-3333-3333-333333333333', 'interview',
   'Certificado SENA en mantenimiento industrial. He trabajado 3 años en plantas procesadoras. Conozco la maquinaria de extracción.'),

  ((SELECT id FROM jobs WHERE title = 'Operario de Planta' LIMIT 1),
   'b3333333-3333-3333-3333-333333333333', 'accepted',
   'Tengo experiencia operativa y estoy familiarizado con normas de seguridad industrial.'),

  ((SELECT id FROM jobs WHERE title = 'Desarrollador Web Junior' LIMIT 1),
   'b3333333-3333-3333-3333-333333333333', 'pending',
   'Estoy estudiando desarrollo web por mi cuenta. Conozco HTML, CSS y JavaScript básico.');


-- ══════════════════════════════════════════════
-- PASO 6: Empleos guardados
-- ══════════════════════════════════════════════

INSERT INTO saved_jobs (user_id, job_id) VALUES
  ('b1111111-1111-1111-1111-111111111111', (SELECT id FROM jobs WHERE title = 'Técnico de Sistemas' LIMIT 1)),
  ('b1111111-1111-1111-1111-111111111111', (SELECT id FROM jobs WHERE title = 'Analista de Talento Humano' LIMIT 1)),
  ('b2222222-2222-2222-2222-222222222222', (SELECT id FROM jobs WHERE title = 'Médico General' LIMIT 1)),
  ('b3333333-3333-3333-3333-333333333333', (SELECT id FROM jobs WHERE title = 'Conductor de Vehículo Pesado' LIMIT 1));


-- ══════════════════════════════════════════════
-- PASO 7: Notificaciones manuales
-- ══════════════════════════════════════════════
-- (Las de postulación ya se crearon automáticamente por los triggers)

INSERT INTO notifications (user_id, type, title, message, read) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'system', '¡Bienvenido a LocalWork!', 'Tu cuenta fue creada exitosamente. Empieza a explorar las ofertas de empleo disponibles.', true),
  ('b2222222-2222-2222-2222-222222222222', 'system', '¡Bienvenida a LocalWork!', 'Tu cuenta fue creada exitosamente. Completa tu perfil para mejorar tus oportunidades.', true),
  ('b3333333-3333-3333-3333-333333333333', 'system', '¡Bienvenido a LocalWork!', 'Tu cuenta fue creada exitosamente. Sube tu CV para postularte más rápido.', false),
  ('b1111111-1111-1111-1111-111111111111', 'new_job_match', 'Nueva oferta que podría interesarte', 'Se publicó "Auxiliar Administrativo" en Supermercado Central.', false),
  ('b2222222-2222-2222-2222-222222222222', 'new_job_match', 'Nueva oferta en tu área', 'Se publicó "Bacteriólogo/a" en Clínica Aguachica.', false);


-- ══════════════════════════════════════════════
-- PASO 8: Crear identities para que el login funcione
-- ══════════════════════════════════════════════

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
SELECT id, id, json_build_object('sub', id, 'email', email)::jsonb, 'email', id, now(), now(), now()
FROM auth.users
WHERE id IN (
  'a1111111-1111-1111-1111-111111111111',
  'a2222222-2222-2222-2222-222222222222',
  'a3333333-3333-3333-3333-333333333333',
  'b1111111-1111-1111-1111-111111111111',
  'b2222222-2222-2222-2222-222222222222',
  'b3333333-3333-3333-3333-333333333333'
);


-- ✅ LISTO
-- Usuarios de prueba:
-- ┌──────────────────────┬──────────────────────┬────────────┐
-- │ CORREO               │ CONTRASEÑA           │ ROL        │
-- ├──────────────────────┼──────────────────────┼────────────┤
-- │ maria@localwork.co   │ Test1234!            │ employer   │
-- │ carlos@localwork.co  │ Test1234!            │ employer   │
-- │ ana@localwork.co     │ Test1234!            │ employer   │
-- │ juan@localwork.co    │ Test1234!            │ seeker     │
-- │ laura@localwork.co   │ Test1234!            │ seeker     │
-- │ pedro@localwork.co   │ Test1234!            │ seeker     │
-- └──────────────────────┴──────────────────────┴────────────┘
