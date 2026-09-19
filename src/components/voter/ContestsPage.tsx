import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  ChevronRight, 
  Flame, 
  Layers, 
  Filter,
  ArrowLeft,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { Contest, Nominee } from '../../types';

interface ContestsPageProps {
  contests: Contest[];
  nominees: Nominee[];
  onSelectContest: (contestId: string) => void;
  onBackToHome: () => void;
  isDark?: boolean;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({
  contests,
  nominees,
  onSelectContest,
  onBackToHome,
  isDark = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'ended'>('all');

  const categories = ['All', 'Music & Entertainment', 'Nightlife & Culture', 'Pageantry & Fashion'];

  const filteredContests = contests.filter((c) => {
    const isPublic = c.status === 'active' || c.status === 'ended' || c.status === 'settled';
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesStatus = 
      selectedStatus === 'all' 
        ? true 
        : selectedStatus === 'active' 
        ? c.status === 'active' 
        : (c.status === 'ended' || c.status === 'settled');
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    return isPublic && matchesCat && matchesStatus && matchesSearch;
  });

  const getNomineeCount = (contestId: string) => {
    return nominees.filter((n) => n.contestId === contestId).length;
  };

  const getTotalVotes = (contestId: string) => {
    return nominees
      .filter((n) => n.contestId === contestId)
      .reduce((sum, n) => sum + n.voteCount, 0);
  };

  const formatDaysLeft = (endDateStr: string) => {
    const diff = new Date(endDateStr).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="min-h-screen py-6 sm:py-8 pb-28 sm:pb-32 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="space-y-3 mb-6">
          <button
            onClick={onBackToHome}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-1">
                <Trophy className="w-3.5 h-3.5" />
                <span>Verified Contests</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Contests &amp; Voting Ballots
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Explore active public polls and cast verified votes in real time.
              </p>
            </div>

            {/* Total Active badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-emerald-700 shadow-2xs self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{contests.filter(c => c.status === 'active').length} Active Contests</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-2xs space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contest title, organizer, or category..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Category Switcher Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors inline-flex items-center justify-center ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 shrink-0 self-start sm:self-auto">
              {(['all', 'active', 'ended'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`min-h-[40px] px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors inline-flex items-center justify-center ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st === 'all' ? 'All' : st === 'active' ? 'Live' : 'Ended'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contests Grid */}
        {filteredContests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3 shadow-2xs">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900">No Contests Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We could not find any awards or pageants matching your criteria. Try resetting your search filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('all'); }}
              className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition-colors border border-slate-200 inline-flex items-center justify-center active:scale-98"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredContests.map((contest) => {
              const totalVotes = getTotalVotes(contest.id);
              const nomineeCount = getNomineeCount(contest.id);
              const isClosed = contest.status === 'ended' || contest.status === 'settled';

              return (
                <div
                  key={contest.id}
                  onClick={() => onSelectContest(contest.id)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    {/* Flyer / Poster Image */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                      <img
                        src={contest.bannerUrl}
                        alt={contest.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-900/85 text-white">
                          {contest.category}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 shadow-2xs ${
                          isClosed 
                            ? 'bg-slate-100 text-slate-600' 
                            : 'bg-emerald-600 text-white'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {formatDaysLeft(contest.endDate)}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 space-y-1.5">
                      <span className="text-[11px] font-medium text-slate-500 block">
                        By {contest.organizerName}
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {contest.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats & CTA */}
                  <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      <strong className="text-slate-900 font-semibold tabular-nums">{totalVotes.toLocaleString()}</strong> votes • {nomineeCount} candidates
                    </div>

                    <button className="min-h-[44px] py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-xl transition-colors inline-flex items-center gap-1 shadow-2xs active:scale-98">
                      {isClosed ? 'Results' : 'Enter Ballot'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
