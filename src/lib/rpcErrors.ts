/**
 * Maps raw PostgreSQL RPC error messages/codes to clear, helpful Ghanaian English messages for voters.
 */
export function formatRpcVoteError(error: any): string {
  const msg = (typeof error === 'string' ? error : error?.message || error?.details || '').toLowerCase();

  if (msg.includes('err_already_voted') || msg.includes('free_vote_already_used') || msg.includes('already used') || msg.includes('already cast') || msg.includes('unique_contest_voter_free_vote')) {
    return 'This number has already voted in this contest. Only 1 free vote is allowed per phone number.';
  }
  if (msg.includes('err_contest_inactive') || msg.includes('contest_not_active') || msg.includes('voting is closed') || msg.includes('voting is paused')) {
    return 'Voting is currently closed for this contest.';
  }
  if (msg.includes('err_invalid_nominee') || msg.includes('nominee not found') || msg.includes('nominee does not belong')) {
    return 'This nominee does not belong to this contest or is no longer active.';
  }
  if (msg.includes('err_tx_not_found') || msg.includes('reference not found')) {
    return 'Payment transaction reference was not found. Please check your MoMo statement.';
  }
  if (msg.includes('err_tx_processed') || msg.includes('already processed')) {
    return 'This payment transaction has already been verified and votes credited.';
  }
  if (msg.includes('err_verify_failed') || msg.includes('verification failed')) {
    return 'Payment verification failed. If money was deducted, your votes will be credited automatically within 15 minutes.';
  }
  if (msg.includes('contest_not_found') || msg.includes('contest not found')) {
    return 'This contest could not be found. Please refresh the page and try again.';
  }
  if (msg.includes('not_a_free_contest') || msg.includes('not a free contest')) {
    return 'This is a paid contest. Please select a vote bundle to support your contestant.';
  }
  if (msg.includes('active_contest_cap_reached') || msg.includes('active contest cap reached')) {
    return 'This organizer has reached the maximum allowed active contests on SteezeVotes.';
  }
  if (msg.includes('bundle_tier_attempted_on_free_contest') || msg.includes('bundle tier attempted')) {
    return 'Vote bundles are not available on 100% free contests.';
  }

  // Fallback cleanly formatted
  return error?.message || 'An unexpected error occurred while casting your vote. Please try again.';
}
