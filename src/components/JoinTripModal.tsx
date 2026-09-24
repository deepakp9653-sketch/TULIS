'use client';

import React, { useState } from 'react';
import { X, Key, User, QrCode, ArrowRight, CheckCircle2, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinTrip: (inviteCode: string, travelerName: string, travelerEmail: string, upiId: string) => Promise<boolean> | boolean;
}

export const JoinTripModal: React.FC<JoinTripModalProps> = ({
  isOpen,
  onClose,
  onJoinTrip,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!inviteCode.trim() || !name.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await onJoinTrip(
        inviteCode.trim().toUpperCase(),
        name.trim(),
        email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@fareshare.in`,
        upiId.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@upi`
      );

      if (success) {
        setInviteCode('');
        setName('');
        setEmail('');
        setUpiId('');
        onClose();
      } else {
        setErrorMessage('Invalid 6-character Trip Invite Code. Please verify with your organizer.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to join trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-indigo text-surface-base flex items-center justify-center shadow-indigo">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                Join Trip via Invite Code
              </h3>
              <p className="text-xs text-ink-secondary">
                Enter the 6-character code provided by your trip organizer.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-ledger-deficitBg border border-ledger-deficit/40 text-ledger-deficit text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-ink-muted mb-1 font-semibold uppercase tracking-wider text-[11px]">
              6-Character Trip Invite Code
            </label>
            <input
              type="text"
              required
              maxLength={8}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. GOA2026"
              className="w-full bg-surface-base border-2 border-surface-hairline rounded-xl px-3 py-2.5 font-numeric font-bold text-ink-primary tracking-widest text-lg uppercase focus:border-brand-indigo outline-none text-center"
            />
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-semibold">Your Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deepak V"
                className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary font-medium focus:border-brand-indigo outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-semibold">Email Address (Optional)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deepak@fareshare.in"
                className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary font-medium focus:border-brand-indigo outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-ink-muted mb-1 font-semibold">UPI VPA for Instant Payments (Optional)</label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="deepak@okicici"
                className="w-full bg-surface-base border border-surface-hairline rounded-xl pl-9 pr-3 py-2.5 text-ink-primary font-medium focus:border-brand-indigo outline-none font-numeric"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-xl font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all mt-2 ${
              isSubmitting
                ? 'bg-neutral-800 text-neutral-400 cursor-not-allowed'
                : 'bg-ink-primary text-surface-base hover:opacity-90 cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
                <span>Connecting to Squad Ledger...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Join Trip Roster & Launch Ledger</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
