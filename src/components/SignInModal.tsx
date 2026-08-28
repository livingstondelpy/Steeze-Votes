import React, { useState } from 'react';
import { X, Smartphone, UserCheck, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMyVotes: (phone?: string) => void;
  onNavigateToOrganizer: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onNavigateToMyVotes,
  onNavigateToOrganizer,
}) => {
  const [tab, setTab] = useState<'voter' | 'organizer'>('voter');
  const [phone, setPhone] = useState('');
  const [orgEmail, setOrgEmail] = useState('');

  if (!isOpen) return null;

  const handleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onNavigateToMyVotes(phone);
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onNavigateToOrganizer();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full overflow-hidden text-gray-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Sign In to SteezeVotes</h2>
              <p className="text-xs text-gray-500">Access your voting history or manage your contest</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-2 bg-gray-50 border-b border-gray-100 flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setTab('voter')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'voter' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            I am a Voter
          </button>
          <button
            onClick={() => setTab('organizer')}
            className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'organizer' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            I am an Event Organizer
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {tab === 'voter' ? (
            <form onSubmit={handleVoterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Enter your Ghana Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                    +233
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="24 123 4567"
                    className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  No password required. We check your phone number to load your verified ballots and receipts.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                Look Up My Votes
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Organizer Email
                </label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="events@yourbrand.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="demo123"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                Open Organizer Studio
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateToOrganizer(); }}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Need to host a new contest? Create an account here
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
