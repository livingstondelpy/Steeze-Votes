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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Organizer Studio Portal
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Host contests, track votes, and manage MoMo payouts in Ghana.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="p-1.5 bg-gray-100 rounded-2xl flex gap-1 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Organizer Log In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
            className={`flex-1 py-2.5 rounded-xl transition-all ${
              mode === 'signup' ? 'bg-amber-500 text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Host a Contest (Sign Up)
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Organizer Account Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="events@yourbrand.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }}
                  className="text-[11px] font-semibold text-amber-600 hover:underline"
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loggin In...
                </>
              ) : (
                <>
                  Log In to Organizer Studio <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-semibold text-gray-400 block mb-2 uppercase tracking-wider">
                Quick Demo Organizers
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoFill('events@rootedsteeze.com')}
                  className="text-left p-2 rounded-lg bg-gray-50 hover:bg-amber-50 border border-gray-200 text-gray-700 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">Rooted Steeze Studios</span>
                  <span className="font-mono text-[10px] text-amber-700 font-bold">Auto-Fill</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill('awards@echohousegh.com')}
                  className="text-left p-2 rounded-lg bg-gray-50 hover:bg-amber-50 border border-gray-200 text-gray-700 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold">Echo House Events</span>
                  <span className="font-mono text-[10px] text-amber-700 font-bold">Auto-Fill</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* MODE 2: SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Business / Organization Name
              </label>
              <input
                type="text"
                required
                value={signupOrgName}
                onChange={(e) => setSignupOrgName(e.target.value)}
                placeholder="e.g. Echo House Events Ghana"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Official Contact Email
              </label>
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                placeholder="events@yourbrand.com"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Account Password
                </label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="+233 24 123 4567"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Primary Payout MoMo Network
              </label>
              <select
                value={signupMomoNetwork}
                onChange={(e) => setSignupMomoNetwork(e.target.value as MomoNetwork)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              >
                <option value="MTN">MTN Mobile Money</option>
                <option value="Telecel">Telecel Cash</option>
                <option value="AT">AT Money</option>
              </select>
            </div>

            {/* MANDATORY TERMS & CONDITIONS CHECKBOX */}
            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs text-gray-800 leading-snug">
                  I agree to the <strong className="font-bold text-amber-900">SteezeVotes Organizer Terms &amp; Conditions</strong>, including the 24-hour payout hold and fraud policies.
                </span>
              </label>
              <div className="pl-7">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-[11px] font-semibold text-amber-700 hover:underline inline-flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" /> Read Full Terms &amp; Conditions
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
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
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Enter your Organizer Account Email
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="events@yourbrand.com"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
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
                className="text-xs text-amber-600 hover:underline font-semibold"
              >
                ← Back to Log In
              </button>
            </div>
          </form>
        )}

        {onBackToHome && (
          <div className="text-center pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium"
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
