import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, Trophy, HelpCircle, X, ShieldCheck } from 'lucide-react';

interface FloatingQuickActionProps {
  onOpenMyVotes: () => void;
  onOpenTrustModal: () => void;
  isDark?: boolean;
}

export const FloatingQuickAction: React.FC<FloatingQuickActionProps> = ({
  onOpenMyVotes,
  onOpenTrustModal,
  isDark = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppSupport = () => {
    const text = encodeURIComponent("Hello SteezeVotes Support, I have an inquiry regarding voting / payment on SteezeVotes Ghana.");
    window.open(`https://wa.me/233240000000?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
      
      {/* Expanded Quick Menu */}
      {isOpen && (
        <div
          className="mb-2 p-3 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-lg w-64 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-rose-600" /> Quick Actions
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenMyVotes();
            }}
            className="w-full px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors text-left hover:bg-slate-50 text-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Check My Votes &amp; Receipts</p>
              <p className="text-[10px] text-slate-500">Verify voter audit trail</p>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              handleWhatsAppSupport();
            }}
            className="w-full px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors text-left hover:bg-slate-50 text-slate-700"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">WhatsApp Support</p>
              <p className="text-[10px] text-slate-500">Mobile Money payment assist</p>
            </div>
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              onOpenTrustModal();
            }}
            className="w-full px-2.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2.5 transition-colors text-left hover:bg-slate-50 text-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-900">Trust &amp; Verification</p>
              <p className="text-[10px] text-slate-500">Security guarantee</p>
            </div>
          </button>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle quick actions widget"
        className="group relative flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md border border-slate-700 transition-all duration-150 active:scale-95 text-xs font-medium"
      >
        <span className="relative flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span>{isOpen ? 'Close' : 'Quick Assist'}</span>
        <MessageCircle className="w-3.5 h-3.5" />
      </button>

    </div>
  );
};
