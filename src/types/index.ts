export type UserRole = 'voter' | 'organizer' | 'rss_admin';

export type MomoNetwork = 'MTN' | 'Telecel' | 'AT';

export type ContestType = 'free' | 'paid';

export interface BundleTier {
  id: string;
  votes: number;
  priceGhs: number;
  originalPriceGhs?: number;
  discountPercentage?: number;
  badge?: string;
  popular?: boolean;
  label?: string;
}

export interface Nominee {
  id: string;
  contestId: string;
  name: string;
  stageName?: string;
  photoUrl: string;
  bio: string;
  nomineeCode: string;
  voteCount: number;
  paidVoteCount: number;
  freeVoteCount: number;
  createdAt: string;
}

export type ContestStatus = 'pending_review' | 'active' | 'closed' | 'frozen' | 'disputed' | 'settled' | 'rejected';

export interface Contest {
  id: string;
  slug: string;
  organizerId: string;
  organizerName: string;
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
  pricePerVote: number; // minimum 1.00 GHS for paid
  bundleTiers: BundleTier[];
  showPublicResults: boolean;
  collectVoterContacts: boolean;
  status: ContestStatus;
  escrowReleased: boolean;
  disputeDeadline?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoteRecord {
  id: string;
  contestId: string;
  contestTitle: string;
  nomineeId: string;
  nomineeName: string;
  voteType: 'free' | 'paid';
  voteCount: number;
  voterPhoneHashed: string;
  voterPhoneMasked: string;
  voterPhoneRaw?: string; // stored only if consented
  consentedMarketing: boolean;
  receiptCode: string;
  transactionId?: string;
  amountPaidGhs: number;
  feeGhs: number;
  momoNetwork?: MomoNetwork;
  createdAt: string;
  flaggedAnomaly?: boolean;
}

export interface Transaction {
  id: string;
  reference: string;
  contestId: string;
  nomineeId: string;
  nomineeName: string;
  voteCount: number;
  amountGhs: number;
  feeGhs: number; // ~1.95%
  totalChargedGhs: number;
  organizerRevenueGhs: number; // 90%
  rssCommissionGhs: number; // 10%
  voterPhone: string;
  momoNetwork: MomoNetwork;
  status: 'pending' | 'success' | 'failed';
  receiptCode: string;
  createdAt: string;
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

export interface SystemSettings {
  maxActiveContestsPerOrganizer: number;
  maintenanceMode: boolean;
}

export interface AnomalyAlert {
  id: string;
  contestId: string;
  contestTitle: string;
  nomineeId: string;
  nomineeName: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: string;
  resolved: boolean;
  actionTaken?: string;
}

export interface VoterContact {
  contestId: string;
  contestTitle: string;
  phone: string;
  optedInAt: string;
  totalVotes: number;
}
