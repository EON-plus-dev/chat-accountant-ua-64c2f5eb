-- Enums
CREATE TYPE public.messenger_provider AS ENUM ('telegram', 'viber');
CREATE TYPE public.messenger_connection_status AS ENUM ('disconnected', 'pending', 'connected', 'error');

-- Table
CREATE TABLE public.user_messenger_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider public.messenger_provider NOT NULL,
  status public.messenger_connection_status NOT NULL DEFAULT 'disconnected',
  external_chat_id text,
  external_username text,
  pairing_code text,
  pairing_code_expires_at timestamptz,
  connected_at timestamptz,
  last_message_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

CREATE INDEX idx_umc_user ON public.user_messenger_connections(user_id);
CREATE INDEX idx_umc_provider_chat ON public.user_messenger_connections(provider, external_chat_id);
CREATE INDEX idx_umc_pairing ON public.user_messenger_connections(pairing_code) WHERE pairing_code IS NOT NULL;

-- RLS
ALTER TABLE public.user_messenger_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messenger connections"
  ON public.user_messenger_connections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own messenger connections"
  ON public.user_messenger_connections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own messenger connections"
  ON public.user_messenger_connections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own messenger connections"
  ON public.user_messenger_connections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_user_messenger_connections_updated_at
  BEFORE UPDATE ON public.user_messenger_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();