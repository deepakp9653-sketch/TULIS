'use client';

import React, { useState } from 'react';
import { Trip, Booking, Expense, Participant, RefundEvent } from '@/lib/types';
import {
  Calendar,
  Receipt,
  Plus,
  Search,
  Filter,
  Layers,
  Compass,
  Clock,
  MapPin,
  Users,
  Hotel,
  Plane,
  UtensilsCrossed,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Building2,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './UserAvatar';
import { CountUpMoney } from './CountUpMoney';

export interface PlanAndLedgerViewProps {
  trip?: Trip;
  bookings: Booking[];
  expenses: Expense[];
  participants: Participant[];
  refunds?: RefundEvent[];
  currentUserId?: string;
  onOpenAddBooking: () => void;
  onOpenAddExpense: () => void;
  onOpenEditBooking?: (booking: Booking) => void;
  onOpenCancelBooking?: (booking: Booking) => void;
  onOpenVendors?: () => void;
  onDisputeAllocation?: (expenseId: string, participantId: string, reason: string) => void;
  onResolveDispute?: (expenseId: string, participantId: string) => void;
}

type ViewMode = 'timeline' | 'ledger';

export const PlanAndLedgerView: React.FC<PlanAndLedgerViewProps> = ({
  trip,
  bookings,
  expenses,
  participants,
  refunds = [],
  currentUserId,
  onOpenAddBooking,
  onOpenAddExpense,
  onOpenEditBooking,
  onOpenCancelBooking,
  onOpenVendors,
  onDisputeAllocation,
  onResolveDispute,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<Expense | null>(null);

  // Group bookings by day string
  const daysMap: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    const dateStr = b.startTime ? new Date(b.startTime).toDateString() : 'Unscheduled / Flexible';
    if (!daysMap[dateStr]) daysMap[dateStr] = [];
    daysMap[dateStr].push(b);
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lodging':
        return <Hotel className="w-4 h-4 text-brand-gold" />;
      case 'transport':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'food':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-purple-400" />;
    }
  };

  const totalSpend = expenses.reduce((acc, e) => acc + (e.totalAmount || 0), 0);
  const totalVerifiedReceipts = expenses.filter((e) => Boolean(e.receiptUrl)).length;

  // Filtered expenses for ledger view
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="page-container space-y-6">
      {/* 1. UNIFIED COMMAND HEADER */}
      <div className="page-header-split bg-surface-raised p-5 rounded-3xl border border-surface-hairline neu-raised flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-serif-display font-bold text-ink-primary">
              Plan & Live Ledger
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Synchronized Hub
            </span>
          </div>
          <p className="text-xs text-ink-secondary">
            Consolidated timeline of bookings, daily activities, live bill tracking & verified receipts (₹ INR).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenVendors && (
            <button
              onClick={onOpenVendors}
              className="px-3.5 py-2 rounded-xl bg-surface-inset hover:bg-surface-elevated text-ink-secondary hover:text-ink-primary text-xs font-semibold border border-surface-hairline transition cursor-pointer flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-gold" />
              <span>Vendors</span>
            </button>
          )}

          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-2 rounded-xl bg-surface-inset hover:bg-surface-elevated text-emerald-500 border border-emerald-500/30 text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>+ Log Expense</span>
          </button>

          <button
            onClick={onOpenAddBooking}
            className="px-4 py-2 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs sm:text-sm font-bold transition shadow-subtle flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Activity</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-VIEW SWITCHER & FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-raised/70 p-3 rounded-2xl border border-surface-hairline">
        {/* View Mode Pill Switcher - Timeline & Ledger Table */}
        <div className="flex items-center gap-1 p-1 bg-surface-inset rounded-xl border border-surface-hairline w-full sm:w-auto">
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'timeline'
                ? 'bg-ink-primary text-surface-base shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setViewMode('ledger')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              viewMode === 'ledger'
                ? 'bg-ink-primary text-surface-base shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Ledger Table</span>
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {['all', 'lodging', 'transport', 'activity', 'food'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? 'bg-ink-primary text-surface-base font-bold shadow-subtle'
                  : 'bg-surface-inset text-ink-secondary hover:text-ink-primary border border-surface-hairline'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. MINI TELEMETRY STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-2xl bg-surface-raised border border-surface-hairline">
          <span className="text-ink-muted block text-[11px]">Total Activities & Bookings</span>
          <span className="text-base font-bold font-numeric text-ink-primary">{bookings.length} scheduled</span>
        </div>
        <div className="p-3 rounded-2xl bg-surface-raised border border-surface-hairline">
          <span className="text-ink-muted block text-[11px]">Logged Trip Spend</span>
          <span className="text-base font-bold font-numeric text-emerald-500">
            ₹{totalSpend.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-surface-raised border border-surface-hairline">
          <span className="text-ink-muted block text-[11px]">Verified Proofs</span>
          <span className="text-base font-bold font-numeric text-ink-primary">
            {totalVerifiedReceipts} receipts
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-surface-raised border border-surface-hairline">
          <span className="text-ink-muted block text-[11px]">Active Travelers</span>
          <span className="text-base font-bold font-numeric text-ink-primary">
            {participants.length} members
          </span>
        </div>
      </div>

      {/* 4. TIMELINE VIEW */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {Object.entries(daysMap).map(([dayTitle, dayBookings]) => {
            const matchingBookings = dayBookings.filter((b) =>
              selectedCategory === 'all' ? true : b.category === selectedCategory
            );
            if (matchingBookings.length === 0) return null;

            return (
              <div key={dayTitle} className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/15 px-3 py-1 rounded-lg border border-brand-gold/30 font-numeric">
                  {dayTitle}
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchingBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl bg-surface-raised border border-surface-hairline hover:border-surface-subtle transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-surface-inset flex items-center justify-center">
                            {getCategoryIcon(b.category)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-ink-primary">{b.title}</h4>
                            <span className="text-xs text-ink-muted">{b.vendor}</span>
                          </div>
                        </div>
                        <span className="font-numeric font-bold text-sm text-ink-primary">
                          ₹{(b.actualCost || b.estimatedCost).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {b.startTime && (
                        <div className="text-[11px] text-ink-muted flex items-center gap-1.5 pt-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {b.endTime && ` - ${new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. DENSE LEDGER TABLE VIEW */}
      {viewMode === 'ledger' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by title or merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-raised border border-surface-hairline text-xs text-ink-primary focus:outline-none focus:border-brand-emerald"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl border border-surface-hairline bg-surface-raised">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-surface-hairline bg-surface-inset text-ink-muted uppercase font-bold text-[10px] tracking-wider">
                  <th className="p-3.5">Expense / Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Paid By</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Split Strategy</th>
                  <th className="p-3.5">Receipt</th>
                  <th className="p-3.5 text-right">Shares</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-hairline/60">
                {filteredExpenses.map((e) => {
                  const payer = participants.find((p) => p.id === e.paidById);
                  return (
                    <tr key={e.id} className="hover:bg-surface-elevated/40 transition">
                      <td className="p-3.5 font-semibold text-ink-primary">{e.title}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-surface-inset text-[10px] font-bold uppercase text-ink-secondary border border-surface-hairline">
                          {e.category}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {payer && <UserAvatar name={payer.name} id={payer.id} avatarUrl={payer.avatarUrl} size="xs" />}
                          <span className="text-ink-primary">{payer?.name || 'Member'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-numeric font-bold text-emerald-500">
                        ₹{e.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3.5 text-ink-secondary capitalize">
                        {e.splitMethod.replace('_', ' ')}
                      </td>
                      <td className="p-3.5">
                        {e.receiptUrl ? (
                          <button
                            onClick={() => setViewingReceiptExpense(e)}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" /> View Proof
                          </button>
                        ) : (
                          <span className="text-ink-muted text-[10px]">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right text-ink-secondary font-numeric">
                        {e.allocations?.length || 0} travelers
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECEIPT PREVIEW MODAL */}
      <AnimatePresence>
        {viewingReceiptExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface-raised border border-surface-hairline rounded-3xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-surface-hairline">
                <div>
                  <h3 className="font-bold text-base text-ink-primary">Verified Tax Invoice Proof</h3>
                  <p className="text-xs text-ink-muted">{viewingReceiptExpense.title}</p>
                </div>
                <button
                  onClick={() => setViewingReceiptExpense(null)}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-surface-elevated cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {viewingReceiptExpense.receiptUrl && (
                <div className="rounded-2xl overflow-hidden border border-surface-hairline max-h-80 bg-black flex items-center justify-center">
                  <img
                    src={viewingReceiptExpense.receiptUrl}
                    alt="Receipt Proof"
                    className="w-full h-full object-contain max-h-80"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-ink-muted">
                  Total Bill: <strong className="text-emerald-500 font-numeric font-bold">₹{viewingReceiptExpense.totalAmount.toLocaleString('en-IN')}</strong>
                </span>
                <button
                  onClick={() => setViewingReceiptExpense(null)}
                  className="px-4 py-2 rounded-xl bg-ink-primary text-surface-base font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
