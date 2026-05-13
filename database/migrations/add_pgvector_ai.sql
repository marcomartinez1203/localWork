-- ============================================
-- Migración: Habilitar IA con pgvector
-- ============================================

-- 1. Habilitar la extensión (requiere permisos de superusuario en Supabase)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Añadir columnas de embedding (vector de 384 dimensiones para all-MiniLM-L6-v2)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding vector(384);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 3. Crear índices HNSW para búsqueda súper rápida por distancia de coseno
CREATE INDEX IF NOT EXISTS profiles_embedding_idx ON profiles USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS jobs_embedding_idx ON jobs USING hnsw (embedding vector_cosine_ops);

-- 4. Función de búsqueda semántica de empleos
-- Retorna las ofertas que más se acercan al vector del buscador
CREATE OR REPLACE FUNCTION match_jobs(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  company_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    j.id,
    j.title,
    j.company_id,
    1 - (j.embedding <=> query_embedding) AS similarity
  FROM jobs j
  WHERE j.status = 'active' AND 1 - (j.embedding <=> query_embedding) > match_threshold
  ORDER BY j.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
