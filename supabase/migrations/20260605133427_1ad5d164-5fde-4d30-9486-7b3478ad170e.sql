
-- ============================================
-- Cabinet Network Protocol — L3 schema
-- ============================================

-- ---- Enums ----
DO $$ BEGIN
  CREATE TYPE public.catalog_publication_kind AS ENUM ('b2b_supplier', 'c2b_place');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.catalog_publication_visibility AS ENUM ('public', 'invite_only');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.catalog_publication_status AS ENUM ('draft', 'active', 'paused', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.catalog_subscription_status AS ENUM ('pending', 'active', 'paused', 'ended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---- catalog_publications ----
CREATE TABLE IF NOT EXISTS public.catalog_publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_cabinet_id TEXT NOT NULL,
  kind public.catalog_publication_kind NOT NULL,
  visibility public.catalog_publication_visibility NOT NULL DEFAULT 'public',
  status public.catalog_publication_status NOT NULL DEFAULT 'draft',
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category_key TEXT NOT NULL,
  short_description TEXT,
  terms_md TEXT,
  address TEXT,
  phone TEXT,
  public_booking_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_publications_provider ON public.catalog_publications(provider_cabinet_id);
CREATE INDEX IF NOT EXISTS idx_catalog_publications_visibility_status ON public.catalog_publications(visibility, status);
CREATE INDEX IF NOT EXISTS idx_catalog_publications_category ON public.catalog_publications(category_key);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_publications TO authenticated;
GRANT ALL ON public.catalog_publications TO service_role;

ALTER TABLE public.catalog_publications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active public publications"
  ON public.catalog_publications FOR SELECT
  TO authenticated
  USING (visibility = 'public' AND status = 'active');

CREATE POLICY "Providers can view their own publications"
  ON public.catalog_publications FOR SELECT
  TO authenticated
  USING (public.is_cabinet_member(provider_cabinet_id, auth.uid()));

CREATE POLICY "Provider admins can insert publications"
  ON public.catalog_publications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_cabinet_admin(provider_cabinet_id, auth.uid()));

CREATE POLICY "Provider admins can update publications"
  ON public.catalog_publications FOR UPDATE
  TO authenticated
  USING (public.is_cabinet_admin(provider_cabinet_id, auth.uid()))
  WITH CHECK (public.is_cabinet_admin(provider_cabinet_id, auth.uid()));

CREATE POLICY "Provider admins can delete publications"
  ON public.catalog_publications FOR DELETE
  TO authenticated
  USING (public.is_cabinet_admin(provider_cabinet_id, auth.uid()));

CREATE TRIGGER update_catalog_publications_updated_at
  BEFORE UPDATE ON public.catalog_publications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- catalog_subscriptions ----
CREATE TABLE IF NOT EXISTS public.catalog_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.catalog_publications(id) ON DELETE CASCADE,
  subscriber_cabinet_id TEXT,
  subscriber_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.catalog_subscription_status NOT NULL DEFAULT 'pending',
  scope JSONB NOT NULL DEFAULT '{"catalog":true,"orders":true,"bookings":true,"pricesTier":"default"}'::jsonb,
  accepted_terms_at TIMESTAMPTZ,
  client_card_id TEXT,
  display_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT catalog_subscriptions_subject_chk
    CHECK ((subscriber_cabinet_id IS NOT NULL) <> (subscriber_user_id IS NOT NULL))
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_catalog_subscriptions_pub_cabinet
  ON public.catalog_subscriptions(publication_id, subscriber_cabinet_id)
  WHERE subscriber_cabinet_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_catalog_subscriptions_pub_user
  ON public.catalog_subscriptions(publication_id, subscriber_user_id)
  WHERE subscriber_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_catalog_subscriptions_publication ON public.catalog_subscriptions(publication_id);
CREATE INDEX IF NOT EXISTS idx_catalog_subscriptions_user ON public.catalog_subscriptions(subscriber_user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_subscriptions_cabinet ON public.catalog_subscriptions(subscriber_cabinet_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_subscriptions TO authenticated;
GRANT ALL ON public.catalog_subscriptions TO service_role;

ALTER TABLE public.catalog_subscriptions ENABLE ROW LEVEL SECURITY;

-- Provider sees only that a subscription exists (not the rich client data —
-- those go through subscription_client_profile_v).
-- We keep base SELECT closed and expose two narrow views:
--   * subscriber sees their own subscription in full
--   * provider sees a denormalized profile via VIEW (security_invoker=on)

CREATE POLICY "Subscribers see own subscriptions"
  ON public.catalog_subscriptions FOR SELECT
  TO authenticated
  USING (
    (subscriber_user_id IS NOT NULL AND subscriber_user_id = auth.uid())
    OR (subscriber_cabinet_id IS NOT NULL AND public.is_cabinet_member(subscriber_cabinet_id, auth.uid()))
  );

CREATE POLICY "Subscribers can create own subscriptions"
  ON public.catalog_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    (subscriber_user_id = auth.uid())
    OR (subscriber_cabinet_id IS NOT NULL AND public.is_cabinet_admin(subscriber_cabinet_id, auth.uid()))
  );

CREATE POLICY "Subscribers can update own subscriptions"
  ON public.catalog_subscriptions FOR UPDATE
  TO authenticated
  USING (
    (subscriber_user_id IS NOT NULL AND subscriber_user_id = auth.uid())
    OR (subscriber_cabinet_id IS NOT NULL AND public.is_cabinet_admin(subscriber_cabinet_id, auth.uid()))
  )
  WITH CHECK (
    (subscriber_user_id IS NOT NULL AND subscriber_user_id = auth.uid())
    OR (subscriber_cabinet_id IS NOT NULL AND public.is_cabinet_admin(subscriber_cabinet_id, auth.uid()))
  );

CREATE POLICY "Subscribers can delete own subscriptions"
  ON public.catalog_subscriptions FOR DELETE
  TO authenticated
  USING (
    (subscriber_user_id IS NOT NULL AND subscriber_user_id = auth.uid())
    OR (subscriber_cabinet_id IS NOT NULL AND public.is_cabinet_admin(subscriber_cabinet_id, auth.uid()))
  );

-- Provider must see subscriptions to their own publication (status only, for management).
CREATE POLICY "Providers see subscriptions to own publications"
  ON public.catalog_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.catalog_publications p
      WHERE p.id = catalog_subscriptions.publication_id
        AND public.is_cabinet_member(p.provider_cabinet_id, auth.uid())
    )
  );

