import React, { useState } from 'react';
import { Trophy, LayoutGrid, List, Smartphone, CheckCircle2, Award, ChevronUp } from 'lucide-react';
import { Nominee, Contest } from '../../types';

interface LeaderboardViewProps {
  nominees: Nominee[];
  contest: Contest;
  totalVotes: number;
  onVoteAction: (nominee: Nominee) => void;
  isDark?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  nominees,
  contest,
  totalVotes,
  onVoteAction,
  isDark = true,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  const sortedNominees = [...nominees].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="space-y-4">
      {/* View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Live Standings
            </h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Audited
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Total {totalVotes.toLocaleString()} votes cast across {sortedNominees.length} contenders
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Grid
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500">
                <th className="py-3 px-4 font-semibold">Rank</th>
                <th className="py-3 px-4 font-semibold">Candidate</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Code</th>
                <th className="py-3 px-4 font-semibold">Votes &amp; Share</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedNominees.map((nominee, idx) => {
                const rank = idx + 1;
                const percentage = totalVotes > 0 ? ((nominee.voteCount / totalVotes) * 100).toFixed(1) : '0';
                const isLeader = rank === 1 && nominee.voteCount > 0;
                const isSecond = rank === 2;
                const isThird = rank === 3;

                return (
                  <tr
                    key={nominee.id}
                    className={`transition-colors hover:bg-slate-50/50 ${
                      isLeader ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                            isLeader
                              ? 'bg-amber-400 text-slate-950 shadow-2xs'
                              : isSecond
                              ? 'bg-slate-100 text-slate-800'
                              : isThird
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-50 text-slate-500'
                          }`}
                        >
                          {rank}
                        </span>
                        {isLeader && (
                          <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                    </td>

                    {/* Candidate Identity */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={nominee.photoUrl}
                          alt={nominee.stageName || nominee.name}
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-xs truncate">
                            {nominee.stageName || nominee.name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {nominee.category || contest.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Code */}
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="font-mono font-medium text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        {nominee.nomineeCode}
                      </span>
                    </td>

                    {/* Vote Progress & Share */}
                    <td className="py-3 px-4 min-w-[160px] sm:min-w-[200px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900 tabular-nums">
                            {nominee.voteCount.toLocaleString()} votes
                          </span>
                          <span className="font-bold text-rose-600 tabular-nums">
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300 bg-rose-600"
                            style={{ width: `${Math.max(Number(percentage), 3)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onVoteAction(nominee)}
                        className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        {contest.contestType === 'free' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Smartphone className="w-3 h-3" />
                        )}
                        Vote
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {sortedNominees.map((nominee, idx) => {
            const rank = idx + 1;
            const percentage = totalVotes > 0 ? ((nominee.voteCount / totalVotes) * 100).toFixed(1) : '0';
            const isLeader = rank === 1 && nominee.voteCount > 0;

            return (
              <div
                key={nominee.id}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={nominee.photoUrl}
                      alt={nominee.stageName || nominee.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isLeader ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/80 text-white'
                        }`}
                      >
                        #{rank}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                      {nominee.stageName || nominee.name}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-500">
                      Code: {nominee.nomineeCode}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {nominee.voteCount.toLocaleString()}
                      </span>
                      <span className="text-rose-600 font-bold tabular-nums">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${Math.max(Number(percentage), 3)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onVoteAction(nominee)}
                  className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <Smartphone className="w-3 h-3" />
                  Vote
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
