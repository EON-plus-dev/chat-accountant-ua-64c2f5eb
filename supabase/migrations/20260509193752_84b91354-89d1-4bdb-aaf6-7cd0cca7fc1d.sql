
ALTER TABLE public.partner_engagement_requests
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS tax_group text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS current_status text,
  ADD COLUMN IF NOT EXISTS services_needed text[] DEFAULT '{}'::text[];

DROP POLICY IF EXISTS "Clients can create engagement requests" ON public.partner_engagement_requests;

CREATE POLICY "Clients can create engagement requests"
ON public.partner_engagement_requests
FOR INSERT
WITH CHECK (
  client_user_id = auth.uid()
  AND length(COALESCE(message, '')) <= 2000
  AND length(accountant_slug) <= 200
  AND (business_type IS NULL OR business_type = ANY (ARRAY['fop','tov','individual','not_registered']))
  AND (tax_group IS NULL OR length(tax_group) <= 100)
  AND (industry IS NULL OR length(industry) <= 200)
  AND (current_status IS NULL OR length(current_status) <= 200)
  AND (services_needed IS NULL OR array_length(services_needed, 1) IS NULL OR array_length(services_needed, 1) <= 10)
);
