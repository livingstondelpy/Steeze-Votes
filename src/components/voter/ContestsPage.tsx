import React, { useState } from 'react';
import { 
  Search, 
  Clock, 
  ChevronRight, 
  Flame, 
  Layers, 
  Filter,
  ArrowLeft,
  ShieldCheck
} from 'lucide-react';
import { Contest, Nominee } from '../../types';

interface ContestsPageProps {
  contests: Contest[];
  nominees: Nominee[];
  onSelectContest: (contestId: string) => void;
  onBackToHome: () => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({
  contests,
  nominees,
  onSelectContest,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'closed'>('all');

  const categories = ['All', 'Music & Entertainment', 'Nightlife & Culture', 'Pageantry & Fashion'];

  const filteredContests = contests.filter((c) => {
    // Only active or closed contests are visible to public voters
    const isPublic = c.status === 'active' || c.status === 'closed';
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="bg-gray-50 text-gray-900 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Breadcrumb */}
        <div className="space-y-4 mb-8">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Explore Contests & Awards
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Find ongoing contests across Ghana and support your nominees.
              </p>
            </div>

            {/* Total Active badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-xs self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{contests.filter(c => c.status === 'active').length} Active Contests</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 shadow-xs space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by contest title, organizer, or category..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStatus === 'all' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatus('active')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStatus === 'active' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setSelectedStatus('closed')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStatus === 'closed' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                }`}
              >
                Concluded
              </button>
            </div>
          </div>
        </div>

        {/* Contests Grid */}
        {filteredContests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 p-8 space-y-3">
            <Search className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-bold text-gray-900">No contests found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              We could not find any contest matching your search. Try adjusting the category or search terms.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedStatus('all'); }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests.map((contest) => {
              const totalVotes = getTotalVotes(contest.id);
              const nomineeCount = getNomineeCount(contest.id);
              const isClosed = contest.status === 'closed';

              return (
                <div
                  key={contest.id}
                  onClick={() => onSelectContest(contest.id)}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                >
                  {/* Banner Image */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    <img
                      src={contest.bannerUrl}
                      alt={contest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Category Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-gray-800 shadow-xs">
                        {contest.category}
                      </span>
                    </div>

                    {/* Status / Time Left */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 shadow-xs ${
                        isClosed 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-amber-500 text-white'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {formatDaysLeft(contest.endDate)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">
                        By {contest.organizerName}
                      </p>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                        {contest.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                        {contest.description}
                      </p>
                    </div>

                    {/* Stats & CTA */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        <span className="font-bold text-gray-900">{totalVotes.toLocaleString()}</span> votes • {nomineeCount} nominees
                      </div>

                      <button className="px-4 py-2 bg-amber-500 group-hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                        {isClosed ? 'View Results' : 'Vote Now'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
