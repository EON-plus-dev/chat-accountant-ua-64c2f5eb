
CREATE OR REPLACE FUNCTION public.verify_partner_attribution_on_spend()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only paid spend signals "real client" — skip free-quota usage
  IF NEW.credits_spent <= 0 OR NEW.cabinet_id IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.partner_client_links
    SET attribution_verified_at = COALESCE(attribution_verified_at, now())
    WHERE cabinet_id = NEW.cabinet_id
      AND status = 'active'
      AND attribution_verified_at IS NULL;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS verify_partner_attribution ON public.ai_credit_transactions;
CREATE TRIGGER verify_partner_attribution
  AFTER INSERT ON public.ai_credit_transactions
  FOR EACH ROW EXECUTE FUNCTION public.verify_partner_attribution_on_spend();
