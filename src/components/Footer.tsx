import React from 'react';
import { Trophy, ShieldCheck, Smartphone, Lock, HelpCircle, Heart, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, role?: 'voter' | 'organizer' | 'rss_admin') => void;
  onOpenTrustModal: () => void;
  isDark?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTrustModal, isDark = false }) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 mt-auto">
      {/* Upper footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => onNavigate('home', 'voter')}
            >
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-2xs">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Steeze<span className="text-rose-600">Votes</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Ghana&apos;s verified voting platform for awards and pageants. Secure Mobile Money checkout (MTN MoMo, Telecel Cash, AT Money) with instant digital receipts and public standings.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-600">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" /> MTN MoMo
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                <Smartphone className="w-3.5 h-3.5 text-rose-600" /> Telecel Cash
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" /> AT Money
              </span>
            </div>
          </div>

          {/* Information & Voters Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              SteezeVotes
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about', 'voter')}
                  className="text-slate-500 hover:text-slate-900 transition-colors text-left"
                >
                  About SteezeVotes
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contests', 'voter')}
                  className="text-slate-500 hover:text-slate-900 transition-colors text-left"
                >
                  Active Contests
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-votes', 'voter')}
                  className="text-slate-500 hover:text-slate-900 transition-colors text-left"
                >
                  Check My Votes
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Verification Col */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Trust &amp; Verification
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('about', 'voter')}
                  className="text-slate-500 hover:text-slate-900 transition-colors text-left"
                >
                  Verified by SteezeVotes
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrustModal}
                  className="text-slate-500 hover:text-slate-900 transition-colors text-left"
                >
                  Verification System
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrustModal}
                  className="text-slate-500 hover:text-slate-900 transition-colors text-left"
                >
                  Anti-Fraud Ledger
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Low-visibility Organizer Link ONLY */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SteezeVotes Ghana. Powered by Rooted Steeze Studios (RSS).</p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onNavigate('organizer', 'organizer')}
              className="text-slate-400 hover:text-slate-600 transition-colors text-[11px]"
            >
              Organizer Access
            </button>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" /> Verified Voting
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
