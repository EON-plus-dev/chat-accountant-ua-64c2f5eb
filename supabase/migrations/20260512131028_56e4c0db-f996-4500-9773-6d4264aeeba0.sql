ALTER TABLE public.content_ideas
  ADD COLUMN generated_content text,
  ADD COLUMN generated_tldr text,
  ADD COLUMN generated_seo_title text,
  ADD COLUMN generated_seo_description text,
  ADD COLUMN generated_word_count integer,
  ADD COLUMN generated_at timestamptz;