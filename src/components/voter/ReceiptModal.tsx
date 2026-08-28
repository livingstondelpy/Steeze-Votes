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
  MessageCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { VoteRecord, Transaction, Contest } from '../../types';

interface ReceiptModalProps {
  receipt: VoteRecord;
  transaction?: Transaction;
  contest: Contest;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  transaction,
  contest,
  onClose,
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 text-gray-900 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Header */}
        <div className="text-center pt-2 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2.5">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">
            Vote Confirmed and Verified
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Official SteezeVotes Digital Receipt
          </p>
        </div>

        {/* Receipt Card */}
        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-3 font-sans text-xs">
          
          {/* Receipt Code Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <span className="text-gray-500 font-medium uppercase tracking-wider text-[11px]">
              Receipt Code
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-amber-700 font-mono font-bold text-sm">
                {receipt.receiptCode}
              </span>
              <button
                onClick={copyCode}
                title="Copy receipt code"
                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {copied && (
            <p className="text-[10px] text-emerald-600 text-right -mt-2 font-medium">
              Receipt code copied to clipboard!
            </p>
          )}

          {/* Details Rows */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Nominee</span>
              <span className="font-bold text-gray-900">{receipt.nomineeName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Contest</span>
              <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
                {receipt.contestTitle}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Vote Type</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                receipt.voteType === 'free'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {receipt.voteType === 'free' ? '1 Free Vote (Verified)' : `${receipt.voteCount} Paid Votes Bundle`}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Voter Phone</span>
              <span className="font-mono text-gray-800">{receipt.voterPhoneMasked}</span>
            </div>

            {transaction && (
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-gray-900">
                  GHS {transaction.totalChargedGhs.toFixed(2)} ({transaction.momoNetwork} MoMo)
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-500">Date and Time</span>
              <span className="text-gray-700">
                {new Date(receipt.createdAt).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* QR Verification and Security Footprint */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-gray-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Audit Hash Verified
              </p>
              <p className="text-[10px] text-gray-500 max-w-[190px]">
                Scan QR or lookup code on SteezeVotes to verify this ballot in the tamper-proof ledger.
              </p>
            </div>

            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
              <QRCodeSVG
                value={receiptUrl}
                size={64}
                level="M"
                includeMargin={false}
              />
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2">
          <button
            onClick={shareWhatsApp}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Share Receipt on WhatsApp
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs transition-colors"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
