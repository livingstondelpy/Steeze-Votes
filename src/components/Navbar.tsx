import React, { useState } from 'react';
import { 
  Trophy, 
  Search, 
  X,
  Menu,
  Vote,
  Receipt,
  Info,
  ShieldCheck,
  Building2,
  Lock,
  ChevronRight,
  TrendingUp,
  FileCheck,
  DollarSign,
  AlertTriangle,
  Scale,
  Users,
  Sliders,
  Plus,
  Sparkles,
  BarChart3,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { UserRole, OrganizerAccount } from '../types';

export type AdminTab = 'overview' | 'review' | 'payouts' | 'anomalies' | 'disputes' | 'organizers' | 'settings' | 'audit';
export type OrganizerTab = 'dashboard' | 'create' | 'analytics' | 'milestones' | 'profile';

interface NavbarProps {
  currentRole: UserRole;
  activeView: string;
  onNavigate: (view: string, role?: UserRole) => void;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  onOpenSignInModal: () => void;
  onSearch?: (query: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
  // Admin specific props
  isAdminAuthenticated?: boolean;
  activeAdminTab?: AdminTab;
  onSelectAdminTab?: (tab: AdminTab) => void;
  adminBadges?: {
    pendingReviews: number;
    pendingPayouts: number;
    unresolvedAnomalies: number;
  };
  onAdminLogout?: () => void;
  // Organizer specific props
  currentOrganizer?: OrganizerAccount | null;
  activeOrganizerTab?: OrganizerTab;
  onSelectOrganizerTab?: (tab: OrganizerTab) => void;
  onOrganizerLogout?: () => void;
  activeContestId?: string;
  onSelectContest?: (contestId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeView,
  onNavigate,
  onOpenSignInModal,
  onSearch,
  isAdminAuthenticated = false,
  activeAdminTab = 'overview',
  onSelectAdminTab,
  adminBadges = { pendingReviews: 0, pendingPayouts: 0, unresolvedAnomalies: 0 },
  onAdminLogout,
  currentOrganizer,
  activeOrganizerTab = 'dashboard',
  onSelectOrganizerTab,
  onOrganizerLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdminView = (activeView === 'admin' || activeView === 'rss-admin') && isAdminAuthenticated;
  const isOrganizerView = activeView === 'organizer' && !!currentOrganizer;

  const handleNav = (view: string, role: UserRole = 'voter') => {
    setIsMobileMenuOpen(false);
    onNavigate(view, role);
  };

  const handleAdminTabSelect = (tab: AdminTab) => {
    setIsMobileMenuOpen(false);
    if (activeView !== 'admin' && activeView !== 'rss-admin') {
      onNavigate('admin', 'rss_admin');
    }
    if (onSelectAdminTab) {
      onSelectAdminTab(tab);
    }
  };

  const handleOrganizerTabSelect = (tab: OrganizerTab) => {
    setIsMobileMenuOpen(false);
    if (activeView !== 'organizer') {
      onNavigate('organizer', 'organizer');
    }
    if (onSelectOrganizerTab) {
      onSelectOrganizerTab(tab);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    setIsMobileMenuOpen(false);
    handleNav('contests', 'voter');
  };

  const totalAdminBadgeCount = adminBadges.pendingReviews + adminBadges.pendingPayouts + adminBadges.unresolvedAnomalies;

  return (
    <header className={`fixed top-0 inset-x-0 z-50 h-[64px] border-b text-slate-900 shadow-2xs transition-colors ${
      isAdminView 
        ? 'bg-slate-950 border-slate-800 text-white' 
        : isOrganizerView 
          ? 'bg-white border-amber-200/80 text-slate-900' 
          : 'bg-white border-slate-200/90 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full gap-2 sm:gap-6">
          
          {/* =========================================
              1. BRAND LOGO & CONTEXTUAL IDENTITY
             ========================================= */}
          {isAdminView ? (
            /* Admin Context Brand */
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
              onClick={() => handleAdminTabSelect('overview')}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-display font-bold tracking-tight text-white">
                      Steeze<span className="text-rose-500">Admin</span>
                    </span>
                    <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Super Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 hidden xs:block">
                    Rooted Steeze Studios
                  </span>
                </div>
              </div>
            </div>
          ) : isOrganizerView ? (
            /* Organizer Context Brand */
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0"
              onClick={() => handleOrganizerTabSelect('dashboard')}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-display font-bold tracking-tight text-slate-900">
                      Organizer<span className="text-amber-600">Studio</span>
                    </span>
                    <span className="hidden sm:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      MoMo Payouts
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px] sm:max-w-[200px]">
                    {currentOrganizer.organizationName}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Public Voter Context Brand */
            <div 
              className="flex items-center gap-2 cursor-pointer shrink-0" 
              onClick={() => handleNav('home', 'voter')}
            >
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-xs">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-display font-bold tracking-tight text-slate-900">
                  Steeze<span className="text-rose-600">Votes</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  Ghana
                </span>
              </div>
            </div>
          )}

          {/* =========================================
              2. DESKTOP NAVIGATION SHORTCUTS
             ========================================= */}
          {isAdminView ? (
            /* Admin Desktop Header Links */
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleAdminTabSelect('overview')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeAdminTab === 'overview' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                Overview
              </button>

              <button
                onClick={() => handleAdminTabSelect('review')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeAdminTab === 'review' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                Review Queue
                {adminBadges.pendingReviews > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                    {adminBadges.pendingReviews}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleAdminTabSelect('payouts')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeAdminTab === 'payouts' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Payouts
                {adminBadges.pendingPayouts > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold">
                    {adminBadges.pendingPayouts}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleAdminTabSelect('anomalies')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeAdminTab === 'anomalies' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Fraud
                {adminBadges.unresolvedAnomalies > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {adminBadges.unresolvedAnomalies}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleAdminTabSelect('settings')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeAdminTab === 'settings' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Settings
              </button>
            </div>
          ) : isOrganizerView ? (
            /* Organizer Desktop Header Links */
            <div className="hidden lg:flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleOrganizerTabSelect('dashboard')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeOrganizerTab === 'dashboard' ? 'text-amber-900 bg-amber-100 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                Dashboard
              </button>

              <button
                onClick={() => handleOrganizerTabSelect('create')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeOrganizerTab === 'create' ? 'text-amber-900 bg-amber-100 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Create Contest
              </button>

              <button
                onClick={() => handleOrganizerTabSelect('analytics')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeOrganizerTab === 'analytics' ? 'text-amber-900 bg-amber-100 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                Analytics
              </button>

              <button
                onClick={() => handleOrganizerTabSelect('milestones')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeOrganizerTab === 'milestones' ? 'text-amber-900 bg-amber-100 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Milestone Graphics
              </button>

              <button
                onClick={() => handleOrganizerTabSelect('profile')}
                className={`min-h-[38px] text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  activeOrganizerTab === 'profile' ? 'text-amber-900 bg-amber-100 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                Profile &amp; MoMo
              </button>
            </div>
          ) : (
            /* Public Voter Contest Search & Desktop Links */
            <>
              <form 
                onSubmit={handleSearchSubmit} 
                className="flex-1 max-w-xs sm:max-w-md mx-auto relative hidden xs:block"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contests..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </form>

              <div className="hidden md:flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleNav('contests', 'voter')}
                  className={`min-h-[40px] text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                    activeView === 'contests' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Contests
                </button>

                <button
                  onClick={() => handleNav('my-votes', 'voter')}
                  className={`min-h-[40px] text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                    activeView === 'my-votes' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  My Votes
                </button>

                <button
                  onClick={() => handleNav('about', 'voter')}
                  className={`min-h-[40px] text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
                    activeView === 'about' ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  About
                </button>

                <button
                  onClick={onOpenSignInModal}
                  className="min-h-[40px] px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs inline-flex items-center gap-1.5"
                >
                  Sign In
                </button>
              </div>
            </>
          )}

          {/* =========================================
              3. RIGHT ACTIONS & DEDICATED HAMBURGER TOGGLE
             ========================================= */}
          <div className="flex items-center gap-2 shrink-0">
            {isAdminView && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNav('home', 'voter')}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
                  Public Site
                </button>
                {onAdminLogout && (
                  <button
                    onClick={onAdminLogout}
                    className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/50 hover:bg-rose-900 border border-rose-800/40 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                )}
              </div>
            )}

            {isOrganizerView && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => handleNav('home', 'voter')}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                  Public Site
                </button>
                {onOrganizerLogout && (
                  <button
                    onClick={onOrganizerLogout}
                    className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-500" />
                    Log Out
                  </button>
                )}
              </div>
            )}

            {!isAdminView && !isOrganizerView && (
              <div className="flex md:hidden items-center">
                <button
                  onClick={onOpenSignInModal}
                  className="min-h-[40px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs mr-1.5"
                >
                  Sign In
                </button>
              </div>
            )}

            {/* DEDICATED HAMBURGER TOGGLE BUTTON */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`min-h-[44px] min-w-[44px] px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-colors relative shadow-2xs ${
                isAdminView
                  ? 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                  : isOrganizerView
                    ? 'bg-amber-500/10 border-amber-300 text-amber-900 hover:bg-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              aria-label="Toggle Portal Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <>
                  <Menu className="w-5 h-5" />
                  {isAdminView && totalAdminBadgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-slate-950">
                      {totalAdminBadgeCount}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* =========================================================================
          HAMBURGER MENU DRAWERS - SPECIFIC TO CURRENT PORTAL CONTEXT
         ========================================================================= */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-x-0 top-[64px] bottom-0 bg-black/50 backdrop-blur-xs z-50 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className={`shadow-2xl p-4 sm:p-6 space-y-5 max-h-[88vh] overflow-y-auto ${
              isAdminView 
                ? 'bg-slate-950 border-b border-slate-800 text-white' 
                : isOrganizerView 
                  ? 'bg-white border-b border-amber-200 text-slate-900' 
                  : 'bg-white border-b border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >

            {/* =======================================================
                A. DEDICATED ADMIN PORTAL HAMBURGER MENU
               ======================================================= */}
            {isAdminView && (
              <div className="space-y-4">
                {/* Admin Header Banner */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Rooted Steeze Master Admin</h3>
                      <p className="text-[11px] text-slate-400">Supervisory control panel &amp; integrity tools</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live System Active
                  </span>
                </div>

                {/* Admin Navigation Features List */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Administrative Modules
                  </div>

                  <button
                    onClick={() => handleAdminTabSelect('overview')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'overview' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <span className="block font-bold">1. Platform Overview</span>
                        <span className="block text-[10px] text-slate-400 font-normal">GMV, payouts, commissions, reconcile</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('review')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'review' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <div className="text-left">
                        <span className="block font-bold">2. Contest Review Queue</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Approve / Reject new awards</span>
                      </div>
                    </div>
                    {adminBadges.pendingReviews > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
                        {adminBadges.pendingReviews} Pending
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('payouts')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'payouts' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <span className="block font-bold">3. Mobile Money Payout Requests</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Disbursement queue &amp; reference notes</span>
                      </div>
                    </div>
                    {adminBadges.pendingPayouts > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">
                        {adminBadges.pendingPayouts} Pending
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('anomalies')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'anomalies' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <span className="block font-bold">4. Fraud &amp; Spike Anomalies</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Velocity alerts &amp; rate limit trips</span>
                      </div>
                    </div>
                    {adminBadges.unresolvedAnomalies > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                        {adminBadges.unresolvedAnomalies} Alerts
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    )}
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('disputes')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'disputes' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <div className="text-left">
                        <span className="block font-bold">5. Escrow &amp; Contest Controls</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Emergency freeze, dispute lock, release</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('organizers')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'organizers' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <div className="text-left">
                        <span className="block font-bold">6. Organizers &amp; MoMo Wallets</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Verified accounts &amp; phone records</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('settings')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'settings' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sliders className="w-4 h-4 text-purple-400" />
                      <div className="text-left">
                        <span className="block font-bold">7. Platform Controls &amp; Settings</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Maintenance mode, fee split (10/90), caps</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => handleAdminTabSelect('audit')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'audit' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <span className="block font-bold">8. Audit &amp; Verification Log</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Immutable SHA-256 cryptographic logs</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                {/* Admin Quick Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleNav('home', 'voter')}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-400" />
                    Exit to Public Voter Home
                  </button>
                  {onAdminLogout && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onAdminLogout();
                      }}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-2xs"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out Super Admin
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* =======================================================
                B. DEDICATED ORGANIZER PORTAL HAMBURGER MENU
               ======================================================= */}
            {isOrganizerView && (
              <div className="space-y-4">
                {/* Organizer Header Banner */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{currentOrganizer.organizationName}</h3>
                      <p className="text-xs text-amber-800 font-medium">
                        {currentOrganizer.momoNetwork} MoMo: <span className="font-mono">{currentOrganizer.momoNumber}</span>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                  </span>
                </div>

                {/* Organizer Navigation Features List */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Organizer Features
                  </div>

                  <button
                    onClick={() => handleOrganizerTabSelect('dashboard')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeOrganizerTab === 'dashboard' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4 text-amber-600" />
                      <div className="text-left">
                        <span className="block font-bold">1. Live Dashboard &amp; Leaderboard</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Real-time vote counts, earnings, &amp; PDF certificate</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleOrganizerTabSelect('create')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeOrganizerTab === 'create' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <div className="text-left">
                        <span className="block font-bold">2. Create New Contest</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Setup 4:5 flyer, categories, bundle tiers</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleOrganizerTabSelect('analytics')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeOrganizerTab === 'analytics' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div className="text-left">
                        <span className="block font-bold">3. Analytics &amp; Reports</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Daily breakdown &amp; top anonymous supporters</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleOrganizerTabSelect('milestones')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeOrganizerTab === 'milestones' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <div className="text-left">
                        <span className="block font-bold">4. Social Milestone Graphics</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Generate 4:5 story cards for IG &amp; WhatsApp</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleOrganizerTabSelect('profile')}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeOrganizerTab === 'profile' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-rose-600" />
                      <div className="text-left">
                        <span className="block font-bold">5. Organization Profile &amp; MoMo Wallet</span>
                        <span className="block text-[10px] text-slate-500 font-normal">Public bio, logo, payout phone number</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Organizer Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleNav('home', 'voter')}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-500" />
                    Back to Public Voter Site
                  </button>
                  {onOrganizerLogout && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOrganizerLogout();
                      }}
                      className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors border border-rose-200"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      Log Out Organizer
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* =======================================================
                C. PUBLIC VOTER PORTAL HAMBURGER MENU
               ======================================================= */}
            {!isAdminView && !isOrganizerView && (
              <div className="space-y-4">
                {/* Mobile Search input */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search contests, nominees..."
                    className="w-full pl-9 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
                  />
                </form>

                {/* Public Navigation */}
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Public Portals
                  </div>
                  <button
                    onClick={() => handleNav('home', 'voter')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'home' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-4 h-4 text-rose-500" />
                      <span>Home</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNav('contests', 'voter')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'contests' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Vote className="w-4 h-4 text-slate-500" />
                      <span>Browse Contests &amp; Ballots</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNav('my-votes', 'voter')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'my-votes' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4 text-emerald-500" />
                      <span>My Votes &amp; Receipts</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNav('about', 'voter')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'about' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>About SteezeVotes</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNav('explainer', 'voter')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'explainer' ? 'bg-rose-50 text-rose-600' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      <span>Security &amp; Integrity</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Portal Switcher for Organizers and Admins */}
                <div className="space-y-1 pt-3 border-t border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                    Management Portals
                  </div>

                  <button
                    onClick={() => handleNav('organizer', 'organizer')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'organizer' ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>Organizer Studio Portal</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleNav('admin', 'rss_admin')}
                    className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between transition-colors ${
                      activeView === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-rose-500" />
                      <span>RSS Admin Console</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
};
