
-- Enable pg_trgm for similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  email TEXT,
  audience TEXT NOT NULL DEFAULT 'business',
  tags TEXT[] DEFAULT '{}',
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE,
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(question, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(answer, '')), 'B')
  ) STORED
);

-- Indexes
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_audience ON public.consultations(audience);
CREATE INDEX idx_consultations_search ON public.consultations USING GIN(search_vector);
CREATE INDEX idx_consultations_trgm_question ON public.consultations USING GIN(question gin_trgm_ops);
CREATE INDEX idx_consultations_slug ON public.consultations(slug);
CREATE INDEX idx_consultations_published_at ON public.consultations(published_at DESC);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Public can read published consultations
CREATE POLICY "Anyone can view published consultations"
  ON public.consultations
  FOR SELECT
  USING (status = 'published');

-- Service role inserts via edge function (no user auth needed for insert)
CREATE POLICY "Service role can insert consultations"
  ON public.consultations
  FOR INSERT
  WITH CHECK (true);

-- Service role can update
CREATE POLICY "Service role can update consultations"
  ON public.consultations
  FOR UPDATE
  USING (true);

-- No public delete
CREATE POLICY "No one can delete consultations"
  ON public.consultations
  FOR DELETE
  USING (false);
