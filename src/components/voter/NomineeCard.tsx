import React, { useState } from 'react';
import { Trophy, CheckCircle2, Smartphone, X, Eye, Sparkles } from 'lucide-react';
import { Nominee, Contest } from '../../types';

interface NomineeCardProps {
  nominee: Nominee;
  rank: number;
  totalContestVotes: number;
  contest: Contest;
  lowDataMode: boolean;
  onVoteFree: (nominee: Nominee) => void;
  onVotePaid: (nominee: Nominee) => void;
}

export const NomineeCard: React.FC<NomineeCardProps> = ({
  nominee,
  rank,
  totalContestVotes,
  contest,
  lowDataMode,
  onVoteFree,
  onVotePaid,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const percentage = totalContestVotes > 0 
    ? Math.round((nominee.voteCount / totalContestVotes) * 100) 
    : 0;

  const isLeader = rank === 1 && nominee.voteCount > 0;
  const isClosed = contest.status === 'closed';

  const handleVoteClick = () => {
    if (contest.contestType === 'free') {
      onVoteFree(nominee);
    } else {
      onVotePaid(nominee);
    }
  };

  return (
    <>
      {/* Default / Collapsed Nominee Card */}
      <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        
        <div>
          {!lowDataMode ? (
            <div className="relative w-full overflow-hidden bg-gray-100 flex items-center justify-center min-h-[220px] max-h-[320px]">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-25 blur-md" 
                style={{ backgroundImage: `url(${nominee.photoUrl})` }}
              />
              <img
                src={nominee.photoUrl}
                alt={nominee.stageName || nominee.name}
                className="relative z-10 max-h-[300px] w-full object-contain group-hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              
              {/* Rank badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs flex items-center gap-1 ${
                  isLeader 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-white/90 backdrop-blur-xs text-gray-800'
                }`}>
                  {isLeader && <Trophy className="w-3 h-3" />}
                  #{rank}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                #{rank}
              </span>
              <span className="text-xs font-bold text-gray-800 font-mono">
                Code: {nominee.nomineeCode}
              </span>
            </div>
          )}

          {/* Collapsed Info Area: Only Contestant Name */}
          <div className="p-4 space-y-1">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors leading-tight">
              {nominee.stageName || nominee.name}
            </h3>
            {nominee.stageName && nominee.name !== nominee.stageName && (
              <p className="text-xs text-gray-500">
                {nominee.name}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons: ONLY "Vote Now" and "View" */}
        <div className="p-4 pt-2 border-t border-gray-100 bg-gray-50/50 flex items-center gap-2">
          {isClosed ? (
            <div className="w-full py-2 text-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl">
              Voting Closed
            </div>
          ) : (
            <>
              <button
                onClick={handleVoteClick}
                className="flex-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                {contest.contestType === 'free' ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Smartphone className="w-4 h-4" />
                )}
                Vote Now
              </button>

              <button
                onClick={() => setShowDetailsModal(true)}
                className="py-2.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors shadow-xs flex items-center justify-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
            </>
          )}
        </div>

      </div>

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden text-gray-900 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-100 text-amber-800">
                  {nominee.nomineeCode}
                </span>
                <span className="text-xs font-bold text-gray-500">Rank #{rank}</span>
              </div>

              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Photo & Name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <img
                  src={nominee.photoUrl}
                  alt={nominee.name}
                  className="w-28 h-28 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0"
                />
                <div className="text-center sm:text-left space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {nominee.stageName || nominee.name}
                  </h2>
                  {nominee.stageName && nominee.name !== nominee.stageName && (
                    <p className="text-xs text-gray-500">Real Name: {nominee.name}</p>
                  )}
                  <p className="text-xs font-semibold text-amber-600">
                    Code: <span className="font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{nominee.nomineeCode}</span>
                  </p>
                </div>
              </div>

              {/* Bio / Description */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">About Contestant</span>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {nominee.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Vote Stats if enabled */}
              {contest.showPublicResults && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Total Verified Votes</span>
                    <span className="text-gray-900 font-bold text-sm">{nominee.voteCount.toLocaleString()} votes</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Standing Percentage</span>
                    <span className="text-amber-700 font-bold">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-amber-200 overflow-hidden mt-1">
                    <div 
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Vote Button inside modal */}
              {!isClosed && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleVoteClick();
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {contest.contestType === 'free' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                  {contest.contestType === 'free' ? 'Cast 1 Free Vote' : 'Buy Vote Packages'}
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
};
