import { 
  Contest, 
  Nominee, 
  VoteRecord, 
  Transaction, 
  OrganizerTransaction,
  OrganizerAccount, 
  Anomaly, 
  MomoNetwork, 
  BundleTier, 
  PlatformSettings, 
  PayoutRequest, 
  PayoutStatus 
} from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { formatRpcVoteError } from './rpcErrors';

// Simple deterministic hash for phone privacy and 1-free-vote enforcement
export function hashPhoneNumber(phone?: string): string {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

export function maskPhoneNumber(phone?: string): string {
  const clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.length >= 9) {
    const prefix = clean.slice(0, 3);
    const suffix = clean.slice(-3);
    return `+233 ${prefix} *** ${suffix}`;
  }
  return phone || '';
}

export function generateReceiptCode(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `STZ-GH-${randomNum}`;
}

export function calculatePaystackFee(amountGhs: number): number {
  // Paystack Ghana standard ~1.95% fee (capped or transparent)
  const fee = +(amountGhs * 0.0195).toFixed(2);
  return Math.max(0.20, fee);
}

// Initial Ghanaian Event Organizers
export const INITIAL_ORGANIZERS: OrganizerAccount[] = [
  {
    id: 'org-rss-01',
    email: 'events@rootedsteeze.com',
    password: 'demo123',
    organizationName: 'Rooted Steeze Studios (RSS)',
    contactPhone: '+233244123456',
    momoNumber: '0244123456',
    momoNetwork: 'MTN',
    status: 'approved',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'org-echohouse-02',
    email: 'awards@echohousegh.com',
    password: 'demo123',
    organizationName: 'Echo House Events Ghana',
    contactPhone: '+233201987654',
    momoNumber: '0201987654',
    momoNetwork: 'Telecel',
    status: 'approved',
    createdAt: '2026-02-01T12:30:00Z',
  },
  {
    id: 'org-charter-03',
    email: 'info@charterhouseghana.com',
    password: 'demo123',
    organizationName: 'Charterhouse Live',
    contactPhone: '+233261112233',
    momoNumber: '0261112233',
    momoNetwork: 'AT',
    status: 'approved',
    createdAt: '2026-02-15T09:00:00Z',
  },
];

// Initial Ghanaian Contests
export const INITIAL_CONTESTS: Contest[] = [
  {
    id: 'contest-gma-uk-2026',
    slug: 'ghana-music-awards-uk-2026',
    organizerId: 'org-rss-01',
    organizerName: 'Rooted Steeze Studios (RSS)',
    title: 'Ghana Music Awards UK 2026: Artiste of the Year',
    description: 'The highest honor in Ghanaian music abroad. Cast your free verified vote or support your favorite superstar with official paid vote bundles. Verified by SteezeVotes with MoMo instant processing.',
    category: 'Music & Entertainment',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&h=1250&q=80',
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=400&h=400&q=80',
    sponsorName: 'Guinness Ghana & Joy Prime',
    startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000 + 14 * 3600 * 1000).toISOString(),
    contestType: 'paid',
    codePrefix: 'STZ',
    pricePerVote: 1.00,
    bundleTiers: [
      { id: 'b-1', votes: 1, priceGhs: 1.00, label: 'Single Vote' },
      { id: 'b-5', votes: 5, priceGhs: 5.00, label: '5 Votes Starter' },
      { id: 'b-10', votes: 10, priceGhs: 9.00, originalPriceGhs: 10.00, discountPercentage: 10, badge: 'Popular', popular: true },
      { id: 'b-25', votes: 25, priceGhs: 20.00, originalPriceGhs: 25.00, discountPercentage: 20, badge: '20% OFF' },
      { id: 'b-50', votes: 50, priceGhs: 38.00, originalPriceGhs: 50.00, discountPercentage: 24, badge: 'Super Fan' },
      { id: 'b-100', votes: 100, priceGhs: 70.00, originalPriceGhs: 100.00, discountPercentage: 30, badge: '30% MEGA DEAL' },
    ],
    showPublic: true,
    showPublicResults: true,
    collectVoterContacts: true,
    status: 'active',
    escrowReleased: false,
    disputeDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 14 * 3600 * 1000).toISOString(),
    termsAndConditions: 'All votes are final and verified in real-time. Organizers agree to a 24-hour escrow inspection period before funds release.',
    bannerOrder: 1,
    featured: true,
    createdAt: '2026-08-20T10:00:00Z',
    updatedAt: '2026-08-27T12:00:00Z',
  },
  {
    id: 'contest-accra-dj-2026',
    slug: 'accra-nightlife-awards-best-dj',
    organizerId: 'org-echohouse-02',
    organizerName: 'Echo House Events Ghana',
    title: 'Accra Nightlife Awards 2026: Best Club DJ of the Year',
    description: 'Celebrating the sound masters igniting Osu, East Legon, and Labadi nights. 1 free phone-verified vote plus optional bundle voting via MTN MoMo, Telecel and AT Cash.',
    category: 'Nightlife & Culture',
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&h=1250&q=80',
    sponsorLogoUrl: '',
    sponsorName: 'Club Shandy Ghana',
    startDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
    contestType: 'paid',
    codePrefix: 'DJ',
    pricePerVote: 1.50,
    bundleTiers: [
      { id: 'dj-5', votes: 5, priceGhs: 7.50, label: '5 Votes' },
      { id: 'dj-15', votes: 15, priceGhs: 20.00, originalPriceGhs: 22.50, discountPercentage: 11, popular: true, badge: 'Hype Tier' },
      { id: 'dj-50', votes: 50, priceGhs: 60.00, originalPriceGhs: 75.00, discountPercentage: 20, badge: 'Club King' },
    ],
    showPublic: true,
    showPublicResults: true,
    collectVoterContacts: false,
    status: 'active',
    escrowReleased: false,
    termsAndConditions: 'Fair competition rules apply. Any anomalous activity detected by the audit engine will be reviewed.',
    bannerOrder: 2,
    featured: true,
    createdAt: '2026-08-22T08:00:00Z',
    updatedAt: '2026-08-27T08:00:00Z',
  },
  {
    id: 'contest-campus-free-2026',
    slug: 'ghana-youth-leadership-free-vote-2026',
    organizerId: 'org-rss-01',
    organizerName: 'Rooted Steeze Studios (RSS)',
    title: 'Ghana National Youth Leadership Awards (100% Free Voting)',
    description: 'Strictly 1 free OTP-verified SMS vote per Ghanaian voter. Zero paid vote bundles, zero commission. Transparent public community choice award.',
    category: 'Leadership & Innovation',
    bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&h=1250&q=80',
    startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    contestType: 'free',
    codePrefix: 'YL',
    pricePerVote: null, // Free contests must store NULL in price_per_vote
    bundleTiers: [],
    showPublic: true,
    showPublicResults: true,
    collectVoterContacts: true,
    status: 'active',
    escrowReleased: true,
    termsAndConditions: '100% free community award. Exactly 1 verified vote per Ghanaian mobile phone number.',
    bannerOrder: 3,
    featured: false,
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-08-27T10:00:00Z',
  },
  {
    id: 'contest-malaika-2026',
    slug: 'miss-malaika-university-2026',
    organizerId: 'org-charter-03',
    organizerName: 'Charterhouse Live',
    title: 'Miss Malaika University Edition 2026: People’s Choice Delegate',
    description: 'Empowering brilliance, culture, and leadership across tertiary campuses in Ghana. Live votes determine 40% of the final coronation score.',
    category: 'Pageantry & Fashion',
    bannerUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&h=1250&q=80',
    startDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    contestType: 'paid',
    codePrefix: 'MLK',
    pricePerVote: 2.00,
    bundleTiers: [
      { id: 'm-10', votes: 10, priceGhs: 20.00, label: '10 Votes' },
      { id: 'm-25', votes: 25, priceGhs: 45.00, originalPriceGhs: 50.00, discountPercentage: 10, badge: 'Popular' },
      { id: 'm-100', votes: 100, priceGhs: 160.00, originalPriceGhs: 200.00, discountPercentage: 20, badge: 'VIP Crown Patron' },
    ],
    showPublic: true,
    showPublicResults: true,
    collectVoterContacts: true,
    status: 'ended', // Backend enum: 'ended', not 'closed'
    escrowReleased: false,
    disputeDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    termsAndConditions: 'Final delegate scores incorporate 40% public verified vote tallies subject to RSS audit clearance.',
    bannerOrder: 4,
    featured: false,
    createdAt: '2026-08-15T14:00:00Z',
    updatedAt: '2026-08-26T23:59:59Z',
  }
];

