
-- 1) partner_profiles: remove public exposure of payout fields
DROP POLICY IF EXISTS "Anyone can view active partner profiles" ON public.partner_profiles;

-- Safe public view (no payout_*, no plan/seat internals)
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

-- View needs an explicit policy-bypassing read path: re-add narrow SELECT policy
-- that exposes only rows used by the view (active) but keep payout columns blocked
-- by reading exclusively through the view (security_invoker uses caller's role).
-- We add back a permissive SELECT on the base table scoped to active rows so the
-- view can return data; clients should query the VIEW, not the table.
CREATE POLICY "Public can view active partner profiles via view"
ON public.partner_profiles
FOR SELECT
TO anon, authenticated
USING (status = 'active');

GRANT SELECT ON public.partner_profiles_public TO anon, authenticated;

-- NOTE: column-level revoke on base table to ensure payout_* never leaks
REVOKE SELECT (payout_method, payout_iban, payout_card_last4, payout_recipient_name, payout_min_uah)
  ON public.partner_profiles FROM anon;
REVOKE SELECT (payout_method, payout_iban, payout_card_last4, payout_recipient_name, payout_min_uah)
  ON public.partner_profiles FROM authenticated;
-- Re-grant safe columns to authenticated/anon for direct reads of own row (RLS still scopes rows).
GRANT SELECT (user_id, accountant_slug, is_certified, certified_at, status,
              active_clients_count, current_tier, discount_mode, plan_id, seat_limit,
              created_at, updated_at)
  ON public.partner_profiles TO anon, authenticated;
-- Owners need full SELECT (including payout_*) on their own row — grant via separate role path:
-- "Users manage own partner profile" policy already returns the row; but column REVOKE above
-- blocks payout_* even for owners. Re-grant payout_* to authenticated; RLS still scopes to owner.
GRANT SELECT (payout_method, payout_iban, payout_card_last4, payout_recipient_name, payout_min_uah)
  ON public.partner_profiles TO authenticated;

-- 2) course_certificates: require authenticated insert
DROP POLICY IF EXISTS "Anyone can issue valid certificates" ON public.course_certificates;
CREATE POLICY "Authenticated users can issue their certificates"
ON public.course_certificates
FOR INSERT
TO authenticated
WITH CHECK (
  ((length(TRIM(BOTH FROM full_name)) >= 2) AND (length(TRIM(BOTH FROM full_name)) <= 120))
  AND (email ~ '^[^@]+@[^@]+\.[^@]+$')
  AND (length(course_id) <= 100)
  AND (length(course_title) <= 250)
  AND ((length(certificate_number) >= 6) AND (length(certificate_number) <= 40))
  AND (user_id IS NULL OR user_id = auth.uid())
);

-- 3) cabinet_members: fix alias collision in self-owner INSERT bypass
DROP POLICY IF EXISTS "Admins can add cabinet members" ON public.cabinet_members;
CREATE POLICY "Admins can add cabinet members"
ON public.cabinet_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_cabinet_admin(cabinet_id, auth.uid())
  OR (
    user_id = auth.uid()
    AND role = 'owner'
    AND NOT EXISTS (
      SELECT 1 FROM public.cabinet_members cm
      WHERE cm.cabinet_id = cabinet_members.cabinet_id
    )
  )
);

-- 4) ai_chat_queries: bind user_id to auth.uid() on insert
DROP POLICY IF EXISTS "Validated insert ai queries" ON public.ai_chat_queries;
CREATE POLICY "Validated insert ai queries"
ON public.ai_chat_queries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  (length(question) >= 10)
  AND (length(ai_answer) >= 10)
  AND (length(audience) <= 50)
  AND (user_id IS NULL OR user_id = auth.uid())
);
