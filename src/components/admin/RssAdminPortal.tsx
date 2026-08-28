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
  ArrowLeft
} from 'lucide-react';
import { Contest, Nominee, OrganizerAccount, AnomalyAlert, Transaction, VoteRecord } from '../../types';
import { store } from '../../lib/store';

interface RssAdminPortalProps {
  contests: Contest[];
  nominees: Nominee[];
  organizers: OrganizerAccount[];
  transactions: Transaction[];
  votes: VoteRecord[];
  anomalies: AnomalyAlert[];
  onSelectContestForPreview: (contestId: string) => void;
  onBackToHome?: () => void;
  onLogout?: () => void;
}

export const RssAdminPortal: React.FC<RssAdminPortalProps> = ({
  contests,
  nominees,
  organizers,
  transactions,
  votes,
  anomalies,
  onSelectContestForPreview,
  onBackToHome,
  onLogout,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'review' | 'anomalies' | 'disputes' | 'organizers' | 'settings' | 'audit'>('overview');
  const [anomalyResolutionNote, setAnomalyResolutionNote] = useState('');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState<{ [key: string]: string }>({});
  const [reconcileTxId, setReconcileTxId] = useState('');
  const [reconcileMsg, setReconcileMsg] = useState<{ success: boolean; message: string } | null>(null);

  // System settings state from store
  const systemSettings = store.systemSettings;

  // Pending contests review queue
  const pendingContests = contests.filter((c) => c.status === 'pending_review');

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
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="space-y-1">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                Rooted Steeze Studios Master Admin
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                Super Admin Access
              </span>
            </div>
            <p className="text-xs text-gray-500">
              RSS Admin control panel: approve contests, check platform earnings, monitor fraud alerts, and manage settings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                onClick={onLogout}
                className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors shadow-xs"
              >
                Log Out Admin
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveAdminTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'overview'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Platform Overview
          </button>

          <button
            onClick={() => setActiveAdminTab('review')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'review'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Review Queue
            {pendingContests.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                {pendingContests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveAdminTab('anomalies')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'anomalies'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Fraud &amp; Spikes ({unresolvedAnomalies.length})
          </button>

          <button
            onClick={() => setActiveAdminTab('disputes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'disputes'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Scale className="w-4 h-4" /> Escrow &amp; Contests
          </button>

          <button
            onClick={() => setActiveAdminTab('organizers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'organizers'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" /> Organizers &amp; MoMo Wallets
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'settings'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-4 h-4" /> Platform Controls &amp; Settings
          </button>

          <button
            onClick={() => setActiveAdminTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeAdminTab === 'audit'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Audit &amp; Verification Log
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Gross Merchandise Volume (GMV)</span>
                <p className="text-2xl font-bold text-gray-900">GHS {totalPlatformPaidGmv.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500">Across {transactions.length} total MoMo transactions</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">RSS 10% Commission Earned</span>
                <p className="text-2xl font-bold text-amber-600">GHS {totalRssCommissionGhs.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500">Net 10% platform earnings</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Verified Ballots</span>
                <p className="text-2xl font-bold text-gray-900">{totalPlatformVotes.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500">{votes.length} unique voter records</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Active Contests</span>
                <p className="text-2xl font-bold text-gray-900">{contests.length}</p>
                <p className="text-[11px] text-gray-500">{organizers.length} registered organizers</p>
              </div>

            </div>

            {/* Contests Management Overview Table */}
            <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900">
                  Platform Contests Status
                </h3>
                <span className="text-xs text-gray-500 font-medium">{contests.length} total registered</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
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
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Fraud & Velocity Alerts</h2>
              <p className="text-xs text-gray-500 mt-0.5">Automated surveillance detecting abnormal voting bursts, suspicious IP clusters, or OTP velocity.</p>
            </div>

            {anomalies.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-gray-900">No anomalies detected</p>
                <p className="text-xs text-gray-500">All voting velocity patterns are within normal statistical boundaries.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anomalies.map((a) => (
                  <div
                    key={a.id}
                    className={`p-5 rounded-2xl border ${
                      a.resolved
                        ? 'bg-gray-50 border-gray-200 opacity-75'
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
                          <span className="text-xs font-bold text-gray-900">{a.nomineeName || 'Nominee Alert'}</span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1.5">{a.reason}</p>
                      </div>

                      <span className="text-[11px] text-gray-500 font-mono">
                        {new Date(a.detectedAt || Date.now()).toLocaleTimeString('en-GB')}
                      </span>
                    </div>

                    {!a.resolved ? (
                      <div className="pt-2 flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Add investigation resolution note..."
                          value={selectedAnomalyId === a.id ? anomalyResolutionNote : ''}
                          onChange={(e) => {
                            setSelectedAnomalyId(a.id);
                            setAnomalyResolutionNote(e.target.value);
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs"
                        />
                        <button
                          onClick={() => handleResolveAnomaly(a.id)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-xl shadow-xs"
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
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pending Contest Review Queue</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Content Moderation: Review organizer contest titles, flyers, descriptions, and code prefixes before approving them live to voters.
              </p>
            </div>

            {pendingContests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-gray-900">Review Queue Empty</h3>
                <p className="text-xs text-gray-500">All published contests have been reviewed and approved.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingContests.map((c) => (
                  <div key={c.id} className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Banner Flyer */}
                      <div className="w-full md:w-48 h-32 rounded-xl bg-gray-200 border border-gray-300 overflow-hidden shrink-0 relative">
                        <img src={c.bannerUrl} alt={c.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.contestType === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {c.contestType === 'free' ? '100% Free Voting' : `Paid (GHS ${c.pricePerVote.toFixed(2)}/vote)`}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                            Prefix: {c.codePrefix || 'N/A'}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">{c.category}</span>
                        </div>

                        <h3 className="text-base font-bold text-gray-900">{c.title}</h3>
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">{c.description}</p>
                        <p className="text-xs text-gray-500">Organizer: <strong>{c.organizerName}</strong></p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          placeholder="Reason if rejecting..."
                          value={rejectReasonInput[c.id] || ''}
                          onChange={(e) => setRejectReasonInput({ ...rejectReasonInput, [c.id]: e.target.value })}
                          className="px-3 py-1.5 bg-white border border-gray-300 rounded-xl text-xs w-full sm:w-64 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                        <button
                          onClick={() => handleRejectContest(c.id)}
                          className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs rounded-xl transition-colors shrink-0"
                        >
                          Reject
                        </button>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onSelectContestForPreview(c.id)}
                          className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold text-xs rounded-xl transition-colors"
                        >
                          Preview Contest
                        </button>
                        <button
                          onClick={() => handleApproveContest(c.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
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
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Platform Controls &amp; Settings</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Adjust contest caps, toggle maintenance mode, and fix stuck payments.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Active Contests Cap Setting */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Max Active Contests per Organizer</h3>
                    <p className="text-xs text-gray-500">Platform-wide cap on simultaneous live contests per organizer account.</p>
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
                    className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-600">Active Contests Limit (Default: 4)</span>
                </div>
              </div>

              {/* Maintenance Mode Kill Switch */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${systemSettings.maintenanceMode ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Platform Maintenance Kill Switch</h3>
                      <p className="text-xs text-gray-500">Locks public site and displays maintenance notice.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => store.updateSystemSettings({ maintenanceMode: !systemSettings.maintenanceMode })}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      systemSettings.maintenanceMode
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {systemSettings.maintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEMS NORMAL'}
                  </button>
                </div>

                <p className="text-xs text-gray-600 bg-white p-3 rounded-xl border border-gray-200">
                  Status: {systemSettings.maintenanceMode ? (
                    <strong className="text-red-700">ENABLED — Public site displays maintenance screen. Admin panel remains accessible.</strong>
                  ) : (
                    <strong className="text-emerald-700">DISABLED — Public site is fully operational for voters &amp; organizers.</strong>
                  )}
                </p>
              </div>
            </div>

            {/* Manual Payment Reconciliation Tool */}
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
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
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
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

        {/* TAB 3: DISPUTES & ESCROW */}
        {activeAdminTab === 'disputes' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Escrow Holds & Dispute Control</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage 24-hour post-contest payouts and holds.</p>
            </div>

            <div className="divide-y divide-gray-100">
              {contests.map((c) => {
                const cTxs = transactions.filter((t) => t.contestId === c.id && t.status === 'success');
                const gmv = cTxs.reduce((sum, t) => sum + t.amountGhs, 0);
                const organizerPayout = gmv * 0.90;

                return (
                  <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{c.title}</h4>
                      <p className="text-xs text-gray-500">Organizer: {c.organizerName} • Net Escrow: <strong className="text-emerald-700">GHS {organizerPayout.toFixed(2)}</strong></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReleaseEscrow(c.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                      >
                        Release Organizer Payout
                      </button>
                      <button
                        onClick={() => handleSuspendContest(c.id)}
                        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl text-xs"
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
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Registered Organizers & MoMo Wallets</h2>
              <p className="text-xs text-gray-500 mt-0.5">Verified Mobile Money payout destinations across MTN, Telecel, and AT Ghana.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {organizers.map((org) => (
                <div key={org.id} className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{org.organizationName}</h4>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {org.verified ? 'KYC Verified' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Contact: {org.email} • {org.phone}</p>
                  <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs font-mono">
                    <span className="text-gray-400 block text-[10px] uppercase">MoMo Payout Wallet</span>
                    <span className="font-bold text-gray-900">{org.momoNetwork} MoMo: {org.momoNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT LEDGER */}
        {activeAdminTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Master Audit &amp; Verification Log</h2>
              <p className="text-xs text-gray-500 mt-0.5">Every cast vote with secure phone hash, receipt code, and server timestamp.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-3">Receipt Code</th>
                    <th className="p-3">Nominee</th>
                    <th className="p-3">Votes</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Voter Phone (Masked)</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {votes.slice(0, 50).map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-amber-700">{v.receiptCode}</td>
                      <td className="p-3 font-sans font-medium text-gray-900">{v.nomineeName}</td>
                      <td className="p-3 font-bold text-gray-900">{v.voteCount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          v.voteType === 'free' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.voteType.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">{v.voterPhoneMasked}</td>
                      <td className="p-3 text-gray-500 font-sans">{new Date(v.createdAt).toLocaleString('en-GB')}</td>
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
