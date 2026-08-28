import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Trophy, 
  DollarSign, 
  Users, 
  Download, 
  Share2, 
  Sparkles, 
  BarChart3, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileText,
  Percent,
  ArrowLeft
} from 'lucide-react';
import { Contest, Nominee, OrganizerAccount, BundleTier, Transaction, VoteRecord } from '../../types';
import { store } from '../../lib/store';
import { generateResultsCertificatePdf } from '../../lib/pdfCertificate';

interface OrganizerPortalProps {
  contests: Contest[];
  nominees: Nominee[];
  organizers: OrganizerAccount[];
  transactions: Transaction[];
  votes: VoteRecord[];
  onSelectContestForPreview: (contestId: string) => void;
  onBackToHome?: () => void;
}

export const OrganizerPortal: React.FC<OrganizerPortalProps> = ({
  contests,
  nominees,
  organizers,
  transactions,
  votes,
  onSelectContestForPreview,
  onBackToHome,
}) => {
  // Current active organizer
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizers[0]?.id || 'org-rss-01');
  const currentOrg = organizers.find((o) => o.id === selectedOrgId) || organizers[0];

  // Active Tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'analytics' | 'milestones' | 'contacts'>('dashboard');

  // Selected contest for drill-down / editing
  const orgContests = contests.filter((c) => c.organizerId === currentOrg.id);
  const [activeContestId, setActiveContestId] = useState<string>(orgContests[0]?.id || contests[0]?.id || '');
  const activeContest = contests.find((c) => c.id === activeContestId) || orgContests[0] || contests[0];

  // State for Create Contest Form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Music & Entertainment');
  const [newBannerUrl, setNewBannerUrl] = useState('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80');
  const [newPricePerVote, setNewPricePerVote] = useState<number>(1.00);
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [newEndDate, setNewEndDate] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16));
  const [newShowPublic, setNewShowPublic] = useState(true);
  const [newCollectContacts, setNewCollectContacts] = useState(true);
  const [newSponsorName, setNewSponsorName] = useState('');
  const [newSponsorLogo, setNewSponsorLogo] = useState('');

  // Initial bundle tiers for form
  const [newBundleTiers, setNewBundleTiers] = useState<BundleTier[]>([
    { id: 'b-1', votes: 1, priceGhs: 1.00, label: '1 Vote' },
    { id: 'b-10', votes: 10, priceGhs: 9.00, originalPriceGhs: 10.00, discountPercentage: 10, badge: 'Popular', popular: true },
    { id: 'b-50', votes: 50, priceGhs: 40.00, originalPriceGhs: 50.00, discountPercentage: 20, badge: '20% OFF' },
    { id: 'b-100', votes: 100, priceGhs: 75.00, originalPriceGhs: 100.00, discountPercentage: 25, badge: 'VIP' },
  ]);

  // State for Nominees Form in Creation
  const [formNominees, setFormNominees] = useState<Array<{ name: string; stageName: string; photoUrl: string; bio: string; nomineeCode: string }>>([
    {
      name: 'Kofi Manu',
      stageName: 'Kofi Jay',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      bio: 'Rising Afrobeats talent taking the Ghanaian airwaves by storm.',
      nomineeCode: 'NOM-01',
    },
    {
      name: 'Yaa Asantewaa',
      stageName: 'Queen Yaa',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      bio: 'Vocal powerhouse bringing soulful highlife melodies.',
      nomineeCode: 'NOM-02',
    }
  ]);

  // Nominee quick add inside active contest
  const [quickNomineeName, setQuickNomineeName] = useState('');
  const [quickNomineeStage, setQuickNomineeStage] = useState('');
  const [quickNomineeBio, setQuickNomineeBio] = useState('');
  const [quickNomineeCode, setQuickNomineeCode] = useState('');
  const [quickNomineePhoto, setQuickNomineePhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80');

  // Milestone generator state
  const [milestoneType, setMilestoneType] = useState<'votes' | 'winner' | 'countdown'>('votes');
  const [milestoneCustomText, setMilestoneCustomText] = useState('Thank you Ghana! Over 10,000 votes recorded.');

  // Financial calculations for active contest
  const contestTransactions = transactions.filter((t) => t.contestId === activeContest?.id && t.status === 'success');
  const totalRevenueGross = contestTransactions.reduce((sum, t) => sum + t.amountGhs, 0);
  const organizerNetPayout = totalRevenueGross * 0.90; // 90% payout rule
  const rssPlatformCommission = totalRevenueGross * 0.10; // 10% fee

  const activeNominees = nominees
    .filter((n) => n.contestId === activeContest?.id)
    .sort((a, b) => b.voteCount - a.voteCount);

  const totalVotesInContest = activeNominees.reduce((sum, n) => sum + n.voteCount, 0);
  const totalPaidVotesInContest = activeNominees.reduce((sum, n) => sum + n.paidVoteCount, 0);
  const totalFreeVotesInContest = activeNominees.reduce((sum, n) => sum + n.freeVoteCount, 0);

  // Consented voter contacts for this contest
  const consentedContacts = votes.filter((v) => v.contestId === activeContest?.id && v.consentedMarketing && v.voterPhoneRaw);

  const handleCreateContestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = store.createContest({
      slug,
      status: 'active',
      organizerId: currentOrg.id,
      organizerName: currentOrg.organizationName,
      title: newTitle,
      description: newDescription,
      category: newCategory,
      bannerUrl: newBannerUrl,
      sponsorName: newSponsorName || undefined,
      sponsorLogoUrl: newSponsorLogo || undefined,
      startDate: new Date(newStartDate).toISOString(),
      endDate: new Date(newEndDate).toISOString(),
      pricePerVote: newPricePerVote,
      bundleTiers: newBundleTiers,
      showPublicResults: newShowPublic,
      collectVoterContacts: newCollectContacts,
    });

    // Add initial nominees
    formNominees.forEach((fn) => {
      store.addNominee(created.id, {
        name: fn.name,
        stageName: fn.stageName,
        photoUrl: fn.photoUrl,
        bio: fn.bio,
        nomineeCode: fn.nomineeCode,
      });
    });

    setActiveContestId(created.id);
    setActiveTab('dashboard');
    alert(`Contest "${created.title}" published successfully!`);
  };

  const handleAddNomineeToActive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNomineeName.trim() || !activeContest) return;

    store.addNominee(activeContest.id, {
      name: quickNomineeName,
      stageName: quickNomineeStage || quickNomineeName,
      photoUrl: quickNomineePhoto,
      bio: quickNomineeBio,
      nomineeCode: quickNomineeCode || `NOM-0${activeNominees.length + 1}`,
    });

    setQuickNomineeName('');
    setQuickNomineeStage('');
    setQuickNomineeBio('');
    setQuickNomineeCode('');
  };

  const handleExportContactsCsv = () => {
    if (consentedContacts.length === 0) {
      alert('No consented voter contacts available yet.');
      return;
    }

    const headers = ['ReceiptCode', 'VoterPhone', 'NomineeVotedFor', 'VoteCount', 'VoteType', 'Timestamp'];
    const rows = consentedContacts.map((c) => [
      c.receiptCode,
      c.voterPhoneRaw || c.voterPhoneMasked,
      `"${(c.nomineeName || '').replace(/"/g, '""')}"`,
      c.voteCount,
      c.voteType,
      c.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voter_contacts_${activeContest?.slug || 'contest'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    if (!activeContest) return;
    generateResultsCertificatePdf(activeContest, nominees);
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header Bar */}
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
                Organizer Studio
              </span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                90% MoMo Payouts
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Manage awards, monitor live votes, export contacts, and track Mobile Money earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Organizer Account Switcher */}
            <select
              value={selectedOrgId}
              onChange={(e) => {
                setSelectedOrgId(e.target.value);
                const first = contests.find((c) => c.organizerId === e.target.value);
                if (first) setActiveContestId(first.id);
              }}
              className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {organizers.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.organizationName} ({org.momoNetwork} MoMo: {org.momoNumber})
                </option>
              ))}
            </select>

            {/* Preview Public Contest Link */}
            {activeContest && (
              <button
                onClick={() => onSelectContestForPreview(activeContest.id)}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Public Page
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Live Dashboard
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Plus className="w-4 h-4" />
            Create New Contest
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            PDF Certificate and Results
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'milestones'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Social Milestone Graphics
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Voter Contacts CSV ({consentedContacts.length})
          </button>
        </div>

        {/* Contest Selector if in Dashboard/Analytics */}
        {activeTab !== 'create' && (
          <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">Selected Contest:</span>
              <select
                value={activeContestId}
                onChange={(e) => setActiveContestId(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-900 rounded-lg px-2.5 py-1.5"
              >
                {orgContests.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-500">
              Ends: <strong className="text-gray-800">{new Date(activeContest?.endDate || '').toLocaleDateString('en-GB')}</strong>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && activeContest && (
          <div className="space-y-6">
            
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Gross Revenue (GMV)</span>
                <p className="text-2xl font-bold text-gray-900">GHS {totalRevenueGross.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500">From {contestTransactions.length} successful MoMo bundles</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Organizer 90% Net Payout</span>
                <p className="text-2xl font-bold text-emerald-600">GHS {organizerNetPayout.toFixed(2)}</p>
                <p className="text-[11px] text-gray-500">Destination: {currentOrg.momoNetwork} ({currentOrg.momoNumber})</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Total Votes Recorded</span>
                <p className="text-2xl font-bold text-gray-900">{totalVotesInContest.toLocaleString()}</p>
                <p className="text-[11px] text-gray-500">{totalPaidVotesInContest} Paid • {totalFreeVotesInContest} Free (Verified)</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">24h Dispute Escrow Status</span>
                <p className={`text-base font-bold mt-1 ${activeContest.status === 'closed' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {activeContest.status === 'closed' ? 'In 24h Review Window' : 'Live and Protected'}
                </p>
                <p className="text-[11px] text-gray-500">Auto-release after 24h audit</p>
              </div>

            </div>

            {/* Nominees Leaderboard & Quick Add */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Leaderboard Table (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">
                    Live Leaderboard ({activeNominees.length} Nominees)
                  </h3>
                  <span className="text-xs text-gray-500 font-medium">Ranked by vote count</span>
                </div>

                <div className="divide-y divide-gray-100">
                  {activeNominees.map((nom, idx) => {
                    const pct = totalVotesInContest > 0 ? Math.round((nom.voteCount / totalVotesInContest) * 100) : 0;
                    return (
                      <div key={nom.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {idx + 1}
                          </span>
                          <img src={nom.photoUrl} alt={nom.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{nom.stageName || nom.name}</h4>
                            <p className="text-xs text-gray-500 font-mono">Code: {nom.nomineeCode}</p>
                          </div>
                        </div>

                        <div className="text-right whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900 block">{nom.voteCount.toLocaleString()} votes</span>
                          <span className="text-xs text-amber-700 font-semibold">{pct}% of total</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add Nominee Box (1 Col) */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">
                  Add Nominee to Contest
                </h3>

                <form onSubmit={handleAddNomineeToActive} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={quickNomineeName}
                      onChange={(e) => setQuickNomineeName(e.target.value)}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stage / Display Name</label>
                    <input
                      type="text"
                      value={quickNomineeStage}
                      onChange={(e) => setQuickNomineeStage(e.target.value)}
                      placeholder="e.g. DJ Blackstar"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Nominee Code</label>
                    <input
                      type="text"
                      value={quickNomineeCode}
                      onChange={(e) => setQuickNomineeCode(e.target.value)}
                      placeholder="e.g. NOM-05"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Short Bio</label>
                    <textarea
                      rows={2}
                      value={quickNomineeBio}
                      onChange={(e) => setQuickNomineeBio(e.target.value)}
                      placeholder="Short intro for voting cards..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Nominee
                  </button>
                </form>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: CREATE NEW CONTEST */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Create New Contest</h2>
              <p className="text-xs text-gray-500 mt-0.5">Set up awards, pageants, or talent voting with instant MoMo processing.</p>
            </div>

            <form onSubmit={handleCreateContestSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contest Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Ghana Campus Music Awards 2026: Best New Artiste"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Music & Entertainment">Music & Entertainment</option>
                    <option value="Nightlife & Culture">Nightlife & Culture</option>
                    <option value="Pageantry & Fashion">Pageantry & Fashion</option>
                    <option value="Campus & Talent">Campus & Talent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price per Single Vote (GHS)</label>
                  <input
                    type="number"
                    min={1.00}
                    step={0.50}
                    value={newPricePerVote}
                    onChange={(e) => setNewPricePerVote(parseFloat(e.target.value) || 1.00)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contest Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Explain the voting rules, criteria, and timeline..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={newBannerUrl}
                  onChange={(e) => setNewBannerUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={newShowPublic}
                    onChange={(e) => setNewShowPublic(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Show real-time vote totals publicly to voters</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={newCollectContacts}
                    onChange={(e) => setNewCollectContacts(e.target.checked)}
                    className="rounded text-amber-500"
                  />
                  <span>Collect consented voter phone numbers for post-event marketing</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
              >
                Publish Contest Live
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ANALYTICS & PDF CERTIFICATE */}
        {activeTab === 'analytics' && activeContest && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Official Results & Certified PDF</h2>
              <p className="text-xs text-gray-500 mt-0.5">Generate audited summary reports with cryptographic verification seals.</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Audit Status:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  Ledger Hash Verified
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Includes exact tally of free and paid votes per nominee, timestamps, revenue breakdown, and Rooted Steeze Studios authorization signature.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadPdf}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Certified PDF Certificate
              </button>
              
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-sm transition-colors"
              >
                Print Results Summary
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL MILESTONE GRAPHICS */}
        {activeTab === 'milestones' && activeContest && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-3xl mx-auto space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Social Media Milestone Graphics</h2>
              <p className="text-xs text-gray-500 mt-0.5">Generate branded shareable graphics for Instagram stories and WhatsApp status.</p>
            </div>

            {/* Graphic Preview Card */}
            <div className="aspect-[4/3] sm:aspect-[16/9] w-full rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-white p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight">SteezeVotes Ghana</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20">
                  {activeContest.category}
                </span>
              </div>

              <div className="text-center space-y-2 max-w-lg mx-auto">
                <p className="text-xs uppercase tracking-widest text-amber-200 font-semibold">
                  Official Milestone Alert
                </p>
                <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                  {totalVotesInContest.toLocaleString()} Votes Cast!
                </h3>
                <p className="text-xs text-amber-100">
                  {activeContest.title}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-amber-100 border-t border-white/20 pt-3">
                <span>Vote with MoMo at steezevotes.com</span>
                <span>Powered by Rooted Steeze Studios</span>
              </div>
            </div>

            <button
              onClick={() => alert('Milestone graphic copied to clipboard for WhatsApp status!')}
              className="w-full py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" /> Share Graphic to WhatsApp Status
            </button>
          </div>
        )}

        {/* TAB 5: VOTER CONTACTS CSV */}
        {activeTab === 'contacts' && activeContest && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Consented Voter Contacts</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Voters who explicitly opted in during voting to receive updates from {currentOrg.organizationName}.
                </p>
              </div>

              <button
                onClick={handleExportContactsCsv}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV ({consentedContacts.length})
              </button>
            </div>

            {consentedContacts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200 p-6 space-y-2">
                <Users className="w-8 h-8 text-gray-400 mx-auto" />
                <p className="text-xs font-bold text-gray-700">No opted-in voter contacts yet</p>
                <p className="text-xs text-gray-500">As voters opt in during their free or paid votes, their numbers will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="p-3">Receipt Code</th>
                      <th className="p-3">Phone Number</th>
                      <th className="p-3">Nominee</th>
                      <th className="p-3">Votes</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {consentedContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-amber-700">{c.receiptCode}</td>
                        <td className="p-3 font-mono font-medium text-gray-900">{c.voterPhoneRaw || c.voterPhoneMasked}</td>
                        <td className="p-3 font-medium text-gray-800">{c.nomineeName}</td>
                        <td className="p-3 font-semibold">{c.voteCount}</td>
                        <td className="p-3 text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-GB')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
