
-- Deny direct UPDATE access - only service role (edge functions) should update these records
CREATE POLICY "Users cannot directly update email change requests"
ON public.email_change_requests
FOR UPDATE
TO authenticated
USING (false);

-- Deny direct DELETE access - email change requests should never be deleted
CREATE POLICY "Users cannot delete email change requests"
ON public.email_change_requests
FOR DELETE
TO authenticated
USING (false);
