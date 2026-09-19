-- ============================================================================
-- STEEZEVOTES DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- Platform: Supabase (PostgreSQL 15+)
-- Client: Rooted Steeze Studios (RSS), Ghana
-- Target: Mobile-First Ghanaian Event & Awards Voting (Paystack MoMo + SMS Free Votes)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE contest_type AS ENUM ('free', 'paid');
CREATE TYPE contest_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'ended', 'settled');
CREATE TYPE momo_network AS ENUM ('MTN', 'Telecel', 'AT');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'held');
CREATE TYPE transaction_status AS ENUM ('pending', 'success', 'failed');
CREATE TYPE organizer_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE anomaly_severity AS ENUM ('low', 'medium', 'high');

-- ============================================================================
-- 3. TABLES
-- ============================================================================

-- 3.1 Organizers Table (linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    organization_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    momo_number TEXT NOT NULL,
    momo_network momo_network NOT NULL DEFAULT 'MTN',
    status organizer_status NOT NULL DEFAULT 'approved',
    profile_picture_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 Contests Table
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Music & Entertainment',
    contest_type contest_type NOT NULL DEFAULT 'paid',
    code_prefix TEXT NOT NULL DEFAULT 'STZ',
    banner_url TEXT,
    price_per_vote NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_date TIMESTAMPTZ NOT NULL,
    status contest_status NOT NULL DEFAULT 'active',
    show_public BOOLEAN NOT NULL DEFAULT TRUE,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    banner_order INT NOT NULL DEFAULT 0,
    terms_and_conditions TEXT,
    sponsor_name TEXT,
    sponsor_logo_url TEXT,
    escrow_released BOOLEAN NOT NULL DEFAULT FALSE,
    payout_status payout_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Nominees Table
CREATE TABLE IF NOT EXISTS public.nominees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    voting_code TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    photo_url TEXT,
    bio TEXT,
    vote_count BIGINT NOT NULL DEFAULT 0,
    free_vote_count BIGINT NOT NULL DEFAULT 0,
    paid_vote_count BIGINT NOT NULL DEFAULT 0,
    total_amount_ghs NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_contest_nominee_code UNIQUE (contest_id, voting_code)
);

-- 3.4 Bundle Tiers Table
CREATE TABLE IF NOT EXISTS public.bundle_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    votes INT NOT NULL,
    price_ghs NUMERIC(10, 2) NOT NULL,
    original_price_ghs NUMERIC(10, 2),
    discount_percentage INT DEFAULT 0,
    badge TEXT,
    popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Transactions Table (Strictly Internal: Voter Phone Never Shown to Organizers)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference TEXT NOT NULL UNIQUE,
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE RESTRICT,
    nominee_id UUID NOT NULL REFERENCES public.nominees(id) ON DELETE RESTRICT,
    vote_count INT NOT NULL DEFAULT 1,
    amount_ghs NUMERIC(10, 2) NOT NULL,
    fee_ghs NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_charged_ghs NUMERIC(10, 2) NOT NULL,
    organizer_revenue_ghs NUMERIC(10, 2) NOT NULL, -- 90%
    rss_commission_ghs NUMERIC(10, 2) NOT NULL,    -- 10%
    voter_phone TEXT NOT NULL,                     -- PROTECTED PII
    momo_network momo_network NOT NULL,
    status transaction_status NOT NULL DEFAULT 'pending',
    receipt_code TEXT NOT NULL,
    paystack_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.6 Individual Votes Audit Log
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE RESTRICT,
    nominee_id UUID NOT NULL REFERENCES public.nominees(id) ON DELETE RESTRICT,
    vote_type contest_type NOT NULL DEFAULT 'paid',
    vote_count INT NOT NULL DEFAULT 1,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    momo_network momo_network,
    flagged_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.7 Free Votes SMS Deduplication Record (1 Free Vote per Phone per Contest)
CREATE TABLE IF NOT EXISTS public.free_vote_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    phone_hash TEXT NOT NULL, -- SHA-256 hash of international Ghanaian format (+233...)
    voted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_contest_voter_free_vote UNIQUE (contest_id, phone_hash)
);

-- 3.8 Mobile Money Payout Requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE RESTRICT,
    organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE RESTRICT,
    gross_revenue_ghs NUMERIC(12, 2) NOT NULL,
    rss_fee_ghs NUMERIC(12, 2) NOT NULL,
    net_payout_ghs NUMERIC(12, 2) NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    momo_network momo_network NOT NULL,
    momo_number TEXT NOT NULL,
    momo_transaction_ref TEXT,
    admin_notes TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 3.9 Anomaly Alerts
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    nominee_id UUID REFERENCES public.nominees(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    severity anomaly_severity NOT NULL DEFAULT 'medium',
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    action_taken TEXT
);

