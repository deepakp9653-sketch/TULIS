'use client';

import React, { useState } from 'react';
import { LedgerEvent } from '@/lib/types';
import {
  Activity,
  ShieldCheck,
  User,
  Receipt,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Calendar,
  Key,
  Search,
  Code,
  ChevronDown,
  ChevronUp,
  Clock,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityLogSectionProps {
  events: LedgerEvent[];
  onDeleteEvent?: (eventId: string) => void;
}

export const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({ events, onDeleteEvent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const getEventBadge = (type?: string) => {
    switch (type) {
      case 'TRIP_CREATED':
        return {
          icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        };
      case 'BOOKING_CANCELLED':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
          color: 'bg-red-500/15 text-red-300 border-red-500/30',
        };
      case 'REFUND_CREDITED':
        return {
          icon: <RefreshCw className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'BOOKING_MODIFIED':
        return {
          icon: <Edit3 className="w-4 h-4 text-accent-cyan" />,
          color: 'bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30',
        };
      case 'BOOKING_CREATED':
        return {
          icon: <Calendar className="w-4 h-4 text-purple-400" />,
          color: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        };
      case 'PARTICIPANT_ADDED':
      case 'PARTICIPANT_REMOVED':
      case 'TRIP_JOINED_VIA_CODE':
        return {
          icon: <User className="w-4 h-4 text-blue-400" />,
          color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        };
      case 'EXPENSE_LOGGED':
      case 'EXPENSE_CORRECTED':
        return {
          icon: <Receipt className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        };
      case 'PAYMENT_RECORDED':
      case 'SETTLEMENT_CONFIRMED':
        return {
          icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
          color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-ink-muted" />,
          color: 'bg-surface-elevated text-ink-muted border-surface-border',
        };
    }
  };

  const filteredEvents = (events || []).filter((evt) => {
    if (!evt) return false;
    const rawEvt = evt as any;
    const eventType = String(evt.eventType || rawEvt.event_type || 'LEDGER_EVENT');
    const description = String(evt.description || rawEvt.payload?.description || rawEvt.payload_json?.description || '');
    const actorName = String(evt.actorName || rawEvt.actor_name || rawEvt.actor_id || evt.actorId || 'Traveler');

    const searchLower = (searchTerm || '').toLowerCase();
    const matchesSearch =
      eventType.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      actorName.toLowerCase().includes(searchLower);

    if (!matchesSearch) return false;

    if (selectedFilter === 'refunds') {
      return ['BOOKING_CANCELLED', 'REFUND_CREDITED'].includes(eventType);
    }
    if (selectedFilter === 'expenses') {
      return ['EXPENSE_LOGGED', 'EXPENSE_CORRECTED', 'PAYMENT_RECORDED', 'SETTLEMENT_CONFIRMED'].includes(eventType);
    }
    if (selectedFilter === 'bookings') {
      return ['BOOKING_CREATED', 'BOOKING_MODIFIED', 'BOOKING_CANCELLED'].includes(eventType);
    }
    if (selectedFilter === 'roster') {
      return ['PARTICIPANT_ADDED', 'PARTICIPANT_REMOVED', 'TRIP_JOINED_VIA_CODE'].includes(eventType);
    }

    return true;
  });

  return (
    <div className="page-container space-y-6">
      {/* Header Banner */}
      <div className="page-header-split bg-surface-raised p-5 rounded-3xl border border-surface-hairline neu-raised">
        <div>
          <h2 className="text-xl font-serif-display font-bold text-ink-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" /> Event-Sourced Activity & Audit Log
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Immutable append-only ledger event stream preserving complete recalculation lineage & refunds (₹ INR).
          </p>
        </div>

        <span className="text-xs px-3.5 py-1.5 rounded-xl bg-surface-inset text-ink-primary border border-surface-hairline font-bold font-numeric flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Total Events Logged: {(events || []).length}</span>
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface-raised p-3 rounded-2xl border border-surface-hairline">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search events by type, description, or traveler name..."
            className="w-full bg-surface-inset border border-surface-hairline rounded-xl pl-9 pr-3 py-2 text-xs text-ink-primary focus:border-emerald-500 outline-none placeholder:text-ink-muted"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'refunds', label: 'Refunds & Cancellations' },
            { id: 'expenses', label: 'Expenses & Payments' },
            { id: 'bookings', label: 'Bookings & Revisions' },
            { id: 'roster', label: 'Roster Changes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === tab.id
                  ? 'bg-surface-raised text-ink-primary shadow-sm font-bold'
                  : 'bg-surface-base text-ink-secondary hover:text-ink-primary border border-surface-hairline'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Event Feed */}
      <div className="space-y-3 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-surface-hairline">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-surface-raised rounded-2xl border border-surface-hairline text-ink-muted text-xs">
            No ledger events match the selected filter.
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            const rawEvt = evt as any;
            const eventType = String(evt.eventType || rawEvt.event_type || 'LEDGER_EVENT');
            const description = String(evt.description || rawEvt.payload?.description || rawEvt.payload_json?.description || `${eventType.replace(/_/g, ' ')} recorded`);
            const actorName = String(evt.actorName || rawEvt.actor_name || rawEvt.actor_id || evt.actorId || 'Traveler');
            const sequenceNum = evt.sequenceNum ?? rawEvt.sequence_num ?? (idx + 1);
            const timestamp = evt.timestamp || rawEvt.created_at || new Date().toISOString();
            const badge = getEventBadge(eventType);
            const isPayloadExpanded = expandedPayloadId === evt.id;

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(0.3, idx * 0.03) }}
                className="relative pl-12 p-4 rounded-2xl bg-surface-raised border border-surface-hairline shadow-paper space-y-2 hover:border-emerald-500/30 transition-all"
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 top-5 -translate-x-1/2 p-2 rounded-xl bg-surface-base border border-surface-hairline shadow-sm">
                  {badge.icon}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-numeric font-bold text-brand-gold bg-brand-gold/15 px-2 py-0.5 rounded text-[11px] border border-brand-gold/30">
                      Seq #{sequenceNum}
                    </span>
                    <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] uppercase tracking-wider ${badge.color}`}>
                      {eventType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-ink-muted text-[11px] font-mono flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>
                      {new Date(timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </span>
                </div>

                <p className="text-xs text-ink-primary font-medium leading-relaxed">{description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted pt-1 border-t border-surface-hairline/60">
                  <div className="flex items-center gap-1">
                    <span>Logged By:</span>
                    <span className="font-semibold text-ink-primary">{actorName}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {evt.payload && (
                      <button
                        onClick={() => setExpandedPayloadId(isPayloadExpanded ? null : evt.id)}
                        className="flex items-center gap-1 text-accent-cyan hover:underline font-semibold cursor-pointer"
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>{isPayloadExpanded ? 'Hide Payload' : 'Inspect JSON Payload'}</span>
                        {isPayloadExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}

                    {onDeleteEvent && (
                      confirmDeleteId === evt.id ? (
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded-lg text-[10px]">
                          <span className="text-red-400 font-semibold">Delete?</span>
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteEvent(evt.id);
                              setConfirmDeleteId(null);
                            }}
                            className="text-red-300 hover:text-white font-bold underline cursor-pointer"
                          >
                            Yes
                          </button>
                          <span className="text-neutral-500">|</span>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-neutral-400 hover:text-white cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(evt.id)}
                          title="Delete Audit Entry"
                          className="flex items-center gap-1 text-ink-muted hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Expandable JSON Payload Inspection Drawer */}
                <AnimatePresence>
                  {isPayloadExpanded && evt.payload && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="mt-2 p-3 bg-surface-base rounded-xl border border-surface-hairline text-[11px] font-mono text-emerald-400 overflow-x-auto">
                        {JSON.stringify(evt.payload, null, 2)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
