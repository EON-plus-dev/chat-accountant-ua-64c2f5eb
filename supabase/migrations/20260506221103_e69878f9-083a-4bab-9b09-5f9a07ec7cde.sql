
CREATE TABLE public.partner_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  clients_count INTEGER,
  message TEXT,
  source TEXT NOT NULL DEFAULT 'partners_program_pitch',
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit partner leads"
  ON public.partner_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL AND length(trim(name)) BETWEEN 2 AND 100
    AND contact IS NOT NULL AND length(trim(contact)) BETWEEN 3 AND 200
    AND (message IS NULL OR length(message) <= 2000)
    AND (clients_count IS NULL OR (clients_count >= 0 AND clients_count <= 100000))
    AND length(source) <= 100
  );

CREATE POLICY "Admins can view partner leads"
  ON public.partner_leads
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update partner leads"
  ON public.partner_leads
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete partner leads"
  ON public.partner_leads
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));
