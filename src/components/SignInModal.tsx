import React, { useState } from 'react';
import { X, Smartphone, UserCheck, ShieldCheck, ArrowRight, Lock, AlertCircle } from 'lucide-react';
import { store } from '../lib/store';
import { OrganizerAccount } from '../types';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToMyVotes: (phone?: string) => void;
  onNavigateToOrganizer: () => void;
  onOrganizerLogin?: (org: OrganizerAccount) => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
  onNavigateToMyVotes,
  onNavigateToOrganizer,
  onOrganizerLogin,
}) => {
  const [tab, setTab] = useState<'voter' | 'organizer'>('voter');
  const [phone, setPhone] = useState('');
  const [orgEmail, setOrgEmail] = useState('events@rootedsteeze.com');
  const [orgPassword, setOrgPassword] = useState('demo123');
  const [orgError, setOrgError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVoterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    onNavigateToMyVotes(phone);
  };

  const handleOrgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrgError(null);

    const res = store.loginOrganizer(orgEmail, orgPassword);
    if (res.success && res.organizer) {
      if (onOrganizerLogin) {
        onOrganizerLogin(res.organizer);
      }
      onClose();
      onNavigateToOrganizer();
    } else {
      setOrgError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90dvh] overflow-y-auto my-auto text-slate-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Sign In to SteezeVotes</h2>
              <p className="text-xs text-slate-500">Access your voting history or manage your contest</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sign in dialog"
            className="min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center active:scale-98"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="p-2 bg-slate-50 border-b border-slate-100 flex gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setTab('voter')}
            className={`min-h-[44px] flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'voter' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            I am a Voter
          </button>
          <button
            onClick={() => setTab('organizer')}
            className={`min-h-[44px] flex-1 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              tab === 'organizer' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Event Organizer
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6">
          {tab === 'voter' ? (
            <form onSubmit={handleVoterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Enter your Ghana Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                    +233
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="24 123 4567"
                    className="w-full min-h-[44px] pl-14 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  No password required. We check your phone number to load your verified ballots and receipts.
                </p>
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 active:scale-98"
              >
                Look Up My Votes
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              {orgError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{orgError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Organizer Email
                </label>
                <input
                  type="email"
                  required
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  placeholder="events@yourbrand.com"
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={orgPassword}
                  onChange={(e) => setOrgPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 active:scale-98"
              >
                Log In to Organizer Studio
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => { onClose(); onNavigateToOrganizer(); }}
                  className="min-h-[44px] text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center justify-center"
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
