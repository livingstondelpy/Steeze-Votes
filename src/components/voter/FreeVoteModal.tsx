import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Nominee, Contest, VoteRecord } from '../../types';
import { store } from '../../lib/store';

interface FreeVoteModalProps {
  nominee: Nominee;
  contest: Contest;
  onClose: () => void;
  onSuccess: (receipt: VoteRecord) => void;
  onOpenTrustModal: () => void;
}

export const FreeVoteModal: React.FC<FreeVoteModalProps> = ({
  nominee,
  contest,
  onClose,
  onSuccess,
  onOpenTrustModal,
}) => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 9) {
      setError('Please enter a valid Ghanaian mobile phone number.');
      setLoading(false);
      return;
    }

    const result = store.sendOtp(clean, contest.id);
    setLoading(false);

    if (!result.success) {
      setError(result.message.replace(/—/g, ':').replace(/--/g, ':'));
      return;
    }

    setSimulatedOtp(result.simulatedOtp || null);
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit code sent to your phone.');
      setLoading(false);
      return;
    }

    const result = store.verifyAndCastFreeVote(
      phone,
      contest.id,
      nominee.id,
      otpCode,
      false
    );

    setLoading(false);

    if (!result.success || !result.receipt) {
      setError(result.message.replace(/—/g, ':').replace(/--/g, ':'));
      return;
    }

    // Trigger celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#FBBF24'],
    });

    onSuccess(result.receipt);
    onClose();
  };

  const handleAutoFillOtp = () => {
    if (simulatedOtp) {
      setOtpCode(simulatedOtp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden text-gray-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Cast Your Free Vote</h2>
              <p className="text-xs text-gray-500">Supporting {nominee.stageName || nominee.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Target Nominee Banner */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <img
              src={nominee.photoUrl}
              alt={nominee.name}
              className="w-12 h-12 rounded-xl object-cover border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 truncate">
                {nominee.stageName || nominee.name}
              </h4>
              <p className="text-xs text-gray-500 font-mono">
                Code: {nominee.nomineeCode} • {contest.title}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Enter your phone number to get your free vote
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                    +233
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1.5">
                  Works on MTN, Telecel, and AT numbers. Every Ghana phone number gets 1 free vote per contest.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Verification Code...
                  </>
                ) : (
                  <>
                    Get Free Vote Code
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onOpenTrustModal}
                  className="text-xs text-gray-500 hover:text-gray-800 inline-flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  How we keep your phone number confidential
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {simulatedOtp && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">SMS Test Helper:</span>
                    <span>Your 6-digit code is <strong className="font-mono text-sm">{simulatedOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-xs font-semibold"
                  >
                    {copied ? 'Filled!' : 'Auto-Fill'}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Enter 6-Digit Code sent to {phone}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-xl font-mono py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Confirming Free Vote...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm Free Vote
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="hover:text-gray-800"
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
