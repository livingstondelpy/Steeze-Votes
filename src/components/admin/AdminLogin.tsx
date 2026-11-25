import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { signInAdmin } from '../../lib/auth';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signInAdmin(email, password);
      if (result.success) {
        setPassword('');
        onLoginSuccess();
      } else {
        setError(result.message);
      }
    } catch {
      setError('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            RSS Admin Supervisory Log In
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Authorized Rooted Steeze Studios administrators only.
          </p>
        </div>

        <p className="text-xs text-slate-500 text-center">
          Sign in with an authorized administrator account. Access is verified against Supabase.
        </p>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin email address"
              className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Master Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full min-h-[44px] px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-500 focus:bg-white transition-all font-mono text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 active:scale-98"
          >
            <span>{isSubmitting ? 'Verifying access…' : 'Sign In to Admin Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {onBackToHome && (
          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={onBackToHome}
              className="min-h-[44px] text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center justify-center"
            >
              ← Back to SteezeVotes Public Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
