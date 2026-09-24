'use client';

import React, { useState } from 'react';
import { ReconciliationAudit } from '@/lib/types';
import { ShieldCheck, ChevronDown, ChevronUp, CheckCircle2, AlertOctagon, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReconciliationAuditCardProps {
  audit: ReconciliationAudit;
}

export const ReconciliationAuditCard: React.FC<ReconciliationAuditCardProps> = ({ audit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`border rounded-xl p-4 sm:p-5 transition-all shadow-paper ${
        audit.isReconciled
          ? 'bg-emerald-500/[0.03] border-emerald-500/25'
          : 'bg-rose-500/[0.03] border-rose-500/25'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
              audit.isReconciled
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {audit.isReconciled ? <ShieldCheck className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-sm sm:text-base text-ink-primary">
                Zero-Sum Reconciliation Invariant
              </h4>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded flex items-center gap-1 uppercase tracking-wider ${
                  audit.isReconciled
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                }`}
              >
                {audit.isReconciled ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Net 0.00 Verified
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-3 h-3" /> Discrepancy
                  </>
                )}
              </span>
            </div>
            <p className="text-xs text-ink-muted mt-0.5 font-mono">
              Net Incurred Group Spend (₹{audit.netIncurred.toLocaleString('en-IN')}) = Net Participant Debt Allocations
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-medium text-ink-secondary hover:text-ink-primary p-1.5 rounded-lg hover:bg-surface-overlay transition cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Proof' : 'Verify Math'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expandable Mathematical Proof Table */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-surface-hairline text-xs space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div className="bg-surface-overlay/60 p-3 rounded-lg border border-surface-hairline">
                  <div className="text-ink-muted text-[10px] uppercase font-mono tracking-wider">Gross Outlay</div>
                  <div className="font-numeric font-bold text-sm text-ink-primary mt-1">₹{audit.totalExpenses.toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-surface-overlay/60 p-3 rounded-lg border border-surface-hairline">
                  <div className="text-ink-muted text-[10px] uppercase font-mono tracking-wider">Vendor Refunds</div>
                  <div className="font-numeric font-bold text-sm text-emerald-400 mt-1">-₹{audit.totalRefunds.toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-surface-overlay/60 p-3 rounded-lg border border-surface-hairline">
                  <div className="text-ink-muted text-[10px] uppercase font-mono tracking-wider">Organizer Subsidies</div>
                  <div className="font-numeric font-bold text-sm text-indigo-400 mt-1">-₹{audit.totalSubsidies.toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-surface-overlay/60 p-3 rounded-lg border border-surface-hairline">
                  <div className="text-ink-muted text-[10px] uppercase font-mono tracking-wider">Net Incurred Spend</div>
                  <div className="font-numeric font-bold text-sm text-ink-primary mt-1">₹{audit.netIncurred.toLocaleString('en-IN')}</div>
                </div>

                <div className="bg-surface-overlay/60 p-3 rounded-lg border border-surface-hairline">
                  <div className="text-ink-muted text-[10px] uppercase font-mono tracking-wider">Ledger Balance Sum</div>
                  <div className={`font-numeric font-bold text-sm mt-1 ${audit.isReconciled ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ₹{audit.netBalanceSum.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-surface-overlay/40 rounded-lg border border-surface-hairline flex items-center justify-between text-ink-muted text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <Scale className="w-3.5 h-3.5 text-ink-muted" />
                  <span>Invariant Formula: <code className="text-ink-primary">∑(Paid) - ∑(Owed) ≡ 0.00</code></span>
                </div>
                <span className="text-emerald-400 font-bold">Δ = ₹{audit.discrepancy.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
