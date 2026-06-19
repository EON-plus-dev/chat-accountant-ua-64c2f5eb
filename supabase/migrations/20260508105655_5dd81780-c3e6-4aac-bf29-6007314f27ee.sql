
-- =========================================================================
-- 1. delegation_contracts
-- =========================================================================
CREATE TABLE public.delegation_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text NOT NULL,
  cabinet_owner_user_id uuid NOT NULL,
  delegate_kind text NOT NULL CHECK (delegate_kind IN ('partner_company','individual')),
  delegate_user_id uuid NOT NULL,
  contract_kind text NOT NULL CHECK (contract_kind IN ('services','employment','partner_outsourcing')),
  contract_number text,
  signed_at timestamptz,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,
  file_url text,
  service_fee_terms text,
  signature_provider text,
  terms jsonb NOT NULL DEFAULT '{}'::jsonb,  -- e.g. { allow_payer_override: true }
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_sign','active','terminated')),
  terminated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_delegation_contracts_cabinet ON public.delegation_contracts(cabinet_id);
CREATE INDEX idx_delegation_contracts_delegate ON public.delegation_contracts(delegate_user_id);
CREATE INDEX idx_delegation_contracts_status ON public.delegation_contracts(status);

ALTER TABLE public.delegation_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner sees own contracts"
  ON public.delegation_contracts FOR SELECT
  USING (cabinet_owner_user_id = auth.uid());
CREATE POLICY "Delegate sees own contracts"
  ON public.delegation_contracts FOR SELECT
  USING (delegate_user_id = auth.uid());
CREATE POLICY "Admin manages contracts"
  ON public.delegation_contracts FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE POLICY "Owner manages own contracts"
  ON public.delegation_contracts FOR ALL
  USING (cabinet_owner_user_id = auth.uid())
  WITH CHECK (cabinet_owner_user_id = auth.uid());

CREATE TRIGGER trg_delegation_contracts_updated
  BEFORE UPDATE ON public.delegation_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation: dates
CREATE OR REPLACE FUNCTION public.validate_contract_dates()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.valid_until IS NOT NULL AND NEW.valid_until <= NEW.valid_from THEN
    RAISE EXCEPTION 'valid_until must be after valid_from';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_validate_contract_dates
  BEFORE INSERT OR UPDATE ON public.delegation_contracts
  FOR EACH ROW EXECUTE FUNCTION public.validate_contract_dates();

-- =========================================================================
-- 2. direct_delegations
-- =========================================================================
CREATE TABLE public.direct_delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text NOT NULL,
  cabinet_owner_user_id uuid NOT NULL,
  delegate_user_id uuid NOT NULL,
  contract_id uuid REFERENCES public.delegation_contracts(id) ON DELETE RESTRICT,
  granted_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  billing_payer text NOT NULL DEFAULT 'cabinet_owner' CHECK (billing_payer IN ('cabinet_owner','delegate')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cabinet_id, delegate_user_id, status)
);
CREATE INDEX idx_direct_delegations_cabinet ON public.direct_delegations(cabinet_id);
CREATE INDEX idx_direct_delegations_delegate ON public.direct_delegations(delegate_user_id);

ALTER TABLE public.direct_delegations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner sees own delegations"
  ON public.direct_delegations FOR SELECT
  USING (cabinet_owner_user_id = auth.uid());
CREATE POLICY "Delegate sees own delegations"
  ON public.direct_delegations FOR SELECT
  USING (delegate_user_id = auth.uid());
CREATE POLICY "Owner manages own delegations"
  ON public.direct_delegations FOR ALL
  USING (cabinet_owner_user_id = auth.uid())
  WITH CHECK (cabinet_owner_user_id = auth.uid());
CREATE POLICY "Admin manages delegations"
  ON public.direct_delegations FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_direct_delegations_updated
  BEFORE UPDATE ON public.direct_delegations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- 3. partner_client_links extension
