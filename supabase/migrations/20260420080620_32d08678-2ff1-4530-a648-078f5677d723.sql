-- Enum
CREATE TYPE public.cabinet_member_status AS ENUM ('active', 'invited', 'suspended', 'removed');

-- Table
CREATE TABLE public.cabinet_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id text NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  status public.cabinet_member_status NOT NULL DEFAULT 'active',
  invited_by uuid,
  invited_at timestamptz,
  joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cabinet_id, user_id)
);

CREATE INDEX idx_cabinet_members_cabinet_status ON public.cabinet_members (cabinet_id, status);
CREATE INDEX idx_cabinet_members_user ON public.cabinet_members (user_id);

-- Security definer helpers (avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_cabinet_member(_cabinet_id text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cabinet_members
    WHERE cabinet_id = _cabinet_id
      AND user_id = _user_id
      AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_cabinet_admin(_cabinet_id text, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cabinet_members
    WHERE cabinet_id = _cabinet_id
      AND user_id = _user_id
      AND status = 'active'
      AND role IN ('owner', 'admin')
  )
$$;

-- Enable RLS
ALTER TABLE public.cabinet_members ENABLE ROW LEVEL SECURITY;

-- SELECT: users can see all members of cabinets they belong to
CREATE POLICY "Members can view cabinet roster"
ON public.cabinet_members
FOR SELECT
TO authenticated
USING (public.is_cabinet_member(cabinet_id, auth.uid()));

-- SELECT: users can always see their own membership rows (e.g. invited)
CREATE POLICY "Users can view own memberships"
ON public.cabinet_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT: only cabinet admins/owners (or first owner bootstrap by self)
CREATE POLICY "Admins can add cabinet members"
ON public.cabinet_members
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_cabinet_admin(cabinet_id, auth.uid())
  OR (
    user_id = auth.uid()
    AND role = 'owner'
    AND NOT EXISTS (
      SELECT 1 FROM public.cabinet_members WHERE cabinet_id = cabinet_members.cabinet_id
    )
  )
);

-- UPDATE: only admins
CREATE POLICY "Admins can update cabinet members"
ON public.cabinet_members
FOR UPDATE
TO authenticated
USING (public.is_cabinet_admin(cabinet_id, auth.uid()))
WITH CHECK (public.is_cabinet_admin(cabinet_id, auth.uid()));

-- DELETE: only admins
CREATE POLICY "Admins can delete cabinet members"
ON public.cabinet_members
FOR DELETE
TO authenticated
USING (public.is_cabinet_admin(cabinet_id, auth.uid()));

-- updated_at trigger
CREATE TRIGGER update_cabinet_members_updated_at
BEFORE UPDATE ON public.cabinet_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();