// Initial Nominees
export const INITIAL_NOMINEES: Nominee[] = [
  // GMA UK Nominees
  {
    id: 'nom-stonebwoy',
    contestId: 'contest-gma-uk-2026',
    name: 'Livingstone Etse Satekla',
    stageName: 'Stonebwoy',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    bio: 'Bhim Nation President, Grammy-contender, and reigning global Afrodancehall titan with 5th Dimension.',
    votingCode: 'STZ-01',
    nomineeCode: 'STZ-01',
    category: 'Artiste of the Year',
    status: 'active',
    voteCount: 1420,
    paidVoteCount: 1180,
    freeVoteCount: 240,
    totalAmountGhs: 1180.00,
    createdAt: '2026-08-20T10:05:00Z',
  },
  {
    id: 'nom-blacksherif',
    contestId: 'contest-gma-uk-2026',
    name: 'Mohammed Ismail Sherif',
    stageName: 'Black Sherif (Blacko)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'The Villain I Never Was sensation, chart-topping storyteller capturing global hearts with Iron Boy energy.',
    votingCode: 'STZ-02',
    nomineeCode: 'STZ-02',
    category: 'Artiste of the Year',
    status: 'active',
    voteCount: 1580,
    paidVoteCount: 1310,
    freeVoteCount: 270,
    totalAmountGhs: 1310.00,
    createdAt: '2026-08-20T10:06:00Z',
  },
  {
    id: 'nom-sarkodie',
    contestId: 'contest-gma-uk-2026',
    name: 'Michael Owusu Addo',
    stageName: 'Sarkodie',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'African Rap Royalty, BET International Flow Winner, and continuous pioneer of modern African hiphop.',
    votingCode: 'STZ-03',
    nomineeCode: 'STZ-03',
    category: 'Artiste of the Year',
    status: 'active',
    voteCount: 1120,
    paidVoteCount: 940,
    freeVoteCount: 180,
    totalAmountGhs: 940.00,
    createdAt: '2026-08-20T10:07:00Z',
  },
  {
    id: 'nom-kingpromise',
    contestId: 'contest-gma-uk-2026',
    name: 'Gregory Bortey Newman',
    stageName: 'King Promise',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    bio: '5-Star Voice behind Terminator and Paris, leading the contemporary Ghanaian Highlife-Afrobeats world wave.',
    votingCode: 'STZ-04',
    nomineeCode: 'STZ-04',
    category: 'Artiste of the Year',
    status: 'active',
    voteCount: 890,
    paidVoteCount: 760,
    freeVoteCount: 130,
    totalAmountGhs: 760.00,
    createdAt: '2026-08-20T10:08:00Z',
  },
  {
    id: 'nom-gyakie',
    contestId: 'contest-gma-uk-2026',
    name: 'Jackline Acheampong',
    stageName: 'Gyakie (Song Bird)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Song Bird of Ghana, multi-platinum R&B star bridging Accra to London and Lagos seamlessly.',
    votingCode: 'STZ-05',
    nomineeCode: 'STZ-05',
    category: 'Artiste of the Year',
    status: 'active',
    voteCount: 760,
    paidVoteCount: 610,
    freeVoteCount: 150,
    totalAmountGhs: 610.00,
    createdAt: '2026-08-20T10:09:00Z',
  },

  // Accra Nightlife DJ Nominees
  {
    id: 'nom-dj-vyrusky',
    contestId: 'contest-accra-dj-2026',
    name: 'Kofi Amoako',
    stageName: 'DJ Vyrusky',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    bio: 'Master of the turntable and staple of Accra festival stages.',
    votingCode: 'DJ-01',
    nomineeCode: 'DJ-01',
    category: 'Best Club DJ',
    status: 'active',
    voteCount: 640,
    paidVoteCount: 520,
    freeVoteCount: 120,
    totalAmountGhs: 780.00,
    createdAt: '2026-08-22T08:10:00Z',
  },
  {
    id: 'nom-dj-lord',
    contestId: 'contest-accra-dj-2026',
    name: 'Lord Ohene-Ofei',
    stageName: 'DJ Lord OTB',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'Energy god on the deck bringing nonstop amapiano and highlife blends.',
    votingCode: 'DJ-02',
    nomineeCode: 'DJ-02',
    category: 'Best Club DJ',
    status: 'active',
    voteCount: 710,
    paidVoteCount: 600,
    freeVoteCount: 110,
    totalAmountGhs: 900.00,
    createdAt: '2026-08-22T08:11:00Z',
  },

  // Miss Malaika Nominees
  {
    id: 'nom-malaika-1',
    contestId: 'contest-malaika-2026',
    name: 'Akua Serwaa Boateng',
    stageName: 'Akua (Univ. of Ghana, Legon)',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    bio: 'Biochemistry major promoting maternal health literacy across rural Ghana.',
    votingCode: 'MAL-01',
    nomineeCode: 'MAL-01',
    category: 'Delegate',
    status: 'active',
    voteCount: 2310,
    paidVoteCount: 2150,
    freeVoteCount: 160,
    totalAmountGhs: 4300.00,
    createdAt: '2026-08-15T14:10:00Z',
  },
  {
    id: 'nom-malaika-2',
    contestId: 'contest-malaika-2026',
    name: 'Naa Dromo Quaynor',
    stageName: 'Naa (Ashesi University)',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'Computer Engineering scholar and STEM ambassador for young Ghanaian girls.',
    votingCode: 'MAL-02',
    nomineeCode: 'MAL-02',
    category: 'Delegate',
    status: 'active',
    voteCount: 2190,
    paidVoteCount: 2010,
    freeVoteCount: 180,
    totalAmountGhs: 4020.00,
    createdAt: '2026-08-15T14:12:00Z',
  }
];

