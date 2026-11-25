-- Steeze Votes production hardening.
-- Keep voter-facing RPCs public only where required by the voting flow.
-- The voter-phone reveal function must never be callable by anonymous clients;
-- its SECURITY DEFINER body already checks public.is_admin(), and the browser
-- must still be restricted to authenticated sessions with the admin role.

REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) TO service_role;
