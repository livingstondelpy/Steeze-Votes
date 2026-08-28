import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Lock,
  Tag,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Nominee, Contest, BundleTier, MomoNetwork, VoteRecord, Transaction } from '../../types';
import { store, calculatePaystackFee } from '../../lib/store';

interface PaidVoteModalProps {
  nominee: Nominee;
  contest: Contest;
  onClose: () => void;
  onSuccess: (receipt: VoteRecord, tx: Transaction) => void;
  onOpenTrustModal: () => void;
}

export const PaidVoteModal: React.FC<PaidVoteModalProps> = ({
  nominee,
  contest,
  onClose,
  onSuccess,
  onOpenTrustModal,
}) => {
  const [selectedTier, setSelectedTier] = useState<BundleTier>(
    contest.bundleTiers.find((t) => t.popular) || contest.bundleTiers[0]
  );
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>('MTN');
  const [voterPhone, setVoterPhone] = useState('');
  const [consentedMarketing, setConsentedMarketing] = useState(false);
  const [step, setStep] = useState<'select' | 'payment_prompt'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceGhs = selectedTier.priceGhs;
  const paystackFeeGhs = calculatePaystackFee(priceGhs);
  const totalChargedGhs = +(priceGhs + paystackFeeGhs).toFixed(2);

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = voterPhone.replace(/[^0-9]/g, '');
    if (clean.length < 9) {
      setError('Please enter a valid 9 or 10-digit Ghanaian mobile number.');
      return;
    }

    setStep('payment_prompt');
  };

  const handleSimulateMoMoApproval = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      const result = store.processPaidVote({
        contestId: contest.id,
        nomineeId: nominee.id,
        voteCount: selectedTier.votes,
        amountGhs: selectedTier.priceGhs,
        voterPhone,
        momoNetwork,
        consentedMarketing,
      });

      setLoading(false);

      if (!result.success || !result.receipt || !result.transaction) {
        setError(result.message);
        setStep('select');
        return;
      }

      // Confetti animation
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#F59E0B'],
      });

      onSuccess(result.receipt, result.transaction);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden text-gray-900 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Buy Mobile Money Votes</h2>
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
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
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

          {step === 'select' ? (
            <form onSubmit={handleInitiatePayment} className="space-y-6">
              
              {/* Vote Package Tiers Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                  1. Select Vote Package
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {contest.bundleTiers.map((tier) => {
                    const isSelected = selectedTier.id === tier.id;
                    return (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => setSelectedTier(tier)}
                        className={`relative p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20'
                            : 'bg-gray-50/50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {tier.badge && (
                          <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                            {tier.badge}
                          </span>
                        )}

                        <span className="text-base font-bold text-gray-900 block">
                          {tier.votes} {tier.votes === 1 ? 'Vote' : 'Votes'}
                        </span>
                        
                        <span className="text-xs font-semibold text-amber-700 block mt-0.5">
                          GHS {tier.priceGhs.toFixed(2)}
                        </span>

                        {tier.originalPriceGhs && (
                          <span className="text-[10px] text-gray-400 line-through block">
                            GHS {tier.originalPriceGhs.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Money Network Picker */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
                  2. Select Mobile Money Network
                </label>

                <div className="grid grid-cols-3 gap-2.5">
                  {(['MTN', 'Telecel', 'AT'] as MomoNetwork[]).map((network) => {
                    const isSelected = momoNetwork === network;
                    return (
                      <button
                        type="button"
                        key={network}
                        onClick={() => setMomoNetwork(network)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 text-gray-900 font-bold'
                            : 'bg-gray-50/50 border-gray-200 text-gray-600 hover:border-gray-300 font-medium'
                        }`}
                      >
                        <span className="text-xs block">
                          {network === 'MTN' && 'MTN MoMo'}
                          {network === 'Telecel' && 'Telecel Cash'}
                          {network === 'AT' && 'AT Money'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Voter Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  3. Enter Mobile Money Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                    +233
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={voterPhone}
                    onChange={(e) => setVoterPhone(e.target.value)}
                    placeholder="024 123 4567"
                    className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Marketing consent */}
              {contest.collectVoterContacts && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentedMarketing}
                    onChange={(e) => setConsentedMarketing(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-xs text-gray-600 leading-snug">
                    Send me voting updates, contest milestones, and results for {contest.organizerName}.
                  </span>
                </label>
              )}

              {/* Fee Breakdown & Total */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Votes Package ({selectedTier.votes} votes)</span>
                  <span className="font-semibold text-gray-900">GHS {priceGhs.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>Standard MoMo Fee (1.95%)</span>
                  <span>GHS {paystackFeeGhs.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-bold text-sm text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-amber-600">GHS {totalChargedGhs.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Payment Prompt Simulation Screen */
            <div className="space-y-6 text-center py-2">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                <Smartphone className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Authorize MoMo Payment
                </h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  A payment prompt for <strong className="text-gray-900">GHS {totalChargedGhs.toFixed(2)}</strong> has been sent to your <strong className="text-gray-900">{momoNetwork}</strong> phone ({voterPhone}).
                </p>
              </div>

              {/* Ghanaian USSD Instructions */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-left text-xs text-amber-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Mobile Money PIN Prompt:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900">
                  <li>Check your phone screen for the prompt or dial <strong>*170#</strong> (MTN) / <strong>*110#</strong> (Telecel) / <strong>*110#</strong> (AT).</li>
                  <li>Enter your MoMo Secret PIN to authorize.</li>
                  <li>Your votes will be registered instantly once approved.</li>
                </ol>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSimulateMoMoApproval}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Verifying Payment with Network...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      I have approved payment on my phone
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  Cancel or change package
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