-- =========================================================================
ALTER TABLE public.partner_client_links
  ADD COLUMN IF NOT EXISTS contract_id uuid REFERENCES public.delegation_contracts(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS billing_payer text NOT NULL DEFAULT 'cabinet_owner' CHECK (billing_payer IN ('cabinet_owner','delegate')),
  ADD COLUMN IF NOT EXISTS auto_sign_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz;

-- Validation: active link must reference active contract
CREATE OR REPLACE FUNCTION public.ensure_active_link_has_active_contract()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE _ctr_status text;
BEGIN
  IF NEW.status = 'active' AND NEW.contract_id IS NOT NULL THEN
    SELECT status INTO _ctr_status FROM public.delegation_contracts WHERE id = NEW.contract_id;
    IF _ctr_status IS DISTINCT FROM 'active' THEN
      RAISE EXCEPTION 'Active partner link requires an active delegation_contract (got %)', COALESCE(_ctr_status,'none');
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER trg_ensure_active_link_has_active_contract
  BEFORE INSERT OR UPDATE ON public.partner_client_links
  FOR EACH ROW EXECUTE FUNCTION public.ensure_active_link_has_active_contract();

-- =========================================================================
-- 4. partner_employee_assignments
-- =========================================================================
CREATE TABLE public.partner_employee_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_user_id uuid NOT NULL,
  employee_user_id uuid NOT NULL,
  client_link_id uuid NOT NULL REFERENCES public.partner_client_links(id) ON DELETE CASCADE,
  granted_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  billing_payer_override text CHECK (billing_payer_override IS NULL OR billing_payer_override IN ('cabinet_owner','delegate')),
  granted_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_link_id, employee_user_id, status)
);
CREATE INDEX idx_pea_partner ON public.partner_employee_assignments(partner_user_id);
CREATE INDEX idx_pea_employee ON public.partner_employee_assignments(employee_user_id);
CREATE INDEX idx_pea_link ON public.partner_employee_assignments(client_link_id);

ALTER TABLE public.partner_employee_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partner manages assignments"
  ON public.partner_employee_assignments FOR ALL
  USING (partner_user_id = auth.uid())
  WITH CHECK (partner_user_id = auth.uid());
CREATE POLICY "Employee sees own assignments"
  ON public.partner_employee_assignments FOR SELECT
  USING (employee_user_id = auth.uid());
CREATE POLICY "Client owner sees assignments on own link"
  ON public.partner_employee_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.partner_client_links pcl
    WHERE pcl.id = partner_employee_assignments.client_link_id
      AND pcl.client_owner_user_id = auth.uid()
  ));
CREATE POLICY "Admin manages assignments"
  ON public.partner_employee_assignments FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_pea_updated
  BEFORE UPDATE ON public.partner_employee_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validation: granted_permissions ⊆ link.scope; payer_override only if contract allows
CREATE OR REPLACE FUNCTION public.validate_employee_assignment()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  _link_scope jsonb;
  _contract_id uuid;
  _allow_override boolean;
  _perm jsonb;
BEGIN
  SELECT scope, contract_id INTO _link_scope, _contract_id
  FROM public.partner_client_links WHERE id = NEW.client_link_id;

  -- subset check (skip if link.scope is empty array meaning "full")
  IF jsonb_array_length(_link_scope) > 0 THEN
    FOR _perm IN SELECT * FROM jsonb_array_elements(NEW.granted_permissions) LOOP
      IF NOT (_link_scope @> jsonb_build_array(_perm)) THEN
        RAISE EXCEPTION 'Employee permission % is outside client_link.scope', _perm;
      END IF;
    END LOOP;
  END IF;

  -- payer override check
  IF NEW.billing_payer_override IS NOT NULL AND _contract_id IS NOT NULL THEN
    SELECT COALESCE((terms->>'allow_payer_override')::boolean, false) INTO _allow_override
    FROM public.delegation_contracts WHERE id = _contract_id;
    IF NOT _allow_override THEN
      RAISE EXCEPTION 'billing_payer_override not allowed by contract terms';
    END IF;
  END IF;

  RETURN NEW;
END $$;
CREATE TRIGGER trg_validate_employee_assignment
  BEFORE INSERT OR UPDATE ON public.partner_employee_assignments
  FOR EACH ROW EXECUTE FUNCTION public.validate_employee_assignment();

-- =========================================================================
-- 5. ai_credit_wallets
-- =========================================================================
CREATE TABLE public.ai_credit_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('user','cabinet','partner_company')),
  owner_id text NOT NULL,
  balance_credits numeric(14,2) NOT NULL DEFAULT 0,
  low_balance_threshold numeric(14,2) NOT NULL DEFAULT 50,
  auto_topup_enabled boolean NOT NULL DEFAULT false,
  free_quota_used_this_month integer NOT NULL DEFAULT 0,
  free_quota_period_start date NOT NULL DEFAULT date_trunc('month', now())::date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(owner_type, owner_id)
);

ALTER TABLE public.ai_credit_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User sees own user wallet"
  ON public.ai_credit_wallets FOR SELECT
  USING (owner_type = 'user' AND owner_id = auth.uid()::text);
CREATE POLICY "Cabinet member sees cabinet wallet"
  ON public.ai_credit_wallets FOR SELECT
  USING (owner_type = 'cabinet' AND is_cabinet_member(owner_id, auth.uid()));
CREATE POLICY "Partner sees own partner wallet"
  ON public.ai_credit_wallets FOR SELECT
  USING (owner_type = 'partner_company' AND owner_id = auth.uid()::text);
CREATE POLICY "Admin manages wallets"
  ON public.ai_credit_wallets FOR ALL
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

