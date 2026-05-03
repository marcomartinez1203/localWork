-- ============================================
-- LocalWork — Solicitudes de chat directo
-- ============================================

-- Permitir conversaciones directas sin postulación
ALTER TABLE conversations
  ALTER COLUMN application_id DROP NOT NULL;

-- Se mantiene la unicidad cuando application_id existe;
-- en NULL (chat directo) PostgreSQL permite múltiples filas.

-- Solicitudes de chat
CREATE TABLE IF NOT EXISTS chat_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  responded_at    TIMESTAMPTZ,
  CONSTRAINT chk_chat_request_users CHECK (sender_id <> target_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_requests_sender ON chat_requests(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_requests_target ON chat_requests(target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_requests_pending_target ON chat_requests(target_id) WHERE status = 'pending';

-- Evitar duplicados de solicitud pendiente en la misma dirección
CREATE UNIQUE INDEX IF NOT EXISTS chat_requests_unique_pending
  ON chat_requests(sender_id, target_id)
  WHERE status = 'pending';

DROP TRIGGER IF EXISTS trg_chat_requests_updated ON chat_requests;
CREATE TRIGGER trg_chat_requests_updated
  BEFORE UPDATE ON chat_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE chat_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participantes ven solicitudes de chat" ON chat_requests;
CREATE POLICY "Participantes ven solicitudes de chat"
  ON chat_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = target_id);

DROP POLICY IF EXISTS "Usuarios crean solicitudes propias" ON chat_requests;
CREATE POLICY "Usuarios crean solicitudes propias"
  ON chat_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Receptor responde solicitudes" ON chat_requests;
CREATE POLICY "Receptor responde solicitudes"
  ON chat_requests FOR UPDATE
  USING (auth.uid() = target_id OR auth.uid() = sender_id);
