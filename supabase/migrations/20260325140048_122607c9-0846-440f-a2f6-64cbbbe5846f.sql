
-- Tighten RLS policies on email_subscriptions
DROP POLICY IF EXISTS "Allow anon insert" ON public.email_subscriptions;
CREATE POLICY "Allow anon insert" ON public.email_subscriptions
  FOR INSERT TO anon
  WITH CHECK (
    email IS NOT NULL AND length(email) > 5 AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    AND source IS NOT NULL AND length(source) <= 100
    AND (name IS NULL OR length(name) <= 200)
  );

DROP POLICY IF EXISTS "Allow authenticated insert" ON public.email_subscriptions;
CREATE POLICY "Allow authenticated insert" ON public.email_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (
    email IS NOT NULL AND length(email) > 5 AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    AND source IS NOT NULL AND length(source) <= 100
    AND (name IS NULL OR length(name) <= 200)
  );

-- Tighten RLS policy on pre_registrations
DROP POLICY IF EXISTS "Anyone can insert pre-registrations" ON public.pre_registrations;
CREATE POLICY "Anyone can insert pre-registrations" ON public.pre_registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL AND length(email) > 5 AND email ~ '^[^@]+@[^@]+\.[^@]+$'
    AND (name IS NULL OR length(name) <= 200)
    AND (phone IS NULL OR length(phone) <= 20)
    AND (user_type IS NULL OR length(user_type) <= 50)
    AND length(audience) <= 50
  );
