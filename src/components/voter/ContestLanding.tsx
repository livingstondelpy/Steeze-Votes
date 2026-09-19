import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Flame, 
  Share2, 
  Search, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ExternalLink,
  Award,
  BarChart2,
  Tag,
  Building2
} from 'lucide-react';
import { Contest, Nominee, VoteRecord, Transaction } from '../../types';
import { Breadcrumb } from '../Breadcrumb';
import { NomineeCard } from './NomineeCard';
import { FreeVoteModal } from './FreeVoteModal';
import { PaidVoteModal } from './PaidVoteModal';
import { ReceiptModal } from './ReceiptModal';
import { ShareQrModal } from './ShareQrModal';
import { OrganizerProfileModal } from './OrganizerProfileModal';
import { LeaderboardView } from './LeaderboardView';
import { store } from '../../lib/store';

interface ContestLandingProps {
  contest: Contest;
  nominees: Nominee[];
  lowDataMode: boolean;
  onOpenTrustModal: () => void;
  onViewMyVotes: () => void;
  onViewExplainer: () => void;
  onViewLiveResults?: () => void;
  onBackToContests: () => void;
  onBackToHome?: () => void;
  isDark?: boolean;
}

export const ContestLanding: React.FC<ContestLandingProps> = ({
  contest,
  nominees,
  lowDataMode,
  onOpenTrustModal,
  onViewMyVotes,
  onViewExplainer,
  onViewLiveResults,
  onBackToContests,
  onBackToHome,
  isDark = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('All');
  const [selectedNomineeForFree, setSelectedNomineeForFree] = useState<Nominee | null>(null);
  const [selectedNomineeForPaid, setSelectedNomineeForPaid] = useState<Nominee | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<VoteRecord | null>(null);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ballot' | 'leaderboard'>('ballot');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [socialProof, setSocialProof] = useState(store.socialProofCount);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSocialProof(store.socialProofCount);
    });
    return unsub;
  }, []);

  // Countdown timer
  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(contest.endDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [contest.endDate]);

  const contestNominees = nominees
    .filter((n) => n.contestId === contest.id)
    .sort((a, b) => b.voteCount - a.voteCount);

  const totalVotes = contestNominees.reduce((sum, n) => sum + n.voteCount, 0);

  // Extract unique sub-categories
  const subCategories = ['All', ...Array.from(new Set(contestNominees.map((n) => n.category).filter(Boolean)))];

  const filteredNominees = contestNominees.filter((n) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      n.name.toLowerCase().includes(term) ||
      (n.stageName && n.stageName.toLowerCase().includes(term)) ||
      (n.votingCode && n.votingCode.toLowerCase().includes(term)) ||
      (n.nomineeCode && n.nomineeCode.toLowerCase().includes(term)) ||
      (n.bio && n.bio.toLowerCase().includes(term));
    const matchesCategory = selectedSubCategory === 'All' || n.category === selectedSubCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFreeSuccess = (receipt: VoteRecord) => {
    setActiveReceipt(receipt);
    setActiveTx(null);
  };

  const handlePaidSuccess = (receipt: VoteRecord, tx: Transaction) => {
    setActiveReceipt(receipt);
    setActiveTx(tx);
  };

  const handleVoteAction = (nominee: Nominee) => {
    if (contest.contestType === 'free') {
      setSelectedNomineeForFree(nominee);
    } else {
      setSelectedNomineeForPaid(nominee);
    }
  };

  return (
    <div className="min-h-screen pb-28 sm:pb-32 bg-[#fafafa] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 relative z-10 space-y-6">
        
        {/* Navigation Breadcrumb & Share Trigger */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBackToHome || onBackToContests },
              { label: 'Categories & Contests', onClick: onBackToContests },
              { label: contest.title },
            ]}
          />

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onViewLiveResults && (
              <button
                onClick={onViewLiveResults}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-900 bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-2xs active:scale-98"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Results Display</span>
              </button>
            )}
            <button
              onClick={onOpenTrustModal}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs active:scale-98"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Audit Ledger</span>
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs active:scale-98"
            >
              <Share2 className="w-3.5 h-3.5 text-rose-600" /> Share
            </button>
          </div>
        </div>

        {/* Contest Showcase & Telemetry Card */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs p-5 sm:p-7">
          <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start">
            {/* 4:5 Portrait Event Flyer */}
            {!lowDataMode && (
              <div className="w-full sm:w-72 md:w-80 lg:w-84 aspect-[4/5] mx-auto md:mx-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative shadow-2xs group">
                <img
                  src={contest.bannerUrl}
                  alt={contest.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                />
                
                {/* Floating Category & Format Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-slate-900 shadow-2xs border border-slate-100">
                    {contest.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold shadow-2xs ${
                    contest.contestType === 'free' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'
                  }`}>
                    {contest.contestType === 'free' ? 'Free Phone Ballot' : 'Paid Voting'}
                  </span>
                </div>
              </div>
            )}

            {/* Event Details & Telemetry */}
            <div className="flex-1 space-y-5 w-full">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowOrganizerModal(true)}
                    className="min-h-[36px] text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Organized by {contest.organizerName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </button>
                </div>

                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 leading-tight">
                  {contest.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {contest.description}
                </p>
              </div>

              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    Total Votes Recorded
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums mt-0.5 block">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">
                    Candidates
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums mt-0.5 block">
                    {contestNominees.length} Contenders
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">
                    Voting Countdown
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-amber-700 mt-0.5 flex items-center gap-1 tabular-nums">
                    <Clock className="w-3.5 h-3.5" />
                    {timeLeft.expired ? 'Voting Ended' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block">
                    Audit Status
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-emerald-700 mt-0.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {socialProof} ballots verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Tabs: Nominee Ballot vs. Live Standings Table */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('ballot')}
              className={`min-h-[44px] px-4 py-2 rounded-xl font-semibold text-xs transition-colors inline-flex items-center justify-center ${
                activeTab === 'ballot'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              Candidate Ballot ({contestNominees.length})
            </button>

            {contest.showPublicResults && (
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`min-h-[44px] px-4 py-2 rounded-xl font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 ${
                  activeTab === 'leaderboard'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Live Standings
              </button>
            )}
          </div>

          <button
            onClick={onOpenTrustModal}
            className="min-h-[44px] hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Fraud Ledger</span>
          </button>
        </div>

        {/* TAB 1: CANDIDATE BALLOT */}
        {activeTab === 'ballot' && (
          <div className="space-y-6">
            
            {/* Search & Sub-Category Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Category Pills */}
              {subCategories.length > 2 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                  {subCategories.map((subCat) => (
                    <button
                      key={subCat}
                      onClick={() => setSelectedSubCategory(subCat)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center ${
                        selectedSubCategory === subCat
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {subCat}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Box */}
              <div className="relative w-full sm:w-80 ml-auto">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search candidate name or code..."
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 shadow-2xs"
                />
              </div>
            </div>

            {/* 7. RESPONSIVE NOMINEE GRID: 2 cols on mobile, 3 on tablet, 4 on desktop */}
            {filteredNominees.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
                <p className="text-sm font-semibold text-slate-700">No candidates match your filter</p>
                <p className="text-xs text-slate-500">Try searching with a different candidate name or code.</p>
                <button
                  onClick={() => { setSearchTerm(''); setSelectedSubCategory('All'); }}
                  className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center justify-center"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                {filteredNominees.map((nominee, idx) => (
                  <NomineeCard
                    key={nominee.id}
                    nominee={nominee}
                    rank={idx + 1}
                    totalContestVotes={totalVotes}
                    contest={contest}
                    lowDataMode={lowDataMode}
                    onVoteFree={handleVoteAction}
                    onVotePaid={handleVoteAction}
                    isDark={false}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: LIVE LEADERBOARD (TABLE & GRID MODES) */}
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            nominees={contestNominees}
            contest={contest}
            totalVotes={totalVotes}
            onVoteAction={handleVoteAction}
            isDark={isDark}
          />
        )}

        {/* Contest Terms & Conditions (if defined by organizer) */}
        {contest.termsAndConditions && (
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wide">
              <Info className="w-4 h-4 text-slate-500" />
              <span>Contest Rules & Terms</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {contest.termsAndConditions}
            </p>
          </div>
        )}

        {/* Bottom Trust Seal */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              All votes on SteezeVotes are secured by Ghanaian phone verification, instant USSD confirmation, and SHA-256 digital audit hashes.
            </span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <button
              onClick={onOpenTrustModal}
              className="text-rose-600 hover:underline font-semibold"
            >
              Integrity Whitepaper
            </button>
            <span>•</span>
            <button
              onClick={onViewMyVotes}
              className="text-slate-900 hover:underline font-semibold"
            >
              Verify My Ballot
            </button>
          </div>
        </div>

      </div>

      {/* Free Vote Modal */}
      {selectedNomineeForFree && (
        <FreeVoteModal
          contest={contest}
          nominee={selectedNomineeForFree}
          onClose={() => setSelectedNomineeForFree(null)}
          onSuccess={handleFreeSuccess}
          onOpenTrustModal={onOpenTrustModal}
        />
      )}

      {/* Paid Vote Modal */}
      {selectedNomineeForPaid && (
        <PaidVoteModal
          contest={contest}
          nominee={selectedNomineeForPaid}
          onClose={() => setSelectedNomineeForPaid(null)}
          onSuccess={handlePaidSuccess}
          onOpenTrustModal={onOpenTrustModal}
          isDark={isDark}
        />
      )}

      {/* Digital Receipt Modal */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          transaction={activeTx || undefined}
          contest={contest}
          onClose={() => { setActiveReceipt(null); setActiveTx(null); }}
          isDark={isDark}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareQrModal
          contest={contest}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Organizer Profile Modal */}
      {showOrganizerModal && (
        <OrganizerProfileModal
          contest={contest}
          onClose={() => setShowOrganizerModal(false)}
        />
      )}

    </div>
  );
};
