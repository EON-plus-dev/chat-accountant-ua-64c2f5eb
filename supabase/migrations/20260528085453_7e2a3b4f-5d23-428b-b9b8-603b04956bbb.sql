
-- 1) course_certificates: remove public SELECT, add owner SELECT + public verify RPC
DROP POLICY IF EXISTS "Anyone can verify certificates" ON public.course_certificates;

CREATE POLICY "Users can view their own certificates"
ON public.course_certificates
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.verify_certificate(_certificate_number text)
RETURNS TABLE (
  certificate_number text,
  course_id text,
  course_title text,
  issued_at timestamptz,
  is_valid boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.certificate_number,
    c.course_id,
    c.course_title,
    c.issued_at,
    TRUE AS is_valid
  FROM public.course_certificates c
  WHERE c.certificate_number = _certificate_number
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- 2) partner_profiles: stop exposing base table to anon; rely on partner_profiles_public view
DROP POLICY IF EXISTS "Public can view active partner profiles via view" ON public.partner_profiles;

-- Rebuild view as SECURITY DEFINER (runs as owner) so it bypasses RLS while
-- only exposing safe columns. payout_* never leave the base table.
DROP VIEW IF EXISTS public.partner_profiles_public;
CREATE VIEW public.partner_profiles_public
WITH (security_invoker = off) AS
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

-- Lock down anon access to the base table entirely (no policy permits anon now,
-- but revoke column grants for defence in depth).
REVOKE SELECT ON public.partner_profiles FROM anon;

-- 3) pre_registrations: bind authenticated inserts to caller's email; keep anon for landing forms
DROP POLICY IF EXISTS "Anyone can insert pre-registrations" ON public.pre_registrations;

CREATE POLICY "Anon can insert pre-registrations"
ON public.pre_registrations
FOR INSERT
TO anon
WITH CHECK (
  (email IS NOT NULL)
  AND (length(email) > 5)
  AND (email ~ '^[^@]+@[^@]+\.[^@]+$')
  AND ((name IS NULL) OR (length(name) <= 200))
  AND ((phone IS NULL) OR (length(phone) <= 20))
  AND ((user_type IS NULL) OR (length(user_type) <= 50))
  AND (length(audience) <= 50)
);

CREATE POLICY "Authenticated can pre-register only own email"
ON public.pre_registrations
FOR INSERT
TO authenticated
WITH CHECK (
  (email IS NOT NULL)
  AND (length(email) > 5)
  AND (email ~ '^[^@]+@[^@]+\.[^@]+$')
  AND (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  AND ((name IS NULL) OR (length(name) <= 200))
  AND ((phone IS NULL) OR (length(phone) <= 20))
  AND ((user_type IS NULL) OR (length(user_type) <= 50))
  AND (length(audience) <= 50)
);

-- 4) user_subscriptions: users can no longer self-assign plans; only admins/service role mutate
DROP POLICY IF EXISTS "User inserts own subscription" ON public.user_subscriptions;
DROP POLICY IF EXISTS "User updates own subscription" ON public.user_subscriptions;
