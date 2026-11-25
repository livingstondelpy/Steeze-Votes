import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const json = (res: VercelResponse, status: number, body: unknown) => res.status(status).setHeader('Cache-Control', 'no-store').json(body);
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c));

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  const reference = String(req.method === 'GET' ? req.query.reference || '' : req.body?.reference || '').trim();
  const configuredAppUrl = process.env.APP_URL || 'https://steezevotes.vercel.app';
  const requestedAppUrl = typeof req.query.app_url === 'string' ? req.query.app_url : configuredAppUrl;
  let appUrl = configuredAppUrl;
  try {
    const candidate = new URL(requestedAppUrl);
    const configured = new URL(configuredAppUrl);
    if (candidate.protocol === 'https:' && (candidate.hostname.endsWith('.vercel.app') || candidate.origin === configured.origin)) appUrl = candidate.origin;
  } catch { appUrl = configuredAppUrl; }
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY || process.env.PAYSTACK_PRIVATE_KEY;
  if (!reference || !/^[A-Za-z0-9_-]{8,100}$/.test(reference)) return json(res, 400, { error: 'Invalid payment reference.' });
  if (!supabaseUrl || !serviceKey || !paystackSecret) return json(res, 503, { error: 'Secure payment service is not fully configured.' });

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${paystackSecret}` } });
  const verified = await response.json().catch(() => null);
  if (!response.ok || !verified?.status || verified?.data?.status !== 'success' || verified?.data?.reference !== reference) {
    if (req.method === 'GET' && appUrl) return res.redirect(303, `${appUrl.replace(/\/$/, '')}/?payment=failed`);
    return json(res, 402, { error: 'Payment is not verified as successful.' });
  }

  const payment = verified.data;
  const meta = payment.metadata || {};
  if (meta.app !== 'steezevotes' || !meta.contest_id || !meta.nominee_id || !meta.voter_phone || !meta.momo_network || !Number.isInteger(Number(meta.vote_count))) {
    return json(res, 400, { error: 'Verified payment metadata is incomplete; votes were not recorded.' });
  }
  const expectedTotalPesewas = Math.round((Number(meta.amount_ghs) + Number(meta.fee_ghs)) * 100);
  if (!Number.isFinite(expectedTotalPesewas) || Number(payment.amount) !== expectedTotalPesewas || payment.currency !== 'GHS') {
    return json(res, 400, { error: 'Verified payment amount does not match the requested vote bundle.' });
  }

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: contest, error: contestError } = await db.from('contests').select('id,contest_type,status,price_per_vote').eq('id', String(meta.contest_id)).maybeSingle();
  const { data: nominee, error: nomineeError } = await db.from('nominees').select('id,status').eq('id', String(meta.nominee_id)).eq('contest_id', String(meta.contest_id)).maybeSingle();
  if (contestError || nomineeError || !contest || contest.contest_type !== 'paid' || contest.status !== 'active' || !nominee || nominee.status !== 'active') {
    return json(res, 409, { error: 'Contest or nominee is no longer accepting votes. Contact support with reference: ' + reference });
  }
  const { data: tier, error: tierError } = await db.from('bundle_tiers').select('votes,price_ghs').eq('contest_id', String(meta.contest_id)).eq('votes', Number(meta.vote_count)).eq('is_active', true).maybeSingle();
  if (tierError) return json(res, 500, { error: 'Could not validate the purchased bundle.' });
  const expectedAmount = tier ? Number(tier.price_ghs) : Number((Number(contest.price_per_vote) * Number(meta.vote_count)).toFixed(2));
  if (!Number.isFinite(expectedAmount) || expectedAmount <= 0 || Number(meta.amount_ghs) !== expectedAmount) return json(res, 400, { error: 'Payment metadata does not match the current vote bundle.' });
  const { data: existing, error: existingError } = await db.from('transactions').select('receipt_code,status').eq('reference', reference).maybeSingle();
  if (existingError) return json(res, 500, { error: 'Could not confirm the transaction record.' });
  let receiptCode = existing?.receipt_code as string | undefined;
  if (!existing) {
    const { data: result, error } = await db.rpc('confirm_paystack_vote', {
      p_reference: reference,
      p_paystack_reference: reference,
      p_contest_id: meta.contest_id,
      p_nominee_id: meta.nominee_id,
      p_vote_count: Number(meta.vote_count),
      p_amount_ghs: Number(meta.amount_ghs),
      p_fee_ghs: Number(meta.fee_ghs),
      p_phone: String(meta.voter_phone),
      p_momo_network: String(meta.momo_network)
    });
    if (error || !result?.success) {
      console.error('Verified Paystack transaction could not be recorded', { reference, error: error?.message, rpc: result });
      return json(res, 500, { error: 'Payment was verified, but vote recording needs support review. Keep this reference: ' + reference });
    }
    receiptCode = result.receipt_code;
  }
  if (req.method === 'GET' && appUrl) {
    return res.redirect(303, `${appUrl.replace(/\/$/, '')}/?payment=success&receipt=${encodeURIComponent(receiptCode || reference)}`);
  }
  return json(res, 200, { success: true, reference, receiptCode });
}
