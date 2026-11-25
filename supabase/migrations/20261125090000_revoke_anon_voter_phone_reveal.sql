-- Steeze Votes production hardening.
-- Public free voting is intentionally exposed through a narrowly validated RPC.
-- Paid vote confirmation is privileged and must only be called after server-side
-- Paystack verification. Never permit browser/anonymous clients to call it directly.

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
  v_contest_type public.contest_type;
  v_contest_status public.contest_status;
  v_phone_digits text;
  v_phone_hash text;
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

  v_phone_digits := regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g');
  IF length(v_phone_digits) < 9 OR length(v_phone_digits) > 15 THEN
    RETURN jsonb_build_object('success', false, 'error', 'A valid phone number is required');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.nominees
     WHERE id = p_nominee_id AND contest_id = p_contest_id AND status = 'active'
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Active nominee does not belong to this contest');
  END IF;

  v_phone_hash := public.hash_phone(p_phone);

  INSERT INTO public.free_vote_records (contest_id, nominee_id, phone_hash)
  VALUES (p_contest_id, p_nominee_id, v_phone_hash)
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

-- Only the trusted server (service_role) may record paid votes. The function
-- itself does not call Paystack, so direct public execution would allow forged votes.
REVOKE EXECUTE ON FUNCTION public.confirm_paystack_vote(text,text,uuid,uuid,integer,numeric,numeric,text,public.momo_network) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.confirm_paystack_vote(text,text,uuid,uuid,integer,numeric,numeric,text,public.momo_network) FROM anon;
REVOKE EXECUTE ON FUNCTION public.confirm_paystack_vote(text,text,uuid,uuid,integer,numeric,numeric,text,public.momo_network) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_paystack_vote(text,text,uuid,uuid,integer,numeric,numeric,text,public.momo_network) TO service_role;

-- Voter phone reveal remains admin-only; the function checks is_admin() internally.
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_reveal_voter_phone(uuid) TO authenticated;

-- is_admin() and owns_contest() remain executable because current RLS policies call
-- them directly. Their return values do not expose protected data.
-- The DDL event-trigger helper is not an API function.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated;