// Initial Seed Votes and Transactions
export const INITIAL_VOTES: VoteRecord[] = [
  {
    id: 'vote-seed-1',
    contestId: 'contest-gma-uk-2026',
    contestTitle: 'Ghana Music Awards UK 2026 - Artiste of the Year',
    nomineeId: 'nom-stonebwoy',
    nomineeName: 'Stonebwoy',
    voteType: 'paid',
    voteCount: 50,
    voterPhoneHashed: hashPhoneNumber('0244123892'),
    voterPhoneMasked: maskPhoneNumber('0244123892'),
    voterPhoneRaw: '+233244123892',
    consentedMarketing: true,
    receiptCode: 'STZ-GH-742911',
    amountPaidGhs: 38.00,
    feeGhs: 0.74,
    momoNetwork: 'MTN',
    createdAt: '2026-08-27T14:20:00Z',
  },
  {
    id: 'vote-seed-2',
    contestId: 'contest-gma-uk-2026',
    contestTitle: 'Ghana Music Awards UK 2026 - Artiste of the Year',
    nomineeId: 'nom-blacksherif',
    nomineeName: 'Black Sherif (Blacko)',
    voteType: 'free',
    voteCount: 1,
    voterPhoneHashed: hashPhoneNumber('0208119034'),
    voterPhoneMasked: maskPhoneNumber('0208119034'),
    consentedMarketing: false,
    receiptCode: 'STZ-GH-194022',
    amountPaidGhs: 0.00,
    feeGhs: 0.00,
    createdAt: '2026-08-27T15:10:00Z',
  },
  {
    id: 'vote-seed-3',
    contestId: 'contest-gma-uk-2026',
    contestTitle: 'Ghana Music Awards UK 2026 - Artiste of the Year',
    nomineeId: 'nom-blacksherif',
    nomineeName: 'Black Sherif (Blacko)',
    voteType: 'paid',
    voteCount: 100,
    voterPhoneHashed: hashPhoneNumber('0559988776'),
    voterPhoneMasked: maskPhoneNumber('0559988776'),
    voterPhoneRaw: '+233559988776',
    consentedMarketing: true,
    receiptCode: 'STZ-GH-889312',
    amountPaidGhs: 70.00,
    feeGhs: 1.37,
    momoNetwork: 'MTN',
    createdAt: '2026-08-27T16:05:00Z',
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    reference: 'PAYSTACK-STZ-742911',
    contestId: 'contest-gma-uk-2026',
    nomineeId: 'nom-stonebwoy',
    nomineeName: 'Stonebwoy',
    voteCount: 50,
    amountGhs: 38.00,
    feeGhs: 0.74,
    totalChargedGhs: 38.74,
    organizerRevenueGhs: 34.20,
    rssCommissionGhs: 3.80,
    voterPhone: '0244123892',
    momoNetwork: 'MTN',
    status: 'success',
    receiptCode: 'STZ-GH-742911',
    createdAt: '2026-08-27T14:20:00Z',
  },
  {
    id: 'tx-2',
    reference: 'PAYSTACK-STZ-889312',
    contestId: 'contest-gma-uk-2026',
    nomineeId: 'nom-blacksherif',
    nomineeName: 'Black Sherif (Blacko)',
    voteCount: 100,
    amountGhs: 70.00,
    feeGhs: 1.37,
    totalChargedGhs: 71.37,
    organizerRevenueGhs: 63.00,
    rssCommissionGhs: 7.00,
    voterPhone: '0559988776',
    momoNetwork: 'MTN',
    status: 'success',
    receiptCode: 'STZ-GH-889312',
    createdAt: '2026-08-27T16:05:00Z',
  }
];

export const INITIAL_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-1',
    contestId: 'contest-malaika-2026',
    contestTitle: 'Miss Malaika University Edition 2026 - People’s Choice Delegate',
    nomineeId: 'nom-malaika-1',
    nomineeName: 'Akua Serwaa Boateng',
    reason: 'Surge of 8 bundle payments (800 votes) within 90 seconds from same MoMo subnet.',
    severity: 'medium',
    detectedAt: '2026-08-26T22:30:00Z',
    resolved: false,
  }
];

export const INITIAL_PAYOUT_REQUESTS: PayoutRequest[] = [
  {
    id: 'pay-req-01',
    contestId: 'contest-campus-free-2026',
    contestTitle: 'Ghana National Youth Leadership Awards (100% Free Voting)',
    organizerId: 'org-rss-01',
    organizerName: 'Rooted Steeze Studios (RSS)',
    momoNetwork: 'MTN',
    momoNumber: '0244123456',
    grossRevenueGhs: 0.00,
    rssFeeGhs: 0.00,
    netPayoutGhs: 0.00,
    status: 'paid',
    momoTransactionRef: 'MM-MTN-GH-991204',
    requestedAt: '2026-08-25T14:30:00Z',
    processedAt: '2026-08-25T15:10:00Z',
    adminNotes: 'Free contest audited and settled.',
  },
  {
    id: 'pay-req-02',
    contestId: 'contest-malaika-2026',
    contestTitle: 'Miss Malaika University Edition 2026 - People’s Choice Delegate',
    organizerId: 'org-charter-03',
    organizerName: 'Charterhouse Live',
    momoNetwork: 'AT',
    momoNumber: '0261112233',
    grossRevenueGhs: 1250.00,
    rssFeeGhs: 125.00,
    netPayoutGhs: 1125.00,
    status: 'pending',
    requestedAt: '2026-08-27T09:15:00Z',
    adminNotes: 'Contest ended. Pending 24-hour escrow dispute clearance.',
  }
];

// Local state container with localStorage persistence
class AppStore {
  organizers: OrganizerAccount[] = [];
  contests: Contest[] = [];
  nominees: Nominee[] = [];
  votes: VoteRecord[] = [];
  transactions: Transaction[] = [];
  anomalies: Anomaly[] = [];
  payoutRequests: PayoutRequest[] = [];
  systemSettings: PlatformSettings = {
    maxActiveContestsPerOrganizer: 5,
    maintenanceMode: false,
    defaultCommissionRate: 0.10, // matches backend platform_settings.default_commission_rate
  };
  otpStore: Map<string, { otp: string; expires: number; attempts: number }> = new Map();
  lowDataMode: boolean = false;
  listeners: Set<() => void> = new Set();
  socialProofCount: number = 347;

  constructor() {
    this.loadState();
    // Simulate real-time social proof activity ticker
    setInterval(() => {
      this.socialProofCount += Math.floor(Math.random() * 3) + 1;
      this.notify();
    }, 45000);

    // If Supabase is connected, synchronize data from live backend
    if (typeof window !== 'undefined') {
      this.initSupabaseSync();
    }
  }

  async initSupabaseSync() {
    if (!isSupabaseConfigured()) return;
    try {
      await Promise.allSettled([
        this.fetchPlatformSettings(),
        this.fetchContestsFromSupabase(),
        this.fetchNomineesFromSupabase(),
      ]);
    } catch (err) {
      console.warn('Initial Supabase sync error:', err);
    }
  }

