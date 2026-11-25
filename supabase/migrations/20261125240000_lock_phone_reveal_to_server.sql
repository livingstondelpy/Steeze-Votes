-- Phone reveal is not called directly by the current UI. Restrict it to the trusted server.
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) TO service_role;
