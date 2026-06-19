-- Виправлення security warnings

-- 1. Додати RLS policy для account_deletion_requests (тільки service_role)
-- Таблиця аудит-логу не повинна бути доступна звичайним користувачам
CREATE POLICY "Only service role can access deletion requests"
  ON public.account_deletion_requests
  FOR ALL
  USING (false);

-- 2. Виправити search_path для функції
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;