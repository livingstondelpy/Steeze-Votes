-- Prevent concurrent duplicate payout requests for a contest.
CREATE UNIQUE INDEX IF NOT EXISTS payout_requests_one_active_per_contest
ON public.payout_requests (contest_id)
WHERE status IN ('pending', 'processing', 'paid');
