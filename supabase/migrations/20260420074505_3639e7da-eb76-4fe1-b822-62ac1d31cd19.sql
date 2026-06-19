CREATE TABLE public.cabinet_notification_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cabinet_id text NOT NULL,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, cabinet_id)
);

CREATE INDEX idx_cabinet_notif_prefs_user_cabinet 
  ON public.cabinet_notification_preferences(user_id, cabinet_id);

ALTER TABLE public.cabinet_notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cabinet notification preferences"
  ON public.cabinet_notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own cabinet notification preferences"
  ON public.cabinet_notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cabinet notification preferences"
  ON public.cabinet_notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own cabinet notification preferences"
  ON public.cabinet_notification_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_cabinet_notif_prefs_updated_at
  BEFORE UPDATE ON public.cabinet_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();