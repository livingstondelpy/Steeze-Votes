import React, { useState } from 'react';
import { UserCheck, Lock, AlertCircle, ArrowRight, CheckCircle2, ShieldCheck, FileText, RefreshCw } from 'lucide-react';
import { OrganizerAccount, MomoNetwork } from '../../types';
import { store } from '../../lib/store';
import { OrganizerTermsModal } from '../legal/OrganizerTermsModal';

interface OrganizerAuthProps {
  onLoginSuccess: (organizer: OrganizerAccount) => void;
  onBackToHome?: () => void;
  initialMode?: 'login' | 'signup';
}

export const OrganizerAuth: React.FC<OrganizerAuthProps> = ({
  onLoginSuccess,
  onBackToHome,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup State
  const [signupOrgName, setSignupOrgName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupMomoNetwork, setSignupMomoNetwork] = useState<MomoNetwork>('MTN');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Status & Errors
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = store.loginOrganizer(loginEmail, loginPassword);
    setLoading(false);

    if (result.success && result.organizer) {
      onLoginSuccess(result.organizer);
    } else {
      setError(result.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!agreedToTerms) {
      setError('You must check the box agreeing to the Organizer Terms & Conditions to create an account.');
      return;
    }

    setLoading(true);

    const result = store.registerOrganizer({
      organizationName: signupOrgName,
      email: signupEmail,
      password: signupPassword,
      contactPhone: signupPhone,
      momoNumber: signupPhone,
      momoNetwork: signupMomoNetwork,
      agreedToTerms,
    });

    setLoading(false);

    if (result.success && result.organizer) {
      onLoginSuccess(result.organizer);
    } else {
      setError(result.message);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const result = store.resetOrganizerPassword(forgotEmail);
    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message);
    } else {
      setError(result.message);
    }
  };

  const handleDemoFill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('demo123');
    setMode('login');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Organizer Studio Portal
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Host contests, track votes, and manage MoMo payouts in Ghana.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="p-1.5 bg-slate-100 rounded-xl flex gap-1 text-xs font-semibold">
          <button
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            className={`min-h-[44px] flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${
              mode === 'login' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Organizer Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`min-h-[44px] flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center ${
              mode === 'signup' ? 'bg-rose-600 text-white shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Host a Contest (Sign Up)
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Organizer Account Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="events@yourbrand.com"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }}
                  className="min-h-[36px] text-[11px] font-semibold text-rose-600 hover:underline inline-flex items-center"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Logging In...
                </>
              ) : (
                <>
                  Log In to Organizer Studio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                Quick Demo Organizers
              </span>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('events@rootedsteeze.com')}
                  className="min-h-[44px] text-left p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 text-slate-700 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-900">Rooted Steeze Studios</span>
                  <span className="font-mono text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">Auto-Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('awards@echohousegh.com')}
                  className="min-h-[44px] text-left p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 text-slate-700 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-900">Echo House Events</span>
                  <span className="font-mono text-[10px] text-rose-600 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">Auto-Fill</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MODE 2: SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Business / Organization Name
              </label>
              <input
                type="text"
                required
                value={signupOrgName}
                onChange={(e) => setSignupOrgName(e.target.value)}
                placeholder="e.g. Echo House Events Ghana"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Official Contact Email
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="events@yourbrand.com"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Primary Payout MoMo Network
              </label>
              <select
                value={signupMomoNetwork}
                onChange={(e) => setSignupMomoNetwork(e.target.value as MomoNetwork)}
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all text-slate-900"
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AT">AT Money</option>
              </select>
            </div>

            {/* MANDATORY TERMS & CONDITIONS CHECKBOX */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span className="text-xs text-slate-700 leading-snug">
                  I agree to the <strong className="font-bold text-slate-900">SteezeVotes Organizer Terms &amp; Conditions</strong>, including the 24-hour payout hold and fraud policies.
                </span>
              </label>
              <div className="pl-7">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="min-h-[32px] text-[11px] font-semibold text-rose-600 hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" /> Read Full Terms &amp; Conditions
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Create Organizer Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* MODE 3: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Enter your Organizer Account Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="events@yourbrand.com"
                className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link &amp; Temporary Passcode <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                className="min-h-[44px] text-xs text-rose-600 hover:underline font-semibold inline-flex items-center justify-center"
              >
                ← Back to Log In
              </button>
            </div>
          </form>
        )}

        {onBackToHome && (
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onBackToHome}
              className="min-h-[44px] text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center justify-center"
            >
              Back to SteezeVotes Public Home
            </button>
          </div>
        )}

      </div>

      {/* Terms Modal */}
      <OrganizerTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setAgreedToTerms(true);
          setShowTermsModal(false);
        }}
      />
    </div>
  );
};
