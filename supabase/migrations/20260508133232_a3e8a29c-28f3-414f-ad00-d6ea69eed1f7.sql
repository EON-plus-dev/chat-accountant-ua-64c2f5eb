
-- 1. Per-operation billing payer overrides
ALTER TABLE public.direct_delegations
  ADD COLUMN IF NOT EXISTS billing_payer_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.partner_client_links
  ADD COLUMN IF NOT EXISTS billing_payer_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.partner_employee_assignments
  ADD COLUMN IF NOT EXISTS billing_payer_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Updated resolve_billing_wallet that respects per-operation overrides
CREATE OR REPLACE FUNCTION public.resolve_billing_wallet(
  _cabinet_id text,
  _acting_user uuid,
  _operation_type text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _owner_id uuid;
  _payer text;
  _payer_user uuid;
  _delegation_kind text;
  _delegation_id uuid;
  _wallet_owner_type text;
  _wallet_owner_id text;
  _wallet_id uuid;
  _balance numeric;
  _pea record;
  _dd record;
  _override text;
BEGIN
  SELECT user_id INTO _owner_id FROM public.cabinet_members
  WHERE cabinet_id = _cabinet_id AND role = 'owner' AND status = 'active' LIMIT 1;

  IF _owner_id = _acting_user THEN
    _payer := 'cabinet_owner'; _payer_user := _owner_id;
    _delegation_kind := 'owner'; _delegation_id := NULL;
    _wallet_owner_type := 'user'; _wallet_owner_id := _owner_id::text;
  ELSE
    SELECT * INTO _dd FROM public.direct_delegations
    WHERE cabinet_id = _cabinet_id AND delegate_user_id = _acting_user AND status = 'active'
    LIMIT 1;
    IF FOUND THEN
      _delegation_kind := 'direct'; _delegation_id := _dd.id;
      _payer := _dd.billing_payer;
      IF _operation_type IS NOT NULL THEN
        _override := _dd.billing_payer_overrides ->> _operation_type;
        IF _override IN ('cabinet_owner','delegate') THEN _payer := _override; END IF;
      END IF;
      IF _payer = 'cabinet_owner' THEN
        _payer_user := _owner_id;
        _wallet_owner_type := 'user'; _wallet_owner_id := _owner_id::text;
      ELSE
        _payer_user := _acting_user;
        _wallet_owner_type := 'user'; _wallet_owner_id := _acting_user::text;
      END IF;
    ELSE
      SELECT pea.*, pcl.billing_payer AS link_payer,
             pcl.billing_payer_overrides AS link_overrides,
             pcl.partner_user_id AS link_partner_user_id
      INTO _pea
      FROM public.partner_employee_assignments pea
      JOIN public.partner_client_links pcl ON pcl.id = pea.client_link_id
      WHERE pcl.cabinet_id = _cabinet_id
        AND pea.employee_user_id = _acting_user
        AND pea.status = 'active' AND pcl.status = 'active'
      LIMIT 1;
      IF FOUND THEN
        _delegation_kind := 'partner_employee'; _delegation_id := _pea.id;
        _payer := COALESCE(_pea.billing_payer_override, _pea.link_payer);
        IF _operation_type IS NOT NULL THEN
          _override := COALESCE(
            _pea.billing_payer_overrides ->> _operation_type,
            _pea.link_overrides ->> _operation_type
          );
          IF _override IN ('cabinet_owner','delegate') THEN _payer := _override; END IF;
        END IF;
        IF _payer = 'cabinet_owner' THEN
          _payer_user := _owner_id;
          _wallet_owner_type := 'user'; _wallet_owner_id := _owner_id::text;
        ELSE
          _payer_user := _pea.link_partner_user_id;
          _wallet_owner_type := 'partner_company'; _wallet_owner_id := _pea.link_partner_user_id::text;
        END IF;
      ELSE
        RETURN jsonb_build_object('ok', false, 'error', 'no_access');
      END IF;
    END IF;
  END IF;

  SELECT id, balance_credits INTO _wallet_id, _balance
  FROM public.ai_credit_wallets
  WHERE owner_type = _wallet_owner_type AND owner_id = _wallet_owner_id
  LIMIT 1;

  RETURN jsonb_build_object(
    'ok', true,
    'wallet_id', _wallet_id,
    'wallet_owner_type', _wallet_owner_type,
    'wallet_owner_id', _wallet_owner_id,
    'balance', COALESCE(_balance, 0),
    'payer_kind', _payer,
    'payer_user_id', _payer_user,
    'delegation_kind', _delegation_kind,
    'delegation_id', _delegation_id,
    'cabinet_owner_user_id', _owner_id
  );
END $function$;

-- 3. Make signature_audit_log append-only (no UPDATE / DELETE)
DROP POLICY IF EXISTS "Audit append only update block" ON public.signature_audit_log;
DROP POLICY IF EXISTS "Audit append only delete block" ON public.signature_audit_log;
CREATE POLICY "Audit append only update block"
  ON public.signature_audit_log FOR UPDATE TO authenticated
  USING (false);
CREATE POLICY "Audit append only delete block"
  ON public.signature_audit_log FOR DELETE TO authenticated
  USING (false);

-- 4. Make ai_credit_transactions immutable (defence-in-depth; RLS already blocks)
DROP POLICY IF EXISTS "Txn no update" ON public.ai_credit_transactions;
DROP POLICY IF EXISTS "Txn no delete" ON public.ai_credit_transactions;
CREATE POLICY "Txn no update" ON public.ai_credit_transactions FOR UPDATE TO authenticated USING (false);
CREATE POLICY "Txn no delete" ON public.ai_credit_transactions FOR DELETE TO authenticated USING (false);

-- 5. Trigger: any change to auto_sign_rules requires last_changed_by = cabinet_owner
CREATE OR REPLACE FUNCTION public.enforce_auto_sign_rule_owner()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _owner uuid;
BEGIN
  SELECT cabinet_owner_user_id INTO _owner
  FROM public.delegation_contracts WHERE id = NEW.contract_id;
  IF _owner IS NULL THEN
    RAISE EXCEPTION 'Auto-sign rule must reference an existing delegation_contract';
  END IF;
  IF NEW.last_changed_by IS DISTINCT FROM _owner THEN
    RAISE EXCEPTION 'Only cabinet owner may change auto_sign_rules (last_changed_by must equal contract owner)';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_auto_sign_rule_owner ON public.auto_sign_rules;
CREATE TRIGGER trg_enforce_auto_sign_rule_owner
  BEFORE INSERT OR UPDATE ON public.auto_sign_rules
  FOR EACH ROW EXECUTE FUNCTION public.enforce_auto_sign_rule_owner();

-- 6. user_type on profile (if profiles exists) — add column for onboarding routing
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='profiles') THEN
    ALTER TABLE public.profiles
      ADD COLUMN IF NOT EXISTS user_type text;
  END IF;
END $$;
