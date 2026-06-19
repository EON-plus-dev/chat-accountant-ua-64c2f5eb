
-- Conversations
CREATE TABLE public.cabinet_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cabinet_id text NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cabinet_chat_conversations_user_cabinet
  ON public.cabinet_chat_conversations(user_id, cabinet_id, updated_at DESC);

ALTER TABLE public.cabinet_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.cabinet_chat_conversations FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own conversations"
  ON public.cabinet_chat_conversations FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON public.cabinet_chat_conversations FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
  ON public.cabinet_chat_conversations FOR DELETE
  TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER set_cabinet_chat_conversations_updated_at
  BEFORE UPDATE ON public.cabinet_chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Messages
CREATE TABLE public.cabinet_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.cabinet_chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user','assistant','tool')),
  content text NOT NULL,
  tool_payload jsonb,
  pinned boolean NOT NULL DEFAULT false,
  pin_label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cabinet_chat_messages_conversation
  ON public.cabinet_chat_messages(conversation_id, created_at);

ALTER TABLE public.cabinet_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON public.cabinet_chat_messages FOR SELECT
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messages"
  ON public.cabinet_chat_messages FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own messages"
  ON public.cabinet_chat_messages FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON public.cabinet_chat_messages FOR DELETE
  TO authenticated USING (user_id = auth.uid());
