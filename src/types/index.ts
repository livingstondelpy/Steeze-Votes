export type UserRole = 'voter' | 'organizer' | 'rss_admin';

export type MomoNetwork = 'MTN' | 'Telecel' | 'AT';

export type ContestType = 'free' | 'paid';

export interface BundleTier {
  id: string;
  contestId?: string;
  votes: number;
  priceGhs: number;
  originalPriceGhs?: number;
  discountPercentage?: number;
  badge?: string;
  popular?: boolean;
  label?: string;
  createdAt?: string;
}

export interface Nominee {
  id: string;
  contestId: string;
  name: string;
  stageName?: string;
  photoUrl: string;
  bio: string;
  votingCode: string; // matches backend nominees.voting_code
  nomineeCode?: string; // backward compat alias
  category?: string; // backend nominees.category ('General', etc.)
  status?: string; // backend nominees.status ('active', 'suspended', 'disqualified')
  voteCount: number;
  paidVoteCount: number;
  freeVoteCount: number;
  totalAmountGhs?: number; // backend nominees.total_amount_ghs
  createdAt: string;
}

export type ContestStatus = 'draft' | 'pending_review' | 'active' | 'paused' | 'ended' | 'settled';

export interface Contest {
  id: string;
  slug?: string;
  organizerId: string;
  organizerName?: string;
  title: string;
  description: string;
  category: string;
  bannerUrl: string;
  sponsorLogoUrl?: string;
  sponsorName?: string;
  startDate: string;
  endDate: string;
  contestType: ContestType;
  codePrefix?: string;
  pricePerVote: number | null; // NULL for free contests, >= 1.00 for paid
  bundleTiers: BundleTier[];
  showPublic: boolean; // matches backend contests.show_public
  showPublicResults?: boolean; // backward compat alias
  collectVoterContacts?: boolean;
  status: ContestStatus;
  escrowReleased: boolean;
  isLockedForAudit?: boolean;
  payoutStatus?: PayoutStatus;
  termsAndConditions?: string; // backend contests.terms_and_conditions
  bannerOrder?: number; // backend contests.banner_order
  featured?: boolean; // backend contests.featured
  disputeDeadline?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'held';

export interface PayoutRequest {
  id: string;
  contestId: string;
  contestTitle?: string;
  organizerId: string;
  organizerName?: string;
  momoNetwork: MomoNetwork;
  momoNumber: string;
  grossRevenueGhs: number;
  rssFeeGhs: number;
  netPayoutGhs: number;
  status: PayoutStatus;
  momoTransactionRef?: string;
  requestedAt: string;
  processedAt?: string;
  adminNotes?: string;
}

export interface VoteRecord {
  id: string;
  contestId: string;
  contestTitle?: string;
  nomineeId: string;
  nomineeName?: string;
  voteType: 'free' | 'paid';
  voteCount: number;
  voterPhoneHashed?: string;
  voterPhoneMasked?: string;
  voterPhoneRaw?: string; // stored only if consented
  consentedMarketing?: boolean;
  receiptCode: string;
  transactionId?: string;
  amountPaidGhs?: number;
  feeGhs?: number;
  momoNetwork?: MomoNetwork;
  createdAt: string;
  flaggedAnomaly?: boolean;
}

export type AuditLogRecord = VoteRecord;

// Transaction for internal / admin operations
export interface Transaction {
  id: string;
  reference: string;
  contestId: string;
  nomineeId: string;
  nomineeName?: string;
  voteCount: number;
  amountGhs: number;
  feeGhs: number;
  totalChargedGhs: number;
  organizerRevenueGhs: number;
  rssCommissionGhs: number;
  voterPhone?: string; // Protected PII - strictly excluded from organizer view
  momoNetwork: MomoNetwork;
  status: 'pending' | 'success' | 'failed';
  receiptCode: string;
  paystackReference?: string;
  createdAt: string;
}

// Safe transaction representation queried from public.organizer_transactions_view (Excludes voter_phone)
export interface OrganizerTransaction {
  id: string;
  contestId: string;
  nomineeId: string;
  nomineeName?: string;
  voteCount: number;
  amountGhs: number;
  organizerRevenueGhs: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  reference?: string;
  receiptCode?: string;
}

export interface OrganizerAccount {
  id: string;
  email: string;
  password?: string;
  organizationName: string;
  contactPhone: string;
  momoNumber: string;
  momoNetwork: MomoNetwork;
  status: 'pending' | 'approved' | 'suspended';
  profilePictureUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface PlatformSettings {
  maxActiveContestsPerOrganizer: number;
  maintenanceMode: boolean;
  defaultCommissionRate: number; // 0.10 (10%)
}

export type SystemSettings = PlatformSettings;

export interface Anomaly {
  id: string;
  contestId: string;
  contestTitle?: string;
  nomineeId?: string;
  nomineeName?: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
  resolved: boolean;
  actionTaken?: string;
}

export type AnomalyAlert = Anomaly;

export interface VoterContact {
  contestId: string;
  contestTitle: string;
  phone: string;
  optedInAt: string;
  totalVotes: number;
}

