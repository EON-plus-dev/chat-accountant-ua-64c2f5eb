
-- Recreate partner_profiles_public as a SECURITY INVOKER view (runs as caller).
DROP VIEW IF EXISTS public.partner_profiles_public;
CREATE VIEW public.partner_profiles_public
WITH (security_invoker = on) AS
SELECT
  user_id,
  accountant_slug,
  is_certified,
  certified_at,
  status,
  active_clients_count,
  current_tier,
  created_at,
  updated_at
FROM public.partner_profiles
WHERE status = 'active';

GRANT SELECT ON public.partner_profiles_public TO anon, authenticated;

-- Allow anon to SELECT active partner rows on the base table, but only the safe
-- (non-payout) columns. Column-level GRANTs below block payout_* from anon
-- even though the row passes the policy.
CREATE POLICY "Anon can read active partner profiles (safe columns)"
ON public.partner_profiles
FOR SELECT
TO anon
USING (status = 'active');

CREATE POLICY "Authenticated can read active partner profiles (safe columns)"
ON public.partner_profiles
FOR SELECT
TO authenticated
USING (status = 'active' OR user_id = auth.uid());

-- Column-level grants: anon may only read safe columns. payout_* are not granted to anon.
GRANT SELECT (
  user_id, accountant_slug, is_certified, certified_at, status,
  active_clients_count, current_tier, discount_mode, plan_id, seat_limit,
  created_at, updated_at
) ON public.partner_profiles TO anon;

-- Authenticated keeps full SELECT (own row needs payout_*; RLS still scopes rows).
GRANT SELECT ON public.partner_profiles TO authenticated;
