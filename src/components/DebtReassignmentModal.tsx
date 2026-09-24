'use client';

import React, { useState } from 'react';
import { Participant } from '@/lib/types';
import { ArrowRightLeft, ShieldCheck, X, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface DebtReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  settlement: {
    id: string;
    fromParticipantId: string;
    toParticipantId: string;
    amount: number;
  } | null;
  onReassignDebt: (params: {
    originalDebtorId: string;
    surrogateDebtorId: string;
    creditorId: string;
    amount: number;
    reason: string;
  }) => void;
}

export const DebtReassignmentModal: React.FC<DebtReassignmentModalProps> = ({
  isOpen,
  onClose,
  participants,
  settlement,
  onReassignDebt,
}) => {
  const [surrogateId, setSurrogateId] = useState<string>('');
  const [amount, setAmount] = useState<number>(settlement?.amount || 0);
  const [reason, setReason] = useState<string>('');

  // Sync state if settlement changes
  React.useEffect(() => {
    if (settlement) {
      setAmount(settlement.amount);
      const eligibleSurrogates = participants.filter(
        (p) => p.id !== settlement.fromParticipantId && p.id !== settlement.toParticipantId
      );
      if (eligibleSurrogates.length > 0) {
        setSurrogateId(eligibleSurrogates[0].id);
      }
    }
  }, [settlement, participants]);

  if (!isOpen || !settlement) return null;

  const originalDebtor = participants.find((p) => p.id === settlement.fromParticipantId);
  const creditor = participants.find((p) => p.id === settlement.toParticipantId);
  const eligibleSurrogates = participants.filter(
    (p) => p.id !== settlement.fromParticipantId && p.id !== settlement.toParticipantId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surrogateId || amount <= 0 || !reason.trim()) return;

    onReassignDebt({
      originalDebtorId: settlement.fromParticipantId,
      surrogateDebtorId: surrogateId,
      creditorId: settlement.toParticipantId,
      amount,
      reason,
    });
    onClose();
  };

  const surrogate = participants.find((p) => p.id === surrogateId);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-surface-overlay border border-surface-hairline rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-hairline bg-surface-base flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif-display font-bold text-ink-primary flex items-center gap-2">
                Reassign Debt / Transfer IOU
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  F18 Multi-Hop
                </span>
              </h3>
              <p className="text-xs text-ink-secondary">
                Transfer debt liability to an external surrogate with cryptographic audit trail.
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Debt Card */}
          <div className="p-4 rounded-2xl bg-surface-base border border-surface-hairline flex items-center justify-between">
            <div className="text-xs">
              <span className="text-ink-muted block uppercase text-[10px] font-bold">Current Obligation</span>
              <span className="font-bold text-ink-primary text-sm">{originalDebtor?.name}</span>
              <span className="text-ink-muted mx-1.5">owes</span>
              <span className="font-bold text-emerald-400 text-sm">{creditor?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-ink-muted block uppercase text-[10px] font-bold">Pending Amount</span>
              <span className="text-lg font-numeric font-bold text-ledger-deficit">
                ₹{settlement.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Transfer Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Assign Liability To (Surrogate Debtor)
              </label>
              <select
                value={surrogateId}
                onChange={(e) => setSurrogateId(e.target.value)}
                required
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-xs text-ink-primary focus:border-emerald-500 outline-none cursor-pointer"
              >
                {eligibleSurrogates.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.isOrganizer ? 'Organizer' : 'Member'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Reassigned Amount (₹ INR)
              </label>
              <input
                type="number"
                max={settlement.amount}
                min={1}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-sm font-numeric font-bold text-ink-primary focus:border-emerald-500 outline-none"
              />
              <span className="text-[11px] text-ink-muted mt-1 block">
                Can transfer full ₹{settlement.amount.toLocaleString('en-IN')} or partial share.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Reason / Note for Reassignment
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Rahul paid my train ticket offline in cash"
                required
                className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 text-xs text-ink-primary focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Preview banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-ink-secondary flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <p>
              Once confirmed, <strong className="text-ink-primary">{surrogate?.name || 'Surrogate'}</strong> will become liable to pay <strong className="text-ink-primary">{creditor?.name}</strong> for ₹{amount.toLocaleString('en-IN')}, relieving <strong className="text-ink-primary">{originalDebtor?.name}</strong> of this debt on the immutable ledger.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-between border-t border-surface-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amount <= 0 || !reason.trim()}
              className="px-5 py-2.5 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold text-xs flex items-center gap-2 shadow-subtle active:scale-95 disabled:opacity-50 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Debt Reassignment</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
