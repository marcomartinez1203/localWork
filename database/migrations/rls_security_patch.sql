-- ============================================
-- Mejora de Seguridad RLS (Row Level Security)
-- ============================================

-- 1. Asegurar que TODAS las tablas tengan RLS habilitado por si acaso
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE barrios ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;

-- 2. CORRECCIÓN CRÍTICA: Proteger correos y teléfonos en "profiles"
-- Actualmente "profiles" tiene SELECT USING (true), lo que expone emails a la Anon Key.
-- Solución: Restringir la vista pública de perfiles. 
-- Como tu backend usa la Service Role Key (supabaseAdmin), la API seguirá funcionando perfectamente.

DROP POLICY IF EXISTS "Perfiles visibles para todos" ON profiles;

-- Solo los usuarios pueden ver todos sus propios datos (incluyendo email/phone)
CREATE POLICY "Usuarios ven su propio perfil completo"
  ON profiles FOR SELECT USING (auth.uid() = id);

-- Para permitir que la base de datos funcione internamente y si alguna vista lo necesita, 
-- creamos una política que permita lectura pública pero ocultando datos sensibles, 
-- aunque en PostgreSQL RLS filtra filas completas. Como el backend usa Admin Key, 
-- basta con que la Anon Key solo pueda leer su propio perfil.

-- 3. RATINGS: Faltaba política de eliminación (DELETE)
-- Aunque el backend lo controla, es buena práctica asegurarlo a nivel BD.
DROP POLICY IF EXISTS "Usuarios eliminan sus calificaciones" ON ratings;
CREATE POLICY "Usuarios eliminan sus calificaciones"
  ON ratings FOR DELETE USING (auth.uid() = rater_id);

-- 4. RATINGS: Faltaba política de actualización (UPDATE)
DROP POLICY IF EXISTS "Usuarios actualizan sus calificaciones" ON ratings;
CREATE POLICY "Usuarios actualizan sus calificaciones"
  ON ratings FOR UPDATE USING (auth.uid() = rater_id);
