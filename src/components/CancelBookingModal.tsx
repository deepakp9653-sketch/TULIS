import React, { useState } from 'react';
import { Booking, Expense, RefundPolicy, Participant } from '@/lib/types';
import { X, AlertTriangle, ShieldCheck, RefreshCw, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  expenses: Expense[];
  participants: Participant[];
  onConfirmCancel: (
    bookingId: string,
    policy: RefundPolicy,
    refundPercent: number,
    reason: string
  ) => void;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  expenses,
  participants,
  onConfirmCancel,
}) => {
  const [policy, setPolicy] = useState<RefundPolicy>('full');
  const [refundPercent, setRefundPercent] = useState<number>(100);
  const [reason, setReason] = useState<string>('');

  if (!isOpen || !booking) return null;

  const bookingExpenses = expenses.filter((e) => e.bookingId === booking.id);
  const totalIncurred = bookingExpenses.reduce((sum, e) => sum + e.totalAmount, 0);

  const calculateEstimatedRefund = (): number => {
    if (policy === 'non_refundable') return 0;
    if (policy === 'full') return totalIncurred;
    return Number(((totalIncurred * refundPercent) / 100).toFixed(2));
  };

  const estimatedRefund = calculateEstimatedRefund();
  const netLoss = totalIncurred - estimatedRefund;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmCancel(
      booking.id,
      policy,
      policy === 'full' ? 100 : policy === 'non_refundable' ? 0 : refundPercent,
      reason || `Cancelled booking "${booking.title}".`
    );
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-surface-card border border-surface-border rounded-2xl p-6 w-full max-w-lg shadow-2xl relative text-ink-primary"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink-primary rounded-full hover:bg-surface-elevated transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Cancel Booking</h3>
              <p className="text-sm text-ink-muted">{booking.title}</p>
            </div>
          </div>

          {/* Booking Summary Pill */}
          <div className="bg-surface-elevated border border-surface-border rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Vendor:</span>
              <span className="font-semibold">{booking.vendor}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Logged Expenses Total:</span>
              <span className="font-semibold text-accent-cyan">₹{totalIncurred.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Scoped Travelers:</span>
              <span className="font-medium">{(booking.participantIds || []).length} members</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Refund Policy Selector */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
                Cancellation & Refund Policy
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPolicy('full');
                    setRefundPercent(100);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2 ${
                    policy === 'full'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-surface-border bg-surface-elevated text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">100% Full Refund</div>
                    <div className="text-[10px] opacity-75">Vendor returns full amount</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPolicy('partial');
                    setRefundPercent(50);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2 ${
                    policy === 'partial'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-surface-border bg-surface-elevated text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">Partial % Refund</div>
                    <div className="text-[10px] opacity-75">Partial vendor refund fee</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPolicy('per_head');
                    setRefundPercent(75);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2 ${
                    policy === 'per_head'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-surface-border bg-surface-elevated text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  <DollarSign className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">Per-Head Refund</div>
                    <div className="text-[10px] opacity-75">Refund specific members</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPolicy('non_refundable');
                    setRefundPercent(0);
                  }}
                  className={`p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-2 ${
                    policy === 'non_refundable'
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-surface-border bg-surface-elevated text-ink-muted hover:border-ink-muted'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="font-bold">No Refund</div>
                    <div className="text-[10px] opacity-75">100% loss / non-refundable</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Custom Refund Percentage Slider if Partial */}
            {policy === 'partial' && (
              <div className="bg-surface-elevated p-4 rounded-xl border border-surface-border">
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span>Refund Percentage:</span>
                  <span className="text-amber-400">{refundPercent}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="95"
                  step="5"
                  value={refundPercent}
                  onChange={(e) => setRefundPercent(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            )}

            {/* Cancellation Reason */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
                Reason for Cancellation
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Bad weather / change of plans"
                className="w-full px-4 py-2.5 bg-surface-elevated border border-surface-border rounded-xl text-sm focus:outline-none focus:border-accent-cyan"
              />
            </div>

            {/* Refund Impact Breakdown */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-1.5">
              <div className="font-bold text-emerald-400 flex items-center justify-between">
                <span>Ledger Refund Allocation:</span>
                <span>₹{estimatedRefund.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-ink-muted text-[11px]">
                Original payers will receive vendor credit. Participant debts for this booking will be automatically reduced by ₹
                {estimatedRefund.toLocaleString('en-IN')}.
              </p>
              {netLoss > 0 && (
                <div className="text-amber-400 text-[11px] pt-1 border-t border-emerald-500/20 flex justify-between">
                  <span>Group Unabsorbed Cancellation Loss:</span>
                  <span className="font-bold">₹{netLoss.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-surface-border text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20 transition flex items-center gap-2"
              >
                Confirm Cancellation & Issue Refund
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
