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
  Zap,
  CreditCard
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
  isDark?: boolean;
}

export const PaidVoteModal: React.FC<PaidVoteModalProps> = ({
  nominee,
  contest,
  onClose,
  onSuccess,
  onOpenTrustModal,
  isDark = true,
}) => {
  // Step 1: Bundle selection (preset or custom)
  const defaultTiers: BundleTier[] = contest.bundleTiers.length > 0 ? contest.bundleTiers : [
    { votes: 1, priceGhs: 1, popular: false },
    { votes: 5, priceGhs: 5, popular: false },
    { votes: 20, priceGhs: 20, popular: false },
    { votes: 50, priceGhs: 50, popular: false },
    { votes: 100, priceGhs: 100, popular: true },
  ];

  const [selectedTier, setSelectedTier] = useState<BundleTier>(
    defaultTiers.find((t) => t.popular) || defaultTiers[0]
  );
  const [isCustomVotes, setIsCustomVotes] = useState(false);
  const [customVoteCount, setCustomVoteCount] = useState<number>(150);

  // Step 2: Voter Verification & MoMo provider
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>('MTN');
  const [voterPhone, setVoterPhone] = useState('');
  const [consentedMarketing, setConsentedMarketing] = useState(false);
  
  // Checkout flow state: 1: bundle, 2: momo details, 3: ussd prompt / approval
  const [step, setStep] = useState<'bundle' | 'checkout' | 'processing'>('bundle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Price calculations
  const unitRate = defaultTiers[0]?.priceGhs ? defaultTiers[0].priceGhs / defaultTiers[0].votes : 1.0;
  const activeVotes = isCustomVotes ? Math.max(1, customVoteCount) : selectedTier.votes;
  const priceGhs = isCustomVotes ? +(activeVotes * unitRate).toFixed(2) : selectedTier.priceGhs;
  const paystackFeeGhs = calculatePaystackFee(priceGhs);
  const totalChargedGhs = +(priceGhs + paystackFeeGhs).toFixed(2);

  const handleGoToCheckout = () => {
    setError(null);
    if (isCustomVotes && (!customVoteCount || customVoteCount < 1)) {
      setError('Please enter at least 1 vote for custom supporter volume.');
      return;
    }
    setStep('checkout');
  };

  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = voterPhone.replace(/[^0-9]/g, '');
    if (clean.length < 9) {
      setError('Please enter a valid 9 or 10-digit Ghanaian mobile number (e.g., 0244123456).');
      return;
    }

    setStep('processing');
  };

  const handleSimulateMoMoApproval = () => {
    setLoading(true);
    setError(null);

    setTimeout(async () => {
      try {
        const result = await store.processPaidVote({
          contestId: contest.id,
          nomineeId: nominee.id,
          voteCount: activeVotes,
          amountGhs: priceGhs,
          voterPhone,
          momoNetwork,
          consentedMarketing,
        });

        setLoading(false);

        if (!result.success || !result.receipt || !result.transaction) {
          setError(result.message);
          setStep('checkout');
          return;
        }

        // Confetti burst
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#dc2626', '#10b981', '#f59e0b'],
        });

        onSuccess(result.receipt, result.transaction);
        onClose();
      } catch (err: unknown) {
        setLoading(false);
        const errObj = err as { message?: string };
        setError(errObj.message || 'Payment verification failed. Please try again.');
        setStep('checkout');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="rounded-2xl bg-white text-slate-900 p-5 sm:p-7 max-w-lg w-full max-h-[90dvh] overflow-y-auto my-auto border border-slate-200 shadow-xl relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-2xs">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-500 block">
                Official Ballot Checkout
              </span>
              <h3 className="text-sm font-semibold text-slate-900 truncate max-w-[260px] sm:max-w-xs">
                Vote For {nominee.stageName || nominee.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Context Pill */}
        <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={nominee.photoUrl}
              alt={nominee.name}
              className="w-9 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-xs truncate">
                {nominee.stageName || nominee.name}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                Code: <strong className="text-slate-800">{nominee.nomineeCode}</strong>
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-white text-slate-600 border border-slate-200">
            {contest.category}
          </span>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: SELECT VOTE BUNDLE */}
        {step === 'bundle' && (
          <div className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900">
                Step 1: Choose Vote Bundle
              </label>
              <span className="text-[11px] text-slate-500">
                GHC 1.00 = 1 Vote
              </span>
            </div>

            {/* Fast Bundle Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {defaultTiers.map((tier) => {
                const isSelected = !isCustomVotes && selectedTier.votes === tier.votes;
                return (
                  <button
                    key={tier.votes}
                    type="button"
                    onClick={() => {
                      setIsCustomVotes(false);
                      setSelectedTier(tier);
                    }}
                    className={`relative p-2.5 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'bg-rose-50/70 border-rose-600 text-slate-900 ring-1 ring-rose-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-rose-600 text-white shadow-2xs">
                        Popular
                      </span>
                    )}
                    <p className="text-sm font-semibold text-slate-900 tabular-nums">
                      {tier.votes} {tier.votes === 1 ? 'Vote' : 'Votes'}
                    </p>
                    <p className="text-xs font-medium text-rose-600 mt-0.5">
                      GHC {tier.priceGhs.toFixed(2)}
                    </p>
                  </button>
                );
              })}

              {/* Custom Input Option Pill */}
              <button
                type="button"
                onClick={() => setIsCustomVotes(true)}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  isCustomVotes
                    ? 'bg-rose-50/70 border-rose-600 ring-1 ring-rose-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <p className="text-xs font-semibold text-slate-900">
                  Custom Bulk
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Type any votes
                </p>
              </button>
            </div>

            {/* Custom Input Field if enabled */}
            {isCustomVotes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-medium text-slate-600 block">
                  Enter High-Volume Supporter Votes:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={customVoteCount}
                    onChange={(e) => setCustomVoteCount(parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-900 font-semibold text-sm focus:outline-none focus:border-rose-500"
                    placeholder="e.g. 250"
                  />
                  <div className="text-right px-2">
                    <p className="text-xs font-semibold text-rose-600">
                      = GHC {priceGhs.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Summary & Proceed */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-medium block">Total Bundle</span>
                <span className="text-base font-bold text-slate-900 tabular-nums">
                  GHC {priceGhs.toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleGoToCheckout}
                className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs transition-colors flex items-center gap-1.5 active:scale-98"
              >
                Continue to Payment <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VOTER VERIFICATION & MOMO */}
        {step === 'checkout' && (
          <form onSubmit={handleInitiatePayment} className="mt-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-900">
                Step 2: Mobile Money &amp; Voter Verification
              </label>
              <button
                type="button"
                onClick={() => setStep('bundle')}
                className="text-xs text-rose-600 hover:underline"
              >
                Change Bundle
              </button>
            </div>

            {/* Network Selector */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500">Select Provider / Network:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['MTN', 'Telecel', 'AT'] as MomoNetwork[]).map((net) => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setMomoNetwork(net)}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      momoNetwork === net
                        ? 'bg-rose-50 border-rose-600 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {net === 'MTN' ? 'MTN MoMo' : net === 'Telecel' ? 'Telecel Cash' : 'AT Money'}
                  </button>
                ))}
              </div>
            </div>

            {/* Voter Phone Input */}
            <div className="space-y-1">
              <label className="text-[11px] text-slate-600 block">
                Ghanaian Mobile Number (for USSD approval prompt):
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="024 123 4567"
                  value={voterPhone}
                  onChange={(e) => setVoterPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs sm:text-sm focus:outline-none focus:border-rose-500 focus:bg-white pl-9"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{activeVotes} Verified Vote(s):</span>
                <span className="text-slate-900 font-mono">GHC {priceGhs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Processor Fee (1.95%):</span>
                <span className="text-slate-700 font-mono">GHC {paystackFeeGhs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 font-semibold">
                <span className="text-slate-900">Total Deducted:</span>
                <span className="text-rose-600 font-mono text-sm">GHC {totalChargedGhs.toFixed(2)}</span>
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2 text-[11px] text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={consentedMarketing}
                onChange={(e) => setConsentedMarketing(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-0"
              />
              <span>Send me official digital receipt confirmation and contest winner results via SMS.</span>
            </label>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('bundle')}
                className="py-2 px-3.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs shadow-2xs transition-colors flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Lock className="w-3.5 h-3.5" /> Pay GHC {totalChargedGhs.toFixed(2)}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: USSD PROMPT SIMULATION / INSTANT CONFIRMATION */}
        {step === 'processing' && (
          <div className="mt-4 space-y-3.5 text-center py-2">
            <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 mx-auto flex items-center justify-center animate-pulse">
              <Smartphone className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900">
                USSD Approval Prompt Sent
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Check phone <strong className="text-slate-900 font-mono">{voterPhone}</strong> for an authorization prompt from{' '}
                <strong className="text-rose-600">{momoNetwork} Mobile Money</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="text-slate-900 font-semibold font-mono">GHC {totalChargedGhs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="text-slate-700">Rooted Steeze Studios / SteezeVotes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ballot Allocation:</span>
                <span className="text-rose-600 font-semibold">{activeVotes} Votes for {nominee.stageName || nominee.name}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={handleSimulateMoMoApproval}
                className="w-full py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-98 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying Mobile Money PIN...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Simulate PIN Entered &amp; Confirm Vote
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Cancel or try another number
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
