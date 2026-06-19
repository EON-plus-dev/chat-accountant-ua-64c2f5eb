
REVOKE EXECUTE ON FUNCTION public.has_effective_access(text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.resolve_billing_wallet(text, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_contract_dates() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.ensure_active_link_has_active_contract() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.validate_employee_assignment() FROM anon, public;

GRANT EXECUTE ON FUNCTION public.has_effective_access(text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_billing_wallet(text, uuid) TO authenticated, service_role;
