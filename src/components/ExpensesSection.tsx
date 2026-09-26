'use client';

import React, { useState } from 'react';
import { Expense, Participant, Booking, RefundEvent } from '@/lib/types';
import { Receipt, Plus, Search, Calendar, FileText, ExternalLink, X, CheckCircle2, Image as ImageIcon, AlertCircle, ShieldAlert, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import { CountUpMoney } from './CountUpMoney';
import { listItemVariants, MOTION_TOKENS } from '@/lib/motion';

interface ExpensesSectionProps {
  expenses: Expense[];
  participants: Participant[];
  bookings: Booking[];
  refunds?: RefundEvent[];
  currentUserId?: string;
  onOpenAddExpense: () => void;
  onDisputeAllocation?: (expenseId: string, participantId: string, reason: string) => void;
  onResolveDispute?: (expenseId: string, participantId: string) => void;
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expenses,
  participants,
  bookings,
  refunds = [],
  currentUserId,
  onOpenAddExpense,
  onDisputeAllocation,
  onResolveDispute,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-container space-y-6">
      {/* Header Banner */}
      <div className="page-header-split bg-surface-raised p-5 rounded-2xl border border-surface-hairline neu-raised">
        <div>
          <h2 className="text-xl font-serif-display font-bold text-ink-primary flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" /> Expense Log & Bill Proofs
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Complete log of all trip costs, allocations, receipts & vendor refunds.
          </p>
        </div>
        <button
          onClick={onOpenAddExpense}
          className="px-3.5 py-2 rounded-lg bg-ink-primary text-surface-base hover:opacity-90 text-xs sm:text-sm font-bold transition-all shadow-subtle flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Log New Expense
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-raised p-2.5 rounded-xl border border-surface-hairline">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses by title..."
            className="w-full bg-surface-overlay border border-surface-hairline rounded-lg pl-9 pr-3 py-1.5 text-xs text-ink-primary focus:border-zinc-500 outline-none transition-colors font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['all', 'lodging', 'transport', 'activity', 'food'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-ink-primary text-surface-base font-semibold shadow-subtle'
                  : 'bg-surface-overlay text-ink-secondary hover:text-ink-primary border border-surface-hairline'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expenses Feed */}
      <div className="space-y-4">
        {filteredExpenses.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredExpenses.map((exp) => {
              const payer = participants.find((p) => p.id === exp.paidById);
              const linkedBooking = bookings.find((b) => b.id === exp.bookingId);
              const expRefunds = refunds.filter((r) => r.expenseId === exp.id || (r.bookingId && r.bookingId === exp.bookingId));
              const totalRefundedAmount = expRefunds.reduce((sum, r) => sum + r.amount, 0);

              return (
                <motion.div
                  key={exp.id}
                  layout
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  className="p-5 rounded-2xl bg-surface-raised border border-surface-hairline shadow-paper space-y-4 hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/15 px-2.5 py-0.5 rounded border border-brand-gold/30">
                          {exp.category}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-surface-overlay text-ink-secondary font-mono">
                          {exp.splitMethod.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-surface-hairline text-ink-muted font-mono flex items-center gap-1.5 border border-surface-hairline">
                          <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>
                            {new Date(exp.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                        </span>
                        {totalRefundedAmount > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Vendor Refund Credited (-₹{totalRefundedAmount.toLocaleString('en-IN')})
                          </span>
                        )}
                        {exp.receiptUrl && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-ledger-surplusBg text-ledger-surplus font-bold border border-ledger-surplus/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Bill Proof Attached
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif-display font-bold text-base text-ink-primary mt-1.5">
                        {exp.title}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xl font-numeric font-bold text-ink-primary">
                        <CountUpMoney value={exp.totalAmount} prefix="₹" />
                      </div>
                    <div className="text-xs text-ink-muted flex items-center sm:justify-end gap-1 mt-0.5">
                      Paid by{' '}
                      <span className="font-semibold text-ink-primary flex items-center gap-1.5">
                        <UserAvatar
                          name={payer?.name}
                          id={payer?.id}
                          avatarUrl={payer?.avatarUrl}
                          size="xs"
                        />
                        {payer?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Receipt Image Proof Indicator */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                  {linkedBooking ? (
                    <span className="text-ink-muted flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-variance-under" /> Linked Booking:{' '}
                      <strong className="text-ink-primary">{linkedBooking.title}</strong>
                    </span>
                  ) : <span />}

                  {exp.receiptUrl && (
                    <button
                      onClick={() => setViewingReceiptExpense(exp)}
                      className="px-3 py-1 rounded-lg bg-surface-base border border-surface-hairline text-emerald-400 hover:bg-emerald-500 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      View Bill Proof ({exp.receiptName || 'Receipt'})
                    </button>
                  )}
                </div>

                {/* Allocation Badges */}
                <div className="pt-3 border-t border-surface-hairline/60 space-y-2">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                    Participant Allocations:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(exp.allocations || []).map((alloc) => {
                      const p = participants.find((part) => part.id === alloc.participantId);
                      const isDisputed = alloc.disputeStatus === 'active';
                      const isUser = alloc.participantId === currentUserId;
                      const currentUserObj = participants.find((part) => part.id === currentUserId);
                      const isOrganizer = currentUserObj?.isOrganizer;

                      return (
                        <div
                          key={alloc.participantId}
                          className={`px-3 py-1.5 rounded-xl border text-xs flex flex-wrap items-center gap-2 transition ${
                            isDisputed
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                              : 'bg-surface-base border-surface-hairline text-ink-primary'
                          }`}
                        >
                          <span className="text-ink-secondary">{p?.name || 'User'}:</span>
                          <span className="font-numeric font-bold text-ink-primary">
                            ₹{(alloc.amountOwed || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>

                          {isDisputed && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Disputed: "{alloc.disputeReason || 'Unfair share'}"
                            </span>
                          )}

                          {isDisputed && isOrganizer && onResolveDispute && (
                            <button
                              onClick={() => onResolveDispute(exp.id, alloc.participantId)}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Resolve
                            </button>
                          )}

                          {!isDisputed && isUser && onDisputeAllocation && (
                            <button
                              onClick={() => {
                                const reason = prompt('Reason for disputing this allocation:', 'I did not attend this activity / expense');
                                if (reason) {
                                  onDisputeAllocation(exp.id, alloc.participantId, reason);
                                }
                              }}
                              className="text-[10px] text-ink-muted hover:text-amber-400 underline ml-1"
                            >
                              Dispute
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        ) : (
          <div className="p-12 text-center bg-surface-raised rounded-2xl border border-surface-hairline space-y-3">
            <Receipt className="w-10 h-10 text-ink-muted mx-auto" />
            <p className="text-sm text-ink-secondary font-medium">No expenses match the current filter.</p>
          </div>
        )}
      </div>

      {/* Viewing Bill Proof Modal */}
      <AnimatePresence>
        {viewingReceiptExpense && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-raised border border-surface-hairline p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-surface-hairline pb-3">
                <div>
                  <h4 className="font-serif-display font-bold text-base text-ink-primary">
                    Verified Bill Proof
                  </h4>
                  <p className="text-xs text-ink-secondary">{viewingReceiptExpense.title}</p>
                </div>
                <button
                  onClick={() => setViewingReceiptExpense(null)}
                  className="p-1 rounded-lg text-ink-muted hover:text-ink-primary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-2 bg-surface-base rounded-2xl border border-surface-hairline overflow-hidden max-h-96 flex items-center justify-center">
                <img
                  src={viewingReceiptExpense.receiptUrl}
                  alt={viewingReceiptExpense.title}
                  className="max-h-80 w-auto object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-ledger-surplus font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Audit Verified
                </span>
                <span className="font-numeric font-bold text-sm text-ink-primary">
                  ₹{viewingReceiptExpense.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
