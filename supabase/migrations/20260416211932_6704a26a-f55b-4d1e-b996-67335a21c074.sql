
-- Enums
CREATE TYPE public.user_event_status AS ENUM ('scheduled', 'completed', 'cancelled');
CREATE TYPE public.user_event_source AS ENUM ('manual', 'ai');
CREATE TYPE public.reminder_channel AS ENUM ('in-app', 'email');

-- user_events table
CREATE TABLE public.user_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cabinet_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  event_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status public.user_event_status NOT NULL DEFAULT 'scheduled',
  source public.user_event_source NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
  ON public.user_events FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own events"
  ON public.user_events FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own events"
  ON public.user_events FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own events"
  ON public.user_events FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER trg_user_events_updated_at
  BEFORE UPDATE ON public.user_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_user_events_user_event_at ON public.user_events(user_id, event_at);

-- user_reminders table
CREATE TABLE public.user_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.user_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  remind_at TIMESTAMP WITH TIME ZONE NOT NULL,
  channel public.reminder_channel NOT NULL DEFAULT 'in-app',
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON public.user_reminders FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own reminders"
  ON public.user_reminders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reminders"
  ON public.user_reminders FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reminders"
  ON public.user_reminders FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE INDEX idx_user_reminders_pending ON public.user_reminders(remind_at) WHERE sent_at IS NULL;
CREATE INDEX idx_user_reminders_event ON public.user_reminders(event_id);

-- Realtime
ALTER TABLE public.user_events REPLICA IDENTITY FULL;
ALTER TABLE public.user_reminders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_reminders;
