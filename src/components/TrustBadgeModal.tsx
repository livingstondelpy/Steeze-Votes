import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Smartphone, 
  Scale, 
  FileCheck, 
  Receipt, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface TrustBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewExplainer?: () => void;
}

export const TrustBadgeModal: React.FC<TrustBadgeModalProps> = ({
  isOpen,
  onClose,
  onViewExplainer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full p-6 text-gray-900 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  Verified by SteezeVotes
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Ghana Trust Standard
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Rooted Steeze Studios (RSS) Vote Integrity and Escrow Guarantee
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3 text-xs text-gray-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>1 Phone = 1 Free Vote</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Free votes require SMS OTP verification. We keep your phone number safe and prevent anyone from voting twice for free.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>24-Hour Dispute Hold</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                When a contest closes, organizer payouts are held in escrow for 24 hours to audit tallies and ensure fair results.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                <Receipt className="w-4 h-4 text-blue-600" />
                <span>Permanent Digital Receipts</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Every vote issues a unique receipt code (e.g. STZ-GH-XXXXXX) viewable anytime on our Check My Vote page.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold">
                <FileCheck className="w-4 h-4 text-purple-600" />
                <span>Signed PDF Certificates</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Final results generate an official certified summary for organizers, sponsors, and auditing bodies.
              </p>
            </div>

          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          {onViewExplainer ? (
            <button
              onClick={() => { onClose(); onViewExplainer(); }}
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              Read Full Integrity Policy <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : <span />}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
