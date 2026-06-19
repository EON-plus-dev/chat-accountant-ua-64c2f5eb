CREATE TABLE public.content_ideas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text NOT NULL,
  title text NOT NULL,
  description text,
  content_target text NOT NULL DEFAULT 'article' CHECK (content_target IN ('article','page-section','none')),
  audience text NOT NULL DEFAULT 'business' CHECK (audience IN ('business','individual','fop')),
  tags text[] NOT NULL DEFAULT '{}',
  priority smallint NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','generating','generated','published','dismissed')),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('ai_chat_query','seo_gap','manual','ai_suggested')),
  source_ref text,
  generated_article_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_ideas_page_path ON public.content_ideas(page_path);
CREATE INDEX idx_content_ideas_status ON public.content_ideas(status);

ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all content ideas"
  ON public.content_ideas FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_content_ideas_updated_at
  BEFORE UPDATE ON public.content_ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();