CREATE TRIGGER trg_wallets_updated
  BEFORE UPDATE ON public.ai_credit_wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- 6. ai_credit_transactions
-- =========================================================================
CREATE TABLE public.ai_credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES public.ai_credit_wallets(id) ON DELETE RESTRICT,
  cabinet_id text,
  acting_user_id uuid NOT NULL,
  payer_user_id uuid,
  delegation_kind text CHECK (delegation_kind IN ('owner','direct','partner_employee','admin')),
  delegation_id uuid,
  operation_type text NOT NULL,
  credits_spent numeric(14,4) NOT NULL,
  model_used text,
  tokens_in integer,
  tokens_out integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_aict_wallet ON public.ai_credit_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_aict_cabinet ON public.ai_credit_transactions(cabinet_id, created_at DESC);
CREATE INDEX idx_aict_acting ON public.ai_credit_transactions(acting_user_id, created_at DESC);

ALTER TABLE public.ai_credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acting user sees own transactions"
  ON public.ai_credit_transactions FOR SELECT
  USING (acting_user_id = auth.uid());
CREATE POLICY "Payer sees transactions"
  ON public.ai_credit_transactions FOR SELECT
  USING (payer_user_id = auth.uid());
CREATE POLICY "Wallet owner sees transactions"
  ON public.ai_credit_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_credit_wallets w
    WHERE w.id = ai_credit_transactions.wallet_id
      AND (
        (w.owner_type = 'user' AND w.owner_id = auth.uid()::text)
        OR (w.owner_type = 'partner_company' AND w.owner_id = auth.uid()::text)
        OR (w.owner_type = 'cabinet' AND is_cabinet_member(w.owner_id, auth.uid()))
      )
  ));
CREATE POLICY "Admin reads transactions"
  ON public.ai_credit_transactions FOR SELECT
  USING (has_role(auth.uid(),'admin'::app_role));
-- INSERT only via service role (no policy = denied for non-admin)

-- =========================================================================
-- 7. has_effective_access
-- =========================================================================
CREATE OR REPLACE FUNCTION public.has_effective_access(_cabinet_id text, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    is_cabinet_member(_cabinet_id, _user_id)
    OR EXISTS (
      SELECT 1 FROM public.direct_delegations dd
      WHERE dd.cabinet_id = _cabinet_id
        AND dd.delegate_user_id = _user_id
        AND dd.status = 'active'
    )
    OR EXISTS (
      SELECT 1
      FROM public.partner_employee_assignments pea
      JOIN public.partner_client_links pcl ON pcl.id = pea.client_link_id
      WHERE pcl.cabinet_id = _cabinet_id
        AND pea.employee_user_id = _user_id
        AND pea.status = 'active'
        AND pcl.status = 'active'
    );
$$;

-- =========================================================================
-- 8. resolve_billing_wallet
-- =========================================================================
CREATE OR REPLACE FUNCTION public.resolve_billing_wallet(_cabinet_id text, _acting_user uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _owner_id uuid;
  _payer text;            -- 'cabinet_owner' | 'delegate'
  _payer_user uuid;
  _delegation_kind text;  -- 'owner' | 'direct' | 'partner_employee'
  _delegation_id uuid;
  _wallet_owner_type text;
  _wallet_owner_id text;
  _wallet_id uuid;
  _balance numeric;
  _link record;
  _pea record;
  _dd record;
BEGIN
  -- 1. Owner of the cabinet
  SELECT user_id INTO _owner_id FROM public.cabinet_members
  WHERE cabinet_id = _cabinet_id AND role = 'owner' AND status = 'active' LIMIT 1;

  IF _owner_id = _acting_user THEN
    _payer := 'cabinet_owner'; _payer_user := _owner_id;
    _delegation_kind := 'owner'; _delegation_id := NULL;
    _wallet_owner_type := 'user'; _wallet_owner_id := _owner_id::text;
  ELSE
    -- 2. direct_delegation
    SELECT * INTO _dd FROM public.direct_delegations
    WHERE cabinet_id = _cabinet_id AND delegate_user_id = _acting_user AND status = 'active'
    LIMIT 1;
    IF FOUND THEN
      _delegation_kind := 'direct'; _delegation_id := _dd.id;
      _payer := _dd.billing_payer;
      IF _payer = 'cabinet_owner' THEN
        _payer_user := _owner_id;
        _wallet_owner_type := 'user'; _wallet_owner_id := _owner_id::text;
      ELSE
        _payer_user := _acting_user;
        _wallet_owner_type := 'user'; _wallet_owner_id := _acting_user::text;
      END IF;
    ELSE
      -- 3. partner_employee_assignment chain
      SELECT pea.*, pcl.billing_payer AS link_payer, pcl.partner_user_id AS link_partner_user_id
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

  -- Lookup or describe wallet
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
END $$;
