import React, { useState } from 'react';
import { Trophy, CheckCircle2, Smartphone, X, Eye, Sparkles, Share2 } from 'lucide-react';
import { Nominee, Contest } from '../../types';

interface NomineeCardProps {
  nominee: Nominee;
  rank: number;
  totalContestVotes: number;
  contest: Contest;
  lowDataMode: boolean;
  onVoteFree: (nominee: Nominee) => void;
  onVotePaid: (nominee: Nominee) => void;
  isDark?: boolean;
}

export const NomineeCard: React.FC<NomineeCardProps> = ({
  nominee,
  rank,
  totalContestVotes,
  contest,
  lowDataMode,
  onVoteFree,
  onVotePaid,
  isDark = true,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const percentage = totalContestVotes > 0 
    ? ((nominee.voteCount / totalContestVotes) * 100).toFixed(1)
    : '0';

  const isLeader = rank === 1 && nominee.voteCount > 0;
  const isSecond = rank === 2 && nominee.voteCount > 0;
  const isThird = rank === 3 && nominee.voteCount > 0;
  const isClosed = contest.status === 'ended' || contest.status === 'settled';

  const handleVoteClick = () => {
    if (contest.contestType === 'free') {
      onVoteFree(nominee);
    } else {
      onVotePaid(nominee);
    }
  };

  return (
    <>
      {/* Clean Minimalist Nominee Card */}
      <div
        className={`group relative rounded-2xl border p-3.5 transition-all duration-200 flex flex-col justify-between hover:shadow-md ${
          isLeader
            ? 'bg-white border-slate-300 ring-1 ring-slate-900/5 shadow-xs'
            : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
        }`}
      >
        <div className="space-y-3">
          {!lowDataMode ? (
            /* 4:5 Portrait Media Ratio */
            <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center group/img">
              <img
                src={nominee.photoUrl}
                alt={nominee.stageName || nominee.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-102"
                loading="lazy"
              />

              {/* Minimal Top Badge Overlay: Rank & Nomination Code */}
              <div className="absolute top-2 inset-x-2 flex items-center justify-between z-20 pointer-events-none">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 shadow-2xs ${
                    isLeader
                      ? 'bg-amber-400 text-slate-950'
                      : isSecond
                      ? 'bg-slate-100 text-slate-800'
                      : isThird
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-900/80 text-white'
                  }`}
                >
                  {isLeader && <Trophy className="w-3 h-3 text-slate-950" />}
                  #{rank}
                </span>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/95 text-slate-900 shadow-2xs border border-slate-200/50">
                  {nominee.votingCode || nominee.nomineeCode}
                </span>
              </div>

              {/* Subtle Category Pill */}
              <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/85 text-white">
                  {nominee.category || contest.category}
                </span>
              </div>
            </div>
          ) : (
            /* Low Data Mode Placeholder */
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-xs font-semibold">
                #{rank}
              </span>
              <span className="text-xs font-mono font-medium text-slate-700">
                {nominee.votingCode || nominee.nomineeCode}
              </span>
            </div>
          )}

          {/* Card Body & Typography */}
          <div className="space-y-1.5 px-0.5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                {nominee.stageName || nominee.name}
              </h3>
              {nominee.stageName && nominee.name !== nominee.stageName && (
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {nominee.name}
                </p>
              )}
            </div>

            {/* Live Vote Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 tabular-nums text-xs">
                  {nominee.voteCount.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">votes</span>
                </span>
                <span className="text-rose-600 font-bold tabular-nums text-xs">
                  {percentage}%
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-rose-600"
                  style={{ width: `${Math.max(Number(percentage), 3)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card Actions: Primary Button + View Details (Strict 44px min touch target) */}
        <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2">
          {isClosed ? (
            <div className="w-full min-h-[44px] py-2 text-center text-xs font-medium text-slate-400 bg-slate-100 rounded-xl flex items-center justify-center">
              Voting Closed
            </div>
          ) : (
            <>
              <button
                onClick={handleVoteClick}
                className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 active:scale-98"
              >
                {contest.contestType === 'free' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                Vote
              </button>

              <button
                onClick={() => setShowDetailsModal(true)}
                aria-label="View nominee details"
                className="min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs flex items-center justify-center shrink-0 active:scale-98"
              >
                <Eye className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Nominee Details / Bio Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90dvh] overflow-y-auto my-auto bg-white text-slate-900 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                  {nominee.nomineeCode}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Rank #{rank}
                </span>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                aria-label="Close modal"
                className="min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Photo & Identity */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="w-24 aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img
                    src={nominee.photoUrl}
                    alt={nominee.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-lg font-bold text-slate-900">
                    {nominee.stageName || nominee.name}
                  </h2>
                  {nominee.stageName && nominee.name !== nominee.stageName && (
                    <p className="text-xs text-slate-500">Full Name: {nominee.name}</p>
                  )}
                  <p className="text-xs text-slate-600">
                    Category: <span className="text-slate-900 font-medium">{nominee.category || contest.category}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Nomination Code: <strong className="font-mono text-slate-900">{nominee.nomineeCode}</strong>
                  </p>
                </div>
              </div>

              {/* About Candidate */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs leading-relaxed text-slate-700">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase tracking-wider">
                  Candidate Bio
                </span>
                <p className="whitespace-pre-wrap">{nominee.bio || 'No candidate bio provided.'}</p>
              </div>

              {/* Standing Progress */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Verified Vote Volume</span>
                  <span className="text-slate-900 font-semibold tabular-nums">{nominee.voteCount.toLocaleString()} votes</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Category Vote Share</span>
                  <span className="text-rose-600 font-bold tabular-nums">{percentage}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-rose-600 rounded-full"
                    style={{ width: `${Math.max(Number(percentage), 3)}%` }}
                  />
                </div>
              </div>

              {/* Direct Vote Button */}
              {!isClosed && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleVoteClick();
                  }}
                  className="w-full min-h-[44px] py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                >
                  {contest.contestType === 'free' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  {contest.contestType === 'free' ? 'Cast 1 Free Verified Vote' : 'Purchase Vote Bundle'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
