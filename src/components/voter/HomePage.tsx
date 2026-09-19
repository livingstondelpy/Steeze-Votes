import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Users,
  ChevronRight,
  Flame,
  Radio,
  Lock,
  Layers,
  BarChart3
} from 'lucide-react';
import { Contest, Nominee, VoteRecord, Transaction } from '../../types';
import { FeaturedNomineesCarousel } from './FeaturedNomineesCarousel';
import { PaidVoteModal } from './PaidVoteModal';
import { FreeVoteModal } from './FreeVoteModal';
import { ReceiptModal } from './ReceiptModal';

interface HomePageProps {
  contests: Contest[];
  nominees: Nominee[];
  onSelectContest: (contestId: string) => void;
  onNavigate: (view: string, role?: 'voter' | 'organizer' | 'rss_admin') => void;
  onOpenTrustModal: () => void;
  isDark?: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  contests,
  nominees,
  onSelectContest,
  onNavigate,
  onOpenTrustModal,
  isDark = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Quick voting from homepage carousel
  const [selectedNomineeForPaid, setSelectedNomineeForPaid] = useState<Nominee | null>(null);
  const [selectedNomineeForFree, setSelectedNomineeForFree] = useState<Nominee | null>(null);
  const [activeContestForVote, setActiveContestForVote] = useState<Contest | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<VoteRecord | null>(null);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);

  const categories = ['All', 'Music & Entertainment', 'Nightlife & Culture', 'Pageantry & Fashion'];

  const filteredContests = contests.filter((c) => {
    const isPublic = c.status === 'active' || c.status === 'ended' || c.status === 'settled';
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    return isPublic && matchesCat && matchesSearch;
  });

  const getNomineeCount = (contestId: string) => {
    return nominees.filter((n) => n.contestId === contestId).length;
  };

  const getTotalVotes = (contestId: string) => {
    return nominees
      .filter((n) => n.contestId === contestId)
      .reduce((sum, n) => sum + n.voteCount, 0);
  };

  const totalSystemVotes = nominees.reduce((sum, n) => sum + n.voteCount, 0);

  const formatDaysLeft = (endDateStr: string) => {
    const diff = new Date(endDateStr).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const handleCarouselVote = (nominee: Nominee, contest: Contest) => {
    setActiveContestForVote(contest);
    if (contest.contestType === 'free') {
      setSelectedNomineeForFree(nominee);
    } else {
      setSelectedNomineeForPaid(nominee);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 pb-24 sm:pb-28">
      
      {/* MINIMALIST HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-10 sm:pb-12 border-b border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            
            {/* Status Chip */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Official Voting &amp; Awards Platform • Ghana</span>
            </div>

            {/* Reflective Glass Editorial Headline */}
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/95 via-black to-slate-950 p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl">
              {/* Glossy Glass Reflection Sheen */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-3xl" />
              <div className="absolute -inset-full w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-12 pointer-events-none" />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/15 pointer-events-none" />

              <h1 className="relative z-10 text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-white uppercase leading-tight">
                GHANA&apos;S NO. 1 VOTING PLATFORM FOR <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-red-400 via-red-500 to-rose-600 bg-clip-text text-transparent inline-block drop-shadow-sm">
                  CONTESTS &amp; AWARDS
                </span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto">
              Cast your vote securely using MTN Mobile Money, Telecel Cash, or AT Money. Every vote generates an instant cryptographic receipt for transparent verification.
            </p>

            {/* Search Input Bar */}
            <div className="pt-2 max-w-lg mx-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contest, nominee, or organizer..."
                  className="w-full min-h-[44px] pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all shadow-2xs"
                />
                <button
                  onClick={() => onNavigate('contests', 'voter')}
                  className="min-h-[36px] absolute right-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors inline-flex items-center justify-center active:scale-98"
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Minimal Stat Strip */}
            <div className="pt-6 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg mx-auto border-t border-slate-100 text-center">
              <div className="p-2 sm:p-0">
                <span className="text-[11px] sm:text-xs text-slate-500 block">Total Votes</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">{totalSystemVotes.toLocaleString()}</span>
              </div>
              <div className="p-2 sm:p-0">
                <span className="text-[11px] sm:text-xs text-slate-500 block">Active Contests</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">{contests.filter((c) => c.status === 'active').length}</span>
              </div>
              <div className="p-2 sm:p-0">
                <span className="text-[11px] sm:text-xs text-slate-500 block">Audit Record</span>
                <span className="text-base sm:text-lg font-bold text-emerald-600">Verified</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURED FRONT-RUNNERS SECTION */}
      <section className="py-10 border-b border-slate-200/80 bg-white">
        <FeaturedNomineesCarousel
          nominees={nominees}
          contests={contests}
          onVoteAction={handleCarouselVote}
          onViewDetails={(nominee, contest) => onSelectContest(contest.id)}
          isDark={false}
        />
      </section>

      {/* CONTESTS DIRECTORY SECTION */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          
          {/* Section Header & Minimal Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900 tracking-tight">
                Active Contests
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Select a category to view nominees and cast your ballot.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1">
              {categories.map((cat) => {
                const count = cat === 'All' 
                  ? contests.filter((c) => c.status === 'active' || c.status === 'ended' || c.status === 'settled').length
                  : contests.filter((c) => c.category === cat && (c.status === 'active' || c.status === 'ended' || c.status === 'settled')).length;
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimalist Contests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filteredContests.map((contest) => {
              const count = getNomineeCount(contest.id);
              const votes = getTotalVotes(contest.id);
              const isClosed = contest.status === 'ended' || contest.status === 'settled';

              return (
                <div
                  key={contest.id}
                  onClick={() => onSelectContest(contest.id)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer shadow-2xs"
                >
                  <div>
                    {/* Event Flyer / Poster */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                      <img
                        src={contest.bannerUrl}
                        alt={contest.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-white/95 text-slate-800 shadow-2xs border border-slate-100">
                          {contest.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold shadow-2xs ${
                          isClosed ? 'bg-slate-800 text-slate-200' : 'bg-emerald-600 text-white'
                        }`}>
                          {isClosed ? 'Closed' : formatDaysLeft(contest.endDate)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 space-y-2">
                      <p className="text-[11px] font-medium text-rose-600">
                        {contest.organizerName}
                      </p>
                      <h3 className="text-base font-display font-bold text-slate-900 leading-snug group-hover:text-rose-600 transition-colors line-clamp-1">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {contest.description}
                      </p>
                    </div>
                  </div>

                  {/* Clean Footer Bar */}
                  <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between min-h-[48px]">
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{votes.toLocaleString()}</span> votes • {count} contenders
                    </div>
                    <span className="text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                      Enter Ballot <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* TRUST & VERIFICATION SECTION - CLEAN MINIMAL */}
      <section className="py-12 border-t border-slate-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-900">
              Verified Voting Integrity
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Our platform enforces bank-grade payment reconciliation and transparent cryptographic receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Digital Audit Trail</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Each ballot generates a verifiable cryptographic transaction code and QR code for public confirmation.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Official MoMo Gateways</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Direct integration with MTN Mobile Money, Telecel Cash, and AT Money with automated payment confirmation.
              </p>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Escrow &amp; Safe Payouts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Contest revenue is safeguarded under strict supervisory oversight until polling conclusions are audited.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={onOpenTrustModal}
              className="min-h-[44px] px-4 py-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors active:scale-98"
            >
              Learn about our anti-fraud &amp; verification standards <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Vote Modals from Carousel */}
      {selectedNomineeForPaid && activeContestForVote && (
        <PaidVoteModal
          nominee={selectedNomineeForPaid}
          contest={activeContestForVote}
          onClose={() => setSelectedNomineeForPaid(null)}
          onSuccess={(receipt, tx) => {
            setActiveReceipt(receipt);
            setActiveTx(tx);
          }}
          onOpenTrustModal={onOpenTrustModal}
          isDark={isDark}
        />
      )}

      {selectedNomineeForFree && activeContestForVote && (
        <FreeVoteModal
          nominee={selectedNomineeForFree}
          contest={activeContestForVote}
          onClose={() => setSelectedNomineeForFree(null)}
          onSuccess={(receipt) => {
            setActiveReceipt(receipt);
            setActiveTx(null);
          }}
          onOpenTrustModal={onOpenTrustModal}
        />
      )}

      {activeReceipt && activeContestForVote && (
        <ReceiptModal
          receipt={activeReceipt}
          transaction={activeTx || undefined}
          contest={activeContestForVote}
          onClose={() => {
            setActiveReceipt(null);
            setActiveTx(null);
          }}
          isDark={isDark}
        />
      )}

    </div>
  );
};
