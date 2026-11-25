-- Add application fields used by the production UI but missing from the live schema.
-- These are additive nullable/defaulted columns; existing rows and vote tallies are preserved.
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS contests_slug_unique ON public.contests (slug) WHERE slug IS NOT NULL;
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS terms_and_conditions text;
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS collect_voter_contacts boolean NOT NULL DEFAULT false;
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS show_public_results boolean NOT NULL DEFAULT true;
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS dispute_deadline timestamptz;
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE public.contests ADD COLUMN IF NOT EXISTS is_locked_for_audit boolean NOT NULL DEFAULT false;
ALTER TABLE public.nominees ADD COLUMN IF NOT EXISTS stage_name text;
ALTER TABLE public.bundle_tiers ADD COLUMN IF NOT EXISTS label text;
