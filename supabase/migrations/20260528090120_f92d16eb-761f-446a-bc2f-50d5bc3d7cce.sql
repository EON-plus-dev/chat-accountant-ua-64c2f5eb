
-- 1) gov_branches: restrict public SELECT to active branches only
DROP POLICY IF EXISTS "Anyone can view active branches" ON public.gov_branches;
CREATE POLICY "Anyone can view active branches"
ON public.gov_branches
FOR SELECT
TO anon, authenticated
USING (status = 'active');

-- 2) realtime.messages: enable RLS to block unrestricted broadcast/presence
-- subscriptions. The app uses only postgres_changes which goes via WAL
-- replication and is unaffected by realtime.messages RLS. Broadcast and
-- presence channels are denied by default (no policy = no access).
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
