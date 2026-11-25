-- Steeze Votes production hardening.
-- The public voting RPC remains available to anonymous voters by design.
-- Administrative helpers must not be callable by anonymous users.
-- The voter-phone reveal function performs an admin check internally.

REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.owns_contest(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.owns_contest(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.owns_contest(uuid) TO authenticated;

-- This is an event-trigger helper and should never be callable by API clients.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
