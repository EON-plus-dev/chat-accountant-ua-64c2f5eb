
-- 1. user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_id text NOT NULL DEFAULT 'start',
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  scheduled_plan_id text,
  scheduled_at timestamptz,
  source text NOT NULL DEFAULT 'trial',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plan_id_valid CHECK (plan_id IN ('start','smart','premium')),
  CONSTRAINT scheduled_plan_id_valid CHECK (scheduled_plan_id IS NULL OR scheduled_plan_id IN ('start','smart','premium')),
  CONSTRAINT source_valid CHECK (source IN ('trial','paid','admin','migration')),
  CONSTRAINT status_valid CHECK (status IN ('active','paused','cancelled'))
);

CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_period_end ON public.user_subscriptions(period_end) WHERE status = 'active';

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User reads own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "User updates own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User inserts own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin manages all subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Auto-create starter subscription on signup
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_id, source)
  VALUES (NEW.id, 'start', 'trial')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- 3. Helper: get effective plan (applies scheduled downgrade if period elapsed)
CREATE OR REPLACE FUNCTION public.get_effective_plan(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _row record;
BEGIN
  SELECT * INTO _row FROM public.user_subscriptions
    WHERE user_id = _user_id AND status = 'active' LIMIT 1;
  IF NOT FOUND THEN RETURN 'start'; END IF;
  IF _row.scheduled_plan_id IS NOT NULL AND _row.period_end <= now() THEN
    RETURN _row.scheduled_plan_id;
  END IF;
  RETURN _row.plan_id;
END $$;
