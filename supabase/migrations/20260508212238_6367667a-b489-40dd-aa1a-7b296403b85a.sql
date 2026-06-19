
-- 1. Commission runs log
CREATE TABLE public.partner_commission_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period text NOT NULL,
  links_processed integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  error text,
  triggered_by text NOT NULL DEFAULT 'cron',
  triggered_by_user uuid,
  ran_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pcr_period ON public.partner_commission_runs(period);
CREATE INDEX idx_pcr_ran_at ON public.partner_commission_runs(ran_at DESC);
ALTER TABLE public.partner_commission_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manages commission runs" ON public.partner_commission_runs
  FOR ALL USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));

-- 2. Extend partner_profiles
ALTER TABLE public.partner_profiles
  ADD COLUMN IF NOT EXISTS payout_method text,
  ADD COLUMN IF NOT EXISTS payout_iban text,
  ADD COLUMN IF NOT EXISTS payout_card_last4 text,
  ADD COLUMN IF NOT EXISTS payout_recipient_name text,
  ADD COLUMN IF NOT EXISTS payout_min_uah numeric NOT NULL DEFAULT 500;

-- 3. Payouts table
CREATE TABLE public.partner_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id uuid NOT NULL,
  period_from text NOT NULL,
  period_to text NOT NULL,
  amount_uah numeric NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  method text NOT NULL DEFAULT 'manual',
  recipient_name text,
  iban text,
  card_last4 text,
  reference text,
  note text,
  processed_by uuid,
  rejected_reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pp_partner ON public.partner_payouts(partner_user_id);
CREATE INDEX idx_pp_status ON public.partner_payouts(status);
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages payouts" ON public.partner_payouts
  FOR ALL USING (has_role(auth.uid(),'admin'))
  WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Partner reads own payouts" ON public.partner_payouts
  FOR SELECT USING (partner_user_id = auth.uid());

CREATE TRIGGER trg_pp_updated
  BEFORE UPDATE ON public.partner_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Link ledger to payout
ALTER TABLE public.partner_commission_ledger
  ADD COLUMN IF NOT EXISTS payout_id uuid;

-- 5. RPC: run accrual with logging
CREATE OR REPLACE FUNCTION public.run_commission_accrual_logged(_period text, _trigger text DEFAULT 'cron')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _res jsonb; _processed integer; _err text;
BEGIN
  BEGIN
    _res := public.accrue_partner_commission(_period);
    _processed := COALESCE((_res->>'links_processed')::integer, 0);
    INSERT INTO public.partner_commission_runs(period, links_processed, status, triggered_by, triggered_by_user)
      VALUES (_period, _processed, 'success', _trigger, auth.uid());
    RETURN jsonb_build_object('ok', true, 'period', _period, 'processed', _processed);
  EXCEPTION WHEN others THEN
    _err := SQLERRM;
    INSERT INTO public.partner_commission_runs(period, status, error, triggered_by, triggered_by_user)
      VALUES (_period, 'error', _err, _trigger, auth.uid());
    RETURN jsonb_build_object('ok', false, 'period', _period, 'error', _err);
  END;
END $$;

REVOKE ALL ON FUNCTION public.run_commission_accrual_logged(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_commission_accrual_logged(text, text) TO authenticated, service_role, anon;

-- 6. RPC: request payout
CREATE OR REPLACE FUNCTION public.request_partner_payout()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _profile record;
  _amount numeric;
  _min numeric;
  _period_min text;
  _period_max text;
  _payout_id uuid;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  SELECT * INTO _profile FROM public.partner_profiles WHERE user_id = _uid;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_partner_profile');
  END IF;
  IF _profile.payout_method IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'no_payout_method');
  END IF;

  _min := COALESCE(_profile.payout_min_uah, 500);

  SELECT COALESCE(SUM(commission_uah),0), MIN(period), MAX(period)
    INTO _amount, _period_min, _period_max
  FROM public.partner_commission_ledger
  WHERE partner_user_id = _uid AND status = 'accrued';

  IF _amount < _min THEN
    RETURN jsonb_build_object('ok', false, 'error', 'below_minimum', 'amount', _amount, 'min', _min);
  END IF;

  INSERT INTO public.partner_payouts(
    partner_user_id, period_from, period_to, amount_uah, status, method,
    recipient_name, iban, card_last4
  ) VALUES (
    _uid, _period_min, _period_max, _amount, 'requested', _profile.payout_method,
    _profile.payout_recipient_name, _profile.payout_iban, _profile.payout_card_last4
  ) RETURNING id INTO _payout_id;

  UPDATE public.partner_commission_ledger
    SET status = 'pending_payout', payout_id = _payout_id, updated_at = now()
    WHERE partner_user_id = _uid AND status = 'accrued';

  RETURN jsonb_build_object('ok', true, 'payout_id', _payout_id, 'amount', _amount);
END $$;

REVOKE ALL ON FUNCTION public.request_partner_payout() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_partner_payout() TO authenticated;

-- 7. RPC: mark payout paid (admin only)
CREATE OR REPLACE FUNCTION public.mark_partner_payout_paid(_payout_id uuid, _reference text DEFAULT NULL, _note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT has_role(_uid, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;
  UPDATE public.partner_payouts
    SET status='paid', paid_at=now(), reference=_reference, note=COALESCE(_note,note), processed_by=_uid, updated_at=now()
    WHERE id=_payout_id AND status IN ('requested','approved');
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found_or_invalid_status');
  END IF;
  UPDATE public.partner_commission_ledger
    SET status='paid', paid_at=now(), updated_at=now()
    WHERE payout_id=_payout_id;
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE ALL ON FUNCTION public.mark_partner_payout_paid(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_partner_payout_paid(uuid, text, text) TO authenticated;

-- 8. RPC: reject payout (admin only)
CREATE OR REPLACE FUNCTION public.reject_partner_payout(_payout_id uuid, _reason text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT has_role(_uid, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;
  UPDATE public.partner_payouts
    SET status='rejected', rejected_at=now(), rejected_reason=_reason, processed_by=_uid, updated_at=now()
    WHERE id=_payout_id AND status IN ('requested','approved');
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found_or_invalid_status');
  END IF;
  UPDATE public.partner_commission_ledger
    SET status='accrued', payout_id=NULL, updated_at=now()
    WHERE payout_id=_payout_id;
  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE ALL ON FUNCTION public.reject_partner_payout(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reject_partner_payout(uuid, text) TO authenticated;
