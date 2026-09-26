'use client';

import React from 'react';
import {
  Trip,
  Participant,
  ParticipantNetBalance,
  SimplifiedDebt,
  ReconciliationAudit,
  Expense,
  Booking,
} from '@/lib/types';
import { generateAccountingExportCSV } from '@/lib/ledger-engine';
import {
  Printer,
  Copy,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SettlementReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  participants: Participant[];
  netBalances: ParticipantNetBalance[];
  simplifiedDebts: SimplifiedDebt[];
  audit: ReconciliationAudit;
  expenses?: Expense[];
  bookings?: Booking[];
}

export const SettlementReportModal: React.FC<SettlementReportModalProps> = ({
  isOpen,
  onClose,
  trip,
  participants,
  netBalances,
  simplifiedDebts,
  audit,
  expenses = [],
  bookings = [],
}) => {
  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csv = generateAccountingExportCSV(trip, participants, expenses, bookings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.title.toLowerCase().replace(/\s+/g, '_')}_accounting_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let summary = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    summary += `TULIS — FINAL SETTLEMENT REPORT\n`;
    summary += `Trip: ${trip.title} (${trip.destination})\n`;
    summary += `Dates: ${trip.startDate} to ${trip.endDate}\n`;
    summary += `Total Outlay: ₹${audit.netIncurred.toLocaleString('en-IN')}\n`;
    summary += `Provably Reconciled (Δ = ₹${audit.discrepancy.toFixed(2)})\n`;
    summary += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    summary += `PARTICIPANT NET BALANCES:\n`;
    netBalances.forEach((b) => {
      const pos =
        b.netBalance > 0
          ? `+₹${b.netBalance.toFixed(2)} (Owed Reimbursement)`
          : b.netBalance < 0
          ? `-₹${Math.abs(b.netBalance).toFixed(2)} (Owes Deficit)`
          : `₹0.00 (Fully Settled)`;
      summary += `• ${b.participant.name}: ${pos}\n`;
    });

    summary += `\nMINIMAL SETTLEMENT TRANSACTIONS (N-1 Optimal):\n`;
    if (simplifiedDebts.length === 0) {
      summary += `All balances are zero. No payments needed!\n`;
    } else {
      simplifiedDebts.forEach((d, idx) => {
        summary += `${idx + 1}. ${d.fromName} pays ${d.toName} → ₹${d.amount.toFixed(2)} (UPI: ${d.payeeUpiId || 'N/A'})\n`;
      });
    }
    summary += `\nGenerated via Tulis Accounting Engine.`;

    navigator.clipboard.writeText(summary);
    alert('Copied printable settlement report text to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-3xl bg-surface-overlay border border-surface-hairline rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black"
      >
        {/* Header Ribbon (Hidden in Print) */}
        <div className="p-6 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileSpreadsheet className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-display font-bold text-ink-primary">
                  Official Trip Settlement Audit Report
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Audit Sealed
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Clean, shareable summary of final balances, zero-sum proof, and UPI settlement paths.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition flex items-center gap-1.5 shadow-sm"
              title="Download RFC 4180 compliant CSV for accounting & finance teams (F23)"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV (F23)
            </button>
            <button
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-surface-base border border-surface-hairline hover:bg-surface-hairline text-ink-primary transition flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Text
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-surface-base transition flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-ink-primary rounded-xl hover:bg-surface-base transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Sheet Content */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 print:overflow-visible">
          {/* Document Masthead */}
          <div className="border-b-2 border-surface-hairline pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/tulis-logo.png.jpeg"
                alt="Tulis"
                className="h-12 w-auto rounded-xl border border-surface-hairline shadow-subtle object-contain bg-white/95 px-3 py-1"
              />
              <div>
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                  Tulis Audit Certificate
                </span>
                <h1 className="text-2xl sm:text-3xl font-serif-display font-bold text-ink-primary mt-0.5">
                  {trip.title}
                </h1>
                <p className="text-xs text-ink-secondary mt-0.5">
                  Destination: {trip.destination} · Dates: {trip.startDate} to {trip.endDate} · Invite Code: {trip.inviteCode}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Provably Reconciled (Δ = ₹{audit.discrepancy.toFixed(2)})
              </span>
            </div>
          </div>

          {/* Macro Financial Totals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-surface-base rounded-2xl border border-surface-hairline">
              <span className="text-[10px] uppercase font-bold text-ink-muted">Gross Spend</span>
              <div className="font-numeric font-bold text-base text-ink-primary mt-1">
                ₹{audit.totalExpenses.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3.5 bg-surface-base rounded-2xl border border-surface-hairline">
              <span className="text-[10px] uppercase font-bold text-ink-muted">Refunds Credited</span>
              <div className="font-numeric font-bold text-base text-emerald-400 mt-1">
                -₹{audit.totalRefunds.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3.5 bg-surface-base rounded-2xl border border-surface-hairline">
              <span className="text-[10px] uppercase font-bold text-ink-muted">Net Group Outlay</span>
              <div className="font-numeric font-bold text-base text-ink-primary mt-1">
                ₹{audit.netIncurred.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-3.5 bg-surface-base rounded-2xl border border-surface-hairline">
              <span className="text-[10px] uppercase font-bold text-ink-muted">Settlement Count</span>
              <div className="font-numeric font-bold text-base text-brand-gold mt-1">
                {simplifiedDebts.length} Transfers
              </div>
            </div>
          </div>

          {/* Participant Balances Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
              Participant Balance Sheet
            </h4>
            <div className="overflow-x-auto rounded-2xl border border-surface-hairline">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-base border-b border-surface-hairline text-ink-muted uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Traveler</th>
                    <th className="py-2.5 px-3">Gross Fronted</th>
                    <th className="py-2.5 px-3">Share Owed</th>
                    <th className="py-2.5 px-3 text-right">Net Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-hairline/60 bg-surface-raised">
                  {netBalances.map((b) => (
                    <tr key={b.participant.id}>
                      <td className="py-2.5 px-3 font-semibold text-ink-primary">{b.participant.name}</td>
                      <td className="py-2.5 px-3 font-numeric text-emerald-400">+₹{b.totalPaid.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-numeric text-red-400">-₹{b.totalOwed.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-numeric font-bold text-right">
                        <span
                          className={
                            b.netBalance > 0
                              ? 'text-emerald-400'
                              : b.netBalance < 0
                              ? 'text-red-400'
                              : 'text-ink-muted'
                          }
                        >
                          {b.netBalance > 0 ? `+₹${b.netBalance.toFixed(2)}` : `₹${b.netBalance.toFixed(2)}`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Minimal Settlement Paths */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
              Minimal Debt Settlement Matrix (Greedy Netting)
            </h4>
            {simplifiedDebts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {simplifiedDebts.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-surface-base border border-surface-hairline flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-semibold">
                        <span className="text-red-400">{d.fromName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-brand-gold" />
                        <span className="text-emerald-400">{d.toName}</span>
                      </div>
                      <div className="text-[11px] font-mono text-ink-muted mt-0.5">
                        UPI: {d.payeeUpiId || 'payee@upi'}
                      </div>
                    </div>
                    <div className="font-numeric font-bold text-sm text-ink-primary">
                      ₹{d.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> All participant balances are zero. The ledger is fully settled.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-base border-t border-surface-hairline flex items-center justify-between text-xs text-ink-muted print:hidden">
          <span>Official Event Ledger Digest · Tulis Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-raised border border-surface-hairline text-ink-primary font-bold hover:bg-surface-hairline transition"
          >
            Close Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};