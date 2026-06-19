ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS seo_title text;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS seo_description text;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS seo_keywords text[];