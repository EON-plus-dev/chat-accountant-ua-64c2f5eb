
-- Trigger function: notify cabinet owner about new partner engagement request
CREATE OR REPLACE FUNCTION public.notify_owner_on_partner_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner_id uuid;
  _partner_name text;
BEGIN
  IF NEW.cabinet_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Find cabinet owner
  SELECT user_id INTO _owner_id
  FROM public.cabinet_members
  WHERE cabinet_id = NEW.cabinet_id
    AND role = 'owner'
    AND status = 'active'
  LIMIT 1;

  IF _owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if owner == requester (shouldn't happen, but safe)
  IF _owner_id = NEW.client_user_id THEN
    RETURN NEW;
  END IF;

  _partner_name := COALESCE(NEW.client_name, 'Партнер');

  INSERT INTO public.user_notifications (
    user_id,
    cabinet_id,
    type,
    severity,
    title,
    body,
    action_path,
    related_event_id
  ) VALUES (
    _owner_id,
    NEW.cabinet_id,
    'partner_request',
    'warning',
    'Новий запит партнера на доступ',
    COALESCE(NEW.message, 'Бухгалтер-партнер запитує доступ до вашого кабінету.'),
    '/cabinet/settings?tab=team-access&request=' || NEW.id::text,
    NEW.id
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_owner_on_partner_request ON public.partner_engagement_requests;

CREATE TRIGGER trg_notify_owner_on_partner_request
AFTER INSERT ON public.partner_engagement_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_owner_on_partner_request();

-- Allow trigger function (SECURITY DEFINER) to insert into user_notifications
-- Note: SECURITY DEFINER bypasses RLS, so no policy change needed.
