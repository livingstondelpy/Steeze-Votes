import React, { useState, useEffect } from 'react';
import { Navbar, AdminTab, OrganizerTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/voter/HomePage';
import { ContestsPage } from './components/voter/ContestsPage';
import { ContestLanding } from './components/voter/ContestLanding';
import { MyVotesLookup } from './components/voter/MyVotesLookup';
import { ExplainerPage } from './components/voter/ExplainerPage';
import { AboutPage } from './components/voter/AboutPage';
import { LiveResultsPage } from './components/voter/LiveResultsPage';
import { OrganizerPortal } from './components/organizer/OrganizerPortal';
import { OrganizerAuth } from './components/organizer/OrganizerAuth';
import { RssAdminPortal } from './components/admin/RssAdminPortal';
import { AdminLogin } from './components/admin/AdminLogin';
import { SignInModal } from './components/SignInModal';
import { TrustBadgeModal } from './components/TrustBadgeModal';
import { FloatingQuickAction } from './components/voter/FloatingQuickAction';
import { UserRole, OrganizerAccount } from './types';
import { store } from './lib/store';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('voter');
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedContestId, setSelectedContestId] = useState<string>('contest-gma-uk-2026');
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isDark, setIsDark] = useState<boolean>(false);

  // Portal Tab navigation states
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('overview');
  const [activeOrganizerTab, setActiveOrganizerTab] = useState<OrganizerTab>('dashboard');

  // Authentication States (Blocked until logged in)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('steeze_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentOrganizer, setCurrentOrganizer] = useState<OrganizerAccount | null>(() => {
    try {
      const savedOrgId = sessionStorage.getItem('steeze_organizer_id');
      if (savedOrgId) {
        return store.organizers.find((o) => o.id === savedOrgId) || null;
      }
    } catch {
      // Fallback
    }
    return null;
  });

  // Reactive state from store
  const [contests, setContests] = useState(store.contests);
  const [nominees, setNominees] = useState(store.nominees);
  const [organizers, setOrganizers] = useState(store.organizers);
  const [transactions, setTransactions] = useState(store.transactions);
  const [votes, setVotes] = useState(store.votes);
  const [anomalies, setAnomalies] = useState(store.anomalies);
  const [payoutRequests, setPayoutRequests] = useState(store.payoutRequests);
  const [lowDataMode, setLowDataMode] = useState(store.lowDataMode);
  const [systemSettings, setSystemSettings] = useState(store.systemSettings);

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setContests([...store.contests]);
      setNominees([...store.nominees]);
      setOrganizers([...store.organizers]);
      setTransactions([...store.transactions]);
      setVotes([...store.votes]);
      setAnomalies([...store.anomalies]);
      setPayoutRequests([...store.payoutRequests]);
      setLowDataMode(store.lowDataMode);
      setSystemSettings({ ...store.systemSettings });
    });
    return unsub;
  }, []);

  // Periodic polling mechanism (12s interval) to update live vote counts on public pages without exhausting Realtime connections
  useEffect(() => {
    const pollInterval = setInterval(() => {
      setContests([...store.contests]);
      setNominees([...store.nominees]);
    }, 12000);
    return () => clearInterval(pollInterval);
  }, []);

  // URL and Hash router synchronization
  useEffect(() => {
    const handleUrlChange = () => {
      const path = (window.location.pathname || '').toLowerCase();
      const hash = (window.location.hash || '').toLowerCase().replace(/^#\/?/, '');
      const full = hash || path.replace(/^\//, '');

      if (full.startsWith('organizer')) {
        setActiveView('organizer');
        setCurrentRole('organizer');
      } else if (full.startsWith('admin') || full.startsWith('rss-admin')) {
        setActiveView('admin');
        setCurrentRole('rss_admin');
      } else if (full.startsWith('about')) {
        setActiveView('about');
        setCurrentRole('voter');
      } else if (full.startsWith('live-results') || full.startsWith('results/')) {
        const slug = full.replace(/^(live-results\/?|results\/)/, '');
        if (slug) {
          const target = store.contests.find((c) => c.slug === slug || c.id === slug);
          if (target) setSelectedContestId(target.id);
        }
        setActiveView('live-results');
        setCurrentRole('voter');
      } else if (full.startsWith('my-votes') || full.startsWith('receipts')) {
        setActiveView('my-votes');
        setCurrentRole('voter');
      } else if (full.startsWith('explainer') || full.startsWith('trust') || full.startsWith('integrity')) {
        setActiveView('explainer');
        setCurrentRole('voter');
      } else if (full.startsWith('contests')) {
        setActiveView('contests');
        setCurrentRole('voter');
      } else if (full.startsWith('contest/')) {
        const slug = full.replace('contest/', '');
        const target = store.contests.find((c) => c.slug === slug || c.id === slug);
        if (target) {
          setSelectedContestId(target.id);
        }
        setActiveView('contest-detail');
        setCurrentRole('voter');
      } else {
        setActiveView('home');
        setCurrentRole('voter');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateToView = (view: string, role?: UserRole) => {
    setActiveView(view);
    if (role) setCurrentRole(role);

    // Update URL bar cleanly
    let newPath = '/';
    if (view === 'organizer') newPath = '/organizer';
    else if (view === 'admin' || view === 'rss-admin') newPath = '/admin';
    else if (view === 'about') newPath = '/about';
    else if (view === 'live-results') {
      const selected = contests.find((c) => c.id === selectedContestId);
      newPath = selected ? `/live-results/${selected.slug}` : '/live-results';
    }
    else if (view === 'my-votes') newPath = '/my-votes';
    else if (view === 'explainer') newPath = '/explainer';
    else if (view === 'contests') newPath = '/contests';
    else if (view === 'contest-detail') {
      const selected = contests.find((c) => c.id === selectedContestId);
      newPath = selected ? `/contest/${selected.slug}` : '/contests';
    } else if (view === 'home') newPath = '/';

    try {
      window.history.pushState({}, '', newPath);
    } catch {
      // Fallback for sandboxed iframe environments
      window.location.hash = (newPath || '').replace(/^\//, '');
    }

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectContest = (contestId: string) => {
    setSelectedContestId(contestId);
    const selected = contests.find((c) => c.id === contestId);
    const slug = selected?.slug || contestId;

    try {
      window.history.pushState({}, '', `/contest/${slug}`);
    } catch {
      window.location.hash = `contest/${slug}`;
    }

    setActiveView('contest-detail');
    setCurrentRole('voter');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentContest = contests.find((c) => c.id === selectedContestId) || contests[0];

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-rose-600 selection:text-white ${isDark ? 'dark bg-slate-900 text-white' : 'bg-[#fafafa] text-slate-900'}`}>
      
      {/* Real-time Header */}
      <Navbar
        currentRole={currentRole}
        activeView={activeView}
        onNavigate={navigateToView}
        lowDataMode={lowDataMode}
        setLowDataMode={(val) => {
          store.setLowDataMode(val);
          setLowDataMode(val);
        }}
        onOpenSignInModal={() => setIsSignInModalOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        isAdminAuthenticated={isAdminAuthenticated}
        activeAdminTab={activeAdminTab}
        onSelectAdminTab={(tab) => {
          setActiveAdminTab(tab);
          if (activeView !== 'admin' && activeView !== 'rss-admin') {
            navigateToView('admin', 'rss_admin');
          }
        }}
        adminBadges={{
          pendingReviews: contests.filter((c) => c.status === 'pending_review').length,
          pendingPayouts: payoutRequests.filter((p) => p.status === 'pending').length,
          unresolvedAnomalies: anomalies.filter((a) => !a.resolved).length,
        }}
        onAdminLogout={() => {
          setIsAdminAuthenticated(false);
          try {
            sessionStorage.removeItem('steeze_admin_auth');
          } catch {}
          navigateToView('home', 'voter');
        }}
        currentOrganizer={currentOrganizer}
        activeOrganizerTab={activeOrganizerTab}
        onSelectOrganizerTab={(tab) => {
          setActiveOrganizerTab(tab);
          if (activeView !== 'organizer') {
            navigateToView('organizer', 'organizer');
          }
        }}
        onOrganizerLogout={() => {
          setCurrentOrganizer(null);
          try {
            sessionStorage.removeItem('steeze_organizer_id');
          } catch {}
          navigateToView('home', 'voter');
        }}
      />

      {/* Main View Container with top padding to prevent fixed navbar from hiding content */}
      <main className="flex-1 pt-16">
        {systemSettings.maintenanceMode && activeView !== 'admin' && activeView !== 'rss-admin' ? (
          <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
            <div className="max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4 text-slate-900">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <span className="text-xl font-bold font-display">🛠️</span>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-900">Platform Maintenance</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                SteezeVotes is undergoing scheduled integrity synchronization. Please check back shortly.
              </p>
              <div className="pt-2">
                <span className="text-xs text-slate-600 font-mono font-medium bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                  Rooted Steeze Studios Engine Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* View: Home Page */}
            {activeView === 'home' && (
              <HomePage
                contests={contests}
                nominees={nominees}
                onSelectContest={handleSelectContest}
                onNavigate={navigateToView}
                onOpenTrustModal={() => setIsTrustModalOpen(true)}
                isDark={isDark}
              />
            )}

            {/* View: Contests Listing */}
            {activeView === 'contests' && (
              <ContestsPage
                contests={contests}
                nominees={nominees}
                onSelectContest={handleSelectContest}
                onBackToHome={() => navigateToView('home', 'voter')}
                isDark={isDark}
              />
            )}

            {/* View: Single Contest Landing Page */}
            {activeView === 'contest-detail' && currentContest && (
              <ContestLanding
                contest={currentContest}
                nominees={nominees}
                lowDataMode={lowDataMode}
                onOpenTrustModal={() => setIsTrustModalOpen(true)}
                onViewMyVotes={() => navigateToView('my-votes', 'voter')}
                onViewExplainer={() => navigateToView('explainer', 'voter')}
                onViewLiveResults={() => navigateToView('live-results', 'voter')}
                onBackToContests={() => navigateToView('contests', 'voter')}
                onBackToHome={() => navigateToView('home', 'voter')}
                isDark={isDark}
              />
            )}

            {/* View: Live Results Display (Big screen / TV projector mode) */}
            {activeView === 'live-results' && currentContest && (
              <LiveResultsPage
                contest={currentContest}
                nominees={nominees}
                onBackToContest={() => navigateToView('contest-detail', 'voter')}
              />
            )}

            {/* View: About SteezeVotes Page */}
            {activeView === 'about' && (
              <AboutPage
                onBackToHome={() => navigateToView('home', 'voter')}
              />
            )}

            {/* View: My Votes Lookup */}
            {activeView === 'my-votes' && (
              <MyVotesLookup
                onBackToContests={() => navigateToView('home', 'voter')}
                onNavigateToContests={() => navigateToView('contests', 'voter')}
              />
            )}

            {/* View: Trust and Explainer Page */}
            {activeView === 'explainer' && (
              <ExplainerPage
                onBackToContests={() => navigateToView('home', 'voter')}
                onNavigateToOrganizers={() => navigateToView('organizer', 'organizer')}
              />
            )}

            {/* View: Organizer Portal */}
            {activeView === 'organizer' && (
              !currentOrganizer ? (
                <OrganizerAuth
                  onLoginSuccess={(org) => {
                    setCurrentOrganizer(org);
                    try {
                      sessionStorage.setItem('steeze_organizer_id', org.id);
                    } catch {}
                  }}
                  onBackToHome={() => navigateToView('home', 'voter')}
                />
              ) : (
                <OrganizerPortal
                  contests={contests}
                  nominees={nominees}
                  organizers={organizers}
                  transactions={transactions}
                  votes={votes}
                  payoutRequests={payoutRequests}
                  currentOrganizer={currentOrganizer}
                  activeTab={activeOrganizerTab}
                  onTabChange={setActiveOrganizerTab}
                  onSelectContestForPreview={handleSelectContest}
                  onBackToHome={() => navigateToView('home', 'voter')}
                  onLogout={() => {
                    setCurrentOrganizer(null);
                    try {
                      sessionStorage.removeItem('steeze_organizer_id');
                    } catch {}
                  }}
                />
              )
            )}

            {/* View: RSS Admin Supervisory Console */}
            {(activeView === 'admin' || activeView === 'rss-admin') && (
              !isAdminAuthenticated ? (
                <AdminLogin
                  onLoginSuccess={() => {
                    setIsAdminAuthenticated(true);
                    try {
                      sessionStorage.setItem('steeze_admin_auth', 'true');
                    } catch {}
                  }}
                  onBackToHome={() => navigateToView('home', 'voter')}
                />
              ) : (
                <RssAdminPortal
                  contests={contests}
                  nominees={nominees}
                  organizers={organizers}
                  transactions={transactions}
                  votes={votes}
                  anomalies={anomalies}
                  payoutRequests={payoutRequests}
                  activeAdminTab={activeAdminTab}
                  onTabChange={setActiveAdminTab}
                  onSelectContestForPreview={handleSelectContest}
                  onBackToHome={() => navigateToView('home', 'voter')}
                  onLogout={() => {
                    setIsAdminAuthenticated(false);
                    try {
                      sessionStorage.removeItem('steeze_admin_auth');
                    } catch {}
                  }}
                />
              )
            )}
          </>
        )}
      </main>

      {/* Sticky Bottom-Right Floating Quick Action Widget */}
      {currentRole === 'voter' && (
        <FloatingQuickAction
          onOpenMyVotes={() => navigateToView('my-votes', 'voter')}
          onOpenTrustModal={() => setIsTrustModalOpen(true)}
          isDark={isDark}
        />
      )}

      {/* Universal Clean Editorial Footer */}
      <Footer
        onNavigate={navigateToView}
        onOpenTrustModal={() => setIsTrustModalOpen(true)}
        isDark={isDark}
      />

      {/* Global Trust & Verification Modal */}
      <TrustBadgeModal
        isOpen={isTrustModalOpen}
        onClose={() => setIsTrustModalOpen(false)}
        onViewExplainer={() => {
          setIsTrustModalOpen(false);
          navigateToView('explainer', 'voter');
        }}
      />

      {/* Sign In & Voter Lookup Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onNavigateToMyVotes={(phone) => {
          navigateToView('my-votes', 'voter');
        }}
        onNavigateToOrganizer={() => {
          navigateToView('organizer', 'organizer');
        }}
        onOrganizerLogin={(org) => {
          setCurrentOrganizer(org);
          try {
            sessionStorage.setItem('steeze_organizer_id', org.id);
          } catch {}
        }}
      />

    </div>
  );
}
