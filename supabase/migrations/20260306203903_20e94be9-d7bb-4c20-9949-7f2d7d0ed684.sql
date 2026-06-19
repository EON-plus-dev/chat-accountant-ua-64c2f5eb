CREATE TABLE public.pre_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text NOT NULL,
  phone text,
  user_type text,
  audience text NOT NULL DEFAULT 'business',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pre_registrations_email_unique UNIQUE (email)
);

ALTER TABLE public.pre_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pre-registrations"
  ON public.pre_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can select pre-registrations"
  ON public.pre_registrations
  FOR SELECT
  USING (false);

CREATE POLICY "No one can delete pre-registrations"
  ON public.pre_registrations
  FOR DELETE
  USING (false);