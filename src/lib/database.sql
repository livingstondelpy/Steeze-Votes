-- =========================================================
-- STEEZEVOTES DATABASE SCHEMA (Supabase PostgreSQL + RLS)
-- Built for Rooted Steeze Studios (RSS) - Ghanaian Events Market
-- =========================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZERS TABLE
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    organization_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    momo_number TEXT NOT NULL,
    momo_network TEXT NOT NULL CHECK (momo_network IN ('MTN', 'Telecel', 'AT')),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CONTESTS TABLE
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    sponsor_logo_url TEXT,
    sponsor_name TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    price_per_vote NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (price_per_vote >= 1.00),
    bundle_tiers JSONB NOT NULL DEFAULT '[]'::jsonb,
    show_public_results BOOLEAN NOT NULL DEFAULT true,
    collect_voter_contacts BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'frozen', 'disputed', 'settled')),
    escrow_released BOOLEAN NOT NULL DEFAULT false,
    dispute_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NOMINEES TABLE
CREATE TABLE IF NOT EXISTS public.nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    stage_name TEXT,
    photo_url TEXT NOT NULL,
    bio TEXT NOT NULL,
    nominee_code TEXT NOT NULL,
    vote_count INTEGER NOT NULL DEFAULT 0,
    paid_vote_count INTEGER NOT NULL DEFAULT 0,
    free_vote_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(contest_id, nominee_code)
);

-- 4. TRANSACTIONS TABLE (Paystack MoMo Checkout & Split)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT UNIQUE NOT NULL,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE,
    vote_count INTEGER NOT NULL,
    amount_ghs NUMERIC(10, 2) NOT NULL,
    fee_ghs NUMERIC(10, 2) NOT NULL,
    total_charged_ghs NUMERIC(10, 2) NOT NULL,
    organizer_revenue_ghs NUMERIC(10, 2) NOT NULL, -- 90%
    rss_commission_ghs NUMERIC(10, 2) NOT NULL,    -- 10%
    voter_phone TEXT NOT NULL,
    momo_network TEXT NOT NULL CHECK (momo_network IN ('MTN', 'Telecel', 'AT')),
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending', 'success', 'failed')),
    receipt_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. VOTES AUDIT TRAIL
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('free', 'paid')),
    vote_count INTEGER NOT NULL DEFAULT 1,
    voter_phone_hashed TEXT NOT NULL,
    voter_phone_masked TEXT NOT NULL,
    voter_phone_raw TEXT, -- only if consented
    consented_marketing BOOLEAN NOT NULL DEFAULT false,
    receipt_code TEXT NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id),
    amount_paid_ghs NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    fee_ghs NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    momo_network TEXT,
    flagged_anomaly BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce ONE free vote per phone hash per contest
CREATE UNIQUE INDEX IF NOT EXISTS one_free_vote_per_phone_per_contest 
ON public.votes (contest_id, voter_phone_hashed) 
WHERE vote_type = 'free';

-- 6. OTP VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number TEXT NOT NULL,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ANOMALY ALERTS TABLE (For RSS Admin Review Queue)
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT false,
    action_taken TEXT
);

-- INDEXES FOR ULTRA FAST QUERIES
CREATE INDEX IF NOT EXISTS idx_contests_status ON public.contests(status);
CREATE INDEX IF NOT EXISTS idx_nominees_contest ON public.nominees(contest_id);
CREATE INDEX IF NOT EXISTS idx_votes_contest ON public.votes(contest_id);
CREATE INDEX IF NOT EXISTS idx_votes_phone ON public.votes(voter_phone_hashed);
CREATE INDEX IF NOT EXISTS idx_transactions_ref ON public.transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_receipt ON public.transactions(receipt_code);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- Public read policies for active contests and nominees
CREATE POLICY "Public contests are viewable by everyone" ON public.contests FOR SELECT USING (true);
CREATE POLICY "Public nominees are viewable by everyone" ON public.nominees FOR SELECT USING (true);
CREATE POLICY "Public votes count is viewable" ON public.votes FOR SELECT USING (true);
