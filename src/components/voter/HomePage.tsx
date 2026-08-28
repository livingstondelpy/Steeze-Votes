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
  Flame
} from 'lucide-react';
import { Contest, Nominee } from '../../types';

interface HomePageProps {
  contests: Contest[];
  nominees: Nominee[];
  onSelectContest: (contestId: string) => void;
  onNavigate: (view: string, role?: 'voter' | 'organizer' | 'rss_admin') => void;
  onOpenTrustModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  contests,
  nominees,
  onSelectContest,
  onNavigate,
  onOpenTrustModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Music & Entertainment', 'Nightlife & Culture', 'Pageantry & Fashion'];

  const filteredContests = contests.filter((c) => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
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
    <div className="bg-white text-gray-900 min-h-screen">
      
      {/* Hero Section — Styled like eGotickets / Ayatickets */}
      <section className="relative bg-gradient-to-b from-amber-50/50 via-white to-gray-50/40 border-b border-gray-100 pt-10 pb-16 lg:pt-16 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            
            {/* Small trust pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Verified Mobile Money Voting for Ghana</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              Vote for your favorite awards and pageants across Ghana
            </h1>

            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Support your nominees with 1 free verified vote or instant Mobile Money vote packages on MTN, Telecel, and AT.
            </p>

            {/* Quick Action Button & Search */}
            <div className="pt-3 max-w-xl mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contests, awards, or organizers..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-xs placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={() => onNavigate('contests', 'voter')}
                  className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Explore Contests
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Supported Networks */}
              <p className="text-xs text-gray-500 flex items-center justify-center gap-2 pt-1">
                <span>Instant payment via:</span>
                <span className="font-semibold text-gray-700">MTN MoMo</span>
                <span>•</span>
                <span className="font-semibold text-gray-700">Telecel Cash</span>
                <span>•</span>
                <span className="font-semibold text-gray-700">AT Money</span>
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Highlights — 4 Simple Pillars */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Verified Free Votes
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Every Ghana phone number gets 1 free vote verified with fast SMS OTP.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3.5">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Instant MoMo Bundles
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Buy vote packages on MTN MoMo, Telecel Cash, or AT Money in seconds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3.5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Live Certified Results
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Watch standings update in real time with transparent tally records.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Official Digital Receipts
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Get verifiable receipt codes and QR proofs for every ballot cast.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Featured / Live Contests Section — eGotickets style event cards */}
      <section className="py-12 sm:py-16 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                <Flame className="w-4 h-4 text-amber-600" />
                <span>Now Trending</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Live Events & Awards Contests
              </h2>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
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

          {/* View All Contests Link */}
          <div className="mt-10 text-center">
            <button
              onClick={() => onNavigate('contests', 'voter')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800 transition-colors shadow-xs"
            >
              View All Contests
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* How It Works — 3 Clean Steps */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
              How Voting Works on SteezeVotes
            </h2>
            <p className="text-sm text-gray-600">
              Simple, transparent, and verified on your phone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="text-center space-y-3 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-base flex items-center justify-center mx-auto shadow-xs">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Choose Your Nominee
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Browse the contest list and find the nominee you want to support.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-base flex items-center justify-center mx-auto shadow-xs">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Vote Free or Buy a Bundle
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cast 1 free vote with phone SMS OTP, or purchase discounted vote packages with MoMo.
              </p>
            </div>

            <div className="text-center space-y-3 p-6 rounded-2xl bg-gray-50/50 border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white font-bold text-base flex items-center justify-center mx-auto shadow-xs">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Get Your Digital Receipt
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Receive an instant verifiable receipt code with a QR badge and WhatsApp share link.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* For Organizers Banner — eGotickets style */}
      <section className="py-14 bg-gradient-to-r from-gray-900 to-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl text-center lg:text-left">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                For Event Organizers
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Host your awards, pageants, or talent contests on SteezeVotes
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                Enjoy 90% instant Mobile Money payouts, zero setup fees, real-time leaderboard displays, and exportable voter contacts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('organizer', 'organizer')}
                className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Host a Contest Now
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onNavigate('how-it-works', 'voter')}
                className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl text-sm transition-colors border border-white/20"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
