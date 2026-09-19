import React, { useState } from 'react';
import { 
  X, 
  Receipt, 
  CheckCircle2, 
  Share2, 
  Copy, 
  Printer, 
  Smartphone, 
  ShieldCheck, 
  ExternalLink,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { VoteRecord, Transaction, Contest } from '../../types';

interface ReceiptModalProps {
  receipt: VoteRecord;
  transaction?: Transaction;
  contest: Contest;
  onClose: () => void;
  isDark?: boolean;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  transaction,
  contest,
  onClose,
  isDark = true,
}) => {
  const [copied, setCopied] = useState(false);

  const receiptUrl = `${window.location.origin}/#my-votes?code=${receipt.receiptCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(receipt.receiptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `🎉 I just cast ${receipt.voteCount} verified vote(s) for ${receipt.nomineeName} in "${receipt.contestTitle}" on SteezeVotes!%0A%0AOfficial Receipt Code: ${receipt.receiptCode}%0AVerify here: ${encodeURIComponent(receiptUrl)}`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareX = () => {
    const text = encodeURIComponent(`🎉 I just cast ${receipt.voteCount} vote(s) for ${receipt.nomineeName} in "${receipt.contestTitle}" on @SteezeVotes Ghana!\n\nReceipt: ${receipt.receiptCode}\nVerify: `);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(receiptUrl)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white text-slate-900 rounded-2xl border border-slate-200 max-w-md w-full max-h-[90dvh] overflow-y-auto my-auto p-5 sm:p-7 shadow-xl relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Header */}
        <div className="text-center pt-1 pb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Cryptographic Ballot
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Vote Confirmed &amp; Recorded
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Official SteezeVotes Public Ledger Receipt
          </p>
        </div>

        {/* Digital Ballot Receipt Card */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3 font-sans text-xs">
          
          {/* Receipt Code Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              Receipt Hash / Code
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-900 font-mono font-bold text-sm tracking-wide">
                {receipt.receiptCode}
              </span>
              <button
                onClick={copyCode}
                title="Copy receipt code"
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {copied && (
            <p className="text-[10px] text-emerald-600 text-right -mt-2 font-semibold">
              Code copied to clipboard!
            </p>
          )}

          {/* Details Table */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Nominee Voted:</span>
              <span className="font-semibold text-slate-900">{receipt.nomineeName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Contest:</span>
              <span className="font-medium text-slate-700 text-right max-w-[200px] truncate">{receipt.contestTitle}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Votes Added:</span>
              <span className="font-bold text-emerald-700 text-sm tabular-nums">+{receipt.voteCount} Verified Votes</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="text-slate-700 font-mono text-[11px]">
                {new Date(receipt.timestamp).toLocaleString()}
              </span>
            </div>

            {transaction && (
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  GHC {transaction.amountGhs.toFixed(2)} ({transaction.momoNetwork || 'Card'})
                </span>
              </div>
            )}
          </div>

          {/* QR Code Verification Box */}
          <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="p-1.5 bg-white rounded-lg border border-slate-200 shrink-0 shadow-2xs">
              <QRCodeSVG
                value={receiptUrl}
                size={60}
                level="M"
              />
            </div>
            <div className="space-y-0.5">
              <p className="text-[11px] font-semibold text-slate-800">
                Tamper-Proof Audit QR
              </p>
              <p className="text-[10px] text-slate-500 leading-snug">
                Scan with any mobile camera to independently audit this vote on the public ledger.
              </p>
            </div>
          </div>

        </div>

        {/* Share & Download Actions */}
        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareWhatsApp}
              className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-98"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={shareX}
              className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 active:scale-98"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-600" /> Share on X
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
