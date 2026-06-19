-- Add INSERT policy to user_backup_codes table
-- This ensures only authenticated users can insert backup codes for themselves
-- Note: The edge function uses service role which bypasses RLS, but this adds defense in depth

CREATE POLICY "Users can only insert own backup codes"
ON public.user_backup_codes
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());