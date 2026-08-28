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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden p-8 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            RSS Admin Supervisory Log In
          </h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Authorized Rooted Steeze Studios administrators only.
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-700" />
            <span>Master Admin Login Credentials</span>
          </div>
          <p className="text-[11px] font-mono text-amber-800">
            Email: <strong className="font-bold">admin@steezevotes.com</strong> <br />
            Password: <strong className="font-bold">admin123</strong>
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Admin Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@steezevotes.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Master Admin Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>Sign In to Admin Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {onBackToHome && (
          <div className="text-center pt-2">
            <button
              onClick={onBackToHome}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium underline"
            >
              ← Back to SteezeVotes Public Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
