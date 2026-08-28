import { Contest, Nominee, VoteRecord, Transaction, OrganizerAccount, AnomalyAlert, MomoNetwork, BundleTier, SystemSettings } from '../types';

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
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    sponsorLogoUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=300&q=80',
    sponsorName: 'Guinness Ghana & Joy Prime',
    startDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 4 * 24 * 3600 * 1000 + 14 * 3600 * 1000).toISOString(), // 4.5 days remaining
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
    showPublicResults: true,
    collectVoterContacts: true,
    status: 'active',
    escrowReleased: false,
    disputeDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000 + 14 * 3600 * 1000).toISOString(),
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
    bannerUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80',
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
    showPublicResults: true,
    collectVoterContacts: false,
    status: 'active',
    escrowReleased: false,
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
    bannerUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
    startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    contestType: 'free',
    codePrefix: 'YL',
    pricePerVote: 0.00,
    bundleTiers: [],
    showPublicResults: true,
    collectVoterContacts: true,
    status: 'active',
    escrowReleased: true,
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
    bannerUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80',
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
    showPublicResults: true,
    collectVoterContacts: true,
    status: 'closed',
    escrowReleased: false,
    disputeDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
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
    nomineeCode: 'STZ-01',
    voteCount: 1420,
    paidVoteCount: 1180,
    freeVoteCount: 240,
    createdAt: '2026-08-20T10:05:00Z',
  },
  {
    id: 'nom-blacksherif',
    contestId: 'contest-gma-uk-2026',
    name: 'Mohammed Ismail Sherif',
    stageName: 'Black Sherif (Blacko)',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    bio: 'The Villain I Never Was sensation, chart-topping storyteller capturing global hearts with Iron Boy energy.',
    nomineeCode: 'STZ-02',
    voteCount: 1580,
    paidVoteCount: 1310,
    freeVoteCount: 270,
    createdAt: '2026-08-20T10:06:00Z',
  },
  {
    id: 'nom-sarkodie',
    contestId: 'contest-gma-uk-2026',
    name: 'Michael Owusu Addo',
    stageName: 'Sarkodie',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    bio: 'African Rap Royalty, BET International Flow Winner, and continuous pioneer of modern African hiphop.',
    nomineeCode: 'STZ-03',
    voteCount: 1120,
    paidVoteCount: 940,
    freeVoteCount: 180,
    createdAt: '2026-08-20T10:07:00Z',
  },
  {
    id: 'nom-kingpromise',
    contestId: 'contest-gma-uk-2026',
    name: 'Gregory Bortey Newman',
    stageName: 'King Promise',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    bio: '5-Star Voice behind Terminator and Paris, leading the contemporary Ghanaian Highlife-Afrobeats world wave.',
    nomineeCode: 'STZ-04',
    voteCount: 890,
    paidVoteCount: 760,
    freeVoteCount: 130,
    createdAt: '2026-08-20T10:08:00Z',
  },
  {
    id: 'nom-gyakie',
    contestId: 'contest-gma-uk-2026',
    name: 'Jackline Acheampong',
    stageName: 'Gyakie (Song Bird)',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    bio: 'Song Bird of Ghana, multi-platinum R&B star bridging Accra to London and Lagos seamlessly.',
    nomineeCode: 'STZ-05',
    voteCount: 760,
    paidVoteCount: 610,
    freeVoteCount: 150,
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
    nomineeCode: 'DJ-01',
    voteCount: 640,
    paidVoteCount: 520,
    freeVoteCount: 120,
    createdAt: '2026-08-22T08:10:00Z',
  },
  {
    id: 'nom-dj-lord',
    contestId: 'contest-accra-dj-2026',
    name: 'Lord Ohene-Ofei',
    stageName: 'DJ Lord OTB',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    bio: 'Energy god on the deck bringing nonstop amapiano and highlife blends.',
    nomineeCode: 'DJ-02',
    voteCount: 710,
    paidVoteCount: 600,
    freeVoteCount: 110,
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
    nomineeCode: 'MAL-01',
    voteCount: 2310,
    paidVoteCount: 2150,
    freeVoteCount: 160,
    createdAt: '2026-08-15T14:10:00Z',
  },
  {
    id: 'nom-malaika-2',
    contestId: 'contest-malaika-2026',
    name: 'Naa Dromo Quaynor',
    stageName: 'Naa (Ashesi University)',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    bio: 'Computer Engineering scholar and STEM ambassador for young Ghanaian girls.',
    nomineeCode: 'MAL-02',
    voteCount: 2190,
    paidVoteCount: 2010,
    freeVoteCount: 180,
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

export const INITIAL_ANOMALIES: AnomalyAlert[] = [
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

// Local state container with localStorage persistence
class AppStore {
  organizers: OrganizerAccount[] = [];
  contests: Contest[] = [];
  nominees: Nominee[] = [];
  votes: VoteRecord[] = [];
  transactions: Transaction[] = [];
  anomalies: AnomalyAlert[] = [];
  systemSettings: SystemSettings = {
    maxActiveContestsPerOrganizer: 4,
    maintenanceMode: false,
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
  }

  private loadState() {
    try {
      const savedOrganizers = localStorage.getItem('steeze_organizers');
      const savedContests = localStorage.getItem('steeze_contests');
      const savedNominees = localStorage.getItem('steeze_nominees');
      const savedVotes = localStorage.getItem('steeze_votes');
      const savedTxs = localStorage.getItem('steeze_transactions');
      const savedAnoms = localStorage.getItem('steeze_anomalies');
      const savedLowData = localStorage.getItem('steeze_low_data');
      const savedSettings = localStorage.getItem('steeze_settings');

      this.organizers = savedOrganizers ? JSON.parse(savedOrganizers) : INITIAL_ORGANIZERS;
      this.contests = savedContests ? JSON.parse(savedContests) : INITIAL_CONTESTS;
      this.nominees = savedNominees ? JSON.parse(savedNominees) : INITIAL_NOMINEES;
      this.votes = savedVotes ? JSON.parse(savedVotes) : INITIAL_VOTES;
      this.transactions = savedTxs ? JSON.parse(savedTxs) : INITIAL_TRANSACTIONS;
      this.anomalies = savedAnoms ? JSON.parse(savedAnoms) : INITIAL_ANOMALIES;
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
      return { success: false, message: 'Too many OTP attempts. Please wait 5 minutes before trying again.' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(key, {
      otp,
      expires: now + 5 * 60 * 1000, // 5 min expiry
      attempts: (existing?.attempts || 0) + 1,
    });

    return {
      success: true,
      message: `OTP sent via SMS to +233 ${cleanPhone.slice(-9)}.`,
      simulatedOtp: otp, // For rapid testing & verification in UI banner
    };
  }

  verifyAndCastFreeVote(
    phone: string,
    contestId: string,
    nomineeId: string,
    otpCode: string,
    consentedMarketing: boolean
  ): { success: boolean; message: string; receipt?: VoteRecord } {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const key = `${cleanPhone}_${contestId}`;
    const stored = this.otpStore.get(key);
    const now = Date.now();

    if (!stored || now > stored.expires) {
      return { success: false, message: 'OTP expired or not requested. Please request a fresh OTP.' };
    }

    if (stored.otp !== (otpCode || '').trim()) {
      return { success: false, message: 'Invalid OTP code entered. Please check and re-enter.' };
    }

    const phoneHash = hashPhoneNumber(cleanPhone);
    const existingFree = this.votes.find(
      (v) => v.contestId === contestId && v.voterPhoneHashed === phoneHash && v.voteType === 'free'
    );
    if (existingFree) {
      return { success: false, message: 'This phone number has already cast a free vote.' };
    }

    const contest = this.contests.find((c) => c.id === contestId);
    const nominee = this.nominees.find((n) => n.id === nomineeId);
    if (!contest || !nominee) {
      return { success: false, message: 'Contest or nominee not found.' };
    }

    if (contest.status !== 'active') {
      return { success: false, message: 'Voting has closed for this contest.' };
    }

    const receiptCode = generateReceiptCode();
    const newVote: VoteRecord = {
      id: `vote-free-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      contestId,
      contestTitle: contest.title,
      nomineeId,
      nomineeName: nominee.stageName || nominee.name,
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

    // Update nominee tallies
    nominee.voteCount += 1;
    nominee.freeVoteCount += 1;

    this.votes.unshift(newVote);
    this.otpStore.delete(key);
    this.saveState();

    return { success: true, message: 'Free vote cast successfully!', receipt: newVote };
  }

  processPaidVote(params: {
    contestId: string;
    nomineeId: string;
    voteCount: number;
    amountGhs: number;
    voterPhone: string;
    momoNetwork: MomoNetwork;
    consentedMarketing: boolean;
  }): { success: boolean; message: string; receipt?: VoteRecord; transaction?: Transaction } {
    const { contestId, nomineeId, voteCount, amountGhs, voterPhone, momoNetwork, consentedMarketing } = params;
    const cleanPhone = (voterPhone || '').replace(/[^0-9]/g, '');

    const contest = this.contests.find((c) => c.id === contestId);
    const nominee = this.nominees.find((n) => n.id === nomineeId);

    if (!contest || !nominee) {
      return { success: false, message: 'Invalid contest or nominee.' };
    }

    if (contest.status !== 'active') {
      return { success: false, message: 'Voting is not currently active for this contest.' };
    }

    const feeGhs = calculatePaystackFee(amountGhs);
    const totalCharged = +(amountGhs + feeGhs).toFixed(2);
    const rssCommission = +(amountGhs * 0.10).toFixed(2); // 10% platform fee
    const organizerRevenue = +(amountGhs * 0.90).toFixed(2); // 90% organizer net
    const receiptCode = generateReceiptCode();
    const reference = `PAYSTACK-${receiptCode}-${Date.now()}`;

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

  lookupVotesByPhoneOrReceipt(query: string): VoteRecord[] {
    const cleanQuery = (query || '').trim().toUpperCase();
    const cleanPhone = (query || '').replace(/[^0-9]/g, '');
    const phoneHash = cleanPhone ? hashPhoneNumber(cleanPhone) : '';

    return this.votes.filter((v) => {
      if (v.receiptCode && v.receiptCode.toUpperCase().includes(cleanQuery)) return true;
      if (cleanPhone && (v.voterPhoneHashed === phoneHash || (v.voterPhoneRaw && v.voterPhoneRaw.includes(cleanPhone)))) return true;
      return false;
    });
  }

  // Organizer contest creation & management
  createContest(contestData: Omit<Contest, 'id' | 'createdAt' | 'updatedAt' | 'escrowReleased'>): Contest {
    const id = `contest-${Date.now()}`;
    const newContest: Contest = {
      ...contestData,
      id,
      escrowReleased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contests.unshift(newContest);
    this.saveState();
    return newContest;
  }

  updateContest(contestId: string, updates: Partial<Contest>) {
    this.contests = this.contests.map((c) => {
      if (c.id === contestId) {
        return { ...c, ...updates, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveState();
  }

  addNominee(contestId: string, nomineeData: Omit<Nominee, 'id' | 'contestId' | 'voteCount' | 'paidVoteCount' | 'freeVoteCount' | 'createdAt'>): Nominee {
    const id = `nom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newNominee: Nominee = {
      ...nomineeData,
      id,
      contestId,
      voteCount: 0,
      paidVoteCount: 0,
      freeVoteCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.nominees.push(newNominee);
    this.saveState();
    return newNominee;
  }

  deleteNominee(nomineeId: string) {
    this.nominees = this.nominees.filter((n) => n.id !== nomineeId);
    this.saveState();
  }

  // Admin Settings & Content Moderation
  updateSystemSettings(updates: Partial<SystemSettings>) {
    this.systemSettings = { ...this.systemSettings, ...updates };
    this.saveState();
  }

  approveContest(contestId: string) {
    this.updateContest(contestId, { status: 'active', rejectionReason: undefined });
  }

  rejectContest(contestId: string, reason: string) {
    this.updateContest(contestId, { status: 'rejected', rejectionReason: reason });
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
    this.updateContest(contestId, { status: 'frozen' });
  }

  unfreezeContest(contestId: string) {
    this.updateContest(contestId, { status: 'active' });
  }

  suspendContest(contestId: string) {
    this.updateContest(contestId, { status: 'disputed' });
  }

  releaseEscrow(contestId: string) {
    this.updateContest(contestId, { escrowReleased: true, status: 'settled' });
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
