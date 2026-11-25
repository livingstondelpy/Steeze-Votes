import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const json = (res: VercelResponse, status: number, body: unknown) => res.status(status).setHeader('Cache-Control', 'no-store').json(body);
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const origin = req.headers.origin;
  const appUrl = process.env.APP_URL || (origin && /^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin) ? origin : '');
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_PRIVATE_KEY;
  if (!supabaseUrl || !serviceKey || !paystackSecret || !appUrl) return json(res, 503, { error: 'Secure payment service is not fully configured.' });

  const { contestId, nomineeId, voteCount, voterPhone, momoNetwork, email } = (req.body || {}) as Record<string, unknown>;
  const votes = Number(voteCount);
  const phone = digits(voterPhone);
  const normalizedEmail = String(email || '').trim();
  if (!contestId || !nomineeId || !Number.isInteger(votes) || votes < 1 || votes > 10000 || phone.length < 9 || phone.length > 15 || !/^\S+@\S+\.\S+$/.test(normalizedEmail) || !['MTN', 'Telecel', 'AT'].includes(String(momoNetwork))) {
    return json(res, 400, { error: 'Please provide valid voter, bundle, network and email details.' });
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: contest, error: contestError } = await db.from('contests').select('id,title,contest_type,status,price_per_vote,collect_voter_contacts').eq('id', contestId).maybeSingle();
  if (contestError || !contest || contest.contest_type !== 'paid' || contest.status !== 'active') return json(res, 400, { error: 'This paid contest is not available for voting.' });
  const { data: nominee, error: nomineeError } = await db.from('nominees').select('id,name,status').eq('id', nomineeId).eq('contest_id', contestId).maybeSingle();
  if (nomineeError || !nominee || nominee.status !== 'active') return json(res, 400, { error: 'The selected nominee is unavailable.' });

  const { data: tier, error: tierError } = await db.from('bundle_tiers').select('votes,price_ghs').eq('contest_id', contestId).eq('votes', votes).eq('is_active', true).maybeSingle();
  if (tierError) return json(res, 500, { error: 'Could not validate the selected vote bundle.' });
  let amountGhs: number;
  if (tier) amountGhs = Number(tier.price_ghs);
  else {
    const unit = Number(contest.price_per_vote);
    if (!Number.isFinite(unit) || unit <= 0) return json(res, 400, { error: 'That vote bundle is not configured for this contest.' });
    amountGhs = Number((unit * votes).toFixed(2));
  }
  const feeGhs = Math.max(0.20, Number((amountGhs * 0.0195).toFixed(2)));
  const totalGhs = Number((amountGhs + feeGhs).toFixed(2));
  const reference = `STZ_${randomUUID().replace(/-/g, '')}`;
  const metadata = {
    contest_id: String(contestId), nominee_id: String(nomineeId), vote_count: votes,
    amount_ghs: amountGhs, fee_ghs: feeGhs, voter_phone: phone, momo_network: String(momoNetwork),
    collect_voter_contacts: Boolean(contest.collect_voter_contacts), app: 'steezevotes'
  };
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${paystackSecret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normalizedEmail, amount: Math.round(totalGhs * 100), currency: 'GHS', reference,
      callback_url: `${appUrl.replace(/\/$/, '')}/api/paystack/verify`,
      metadata, channels: ['mobile_money']
    })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.status || !result?.data?.authorization_url) {
    console.error('Paystack initialization rejected', { status: response.status, message: result?.message });
    return json(res, 502, { error: 'Paystack could not start checkout. Please try again.' });
  }
  return json(res, 200, { authorizationUrl: result.data.authorization_url, reference });
}
