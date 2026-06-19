-- 1. Add partner_accountant role to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_accountant';

-- 2. Partner profile: link auth.user to ACCOUNTANTS catalog slug
CREATE TABLE IF NOT EXISTS public.partner_profiles (
  user_id uuid PRIMARY KEY,
  accountant_slug text UNIQUE NOT NULL,
  is_certified boolean NOT NULL DEFAULT false,
  certified_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partner profiles"
ON public.partner_profiles FOR SELECT
USING (status = 'active');

CREATE POLICY "Users manage own partner profile"
ON public.partner_profiles FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage all partner profiles"
ON public.partner_profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_partner_profiles_updated_at
BEFORE UPDATE ON public.partner_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Engagement requests: client → accountant
CREATE TABLE IF NOT EXISTS public.partner_engagement_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_user_id uuid NOT NULL,
  client_email text,
  client_name text,
  accountant_slug text NOT NULL,
  cabinet_id text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT partner_engagement_requests_status_check
    CHECK (status IN ('pending','accepted','declined','expired','cancelled'))
);

ALTER TABLE public.partner_engagement_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own engagement requests"
ON public.partner_engagement_requests FOR SELECT
USING (client_user_id = auth.uid());

CREATE POLICY "Clients can create engagement requests"
ON public.partner_engagement_requests FOR INSERT
WITH CHECK (
  client_user_id = auth.uid()
  AND length(coalesce(message, '')) <= 2000
  AND length(accountant_slug) <= 200
);

CREATE POLICY "Clients can cancel own pending requests"
ON public.partner_engagement_requests FOR UPDATE
USING (client_user_id = auth.uid() AND status = 'pending')
WITH CHECK (client_user_id = auth.uid() AND status IN ('pending','cancelled'));

CREATE POLICY "Partners view requests addressed to them"
ON public.partner_engagement_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.partner_profiles pp
    WHERE pp.user_id = auth.uid()
      AND pp.accountant_slug = partner_engagement_requests.accountant_slug
  )
);

CREATE POLICY "Partners respond to requests addressed to them"
ON public.partner_engagement_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.partner_profiles pp
    WHERE pp.user_id = auth.uid()
      AND pp.accountant_slug = partner_engagement_requests.accountant_slug
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.partner_profiles pp
    WHERE pp.user_id = auth.uid()
      AND pp.accountant_slug = partner_engagement_requests.accountant_slug
  )
);

CREATE POLICY "Admins manage all engagement requests"
ON public.partner_engagement_requests FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_per_accountant_status
  ON public.partner_engagement_requests(accountant_slug, status);
CREATE INDEX idx_per_client
  ON public.partner_engagement_requests(client_user_id, created_at DESC);