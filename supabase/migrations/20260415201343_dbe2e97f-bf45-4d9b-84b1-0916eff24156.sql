
-- Table for AI chat queries that flow into the forum
CREATE TABLE public.ai_chat_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  question text NOT NULL,
  ai_answer text NOT NULL,
  audience text NOT NULL DEFAULT 'business',
  tags text[] DEFAULT '{}'::text[],
  slug text,
  status text NOT NULL DEFAULT 'pending',
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz,
  published_at timestamptz
);

-- Index for status filtering
CREATE INDEX idx_ai_chat_queries_status ON public.ai_chat_queries(status);
CREATE INDEX idx_ai_chat_queries_created ON public.ai_chat_queries(created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_chat_queries ENABLE ROW LEVEL SECURITY;

-- Anyone can view published queries (for the forum)
CREATE POLICY "Anyone can view published ai queries"
  ON public.ai_chat_queries FOR SELECT
  USING (status = 'published');

-- Admins can view all queries (for moderation)
CREATE POLICY "Admins can view all ai queries"
  ON public.ai_chat_queries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anon and authenticated can insert (from chat)
CREATE POLICY "Anyone can insert ai queries"
  ON public.ai_chat_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can update (moderation)
CREATE POLICY "Admins can update ai queries"
  ON public.ai_chat_queries FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete ai queries"
  ON public.ai_chat_queries FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for live moderation updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_chat_queries;
