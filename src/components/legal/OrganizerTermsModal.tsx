import React from 'react';
import { X, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface OrganizerTermsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onAccept?: () => void;
  hasAccepted?: boolean;
}

export const OrganizerTermsModal: React.FC<OrganizerTermsModalProps> = ({
  isOpen = true,
  onClose,
  onAccept,
  hasAccepted = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">SteezeVotes Organizer Terms &amp; Conditions</h2>
              <p className="text-xs text-gray-500">Rooted Steeze Studios (RSS) - Platform Operator Agreement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Terms Text */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4 text-xs text-gray-700 leading-relaxed">
          <p className="font-medium text-gray-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
            By creating a contest on SteezeVotes, you agree to the following terms with Rooted Steeze Studios (RSS), the platform operator.
          </p>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">1. CONTEST TYPES</h3>
            <p className="mb-1">You must choose your contest type at setup: Free or Paid. This choice is locked once your contest is published and cannot be changed.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Free contests:</strong> voters get 1 free verified vote each. No money changes hands, and RSS charges no fee.</li>
              <li><strong>Paid contests:</strong> voters get 1 free verified vote plus the option to buy extra votes. RSS charges a 10% commission on paid vote revenue.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">2. PAYMENTS AND PAYOUTS</h3>
            <p>
              All paid votes are processed through Paystack. A small Paystack processing fee (about 1.95%) is added to the voter&apos;s payment automatically, it is not deducted from your earnings.<br />
              You receive 90% of all paid vote revenue. RSS keeps 10% as a platform fee.<br />
              Your earnings are held safely until your contest&apos;s voting window closes, then for a further 24 hours before payout, to allow time to check for any problems. After that, your payout is sent to your registered Mobile Money number.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">3. YOUR RESPONSIBILITIES</h3>
            <p>
              You are responsible for the accuracy of your contest details, contestant information, and images. You confirm you have permission to use every photo and bio you upload.<br />
              You cannot add new contestants once your contest is live. If you need to add someone, you must end the contest and start a new one.<br />
              You can update contestant photos or fix small mistakes in bios after publishing, but you cannot change a contestant&apos;s vote count or delete a contestant once they have votes.<br />
              You can extend your voting end date while the contest is still running, but not after it has closed.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">4. CONTEST REVIEW</h3>
            <p>
              Every contest goes through a short review by RSS before it goes live, to check the details are appropriate. RSS may reject or ask you to fix a contest before approving it.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">5. CONTEST LIMITS</h3>
            <p>
              You may run up to 4 active contests at the same time. There is no limit to how many contests you can run over time.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">6. DISPUTES AND FRAUD</h3>
            <p>
              If unusual voting activity is detected on your contest, your payout may be paused for review. RSS will investigate any dispute using the platform&apos;s records before releasing or withholding payment.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">7. VOTER DATA</h3>
            <p>
              You will not have access to voters&apos; phone numbers. Only RSS can access this information, to protect voter privacy. If you choose to collect consented contact information from voters, that data will still be managed by RSS on your behalf.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">8. ACCOUNT SUSPENSION</h3>
            <p>
              RSS may suspend or close any contest found to violate these terms, including fraud, offensive content, or misuse of the platform.
            </p>
          </div>

          <p className="font-semibold text-gray-900 border-t border-gray-100 pt-2">
            By publishing a contest, you confirm you have read, understood, and agreed to these terms.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Protected by SteezeVotes Escrow Guarantee
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors w-full sm:w-auto"
            >
              Close
            </button>
            {onAccept && !hasAccepted && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4" /> Accept Terms
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