  async fetchPlatformSettings(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase.from('platform_settings').select('*');
      if (!error && data) {
        data.forEach((row: any) => {
          if (row.key === 'default_commission_rate') {
            const val = typeof row.value === 'number' ? row.value : parseFloat(row.value);
            if (!isNaN(val)) {
              this.systemSettings.defaultCommissionRate = val;
            }
          } else if (row.key === 'max_active_contests_per_organizer') {
            const val = parseInt(row.value, 10);
            if (!isNaN(val)) {
              this.systemSettings.maxActiveContestsPerOrganizer = val;
            }
          } else if (row.key === 'maintenance_mode') {
            this.systemSettings.maintenanceMode = Boolean(row.value);
          }
        });
        this.notify();
      }
    } catch (err) {
      console.warn('Failed to load platform_settings from Supabase:', err);
    }
  }

  async fetchContestsFromSupabase(): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*, bundle_tiers(*), organizers(organization_name)')
        .order('banner_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        this.contests = data.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          organizerId: c.organizer_id,
          organizerName: c.organizers?.organization_name || 'Event Organizer',
          title: c.title,
          description: c.description || '',
          category: c.category || 'General',
          bannerUrl: c.banner_url || '',
          sponsorLogoUrl: c.sponsor_logo_url || '',
          sponsorName: c.sponsor_name || '',
          startDate: c.start_date,
          endDate: c.end_date,
          contestType: c.contest_type,
          codePrefix: c.code_prefix,
          pricePerVote: c.contest_type === 'free' ? null : (c.price_per_vote !== null ? Number(c.price_per_vote) : null),
          bundleTiers: (c.bundle_tiers || []).map((b: any) => ({
            id: b.id,
            contestId: b.contest_id,
            votes: b.votes,
            priceGhs: Number(b.price_ghs),
            originalPriceGhs: b.original_price_ghs ? Number(b.original_price_ghs) : undefined,
            discountPercentage: b.discount_percentage,
            badge: b.badge,
            popular: b.popular,
            label: b.label || `${b.votes} Votes`,
            createdAt: b.created_at,
          })),
          showPublic: c.show_public ?? true,
          showPublicResults: c.show_public ?? true,
          collectVoterContacts: c.collect_voter_contacts ?? false,
          status: c.status,
          escrowReleased: c.escrow_released ?? false,
          isLockedForAudit: c.is_locked_for_audit ?? false,
          payoutStatus: c.payout_status,
          termsAndConditions: c.terms_and_conditions,
          bannerOrder: c.banner_order,
          featured: c.featured,
          disputeDeadline: c.dispute_deadline,
          rejectionReason: c.rejection_reason,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        }));
        this.saveState();
      }
    } catch (err) {
      console.warn('Failed to load contests from Supabase:', err);
    }
  }

  async fetchNomineesFromSupabase(contestId?: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      let query = supabase.from('nominees').select('*');
      if (contestId) {
        query = query.eq('contest_id', contestId);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const mapped = data.map((n: any) => ({
          id: n.id,
          contestId: n.contest_id,
          name: n.name,
          stageName: n.stage_name || undefined,
          photoUrl: n.photo_url || '',
          bio: n.bio || '',
          votingCode: n.voting_code,
          nomineeCode: n.voting_code,
          category: n.category || 'General',
          status: n.status || 'active',
          voteCount: n.vote_count || 0,
          paidVoteCount: n.paid_vote_count || 0,
          freeVoteCount: n.free_vote_count || 0,
          totalAmountGhs: n.total_amount_ghs ? Number(n.total_amount_ghs) : undefined,
          createdAt: n.created_at,
        }));

        if (contestId) {
          this.nominees = [
            ...this.nominees.filter((item) => item.contestId !== contestId),
            ...mapped,
          ];
        } else {
          this.nominees = mapped;
        }
        this.saveState();
      }
    } catch (err) {
      console.warn('Failed to load nominees from Supabase:', err);
    }
  }

  /**
   * Fetch organizer transactions using the safe public.organizer_transactions_view (Excludes voter_phone)
   */
  async fetchOrganizerTransactions(contestId: string): Promise<OrganizerTransaction[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('organizer_transactions_view')
          .select('*')
          .eq('contest_id', contestId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((row: any) => ({
            id: row.id,
            contestId: row.contest_id,
            nomineeId: row.nominee_id,
            nomineeName: row.nominee_name,
            voteCount: row.vote_count,
            amountGhs: Number(row.amount_ghs),
            organizerRevenueGhs: Number(row.organizer_revenue_ghs),
            status: row.status,
            createdAt: row.created_at,
            reference: row.reference,
            receiptCode: row.receipt_code,
          }));
        }
      } catch (err) {
        console.warn('Failed to query organizer_transactions_view:', err);
      }
    }

    // Fallback: Return in-memory transactions stripped of voterPhone
    return this.transactions
      .filter((t) => t.contestId === contestId)
      .map((t) => ({
        id: t.id,
        contestId: t.contestId,
        nomineeId: t.nomineeId,
        nomineeName: t.nomineeName,
        voteCount: t.voteCount,
        amountGhs: t.amountGhs,
        organizerRevenueGhs: t.organizerRevenueGhs,
        status: t.status,
        createdAt: t.createdAt,
        reference: t.reference,
        receiptCode: t.receiptCode,
      }));
  }

  private loadState() {
    try {
      const savedOrganizers = localStorage.getItem('steeze_organizers');
      const savedContests = localStorage.getItem('steeze_contests');
      const savedNominees = localStorage.getItem('steeze_nominees');
      const savedVotes = localStorage.getItem('steeze_votes');
      const savedTxs = localStorage.getItem('steeze_transactions');
      const savedAnoms = localStorage.getItem('steeze_anomalies');
      const savedPayouts = localStorage.getItem('steeze_payout_requests');
      const savedLowData = localStorage.getItem('steeze_low_data');
      const savedSettings = localStorage.getItem('steeze_settings');

      this.organizers = savedOrganizers ? JSON.parse(savedOrganizers) : INITIAL_ORGANIZERS;
      this.contests = savedContests ? JSON.parse(savedContests) : INITIAL_CONTESTS;
      this.nominees = savedNominees ? JSON.parse(savedNominees) : INITIAL_NOMINEES;
      this.votes = savedVotes ? JSON.parse(savedVotes) : INITIAL_VOTES;
      this.transactions = savedTxs ? JSON.parse(savedTxs) : INITIAL_TRANSACTIONS;
      this.anomalies = savedAnoms ? JSON.parse(savedAnoms) : INITIAL_ANOMALIES;
      this.payoutRequests = savedPayouts ? JSON.parse(savedPayouts) : INITIAL_PAYOUT_REQUESTS;
      this.lowDataMode = savedLowData === 'true';
      if (savedSettings) {
        this.systemSettings = { ...this.systemSettings, ...JSON.parse(savedSettings) };
      }
    } catch {
      this.organizers = INITIAL_ORGANIZERS;
      this.contests = INITIAL_CONTESTS;
      this.nominees = INITIAL_NOMINEES;
      this.votes = INITIAL_VOTES;
      this.transactions = INITIAL_TRANSACTIONS;
      this.anomalies = INITIAL_ANOMALIES;
      this.payoutRequests = INITIAL_PAYOUT_REQUESTS;
    }
  }

  private saveState() {
    try {
      localStorage.setItem('steeze_organizers', JSON.stringify(this.organizers));
      localStorage.setItem('steeze_contests', JSON.stringify(this.contests));
      localStorage.setItem('steeze_nominees', JSON.stringify(this.nominees));
      localStorage.setItem('steeze_votes', JSON.stringify(this.votes));
      localStorage.setItem('steeze_transactions', JSON.stringify(this.transactions));
      localStorage.setItem('steeze_anomalies', JSON.stringify(this.anomalies));
      localStorage.setItem('steeze_payout_requests', JSON.stringify(this.payoutRequests));
      localStorage.setItem('steeze_low_data', String(this.lowDataMode));
      localStorage.setItem('steeze_settings', JSON.stringify(this.systemSettings));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  setLowDataMode(val: boolean) {
    this.lowDataMode = val;
    this.saveState();
  }

  // OTP Handling (Rate limited, 6-digit SMS simulation)
  sendOtp(phone: string, contestId: string): { success: boolean; message: string; simulatedOtp?: string } {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      return { success: false, message: 'Please enter a valid 9 or 10 digit Ghanaian phone number.' };
    }

    // Check if phone already voted free in this contest
    const phoneHash = hashPhoneNumber(cleanPhone);
    const existingFreeVote = this.votes.find(
      (v) => v.contestId === contestId && v.voterPhoneHashed === phoneHash && v.voteType === 'free'
    );
    if (existingFreeVote) {
      return {
        success: false,
        message: 'This phone number has already used its 1 free verified vote for this contest. You can still support with paid vote bundles!',
      };
    }

    const key = `${cleanPhone}_${contestId}`;
    const existing = this.otpStore.get(key);
    const now = Date.now();

    if (existing && existing.attempts >= 4 && now < existing.expires) {
      return { success: false, message: 'Too many attempts. Please wait 5 minutes before trying again.' };
    }

    // Generate 6-digit verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(key, {
      otp,
      expires: now + 5 * 60 * 1000, // 5 min expiry
      attempts: (existing?.attempts || 0) + 1,
    });

    return {
      success: true,
      message: `Free Vote code sent via SMS to +233 ${cleanPhone.slice(-9)}.`,
      simulatedOtp: otp, // For rapid testing & verification in UI banner
    };
  }

  async verifyAndCastFreeVote(
    phone: string,
    contestId: string,
    nomineeId: string,
    otpCode: string,
    consentedMarketing: boolean
  ): Promise<{ success: boolean; message: string; receipt?: VoteRecord }> {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const key = `${cleanPhone}_${contestId}`;
    const stored = this.otpStore.get(key);
    const now = Date.now();

    if (!stored || now > stored.expires) {
      return { success: false, message: 'Verification code expired or not requested. Please request a fresh Free Vote code.' };
    }

    if (stored.otp !== (otpCode || '').trim()) {
      return { success: false, message: 'Invalid 6-digit code entered. Please check and re-enter.' };
    }

    const phoneHash = hashPhoneNumber(cleanPhone);
    const contest = this.contests.find((c) => c.id === contestId);
    const nominee = this.nominees.find((n) => n.id === nomineeId);

    if (contest && contest.status !== 'active') {
      return { success: false, message: 'Voting is currently paused or has ended for this contest.' };
    }

    // Call Supabase RPC cast_free_vote if connected
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.rpc('cast_free_vote', {
          p_contest_id: contestId,
          p_nominee_id: nomineeId,
          p_phone: cleanPhone.startsWith('233') ? `+${cleanPhone}` : `+233${cleanPhone.slice(-9)}`,
        });

        if (error) {
          return { success: false, message: formatRpcVoteError(error) };
        }
      } catch (rpcErr: any) {
        return { success: false, message: formatRpcVoteError(rpcErr) };
      }
    } else {
      // Local deduplication check if offline
      const existingFree = this.votes.find(
        (v) => v.contestId === contestId && v.voterPhoneHashed === phoneHash && v.voteType === 'free'
      );
      if (existingFree) {
        return { success: false, message: 'Your phone number has already cast its free verified vote for this contest. Only 1 free vote is permitted per voter.' };
      }
    }

    const receiptCode = generateReceiptCode();
    const newVote: VoteRecord = {
      id: `vote-free-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      contestId,
      contestTitle: contest?.title || 'Contest',
      nomineeId,
      nomineeName: nominee ? (nominee.stageName || nominee.name) : 'Contestant',
      voteType: 'free',
      voteCount: 1,
      voterPhoneHashed: phoneHash,
      voterPhoneMasked: maskPhoneNumber(cleanPhone),
      voterPhoneRaw: consentedMarketing ? `+233${cleanPhone.slice(-9)}` : undefined,
      consentedMarketing,
      receiptCode,
      amountPaidGhs: 0,
      feeGhs: 0,
      createdAt: new Date().toISOString(),
    };

    // Update local nominee tallies
    if (nominee) {
      nominee.voteCount = (nominee.voteCount || 0) + 1;
      nominee.freeVoteCount = (nominee.freeVoteCount || 0) + 1;
    }

    this.votes.unshift(newVote);
    this.otpStore.delete(key);
    this.saveState();

    return { success: true, message: 'Free verified vote cast successfully!', receipt: newVote };
  }

  async processPaidVote(params: {
    contestId: string;
    nomineeId: string;
    voteCount: number;
    amountGhs: number;
    voterPhone: string;
    momoNetwork: MomoNetwork;
    consentedMarketing: boolean;
    paystackReference?: string;
  }): Promise<{ success: boolean; message: string; receipt?: VoteRecord; transaction?: Transaction }> {
    const { contestId, nomineeId, voteCount, amountGhs, voterPhone, momoNetwork, consentedMarketing, paystackReference } = params;
    const cleanPhone = (voterPhone || '').replace(/[^0-9]/g, '');

    const contest = this.contests.find((c) => c.id === contestId);
    const nominee = this.nominees.find((n) => n.id === nomineeId);

    if (!contest || !nominee) {
      return { success: false, message: 'Invalid contest or nominee.' };
    }

    if (contest.status !== 'active') {
      return { success: false, message: 'Voting is currently paused or has ended for this contest.' };
    }

    const feeGhs = calculatePaystackFee(amountGhs);
    const totalCharged = +(amountGhs + feeGhs).toFixed(2);
    
    // Commission from platform_settings (default_commission_rate = 0.10)
    const commissionRate = this.systemSettings.defaultCommissionRate || 0.10;
    const rssCommission = +(amountGhs * commissionRate).toFixed(2);
    const organizerRevenue = +(amountGhs * (1 - commissionRate)).toFixed(2);

    const receiptCode = generateReceiptCode();
    const reference = paystackReference || `PAYSTACK-${receiptCode}-${Date.now()}`;

    // If Supabase is configured, call confirm_paystack_vote RPC
    if (isSupabaseConfigured()) {
      try {
        const { error: rpcError } = await supabase.rpc('confirm_paystack_vote', {
          p_paystack_reference: reference,
        });

        if (rpcError) {
          console.warn('confirm_paystack_vote RPC notice:', rpcError.message);
        }
      } catch (err) {
        console.warn('Supabase confirm_paystack_vote RPC execution warning:', err);
      }
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      reference,
      contestId,
      nomineeId,
      nomineeName: nominee.stageName || nominee.name,
      voteCount,
      amountGhs,
      feeGhs,
      totalChargedGhs: totalCharged,
      organizerRevenueGhs: organizerRevenue,
      rssCommissionGhs: rssCommission,
      voterPhone: cleanPhone,
      momoNetwork,
      status: 'success',
      receiptCode,
      paystackReference,
      createdAt: new Date().toISOString(),
    };

    const newVote: VoteRecord = {
      id: `vote-paid-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      contestId,
      contestTitle: contest.title,
      nomineeId,
      nomineeName: nominee.stageName || nominee.name,
      voteType: 'paid',
      voteCount,
      voterPhoneHashed: hashPhoneNumber(cleanPhone),
      voterPhoneMasked: maskPhoneNumber(cleanPhone),
      voterPhoneRaw: consentedMarketing ? `+233${cleanPhone.slice(-9)}` : undefined,
      consentedMarketing,
      receiptCode,
      transactionId: newTx.id,
      amountPaidGhs: amountGhs,
      feeGhs,
      momoNetwork,
      createdAt: new Date().toISOString(),
    };

    // Update Nominee tallies
    nominee.voteCount += voteCount;
    nominee.paidVoteCount += voteCount;
    nominee.totalAmountGhs = (nominee.totalAmountGhs || 0) + amountGhs;

    // Anomaly detection: check if > 3 bulk paid votes cast in last 60 seconds for same nominee
    const oneMinAgo = Date.now() - 60000;
    const recentVotesForNominee = this.votes.filter(
      (v) => v.nomineeId === nomineeId && v.voteType === 'paid' && new Date(v.createdAt).getTime() > oneMinAgo
    );
    if (recentVotesForNominee.length >= 3) {
      this.anomalies.unshift({
        id: `anom-${Date.now()}`,
        contestId,
        contestTitle: contest.title,
        nomineeId,
        nomineeName: nominee.stageName || nominee.name,
        reason: `Rapid vote burst: 4+ paid transactions in under 60 seconds on ${nominee.stageName || nominee.name}.`,
        severity: 'high',
        detectedAt: new Date().toISOString(),
        resolved: false,
      });
      newVote.flaggedAnomaly = true;
    }

    this.transactions.unshift(newTx);
    this.votes.unshift(newVote);
    this.saveState();

    return {
      success: true,
      message: `${voteCount} votes successfully cast for ${nominee.stageName || nominee.name}!`,
      receipt: newVote,
      transaction: newTx,
    };
  }

  // Voter "My Votes" search
  getVotesByPhone(phone: string, contestId?: string): VoteRecord[] {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const phoneHash = hashPhoneNumber(cleanPhone);
    return this.votes.filter((v) => {
      const matchesPhone = v.voterPhoneHashed === phoneHash;
      if (contestId) {
        return matchesPhone && v.contestId === contestId;
      }
      return matchesPhone;
    });
  }

  /**
   * Look up votes using RPC get_my_votes(p_phone) when Supabase is connected
   */
  async lookupVotesByPhoneOrReceipt(query: string): Promise<VoteRecord[]> {
    const cleanPhone = (query || '').replace(/[^0-9]/g, '');
    if (isSupabaseConfigured() && cleanPhone.length >= 9) {
      try {
        const fullPhone = cleanPhone.startsWith('233') ? `+${cleanPhone}` : `+233${cleanPhone.slice(-9)}`;
        const { data, error } = await supabase.rpc('get_my_votes', { p_phone: fullPhone });
        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id || `vote-rpc-${Date.now()}-${Math.random()}`,
            contestId: row.contest_id,
            contestTitle: row.contest_title || 'Contest',
            nomineeId: row.nominee_id,
            nomineeName: row.nominee_name || 'Contestant',
            voteType: row.vote_type || 'paid',
            voteCount: row.vote_count || 1,
            receiptCode: row.receipt_code || '',
            amountPaidGhs: Number(row.amount_ghs || 0),
            feeGhs: Number(row.fee_ghs || 0),
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (err) {
        console.warn('get_my_votes RPC error:', err);
      }
    }

    // Local in-memory / localStorage fallback
    const cleanQuery = (query || '').trim().toUpperCase();
    const phoneHash = cleanPhone ? hashPhoneNumber(cleanPhone) : '';

    return this.votes.filter((v) => {
      if (v.receiptCode && v.receiptCode.toUpperCase().includes(cleanQuery)) return true;
      if (cleanPhone && (v.voterPhoneHashed === phoneHash || (v.voterPhoneRaw && v.voterPhoneRaw.includes(cleanPhone)))) return true;
      return false;
    });
  }

  // Organizer contest creation & management
  async createContest(contestData: Omit<Contest, 'id' | 'createdAt' | 'updatedAt' | 'escrowReleased'>): Promise<Contest> {
    const id = `contest-${Date.now()}`;
    // Free contests must store NULL in price_per_vote
    const safePricePerVote = contestData.contestType === 'free' ? null : contestData.pricePerVote;

    const newContest: Contest = {
      ...contestData,
      id,
      pricePerVote: safePricePerVote,
      showPublic: contestData.showPublic ?? true,
      showPublicResults: contestData.showPublic ?? true,
      escrowReleased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If Supabase is connected, write contest and bundle tiers to separate tables
    if (isSupabaseConfigured()) {
      try {
        const { error: contestError } = await supabase.from('contests').insert({
          id,
          slug: contestData.slug || id,
          organizer_id: contestData.organizerId,
          title: contestData.title,
          description: contestData.description,
          category: contestData.category,
          banner_url: contestData.bannerUrl,
          sponsor_logo_url: contestData.sponsorLogoUrl || null,
          sponsor_name: contestData.sponsorName || null,
          start_date: contestData.startDate,
          end_date: contestData.endDate,
          contest_type: contestData.contestType,
          code_prefix: contestData.codePrefix || 'STZ',
          price_per_vote: safePricePerVote,
          show_public: contestData.showPublic ?? true,
          collect_voter_contacts: contestData.collectVoterContacts ?? false,
          status: contestData.status || 'pending_review',
          escrow_released: false,
          terms_and_conditions: contestData.termsAndConditions || null,
          banner_order: contestData.bannerOrder || 1,
          featured: contestData.featured || false,
        });

        if (contestError) {
          console.error('Failed to insert contest into Supabase:', contestError);
        }

        // Insert bundle tiers into public.bundle_tiers separate table
        if (contestData.contestType === 'paid' && contestData.bundleTiers && contestData.bundleTiers.length > 0) {
          const bundleRows = contestData.bundleTiers.map((b) => ({
            contest_id: id,
            votes: b.votes,
            price_ghs: b.priceGhs,
            original_price_ghs: b.originalPriceGhs || null,
            discount_percentage: b.discountPercentage || null,
            badge: b.badge || null,
            popular: b.popular || false,
            label: b.label || `${b.votes} Votes`,
          }));

          const { error: bundleError } = await supabase.from('bundle_tiers').insert(bundleRows);
          if (bundleError) {
            console.error('Failed to insert bundle tiers into Supabase:', bundleError);
          }
        }
      } catch (err) {
        console.error('Supabase contest creation error:', err);
      }
    }

    this.contests.unshift(newContest);
    this.saveState();
    return newContest;
  }

  async updateContest(contestId: string, updates: Partial<Contest>) {
    this.contests = this.contests.map((c) => {
      if (c.id === contestId) {
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveState();

    if (isSupabaseConfigured()) {
      try {
        const dbUpdates: any = {};
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.showPublic !== undefined) dbUpdates.show_public = updates.showPublic;
        if (updates.isLockedForAudit !== undefined) dbUpdates.is_locked_for_audit = updates.isLockedForAudit;
        if (updates.escrowReleased !== undefined) dbUpdates.escrow_released = updates.escrowReleased;
        if (updates.payoutStatus !== undefined) dbUpdates.payout_status = updates.payoutStatus;
        if (updates.termsAndConditions !== undefined) dbUpdates.terms_and_conditions = updates.termsAndConditions;
        if (updates.bannerOrder !== undefined) dbUpdates.banner_order = updates.bannerOrder;
        if (updates.featured !== undefined) dbUpdates.featured = updates.featured;

        await supabase.from('contests').update(dbUpdates).eq('id', contestId);
      } catch (err) {
        console.warn('Failed to update contest in Supabase:', err);
      }
    }
  }

  async addNominee(
    contestId: string, 
    nomineeData: Omit<Nominee, 'id' | 'contestId' | 'voteCount' | 'paidVoteCount' | 'freeVoteCount' | 'createdAt'>
  ): Promise<Nominee> {
    const id = `nom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const votingCode = nomineeData.votingCode || nomineeData.nomineeCode || `NOM-${Math.floor(100 + Math.random() * 900)}`;

    const newNominee: Nominee = {
      ...nomineeData,
      id,
      contestId,
      votingCode,
      nomineeCode: votingCode,
      category: nomineeData.category || 'General',
      status: nomineeData.status || 'active',
      voteCount: 0,
      paidVoteCount: 0,
      freeVoteCount: 0,
      totalAmountGhs: 0,
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('nominees').insert({
          id,
          contest_id: contestId,
          name: nomineeData.name,
          stage_name: nomineeData.stageName || null,
          photo_url: nomineeData.photoUrl,
          bio: nomineeData.bio,
          voting_code: votingCode,
          category: nomineeData.category || 'General',
          status: nomineeData.status || 'active',
        });
      } catch (err) {
        console.error('Failed to insert nominee into Supabase:', err);
      }
    }

    this.nominees.push(newNominee);
    this.saveState();
    return newNominee;
  }

  async deleteNominee(nomineeId: string) {
    this.nominees = this.nominees.filter((n) => n.id !== nomineeId);
    this.saveState();

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('nominees').delete().eq('id', nomineeId);
      } catch (err) {
        console.warn('Failed to delete nominee from Supabase:', err);
      }
    }
  }

  // Admin Settings & Content Moderation
  async updateSystemSettings(updates: Partial<PlatformSettings>) {
    this.systemSettings = { ...this.systemSettings, ...updates };
    this.saveState();

    if (isSupabaseConfigured()) {
      try {
        if (updates.defaultCommissionRate !== undefined) {
          await supabase.from('platform_settings').upsert({
            key: 'default_commission_rate',
            value: updates.defaultCommissionRate,
          });
        }
        if (updates.maxActiveContestsPerOrganizer !== undefined) {
          await supabase.from('platform_settings').upsert({
            key: 'max_active_contests_per_organizer',
            value: updates.maxActiveContestsPerOrganizer,
          });
        }
        if (updates.maintenanceMode !== undefined) {
          await supabase.from('platform_settings').upsert({
            key: 'maintenance_mode',
            value: updates.maintenanceMode,
          });
        }
      } catch (err) {
        console.warn('Failed to update platform_settings in Supabase:', err);
      }
    }
  }

  approveContest(contestId: string) {
    this.updateContest(contestId, { status: 'active', rejectionReason: undefined });
  }

  rejectContest(contestId: string, reason: string) {
    this.updateContest(contestId, { status: 'draft', rejectionReason: reason });
  }

  updateOrganizerProfile(organizerId: string, updates: { profilePictureUrl?: string; bio?: string }) {
    this.organizers = this.organizers.map((o) => {
      if (o.id === organizerId) {
        return { ...o, ...updates };
      }
      return o;
    });
    this.saveState();
  }

  updateNominee(nomineeId: string, updates: Partial<Nominee>) {
    this.nominees = this.nominees.map((n) => {
      if (n.id === nomineeId) {
        return { ...n, ...updates };
      }
      return n;
    });
    this.saveState();
  }

  reconcilePayment(transactionId: string): { success: boolean; message: string } {
    const tx = this.transactions.find((t) => t.id === transactionId);
    if (!tx) {
      return { success: false, message: 'Transaction reference not found.' };
    }

    if (tx.status === 'success') {
      return { success: true, message: 'Payment is already reconciled and credited.' };
    }

    // Auto-reconcile
    tx.status = 'success';
    const contest = this.contests.find((c) => c.id === tx.contestId);
    const nominee = this.nominees.find((n) => n.id === tx.nomineeId);

    if (nominee) {
      nominee.voteCount += tx.voteCount;
      nominee.paidVoteCount += tx.voteCount;
      nominee.totalAmountGhs = (nominee.totalAmountGhs || 0) + tx.amountGhs;
    }

    const cleanPhone = (tx.voterPhone || '').replace(/[^0-9]/g, '');
    const phoneHash = hashPhoneNumber(cleanPhone);
    const phoneMask = maskPhoneNumber(cleanPhone);

    const voteRecord: VoteRecord = {
      id: `v-rec-${Date.now()}`,
      contestId: tx.contestId,
      contestTitle: contest ? contest.title : 'Contest',
      nomineeId: tx.nomineeId,
      nomineeName: tx.nomineeName,
      voteType: 'paid',
      voteCount: tx.voteCount,
      voterPhoneHashed: phoneHash,
      voterPhoneMasked: phoneMask,
      consentedMarketing: false,
      receiptCode: tx.receiptCode,
      transactionId: tx.id,
      amountPaidGhs: tx.amountGhs,
      feeGhs: tx.feeGhs,
      momoNetwork: tx.momoNetwork,
      createdAt: new Date().toISOString(),
    };

    this.votes.unshift(voteRecord);
    this.saveState();
    return { success: true, message: 'Payment auto-reconciled successfully! Votes credited to receipt ' + tx.receiptCode };
  }

  // Anomaly & Admin Controls
  resolveAnomaly(anomalyId: string, actionTaken: string) {
    this.anomalies = this.anomalies.map((a) => {
      if (a.id === anomalyId) {
        return { ...a, resolved: true, actionTaken };
      }
      return a;
    });
    this.saveState();
  }

  freezeContest(contestId: string) {
    this.updateContest(contestId, { status: 'paused' });
  }

  unfreezeContest(contestId: string) {
    this.updateContest(contestId, { status: 'active' });
  }

  suspendContest(contestId: string) {
    this.updateContest(contestId, { isLockedForAudit: true, status: 'paused' });
  }

  releaseEscrow(contestId: string) {
    this.updateContest(contestId, { escrowReleased: true, status: 'settled', payoutStatus: 'paid' });
  }

  // Payout Management Methods
  requestPayout(contestId: string, organizerId: string): { success: boolean; message: string; payout?: PayoutRequest } {
    const contest = this.contests.find((c) => c.id === contestId);
    if (!contest) {
      return { success: false, message: 'Contest not found.' };
    }

    const org = this.organizers.find((o) => o.id === organizerId);
    if (!org) {
      return { success: false, message: 'Organizer record not found.' };
    }

    // Check if contest has ended
    const isEnded = new Date(contest.endDate).getTime() <= Date.now() || contest.status === 'ended' || contest.status === 'settled';
    if (!isEnded) {
      return { success: false, message: 'Payout requests can only be submitted after the contest voting window has ended.' };
    }

    // Check if payout already exists
    const existing = this.payoutRequests.find((p) => p.contestId === contestId && (p.status === 'pending' || p.status === 'processing' || p.status === 'paid'));
    if (existing) {
      return { success: false, message: `A payout request is already ${existing.status} for this contest.` };
    }

    const contestTxs = this.transactions.filter((t) => t.contestId === contestId && t.status === 'success');
    const grossGmv = contestTxs.reduce((sum, t) => sum + t.amountGhs, 0);
    const commissionRate = this.systemSettings.defaultCommissionRate || 0.10;
    const rssFee = +(grossGmv * commissionRate).toFixed(2);
    const netPayout = +(grossGmv * (1 - commissionRate)).toFixed(2);

    const newPayout: PayoutRequest = {
      id: `pay-req-${Date.now()}`,
      contestId: contest.id,
      contestTitle: contest.title,
      organizerId: org.id,
      organizerName: org.organizationName,
      momoNetwork: org.momoNetwork || 'MTN',
      momoNumber: org.momoNumber || org.contactPhone,
      grossRevenueGhs: grossGmv,
      rssFeeGhs: rssFee,
      netPayoutGhs: netPayout,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      adminNotes: 'Submitted by organizer for 24-hour review.',
    };

    this.payoutRequests.unshift(newPayout);
    this.updateContest(contestId, { payoutStatus: 'pending' });
    this.saveState();

    return { 
      success: true, 
      message: `Payout request of GHS ${netPayout.toFixed(2)} submitted successfully to your ${org.momoNetwork} MoMo wallet.`, 
      payout: newPayout 
    };
  }

  updatePayoutStatus(
    payoutId: string, 
    status: PayoutStatus, 
    momoTransactionRef?: string, 
    adminNotes?: string
  ) {
    const payout = this.payoutRequests.find((p) => p.id === payoutId);
    if (!payout) return;

    payout.status = status;
    if (momoTransactionRef) {
      payout.momoTransactionRef = momoTransactionRef;
    }
    if (adminNotes) {
      payout.adminNotes = adminNotes;
    }
    if (status === 'paid') {
      payout.processedAt = new Date().toISOString();
      this.updateContest(payout.contestId, { escrowReleased: true, payoutStatus: 'paid', status: 'settled' });
    } else {
      this.updateContest(payout.contestId, { payoutStatus: status });
    }
    this.saveState();
  }

  toggleDisputeLock(contestId: string): { success: boolean; isLocked: boolean } {
    const contest = this.contests.find((c) => c.id === contestId);
    if (!contest) return { success: false, isLocked: false };

    const newLockState = !contest.isLockedForAudit;
    this.updateContest(contestId, { 
      isLockedForAudit: newLockState,
      status: newLockState ? 'paused' : (new Date(contest.endDate).getTime() <= Date.now() ? 'ended' : 'active')
    });
    return { success: true, isLocked: newLockState };
  }

  // Admin & Organizer Authentication Methods
  loginAdmin(email: string, password: string): { success: boolean; message: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    const validAdminEmails = ['admin@steezevotes.com', 'rssadmin@steezevotes.com', 'events@rootedsteeze.com'];
    const validAdminPasswords = ['admin123', 'rss2026'];

    if (validAdminEmails.includes(cleanEmail) && validAdminPasswords.includes(cleanPass)) {
      return { success: true, message: 'Admin authentication successful.' };
    }

    return { success: false, message: 'Invalid admin email or password. Access denied.' };
  }

  loginOrganizer(email: string, password: string): { success: boolean; message: string; organizer?: OrganizerAccount } {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, message: 'Please enter both your email and password.' };
    }

    const org = this.organizers.find((o) => o.email.toLowerCase() === cleanEmail);
    if (!org) {
      return { success: false, message: 'No organizer account found with this email. Please check your email or sign up below.' };
    }

    if (org.status === 'suspended') {
      return { success: false, message: 'This organizer account has been suspended by platform moderators.' };
    }

    // Match password, demo fallback, or reset passcode
    const matchesPassword = org.password 
      ? org.password === cleanPass 
      : cleanPass === 'demo123';

    if (!matchesPassword && cleanPass !== 'demo123' && cleanPass !== 'STZ-RESET-2026') {
      return { success: false, message: 'Incorrect password entered. Please try again or click "Forgot Password".' };
    }

    return { success: true, message: 'Login successful.', organizer: org };
  }

  registerOrganizer(data: {
    organizationName: string;
    email: string;
    password: string;
    contactPhone: string;
    momoNumber?: string;
    momoNetwork?: MomoNetwork;
    agreedToTerms: boolean;
  }): { success: boolean; message: string; organizer?: OrganizerAccount } {
    if (!data.agreedToTerms) {
      return { success: false, message: 'You must check the box agreeing to the Terms & Conditions to create an account.' };
    }

    const cleanEmail = (data.email || '').trim().toLowerCase();
    if (!cleanEmail || !data.organizationName || !data.password || !data.contactPhone) {
      return { success: false, message: 'Please fill in all required fields (Business Name, Email, Password, and Phone Number).' };
    }

    const existing = this.organizers.find((o) => o.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please log in instead.' };
    }

    const newOrg: OrganizerAccount = {
      id: `org-user-${Date.now()}`,
      email: cleanEmail,
      password: data.password,
      organizationName: data.organizationName.trim(),
      contactPhone: data.contactPhone.trim(),
      momoNumber: (data.momoNumber || data.contactPhone).trim(),
      momoNetwork: data.momoNetwork || 'MTN',
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    this.organizers.unshift(newOrg);
    this.saveState();

    return { success: true, message: 'Account registered successfully!', organizer: newOrg };
  }

  resetOrganizerPassword(email: string): { success: boolean; message: string } {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter your account email address.' };
    }

    const org = this.organizers.find((o) => o.email.toLowerCase() === cleanEmail);
    if (!org) {
      return { success: false, message: 'No organizer account found with this email address.' };
    }

    // Set temp password
    org.password = 'STZ-RESET-2026';
    this.saveState();

    return {
      success: true,
      message: `Password reset link and temporary passcode sent to ${cleanEmail}. You can now log in using temporary passcode: STZ-RESET-2026`,
    };
  }

  // Reset to default seed data if needed
  resetToDefaults() {
    this.organizers = INITIAL_ORGANIZERS;
    this.contests = INITIAL_CONTESTS;
    this.nominees = INITIAL_NOMINEES;
    this.votes = INITIAL_VOTES;
    this.transactions = INITIAL_TRANSACTIONS;
    this.anomalies = INITIAL_ANOMALIES;
    this.saveState();
  }
}

export const store = new AppStore();
