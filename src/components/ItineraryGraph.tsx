'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Booking, Participant, Expense, ItineraryConflict, Trip } from '@/lib/types';
import { checkItineraryFeasibility } from '@/lib/ledger-engine';
import { Plane, Hotel, Compass, UtensilsCrossed, ChevronDown, ChevronUp, Clock, MapPin, Tag, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { UserAvatar } from './UserAvatar';

interface ItineraryGraphProps {
  bookings: Booking[];
  participants: Participant[];
  expenses: Expense[];
  trip?: Trip;
  onOpenAddBooking: () => void;
  onOpenEditBooking?: (booking: Booking) => void;
  onOpenCancelBooking?: (booking: Booking) => void;
  onOpenVendors?: () => void;
}

export const ItineraryGraph: React.FC<ItineraryGraphProps> = ({
  bookings,
  participants,
  expenses,
  trip,
  onOpenAddBooking,
  onOpenEditBooking,
  onOpenCancelBooking,
  onOpenVendors,
}) => {
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dismissedConflictIds, setDismissedConflictIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // F22: Feasibility check on active bookings
  const mockTrip: Trip = trip || {
    id: bookings[0]?.tripId || 'trip-1',
    title: 'Group Trip',
    destination: 'Destination',
    startDate: '',
    endDate: '',
    budgetCeiling: 100000,
    baseCurrency: 'INR',
    inviteCode: 'TRIP26',
    organizerId: participants[0]?.id || 'p1',
    createdAt: new Date().toISOString(),
  };
  const allConflicts = checkItineraryFeasibility(mockTrip, bookings, participants);
  const activeConflicts = allConflicts.filter((c) => !dismissedConflictIds.includes(c.id));

  useEffect(() => {
    if (containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.booking-card');
      if (cards.length > 0) {
        animate(cards, {
          translateY: [20, 0],
          opacity: [0, 1],
          delay: stagger(60),
          duration: 500,
          ease: 'easeOutQuad',
        });
      }
    }
  }, [selectedCategory, bookings]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'lodging':
        return <Hotel className="w-4 h-4 text-brand-gold" />;
      case 'transport':
        return <Plane className="w-4 h-4 text-variance-under" />;
      case 'food':
        return <UtensilsCrossed className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-ledger-surplus" />;
    }
  };

  const daysMap: Record<string, Booking[]> = {};
  bookings.forEach((b) => {
    const dateStr = b.startTime ? new Date(b.startTime).toDateString() : 'Unscheduled';
    if (!daysMap[dateStr]) daysMap[dateStr] = [];
    daysMap[dateStr].push(b);
  });

  return (
    <div className="page-container space-y-6" ref={containerRef}>
      {/* Header & Filter Controls */}
      <div className="page-header-split bg-surface-raised p-5 rounded-3xl border border-surface-hairline neu-raised">
        <div>
          <h2 className="text-xl font-serif-display font-bold text-ink-primary flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" /> Master Itinerary Graph
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Connected timeline of bookings & activities with Anime.js staggered entrance (₹ INR).
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {['all', 'lodging', 'transport', 'activity', 'food'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-ink-primary text-surface-base shadow-subtle font-bold'
                  : 'bg-surface-inset text-ink-secondary hover:text-ink-primary border border-surface-hairline'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* F22: Itinerary Feasibility Alerts */}
      {activeConflicts.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
              <span className="font-serif-display font-bold text-sm">
                Logistical Feasibility Conflicts Detected ({activeConflicts.length})
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Deterministic Guardrail
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {activeConflicts.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-2xl bg-surface-base border border-amber-500/20 text-xs flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        c.severity === 'high' ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                      }`}
                    >
                      {c.severity}
                    </span>
                    <span className="font-semibold text-ink-primary capitalize">{c.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary">{c.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setDismissedConflictIds((prev) => [...prev, c.id])}
                  className="text-[11px] font-semibold text-ink-muted hover:text-ink-primary shrink-0 px-2 py-1 rounded-lg bg-surface-overlay"
                >
                  Dismiss
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Horizontal Swimlanes / Day Columns */}
      <div className="space-y-6">
        {Object.entries(daysMap).map(([dayTitle, dayBookings]) => {
          const matchingBookings = dayBookings.filter((b) =>
            selectedCategory === 'all' ? true : b.category === selectedCategory
          );

          if (matchingBookings.length === 0) return null;

          return (
            <div key={dayTitle} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-gold bg-brand-gold/15 px-3 py-1 rounded-lg border border-brand-gold/30 font-numeric">
                  {dayTitle}
                </span>
                <div className="h-px flex-1 bg-surface-hairline" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchingBookings.map((b) => {
                  const isExpanded = expandedBookingId === b.id;
                  const linkedExpenses = expenses.filter((e) => e.bookingId === b.id);

                  return (
                    <div
                      key={b.id}
                      className={`booking-card p-4.5 rounded-2xl bg-surface-raised border transition-all cursor-pointer shadow-paper ${
                        b.status === 'cancelled'
                          ? 'border-red-300 opacity-60'
                          : isExpanded
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-surface-hairline hover:border-emerald-500/40'
                      }`}
                      onClick={() => setExpandedBookingId(isExpanded ? null : b.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-surface-base border border-surface-hairline">
                            {getCategoryIcon(b.category)}
                          </div>
                          <div>
                            <h4
                              className={`font-serif-display font-bold text-sm text-ink-primary ${
                                b.status === 'cancelled' ? 'line-through' : ''
                              }`}
                            >
                              {b.title}
                            </h4>
                            <p className="text-xs text-ink-secondary flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-ink-muted" /> {b.vendor}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-numeric font-bold text-sm text-ink-primary">
                            ₹{b.actualCost.toLocaleString('en-IN')}
                          </div>
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              b.status === 'confirmed'
                                ? 'bg-ledger-surplusBg text-ledger-surplus'
                                : b.status === 'pending'
                                ? 'bg-brand-gold/15 text-brand-gold'
                                : 'bg-ledger-deficitBg text-ledger-deficit'
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      </div>

                      {/* Participant Avatar Stack */}
                      <div className="mt-4 pt-3 border-t border-surface-hairline flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-[11px] text-ink-muted mr-2">Participants:</span>
                          <div className="flex -space-x-2">
                            {participants.map((p) => {
                              const isParticipating = (b.participantIds || []).includes(p.id);
                              return (
                                <div
                                  key={p.id}
                                  title={`${p.name} (${isParticipating ? 'Participating' : 'Opted Out'})`}
                                  className={`rounded-full transition-all ${
                                    isParticipating ? 'opacity-100 ring-2 ring-emerald-500/50' : 'opacity-30 grayscale'
                                  }`}
                                >
                                  <UserAvatar
                                    name={p.name}
                                    id={p.id}
                                    avatarUrl={p.avatarUrl}
                                    size="xs"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <span>{isExpanded ? 'Collapse' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Expanded In-Place Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-3 border-t border-surface-hairline text-xs space-y-3"
                          >
                            <div className="flex items-center justify-between text-ink-secondary">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-brand-gold" /> Estimated: ₹{b.estimatedCost.toLocaleString('en-IN')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag className="w-3.5 h-3.5 text-variance-under" /> Actual: ₹{b.actualCost.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <div>
                              <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-1.5">
                                Linked Ledger Expenses ({linkedExpenses.length})
                              </p>
                              {linkedExpenses.length > 0 ? (
                                <div className="space-y-1.5">
                                  {linkedExpenses.map((exp) => (
                                    <div
                                      key={exp.id}
                                      className="p-2.5 rounded-xl bg-surface-base border border-surface-hairline flex items-center justify-between"
                                    >
                                      <span className="font-medium text-ink-primary">{exp.title}</span>
                                      <span className="font-numeric font-bold text-ledger-surplus">
                                        ₹{exp.totalAmount.toLocaleString('en-IN')} ({exp.splitMethod})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-ink-muted italic text-[11px]">No expenses logged yet.</p>
                              )}
                            </div>

                            {/* Booking Action Buttons */}
                            <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-hairline" onClick={(e) => e.stopPropagation()}>
                              {onOpenVendors && (
                                <button
                                  type="button"
                                  onClick={() => onOpenVendors()}
                                  className="px-3 py-1.5 rounded-lg border border-surface-hairline text-[11px] font-semibold text-ink-secondary hover:text-ink-primary hover:bg-surface-base transition"
                                >
                                  Vendor Details
                                </button>
                              )}
                              {b.status !== 'cancelled' && onOpenEditBooking && (
                                <button
                                  type="button"
                                  onClick={() => onOpenEditBooking(b)}
                                  className="px-3 py-1.5 rounded-lg border border-accent-cyan/30 text-accent-cyan bg-accent-cyan/10 text-[11px] font-semibold hover:bg-accent-cyan/20 transition"
                                >
                                  Edit Booking
                                </button>
                              )}
                              {b.status !== 'cancelled' && onOpenCancelBooking && (
                                <button
                                  type="button"
                                  onClick={() => onOpenCancelBooking(b)}
                                  className="px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 bg-red-500/10 text-[11px] font-semibold hover:bg-red-500/20 transition"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
