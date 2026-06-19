CREATE POLICY "Users can insert own email change requests"
ON public.email_change_requests
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());