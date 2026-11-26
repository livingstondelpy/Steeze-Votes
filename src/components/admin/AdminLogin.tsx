import React, { useEffect, useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, Mail, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { signInAdmin } from '../../lib/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome?: () => void;
}

type Mode = 'login' | 'forgot' | 'reset';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === '1') setMode('reset');
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) setMode('reset');
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError('Secure authentication is not configured. Please contact the platform administrator.');
        return;
      }
      const result = await signInAdmin(email, password);
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        setError('Secure password recovery is not configured. Please contact the platform administrator.');
        return;
      }
      const redirectTo = `${window.location.origin}/admin?reset=1`;
      const { error: recoveryError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
      if (recoveryError) throw recoveryError;
      setSuccess('If this email belongs to an account, a password-reset link has been sent. Check your inbox and spam folder.');
    } catch (err: any) {
      setError(err?.message || 'Could not send the recovery email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) throw new Error('Secure authentication is not configured.');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!sessionData.session) {
        throw new Error('This recovery link is invalid or expired. Request a new password-reset email and open the newest link on this device.');
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      window.history.replaceState({}, '', '/admin');
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMode('login');
      setSuccess('Password updated successfully. Sign in with your new password.');
    } catch (err: any) {
      setError(err?.message || 'Unable to update the password. Request a new recovery link.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mode === 'forgot' ? 'Recover Admin Password' : mode === 'reset' ? 'Set a New Password' : 'RSS Admin Supervisory Log In'}
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {mode === 'reset' ? 'Choose a new password for your administrator account.' : 'Authorized Rooted Steeze Studios administrators only.'}
          </p>
        </div>

        {error && <div role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span></div>}
        {success && <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span>{success}</span></div>}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Email Address</label>
              <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourdomain.com" className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-mono text-slate-900" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Password</label>
              <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-mono text-slate-900" />
            </div>
            <div className="text-right">
              <button type="button" onClick={() => switchMode('forgot')} className="min-h-[36px] text-xs font-semibold text-rose-600 hover:underline">Forgot your password?</button>
            </div>
            <button type="submit" disabled={loading} className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Signing in…</> : <>Sign In to Admin Portal <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-sm text-slate-600">Enter the email address attached to your administrator account. This works for admin accounts and does not require an organizer profile.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Admin Email Address</label>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourdomain.com" className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white font-mono text-slate-900" />
            </div>
            <button type="submit" disabled={loading} className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</> : <><Mail className="w-4 h-4" /> Send Password Reset Link</>}
            </button>
            <button type="button" onClick={() => switchMode('login')} className="w-full min-h-[40px] text-xs text-slate-600 hover:text-slate-900">Back to admin sign in</button>
          </form>
        )}

        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
              <input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white text-slate-900" placeholder="At least 8 characters" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
              <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white text-slate-900" placeholder="Re-enter new password" />
            </div>
            <button type="submit" disabled={loading} className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Updating…</> : 'Update Admin Password'}
            </button>
          </form>
        )}

        {onBackToHome && mode !== 'reset' && (
          <div className="text-center pt-2 border-t border-slate-100">
            <button onClick={onBackToHome} className="min-h-[44px] text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center justify-center">← Back to SteezeVotes Public Home</button>
          </div>
        )}
      </div>
    </div>
  );
};
