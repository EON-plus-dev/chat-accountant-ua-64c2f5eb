CREATE TABLE public.course_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL,
  course_id text NOT NULL,
  course_title text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  user_id uuid,
  issued_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can verify certificates"
  ON public.course_certificates FOR SELECT
  USING (true);

CREATE POLICY "Anyone can issue valid certificates"
  ON public.course_certificates FOR INSERT
  WITH CHECK (
    length(trim(full_name)) BETWEEN 2 AND 120
    AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    AND length(course_id) <= 100
    AND length(course_title) <= 250
    AND length(certificate_number) BETWEEN 6 AND 40
  );

CREATE INDEX idx_course_certificates_number ON public.course_certificates (certificate_number);
CREATE INDEX idx_course_certificates_email ON public.course_certificates (lower(email));