import React from 'react';
import { Trophy, CheckCircle2, TrendingUp, Sparkles, Smartphone, ChevronRight } from 'lucide-react';
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
  const percentage = totalContestVotes > 0 
    ? Math.round((nominee.voteCount / totalContestVotes) * 100) 
    : 0;

  const isLeader = rank === 1 && nominee.voteCount > 0;
  const isClosed = contest.status === 'closed';

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-amber-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      
      {/* Top Media / Header Area */}
      <div>
        {!lowDataMode ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
            <img
              src={nominee.photoUrl}
              alt={nominee.stageName || nominee.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
            
            {/* Rank badge */}
            <div className="absolute top-3 left-3">
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold shadow-xs flex items-center gap-1 ${
                isLeader 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-white/90 backdrop-blur-xs text-gray-800'
              }`}>
                {isLeader && <Trophy className="w-3 h-3" />}
                #{rank}
              </span>
            </div>

            {/* Nominee Code Badge */}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-gray-900/80 backdrop-blur-xs text-white shadow-xs">
                {nominee.nomineeCode}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                #{rank}
              </span>
              <span className="text-xs font-bold text-gray-800">
                Code: {nominee.nomineeCode}
              </span>
            </div>
            {isLeader && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Leading
              </span>
            )}
          </div>
        )}

        {/* Info Area */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-amber-600 transition-colors leading-tight">
              {nominee.stageName || nominee.name}
            </h3>
            {nominee.stageName && nominee.name !== nominee.stageName && (
              <p className="text-xs text-gray-500 mt-0.5">
                {nominee.name}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {nominee.bio}
          </p>

          {/* Standings bar if public results are enabled */}
          {contest.showPublicResults && (
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-900 font-bold">
                  {nominee.voteCount.toLocaleString()} votes
                </span>
                <span className="text-amber-700 font-semibold">
                  {percentage}%
                </span>
              </div>
              
              <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(percentage, 3)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="p-4 pt-0 border-t border-gray-100 mt-2 bg-gray-50/50 flex flex-col gap-2">
        {isClosed ? (
          <div className="py-2.5 text-center text-xs font-semibold text-gray-500 bg-gray-100 rounded-xl">
            Voting Closed
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => onVoteFree(nominee)}
              className="py-2.5 px-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-800 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              1 Free Vote
            </button>

            <button
              onClick={() => onVotePaid(nominee)}
              className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Buy MoMo Votes
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
