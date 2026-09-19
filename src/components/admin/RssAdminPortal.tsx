import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Scale, 
  DollarSign, 
  Users, 
  Trophy, 
  RefreshCw, 
  Search, 
  Eye, 
  Flame,
  FileCheck,
  Smartphone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  ArrowLeft,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { Contest, Nominee, OrganizerAccount, AnomalyAlert, Transaction, VoteRecord, PayoutRequest, PayoutStatus } from '../../types';
import { store } from '../../lib/store';

interface RssAdminPortalProps {
  contests: Contest[];
  nominees: Nominee[];
  organizers: OrganizerAccount[];
  transactions: Transaction[];
  votes: VoteRecord[];
  anomalies: AnomalyAlert[];
  payoutRequests?: PayoutRequest[];
  onSelectContestForPreview: (contestId: string) => void;
  onBackToHome?: () => void;
  onLogout?: () => void;
  activeAdminTab?: 'overview' | 'review' | 'payouts' | 'anomalies' | 'disputes' | 'organizers' | 'settings' | 'audit';
  onTabChange?: (tab: 'overview' | 'review' | 'payouts' | 'anomalies' | 'disputes' | 'organizers' | 'settings' | 'audit') => void;
}

export const RssAdminPortal: React.FC<RssAdminPortalProps> = ({
  contests,
  nominees,
  organizers,
  transactions,
  votes,
  anomalies,
  payoutRequests = [],
  onSelectContestForPreview,
  onBackToHome,
  onLogout,
  activeAdminTab: propActiveAdminTab,
  onTabChange,
}) => {
  const [localActiveAdminTab, setLocalActiveAdminTab] = useState<'overview' | 'review' | 'payouts' | 'anomalies' | 'disputes' | 'organizers' | 'settings' | 'audit'>('overview');
  const activeAdminTab = propActiveAdminTab || localActiveAdminTab;

  const setActiveAdminTab = (tab: 'overview' | 'review' | 'payouts' | 'anomalies' | 'disputes' | 'organizers' | 'settings' | 'audit') => {
    setLocalActiveAdminTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [anomalyResolutionNote, setAnomalyResolutionNote] = useState('');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<{ [key: string]: string }>({});
  const [reconcileTxId, setReconcileTxId] = useState('');
  const [reconcileMsg, setReconcileMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Payout management state
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'pending' | 'processing' | 'paid' | 'held'>('all');
  const [payoutRefInputs, setPayoutRefInputs] = useState<{ [id: string]: string }>({});
  const [payoutNoteInputs, setPayoutNoteInputs] = useState<{ [id: string]: string }>({});

  // System settings state from store
  const systemSettings = store.systemSettings;

  // Pending contests review queue
  const pendingContests = contests.filter((c) => c.status === 'pending_review');

  // Payout calculations
  const pendingPayouts = payoutRequests.filter((p) => p.status === 'pending');
  const totalDisbursedGhs = payoutRequests
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.netPayoutGhs, 0);
  const totalPendingPayoutsGhs = pendingPayouts.reduce((sum, p) => sum + p.netPayoutGhs, 0);

  const handleUpdatePayout = (payoutId: string, status: PayoutStatus) => {
    const ref = payoutRefInputs[payoutId] || undefined;
    const note = payoutNoteInputs[payoutId] || undefined;
    store.updatePayoutStatus(payoutId, status, ref, note);
    alert(`Payout request status updated to "${status.toUpperCase()}".`);
  };

  // Platform wide metrics calculation
  const totalPlatformPaidGmv = transactions
    .filter((t) => t.status === 'success')
    .reduce((sum, t) => sum + t.amountGhs, 0);

  const totalRssCommissionGhs = +(totalPlatformPaidGmv * 0.10).toFixed(2); // 10% platform take
  const totalOrganizerPayoutsGhs = +(totalPlatformPaidGmv * 0.90).toFixed(2); // 90% organizer take
  const totalPlatformVotes = votes.reduce((sum, v) => sum + v.voteCount, 0);
  const unresolvedAnomalies = anomalies.filter((a) => !a.resolved);

  const handleResolveAnomaly = (anomalyId: string) => {
    if (!anomalyResolutionNote.trim()) return;
    store.resolveAnomaly(anomalyId, anomalyResolutionNote);
    setAnomalyResolutionNote('');
    setSelectedAnomalyId(null);
  };

  const handleFreezeContest = (contestId: string) => {
    store.freezeContest(contestId);
  };

  const handleUnfreezeContest = (contestId: string) => {
    store.unfreezeContest(contestId);
  };

  const handleReleaseEscrow = (contestId: string) => {
    if (window.confirm('Are you sure you want to release escrow funds to the organizer?')) {
      store.releaseEscrow(contestId);
    }
  };

  const handleSuspendContest = (contestId: string) => {
    if (window.confirm('Are you sure you want to suspend this contest due to confirmed abuse?')) {
      store.suspendContest(contestId);
    }
  };

  const handleApproveContest = (contestId: string) => {
    store.approveContest(contestId);
  };

  const handleRejectContest = (contestId: string) => {
    const reason = rejectReasonInput[contestId] || 'Content did not meet platform safety or branding guidelines.';
    store.rejectContest(contestId, reason);
  };

  const handleManualReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileTxId.trim()) return;
    const res = store.reconcilePayment(reconcileTxId.trim());
    setReconcileMsg(res);
    setReconcileTxId('');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-6 sm:py-8 pb-28 sm:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="space-y-1">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="min-h-[44px] inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-1"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Rooted Steeze Studios Master Admin
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Super Admin Access
              </span>
            </div>
            <p className="text-xs text-slate-500">
              RSS Admin control panel: approve contests, check platform earnings, monitor fraud alerts, and manage settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-2xs inline-flex items-center justify-center active:scale-98"
              >
                Log Out Admin
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs & In-Portal Admin Hamburger Menu */}
        <div className="flex items-center justify-between gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap flex-1">
            <button
              onClick={() => setActiveAdminTab('overview')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'overview'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Platform Overview
            </button>

            <button
              onClick={() => setActiveAdminTab('review')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'review'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Review Queue
              {pendingContests.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeAdminTab === 'review' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-800'}`}>
                  {pendingContests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('payouts')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'payouts'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Payout Requests
              {pendingPayouts.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeAdminTab === 'payouts' ? 'bg-white text-rose-600' : 'bg-emerald-100 text-emerald-800'}`}>
                  {pendingPayouts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('anomalies')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'anomalies'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Fraud &amp; Spikes
              {unresolvedAnomalies.length > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeAdminTab === 'anomalies' ? 'bg-white text-rose-600' : 'bg-rose-100 text-rose-800'}`}>
                  {unresolvedAnomalies.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAdminTab('disputes')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'disputes'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Scale className="w-4 h-4" /> Escrow &amp; Contests
            </button>

            <button
              onClick={() => setActiveAdminTab('organizers')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'organizers'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" /> Organizers &amp; MoMo
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-4 h-4" /> Platform Controls
            </button>

            <button
              onClick={() => setActiveAdminTab('audit')}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                activeAdminTab === 'audit'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Audit &amp; Logs
            </button>
          </div>

          {/* Dedicated In-Portal Admin Hamburger Menu Button */}
          <button
            onClick={() => setIsAdminDrawerOpen(!isAdminDrawerOpen)}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 relative shadow-2xs"
            title="Open Admin Features Menu"
            aria-label="Toggle Admin Features Menu"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Menu</span>
            {(pendingContests.length + pendingPayouts.length + unresolvedAnomalies.length) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingContests.length + pendingPayouts.length + unresolvedAnomalies.length}
              </span>
            )}
          </button>
        </div>

        {/* Admin In-Portal Drawer / Hamburger Sheet */}
        {isAdminDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-end animate-fade-in"
            onClick={() => setIsAdminDrawerOpen(false)}
          >
            <div 
              className="w-full max-w-sm bg-slate-950 text-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto border-l border-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Super Admin Menu</h3>
                      <p className="text-[11px] text-slate-400">Rooted Steeze Studios</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAdminDrawerOpen(false)}
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Admin Features List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Administrative Modules
                  </div>

                  <button
                    onClick={() => {
                      setActiveAdminTab('overview');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'overview' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <span className="block font-bold">1. Platform Overview</span>
                        <span className="block text-[10px] text-slate-400 font-normal">GMV, gross volume, reconciliation</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('review');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'review' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <div className="text-left">
                        <span className="block font-bold">2. Contest Review Queue</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Approve / reject pending submissions</span>
                      </div>
                    </div>
                    {pendingContests.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
                        {pendingContests.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('payouts');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'payouts' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <span className="block font-bold">3. Mobile Money Payouts</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Organizer withdrawal requests</span>
                      </div>
                    </div>
                    {pendingPayouts.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold">
                        {pendingPayouts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('anomalies');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'anomalies' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <span className="block font-bold">4. Fraud &amp; Spike Alerts</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Velocity triggers &amp; anomaly audits</span>
                      </div>
                    </div>
                    {unresolvedAnomalies.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                        {unresolvedAnomalies.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('disputes');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'disputes' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scale className="w-4 h-4 text-amber-400" />
                      <div className="text-left">
                        <span className="block font-bold">5. Escrow &amp; Contest Controls</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Freeze, lock, dispute resolution</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('organizers');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'organizers' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <div className="text-left">
                        <span className="block font-bold">6. Organizers &amp; MoMo</span>
                        <span className="block text-[10px] text-slate-400 font-normal">KYC, phone records &amp; fee splits</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('settings');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'settings' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-purple-400" />
                      <div className="text-left">
                        <span className="block font-bold">7. System Settings</span>
                        <span className="block text-[10px] text-slate-400 font-normal">Commission rates &amp; platform caps</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveAdminTab('audit');
                      setIsAdminDrawerOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      activeAdminTab === 'audit' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <span className="block font-bold">8. Audit &amp; Verification</span>
                        <span className="block text-[10px] text-slate-400 font-normal">SHA-256 cryptographic proof log</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                {onBackToHome && (
                  <button
                    onClick={() => {
                      setIsAdminDrawerOpen(false);
                      onBackToHome();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Public Voter Site
                  </button>
                )}

                {onLogout && (
                  <button
                    onClick={() => {
                      setIsAdminDrawerOpen(false);
                      onLogout();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out Super Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Gross Volume (GMV)</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">GHS {totalPlatformPaidGmv.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">{transactions.length} total transactions</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">RSS 10% Fee Earned</span>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">GHS {totalRssCommissionGhs.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">Net 10% platform commission</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified Ballots</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{totalPlatformVotes.toLocaleString()}</p>
                <p className="text-[11px] text-slate-500 truncate">{votes.length} unique voter records</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Active Contests</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{contests.length}</p>
                <p className="text-[11px] text-slate-500 truncate">{organizers.length} registered organizers</p>
              </div>

            </div>

            {/* Contests Management Overview Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Platform Contests Status
                </h3>
                <span className="text-xs text-slate-500 font-medium">{contests.length} total registered</span>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="p-3">Contest Title</th>
                      <th className="p-3">Organizer</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Gross Sales</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contests.map((c) => {
                      const cTxs = transactions.filter((t) => t.contestId === c.id && t.status === 'success');
                      const gmv = cTxs.reduce((sum, t) => sum + t.amountGhs, 0);

                      return (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="p-3">
                            <span className="font-bold text-gray-900 block">{c.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {c.id}</span>
                          </td>
                          <td className="p-3 font-medium text-gray-800">{c.organizerName}</td>
                          <td className="p-3 text-gray-600">{c.category}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'frozen'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {c.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-900">GHS {gmv.toFixed(2)}</td>
                          <td className="p-3 space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => onSelectContestForPreview(c.id)}
                              className="text-amber-700 hover:text-amber-800 font-semibold"
                            >
                              Preview
                            </button>
                            {c.status === 'active' ? (
                              <button
                                onClick={() => handleFreezeContest(c.id)}
                                className="text-red-600 hover:text-red-700 font-semibold"
                              >
                                Freeze
                              </button>
                            ) : c.status === 'frozen' ? (
                              <button
                                onClick={() => handleUnfreezeContest(c.id)}
                                className="text-emerald-600 hover:text-emerald-700 font-semibold"
                              >
                                Unfreeze
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ANOMALIES */}
        {activeAdminTab === 'anomalies' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Fraud & Velocity Alerts</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automated surveillance detecting abnormal voting bursts, suspicious IP clusters, or OTP velocity.</p>
            </div>

            {anomalies.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">No anomalies detected</p>
                <p className="text-xs text-slate-500">All voting velocity patterns are within normal statistical boundaries.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anomalies.map((a) => (
                  <div
                    key={a.id}
                    className={`p-4 sm:p-5 rounded-2xl border ${
                      a.resolved
                        ? 'bg-slate-50 border-slate-200 opacity-75'
                        : 'bg-amber-50/60 border-amber-300'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            a.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {a.severity.toUpperCase()} SEVERITY
                          </span>
                          <span className="text-xs font-bold text-slate-900">{a.nomineeName || 'Nominee Alert'}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5">{a.reason}</p>
                      </div>

                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(a.detectedAt || Date.now()).toLocaleTimeString('en-GB')}
                      </span>
                    </div>

                    {!a.resolved ? (
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <input
                          type="text"
                          placeholder="Add investigation resolution note..."
                          value={selectedAnomalyId === a.id ? anomalyResolutionNote : ''}
                          onChange={(e) => {
                            setSelectedAnomalyId(a.id);
                            setAnomalyResolutionNote(e.target.value);
                          }}
                          className="min-h-[44px] flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleResolveAnomaly(a.id)}
                          className="min-h-[44px] px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-2xs inline-flex items-center justify-center active:scale-98"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <strong>Resolved:</strong> {a.actionTaken || 'Verified legitimate activity.'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: REVIEW QUEUE */}
        {activeAdminTab === 'review' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Pending Contest Review Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Content Moderation: Review organizer contest titles, flyers, descriptions, and code prefixes before approving them live to voters.
              </p>
            </div>

            {pendingContests.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">Review Queue Empty</h3>
                <p className="text-xs text-slate-500">All published contests have been reviewed and approved.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingContests.map((c) => (
                  <div key={c.id} className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Banner Flyer in 4:5 Ratio */}
                      <div className="w-full sm:w-36 md:w-40 aspect-[4/5] rounded-xl bg-slate-200 border border-slate-300 overflow-hidden shrink-0 relative shadow-2xs">
                        <img src={c.bannerUrl} alt={c.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.contestType === 'free' || c.pricePerVote === null ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.contestType === 'free' || c.pricePerVote === null ? '100% Free Voting' : `Paid (GHS ${c.pricePerVote.toFixed(2)}/vote)`}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                            Prefix: {c.codePrefix || 'N/A'}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{c.category}</span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900">{c.title}</h3>
                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">{c.description}</p>
                        <p className="text-xs text-slate-500">Organizer: <strong className="text-slate-900">{c.organizerName}</strong></p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Reason if rejecting..."
                          value={rejectReasonInput[c.id] || ''}
                          onChange={(e) => setRejectReasonInput({ ...rejectReasonInput, [c.id]: e.target.value })}
                          className="min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs w-full sm:w-64 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleRejectContest(c.id)}
                          className="min-h-[44px] px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs rounded-xl transition-colors shrink-0 inline-flex items-center justify-center active:scale-98"
                        >
                          Reject
                        </button>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onSelectContestForPreview(c.id)}
                          className="min-h-[44px] px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors inline-flex items-center justify-center active:scale-98"
                        >
                          Preview Contest
                        </button>
                        <button
                          onClick={() => handleApproveContest(c.id)}
                          className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-colors inline-flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve &amp; Publish Live
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: SYSTEM SETTINGS & MAINTENANCE MODE */}
        {activeAdminTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Platform Controls &amp; Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust contest caps, toggle maintenance mode, and fix stuck payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Max Active Contests Cap Setting */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Max Active Contests per Organizer</h3>
                    <p className="text-xs text-slate-500">Platform-wide cap on simultaneous live contests per organizer account.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={systemSettings.maxActiveContestsPerOrganizer}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      store.updateSystemSettings({ maxActiveContestsPerOrganizer: val });
                    }}
                    className="w-24 min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600">Active Contests Limit (Default: 4)</span>
                </div>
              </div>

              {/* Maintenance Mode Kill Switch */}
              <div className="p-4 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${systemSettings.maintenanceMode ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Platform Maintenance Kill Switch</h3>
                      <p className="text-xs text-slate-500">Locks public site and displays maintenance notice.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => store.updateSystemSettings({ maintenanceMode: !systemSettings.maintenanceMode })}
                    className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs inline-flex items-center justify-center active:scale-98 ${
                      systemSettings.maintenanceMode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {systemSettings.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEMS NORMAL'}
                  </button>
                </div>

                <p className="text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200">
                  Status: {systemSettings.maintenanceMode ? (
                    <strong className="text-red-700">ENABLED — Public site displays maintenance screen. Admin panel remains accessible.</strong>
                  ) : (
                    <strong className="text-emerald-700">DISABLED — Public site is fully operational for voters &amp; organizers.</strong>
                  )}
                </p>
              </div>
            </div>

            {/* Manual Payment Reconciliation Tool */}
            <div className="p-4 sm:p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-950">Paystack Transaction Reconciliation Tool</h3>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                If a voter reports a successful Mobile Money payment that failed to credit automatically due to a dropped connection, paste the payment reference ID below to auto-verify and credit votes immediately.
              </p>

              <form onSubmit={handleManualReconcile} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Paste transaction ID or Receipt (e.g. STZ-GH-889312 or tx-101)..."
                  value={reconcileTxId}
                  onChange={(e) => setReconcileTxId(e.target.value)}
                  className="min-h-[44px] flex-1 px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs inline-flex items-center justify-center active:scale-98"
                >
                  Reconcile &amp; Credit Votes
                </button>
              </form>

              {reconcileMsg && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  reconcileMsg.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
                }`}>
                  {reconcileMsg.message}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PAYOUT REQUESTS & SETTLEMENTS */}
        {activeAdminTab === 'payouts' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Mobile Money Payout Requests</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review and disburse 90% organizer payouts to verified MTN, Telecel, and AT wallets via Paystack or direct MoMo bulk transfer.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1">
                {(['all', 'pending', 'processing', 'paid', 'held'] as const).map((filter) => {
                  const count = filter === 'all' 
                    ? payoutRequests.length 
                    : payoutRequests.filter((p) => p.status === filter).length;

                  return (
                    <button
                      key={filter}
                      onClick={() => setPayoutFilter(filter)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors inline-flex items-center justify-center gap-1.5 ${
                        payoutFilter === filter
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="capitalize">{filter}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        payoutFilter === filter ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payout Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Gross GMV</span>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">GHS {totalPlatformPaidGmv.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">From all completed votes</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">RSS 10% Fee</span>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">GHS {totalRssCommissionGhs.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">Platform revenue</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Disbursed</span>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">GHS {totalDisbursedGhs.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">Completed transfers</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Escrow</span>
                <p className="text-xl sm:text-2xl font-bold text-amber-700">GHS {totalPendingPayoutsGhs.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 truncate">{pendingPayouts.length} request(s) awaiting</p>
              </div>
            </div>

            {/* Payout Requests List */}
            <div className="space-y-4">
              {payoutRequests
                .filter((p) => payoutFilter === 'all' || p.status === payoutFilter)
                .length === 0 ? (
                <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 text-center space-y-2">
                  <DollarSign className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">No payout requests in this filter</p>
                  <p className="text-xs text-slate-400">
                    Payout requests are initiated by organizers after their contest voting concludes.
                  </p>
                </div>
              ) : (
                payoutRequests
                  .filter((p) => payoutFilter === 'all' || p.status === payoutFilter)
                  .map((payout) => {
                    const contest = contests.find((c) => c.id === payout.contestId);
                    const organizer = organizers.find((o) => o.id === payout.organizerId);

                    return (
                      <div
                        key={payout.id}
                        className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4"
                      >
                        {/* Header row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base font-bold text-slate-900">{payout.contestTitle}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                                payout.status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : payout.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : payout.status === 'held'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {payout.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Organizer: <strong className="text-slate-800">{payout.organizerName}</strong> • Requested on {new Date(payout.requestedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            {contest && (
                              <button
                                onClick={() => onSelectContestForPreview(contest.id)}
                                className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl inline-flex items-center justify-center gap-1 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Contest
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Breakdown and Wallet Info Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[11px]">Gross GMV:</span>
                            <span className="font-mono font-bold text-slate-900 text-sm">GHS {payout.grossRevenueGhs.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">RSS Fee (10%):</span>
                            <span className="font-mono font-bold text-slate-700 text-sm">GHS {payout.rssFeeGhs.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Net Payout (90%):</span>
                            <span className="font-mono font-bold text-emerald-600 text-sm sm:text-base">GHS {payout.netPayoutGhs.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[11px]">Destination Wallet:</span>
                            <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5 truncate">
                              <Smartphone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              {payout.momoNetwork} • {payout.momoNumber}
                            </span>
                          </div>
                        </div>

                        {/* Payout Details & Controls */}
                        <div className="space-y-3 pt-1">
                          {payout.status === 'paid' ? (
                            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>
                                  Disbursed on {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString('en-GB') : 'Recently'} • MoMo Ref: <strong className="font-mono">{payout.momoTransactionRef || 'N/A'}</strong>
                                </span>
                              </div>
                              {payout.adminNotes && (
                                <span className="text-[11px] text-emerald-700 italic">Notes: {payout.adminNotes}</span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder="Paystack / MoMo Transfer Ref (e.g. TRF-10294)"
                                  value={payoutRefInputs[payout.id] || payout.momoTransactionRef || ''}
                                  onChange={(e) =>
                                    setPayoutRefInputs((prev) => ({ ...prev, [payout.id]: e.target.value }))
                                  }
                                  className="min-h-[44px] flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Internal admin note (optional)"
                                  value={payoutNoteInputs[payout.id] || payout.adminNotes || ''}
                                  onChange={(e) =>
                                    setPayoutNoteInputs((prev) => ({ ...prev, [payout.id]: e.target.value }))
                                  }
                                  className="min-h-[44px] flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                                />
                              </div>

                              <div className="flex flex-wrap items-center gap-2 shrink-0">
                                {payout.status === 'pending' && (
                                  <button
                                    onClick={() => handleUpdatePayout(payout.id, 'processing')}
                                    className="min-h-[44px] px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs transition-colors inline-flex items-center justify-center active:scale-98"
                                  >
                                    Mark Processing
                                  </button>
                                )}

                                <button
                                  onClick={() => handleUpdatePayout(payout.id, 'paid')}
                                  className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5 active:scale-98"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Approve &amp; Mark Paid
                                </button>

                                {payout.status !== 'held' ? (
                                  <button
                                    onClick={() => handleUpdatePayout(payout.id, 'held')}
                                    className="min-h-[44px] px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold rounded-xl text-xs transition-colors inline-flex items-center justify-center active:scale-98"
                                  >
                                    Hold (Dispute)
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleUpdatePayout(payout.id, 'pending')}
                                    className="min-h-[44px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors inline-flex items-center justify-center active:scale-98"
                                  >
                                    Re-Open Review
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DISPUTES & ESCROW */}
        {activeAdminTab === 'disputes' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Escrow Holds & Dispute Control</h2>
              <p className="text-xs text-slate-500 mt-0.5">Manage 24-hour post-contest payouts and holds.</p>
            </div>

            <div className="divide-y divide-slate-100">
              {contests.map((c) => {
                const cTxs = transactions.filter((t) => t.contestId === c.id && t.status === 'success');
                const gmv = cTxs.reduce((sum, t) => sum + t.amountGhs, 0);
                const organizerPayout = gmv * 0.90;

                return (
                  <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                      <p className="text-xs text-slate-500">Organizer: {c.organizerName} • Net Escrow: <strong className="text-emerald-700">GHS {organizerPayout.toFixed(2)}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReleaseEscrow(c.id)}
                        className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-2xs inline-flex items-center justify-center active:scale-98"
                      >
                        Release Payout
                      </button>
                      <button
                        onClick={() => handleSuspendContest(c.id)}
                        className="min-h-[44px] px-3.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl text-xs inline-flex items-center justify-center active:scale-98"
                      >
                        Suspend Payout
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: ORGANIZERS & WALLETS */}
        {activeAdminTab === 'organizers' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Registered Organizers & MoMo Wallets</h2>
              <p className="text-xs text-slate-500 mt-0.5">Verified Mobile Money payout destinations across MTN, Telecel, and AT Ghana.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {organizers.map((org) => (
                <div key={org.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{org.organizationName}</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {org.verified ? 'KYC Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Contact: {org.email} • {org.phone}</p>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono">
                    <span className="text-slate-400 block text-[10px] uppercase">MoMo Payout Wallet</span>
                    <span className="font-bold text-slate-900">{org.momoNetwork} MoMo: {org.momoNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LEDGER */}
        {activeAdminTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Master Audit &amp; Verification Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">Every cast vote with secure phone hash, receipt code, and server timestamp.</p>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-3">Receipt Code</th>
                    <th className="p-3">Nominee</th>
                    <th className="p-3">Votes</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Voter Phone (Masked)</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {votes.slice(0, 50).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-amber-700">{v.receiptCode}</td>
                      <td className="p-3 font-sans font-medium text-slate-900">{v.nomineeName}</td>
                      <td className="p-3 font-bold text-slate-900">{v.voteCount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.voteType === 'free' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.voteType.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{v.voterPhoneMasked}</td>
                      <td className="p-3 text-slate-500 font-sans">{new Date(v.createdAt).toLocaleString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
