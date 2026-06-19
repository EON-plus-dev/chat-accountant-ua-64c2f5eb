
-- 1. Розширення partner_profiles
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS active_clients_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_tier text NOT NULL DEFAULT 'starter',
  ADD COLUMN IF NOT EXISTS discount_mode text NOT NULL DEFAULT 'to_client';

-- 2. Таблиця зв'язків партнер ↔ клієнт
CREATE TABLE IF NOT EXISTS public.partner_client_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id uuid NOT NULL,
  accountant_slug text NOT NULL,
  cabinet_id text NOT NULL,
  client_owner_user_id uuid NOT NULL,
  plan_id text,
  discount_percent integer NOT NULL,
  discount_mode text NOT NULL DEFAULT 'to_client',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_user_id, cabinet_id)
);

CREATE INDEX IF NOT EXISTS idx_pcl_partner ON public.partner_client_links(partner_user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pcl_client ON public.partner_client_links(client_owner_user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pcl_cabinet ON public.partner_client_links(cabinet_id) WHERE status = 'active';

ALTER TABLE public.partner_client_links ENABLE ROW LEVEL SECURITY;

-- RLS
CREATE POLICY "Admins manage all partner client links"
  ON public.partner_client_links FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners view own links"
  ON public.partner_client_links FOR SELECT
  USING (partner_user_id = auth.uid());

CREATE POLICY "Partners update own links"
  ON public.partner_client_links FOR UPDATE
  USING (partner_user_id = auth.uid())
  WITH CHECK (partner_user_id = auth.uid());

CREATE POLICY "Clients view own link"
  ON public.partner_client_links FOR SELECT
  USING (client_owner_user_id = auth.uid());

-- updated_at trigger
CREATE TRIGGER partner_client_links_updated_at
  BEFORE UPDATE ON public.partner_client_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Функція визначення тіру
CREATE OR REPLACE FUNCTION public.get_partner_tier(_count integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _count >= 51 THEN 'senior'
    WHEN _count >= 11 THEN 'growth'
    ELSE 'starter'
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_partner_discount_percent(_tier text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE _tier
    WHEN 'senior' THEN 35
    WHEN 'growth' THEN 30
    ELSE 25
  END;
$$;

-- 4. Тригер перерахунку лічильника та тіру партнера
CREATE OR REPLACE FUNCTION public.recalc_partner_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _partner uuid;
  _count integer;
  _tier text;
BEGIN
  _partner := COALESCE(NEW.partner_user_id, OLD.partner_user_id);

  SELECT count(*) INTO _count
  FROM public.partner_client_links
  WHERE partner_user_id = _partner AND status = 'active';

  _tier := public.get_partner_tier(_count);

  UPDATE public.partner_profiles
  SET active_clients_count = _count,
      current_tier = _tier,
      updated_at = now()
  WHERE user_id = _partner;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER partner_client_links_recalc
  AFTER INSERT OR UPDATE OF status OR DELETE ON public.partner_client_links
  FOR EACH ROW EXECUTE FUNCTION public.recalc_partner_tier();
