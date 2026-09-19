import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ArrowLeft, Clock, ShieldCheck, Share2, Award } from 'lucide-react';
import { Contest, Nominee } from '../../types';
import { store } from '../../lib/store';

interface LiveResultsPageProps {
  contest: Contest;
  nominees: Nominee[];
  onBackToContest?: () => void;
}

export const LiveResultsPage: React.FC<LiveResultsPageProps> = ({
  contest,
  nominees,
  onBackToContest,
}) => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeNominees, setActiveNominees] = useState<Nominee[]>(
    nominees.filter((n) => n.contestId === contest.id)
  );

  // Subscribe to live store updates (simulating Supabase Realtime)
  useEffect(() => {
    const unsub = store.subscribe(() => {
      const updated = store.nominees.filter((n) => n.contestId === contest.id);
      setActiveNominees(updated);
      setLastUpdated(new Date());
    });
    return unsub;
  }, [contest.id]);

  // Periodic polling check every 5 seconds for live displays
  useEffect(() => {
    const interval = setInterval(() => {
      const updated = store.nominees.filter((n) => n.contestId === contest.id);
      setActiveNominees(updated);
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, [contest.id]);

  const sortedNominees = [...activeNominees].sort((a, b) => b.voteCount - a.voteCount);
  const totalVotes = sortedNominees.reduce((sum, n) => sum + n.voteCount, 0);

  const formattedTime = lastUpdated.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-rose-600">
      {/* Top Telemetry Presentation Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 px-6 py-4 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBackToContest && (
              <button
                onClick={onBackToContest}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Back to Voting Page"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                  Official Public Leaderboard
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                {contest.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                Total Verified Votes
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                {totalVotes.toLocaleString()}
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Updated {formattedTime}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Presentation Board */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top 3 Podium Highlights for Projection & TV screens */}
        {sortedNominees.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* 2nd Place */}
            <div className="order-2 md:order-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border-2 border-slate-600">
                <img
                  src={sortedNominees[1].photoUrl}
                  alt={sortedNominees[1].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-200">
                    2ND PLACE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {sortedNominees[1].stageName || sortedNominees[1].name}
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-slate-200 tabular-nums">
                  {sortedNominees[1].voteCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">votes</span>
                </p>
              </div>
            </div>

            {/* 1st Place Champion */}
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden shadow-lg shadow-amber-950/30">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-800 shrink-0 border-2 border-amber-400">
                <img
                  src={sortedNominees[0].photoUrl}
                  alt={sortedNominees[0].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950">
                    CURRENT LEADER
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                  {sortedNominees[0].stageName || sortedNominees[0].name}
                </h2>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">
                  {sortedNominees[0].voteCount.toLocaleString()} <span className="text-xs font-normal text-slate-300">votes</span>
                </p>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-3 md:order-3 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border-2 border-amber-700/60">
                <img
                  src={sortedNominees[2].photoUrl}
                  alt={sortedNominees[2].name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/40">
                    3RD PLACE
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate">
                  {sortedNominees[2].stageName || sortedNominees[2].name}
                </h3>
                <p className="text-xl sm:text-2xl font-bold text-slate-200 tabular-nums">
                  {sortedNominees[2].voteCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">votes</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Complete Leaderboard Roster Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500" /> Full Standings
            </h3>
            <span className="text-xs text-slate-400">
              {sortedNominees.length} Contestants
            </span>
          </div>

          <div className="divide-y divide-slate-800/70">
            {sortedNominees.map((nominee, idx) => {
              const rank = idx + 1;
              const percentage = totalVotes > 0 ? ((nominee.voteCount / totalVotes) * 100).toFixed(1) : '0';

              return (
                <div
                  key={nominee.id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    rank === 1 ? 'bg-amber-950/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : rank === 2
                          ? 'bg-slate-700 text-white'
                          : rank === 3
                          ? 'bg-amber-900 text-amber-200'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>

                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                      <img
                        src={nominee.photoUrl}
                        alt={nominee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-bold text-white truncate">
                        {nominee.stageName || nominee.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {nominee.category || contest.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-base sm:text-xl font-bold text-white tabular-nums">
                      {nominee.voteCount.toLocaleString()} <span className="text-xs font-normal text-slate-400">votes</span>
                    </p>
                    <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-rose-400 tabular-nums">{percentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 p-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Verified by SteezeVotes • Rooted Steeze Studios Ghana</span>
        </div>
      </footer>
    </div>
  );
};