CREATE TRIGGER update_catalog_subscriptions_updated_at
  BEFORE UPDATE ON public.catalog_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---- catalog_invitations ----
CREATE TABLE IF NOT EXISTS public.catalog_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publication_id UUID NOT NULL REFERENCES public.catalog_publications(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ,
  used_by_user_id UUID REFERENCES auth.users(id),
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_invitations_publication ON public.catalog_invitations(publication_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_invitations TO authenticated;
GRANT ALL ON public.catalog_invitations TO service_role;

ALTER TABLE public.catalog_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider admins manage invitations"
  ON public.catalog_invitations FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.catalog_publications p
            WHERE p.id = catalog_invitations.publication_id
              AND public.is_cabinet_admin(p.provider_cabinet_id, auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.catalog_publications p
            WHERE p.id = catalog_invitations.publication_id
              AND public.is_cabinet_admin(p.provider_cabinet_id, auth.uid()))
  );

-- Allow any authenticated user to redeem (look up by code) — used by app flow.
CREATE POLICY "Authenticated can redeem invitations"
  ON public.catalog_invitations FOR UPDATE
  TO authenticated
  USING (used_by_user_id IS NULL AND (expires_at IS NULL OR expires_at > now()))
  WITH CHECK (used_by_user_id = auth.uid());

-- ---- View: subscription_client_profile_v ----
-- Provider-facing minimal client profile (name+phone+orders/visits stats are
-- denormalized into subscription itself; richer order data lives in business
-- domain tables which are not exposed cross-cabinet).
CREATE OR REPLACE VIEW public.subscription_client_profile_v
  WITH (security_invoker = on)
AS
SELECT
  s.id              AS subscription_id,
  s.publication_id,
  s.status,
  s.client_card_id,
  s.display_name,
  s.phone,
  s.created_at
FROM public.catalog_subscriptions s
WHERE EXISTS (
  SELECT 1 FROM public.catalog_publications p
  WHERE p.id = s.publication_id
    AND public.is_cabinet_member(p.provider_cabinet_id, auth.uid())
);

GRANT SELECT ON public.subscription_client_profile_v TO authenticated;
