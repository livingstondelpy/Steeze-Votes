import React from 'react';
import { ArrowLeft, ShieldCheck, Mail, MessageSquare } from 'lucide-react';

interface AboutPageProps {
  onBackToHome: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBackToHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6 sm:py-8 pb-28 sm:pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        {/* Page Title & Intro Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
            <span>Rooted Steeze Studios • Official Information</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            About SteezeVotes
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Everything you need to know about our voting platform, contest types, security, and the team behind it.
          </p>
        </div>

        {/* Section 1: What is SteezeVotes? */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-3">
          <h2 className="text-lg font-display font-bold text-slate-900">
            What is SteezeVotes?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SteezeVotes is a simple and secure voting platform for Ghanaian pageants, contests and awards. Whether it is a fashion show, a talent competition, a nightlife award, or any contest that needs public voting, SteezeVotes makes it easy for people to vote and for organizers to run everything fairly.
          </p>
        </div>

        {/* Section 2: How Voting Works */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-lg font-display font-bold text-slate-900">
            How Voting Works
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every contest on SteezeVotes is either a Free contest or a Paid contest, and the organizer decides which one before the contest starts.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            On a Free contest, everybody gets one Free Vote. No money changes hands. You just pick your favorite and vote, one time only.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            On a Paid contest, votes cost money and you can buy as many as you like. Organizers can also offer vote bundles, so you can buy in bulk if you want to push your favorite to the top. All payments are made safely through Mobile Money or card.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            After you vote, you get a receipt so you always have proof of your vote.
          </p>
        </div>

        {/* Section 3: About Rooted Steeze Studios */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-3">
          <h2 className="text-lg font-display font-bold text-slate-900">
            About Rooted Steeze Studios
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            SteezeVotes is built and run by Rooted Steeze Studios (RSS), a Ghana-based entertainment and creative production brand. RSS works with event organizers, schools, and creative communities across Ghana to bring people together through music, culture, and competition. SteezeVotes was created to give every organizer, big or small, a simple and trustworthy way to run their own voting contest.
          </p>
        </div>

        {/* Section 4: Trust and Security */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-3">
          <h2 className="text-lg font-display font-bold text-slate-900">
            Trust and Security
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every vote on SteezeVotes is checked and recorded properly. We do not allow one person to vote more than once on a Free contest, and every paid vote is confirmed before it counts. When a contest closes, the results are locked and a certificate is available to prove the final count. Look out for the &quot;Verified by SteezeVotes&quot; badge on every contest, it means the voting was done the right way.
          </p>
        </div>

        {/* Section 5: Contact */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
          <h2 className="text-lg font-display font-bold text-slate-900">
            Contact
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Questions about SteezeVotes? Reach us at rootedsteezestudioss@gmail.com or WhatsApp +233507853143.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="mailto:rootedsteezestudioss@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-600" />
              <span>rootedsteezestudioss@gmail.com</span>
            </a>

            <a
              href="https://api.whatsapp.com/send?phone=233507853143"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp +233507853143</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
