'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Code2,
  Lock,
  Sparkles,
  QrCode,
  DollarSign,
  Users,
  Calendar,
  Layers,
} from 'lucide-react';
import { ReconciliationAudit, Trip, Participant } from '@/lib/types';

interface VerifiedBadgeCardProps {
  trip: Trip;
  participants: Participant[];
  audit: ReconciliationAudit;
  verificationHash: string;
  verifiedAt: string;
  isPublicView?: boolean;
}

export const VerifiedBadgeCard: React.FC<VerifiedBadgeCardProps> = ({
  trip,
  participants,
  audit,
  verificationHash,
  verifiedAt,
  isPublicView = false,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);

  const verificationUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/verified/${trip.id}`
    : `https://tulis.app/verified/${trip.id}`;

  const embedCode = `<iframe src="${verificationUrl}?embed=true" width="400" height="240" frameborder="0" style="border-radius: 16px; overflow: hidden; border: 1px solid #213025;"></iframe>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const shareText = `Verified Travel Ledger on TULIS: "${trip.title}" (${trip.destination}) has achieved 100% Zero-Sum Financial Reconciliation. Proof Hash: ${verificationHash.slice(0, 10)}...`;

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verificationUrl)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + verificationUrl)}`;
    window.open(url, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Badge Certificate Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111A14] via-[#0E1511] to-[#0A0F0C] border-2 border-emerald-500/30 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40"
      >
        {/* Holographic Watermark / Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213025] pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-widest uppercase text-emerald-400 font-bold">
                  TULIS TRUST PROTOCOL
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Grade AAA
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Zero-Sum Invariant Verified
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-[10px] text-stone-400 uppercase tracking-wider">
              Verification Hash
            </div>
            <div className="text-xs text-emerald-300 font-bold tracking-wider">
              {verificationHash.slice(0, 14)}...{verificationHash.slice(-6)}
            </div>
          </div>
        </div>

        {/* Trip Meta */}
        <div className="py-6 space-y-4">
          <div>
            <div className="text-xs font-mono uppercase text-stone-400">Trip Entity</div>
            <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
              {trip.title}
            </div>
            <div className="text-sm text-stone-300 flex items-center gap-2 mt-1">
              <span>📍 {trip.destination}</span>
              <span className="text-stone-500">•</span>
              <span>📅 {trip.startDate} to {trip.endDate}</span>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#16221A] border border-[#233527] space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-400 block">
                Total Volume Audited
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-300">
                ₹{audit.totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#16221A] border border-[#233527] space-y-1">
              <span className="text-[10px] font-mono uppercase text-stone-400 block">
                Reconciliation Drift (Δ)
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 flex items-center gap-1">
                <span>₹{audit.discrepancy.toFixed(2)}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#16221A] border border-[#233527] space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono uppercase text-stone-400 block">
                Audited Squad
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-teal-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-400" />
                <span>{participants.length} Travelers</span>
              </span>
            </div>
          </div>

          {/* Invariant Guarantees */}
          <div className="p-4 rounded-2xl bg-[#131D16] border border-[#26372B] space-y-2 text-xs">
            <div className="font-semibold text-stone-200 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Immutable Ledger Guarantees Confirmed:</span>
            </div>
            <ul className="space-y-1.5 text-stone-400 text-[11px]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero-Sum Conservation: Net balance sum exactly ₹0.00 across all participant ledgers.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bilateral Dispute Resolution: Zero unresolved financial claims or open liens.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Double-Entry Proof: Cryptographically signed against TULIS audit log sequence.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="pt-4 border-t border-[#213025] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Audited on {verifiedAt}</span>
          </div>
          <div className="text-[11px] text-emerald-400/90 font-medium">
            Tulis Verified Ledger
          </div>
        </div>
      </motion.div>

      {/* Share & Embed Bar */}
      <div className="p-5 rounded-3xl bg-[#111A14] border border-[#213025] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Share & Embed Verification
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-[#16221A] hover:bg-[#203025] border border-[#26372B] text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowEmbedCode(!showEmbedCode)}
              className="px-3 py-1.5 rounded-xl bg-[#16221A] hover:bg-[#203025] border border-[#26372B] text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Embed</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={shareToTwitter}
            className="px-3 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/40 text-sky-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Twitter / X</span>
          </button>
          <button
            onClick={shareToWhatsApp}
            className="px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>WhatsApp</span>
          </button>
          <button
            onClick={shareToLinkedIn}
            className="px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>LinkedIn</span>
          </button>
        </div>

        {/* Embed Code Drawer */}
        {showEmbedCode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 space-y-2 border-t border-[#213025]"
          >
            <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
              <span>HTML IFrame Embed Code:</span>
              <button
                onClick={handleCopyEmbed}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
              >
                {copiedEmbed ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedEmbed ? 'Copied' : 'Copy Embed'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-[#090D0B] border border-[#213025] text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
};
