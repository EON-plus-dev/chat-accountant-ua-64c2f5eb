-- ============================================
-- TIER 1: GDPR/SECURITY TABLES
-- ============================================

-- 1. Таблиця для аудиту запитів на видалення акаунту (GDPR Art. 17)
CREATE TABLE public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT,
  deleted_data_summary JSONB,
  
  CONSTRAINT account_deletion_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- RLS: тільки service_role може читати/писати (аудит-лог)
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Індекси для швидкого пошуку
CREATE INDEX idx_deletion_requests_user_id ON public.account_deletion_requests(user_id);
CREATE INDEX idx_deletion_requests_status ON public.account_deletion_requests(status);

-- 2. Таблиця налаштувань 2FA користувача
CREATE TABLE public.user_2fa_settings (
  user_id UUID PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  method TEXT,
  totp_secret_encrypted TEXT,
  backup_codes_generated_at TIMESTAMPTZ,
  enabled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT user_2fa_method_check 
    CHECK (method IS NULL OR method IN ('totp', 'sms', 'email'))
);

ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;

-- Користувач може читати тільки свої налаштування
CREATE POLICY "Users can view own 2FA settings"
  ON public.user_2fa_settings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Користувач може оновлювати свої налаштування
CREATE POLICY "Users can update own 2FA settings"
  ON public.user_2fa_settings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Користувач може створювати свої налаштування
CREATE POLICY "Users can insert own 2FA settings"
  ON public.user_2fa_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 3. Таблиця для backup codes 2FA
CREATE TABLE public.user_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year')
);

ALTER TABLE public.user_backup_codes ENABLE ROW LEVEL SECURITY;

-- Користувач може бачити кількість своїх кодів (без хешів)
CREATE POLICY "Users can view own backup codes metadata"
  ON public.user_backup_codes
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Індекс для пошуку
CREATE INDEX idx_backup_codes_user_id ON public.user_backup_codes(user_id);

-- 4. Таблиця запитів на зміну email
CREATE TABLE public.email_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  current_email TEXT NOT NULL,
  new_email TEXT NOT NULL,
  verification_code_hash TEXT NOT NULL,
  code_expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  verified_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  
  CONSTRAINT email_change_status_check 
    CHECK (status IN ('pending', 'verified', 'expired', 'cancelled'))
);

ALTER TABLE public.email_change_requests ENABLE ROW LEVEL SECURITY;

-- Користувач може бачити свої запити
CREATE POLICY "Users can view own email change requests"
  ON public.email_change_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Індекси
CREATE INDEX idx_email_change_user ON public.email_change_requests(user_id);
CREATE INDEX idx_email_change_status ON public.email_change_requests(status);

-- 5. Trigger для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_2fa_settings_updated_at
  BEFORE UPDATE ON public.user_2fa_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();