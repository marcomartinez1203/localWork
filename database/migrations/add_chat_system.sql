-- ============================================
-- LocalWork — Chat directo por postulación
-- ============================================

-- 1) Conversaciones (1 por postulación)
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
  seeker_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conversations_seeker ON conversations(seeker_id);
CREATE INDEX IF NOT EXISTS idx_conversations_employer ON conversations(employer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC NULLS LAST);

-- 2) Mensajes
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content          TEXT,
  attachment_url   TEXT,
  attachment_name  TEXT,
  attachment_type  TEXT,
  read_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_message_payload CHECK (
    (content IS NOT NULL AND btrim(content) <> '')
    OR attachment_url IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);

-- 3) Trigger updated_at / last_message_at de conversación
CREATE OR REPLACE FUNCTION touch_conversation_after_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    updated_at = now(),
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_touch_conversation_after_message ON messages;
CREATE TRIGGER trg_touch_conversation_after_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION touch_conversation_after_message();

-- 4) Trigger updated_at en conversaciones
DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5) RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversaciones: solo participantes
DROP POLICY IF EXISTS "Participantes ven conversaciones" ON conversations;
CREATE POLICY "Participantes ven conversaciones"
  ON conversations FOR SELECT
  USING (auth.uid() = seeker_id OR auth.uid() = employer_id);

DROP POLICY IF EXISTS "Participantes crean conversaciones" ON conversations;
CREATE POLICY "Participantes crean conversaciones"
  ON conversations FOR INSERT
  WITH CHECK (
    auth.uid() = seeker_id
    OR auth.uid() = employer_id
  );

DROP POLICY IF EXISTS "Participantes actualizan conversaciones" ON conversations;
CREATE POLICY "Participantes actualizan conversaciones"
  ON conversations FOR UPDATE
  USING (auth.uid() = seeker_id OR auth.uid() = employer_id);

-- Mensajes: participantes ven/crean y cada uno marca lectura de mensajes que recibe
DROP POLICY IF EXISTS "Participantes ven mensajes" ON messages;
CREATE POLICY "Participantes ven mensajes"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.seeker_id OR auth.uid() = c.employer_id)
    )
  );

DROP POLICY IF EXISTS "Participantes envian mensajes" ON messages;
CREATE POLICY "Participantes envian mensajes"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.seeker_id OR auth.uid() = c.employer_id)
    )
  );

DROP POLICY IF EXISTS "Participantes marcan lectura de mensajes" ON messages;
CREATE POLICY "Participantes marcan lectura de mensajes"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (auth.uid() = c.seeker_id OR auth.uid() = c.employer_id)
    )
  );
