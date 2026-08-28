import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  ShieldCheck, 
  Menu, 
  X, 
  Zap, 
  ChevronDown, 
  HelpCircle,
  Lock,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  activeView: string;
  onNavigate: (view: string, role?: UserRole) => void;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  onOpenSignInModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onNavigate,
  lowDataMode,
  setLowDataMode,
  onOpenSignInModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string, role: UserRole = 'voter') => {
    onNavigate(view, role);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 border-b border-gray-200/80 backdrop-blur-md text-gray-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand — Clean light logo */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer" 
            onClick={() => handleNav('home', 'voter')}
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Trophy className="w-5 h-5 font-bold" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-gray-900">
                  Steeze<span className="text-amber-500">Votes</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                  GH
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium -mt-0.5">
                By Rooted Steeze Studios
              </span>
            </div>
          </div>

          {/* Center Navigation Links — 3 Clean Voter-First Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('contests', 'voter')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'contests' || activeView === 'contest-detail'
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Live Contests
            </button>

            <button
              onClick={() => handleNav('how-it-works', 'voter')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'how-it-works' || activeView === 'explainer'
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => handleNav('my-votes', 'voter')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === 'my-votes'
                  ? 'bg-amber-50 text-amber-700 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Check My Vote
            </button>
          </nav>

          {/* Right Action Tools: Low-Data Toggle + Small Sign In Link */}
          <div className="flex items-center gap-3">
            {/* Low Data Mode Toggle (Essential for Ghanaian mobile speeds) */}
            <button
              onClick={() => setLowDataMode(!lowDataMode)}
              title="Optimize for low mobile data and 2G/3G speeds"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                lowDataMode
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${lowDataMode ? 'text-emerald-600 fill-emerald-600' : 'text-gray-400'}`} />
              <span>{lowDataMode ? 'Low Data: ON' : 'Low Data Mode'}</span>
            </button>

            {/* Clean, discreet Sign In text button */}
            <button
              onClick={onOpenSignInModal}
              className="px-3.5 py-2 text-sm font-medium text-gray-700 hover:text-amber-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Sign In
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <button
            onClick={() => handleNav('home', 'voter')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'home' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => handleNav('contests', 'voter')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'contests' || activeView === 'contest-detail' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700'
            }`}
          >
            Live Contests
          </button>

          <button
            onClick={() => handleNav('how-it-works', 'voter')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'how-it-works' || activeView === 'explainer' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700'
            }`}
          >
            How It Works
          </button>

          <button
            onClick={() => handleNav('my-votes', 'voter')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeView === 'my-votes' ? 'bg-amber-50 text-amber-700 font-semibold' : 'text-gray-700'
            }`}
          >
            Check My Vote & Receipts
          </button>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setLowDataMode(!lowDataMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border ${
                lowDataMode
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{lowDataMode ? 'Low Data: ON' : 'Enable Low Data'}</span>
            </button>

            <button
              onClick={() => { setMobileMenuOpen(false); onOpenSignInModal(); }}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700"
            >
              Sign In / Organizer Access
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
