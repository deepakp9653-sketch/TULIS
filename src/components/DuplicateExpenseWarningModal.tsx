'use client';

import React from 'react';
import { Expense } from '@/lib/types';
import { AlertTriangle, CheckCircle, X, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DuplicateExpenseWarningModalProps {
  isOpen: boolean;
  proposedExpense: Partial<Expense> | null;
  existingExpense: Expense | null;
  similarityScore: number;
  reason: string;
  onCancel: () => void;
  onConfirmDuplicate: () => void;
}

export const DuplicateExpenseWarningModal: React.FC<DuplicateExpenseWarningModalProps> = ({
  isOpen,
  proposedExpense,
  existingExpense,
  similarityScore,
  reason,
  onCancel,
  onConfirmDuplicate,
}) => {
  if (!isOpen || !proposedExpense || !existingExpense) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-surface-overlay border-2 border-brand-gold/40 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Warning Banner Header */}
        <div className="p-6 bg-brand-gold/10 border-b border-brand-gold/20 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif-display font-bold text-ink-primary">
                Potential Duplicate Expense Detected
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold border border-brand-gold/30">
                {(similarityScore * 100).toFixed(0)}% Similarity
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-1">
              {reason}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-side comparison */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Existing Expense Card */}
            <div className="p-4 rounded-2xl bg-surface-base border border-surface-hairline space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block">
                Existing Ledger Expense
              </span>
              <p className="text-sm font-semibold text-ink-primary truncate">
                {existingExpense.title}
              </p>
              <p className="text-xl font-numeric font-bold text-ink-primary">
                ₹{existingExpense.totalAmount.toLocaleString('en-IN')}
              </p>
              <div className="text-[11px] text-ink-secondary space-y-1 pt-2 border-t border-surface-hairline">
                <p>
                  <span className="text-ink-muted">Category:</span> <span className="capitalize">{existingExpense.category}</span>
                </p>
                <p>
                  <span className="text-ink-muted">Recorded:</span> {new Date(existingExpense.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p>
                  <span className="text-ink-muted">Split:</span> <span className="capitalize">{existingExpense.splitMethod.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Proposed New Expense Card */}
            <div className="p-4 rounded-2xl bg-brand-gold/5 border border-brand-gold/30 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-gold block">
                Your New Submission
              </span>
              <p className="text-sm font-semibold text-ink-primary truncate">
                {proposedExpense.title || 'Untitled Expense'}
              </p>
              <p className="text-xl font-numeric font-bold text-brand-gold">
                ₹{(proposedExpense.totalAmount || 0).toLocaleString('en-IN')}
              </p>
              <div className="text-[11px] text-ink-secondary space-y-1 pt-2 border-t border-surface-hairline">
                <p>
                  <span className="text-ink-muted">Category:</span> <span className="capitalize">{proposedExpense.category || 'general'}</span>
                </p>
                <p>
                  <span className="text-ink-muted">Status:</span> <span className="text-brand-gold font-medium">Pending Confirmation</span>
                </p>
                <p>
                  <span className="text-ink-muted">Split:</span> <span className="capitalize">{(proposedExpense.splitMethod || 'equal').replace('_', ' ')}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-base border border-surface-hairline text-xs text-ink-secondary">
            <p>
              ⚠️ <strong className="text-ink-primary">Double-charging protection:</strong> If this was an accidental second entry or duplicate photo ingestion, click <strong>Cancel & Discard</strong>. If this is a genuine separate expense (e.g. repeated round of drinks or taxi), click <strong>Confirm as Separate</strong>.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-6 bg-surface-base border-t border-surface-hairline flex items-center justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-surface-hairline text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-overlay transition-all"
          >
            Cancel & Discard Entry
          </button>

          <button
            type="button"
            onClick={onConfirmDuplicate}
            className="px-5 py-2.5 rounded-xl bg-brand-gold text-surface-base text-xs font-semibold hover:brightness-105 active:scale-95 shadow-lg transition-all"
          >
            Confirm as Separate Expense
          </button>
        </div>
      </motion.div>
    </div>
  );
};
