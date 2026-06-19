ALTER TABLE public.user_notification_preferences
ALTER COLUMN types SET DEFAULT '{"ai": true, "team": true, "risks": true, "tasks": true, "system": true, "events": true, "mentions": true, "deadlines": true, "integrations": true}'::jsonb;

UPDATE public.user_notification_preferences
SET types = types || '{"events": true}'::jsonb
WHERE NOT (types ? 'events');