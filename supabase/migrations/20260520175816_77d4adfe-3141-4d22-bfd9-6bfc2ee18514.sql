
-- cms_settings
CREATE TABLE public.cms_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  scope text NOT NULL DEFAULT 'global',
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cms_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage cms_settings" ON public.cms_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cms_settings_updated_at
  BEFORE UPDATE ON public.cms_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- article_revisions
CREATE TABLE public.article_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL,
  field text NOT NULL,
  before_value text,
  after_value text,
  author_id uuid,
  author_email text,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_article_revisions_slug_created ON public.article_revisions(article_slug, created_at DESC);
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage article_revisions" ON public.article_revisions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- cms_chat_threads
CREATE TABLE public.cms_chat_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cms_chat_threads_user_created ON public.cms_chat_threads(user_id, created_at DESC);
ALTER TABLE public.cms_chat_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read own cms_chat_threads" ON public.cms_chat_threads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert own cms_chat_threads" ON public.cms_chat_threads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update own cms_chat_threads" ON public.cms_chat_threads
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete own cms_chat_threads" ON public.cms_chat_threads
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_cms_chat_threads_updated_at
  BEFORE UPDATE ON public.cms_chat_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- cms_chat_messages
CREATE TABLE public.cms_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.cms_chat_threads(id) ON DELETE CASCADE,
  role text NOT NULL,
  parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cms_chat_messages_thread_created ON public.cms_chat_messages(thread_id, created_at);
ALTER TABLE public.cms_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read messages of own threads" ON public.cms_chat_messages
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.cms_chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Admins insert messages in own threads" ON public.cms_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.cms_chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );
CREATE POLICY "Admins delete messages of own threads" ON public.cms_chat_messages
  FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND EXISTS (SELECT 1 FROM public.cms_chat_threads t WHERE t.id = thread_id AND t.user_id = auth.uid())
  );
