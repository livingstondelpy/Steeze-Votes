import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Trophy, 
  DollarSign, 
  Users, 
  Download, 
  Share2, 
  Sparkles, 
  BarChart3, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Percent,
  ArrowLeft,
  Upload,
  UserCheck,
  Flame,
  Building2,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Contest, Nominee, OrganizerAccount, BundleTier, Transaction, VoteRecord, ContestType, PayoutRequest } from '../../types';
import { store } from '../../lib/store';
import { generateResultsCertificatePdf } from '../../lib/pdfCertificate';
import { processAndCompressImage } from '../../lib/imageUtils';
import { OrganizerTermsModal } from '../legal/OrganizerTermsModal';

interface OrganizerPortalProps {
  contests: Contest[];
  nominees: Nominee[];
  organizers: OrganizerAccount[];
  transactions: Transaction[];
  votes: VoteRecord[];
  payoutRequests?: PayoutRequest[];
  onSelectContestForPreview: (contestId: string) => void;
  onBackToHome?: () => void;
  currentOrganizer?: OrganizerAccount | null;
  onLogout?: () => void;
  activeTab?: 'dashboard' | 'create' | 'analytics' | 'milestones' | 'profile';
  onTabChange?: (tab: 'dashboard' | 'create' | 'analytics' | 'milestones' | 'profile') => void;
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({
  contests,
  nominees,
  organizers,
  transactions,
  votes,
  payoutRequests = [],
  onSelectContestForPreview,
  onBackToHome,
  currentOrganizer,
  onLogout,
  activeTab: propActiveTab,
  onTabChange,
}) => {
  // Current active organizer
  const [selectedOrgId, setSelectedOrgId] = useState<string>(currentOrganizer?.id || organizers[0]?.id || 'org-rss-01');
  const currentOrg = currentOrganizer || organizers.find((o) => o.id === selectedOrgId) || organizers[0];

  // Active Tab state (controlled or uncontrolled)
  const [localActiveTab, setLocalActiveTab] = useState<'dashboard' | 'create' | 'analytics' | 'milestones' | 'profile'>('dashboard');
  const activeTab = propActiveTab || localActiveTab;

  const setActiveTab = (tab: 'dashboard' | 'create' | 'analytics' | 'milestones' | 'profile') => {
    setLocalActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const [isOrganizerDrawerOpen, setIsOrganizerDrawerOpen] = useState(false);

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Profile Edit State
  const [profilePic, setProfilePic] = useState(currentOrg.profilePictureUrl || '');
  const [profileBio, setProfileBio] = useState(currentOrg.bio || '');

  // Nominee editing modal/state inside active contest
  const [editingNominee, setEditingNominee] = useState<Nominee | null>(null);
  const [editNomineeName, setEditNomineeName] = useState('');
  const [editNomineeStage, setEditNomineeStage] = useState('');
  const [editNomineeBio, setEditNomineeBio] = useState('');
  const [editNomineePhoto, setEditNomineePhoto] = useState('');

  // Active Contests count for max cap check
  const orgContests = contests.filter((c) => c.organizerId === currentOrg.id);
  const activeContestsCount = orgContests.filter((c) => c.status === 'active' || c.status === 'pending_review').length;
  const maxContestsCap = store.systemSettings.maxActiveContestsPerOrganizer;

  const [activeContestId, setActiveContestId] = useState<string>(orgContests[0]?.id || contests[0]?.id || '');
  const activeContest = contests.find((c) => c.id === activeContestId) || orgContests[0] || contests[0];

  // State for Create Contest Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Music & Entertainment');
  const [newContestType, setNewContestType] = useState<ContestType>('paid');
  const [newCodePrefix, setNewCodePrefix] = useState('STZ');
  const [newBannerUrl, setNewBannerUrl] = useState('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80');
  const [newPricePerVote, setNewPricePerVote] = useState<number>(1.00);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [newEndDate, setNewEndDate] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16));
  const [newShowPublic, setNewShowPublic] = useState(true);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');

  // Initial bundle tiers for form
  const [newBundleTiers, setNewBundleTiers] = useState<BundleTier[]>([
    { id: 'b-1', votes: 1, priceGhs: 1.00, label: '1 Vote' },
    { id: 'b-10', votes: 10, priceGhs: 9.00, originalPriceGhs: 10.00, discountPercentage: 10, badge: 'Popular', popular: true },
    { id: 'b-50', votes: 50, priceGhs: 40.00, originalPriceGhs: 50.00, discountPercentage: 20, badge: '20% OFF' },
    { id: 'b-100', votes: 100, priceGhs: 75.00, originalPriceGhs: 100.00, discountPercentage: 25, badge: 'VIP' },
  ]);