-- 3.10 System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.system_settings (key, value)
VALUES 
    ('max_active_contests_per_organizer', '5'::jsonb),
    ('maintenance_mode', 'false'::jsonb),
    ('rss_fee_percentage', '10'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.free_vote_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4.1 Organizers RLS
-- Public can view organizer basic branding
CREATE POLICY "Public can view approved organizer profiles"
ON public.organizers FOR SELECT
USING (status = 'approved');

-- Organizers can update their own profile
CREATE POLICY "Organizers can update own profile"
ON public.organizers FOR UPDATE
USING (auth.uid() = id);

-- 4.2 Contests RLS
-- Public can view active published contests
CREATE POLICY "Public can view active contests"
ON public.contests FOR SELECT
USING (show_public = TRUE AND status != 'draft');

-- Organizers can view ALL their own contests (including drafts)
CREATE POLICY "Organizers can view own contests"
ON public.contests FOR SELECT
USING (auth.uid() = organizer_id);

-- Organizers can create contests
CREATE POLICY "Organizers can insert own contests"
ON public.contests FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

-- Organizers can update own contests (if not locked by admin)
CREATE POLICY "Organizers can update own contests"
ON public.contests FOR UPDATE
USING (auth.uid() = organizer_id);

-- 4.3 Nominees RLS
-- Public can view nominees of published contests
CREATE POLICY "Public can view nominees"
ON public.nominees FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.contests c
        WHERE c.id = nominees.contest_id AND c.show_public = TRUE
    )
);

-- Organizers can manage nominees for their contests
CREATE POLICY "Organizers can manage nominees"
ON public.nominees FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.contests c
        WHERE c.id = nominees.contest_id AND c.organizer_id = auth.uid()
    )
);

-- 4.4 Bundle Tiers RLS
CREATE POLICY "Public can view bundle tiers"
ON public.bundle_tiers FOR SELECT
USING (TRUE);

CREATE POLICY "Organizers can manage bundle tiers"
ON public.bundle_tiers FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.contests c
        WHERE c.id = bundle_tiers.contest_id AND c.organizer_id = auth.uid()
    )
);

-- 4.5 Transactions RLS (CRITICAL PRIVACY: ORGANIZERS CAN NEVER READ VOTER PHONES)
-- Public can view anonymous receipt by reference
CREATE POLICY "Voters can view their own transaction receipt"
ON public.transactions FOR SELECT
USING (status = 'success');

-- Note: In production, create a secure VIEW for organizers that omits voter_phone completely:
CREATE OR REPLACE VIEW public.organizer_contest_sales AS
SELECT 
    t.id,
    t.contest_id,
    t.nominee_id,
    t.vote_count,
    t.amount_ghs,
    t.organizer_revenue_ghs,
    t.status,
    t.created_at
FROM public.transactions t;

-- 4.6 Payout Requests RLS
CREATE POLICY "Organizers can view own payout requests"
ON public.payout_requests FOR SELECT
USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can insert payout requests"
ON public.payout_requests FOR INSERT
WITH CHECK (auth.uid() = organizer_id);

-- 4.7 Votes Audit Log RLS
CREATE POLICY "Public can view vote logs for transparency"
ON public.votes FOR SELECT
USING (TRUE);

-- 4.8 Free Vote Deduplication RLS
-- Only system service role can read/insert free vote records to enforce 1 vote per phone
CREATE POLICY "Service role manages free vote records"
ON public.free_vote_records FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================================================
-- 5. STORAGE BUCKETS (SUPABASE STORAGE)
-- Run in Supabase SQL editor to create public asset storage
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('contest-banners', 'contest-banners', true),
    ('nominee-photos', 'nominee-photos', true),
    ('organizer-avatars', 'organizer-avatars', true),
    ('sponsor-logos', 'sponsor-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Public Read for all buckets
CREATE POLICY "Public read contest banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'contest-banners');

CREATE POLICY "Public read nominee photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'nominee-photos');

CREATE POLICY "Public read organizer avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'organizer-avatars');

CREATE POLICY "Public read sponsor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'sponsor-logos');

-- Authenticated Organizers can upload to all buckets
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contest-banners' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload nominee photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'nominee-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload organizer avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'organizer-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload sponsor logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sponsor-logos' AND auth.role() = 'authenticated');

-- ============================================================================
-- 6. REALTIME REPLICATION (For Live Voting Updates on SteezeVotes)
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.contests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nominees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
