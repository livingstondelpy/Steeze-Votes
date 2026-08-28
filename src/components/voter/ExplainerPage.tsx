import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  Scale, 
  Receipt, 
  FileCheck, 
  CheckCircle2, 
  ArrowLeft, 
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface ExplainerPageProps {
  onBackToContests: () => void;
  onNavigateToOrganizers?: () => void;
}

export const ExplainerPage: React.FC<ExplainerPageProps> = ({ 
  onBackToContests,
  onNavigateToOrganizers,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBackToContests}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        {/* Hero */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Rooted Steeze Studios (RSS) Trust Standard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How SteezeVotes Keeps Every Vote Honest
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Built specifically for Ghanaian event organizers, award schemes, and pageants. We make sure every vote is genuine, verified on mobile, and protected by escrow.
          </p>
        </div>

        {/* 4 Pillars of Integrity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="bg-white border border-gray-200 p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              1. One Phone, One Free Vote
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              We verify free votes using a quick SMS code sent to your phone. We keep your phone number safe and ensure nobody can vote multiple times for free on the same number.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              2. 24-Hour Dispute Escrow Hold
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              When a contest ends, the money stays safely in escrow for 24 hours. If any organizer or nominee flags an issue, our team investigates the ledger before releasing the funds.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              3. Permanent Digital Receipts and QR Proof
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Every vote gives you a unique receipt code and QR code. You can check your voting history anytime on our Check My Vote page or share proof on WhatsApp.
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              4. Certified Results and PDF Certificates
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              When voting closes, organizers can download an official certified PDF summary showing exact vote counts, timestamps, and verifiable winner records.
            </p>
          </div>

        </div>

        {/* Financial Transparency breakdown */}
        <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-3xl space-y-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Clear Pricing and 90% Organizer Payouts
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            We believe in honest, fair revenue sharing for Ghanaian creative talent and event organizers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Organizer Share</span>
              <p className="text-xl font-bold text-emerald-600">90% Net Payout</p>
              <p className="text-[11px] text-gray-500">Sent straight to your MTN, Telecel, or AT MoMo wallet.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Platform Fee</span>
              <p className="text-xl font-bold text-amber-600">10% Commission</p>
              <p className="text-[11px] text-gray-500">Covers SMS verification, fraud filtering, and server uptime.</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
              <span className="text-[11px] font-semibold text-gray-500 uppercase">Payment Processing</span>
              <p className="text-xl font-bold text-gray-800">1.95% MoMo Fee</p>
              <p className="text-[11px] text-gray-500">Standard Ghana Paystack gateway fee for instant settlements.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <button
            onClick={onBackToContests}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs inline-flex items-center gap-2"
          >
            Explore Live Contests
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
