ALTER TABLE public.user_notification_preferences
  ADD COLUMN IF NOT EXISTS channels jsonb NOT NULL DEFAULT '{"internal":true,"email":false,"push":false,"telegram":false,"viber":false}'::jsonb,
  ADD COLUMN IF NOT EXISTS types jsonb NOT NULL DEFAULT '{"system":true,"deadlines":true,"ai":true,"risks":true,"team":true,"mentions":true,"tasks":true,"integrations":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS deadline_lead_days jsonb NOT NULL DEFAULT '[7,3,1,0]'::jsonb,
  ADD COLUMN IF NOT EXISTS critical_overrides_quiet_hours boolean NOT NULL DEFAULT true;