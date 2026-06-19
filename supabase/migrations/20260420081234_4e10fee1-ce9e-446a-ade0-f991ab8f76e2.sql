-- Enum статусу запрошення
CREATE TYPE public.cabinet_invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');

-- Таблиця запрошень
CREATE TABLE public.cabinet_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  cabinet_id text NOT NULL,
  cabinet_name text NOT NULL,
  cabinet_type text NOT NULL,
  invited_email text NOT NULL,
  role text NOT NULL,
  role_label text NOT NULL,
  invited_by uuid NOT NULL,
  personal_message text,
  status public.cabinet_invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  accepted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cabinet_invitations_code ON public.cabinet_invitations(code);
CREATE INDEX idx_cabinet_invitations_cabinet_status ON public.cabinet_invitations(cabinet_id, status);
CREATE INDEX idx_cabinet_invitations_email_status ON public.cabinet_invitations(LOWER(invited_email), status);

ALTER TABLE public.cabinet_invitations ENABLE ROW LEVEL SECURITY;

-- RLS: SELECT — адмін кабінету, ініціатор, або запрошений за email
CREATE POLICY "Admins, inviters, and invitees can view invitations"
ON public.cabinet_invitations
FOR SELECT
TO authenticated
USING (
  invited_by = auth.uid()
  OR public.is_cabinet_admin(cabinet_id, auth.uid())
  OR LOWER(invited_email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
);

-- RLS: INSERT — тільки адмін кабінету
CREATE POLICY "Cabinet admins can create invitations"
ON public.cabinet_invitations
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_cabinet_admin(cabinet_id, auth.uid())
  AND invited_by = auth.uid()
);

-- RLS: UPDATE — тільки адмін кабінету (revoke). Прийняття йде через SECURITY DEFINER RPC.
CREATE POLICY "Cabinet admins can update invitations"
ON public.cabinet_invitations
FOR UPDATE
TO authenticated
USING (public.is_cabinet_admin(cabinet_id, auth.uid()))
WITH CHECK (public.is_cabinet_admin(cabinet_id, auth.uid()));

-- RLS: DELETE — тільки адмін кабінету
CREATE POLICY "Cabinet admins can delete invitations"
ON public.cabinet_invitations
FOR DELETE
TO authenticated
USING (public.is_cabinet_admin(cabinet_id, auth.uid()));

-- Тригер updated_at
CREATE TRIGGER update_cabinet_invitations_updated_at
BEFORE UPDATE ON public.cabinet_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RPC прийняття запрошення (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.accept_cabinet_invitation(_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inv public.cabinet_invitations;
  _user_id uuid := auth.uid();
  _user_email text := LOWER(COALESCE(auth.jwt()->>'email', ''));
  _existing_status public.cabinet_member_status;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT * INTO _inv FROM public.cabinet_invitations WHERE code = _code;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF _inv.status = 'revoked' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'revoked');
  END IF;

  IF _inv.status = 'accepted' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_accepted');
  END IF;

  IF _inv.expires_at < now() THEN
    UPDATE public.cabinet_invitations SET status = 'expired' WHERE id = _inv.id;
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;

  IF LOWER(_inv.invited_email) <> _user_email THEN
    RETURN jsonb_build_object('ok', false, 'error', 'wrong_email');
  END IF;

  -- Перевірка чи вже учасник
  SELECT status INTO _existing_status
  FROM public.cabinet_members
  WHERE cabinet_id = _inv.cabinet_id AND user_id = _user_id;

  IF _existing_status = 'active' THEN
    -- Все одно позначити інвайт прийнятим
    UPDATE public.cabinet_invitations
    SET status = 'accepted', accepted_at = now(), accepted_by = _user_id
    WHERE id = _inv.id;
    RETURN jsonb_build_object('ok', true, 'cabinet_id', _inv.cabinet_id, 'role', _inv.role, 'already_member', true);
  END IF;

  -- Upsert у cabinet_members
  INSERT INTO public.cabinet_members (cabinet_id, user_id, role, status, invited_by, invited_at, joined_at)
  VALUES (_inv.cabinet_id, _user_id, _inv.role, 'active', _inv.invited_by, _inv.created_at, now())
  ON CONFLICT (cabinet_id, user_id) DO UPDATE
    SET status = 'active', role = EXCLUDED.role, joined_at = now(), updated_at = now();

  -- Позначити інвайт прийнятим
  UPDATE public.cabinet_invitations
  SET status = 'accepted', accepted_at = now(), accepted_by = _user_id
  WHERE id = _inv.id;

  RETURN jsonb_build_object('ok', true, 'cabinet_id', _inv.cabinet_id, 'role', _inv.role, 'already_member', false);
END;
$$;