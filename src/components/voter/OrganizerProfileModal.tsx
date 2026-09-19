import React from 'react';
import { X, Building2, Calendar, CheckCircle2, Award, ExternalLink } from 'lucide-react';
import { OrganizerAccount, Contest } from '../../types';
import { store } from '../../lib/store';

interface OrganizerProfileModalProps {
  isOpen?: boolean;
  onClose: () => void;
  organizer?: OrganizerAccount | null;
  contest?: Contest;
  contests?: Contest[];
  onSelectContest?: (slug: string) => void;
}

export const OrganizerProfileModal: React.FC<OrganizerProfileModalProps> = ({
  isOpen = true,
  onClose,
  organizer: propOrganizer,
  contest,
  contests: propContests,
  onSelectContest,
}) => {
  if (isOpen === false) return null;

  const allContests = propContests || store.contests;
  const organizer: OrganizerAccount | null = propOrganizer || (contest ? (store.organizers.find(o => o.id === contest.organizerId) || {
    id: contest.organizerId || 'org-default',
    organizationName: contest.organizerName || 'Verified Organizer',
    email: 'contact@organizer.com',
    contactPhone: '+233 24 000 0000',
    momoNumber: '0240000000',
    momoNetwork: 'MTN',
    status: 'approved',
    createdAt: '2025-01-01',
    bio: 'Official event organizer hosting verified voting contests on SteezeVotes platform.'
  }) : null);

  if (!organizer) return null;

  const orgContests = allContests.filter((c) => c.organizerId === organizer.id && c.status === 'active');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-gray-100 relative my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Area */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 border-2 border-amber-200 overflow-hidden flex items-center justify-center shadow-xs">
            {organizer.profilePictureUrl ? (
              <img
                src={organizer.profilePictureUrl}
                alt={organizer.organizationName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600" />
            )}
          </div>

          <div>
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-bold text-gray-900">{organizer.organizationName}</h2>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Organizer" />
            </div>
            <p className="text-xs text-amber-700 font-medium">Verified Ghanaian Event Organizer</p>
          </div>
        </div>

        {/* Bio Section */}
        <div className="py-4 border-b border-gray-100 space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">About Organizer</h3>
          <p className="text-xs text-gray-700 leading-relaxed">
            {organizer.bio || 'Official event organizer hosting verified voting contests on SteezeVotes platform.'}
          </p>
        </div>

        {/* Active Contests List */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Contests</h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {orgContests.length} Active
            </span>
          </div>

          {orgContests.length === 0 ? (
            <p className="text-xs text-gray-500 py-3 text-center italic">No active contests at the moment.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {orgContests.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (onSelectContest) {
                      onSelectContest(c.slug);
                      onClose();
                    }
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-amber-50/60 border border-gray-200 hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={c.bannerUrl}
                      alt={c.title}
                      className="w-10 aspect-[4/5] rounded-md object-cover bg-slate-200 shrink-0 border border-slate-200"
                    />
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-900 line-clamp-1">
                        {c.title}
                      </h4>
                      <span className="text-[11px] text-gray-500">{c.category}</span>
                    </div>
                  </div>
                  <Award className="w-4 h-4 text-gray-400 group-hover:text-amber-600 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors active:scale-98"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
