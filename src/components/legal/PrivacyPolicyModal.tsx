import React from 'react';
import { X, Shield, Lock, Database } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen?: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen = true, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">SteezeVotes Privacy Policy</h2>
              <p className="text-xs text-gray-500">Rooted Steeze Studios (RSS) - Public Privacy &amp; Data Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Privacy Policy Content */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2 space-y-4 text-xs text-gray-700 leading-relaxed">
          <p className="font-medium text-gray-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
            Your privacy matters to us. Here is what we collect and how we use it.
          </p>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider">WHAT WE COLLECT</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Your phone number, when you cast a free vote (to verify you and prevent duplicate free votes) or a paid vote (to confirm your purchase)
              </li>
              <li>
                Payment details are handled directly by Paystack, our secure payment partner. We do not store your card or Mobile Money details ourselves.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider">HOW WE USE YOUR INFORMATION</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To verify your free vote with a one-time code (OTP)</li>
              <li>To send you a receipt confirming your paid vote</li>
              <li>To let you look up your own voting history using your phone number</li>
              <li>If you choose to opt in, an event organizer may use your number to contact you about future events. This is always optional and only happens if you say yes.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider">WHO CAN SEE YOUR INFORMATION</h3>
            <p>
              Contest organizers cannot see or download your phone number. Only Rooted Steeze Studios (RSS), as the platform operator, can access voter contact information, and only for the purposes described above.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider">HOW WE KEEP YOUR INFORMATION SAFE</h3>
            <p>
              Your data is stored securely and is not sold to third parties.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider">YOUR RIGHTS</h3>
            <p>
              You can request that we delete your information by contacting us. You can also choose not to opt in to organizer marketing at any time.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-1 uppercase tracking-wider">CONTACT US</h3>
            <p>
              If you have questions about your data, reach us through the contact details on our website.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Lock className="w-4 h-4 text-emerald-600" /> Protected by SteezeVotes Data Privacy Controls
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

