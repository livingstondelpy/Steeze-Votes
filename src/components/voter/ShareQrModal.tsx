import React, { useState } from 'react';
import { X, Share2, Copy, Check, QrCode, ExternalLink, MessageCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Contest } from '../../types';

interface ShareQrModalProps {
  contest: Contest;
  onClose: () => void;
}

export const ShareQrModal: React.FC<ShareQrModalProps> = ({
  contest,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/#contest/${contest.slug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `🗳️ Vote now in "${contest.title}" on SteezeVotes! Free phone-verified vote and MoMo bundles available:%0A${encodeURIComponent(shareUrl)}`;
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="bg-white border border-gray-200 rounded-3xl max-w-sm w-full p-6 text-gray-900 shadow-2xl relative text-center animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-gray-900">
          Share Voting Link and QR Code
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-4 line-clamp-1">
          {contest.title}
        </p>

        {/* QR Code */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 inline-block shadow-2xs mx-auto mb-4">
          <QRCodeSVG value={shareUrl} size={160} />
        </div>

        <p className="text-[11px] text-gray-500 mb-4">
          Scan with any smartphone camera to open the official ballot instantly.
        </p>

        {/* Share Buttons */}
        <div className="space-y-2">
          <button
            onClick={shareWhatsApp}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 font-mono focus:outline-none"
            />
            <button
              onClick={copyUrl}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
