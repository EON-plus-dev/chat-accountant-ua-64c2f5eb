
-- Drop dependent index first, then move extension, then recreate index
DROP INDEX IF EXISTS public.idx_consultations_trgm_question;
DROP EXTENSION IF EXISTS pg_trgm;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Recreate the trigram index (now using extensions schema operator class)
CREATE INDEX idx_consultations_trgm_question ON public.consultations USING gin (question extensions.gin_trgm_ops);
