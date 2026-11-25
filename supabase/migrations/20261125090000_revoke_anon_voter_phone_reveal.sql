-- Steeze Votes production hardening.
-- Preserve anonymous access to the public voting RPC, but harden its validation.
-- Restrict administrative helpers to authenticated sessions and keep DDL helpers
-- unavailable to all API clients.

CREATE OR REPLACE FUNCTION public.cast_free_vote(
  p_contest_id uuid,
  p_nominee_id uuid,
  p_phone text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_hash text;
  v_contest_type public.contest_type;
  v_contest_status public.contest_status;
  v_inserted integer;
BEGIN
  SELECT contest_type, status
    INTO v_contest_type, v_contest_status
    FROM public.contests
   WHERE id = p_contest_id;

  IF v_contest_type IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contest not found');
  END IF;
  IF v_contest_type <> 'free' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not a free contest');
  END IF;
  IF v_contest_status <> 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Contest is not active');
  END IF;
  IF p_phone IS NULL OR length(regexp_replace(p_phone, '[^0-9]', '', 'g')) < 9 THEN
    RETURN jsonb_build_object('success', false, 'error', 'A valid phone number is required');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.nominees
     WHERE id = p_nominee_id AND contest_id = p_contest_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nominee does not belong to this contest');
  END IF;

  v_hash := public.hash_phone(p_phone);

  -- The unique constraint and ON CONFLICT make the one-free-vote rule safe
  -- under concurrent requests; only the winning insert increments the tally.
  INSERT INTO public.free_vote_records (contest_id, nominee_id, phone_hash)
  VALUES (p_contest_id, p_nominee_id, v_hash)
  ON CONFLICT (contest_id, phone_hash) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Free vote already used for this contest');
  END IF;

  UPDATE public.nominees
     SET vote_count = vote_count + 1,
         free_vote_count = free_vote_count + 1
   WHERE id = p_nominee_id
     AND contest_id = p_contest_id;

  RETURN jsonb_build_object('success', true);
END;
$function$;

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
