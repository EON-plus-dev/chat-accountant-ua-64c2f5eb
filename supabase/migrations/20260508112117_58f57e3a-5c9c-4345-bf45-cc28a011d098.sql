-- Phase 2: KEP signing infrastructure & portal AI usage counter

-- 1. Signature requests (one per signer per document)
CREATE TABLE public.signature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text,
  -- Polymorphic target: what is being signed
  document_kind text NOT NULL,           -- 'delegation_contract' | 'tax_declaration' | 'payment_order' | 'generic'
  document_id text NOT NULL,             -- FK is logical (varies by kind)
  document_hash text NOT NULL,           -- sha-256 of canonical document bytes
  signer_user_id uuid NOT NULL,
  signer_role text NOT NULL,             -- 'cabinet_owner' | 'delegate' | 'employee'
  provider text NOT NULL DEFAULT 'mock', -- 'diia' | 'kned_<n>' | 'mock'
  provider_request_id text,
  deeplink text,
  qr_payload text,
  status text NOT NULL DEFAULT 'pending', -- pending | sent | signed | failed | expired | cancelled
  is_auto_sign boolean NOT NULL DEFAULT false,
  initiated_by uuid NOT NULL,            -- who triggered the signing (delegate or owner)
  expires_at timestamptz NOT NULL DEFAULT now() + interval '24 hours',
  signed_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signature_requests_signer ON public.signature_requests(signer_user_id, status);
CREATE INDEX idx_signature_requests_doc ON public.signature_requests(document_kind, document_id);
CREATE INDEX idx_signature_requests_cabinet ON public.signature_requests(cabinet_id);

ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signer sees own requests" ON public.signature_requests
  FOR SELECT USING (signer_user_id = auth.uid() OR initiated_by = auth.uid());

CREATE POLICY "Cabinet owner sees cabinet requests" ON public.signature_requests
  FOR SELECT USING (cabinet_id IS NOT NULL AND public.is_cabinet_admin(cabinet_id, auth.uid()));

CREATE POLICY "Admin manages signature requests" ON public.signature_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_signature_requests_updated
  BEFORE UPDATE ON public.signature_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 2. Signed documents (final container after all signers signed)
CREATE TABLE public.signed_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text,
  document_kind text NOT NULL,
  document_id text NOT NULL,
  document_hash text NOT NULL,
  signers jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{user_id, signed_at, provider, cert_subject}]
  signed_blob_url text,                       -- storage url to PKCS#7/CAdES blob
  signed_blob_format text DEFAULT 'CAdES-X-Long',
  timestamp_authority text,
  is_valid boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signed_documents_doc ON public.signed_documents(document_kind, document_id);

ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cabinet members see signed docs" ON public.signed_documents
  FOR SELECT USING (cabinet_id IS NOT NULL AND public.is_cabinet_member(cabinet_id, auth.uid()));

CREATE POLICY "Signers see own signed docs" ON public.signed_documents
  FOR SELECT USING (
    signers @> jsonb_build_array(jsonb_build_object('user_id', auth.uid()::text))
  );

CREATE POLICY "Admin manages signed docs" ON public.signed_documents
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 3. Signature audit log (immutable trail)
CREATE TABLE public.signature_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id uuid REFERENCES public.signature_requests(id) ON DELETE SET NULL,
  cabinet_id text,
  actor_user_id uuid NOT NULL,
  action text NOT NULL, -- 'init' | 'sign' | 'fail' | 'auto_sign_triggered' | 'rule_changed' | 'cancel'
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_signature_audit_request ON public.signature_audit_log(signature_request_id);
CREATE INDEX idx_signature_audit_cabinet ON public.signature_audit_log(cabinet_id, created_at DESC);

ALTER TABLE public.signature_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cabinet admin reads audit" ON public.signature_audit_log
  FOR SELECT USING (cabinet_id IS NOT NULL AND public.is_cabinet_admin(cabinet_id, auth.uid()));

CREATE POLICY "Actor reads own audit" ON public.signature_audit_log
  FOR SELECT USING (actor_user_id = auth.uid());

CREATE POLICY "Admin manages audit" ON public.signature_audit_log
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 4. Auto-sign rules per delegation contract (lives separate so we can audit changes)
CREATE TABLE public.auto_sign_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid NOT NULL REFERENCES public.delegation_contracts(id) ON DELETE CASCADE,
  cabinet_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  document_kinds text[] NOT NULL DEFAULT '{}',     -- which kinds may be auto-signed
  max_amount_uah numeric(14,2),                    -- per-document cap (NULL = no cap)
  requires_trusted_review boolean NOT NULL DEFAULT true,
  trusted_reviewer_user_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_changed_by uuid NOT NULL
);

CREATE UNIQUE INDEX idx_auto_sign_rules_contract ON public.auto_sign_rules(contract_id);

ALTER TABLE public.auto_sign_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own auto-sign rules" ON public.auto_sign_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.delegation_contracts dc
            WHERE dc.id = contract_id AND dc.cabinet_owner_user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.delegation_contracts dc
            WHERE dc.id = contract_id AND dc.cabinet_owner_user_id = auth.uid())
  );

CREATE POLICY "Delegate reads auto-sign rules" ON public.auto_sign_rules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.delegation_contracts dc
            WHERE dc.id = contract_id AND dc.delegate_user_id = auth.uid())
  );

CREATE POLICY "Admin manages auto-sign rules" ON public.auto_sign_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_auto_sign_rules_updated
  BEFORE UPDATE ON public.auto_sign_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 5. Portal AI usage counter (for unauthenticated/portal AI)
CREATE TABLE public.portal_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,                  -- nullable: anon usage
  ip_hash text NOT NULL,         -- hashed IP for privacy
  operation_type text NOT NULL,
  tokens_in integer DEFAULT 0,
  tokens_out integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_ai_usage_ip_day ON public.portal_ai_usage(ip_hash, created_at DESC);
CREATE INDEX idx_portal_ai_usage_user ON public.portal_ai_usage(user_id, created_at DESC) WHERE user_id IS NOT NULL;

ALTER TABLE public.portal_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads own portal usage" ON public.portal_ai_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin manages portal usage" ON public.portal_ai_usage
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- 6. Trigger: log every auto_sign_rules change into signature_audit_log
CREATE OR REPLACE FUNCTION public.log_auto_sign_rule_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.signature_audit_log (
    cabinet_id, actor_user_id, action, details
  ) VALUES (
    COALESCE(NEW.cabinet_id, OLD.cabinet_id),
    COALESCE(NEW.last_changed_by, OLD.last_changed_by, auth.uid()),
    'rule_changed',
    jsonb_build_object(
      'op', TG_OP,
      'contract_id', COALESCE(NEW.contract_id, OLD.contract_id),
      'enabled_before', OLD.enabled,
      'enabled_after', NEW.enabled,
      'kinds_after', NEW.document_kinds,
      'max_amount_after', NEW.max_amount_uah
    )
  );
  RETURN COALESCE(NEW, OLD);
END $$;

CREATE TRIGGER trg_auto_sign_rules_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.auto_sign_rules
  FOR EACH ROW EXECUTE FUNCTION public.log_auto_sign_rule_change();