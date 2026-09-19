import React, { useState, useEffect, useRef } from 'react';
import { Trophy, ChevronLeft, ChevronRight, Smartphone, ArrowRight, Eye } from 'lucide-react';
import { Nominee, Contest } from '../../types';

interface FeaturedNomineesCarouselProps {
  nominees: Nominee[];
  contests: Contest[];
  onVoteAction: (nominee: Nominee, contest: Contest) => void;
  onViewDetails?: (nominee: Nominee, contest: Contest) => void;
  isDark?: boolean;
}

export const FeaturedNomineesCarousel: React.FC<FeaturedNomineesCarouselProps> = ({
  nominees,
  contests,
  onVoteAction,
  onViewDetails,
  isDark = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Pick the top candidates across active contests (up to 7 front-runners)
  const featuredNominees = nominees
    .filter((n) => {
      const contest = contests.find((c) => c.id === n.contestId);
      return contest && contest.status === 'active';
    })
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 7);

  // Auto-advance carousel smoothly if user is not actively interacting
  useEffect(() => {
    if (featuredNominees.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredNominees.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredNominees.length]);

  if (featuredNominees.length === 0) return null;

  const currentNominee = featuredNominees[activeIndex];
  const currentContest = contests.find((c) => c.id === currentNominee.contestId) || contests[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + featuredNominees.length) % featuredNominees.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredNominees.length);
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 mb-0.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Front-Runners</span>
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-slate-900 tracking-tight">
              Leading Candidates
            </h2>
            <p className="text-xs text-slate-500">
              Top verified contenders currently leading public polls.
            </p>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              aria-label="Previous nominee"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next nominee"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Stage with explicit height and safe padding to prevent overflow collision */}
        <div 
          className="relative h-[440px] sm:h-[460px] flex items-center justify-center my-2 select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {featuredNominees.map((nominee, idx) => {
            const contest = contests.find((c) => c.id === nominee.contestId) || currentContest;
            const position = (idx - activeIndex + featuredNominees.length) % featuredNominees.length;
            
            // Determine relative position
            let isCenter = false;
            let isLeft = false;
            let isRight = false;
            let isHidden = false;

            if (position === 0) {
              isCenter = true;
            } else if (position === 1 || (position === -1 + featuredNominees.length && featuredNominees.length === 2)) {
              isRight = true;
            } else if (position === featuredNominees.length - 1) {
              isLeft = true;
            } else {
              isHidden = true;
            }

            if (isHidden) return null;

            return (
              <div
                key={nominee.id}
                onClick={() => {
                  if (!isCenter) setActiveIndex(idx);
                }}
                className={`absolute transition-all duration-300 ease-out ${
                  isCenter
                    ? 'z-30 scale-100 opacity-100 translate-x-0 cursor-default'
                    : isLeft
                    ? 'hidden sm:block z-10 scale-90 opacity-40 -translate-x-[60%] lg:-translate-x-[75%] cursor-pointer hover:opacity-70'
                    : 'hidden sm:block z-10 scale-90 opacity-40 translate-x-[60%] lg:translate-x-[75%] cursor-pointer hover:opacity-70'
                }`}
                style={{
                  width: 'min(300px, 86vw)',
                }}
              >
                <div
                  className={`rounded-2xl overflow-hidden border p-3.5 transition-all duration-200 ${
                    isCenter
                      ? 'bg-white border-slate-300 shadow-lg ring-1 ring-slate-900/5'
                      : 'bg-white/90 border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Portrait Media Frame */}
                  <div className="relative aspect-[4/5] w-full rounded-xl overflow-hidden bg-slate-100 mb-2.5 group">
                    <img
                      src={nominee.photoUrl}
                      alt={nominee.stageName || nominee.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 inset-x-2 flex items-center justify-between z-20">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 text-slate-900 shadow-2xs flex items-center gap-1 border border-slate-100">
                        <Trophy className="w-3 h-3 text-amber-500" />
                        Rank #{idx + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-900/85 text-white shadow-2xs">
                        {nominee.nomineeCode}
                      </span>
                    </div>

                    {/* Minimal Bottom gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-2.5 inset-x-2.5 z-20 text-white space-y-0.5">
                      <span className="text-[10px] font-medium text-rose-300 block truncate">
                        {contest.title}
                      </span>
                      <h3 className="text-sm sm:text-base font-display font-bold truncate">
                        {nominee.stageName || nominee.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        <span className="text-slate-300 text-[10px]">Verified Standing</span>
                        <span className="font-bold text-white tabular-nums text-xs">
                          {nominee.voteCount.toLocaleString()} votes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for Center Card */}
                  {isCenter ? (
                    <div className="space-y-1.5 pt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onVoteAction(nominee, contest);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        Vote For {nominee.stageName || nominee.name}
                      </button>

                      {onViewDetails && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(nominee, contest);
                          }}
                          className="w-full py-1 text-center text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
                        >
                          Enter Contest Ballot <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-1 text-center text-[11px] font-medium text-slate-400">
                      Tap to view #{idx + 1}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Dot Selector */}
        <div className="flex items-center justify-center gap-1.5 mt-3 mb-1">
          {featuredNominees.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveIndex(dotIdx)}
              aria-label={`Slide to nominee ${dotIdx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                dotIdx === activeIndex
                  ? 'w-6 bg-slate-900'
                  : 'w-1.5 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
};
