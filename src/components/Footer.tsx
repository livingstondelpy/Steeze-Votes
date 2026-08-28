import React from 'react';
import { Trophy, ShieldCheck, Smartphone, Lock, HelpCircle, Heart, ArrowRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, role?: 'voter' | 'organizer' | 'rss_admin') => void;
  onOpenTrustModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenTrustModal }) => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 mt-auto">
      {/* Upper footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              className="flex items-center gap-2.5 cursor-pointer" 
              onClick={() => onNavigate('home', 'voter')}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Steeze<span className="text-amber-500">Votes</span>
              </span>
            </div>
            
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              Ghana's trusted mobile money voting platform for awards, pageants, campus elections, and entertainment events. Verified votes, instant MoMo payouts, and 100% transparent results.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                <Smartphone className="w-3.5 h-3.5 text-amber-600" /> MTN MoMo
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                <Smartphone className="w-3.5 h-3.5 text-red-600" /> Telecel Cash
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" /> AT Money
              </span>
            </div>
          </div>

          {/* Voters Col */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              For Voters
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('contests', 'voter')}
                  className="hover:text-amber-600 transition-colors text-left"
                >
                  Browse Live Contests
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('my-votes', 'voter')}
                  className="hover:text-amber-600 transition-colors text-left"
                >
                  Check My Vote and Receipts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works', 'voter')}
                  className="hover:text-amber-600 transition-colors text-left"
                >
                  How Voting Works
                </button>
              </li>
            </ul>
          </div>

          {/* Organizers Col */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              For Organizers
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('organizer', 'organizer')}
                  className="text-gray-700 hover:text-amber-600 font-medium transition-colors text-left flex items-center gap-1"
                >
                  Host a Contest <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('organizer', 'organizer')}
                  className="hover:text-amber-600 transition-colors text-left"
                >
                  Organizer Log In
                </button>
              </li>
            </ul>
          </div>

          {/* Security Col */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Trust and Security
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('how-it-works', 'voter')}
                  className="hover:text-amber-600 transition-colors text-left"
                >
                  Vote Integrity Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works', 'voter')}
                  className="hover:text-amber-600 transition-colors text-left"
                >
                  24-Hour Payout Protection
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTrustModal}
                  className="hover:text-amber-600 transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Anti-Fraud Protection
                </button>
              </li>
              <li>
                <span className="text-gray-400 text-xs">
                  Accra, Ghana
                </span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Lower footer */}
      <div className="border-t border-gray-100 bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <span className="font-semibold text-gray-800">Rooted Steeze Studios (RSS)</span>
            <span>•</span>
            <span>Accra, Ghana</span>
          </div>
          <p>© 2026 SteezeVotes. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
