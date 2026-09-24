'use client';

import React, { useState } from 'react';
import { Participant } from '@/lib/types';
import { Bell, MessageSquare, Copy, Check, X, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface NudgeReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripTitle: string;
  participants: Participant[];
  settlements: Array<{
    id: string;
    fromParticipantId: string;
    toParticipantId: string;
    amount: number;
    status: string;
  }>;
  onSendNudge: (debtorId: string, amount: number, channel: 'in_app' | 'whatsapp') => void;
}

export const NudgeReminderModal: React.FC<NudgeReminderModalProps> = ({
  isOpen,
  onClose,
  tripTitle,
  participants,
  settlements,
  onSendNudge,
}) => {
  const [tone, setTone] = useState<'friendly' | 'direct' | 'firm'>('friendly');
  const [copied, setCopied] = useState(false);
  const [nudgedUsers, setNudgedUsers] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Unsettled debts
  const unsettled = settlements.filter((s) => s.status !== 'settled');

  const generateDigestText = () => {
    let header = `🌴 *${tripTitle} — Expense Settlement Update* 🌴\n\n`;
    if (tone === 'friendly') {
      header += `Hey everyone! Hope you had an amazing time on the trip. Here is the friendly reminder of the unsettled balances to wrap up our FareShare ledger:\n\n`;
    } else if (tone === 'direct') {
      header += `Hi squad, the final ledger is calculated. Please clear the pending dues below at your earliest convenience:\n\n`;
    } else {
      header += `⚠️ *Final Settlement Reminder*: All trip bookings and bills have been locked. Please clear all pending transfers today:\n\n`;
    }

    let items = '';
    unsettled.forEach((s) => {
      const fromName = participants.find((p) => p.id === s.fromParticipantId)?.name || 'Unknown';
      const toName = participants.find((p) => p.id === s.toParticipantId)?.name || 'Unknown';
      items += `👉 *${fromName}* pays *${toName}*: ₹${s.amount.toLocaleString('en-IN')}\n`;
    });

    if (unsettled.length === 0) {
      items = `🎉 All balances are completely cleared! Zero-sum balanced.\n`;
    }

    const footer = `\n📲 Pay via UPI to Organizer:\nupi://pay?pa=trip.organizer@okaxis&pn=${encodeURIComponent(tripTitle)}&cu=INR\n\n_Generated deterministically by FareShare_`;
    return header + items + footer;
  };

  const handleCopyDigest = async () => {
    const text = generateDigestText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNudge = (s: { id: string; fromParticipantId: string; toParticipantId: string; amount: number }) => {
    onSendNudge(s.fromParticipantId, s.amount, 'in_app');
    setNudgedUsers((prev) => ({ ...prev, [s.id]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-surface-overlay border border-surface-hairline rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-hairline bg-surface-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif-display font-bold text-ink-primary flex items-center gap-2">
                Nudge & Reminder Engine
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  F20 Auto-Digest
                </span>
              </h3>
              <p className="text-xs text-ink-secondary">
                Dispatch courteous in-app reminders and export formatted WhatsApp / Telegram settlement digests.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Pending Debtors Quick Action List */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider block">
              Pending Debts Requiring Settlement ({unsettled.length})
            </span>

            {unsettled.length === 0 ? (
              <div className="p-4 rounded-2xl bg-ledger-surplus/10 border border-ledger-surplus/20 text-center">
                <Check className="w-6 h-6 text-ledger-surplus mx-auto mb-1" />
                <p className="text-xs font-semibold text-ledger-surplus">All squad debts are fully settled!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unsettled.map((s) => {
                  const fromName = participants.find((p) => p.id === s.fromParticipantId)?.name || 'Unknown';
                  const toName = participants.find((p) => p.id === s.toParticipantId)?.name || 'Unknown';
                  const isNudged = nudgedUsers[s.id];

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-2xl bg-surface-base border border-surface-hairline flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-ink-primary">
                          {fromName} owes {toName}
                        </p>
                        <p className="text-xs font-numeric font-bold text-ledger-deficit">
                          ₹{s.amount.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleNudge(s)}
                        disabled={isNudged}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          isNudged
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 cursor-default'
                            : 'bg-surface-overlay border-surface-hairline text-ink-primary hover:border-emerald-500/50 hover:bg-surface-raised'
                        }`}
                      >
                        {isNudged ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Nudged
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-emerald-400" /> Send In-App Nudge
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* WhatsApp / Telegram Digest Generator */}
          <div className="space-y-3 pt-4 border-t border-surface-hairline">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp / Chat Digest Formatter
              </span>
              <div className="flex items-center gap-1">
                {(['friendly', 'direct', 'firm'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`text-[11px] px-2.5 py-0.5 rounded-full capitalize border transition-all ${
                      tone === t
                        ? 'bg-surface-raised text-ink-primary border-surface-raised font-bold'
                        : 'bg-surface-base text-ink-muted border-surface-hairline hover:text-ink-primary'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="w-full p-4 rounded-2xl bg-surface-base border border-surface-hairline text-xs font-mono text-ink-secondary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {generateDigestText()}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-hairline bg-surface-base flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            Tone: <span className="capitalize font-semibold text-ink-primary">{tone}</span> · UPI link embedded
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-all"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleCopyDigest}
              className="px-5 py-2.5 rounded-xl bg-ink-primary text-surface-base font-semibold text-xs flex items-center gap-2 shadow-subtle hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy WhatsApp Digest'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
