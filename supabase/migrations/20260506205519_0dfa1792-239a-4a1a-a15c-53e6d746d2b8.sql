ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS plan_id text NOT NULL DEFAULT 'solo',
  ADD COLUMN IF NOT EXISTS seat_limit int;

UPDATE public.partner_profiles SET
  plan_id = CASE current_tier
    WHEN 'senior' THEN 'firm'
    WHEN 'growth' THEN 'agency'
    WHEN 'firm' THEN 'firm'
    WHEN 'agency' THEN 'agency'
    ELSE 'solo' END,
  seat_limit = CASE current_tier
    WHEN 'senior' THEN NULL
    WHEN 'firm' THEN NULL
    WHEN 'growth' THEN 5
    WHEN 'agency' THEN 5
    ELSE 1 END,
  current_tier = CASE current_tier
    WHEN 'senior' THEN 'firm'
    WHEN 'growth' THEN 'agency'
    WHEN 'starter' THEN 'solo'
    ELSE current_tier END;

ALTER TABLE public.partner_profiles
  ALTER COLUMN current_tier SET DEFAULT 'solo';

CREATE OR REPLACE FUNCTION public.get_partner_discount_percent(_tier text)
RETURNS integer LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE _tier WHEN 'firm' THEN 35 WHEN 'agency' THEN 30 ELSE 25 END;
$$;

DROP FUNCTION IF EXISTS public.recalc_partner_tier() CASCADE;
DROP FUNCTION IF EXISTS public.get_partner_tier(integer);

CREATE OR REPLACE FUNCTION public.recalc_partner_active_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _partner uuid; _count integer;
BEGIN
  _partner := COALESCE(NEW.partner_user_id, OLD.partner_user_id);
  SELECT count(*) INTO _count FROM public.partner_client_links
    WHERE partner_user_id = _partner AND status = 'active';
  UPDATE public.partner_profiles
    SET active_clients_count = _count, updated_at = now()
    WHERE user_id = _partner;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_recalc_partner_active_count ON public.partner_client_links;
CREATE TRIGGER trg_recalc_partner_active_count
AFTER INSERT OR UPDATE OR DELETE ON public.partner_client_links
FOR EACH ROW EXECUTE FUNCTION public.recalc_partner_active_count();

CREATE OR REPLACE FUNCTION public.close_partner_link_on_member_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _user uuid; _cab text; _still_active boolean;
BEGIN
  IF TG_OP = 'DELETE' THEN
    _user := OLD.user_id; _cab := OLD.cabinet_id;
  ELSE
    _user := NEW.user_id; _cab := NEW.cabinet_id;
    IF NEW.status = 'active' THEN RETURN NEW; END IF;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.cabinet_members
    WHERE user_id = _user AND cabinet_id = _cab AND status = 'active'
  ) INTO _still_active;

  IF NOT _still_active THEN
    UPDATE public.partner_client_links
      SET status = 'ended', ended_at = now(), updated_at = now()
      WHERE partner_user_id = _user AND cabinet_id = _cab AND status = 'active';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_close_partner_link_on_member_change ON public.cabinet_members;
CREATE TRIGGER trg_close_partner_link_on_member_change
AFTER UPDATE OR DELETE ON public.cabinet_members
FOR EACH ROW EXECUTE FUNCTION public.close_partner_link_on_member_change();