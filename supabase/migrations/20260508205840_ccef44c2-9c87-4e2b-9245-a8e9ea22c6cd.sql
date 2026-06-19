
-- 1. partner_client_links: commission fields
ALTER TABLE public.partner_client_links
  ADD COLUMN IF NOT EXISTS commission_rate numeric NOT NULL DEFAULT 0.10,
  ADD COLUMN IF NOT EXISTS commission_basis text NOT NULL DEFAULT 'turnover_uah',
  ADD COLUMN IF NOT EXISTS attribution_verified_at timestamptz;

-- 2. ai_credit_wallets: daily quota for Start plan
ALTER TABLE public.ai_credit_wallets
  ADD COLUMN IF NOT EXISTS daily_quota_used_today integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_quota_date date NOT NULL DEFAULT CURRENT_DATE;

-- 3. integration_sync_settings
CREATE TABLE IF NOT EXISTS public.integration_sync_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text NOT NULL,
  user_id uuid NOT NULL,
  operation_type text NOT NULL,
  frequency text NOT NULL DEFAULT 'monthly',
  count_per_period integer NOT NULL DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cabinet_id, user_id, operation_type)
);

ALTER TABLE public.integration_sync_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cabinet members read sync settings"
  ON public.integration_sync_settings FOR SELECT
  USING (is_cabinet_member(cabinet_id, auth.uid()));

CREATE POLICY "User manages own sync settings"
  ON public.integration_sync_settings FOR ALL
  USING (user_id = auth.uid() AND is_cabinet_member(cabinet_id, auth.uid()))
  WITH CHECK (user_id = auth.uid() AND is_cabinet_member(cabinet_id, auth.uid()));

CREATE POLICY "Admin manages sync settings"
  ON public.integration_sync_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER integration_sync_settings_updated_at
  BEFORE UPDATE ON public.integration_sync_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. partner_commission_ledger
CREATE TABLE IF NOT EXISTS public.partner_commission_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id uuid NOT NULL,
  client_link_id uuid NOT NULL,
  cabinet_id text NOT NULL,
  period text NOT NULL, -- 'YYYY-MM'
  client_uah_spent numeric NOT NULL DEFAULT 0,
  commission_uah numeric NOT NULL DEFAULT 0,
  commission_rate numeric NOT NULL DEFAULT 0.10,
  status text NOT NULL DEFAULT 'accrued', -- accrued | paid | held
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_link_id, period)
);

ALTER TABLE public.partner_commission_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner reads own commission"
  ON public.partner_commission_ledger FOR SELECT
  USING (partner_user_id = auth.uid());

CREATE POLICY "Admin manages commission ledger"
  ON public.partner_commission_ledger FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER partner_commission_ledger_updated_at
  BEFORE UPDATE ON public.partner_commission_ledger
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. accrue_partner_commission(period) — placeholder that reads from ai_credit_transactions metadata.
-- Real "payments" table doesn't exist yet; we estimate turnover from gross_credits_uah in metadata.
CREATE OR REPLACE FUNCTION public.accrue_partner_commission(_period text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row record;
  _spent numeric;
  _commission numeric;
  _count integer := 0;
BEGIN
  FOR _row IN
    SELECT pcl.id AS link_id, pcl.partner_user_id, pcl.cabinet_id, pcl.commission_rate
    FROM public.partner_client_links pcl
    WHERE pcl.status = 'active'
      AND pcl.attribution_verified_at IS NOT NULL
  LOOP
    SELECT COALESCE(SUM((act.metadata->>'gross_credits_uah')::numeric), 0)
      INTO _spent
    FROM public.ai_credit_transactions act
    WHERE act.cabinet_id = _row.cabinet_id
      AND to_char(act.created_at, 'YYYY-MM') = _period;

    _commission := round(_spent * _row.commission_rate, 2);

    INSERT INTO public.partner_commission_ledger
      (partner_user_id, client_link_id, cabinet_id, period,
       client_uah_spent, commission_uah, commission_rate, status)
    VALUES (_row.partner_user_id, _row.link_id, _row.cabinet_id, _period,
            _spent, _commission, _row.commission_rate, 'accrued')
    ON CONFLICT (client_link_id, period) DO UPDATE
      SET client_uah_spent = EXCLUDED.client_uah_spent,
          commission_uah = EXCLUDED.commission_uah,
          updated_at = now();

    _count := _count + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'period', _period, 'links_processed', _count);
END $$;
