CREATE TABLE public.content_idea_generations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id uuid NOT NULL,
  page_path text NOT NULL,
  version integer NOT NULL,
  status text NOT NULL DEFAULT 'success',
  prompt_topic text NOT NULL,
  prompt_description text,
  prompt_tags text[] NOT NULL DEFAULT '{}',
  prompt_audience text,
  prompt_content_target text,
  model text,
  system_prompt_version text,
  generated_title text,
  generated_tldr text,
  generated_content text,
  generated_word_count integer,
  generated_seo_title text,
  generated_seo_description text,
  error_message text,
  duration_ms integer,
  source_ref text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cig_idea_version ON public.content_idea_generations (idea_id, version DESC);
CREATE INDEX idx_cig_page_created ON public.content_idea_generations (page_path, created_at DESC);

ALTER TABLE public.content_idea_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage all idea generations"
ON public.content_idea_generations
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));