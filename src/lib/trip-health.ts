import { Trip, Participant, Booking, Expense, Payment, Anomaly, ReconciliationAudit } from './types';
import { computeReconciliationAudit } from './ledger-engine';

export interface HealthDeduction {
  id: string;
  label: string;
  points: number;
  reason: string;
  actionLabel: string;
  actionTab?: string;
  actionTarget?: string;
}

export interface ReadinessChecklistItem {
  id: string;
  title: string;
  status: 'complete' | 'pending' | 'warning';
  description: string;
  actionLabel: string;
  actionTab?: string;
  actionType?: string;
  assignee?: string;
}

export interface TripHealthResult {
  score: number;
  status: 'healthy' | 'attention' | 'action_required';
  statusLabel: string;
  statusColor: string;
  deductions: HealthDeduction[];
  checklist: ReadinessChecklistItem[];
  metrics: {
    participantsTotal: number;
    participantsWithUpi: number;
    pendingBookingsCount: number;
    openAnomaliesCount: number;
    discrepancyAmount: number;
    isReconciled: boolean;
  };
}

/**
 * Computes the composite Trip Health Score (0–100) and Readiness Checklist
 * Per TULIS_ANTIGRAVITY_BUILD_SPEC.md Feature F2.1 and F2.2
 */
export function computeTripHealth(
  trip: Trip,
  participants: Participant[] = [],
  bookings: Booking[] = [],
  expenses: Expense[] = [],
  payments: Payment[] = [],
  anomalies: Anomaly[] = []
): TripHealthResult {
  const deductions: HealthDeduction[] = [];
  const checklist: ReadinessChecklistItem[] = [];

  // Run reconciliation audit
  const audit = computeReconciliationAudit(participants, expenses, payments, [], bookings);
  const discrepancy = Math.abs(audit.discrepancy || 0);
  const isReconciled = audit.isReconciled && discrepancy <= 0.02;

  // 1. Reconciliation Discrepancy (-30)
  if (!isReconciled) {
    deductions.push({
      id: 'reconciliation-discrepancy',
      label: 'Financial Reconciliation Discrepancy',
      points: -30,
      reason: `Net balance sum has a drift of ₹${discrepancy.toFixed(2)} across participants.`,
      actionLabel: 'Audit Ledger',
      actionTab: 'ledger',
    });
    checklist.push({
      id: 'chk-audit',
      title: 'Ledger Zero-Sum Reconciliation',
      status: 'warning',
      description: `Reconciliation drift of ₹${discrepancy.toFixed(2)} detected in ledger balances.`,
      actionLabel: 'Review Audit',
      actionTab: 'ledger',
    });
  } else {
    checklist.push({
      id: 'chk-audit',
      title: 'Ledger Zero-Sum Reconciliation',
      status: 'complete',
      description: 'Zero drift detected. All allocations match net incurred expenditure.',
      actionLabel: 'View Ledger',
      actionTab: 'ledger',
    });
  }

  // 2. Open Anomalies (-15 per anomaly)
  const openAnomalies = anomalies.filter((a) => !a.dismissed);
  if (openAnomalies.length > 0) {
    const penalty = Math.min(openAnomalies.length * 15, 45); // Max 45 pts deduction
    deductions.push({
      id: 'open-anomalies',
      label: `${openAnomalies.length} Open Anomaly Alert${openAnomalies.length > 1 ? 's' : ''}`,
      points: -penalty,
      reason: `${openAnomalies.length} schedule conflict(s) or variance alert(s) require organizer review.`,
      actionLabel: 'Resolve Anomalies',
      actionTab: 'overview',
    });
    checklist.push({
      id: 'chk-anomalies',
      title: 'Anomaly & Schedule Verification',
      status: 'warning',
      description: `${openAnomalies.length} active conflict(s) flagged by deterministic audit engine.`,
      actionLabel: 'Review Conflicts',
      actionTab: 'overview',
    });
  } else {
    checklist.push({
      id: 'chk-anomalies',
      title: 'Anomaly & Schedule Verification',
      status: 'complete',
      description: 'No schedule overlaps, ghost booking IDs, or extreme outliers detected.',
      actionLabel: 'All Clear',
      actionTab: 'overview',
    });
  }

  // 3. Participant UPI Setup (-10 if any active participant is missing upiId)
  const activeParticipants = participants.filter((p) => p.status === 'active');
  const missingUpiParticipants = activeParticipants.filter((p) => !p.upiId || p.upiId.trim() === '');
  const upiCoveragePct =
    activeParticipants.length > 0
      ? Math.round(((activeParticipants.length - missingUpiParticipants.length) / activeParticipants.length) * 100)
      : 100;

  if (missingUpiParticipants.length > 0) {
    deductions.push({
      id: 'missing-upi',
      label: `${missingUpiParticipants.length} Member${missingUpiParticipants.length > 1 ? 's' : ''} Missing UPI ID`,
      points: -10,
      reason: `${missingUpiParticipants.map((p) => p.name).join(', ')} cannot receive automated 1-click settlements.`,
      actionLabel: 'Configure UPI',
      actionTab: 'squad',
    });
    checklist.push({
      id: 'chk-upi',
      title: 'Squad Settlement Configuration',
      status: 'pending',
      description: `${missingUpiParticipants.length} of ${activeParticipants.length} traveler(s) need UPI ID added for payout routing.`,
      actionLabel: 'Manage Squad',
      actionTab: 'squad',
      assignee: missingUpiParticipants.map((p) => p.name).slice(0, 2).join(', '),
    });
  } else {
    checklist.push({
      id: 'chk-upi',
      title: 'Squad Settlement Configuration',
      status: 'complete',
      description: `All ${activeParticipants.length} traveler(s) have verified VPA/UPI handles registered.`,
      actionLabel: 'Squad Ready',
      actionTab: 'squad',
    });
  }

  // 4. Pending Bookings (-10 if any booking is pending within 48h of start, or generally pending)
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const tripStartDate = trip.startDate ? new Date(trip.startDate).getTime() : Date.now();
  const hoursUntilTrip = (tripStartDate - Date.now()) / (1000 * 60 * 60);
  const isImminent = hoursUntilTrip <= 48;

  if (pendingBookings.length > 0) {
    const penalty = isImminent ? -10 : -5;
    deductions.push({
      id: 'pending-bookings',
      label: `${pendingBookings.length} Unconfirmed Reservation${pendingBookings.length > 1 ? 's' : ''}`,
      points: penalty,
      reason: `${pendingBookings.map((b) => b.title).join(', ')} ${isImminent ? 'within 48 hours of trip!' : 'still awaiting confirmation.'}`,
      actionLabel: 'Confirm Bookings',
      actionTab: 'bookings',
    });
    checklist.push({
      id: 'chk-bookings',
      title: 'Reservations & Booking Confirmation',
      status: isImminent ? 'warning' : 'pending',
      description: `${pendingBookings.length} booking(s) currently unconfirmed (${pendingBookings[0]?.title}${pendingBookings.length > 1 ? '...' : ''}).`,
      actionLabel: 'Review Bookings',
      actionTab: 'bookings',
    });
  } else {
    checklist.push({
      id: 'chk-bookings',
      title: 'Reservations & Booking Confirmation',
      status: 'complete',
      description: bookings.length > 0 ? `All ${bookings.length} reservations confirmed with vendors.` : 'No pending booking reservations.',
      actionLabel: 'Bookings Clear',
      actionTab: 'bookings',
    });
  }

  // 5. Trip Budget Allocated
  if (!trip.budgetCeiling || trip.budgetCeiling <= 0) {
    checklist.push({
      id: 'chk-budget',
      title: 'Trip Target Budget',
      status: 'pending',
      description: 'No total budget ceiling set for the group. Set budget to track burn rate.',
      actionLabel: 'Set Budget',
      actionTab: 'overview',
    });
  } else {
    checklist.push({
      id: 'chk-budget',
      title: 'Trip Target Budget',
      status: 'complete',
      description: `Budget capped at ₹${trip.budgetCeiling.toLocaleString('en-IN')}.`,
      actionLabel: 'Budget Active',
      actionTab: 'overview',
    });
  }

  // Calculate final score
  const totalDeductions = deductions.reduce((sum, d) => sum + d.points, 0);
  const rawScore = 100 + totalDeductions;
  const score = Math.max(0, Math.min(100, rawScore));

  let status: 'healthy' | 'attention' | 'action_required' = 'healthy';
  let statusLabel = 'Healthy & Ready';
  let statusColor = '#5FA97D'; // Forest Green

  if (score < 50) {
    status = 'action_required';
    statusLabel = 'Action Required';
    statusColor = '#B5484C'; // Crimson / Deep Red
  } else if (score < 80) {
    status = 'attention';
    statusLabel = 'Needs Attention';
    statusColor = '#E0B84C'; // Warm Amber
  }

  return {
    score,
    status,
    statusLabel,
    statusColor,
    deductions,
    checklist,
    metrics: {
      participantsTotal: activeParticipants.length,
      participantsWithUpi: activeParticipants.length - missingUpiParticipants.length,
      pendingBookingsCount: pendingBookings.length,
      openAnomaliesCount: openAnomalies.length,
      discrepancyAmount: discrepancy,
      isReconciled,
    },
  };
}
