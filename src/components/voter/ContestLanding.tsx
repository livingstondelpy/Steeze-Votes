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
  BarChart2
} from 'lucide-react';
import { Contest, Nominee, VoteRecord, Transaction } from '../../types';
import { Breadcrumb } from '../Breadcrumb';
import { NomineeCard } from './NomineeCard';
import { FreeVoteModal } from './FreeVoteModal';
import { PaidVoteModal } from './PaidVoteModal';
import { ReceiptModal } from './ReceiptModal';
import { ShareQrModal } from './ShareQrModal';
import { OrganizerProfileModal } from './OrganizerProfileModal';
import { store } from '../../lib/store';

interface ContestLandingProps {
  contest: Contest;
  nominees: Nominee[];
  lowDataMode: boolean;
  onOpenTrustModal: () => void;
  onViewMyVotes: () => void;
  onViewExplainer: () => void;
  onBackToContests: () => void;
  onBackToHome?: () => void;
}

export const ContestLanding: React.FC<ContestLandingProps> = ({
  contest,
  nominees,
  lowDataMode,
  onOpenTrustModal,
  onViewMyVotes,
  onViewExplainer,
  onBackToContests,
  onBackToHome,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNomineeForFree, setSelectedNomineeForFree] = useState<Nominee | null>(null);
  const [selectedNomineeForPaid, setSelectedNomineeForPaid] = useState<Nominee | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<VoteRecord | null>(null);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOrganizerModal, setShowOrganizerModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });
  const [socialProof, setSocialProof] = useState(store.socialProofCount);
  const [pollTick, setPollTick] = useState(0);

  // Sync social proof & periodic 12s polling tick for live standings
  useEffect(() => {
    const unsub = store.subscribe(() => {
      setSocialProof(store.socialProofCount);
    });

    const pollInterval = setInterval(() => {
      setPollTick((t) => t + 1);
    }, 12000);

    return () => {
      unsub();
      clearInterval(pollInterval);
    };
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

  // Top 5 nominees for Live Leaderboard
  const top5Nominees = contestNominees.slice(0, 5);

  const filteredNominees = contestNominees.filter((n) => {
    const term = searchTerm.toLowerCase();
    return (
      n.name.toLowerCase().includes(term) ||
      (n.stageName && n.stageName.toLowerCase().includes(term)) ||
      n.nomineeCode.toLowerCase().includes(term) ||
      n.bio.toLowerCase().includes(term)
    );
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
    <div className="bg-gray-50 min-h-screen text-gray-900 pb-16">
      
      {/* Contest Header Card Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Navigation Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <Breadcrumb
            items={[
              { label: 'Home', onClick: onBackToHome || onBackToContests },
              { label: 'Live Contests', onClick: onBackToContests },
              { label: contest.title },
            ]}
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-900 hover:text-white shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" /> Share Contest
            </button>
          </div>
        </div>

        {/* Main Contest Hero Banner Card */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
          
          {/* Banner Graphic (if not in low data mode) */}
          {!lowDataMode && (
            <div className="relative w-full overflow-hidden bg-gray-950 flex items-center justify-center min-h-[240px] max-h-[460px]">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                style={{ backgroundImage: `url(${contest.bannerUrl})` }}
              />
              <img
                src={contest.bannerUrl}
                alt={contest.title}
                className="relative z-10 max-h-[440px] w-full object-contain"
              />
              <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-30 text-white max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-xs">
                    {contest.category}
                  </span>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                    contest.contestType === 'free' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {contest.contestType === 'free' ? 'Free Contest' : 'Paid Voting Contest'}
                  </span>
                </div>
                
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                  {contest.title}
                </h1>
                
                <button
                  onClick={() => setShowOrganizerModal(true)}
                  className="text-xs sm:text-sm text-amber-300 hover:text-amber-200 mt-1 font-semibold underline flex items-center gap-1 transition-colors"
                >
                  Organized by {contest.organizerName} (View Profile)
                </button>
              </div>
            </div>
          )}

          {/* Details & Stats Bar */}
          <div className="p-6 sm:p-8 space-y-6">
            {lowDataMode && (
              <div>
                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 mb-2">
                  {contest.category} • {contest.contestType === 'free' ? 'Free Contest' : 'Paid Voting'}
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {contest.title}
                </h1>
                <button
                  onClick={() => setShowOrganizerModal(true)}
                  className="text-xs text-amber-600 font-semibold hover:underline mt-1 block"
                >
                  Organized by {contest.organizerName} (View Profile)
                </button>
              </div>
            )}

            <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
              {contest.description}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                  Total Votes Cast
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  {totalVotes.toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                  Contestants
                </span>
                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                  {contestNominees.length}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                  Time Remaining
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-700 mt-0.5 flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  {timeLeft.expired ? 'Voting Ended' : `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">
                  Live Voting Activity
                </span>
                <span className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  {socialProof} votes recorded
                </span>
              </div>
            </div>

            {/* Sponsor Badge if present */}
            {contest.sponsorName && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                <span>Official Partner:</span>
                <span className="font-semibold text-gray-800">{contest.sponsorName}</span>
              </div>
            )}

          </div>

        </div>

        {/* Live Leaderboard Card (TOP OF CONTEST PAGE - REQUIREMENT #4) */}
        {contest.showPublicResults && (
          <div className="mt-8 bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    Live Leaderboard (Top 5 Standing)
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Polling
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500">Updates automatically every 10-15 seconds.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {top5Nominees.map((nom, idx) => {
                const pct = totalVotes > 0 ? Math.round((nom.voteCount / totalVotes) * 100) : 0;
                return (
                  <div key={nom.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      <img
                        src={nom.photoUrl}
                        alt={nom.name}
                        className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {nom.stageName || nom.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {nom.nomineeCode}
                        </p>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-gray-200/60 flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-900">{nom.voteCount.toLocaleString()} votes</span>
                      <span className="font-semibold text-amber-700">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nominee Directory Search & Header */}
        <div className="mt-10 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              All Nominees
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {contest.contestType === 'free' 
                ? 'Select a contestant to cast your 1 free vote.' 
                : 'Select a contestant to buy vote packages via Mobile Money.'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search contestant or code..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
            />
          </div>
        </div>

        {/* Nominees Grid */}
        {filteredNominees.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <p className="text-sm font-semibold text-gray-700">No contestant found</p>
            <p className="text-xs text-gray-500">Try searching with a different name or contestant code.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg"
            >
              Show All Contestants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              />
            ))}
          </div>
        )}

        {/* Subtle Trust Bar at Bottom */}
        <div className="mt-12 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              All votes on SteezeVotes are secured by Ghana phone number verification and our 24-hour safe payout hold.
            </span>
          </div>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <button
              onClick={onOpenTrustModal}
              className="text-amber-600 hover:text-amber-700 font-semibold"
            >
              How it protects your vote
            </button>
            <span>•</span>
            <button
              onClick={onViewMyVotes}
              className="text-gray-700 hover:text-gray-900 font-semibold"
            >
              Look up my receipts
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
        />
      )}

      {/* Receipt Modal with Share Prompt (REQUIREMENT #22) */}
      {activeReceipt && (
        <ReceiptModal
          receipt={activeReceipt}
          transaction={activeTx || undefined}
          contest={contest}
          onClose={() => { setActiveReceipt(null); setActiveTx(null); }}
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
