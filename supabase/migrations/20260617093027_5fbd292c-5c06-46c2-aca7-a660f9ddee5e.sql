-- Revoke sensitive columns from anonymous role at the column-grant layer.
-- RLS policies remain unchanged; PostgREST will reject anon queries that
-- explicitly select these columns, and `select('*')` for anon is replaced
-- with explicit column lists in the client.

REVOKE SELECT (user_id) ON public.gov_reviews FROM anon;
REVOKE SELECT (user_id) ON public.institution_reviews FROM anon;

REVOKE SELECT (payout_iban, payout_card_last4, payout_recipient_name, payout_method, payout_min_uah)
  ON public.partner_profiles FROM anon;