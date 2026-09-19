import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, ArrowRight, Trophy } from 'lucide-react';
import { store } from '../../lib/store';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = store.loginAdmin(email, password);
    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.message);
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

        {/* Demo Credentials Helper Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-slate-900">
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Master Admin Login Credentials</span>
          </div>
          <p className="text-[11px] font-mono text-slate-600">
            Email: <strong className="font-bold text-slate-900">admin@steezevotes.com</strong> <br />
            Password: <strong className="font-bold text-slate-900">admin123</strong>
          </p>
        </div>

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
              placeholder="admin@steezevotes.com"
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
            className="w-full min-h-[44px] py-3 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Sign In to Admin Portal</span>
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