  // State for Nominees Form in Creation
  const [formNominees, setFormNominees] = useState<Array<{ name: string; stageName: string; photoUrl: string; bio: string; nomineeCode: string }>>([
    {
      name: 'Kofi Manu',
      stageName: 'Kofi Jay',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      bio: 'Rising Afrobeats talent taking Ghanaian airwaves by storm.',
      nomineeCode: 'STZ-01',
    },
    {
      name: 'Yaa Asantewaa',
      stageName: 'Queen Yaa',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      bio: 'Vocal powerhouse bringing soulful highlife melodies.',
      nomineeCode: 'STZ-02',
    }
  ]);

  // Nominee quick add inside active contest
  const [quickNomineeName, setQuickNomineeName] = useState('');
  const [quickNomineeStage, setQuickNomineeStage] = useState('');
  const [quickNomineeBio, setQuickNomineeBio] = useState('');
  const [quickNomineeCode, setQuickNomineeCode] = useState('');
  const [quickNomineePhoto, setQuickNomineePhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');

  // Milestone generator state
  const [milestoneType, setMilestoneType] = useState<'votes' | 'winner' | 'countdown'>('votes');
  const [milestoneCustomText, setMilestoneCustomText] = useState('Thank you Ghana! Over 10,000 votes recorded.');

  // Financial calculations for active contest
  const contestTransactions = transactions.filter((t) => t.contestId === activeContest?.id && t.status === 'success');
  const totalRevenueGross = contestTransactions.reduce((sum, t) => sum + t.amountGhs, 0);
  const organizerNetPayout = +(totalRevenueGross * 0.90).toFixed(2); // 90% payout rule
  const rssPlatformCommission = +(totalRevenueGross * 0.10).toFixed(2); // 10% fee

  const activeNominees = nominees
    .filter((n) => n.contestId === activeContest?.id)
    .sort((a, b) => b.voteCount - a.voteCount);

  const totalVotesInContest = activeNominees.reduce((sum, n) => sum + n.voteCount, 0);
  const totalPaidVotesInContest = activeNominees.reduce((sum, n) => sum + n.paidVoteCount, 0);
  const totalFreeVotesInContest = activeNominees.reduce((sum, n) => sum + n.freeVoteCount, 0);

  // Contest end condition
  const isContestEnded = activeContest 
    ? (new Date(activeContest.endDate).getTime() <= Date.now() || activeContest.status === 'ended' || activeContest.status === 'settled')
    : false;

  // Active contest payout request state
  const activeContestPayout = (payoutRequests || []).find((p) => p.contestId === activeContest?.id);

  // Analytics: Daily votes breakdown
  interface DailyVoteStat {
    date: string;
    free: number;
    paid: number;
    total: number;
  }
  const initialDailyVotes: Record<string, DailyVoteStat> = {};
  const dailyVotesMap = votes
    .filter((v) => v.contestId === activeContest?.id)
    .reduce((acc: Record<string, DailyVoteStat>, v) => {
      const dateKey = v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Today';
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, free: 0, paid: 0, total: 0 };
      }
      if (v.voteType === 'free') {
        acc[dateKey].free += v.voteCount;
      } else {
        acc[dateKey].paid += v.voteCount;
      }
      acc[dateKey].total += v.voteCount;
      return acc;
    }, initialDailyVotes);
  const dailyVotes: DailyVoteStat[] = Object.values(dailyVotesMap);

  // Analytics: Top spenders (strictly anonymized: vote count and amount only, ZERO phone numbers)
  interface SpenderStat {
    totalGhs: number;
    totalVotes: number;
    topNominee: string;
  }
  const initialSpenders: Record<string, SpenderStat> = {};
  const topSpendersMap = contestTransactions.reduce((acc: Record<string, SpenderStat>, t) => {
    // Group internally by transaction id (anonymized, ZERO phone numbers / PII)
    const key = t.id;
    if (!acc[key]) {
      acc[key] = { totalGhs: 0, totalVotes: 0, topNominee: t.nomineeName || 'Contestant' };
    }
    acc[key].totalGhs += t.amountGhs;
    acc[key].totalVotes += t.voteCount;
    return acc;
  }, initialSpenders);

  const topSpenders = (Object.values(topSpendersMap) as SpenderStat[])
    .sort((a, b) => b.totalGhs - a.totalGhs)
    .slice(0, 10)
    .map((spender, index) => ({
      supporterLabel: `Supporter #${index + 1}`,
      totalVotes: spender.totalVotes,
      totalGhs: spender.totalGhs,
      topNominee: spender.topNominee,
    }));

  const handleRequestPayout = () => {
    if (!activeContest) return;
    const res = store.requestPayout(activeContest.id, currentOrg.id);
    alert(res.message);
  };

  const handleCreateContestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Check max active contests cap
    if (activeContestsCount >= maxContestsCap) {
      alert(`Limit Reached: Your organization currently has ${activeContestsCount} active or pending contest(s). The platform cap is set to ${maxContestsCap} maximum. Please wait for an existing contest to finish or contact RSS Admin.`);
      return;
    }

    if (!agreedTerms) {
      alert('Please read and agree to the Organizer Terms & Conditions before publishing a contest.');
      return;
    }

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = await store.createContest({
      slug,
      status: 'pending_review',
      organizerId: currentOrg.id,
      organizerName: currentOrg.organizationName,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      contestType: newContestType,
      codePrefix: newCodePrefix.toUpperCase(),
      bannerUrl: newBannerUrl,
      sponsorName: newSponsorName || undefined,
      sponsorLogoUrl: newSponsorLogo || undefined,
      startDate: new Date(newStartDate).toISOString(),
      endDate: new Date(newEndDate).toISOString(),
      pricePerVote: newContestType === 'free' ? null : newPricePerVote,
      bundleTiers: newContestType === 'free' ? [] : newBundleTiers,
      showPublicResults: newShowPublic,
      showPublic: newShowPublic,
      collectVoterContacts: false,
    });

    // Add initial nominees with codePrefix
    for (let idx = 0; idx < formNominees.length; idx++) {
      const fn = formNominees[idx];
      const code = `${newCodePrefix.toUpperCase()}-${String(idx + 1).padStart(2, '0')}`;
      await store.addNominee(created.id, {
        name: fn.name,
        stageName: fn.stageName,
        photoUrl: fn.photoUrl,
        bio: fn.bio,
        votingCode: code,
        nomineeCode: code,
      });
    }

    setActiveContestId(created.id);
    setActiveTab('dashboard');
    alert(`Contest "${created.title}" submitted successfully! It is now in Pending Review status and will be live once approved by RSS Admin.`);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateOrganizerProfile(currentOrg.id, {
      profilePictureUrl: profilePic,
      bio: profileBio,
    });
    alert('Organizer profile updated successfully!');
  };

  const handleImageUpload = async (
    file: File,
    onSuccess: (dataUrl: string) => void
  ) => {
    const res = await processAndCompressImage(file, { maxFileSizeMB: 5 });
    if (!res.success || !res.dataUrl) {
      alert(res.error || 'Failed to process image.');
      return;
    }
    onSuccess(res.dataUrl);
  };

  const handleSaveNomineeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNominee) return;

    store.updateNominee(editingNominee.id, {
      name: editNomineeName,
      stageName: editNomineeStage,
      bio: editNomineeBio,
      photoUrl: editNomineePhoto,
    });

    setEditingNominee(null);
    alert('Contestant information updated successfully!');
  };

  const handleAddNomineeToActive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNomineeName.trim() || !activeContest) return;

    const code = quickNomineeCode || `NOM-0${activeNominees.length + 1}`;
    await store.addNominee(activeContest.id, {
      name: quickNomineeName,
      stageName: quickNomineeStage || quickNomineeName,
      photoUrl: quickNomineePhoto,
      bio: quickNomineeBio,
      votingCode: code,
      nomineeCode: code,
    });

    setQuickNomineeName('');
    setQuickNomineeStage('');
    setQuickNomineeBio('');
    setQuickNomineeCode('');
  };

  const handleDownloadPdf = () => {
    if (!activeContest) return;
    generateResultsCertificatePdf(activeContest, nominees);
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen py-6 sm:py-8 pb-28 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Organizer Studio
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Mobile Money Payouts
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Manage awards, monitor live votes, download certified results, and track Mobile Money earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Organizer Account Switcher */}
            <select
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                const first = contests.find((c) => c.organizerId === e.target.value);
                if (first) setActiveContestId(first.id);
              }}
              className="min-h-[44px] bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {organizers.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.organizationName} ({org.momoNetwork} MoMo: {org.momoNumber})
                </option>
              ))}
            </select>

            {/* Preview Public Contest Link */}
            {activeContest && (
              <button
                onClick={() => onSelectContestForPreview(activeContest.id)}
                className="min-h-[44px] px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Eye className="w-4 h-4" />
                Preview Public Page
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors shadow-2xs inline-flex items-center justify-center active:scale-98"
              >
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs & In-Portal Hamburger Menu */}
        <div className="flex items-center justify-between gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Live Dashboard
            </button>

            <button
              onClick={() => setActiveTab('create')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Plus className="w-4 h-4" />
              Create New Contest
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === 'analytics'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analytics &amp; Reports
            </button>

            <button
              onClick={() => setActiveTab('milestones')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === 'milestones'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Social Milestone Graphics
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Organizer Profile &amp; KYC
            </button>
          </div>

          {/* Dedicated In-Portal Hamburger Menu Button */}
          <button
            onClick={() => setIsOrganizerDrawerOpen(!isOrganizerDrawerOpen)}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
            title="Open Organizer Menu"
            aria-label="Toggle Organizer Features Menu"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>

        {/* Organizer In-Portal Drawer / Hamburger Sheet */}
        {isOrganizerDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-fade-in"
            onClick={() => setIsOrganizerDrawerOpen(false)}
          >
            <div 
              className="w-full max-w-sm bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Organizer Menu</h3>
                      <p className="text-[11px] text-slate-500">{currentOrg.organizationName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOrganizerDrawerOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Organizer Features List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Organizer Features
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setIsOrganizerDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === 'dashboard' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      <div className="text-left">
                        <span className="block font-bold">1. Live Dashboard</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Real-time counts &amp; PDF certificate</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('create');
                      setIsOrganizerDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === 'create' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <div className="text-left">
                        <span className="block font-bold">2. Create New Contest</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Launch contest with 4:5 flyer &amp; tiers</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      setIsOrganizerDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === 'analytics' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div className="text-left">
                        <span className="block font-bold">3. Analytics &amp; Reports</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Daily chart &amp; top anonymous supporters</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('milestones');
                      setIsOrganizerDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === 'milestones' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div className="text-left">
                        <span className="block font-bold">4. Social Milestone Graphics</span>
                        <span className="block text-[10px] text-slate-400 font-normal">4:5 vertical cards for Instagram &amp; WhatsApp</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsOrganizerDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeTab === 'profile' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-rose-600" />
                      <div className="text-left">
                        <span className="block font-bold">5. Profile &amp; KYC</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Public bio &amp; verified MoMo wallet</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Quick Contest Switcher in Drawer */}
                {orgContests.length > 1 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                      Active Contest Switcher
                    </div>
                    <div className="space-y-1">
                      {orgContests.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveContestId(c.id);
                            setIsOrganizerDrawerOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold truncate transition-colors ${
                            c.id === activeContestId
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {c.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                {activeContest && (
                  <button
                    onClick={() => {
                      setIsOrganizerDrawerOpen(false);
                      onSelectContestForPreview(activeContest.id);
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Public Page
                  </button>
                )}

                {onBackToHome && (
                  <button
                    onClick={() => {
                      setIsOrganizerDrawerOpen(false);
                      onBackToHome();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Voter Home
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setIsOrganizerDrawerOpen(false);
                      onLogout();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors border border-rose-200"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    Log Out Organizer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contest Selector if in Dashboard/Analytics */}
        {activeTab !== 'create' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Selected Contest:</span>
              <select
                value={activeContestId}
                onChange={(e) => setActiveContestId(e.target.value)}
                className="min-h-[44px] bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 rounded-xl px-3 py-2"
              >
                {orgContests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Ends: <strong className="text-slate-800">{new Date(activeContest?.endDate || '').toLocaleDateString('en-GB')}</strong>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && activeContest && (
          <div className="space-y-6">
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Gross Revenue</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">GHS {totalRevenueGross.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">{contestTransactions.length} successful transactions</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">90% Net Payout</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">GHS {organizerNetPayout.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentOrg.momoNetwork} ({currentOrg.momoNumber})</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Votes</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalVotesInContest.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 truncate">{totalPaidVotesInContest} Paid • {totalFreeVotesInContest} Free</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Escrow Status</span>
                <p className={`text-base sm:text-lg font-bold truncate ${activeContest.status === 'ended' || activeContest.status === 'settled' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {activeContest.status === 'ended' || activeContest.status === 'settled' ? 'In Review' : 'Live & Protected'}
                </p>
                <p className="text-[11px] text-slate-500">Auto-release after 24h</p>
              </div>

            </div>

            {/* Mobile Money Payout Settlement & Request Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-500" />
                    Mobile Money Payout Settlement
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    90% of all gross voting revenue is disbursed directly to your registered Mobile Money wallet.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Destination:</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    {currentOrg.momoNetwork} • {currentOrg.momoNumber}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block">Total Gross Revenue (GMV):</span>
                  <span className="text-sm font-bold text-gray-900">GHS {totalRevenueGross.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">RSS Platform Fee (10%):</span>
                  <span className="text-sm font-bold text-gray-700">GHS {rssPlatformCommission.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Your Net Payout (90%):</span>
                  <span className="text-sm font-bold text-emerald-600">GHS {organizerNetPayout.toFixed(2)}</span>
                </div>
              </div>

              {/* Payout status and action button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">Contest Voting Window:</span>
                    <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      isContestEnded ? 'bg-gray-100 text-gray-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isContestEnded ? 'Voting Closed' : 'Voting Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    {isContestEnded
                      ? 'Voting has ended. Revenue is protected in escrow and eligible for withdrawal.'
                      : `Voting ends on ${new Date(activeContest.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Payout requests unlock immediately after voting ends.`}
                  </p>
                </div>

                <div>
                  {activeContestPayout ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                        activeContestPayout.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeContestPayout.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : activeContestPayout.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {activeContestPayout.status === 'paid' && <CheckCircle2 className="w-4 h-4" />}
                        {activeContestPayout.status === 'pending' && <Clock className="w-4 h-4" />}
                        {activeContestPayout.status === 'processing' && <Clock className="w-4 h-4" />}
                        Status: {activeContestPayout.status.toUpperCase()}
                        {activeContestPayout.status === 'pending' && ' (24h Escrow Review)'}
                      </span>
                    </div>
                  ) : isContestEnded ? (
                    <button
                      onClick={handleRequestPayout}
                      disabled={organizerNetPayout <= 0}
                      className="min-h-[44px] px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors inline-flex items-center justify-center gap-2 active:scale-98"
                    >
                      <DollarSign className="w-4 h-4" />
                      Request Mobile Money Payout (GHS {organizerNetPayout.toFixed(2)})
                    </button>
                  ) : (
                    <button
                      disabled
                      className="min-h-[44px] px-5 py-2.5 bg-gray-100 text-gray-400 cursor-not-allowed text-xs font-bold rounded-xl inline-flex items-center justify-center gap-2 border border-gray-200"
                      title="Payout requests unlock automatically after voting ends"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Payout Request (Locked Until Contest Ends)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Nominees Leaderboard & Quick Add */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Leaderboard Table (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Live Leaderboard ({activeNominees.length} Nominees)
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">Ranked by vote count</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {activeNominees.map((nom, idx) => {
                    const pct = totalVotesInContest > 0 ? Math.round((nom.voteCount / totalVotesInContest) * 100) : 0;
                    return (
                      <div key={nom.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            idx === 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <img src={nom.photoUrl} alt={nom.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{nom.stageName || nom.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">Code: {nom.nomineeCode}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900 block">{nom.voteCount.toLocaleString()} votes</span>
                            <span className="text-xs text-amber-700 font-semibold">{pct}% of total</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setEditingNominee(nom);
                              setEditNomineeName(nom.name);
                              setEditNomineeStage(nom.stageName || nom.name);
                              setEditNomineeBio(nom.bio || '');
                              setEditNomineePhoto(nom.photoUrl);
                            }}
                            className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors flex items-center justify-center shrink-0"
                            title="Edit Nominee Photo/Bio"
                            aria-label={`Edit ${nom.stageName || nom.name}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add Nominee Box (1 Col) */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                  Add Nominee to Contest
                </h3>

                <form onSubmit={handleAddNomineeToActive} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={quickNomineeName}
                      onChange={(e) => setQuickNomineeName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stage / Display Name</label>
                    <input
                      type="text"
                      value={quickNomineeStage}
                      onChange={(e) => setQuickNomineeStage(e.target.value)}
                      placeholder="e.g. DJ Blackstar"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nominee Code</label>
                    <input
                      type="text"
                      value={quickNomineeCode}
                      onChange={(e) => setQuickNomineeCode(e.target.value)}
                      placeholder="e.g. NOM-05"
                      className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Short Bio</label>
                    <textarea
                      rows={2}
                      value={quickNomineeBio}
                      onChange={(e) => setQuickNomineeBio(e.target.value)}
                      placeholder="Short intro for voting cards..."
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full min-h-[44px] py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                  >
                    <Plus className="w-4 h-4" /> Add Nominee
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CREATE NEW CONTEST */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Contest</h2>
              <p className="text-xs text-gray-500 mt-0.5">Set up awards, pageants, or talent voting with instant MoMo processing.</p>
            </div>

            <form onSubmit={handleCreateContestSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contest Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ghana Campus Music Awards 2026: Best New Artiste"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Contest Type & Code Prefix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contest Type (Locked at Creation)</label>
                  <select
                    value={newContestType}
                    onChange={(e) => setNewContestType(e.target.value as ContestType)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="paid">Paid Voting (Mobile Money &amp; Card)</option>
                    <option value="free">100% Free Voting (SMS Free Vote Verification)</option>
                  </select>
                  <p className="text-[11px] text-gray-500 mt-1">
                    {newContestType === 'free' 
                      ? 'Free contests limit each verified voter phone number to 1 free vote via SMS verification.'
                      : 'Paid contests enable customizable vote bundles (e.g., 10 votes for GHS 9.00).'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contestant Code Prefix</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newCodePrefix}
                    onChange={(e) => setNewCodePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    placeholder="e.g. STZ or GMA"
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono font-bold text-amber-700 uppercase focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Auto-generates codes like {newCodePrefix || 'PREFIX'}-01, {newCodePrefix || 'PREFIX'}-02.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Music & Entertainment">Music & Entertainment</option>
                    <option value="Nightlife & Culture">Nightlife & Culture</option>
                    <option value="Pageantry & Fashion">Pageantry & Fashion</option>
                    <option value="Campus & Talent">Campus & Talent</option>
                  </select>
                </div>

                {newContestType === 'paid' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price per Vote (GHS)</label>
                    <input
                      type="number"
                      min={0.50}
                      step={0.50}
                      value={newPricePerVote}
                      onChange={(e) => setNewPricePerVote(parseFloat(e.target.value) || 1.00)}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contest Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain the voting rules, criteria, and timeline..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Cover Flyer Image upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">
                    Event Flyer / Poster Image
                  </label>
                  <span className="text-[11px] font-medium text-rose-600">
                    4:5 portrait or 1:1 square required (no horizontal)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={newBannerUrl}
                    onChange={(e) => setNewBannerUrl(e.target.value)}
                    placeholder="https://... (4:5 or 1:1 image URL)"
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-rose-500"
                  />
                  <label className="min-h-[44px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-2xs">
                    <Upload className="w-4 h-4 text-rose-600" /> Upload 4:5 Flyer
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (dataUrl) => setNewBannerUrl(dataUrl));
                      }}
                    />
                  </label>
                </div>
                {newBannerUrl && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="w-20 aspect-[4/5] rounded-lg overflow-hidden border border-slate-300 bg-slate-200 shrink-0">
                      <img src={newBannerUrl} alt="Flyer Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-900">4:5 Poster Preview</p>
                      <p className="text-[11px] text-slate-500">Official flyer format for voter ballots and public display cards.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <label className="min-h-[44px] flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={newShowPublic}
                    onChange={(e) => setNewShowPublic(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Show real-time vote totals publicly to voters</span>
                </label>

                <div className="pt-2 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="min-h-[44px] flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-amber-900">
                    <input
                      type="checkbox"
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>I agree to the RSS Organizer Terms &amp; Conditions</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="min-h-[44px] px-3 py-2 text-xs text-amber-600 font-semibold hover:underline inline-flex items-center"
                  >
                    Read Terms
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition-colors shadow-xs inline-flex items-center justify-center active:scale-98"
              >
                Submit Contest for RSS Admin Review
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ANALYTICS & REPORTS */}
        {activeTab === 'analytics' && activeContest && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Performance &amp; Voting Analytics</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Detailed breakdown of voting velocity, revenue distribution, and certified results for {activeContest.title}.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Certified PDF Certificate
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Print Summary
                </button>
              </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Votes Cast</span>
                <p className="text-2xl font-bold text-gray-900">{totalVotesInContest.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500">{activeNominees.length} active contestants</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Paid vs Free Votes</span>
                <p className="text-2xl font-bold text-amber-600">
                  {totalVotesInContest > 0 ? `${Math.round((totalPaidVotesInContest / totalVotesInContest) * 100)}%` : '0%'} Paid
                </p>
                <p className="text-[11px] text-gray-500">{totalPaidVotesInContest} Paid • {totalFreeVotesInContest} Free</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Gross Revenue (GMV)</span>
                <p className="text-2xl font-bold text-gray-900">GHS {totalRevenueGross.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500">{contestTransactions.length} successful transactions</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Organizer Net (90%)</span>
                <p className="text-2xl font-bold text-emerald-600">GHS {organizerNetPayout.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500">10% RSS platform fee applied</p>
              </div>
            </div>

            {/* Voting Distribution Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Vote Channel Distribution</h3>
              <div className="space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                  <div
                    style={{
                      width: `${totalVotesInContest > 0 ? (totalPaidVotesInContest / totalVotesInContest) * 100 : 50}%`
                    }}
                    className="bg-amber-500 h-full transition-all duration-500"
                    title="Paid Votes"
                  />
                  <div
                    style={{
                      width: `${totalVotesInContest > 0 ? (totalFreeVotesInContest / totalVotesInContest) * 100 : 50}%`
                    }}
                    className="bg-emerald-500 h-full transition-all duration-500"
                    title="Free Verified Votes"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span className="font-medium text-gray-700">Paid Bundle Votes:</span>
                    <span className="font-bold text-gray-900">{totalPaidVotesInContest.toLocaleString()}</span>
                    <span className="text-gray-400">
                      ({totalVotesInContest > 0 ? Math.round((totalPaidVotesInContest / totalVotesInContest) * 100) : 0}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="font-medium text-gray-700">Free SMS Verified Votes:</span>
                    <span className="font-bold text-gray-900">{totalFreeVotesInContest.toLocaleString()}</span>
                    <span className="text-gray-400">
                      ({totalVotesInContest > 0 ? Math.round((totalFreeVotesInContest / totalVotesInContest) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Voting Activity */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Daily Voting Velocity</h3>
                  <p className="text-xs text-gray-500">Votes logged per calendar day</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg">
                  {dailyVotes.length} active day(s)
                </span>
              </div>

              {dailyVotes.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No vote activity recorded yet.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dailyVotes.map((day) => (
                    <div key={day.date} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-900">{day.date}</span>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span>{day.paid} paid votes</span>
                          <span>•</span>
                          <span>{day.free} free votes</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-amber-700 text-sm">{day.total.toLocaleString()}</span>
                        <span className="text-[11px] text-gray-400 block">votes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Supporters (Strictly Anonymized - Zero Phone Numbers / Zero PII) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Top Voting Supporters</h3>
                  <p className="text-xs text-gray-500">Anonymized ranking of top contributing voters</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                  Privacy Protected
                </span>
              </div>

              {topSpenders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">No supporter transactions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-500 font-semibold">
                        <th className="pb-2">Supporter</th>
                        <th className="pb-2">Contestant Supported</th>
                        <th className="pb-2 text-right">Votes Contributed</th>
                        <th className="pb-2 text-right">Total Amount (GHS)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {topSpenders.map((spender) => (
                        <tr key={spender.supporterLabel} className="hover:bg-gray-50/50">
                          <td className="py-3 font-semibold text-gray-800">{spender.supporterLabel}</td>
                          <td className="py-3 text-gray-600">{spender.topNominee}</td>
                          <td className="py-3 text-right font-mono font-bold text-gray-900">{spender.totalVotes.toLocaleString()}</td>
                          <td className="py-3 text-right font-mono font-bold text-emerald-600">GHS {spender.totalGhs.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Official Certification Card */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Official Results &amp; Certified PDF</h3>
                <p className="text-xs text-gray-500 mt-0.5">Generate verified certificate with cryptographic audit trail.</p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-700">Audit Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    Results Verified
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px]">
                  Includes exact tally of free and paid votes per nominee, timestamps, revenue breakdown, and Rooted Steeze Studios authorization signature.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadPdf}
                  className="flex-1 min-h-[44px] py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center justify-center gap-2 active:scale-98"
                >
                  <Download className="w-4 h-4" /> Download Certified PDF Certificate
                </button>
                <button
                  onClick={() => window.print()}
                  className="min-h-[44px] px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition-colors inline-flex items-center justify-center active:scale-98"
                >
                  Print Results Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL MILESTONE GRAPHICS */}
        {activeTab === 'milestones' && activeContest && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Social Media Milestone Graphics</h2>
              <p className="text-xs text-gray-500 mt-0.5">Generate branded shareable graphics for Instagram stories and WhatsApp status.</p>
            </div>

            {/* Graphic Preview Card in 4:5 Portrait Ratio */}
            <div className="aspect-[4/5] max-w-sm w-full mx-auto rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-white p-6 sm:p-7 flex flex-col justify-between shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-600/90 flex items-center justify-center shadow-2xs">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-white">SteezeVotes Ghana</span>
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/10 text-slate-200 border border-white/10">
                  {activeContest.category}
                </span>
              </div>

              <div className="text-center space-y-3 py-4">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold tracking-widest uppercase border border-rose-500/30">
                  <Flame className="w-3 h-3 text-rose-400" />
                  Official Milestone Alert
                </div>
                <h3 className="text-3xl sm:text-4xl font-black leading-tight text-white">
                  {totalVotesInContest.toLocaleString()}
                  <span className="block text-base font-normal text-slate-300 mt-1">Votes Recorded</span>
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto line-clamp-2">
                  {activeContest.title}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <span className="font-mono text-rose-400">steezevotes.com</span>
                <span>4:5 Story Format</span>
              </div>
            </div>

            <button
              onClick={() => alert('Milestone graphic copied to clipboard for WhatsApp status!')}
              className="w-full min-h-[48px] py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 active:scale-98"
            >
              <Share2 className="w-4 h-4" /> Share Graphic to WhatsApp Status
            </button>
          </div>
        )}

        {/* TAB 5: ORGANIZER PROFILE & KYC */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Organizer Account Profile</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Voters can view your organization logo, bio, and verified Mobile Money payout credentials on public contest pages.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div className="w-20 h-20 rounded-2xl bg-amber-100 border border-amber-300 overflow-hidden shrink-0 flex items-center justify-center relative">
                  {profilePic ? (
                    <img src={profilePic} alt={currentOrg.organizationName} className="w-full h-full object-cover" />
                  ) : (
                    <Trophy className="w-8 h-8 text-amber-700" />
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-gray-900">{currentOrg.organizationName}</h4>
                  <p className="text-xs text-gray-500 font-mono">KYC Status: <span className="text-emerald-700 font-bold">Verified</span></p>
                  
                  <label className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs transition-colors">
                    <Upload className="w-4 h-4" /> Upload Brand Logo / Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (dataUrl) => setProfilePic(dataUrl));
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Organization Bio &amp; About</label>
                <textarea
                  rows={4}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  placeholder="Tell voters about your organization, past awards, and mission..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 text-xs">
                <h5 className="font-bold text-amber-950">Verified Mobile Money Payout Wallet</h5>
                <p className="text-amber-900 font-mono">
                  Network: <strong>{currentOrg.momoNetwork}</strong> • MoMo Number: <strong>{currentOrg.momoNumber}</strong>
                </p>
                <p className="text-[11px] text-amber-800">Payouts are settled automatically to this wallet 24 hours after contest end date.</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="min-h-[44px] text-xs text-amber-600 font-semibold hover:underline inline-flex items-center"
                >
                  View RSS Organizer Terms &amp; Conditions
                </button>

                <button
                  type="submit"
                  className="min-h-[44px] px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center justify-center active:scale-98"
                >
                  Save Profile Updates
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* EDIT NOMINEE MODAL OVERLAY */}
      {editingNominee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90dvh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit Contestant Information</h3>
              <button
                onClick={() => setEditingNominee(null)}
                className="min-h-[44px] min-w-[44px] text-gray-400 hover:text-gray-600 text-xs font-bold inline-flex items-center justify-center"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              Note: Vote counts ({editingNominee.voteCount}) are tamper-proof and cannot be modified.
            </p>

            <form onSubmit={handleSaveNomineeEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editNomineeName}
                  onChange={(e) => setEditNomineeName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Stage / Display Name</label>
                <input
                  type="text"
                  value={editNomineeStage}
                  onChange={(e) => setEditNomineeStage(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editNomineeBio}
                  onChange={(e) => setEditNomineeBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Photo Upload</label>
                <div className="flex items-center gap-3">
                  <img src={editNomineePhoto} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0" />
                  <label className="flex-1 min-h-[44px] py-2.5 px-3.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold text-gray-800 text-center cursor-pointer inline-flex items-center justify-center">
                    Upload New Compressed Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (dataUrl) => setEditNomineePhoto(dataUrl));
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingNominee(null)}
                  className="min-h-[44px] px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl inline-flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center justify-center active:scale-98"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORGANIZER TERMS MODAL */}
      {showTermsModal && (
        <OrganizerTermsModal onClose={() => setShowTermsModal(false)} />
      )}
    </div>
  );
};
