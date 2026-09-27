'use client';

import React, { useState } from 'react';
import { LedgerEvent, Trip, Participant, ParticipantNetBalance, Expense } from '@/lib/types';
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
  Download,
  FileSpreadsheet,
  Printer,
  FileText,
  X,
  Copy,
  Scale,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FairnessReportModal } from './FairnessReportModal';

interface ActivityLogSectionProps {
  events: LedgerEvent[];
  onDeleteEvent?: (eventId: string) => void;
  trip?: Trip;
  participants?: Participant[];
  netBalances?: ParticipantNetBalance[];
  expenses?: Expense[];
  attendanceMatrix?: Record<string, Record<string, boolean>>;
}

export const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({
  events,
  onDeleteEvent,
  trip,
  participants = [],
  netBalances = [],
  expenses = [],
  attendanceMatrix = {},
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedPayloadId, setExpandedPayloadId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFairnessModalOpen, setIsFairnessModalOpen] = useState(false);

  const handleDownloadCSV = () => {
    const tripName = (trip?.title || 'Trip').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${tripName.toLowerCase()}_audit_trail_${dateStr}.csv`;

    const headers = [
      'Sequence',
      'Timestamp (ISO)',
      'Timestamp (Local)',
      'Event Type',
      'Description',
      'Logged By',
      'Payload Data',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = (events || []).map((evt, idx) => {
      const rawEvt = evt as any;
      const seq = evt.sequenceNum ?? rawEvt.sequence_num ?? (idx + 1);
      const ts = evt.timestamp || rawEvt.created_at || '';
      const localTime = ts
        ? new Date(ts).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
        : '';
      const eventType = String(evt.eventType || rawEvt.event_type || 'LEDGER_EVENT');
      const desc = String(
        evt.description ||
          rawEvt.payload?.description ||
          rawEvt.payload_json?.description ||
          `${eventType.replace(/_/g, ' ')} recorded`
      );
      const actor = String(
        evt.actorName || rawEvt.actor_name || rawEvt.actor_id || evt.actorId || 'Traveler'
      );
      const payloadStr = evt.payload ? JSON.stringify(evt.payload) : '';

      return [
        seq,
        escapeCsv(ts),
        escapeCsv(localTime),
        escapeCsv(eventType),
        escapeCsv(desc),
        escapeCsv(actor),
        escapeCsv(payloadStr),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const tripTitle = trip?.title || 'GroupTrip Ledger';
    const tripDest = trip?.destination ? ` • ${trip.destination}` : '';
    const now = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const printWindow = window.open('', '_blank', 'width=950,height=800');
    if (!printWindow) {
      // If pop-up is blocked, open the in-page preview modal
      setIsReportModalOpen(true);
      return;
    }

    const rowsHtml = (events || [])
      .map((evt, idx) => {
        const rawEvt = evt as any;
        const seq = evt.sequenceNum ?? rawEvt.sequence_num ?? (idx + 1);
        const ts = evt.timestamp || rawEvt.created_at || '';
        const formattedTs = ts
          ? new Date(ts).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })
          : '—';
        const eventType = String(evt.eventType || rawEvt.event_type || 'LEDGER_EVENT');
        const desc = String(
          evt.description ||
            rawEvt.payload?.description ||
            rawEvt.payload_json?.description ||
            `${eventType.replace(/_/g, ' ')} recorded`
        );
        const actor = String(
          evt.actorName || rawEvt.actor_name || rawEvt.actor_id || evt.actorId || 'Traveler'
        );

        return `
          <tr>
            <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; font-weight: bold; color: #b45309; text-align: center;">#${seq}</td>
            <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; color: #64748b; white-space: nowrap;">${formattedTs}</td>
            <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0;">
              <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; white-space: nowrap;">
                ${eventType.replace(/_/g, ' ')}
              </span>
            </td>
            <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 500; color: #0f172a;">${desc}</td>
            <td style="padding: 9px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 600; color: #334155;">${actor}</td>
          </tr>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${tripTitle} — Audit Trail Report</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 24px;
              background: #ffffff;
            }
            .toolbar {
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 10px 16px;
              border-radius: 8px;
              margin-bottom: 20px;
            }
            .btn-print {
              padding: 8px 18px;
              background: #059669;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              font-weight: 700;
              font-size: 13px;
              cursor: pointer;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .btn-close {
              padding: 8px 14px;
              background: #e2e8f0;
              color: #334155;
              border: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 13px;
              cursor: pointer;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #059669;
              padding-bottom: 14px;
              margin-bottom: 16px;
            }
            .title {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              margin: 0 0 4px 0;
            }
            .subtitle {
              font-size: 12px;
              color: #64748b;
              margin: 0;
            }
            .badge {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              background: #ecfdf5;
              color: #047857;
              border: 1px solid #a7f3d0;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 12px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 20px;
            }
            .meta-item {
              font-size: 11px;
            }
            .meta-label {
              color: #64748b;
              font-weight: 500;
            }
            .meta-value {
              color: #0f172a;
              font-weight: 700;
              font-family: monospace;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
              text-align: left;
            }
            th {
              background: #f1f5f9;
              padding: 9px 12px;
              font-weight: 700;
              color: #475569;
              font-size: 11px;
              text-transform: uppercase;
              border-bottom: 2px solid #cbd5e1;
            }
            .footer {
              margin-top: 24px;
              padding-top: 12px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              color: #94a3b8;
            }
            @media print {
              .no-print {
                display: none !important;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="toolbar no-print">
            <span style="font-size: 13px; font-weight: 600; color: #334155;">
              📄 Audit Trail Print &amp; PDF Export Preview
            </span>
            <div style="display: flex; gap: 8px;">
              <button class="btn-print" onclick="window.print()">Print / Save as PDF</button>
              <button class="btn-close" onclick="window.close()">Close</button>
            </div>
          </div>
          <div class="header">
            <div>
              <h1 class="title">${tripTitle}${tripDest}</h1>
              <p class="subtitle">Official Ledger Audit Trail &amp; Append-Only Event Stream</p>
            </div>
            <div style="text-align: right;">
              <span class="badge">IMMUTABLE LOG VERIFIED</span>
              <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Double-Entry Deterministic Engine</div>
            </div>
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">Total Events:</span> <span class="meta-value">${events.length}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Generated On:</span> <span class="meta-value">${now}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Audit Engine:</span> <span class="meta-value">Tulis Smart Ledger v2.4</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 55px; text-align: center;">Seq</th>
                <th style="width: 145px;">Timestamp</th>
                <th style="width: 155px;">Event Type</th>
                <th>Description</th>
                <th style="width: 110px;">Logged By</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding: 24px; color: #94a3b8;">No events recorded in this ledger.</td></tr>'}
            </tbody>
          </table>
          <div class="footer">
            <span>Provably Reconciled · Append-Only Event Stream · Tulis Multi-Vendor Travel Ledger</span>
            <span>Integrity: Zero-Sum Verified</span>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Download CSV */}
          <button
            onClick={handleDownloadCSV}
            className="neu-btn px-3.5 py-1.5 text-xs font-semibold text-ink-primary hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Download audit trail as CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Download CSV</span>
          </button>

          {/* Download PDF */}
          <button
            onClick={handleDownloadPDF}
            className="neu-btn px-3.5 py-1.5 text-xs font-semibold text-ink-primary hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Download or print audit trail report as PDF"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Download PDF</span>
          </button>

          {/* F4.3 Fairness Audit Report */}
          <button
            onClick={() => setIsFairnessModalOpen(true)}
            className="neu-btn px-3.5 py-1.5 text-xs font-semibold text-ink-primary hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
            title="Open F4.3 Fairness & Equity Audit Report"
          >
            <Scale className="w-3.5 h-3.5 text-emerald-500" />
            <span>Fairness Audit</span>
          </button>

          {/* Total Events Logged Badge */}
          <span className="text-xs px-3.5 py-1.5 rounded-xl bg-surface-inset text-ink-primary border border-surface-hairline font-bold font-numeric flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Total Events Logged: {(events || []).length}</span>
          </span>
        </div>
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

      {/* Printable In-App Audit Report Document Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md print:p-0 print:bg-white">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-4xl bg-surface-overlay border border-surface-hairline rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:bg-white print:text-black"
            >
              {/* Header Ribbon (Hidden in Print) */}
              <div className="p-5 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-serif-display font-bold text-ink-primary">
                      Official Ledger Audit Trail Document
                    </h3>
                    <p className="text-xs text-ink-secondary">
                      Append-only cryptographic lineage of all group transactions &amp; revisions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadCSV}
                    className="neu-btn px-3 py-1.5 text-xs font-semibold text-ink-primary hover:text-emerald-500 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="neu-btn-primary px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Save as PDF</span>
                  </button>
                  <button
                    onClick={() => setIsReportModalOpen(false)}
                    className="p-1.5 rounded-xl hover:bg-surface-base text-ink-muted hover:text-ink-primary transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Document Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-5 print:overflow-visible flex-1">
                {/* Document Masthead */}
                <div className="border-b-2 border-surface-hairline pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-mono text-xs tracking-wider text-emerald-600 dark:text-emerald-400 font-bold uppercase">
                        Tulis Smart Ledger Engine
                      </span>
                    </div>
                    <h2 className="text-2xl font-serif-display font-black text-ink-primary tracking-tight">
                      {trip?.title || 'Trip Ledger Audit'}
                    </h2>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Destination: {trip?.destination || 'Global'} · Currency: {trip?.baseCurrency || 'INR'}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Deterministic Zero-Sum Verified
                    </span>
                    <div className="text-[11px] text-ink-muted font-mono mt-1">
                      Exported: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Audit Table */}
                <div className="overflow-x-auto rounded-2xl border border-surface-hairline">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-base border-b border-surface-hairline">
                        <th className="p-3 font-semibold text-ink-secondary w-14">Seq</th>
                        <th className="p-3 font-semibold text-ink-secondary w-36">Timestamp</th>
                        <th className="p-3 font-semibold text-ink-secondary w-40">Event Type</th>
                        <th className="p-3 font-semibold text-ink-secondary">Action Description</th>
                        <th className="p-3 font-semibold text-ink-secondary w-32">Actor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-hairline/60">
                      {(events || []).map((evt, idx) => {
                        const rawEvt = evt as any;
                        const seq = evt.sequenceNum ?? rawEvt.sequence_num ?? (idx + 1);
                        const ts = evt.timestamp || rawEvt.created_at || '';
                        const formattedTs = ts
                          ? new Date(ts).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : '—';
                        const eventType = String(evt.eventType || rawEvt.event_type || 'LEDGER_EVENT');
                        const desc = String(
                          evt.description ||
                            rawEvt.payload?.description ||
                            rawEvt.payload_json?.description ||
                            `${eventType.replace(/_/g, ' ')} recorded`
                        );
                        const actor = String(
                          evt.actorName || rawEvt.actor_name || rawEvt.actor_id || evt.actorId || 'Traveler'
                        );

                        return (
                          <tr key={evt.id || idx} className="hover:bg-surface-base/50">
                            <td className="p-3 font-mono font-bold text-amber-500">#{seq}</td>
                            <td className="p-3 text-[11px] text-ink-muted whitespace-nowrap">{formattedTs}</td>
                            <td className="p-3 font-mono font-semibold text-[11px] text-ink-primary">
                              {eventType.replace(/_/g, ' ')}
                            </td>
                            <td className="p-3 text-ink-primary font-medium">{desc}</td>
                            <td className="p-3 text-ink-secondary font-medium">{actor}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-surface-hairline flex items-center justify-between text-[11px] text-ink-muted">
                  <span>Provably Reconciled · Append-Only Event Stream</span>
                  <span className="font-mono">Total Events: {(events || []).length}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* F4.3 Fairness & Equity Audit Modal */}
      {trip && (
        <FairnessReportModal
          isOpen={isFairnessModalOpen}
          onClose={() => setIsFairnessModalOpen(false)}
          trip={trip}
          participants={participants}
          netBalances={netBalances}
          expenses={expenses}
          attendanceMatrix={attendanceMatrix}
        />
      )}
    </div>
  );
};
