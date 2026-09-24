// FareShare Core Math & State Engine

import {
  Participant,
  Expense,
  Payment,
  SplitMethod,
  ExpenseAllocation,
  ParticipantNetBalance,
  SimplifiedDebt,
  Booking,
  RefundEvent,
  ReconciliationAudit,
  RefundPolicy,
  Anomaly,
  DryRunResult,
  DryRunDelta,
  Trip,
  BookingCategory,
  ItineraryConflict,
  ParsedChatExpense,
  Squad,
} from './types';

/**
 * Calculates allocation shares per participant according to the chosen SplitMethod
 */
export function calculateSplits(
  totalAmount: number,
  splitMethod: SplitMethod,
  participants: Participant[],
  customInputs?: {
    weights?: Record<string, number>;
    lineItems?: Record<string, number>;
    subsidyAmount?: number;
    manualAllocations?: Record<string, number>;
  }
): ExpenseAllocation[] {
  if (participants.length === 0 || totalAmount <= 0) {
    return [];
  }

  let allocatableAmount = totalAmount;

  // Handle Organizer Subsidy strategy first if applicable
  if (splitMethod === 'organizer_subsidy' && customInputs?.subsidyAmount) {
    allocatableAmount = Math.max(0, totalAmount - customInputs.subsidyAmount);
  }

  const result: ExpenseAllocation[] = [];

  switch (splitMethod) {
    case 'manual': {
      const manualMap = customInputs?.manualAllocations || {};
      const equalShare = Number((totalAmount / participants.length).toFixed(2));
      participants.forEach((p) => {
        const val = manualMap[p.id] !== undefined ? manualMap[p.id] : equalShare;
        result.push({
          participantId: p.id,
          amountOwed: Number(val.toFixed(2)),
        });
      });
      break;
    }
    case 'equal':
    case 'organizer_subsidy': {
      const share = Math.floor((allocatableAmount / participants.length) * 100) / 100;
      let remainder = Math.round((allocatableAmount - share * participants.length) * 100);

      participants.forEach((p, idx) => {
        // Distribute remainder cents deterministically to first N participants
        const extraCent = idx < remainder ? 0.01 : 0;
        result.push({
          participantId: p.id,
          amountOwed: Number((share + extraCent).toFixed(2)),
        });
      });
      break;
    }

    case 'weighted': {
      const weights = customInputs?.weights || {};
      let totalWeight = 0;
      participants.forEach((p) => {
        const w = weights[p.id] !== undefined ? weights[p.id] : (p.weight ?? 1);
        totalWeight += w;
      });

      if (totalWeight <= 0) totalWeight = participants.length;

      let sumAllocated = 0;
      participants.forEach((p, idx) => {
        const pWeight = weights[p.id] !== undefined ? weights[p.id] : (p.weight ?? 1);
        if (idx === participants.length - 1) {
          // Last participant absorbs rounding difference
          result.push({
            participantId: p.id,
            amountOwed: Number((totalAmount - sumAllocated).toFixed(2)),
          });
        } else {
          const share = Number(((totalAmount * pWeight) / totalWeight).toFixed(2));
          sumAllocated += share;
          result.push({ participantId: p.id, amountOwed: share });
        }
      });
      break;
    }

    case 'line_item': {
      const lineItems = customInputs?.lineItems || {};
      let sum = 0;
      participants.forEach((p) => {
        const itemShare = lineItems[p.id] || 0;
        sum += itemShare;
        result.push({ participantId: p.id, amountOwed: Number(itemShare.toFixed(2)) });
      });
      if (sum === 0) {
        // Fallback to equal split if no line items were specified
        return calculateSplits(totalAmount, 'equal', participants);
      }
      // If line items sum differs from total, scale proportionally
      if (Math.abs(sum - totalAmount) > 0.009) {
        const ratio = totalAmount / sum;
        let sumAllocated = 0;
        result.forEach((r, idx) => {
          if (idx === result.length - 1) {
            r.amountOwed = Number((totalAmount - sumAllocated).toFixed(2));
          } else {
            r.amountOwed = Number((r.amountOwed * ratio).toFixed(2));
            sumAllocated += r.amountOwed;
          }
        });
      }
      break;
    }

    case 'room_tier': {
      // Room multipliers: Suite = 1.4x, Standard = 1.0x, Economy = 0.8x
      const tierMultipliers: Record<string, number> = {
        suite: 1.4,
        standard: 1.0,
        economy: 0.8,
      };

      let totalWeight = 0;
      participants.forEach((p) => {
        const mult = tierMultipliers[p.roomTier || 'standard'] || 1.0;
        totalWeight += mult;
      });

      let sumAllocated = 0;
      participants.forEach((p, idx) => {
        const mult = tierMultipliers[p.roomTier || 'standard'] || 1.0;
        if (idx === participants.length - 1) {
          result.push({
            participantId: p.id,
            amountOwed: Number((totalAmount - sumAllocated).toFixed(2)),
          });
        } else {
          const share = Number(((totalAmount * mult) / totalWeight).toFixed(2));
          sumAllocated += share;
          result.push({ participantId: p.id, amountOwed: share });
        }
      });
      break;
    }
  }

  return result;
}

/**
 * Dynamically re-derives expense allocations for all expenses whenever participants join, leave, or change configuration
 */
export function recalculateExpenseAllocations(
  expenses: Expense[],
  participants: Participant[],
  bookings: Booking[] = []
): Expense[] {
  const activeParts = participants.filter((p) => p.status === 'active');
  if (activeParts.length === 0) return expenses;

  return expenses.map((e) => {
    // If manual split and allocations exist, preserve them
    if (e.splitMethod === 'manual' && e.allocations && e.allocations.length > 0) {
      return e;
    }

    // Determine target active participants for this expense
    let targetParticipants = activeParts;
    if (e.bookingId) {
      const linkedBooking = bookings.find((b) => b.id === e.bookingId);
      if (linkedBooking && linkedBooking.participantIds && linkedBooking.participantIds.length > 0) {
        targetParticipants = activeParts.filter((p) => linkedBooking.participantIds.includes(p.id));
      }
    }

    if (targetParticipants.length === 0) targetParticipants = activeParts;

    // Recalculate allocations based on current active roster & weights
    const newAllocations = calculateSplits(e.totalAmount, e.splitMethod, targetParticipants, {
      subsidyAmount: e.subsidyAmount,
    });

    return {
      ...e,
      allocations: newAllocations,
    };
  });
}

/**
 * Computes net financial balance for every participant from the event-sourced log of Expenses, Payments, & Refunds
 */
export function computeNetBalances(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  refunds: RefundEvent[] = [],
  bookings: Booking[] = []
): ParticipantNetBalance[] {
  const dynamicExpenses = recalculateExpenseAllocations(expenses, participants, bookings);
  const map: Record<string, { totalPaid: number; totalOwed: number }> = {};

  participants.forEach((p) => {
    map[p.id] = { totalPaid: 0, totalOwed: 0 };
  });

  // Fold Expenses: Payer(s) get credit for outlay, allocated participants get debit
  dynamicExpenses.forEach((e) => {
    if (e.paidBySplits && e.paidBySplits.length > 0) {
      // Multiple payers case: credit each contributing participant
      e.paidBySplits.forEach((split) => {
        if (!map[split.participantId]) {
          map[split.participantId] = { totalPaid: 0, totalOwed: 0 };
        }
        map[split.participantId].totalPaid += split.amount;
      });
    } else {
      // Single payer case
      if (!map[e.paidById]) {
        map[e.paidById] = { totalPaid: 0, totalOwed: 0 };
      }
      
      // If the organizer provided a subsidy, the claimable outlay for reimbursement is totalAmount - subsidyAmount
      const claimablePaid = e.subsidyAmount && e.subsidyAmount > 0
        ? Math.max(0, e.totalAmount - e.subsidyAmount)
        : e.totalAmount;

      map[e.paidById].totalPaid += claimablePaid;
    }

    (e.allocations || []).forEach((alloc) => {
      if (!map[alloc.participantId]) {
        map[alloc.participantId] = { totalPaid: 0, totalOwed: 0 };
      }
      map[alloc.participantId].totalOwed += (alloc.amountOwed || 0);
    });
  });

  // Fold Refunds: Payer gets vendor refund credit (totalPaid reduced), allocated participants get debt relief (totalOwed reduced)
  refunds.forEach((ref) => {
    const expense = dynamicExpenses.find((e) => e.id === ref.expenseId || (e.bookingId && e.bookingId === ref.bookingId));
    
    if (expense && expense.totalAmount > 0) {
      // Portion of expense that was claimable (excluding organizer subsidy)
      const claimablePaid = expense.subsidyAmount && expense.subsidyAmount > 0
        ? Math.max(0, expense.totalAmount - expense.subsidyAmount)
        : expense.totalAmount;
      
      const refundRatio = Math.min(1, ref.amount / expense.totalAmount);
      const claimableRefund = claimablePaid * refundRatio;

      if (map[ref.refundedToPayerId]) {
        map[ref.refundedToPayerId].totalPaid -= claimableRefund;
      }

      // Distribute debt relief across allocations proportionally with exact penny preservation
      const allocs = expense.allocations || [];
      let sumRelief = 0;
      allocs.forEach((alloc, idx) => {
        if (map[alloc.participantId]) {
          let relief: number;
          if (idx === allocs.length - 1) {
            relief = Number((claimableRefund - sumRelief).toFixed(2));
          } else {
            relief = Number(((alloc.amountOwed || 0) * refundRatio).toFixed(2));
            sumRelief += relief;
          }
          map[alloc.participantId].totalOwed -= relief;
        }
      });
    } else {
      // General refund: divide debt relief evenly among participants
      if (map[ref.refundedToPayerId]) {
        map[ref.refundedToPayerId].totalPaid -= ref.amount;
      }
      const share = ref.amount / Math.max(1, participants.length);
      participants.forEach((p) => {
        if (map[p.id]) {
          map[p.id].totalOwed -= share;
        }
      });
    }
  });

  // Fold Peer-to-Peer Payments:
  // Payer gets credit (paid towards trip), Payee gets debit (reimbursement collected)
  // Disputed payments are bypassed from wiping balances until confirmed
  payments.forEach((pay) => {
    if (pay.status === 'disputed') return;
    if (!map[pay.payerId]) map[pay.payerId] = { totalPaid: 0, totalOwed: 0 };
    if (!map[pay.payeeId]) map[pay.payeeId] = { totalPaid: 0, totalOwed: 0 };

    map[pay.payerId].totalPaid += pay.amount;
    map[pay.payeeId].totalPaid -= pay.amount;
  });

  return participants.map((p) => {
    const stats = map[p.id] || { totalPaid: 0, totalOwed: 0 };
    const netBalance = Number((stats.totalPaid - stats.totalOwed).toFixed(2));
    let status: 'surplus' | 'deficit' | 'settled' = 'settled';
    if (netBalance > 0.01) status = 'surplus';
    else if (netBalance < -0.01) status = 'deficit';

    return {
      participant: p,
      totalPaid: Number(stats.totalPaid.toFixed(2)),
      totalOwed: Number(stats.totalOwed.toFixed(2)),
      netBalance,
      status,
    };
  });
}

/**
 * Computes real-time zero-sum financial reconciliation audit metrics
 */
export function computeReconciliationAudit(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  refunds: RefundEvent[] = [],
  bookings: Booking[] = []
): ReconciliationAudit {
  const totalExpenses = Number(expenses.reduce((sum, e) => sum + e.totalAmount, 0).toFixed(2));
  const totalRefunds = Number(refunds.reduce((sum, r) => sum + r.amount, 0).toFixed(2));
  const totalSubsidies = Number(expenses.reduce((sum, e) => sum + (e.subsidyAmount || 0), 0).toFixed(2));

  const netBalances = computeNetBalances(participants, expenses, payments, refunds, bookings);
  const totalPaidByParticipants = Number(netBalances.reduce((sum, b) => sum + b.totalPaid, 0).toFixed(2));
  const totalAllocatedOwed = Number(netBalances.reduce((sum, b) => sum + b.totalOwed, 0).toFixed(2));
  const netBalanceSum = Number(netBalances.reduce((sum, b) => sum + b.netBalance, 0).toFixed(2));

  const netIncurred = totalPaidByParticipants;
  const discrepancy = Math.abs(netBalanceSum);
  const isReconciled = discrepancy <= 0.02; // Small floating point tolerance

  return {
    totalExpenses,
    totalRefunds,
    totalSubsidies,
    netIncurred,
    totalPaidByParticipants,
    totalAllocatedOwed,
    netBalanceSum,
    isReconciled,
    discrepancy,
  };
}

/**
 * Processes a booking cancellation and generates appropriate refund events based on selected policy
 */
export function processBookingCancellation(
  booking: Booking,
  bookingExpenses: Expense[],
  policy: RefundPolicy,
  refundPercent: number = 100,
  customAmount?: number,
  reason?: string
): RefundEvent[] {
  if (policy === 'non_refundable' || bookingExpenses.length === 0) {
    return [];
  }

  const refundEvents: RefundEvent[] = [];

  bookingExpenses.forEach((exp) => {
    let refundAmount = 0;
    if (policy === 'full') {
      refundAmount = exp.totalAmount;
    } else if (policy === 'partial' || policy === 'per_head') {
      refundAmount = Number(((exp.totalAmount * refundPercent) / 100).toFixed(2));
    } else if (customAmount !== undefined) {
      refundAmount = Math.min(exp.totalAmount, customAmount);
    }

    if (refundAmount > 0) {
      refundEvents.push({
        id: 'ref-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        tripId: booking.tripId,
        bookingId: booking.id,
        expenseId: exp.id,
        amount: Number(refundAmount.toFixed(2)),
        currency: 'INR',
        refundedToPayerId: exp.paidById,
        policy,
        reason: reason || `Cancelled booking "${booking.title}" under ${policy} refund policy (${refundPercent}%).`,
        createdAt: new Date().toISOString(),
      });
    }
  });

  return refundEvents;
}


/**
 * Greedy O(N log N) Graph-Based Debt Simplification Algorithm
 * Compresses complex pairwise debt networks into at most (N - 1) transactions
 */
export function simplifyDebts(netBalances: ParticipantNetBalance[]): SimplifiedDebt[] {
  // Step 1: Filter out zero-balance participants
  const nonZero = netBalances.filter((b) => Math.abs(b.netBalance) >= 0.01);

  // Step 2: Separate into Creditors (+) and Debtors (-)
  const creditors = nonZero
    .filter((b) => b.netBalance > 0)
    .map((b) => ({ ...b, balance: b.netBalance }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = nonZero
    .filter((b) => b.netBalance < 0)
    .map((b) => ({ ...b, balance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.balance - a.balance);

  const settlements: SimplifiedDebt[] = [];
  let i = 0;
  let j = 0;

  // Step 3: Greedily match largest debtor with largest creditor
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const transferAmount = Math.min(debtor.balance, creditor.balance);
    if (transferAmount >= 0.009) {
      settlements.push({
        fromId: debtor.participant.id,
        fromName: debtor.participant.name,
        toId: creditor.participant.id,
        toName: creditor.participant.name,
        amount: Number(transferAmount.toFixed(2)),
        status: 'proposed',
        payeeUpiId: creditor.participant.upiId,
        payeeQrCodeUrl: creditor.participant.qrCodeUrl,
      });
    }

    debtor.balance -= transferAmount;
    creditor.balance -= transferAmount;

    if (debtor.balance <= 0.009) i++;
    if (creditor.balance <= 0.009) j++;
  }

  return settlements;
}

/**
 * Calculates budget vs actual expense variance per category and in total
 */
export function calculateVariance(bookings: Booking[], expenses: Expense[]) {
  let totalEstimated = 0;
  let totalActual = 0;

  const categoryMap: Record<string, { estimated: number; actual: number }> = {};

  bookings.forEach((b) => {
    totalEstimated += b.estimatedCost;
    if (!categoryMap[b.category]) categoryMap[b.category] = { estimated: 0, actual: 0 };
    categoryMap[b.category].estimated += b.estimatedCost;
  });

  expenses.forEach((e) => {
    totalActual += e.totalAmount;
    if (!categoryMap[e.category]) categoryMap[e.category] = { estimated: 0, actual: 0 };
    categoryMap[e.category].actual += e.totalAmount;
  });

  const delta = Number((totalActual - totalEstimated).toFixed(2));
  const isOverBudget = delta > 0;

  return {
    totalEstimated: Number(totalEstimated.toFixed(2)),
    totalActual: Number(totalActual.toFixed(2)),
    delta,
    isOverBudget,
    percentVariance: totalEstimated > 0 ? Number(((delta / totalEstimated) * 100).toFixed(1)) : 0,
    byCategory: categoryMap,
  };
}

/**
 * Speculative / Dry-Run Event Engine (F2)
 * Folds events against an in-memory clone of state without committing to event log
 */
export function simulateDryRun(
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  refunds: RefundEvent[],
  bookings: Booking[],
  action: {
    type: 'REMOVE_PARTICIPANT' | 'CANCEL_BOOKING' | 'ADD_EXPENSE' | 'REVISE_EXPENSE';
    participantId?: string;
    bookingId?: string;
    refundPercent?: number;
    refundPolicy?: RefundPolicy;
    newExpense?: {
      title: string;
      totalAmount: number;
      splitMethod: SplitMethod;
      paidById: string;
      category: BookingCategory;
    };
    revisedExpenseId?: string;
    revisedAmount?: number;
  }
): DryRunResult {
  // 1. Compute baseline
  const baselineActive = participants.filter((p) => p.status === 'active');
  const baselineBalances = computeNetBalances(baselineActive, expenses, payments, refunds, bookings);
  const baselineMap = new Map<string, number>();
  baselineBalances.forEach((b) => baselineMap.set(b.participant.id, b.netBalance));

  // 2. Clone state for simulation
  let simParticipants = participants.map((p) => ({ ...p }));
  let simExpenses = expenses.map((e) => ({ ...e, allocations: [...(e.allocations || [])] }));
  let simRefunds = [...refunds];
  let simBookings = bookings.map((b) => ({ ...b, participantIds: [...(b.participantIds || [])] }));
  let actionDescription = '';

  if (action.type === 'REMOVE_PARTICIPANT' && action.participantId) {
    const target = simParticipants.find((p) => p.id === action.participantId);
    actionDescription = `Speculative removal of ${target?.name || 'traveler'}. Active shares redistribute across remaining participants.`;
    simParticipants = simParticipants.map((p) =>
      p.id === action.participantId ? { ...p, status: 'removed' as const } : p
    );
  } else if (action.type === 'CANCEL_BOOKING' && action.bookingId) {
    const targetBooking = simBookings.find((b) => b.id === action.bookingId);
    const policy = action.refundPolicy || 'full';
    const percent = action.refundPercent ?? 100;
    actionDescription = `Speculative cancellation of "${targetBooking?.title}" with ${percent}% (${policy}) vendor refund.`;

    const bookingExpenses = simExpenses.filter((e) => e.bookingId === action.bookingId);
    const newRefunds = processBookingCancellation(targetBooking!, bookingExpenses, policy, percent);
    simRefunds = [...simRefunds, ...newRefunds];
    simBookings = simBookings.map((b) =>
      b.id === action.bookingId ? { ...b, status: 'cancelled' as const } : b
    );
  } else if (action.type === 'ADD_EXPENSE' && action.newExpense) {
    actionDescription = `Speculative addition of ₹${action.newExpense.totalAmount} (${action.newExpense.title}) via ${action.newExpense.splitMethod} split.`;
    const active = simParticipants.filter((p) => p.status === 'active');
    const allocs = calculateSplits(action.newExpense.totalAmount, action.newExpense.splitMethod, active);
    const simExp: Expense = {
      id: 'sim-exp-' + Date.now(),
      tripId: participants[0]?.tripId || 'trip-1',
      title: action.newExpense.title,
      totalAmount: action.newExpense.totalAmount,
      currency: 'INR',
      splitMethod: action.newExpense.splitMethod,
      paidById: action.newExpense.paidById,
      category: action.newExpense.category,
      createdAt: new Date().toISOString(),
      allocations: allocs,
    };
    simExpenses = [simExp, ...simExpenses];
  } else if (action.type === 'REVISE_EXPENSE' && action.revisedExpenseId && action.revisedAmount !== undefined) {
    actionDescription = `Speculative rate revision for expense to ₹${action.revisedAmount}.`;
    simExpenses = simExpenses.map((e) => {
      if (e.id === action.revisedExpenseId) {
        const active = simParticipants.filter((p) => p.status === 'active');
        const realloc = calculateSplits(action.revisedAmount!, e.splitMethod, active);
        return { ...e, totalAmount: action.revisedAmount!, allocations: realloc };
      }
      return e;
    });
  }

  // 3. Fold simulated state
  const simActive = simParticipants.filter((p) => p.status === 'active');
  const projectedBalances = computeNetBalances(simActive, simExpenses, payments, simRefunds, simBookings);
  const projectedAudit = computeReconciliationAudit(simActive, simExpenses, payments, simRefunds, simBookings);
  const newSimplifiedDebts = simplifyDebts(projectedBalances);

  // 4. Compute balance deltas
  const deltas: DryRunDelta[] = simParticipants.map((p) => {
    const cur = baselineMap.get(p.id) || 0;
    const projEntry = projectedBalances.find((b) => b.participant.id === p.id);
    const proj = projEntry ? projEntry.netBalance : 0;
    return {
      participantId: p.id,
      participantName: p.name,
      currentNet: cur,
      projectedNet: proj,
      delta: Number((proj - cur).toFixed(2)),
    };
  });

  return {
    actionType: action.type,
    description: actionDescription,
    deltas,
    projectedAudit,
    newSimplifiedDebts,
  };
}

/**
 * Deterministic Anomaly Detection Engine (F6)
 * Strict algorithmic checks - guarantees zero LLM tampering with math
 */
export function detectAnomalies(
  trip: Trip,
  participants: Participant[],
  bookings: Booking[],
  expenses: Expense[],
  payments: Payment[]
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const tripId = trip.id;
  const now = new Date().toISOString();

  // 1. Check for Schedule Overlaps
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      const b1 = bookings[i];
      const b2 = bookings[j];
      if (b1.status === 'cancelled' || b2.status === 'cancelled') continue;

      const t1Start = new Date(b1.startTime).getTime();
      const t1End = new Date(b1.endTime).getTime();
      const t2Start = new Date(b2.startTime).getTime();
      const t2End = new Date(b2.endTime).getTime();

      // Check if time intervals overlap
      const isOverlap = t1Start < t2End && t2Start < t1End;
      if (isOverlap) {
        const p1 = b1.participantIds || [];
        const p2 = b2.participantIds || [];
        const sharedParticipants = p1.filter((id) => p2.includes(id));
        if (sharedParticipants.length > 0) {
          const names = sharedParticipants
            .map((id) => participants.find((p) => p.id === id)?.name)
            .filter(Boolean)
            .join(', ');
          anomalies.push({
            id: `anom-overlap-${b1.id}-${b2.id}`,
            tripId,
            type: 'SCHEDULE_CONFLICT',
            severity: 'high',
            title: `Schedule Conflict: "${b1.title}" & "${b2.title}"`,
            description: `${names} is scheduled for both activities simultaneously.`,
            affectedEntityIds: [b1.id, b2.id, ...sharedParticipants],
            createdAt: now,
          });
        }
      }
    }
  }

  // 2. Check for Room Overcapacity
  bookings.forEach((b) => {
    const pIds = b.participantIds || [];
    if (b.category === 'lodging' && b.roomCapacity && b.status !== 'cancelled') {
      if (pIds.length > b.roomCapacity) {
        anomalies.push({
          id: `anom-room-${b.id}`,
          tripId,
          type: 'ROOM_OVERCAPACITY',
          severity: 'medium',
          title: `Overcapacity Warning: "${b.title}"`,
          description: `Booking assigned ${pIds.length} travelers but max room capacity is ${b.roomCapacity}.`,
          affectedEntityIds: [b.id],
          createdAt: now,
        });
      }
    }
  });

  // 3. Check for Significant Budget Variance (>15% over estimated)
  bookings.forEach((b) => {
    if (b.status !== 'cancelled' && b.estimatedCost > 0 && b.actualCost > 0) {
      const overspend = b.actualCost - b.estimatedCost;
      const pctOver = (overspend / b.estimatedCost) * 100;
      if (pctOver > 15) {
        anomalies.push({
          id: `anom-var-${b.id}`,
          tripId,
          type: 'BUDGET_VARIANCE',
          severity: 'medium',
          title: `Budget Variance Breach: "${b.title}"`,
          description: `Actual cost ₹${b.actualCost.toLocaleString('en-IN')} exceeds estimate by ${pctOver.toFixed(1)}% (+₹${overspend.toLocaleString('en-IN')}).`,
          affectedEntityIds: [b.id],
          createdAt: now,
        });
      }
    }
  });

  // 4. Check for Inactive/Removed Participants Assigned to Bookings
  const removedIds = new Set(participants.filter((p) => p.status === 'removed').map((p) => p.id));
  bookings.forEach((b) => {
    if (b.status !== 'cancelled') {
      const pIds = b.participantIds || [];
      const ghostAssigned = pIds.filter((id) => removedIds.has(id));
      if (ghostAssigned.length > 0) {
        const names = ghostAssigned.map((id) => participants.find((p) => p.id === id)?.name).join(', ');
        anomalies.push({
          id: `anom-ghost-${b.id}`,
          tripId,
          type: 'ROSTER_MISMATCH',
          severity: 'low',
          title: `Removed Traveler on Roster: "${b.title}"`,
          description: `Removed participant(s) (${names}) still linked to booking participation scope.`,
          affectedEntityIds: [b.id, ...ghostAssigned],
          createdAt: now,
        });
      }
    }
  });

  // 5. Penny Mismatch Verification
  expenses.forEach((e) => {
    const allocs = e.allocations || [];
    if (allocs.length === 0) return;
    const allocSum = allocs.reduce((sum, a) => sum + (a.amountOwed || 0), 0);
    const subsidy = e.subsidyAmount || 0;
    const netExpected = Math.max(0, e.totalAmount - subsidy);
    if (Math.abs(allocSum - netExpected) > 0.05) {
      anomalies.push({
        id: `anom-alloc-${e.id}`,
        tripId,
        type: 'ALLOCATION_MISMATCH',
        severity: 'high',
        title: `Penny Discrepancy: "${e.title}"`,
        description: `Sum of shares (₹${allocSum.toFixed(2)}) does not match net bill (₹${netExpected.toFixed(2)}).`,
        affectedEntityIds: [e.id],
        createdAt: now,
      });
    }
  });

  return anomalies;
}

/**
 * Event-Grounded "Explain My Balance" Generator (F8)
 * Strict deterministic audit trail - creates conversational clarity
 */
export interface ParticipantBalanceExplanation {
  participant: Participant;
  netBalance: number;
  status: 'surplus' | 'deficit' | 'settled';
  items: Array<{
    type: 'paid_expense' | 'owed_expense' | 'received_refund' | 'p2p_payment_sent' | 'p2p_payment_received' | 'subsidy';
    title: string;
    amount: number;
    formattedAmount: string;
    description: string;
    timestamp?: string;
  }>;
  totalFronted: number;
  totalConsumed: number;
  totalP2PNet: number;
  totalRefundsNet: number;
  summaryText: string;
}

export function explainParticipantBalance(
  participantId: string,
  participants: Participant[],
  expenses: Expense[],
  payments: Payment[],
  refunds: RefundEvent[],
  bookings: Booking[] = []
): ParticipantBalanceExplanation {
  const participant = participants.find((p) => p.id === participantId) || participants[0];
  const dynamicExpenses = recalculateExpenseAllocations(expenses, participants, bookings);

  const items: ParticipantBalanceExplanation['items'] = [];
  let totalFronted = 0;
  let totalConsumed = 0;
  let totalP2PNet = 0;
  let totalRefundsNet = 0;

  // 1. Expenses Fronted by Participant
  dynamicExpenses.forEach((exp) => {
    if (exp.paidById === participantId) {
      const claimable = exp.subsidyAmount ? Math.max(0, exp.totalAmount - exp.subsidyAmount) : exp.totalAmount;
      totalFronted += claimable;
      items.push({
        type: 'paid_expense',
        title: `Fronted: ${exp.title}`,
        amount: claimable,
        formattedAmount: `+₹${claimable.toLocaleString('en-IN')}`,
        description: `You paid for the group (${exp.splitMethod} split rule).`,
        timestamp: exp.createdAt,
      });

      if (exp.subsidyAmount && exp.subsidyAmount > 0) {
        items.push({
          type: 'subsidy',
          title: `Organizer Subsidy Provided`,
          amount: 0,
          formattedAmount: `₹${exp.subsidyAmount.toLocaleString('en-IN')}`,
          description: `Self-covered subsidy for "${exp.title}" (not billed to group).`,
          timestamp: exp.createdAt,
        });
      }
    }
  });

  // 2. Expense Shares Allocated to Participant
  dynamicExpenses.forEach((exp) => {
    const userAlloc = (exp.allocations || []).find((a) => a.participantId === participantId);
    if (userAlloc && userAlloc.amountOwed > 0) {
      totalConsumed += userAlloc.amountOwed;
      const payer = participants.find((p) => p.id === exp.paidById)?.name || 'Organizer';
      items.push({
        type: 'owed_expense',
        title: `Share: ${exp.title}`,
        amount: -userAlloc.amountOwed,
        formattedAmount: `-₹${userAlloc.amountOwed.toLocaleString('en-IN')}`,
        description: `Your share of ${exp.title} (fronted by ${payer}).`,
        timestamp: exp.createdAt,
      });
    }
  });

  // 3. Refunds Credited
  refunds.forEach((ref) => {
    if (ref.refundedToPayerId === participantId) {
      totalRefundsNet -= ref.amount;
      items.push({
        type: 'received_refund',
        title: `Vendor Refund Received`,
        amount: -ref.amount,
        formattedAmount: `-₹${ref.amount.toLocaleString('en-IN')}`,
        description: `Vendor credit returned to your account: ${ref.reason || 'Booking cancellation'}.`,
        timestamp: ref.createdAt,
      });
    }
  });

  // 4. Peer-to-Peer Payments Sent & Received
  payments.forEach((pay) => {
    if (pay.status === 'disputed') return;
    if (pay.payerId === participantId) {
      totalP2PNet += pay.amount;
      const payeeName = participants.find((p) => p.id === pay.payeeId)?.name || 'Member';
      items.push({
        type: 'p2p_payment_sent',
        title: `UPI Payment Sent to ${payeeName}`,
        amount: pay.amount,
        formattedAmount: `+₹${pay.amount.toLocaleString('en-IN')}`,
        description: `You transferred ₹${pay.amount.toLocaleString('en-IN')} to ${payeeName}.`,
        timestamp: pay.createdAt,
      });
    } else if (pay.payeeId === participantId) {
      totalP2PNet -= pay.amount;
      const payerName = participants.find((p) => p.id === pay.payerId)?.name || 'Member';
      items.push({
        type: 'p2p_payment_received',
        title: `UPI Payment Received from ${payerName}`,
        amount: -pay.amount,
        formattedAmount: `-₹${pay.amount.toLocaleString('en-IN')}`,
        description: `${payerName} sent ₹${pay.amount.toLocaleString('en-IN')} to your UPI.`,
        timestamp: pay.createdAt,
      });
    }
  });

  const netBalance = Number(((totalFronted + totalP2PNet + totalRefundsNet) - totalConsumed).toFixed(2));
  let status: 'surplus' | 'deficit' | 'settled' = 'settled';
  if (netBalance > 0.01) status = 'surplus';
  else if (netBalance < -0.01) status = 'deficit';

  let summaryText = '';
  if (status === 'surplus') {
    summaryText = `You are owed ₹${netBalance.toLocaleString('en-IN')}. You fronted ₹${totalFronted.toLocaleString('en-IN')} in group expenses and have received ₹${Math.abs(totalP2PNet).toLocaleString('en-IN')} in reimbursements so far, while your consumed activity shares total ₹${totalConsumed.toLocaleString('en-IN')}.`;
  } else if (status === 'deficit') {
    summaryText = `You currently owe ₹${Math.abs(netBalance).toLocaleString('en-IN')}. Your share across group activities totals ₹${totalConsumed.toLocaleString('en-IN')}, and you have contributed/paid ₹${(totalFronted + totalP2PNet).toLocaleString('en-IN')} towards the trip.`;
  } else {
    summaryText = `You are completely settled up with the group! Your total contributions equal your total consumed activity shares (₹${totalConsumed.toLocaleString('en-IN')}).`;
  }

  return {
    participant,
    netBalance,
    status,
    items,
    totalFronted,
    totalConsumed,
    totalP2PNet,
    totalRefundsNet,
    summaryText,
  };
}

/**
 * Lodging / Room Allocation Optimizer (F10)
 * Bin-packing heuristic that maximizes room capacity utilization and minimizes supplement costs
 */
export interface RoomAssignment {
  roomName: string;
  tier: 'suite' | 'standard' | 'economy';
  capacity: number;
  assignedParticipants: Participant[];
}

export function optimizeRoomAllocations(
  participants: Participant[],
  availableRooms: Array<{ name: string; tier: 'suite' | 'standard' | 'economy'; capacity: number }>
): {
  assignments: RoomAssignment[];
  unassignedCount: number;
  efficiencyScore: number;
} {
  const active = participants.filter((p) => p.status === 'active');
  const assignments: RoomAssignment[] = availableRooms.map((r) => ({
    roomName: r.name,
    tier: r.tier,
    capacity: r.capacity,
    assignedParticipants: [],
  }));

  const remainingParticipants = [...active];

  // Pass 1: Match preferred tier
  assignments.forEach((room) => {
    const tierMatches = remainingParticipants.filter((p) => p.roomTier === room.tier);
    while (room.assignedParticipants.length < room.capacity && tierMatches.length > 0) {
      const match = tierMatches.shift()!;
      room.assignedParticipants.push(match);
      const idx = remainingParticipants.findIndex((p) => p.id === match.id);
      if (idx !== -1) remainingParticipants.splice(idx, 1);
    }
  });

  // Pass 2: Fill remaining capacity
  assignments.forEach((room) => {
    while (room.assignedParticipants.length < room.capacity && remainingParticipants.length > 0) {
      const traveler = remainingParticipants.shift()!;
      room.assignedParticipants.push(traveler);
    }
  });

  const totalCapacity = availableRooms.reduce((sum, r) => sum + r.capacity, 0);
  const totalAssigned = assignments.reduce((sum, r) => sum + r.assignedParticipants.length, 0);
  const efficiencyScore = totalCapacity > 0 ? Math.round((totalAssigned / totalCapacity) * 100) : 100;

  return {
    assignments,
    unassignedCount: remainingParticipants.length,
    efficiencyScore,
  };
}

/**
 * Pre-Commit Duplicate Expense Guard (F16)
 * Synchronous pre-commit similarity check preventing duplicate billing
 */
export interface DuplicateMatch {
  existingExpense: Expense;
  similarityScore: number;
  reason: string;
}

export function checkDuplicateExpense(
  candidate: {
    totalAmount: number;
    title: string;
    category: BookingCategory;
    paidById: string;
    bookingId?: string;
  },
  existingExpenses: Expense[],
  tolerancePercent: number = 3
): DuplicateMatch | null {
  for (const exp of existingExpenses) {
    if (exp.isDuplicateAcknowledged) continue;

    // Check amount proximity
    const diff = Math.abs(exp.totalAmount - candidate.totalAmount);
    const maxAllowed = candidate.totalAmount * (tolerancePercent / 100);
    const isAmountClose = diff <= maxAllowed || diff <= 10;

    // Check title/vendor similarity
    const titleA = candidate.title.toLowerCase().trim();
    const titleB = exp.title.toLowerCase().trim();
    const isTitleMatch = titleA === titleB || titleA.includes(titleB) || titleB.includes(titleA);

    // Check booking link match
    const isSameBooking = candidate.bookingId && exp.bookingId && candidate.bookingId === exp.bookingId;

    if (isAmountClose && (isTitleMatch || isSameBooking)) {
      const similarity = isTitleMatch && isAmountClose ? 0.95 : 0.75;
      return {
        existingExpense: exp,
        similarityScore: similarity,
        reason: `Existing expense "${exp.title}" on ${new Date(exp.createdAt).toLocaleDateString()} has identical amount (₹${exp.totalAmount}) and matching title.`,
      };
    }
  }

  return null;
}

/**
 * Split-Method Recommendation Advisor (F17)
 * Contextual recommendation engine suggesting the fairest split strategy
 */
export function suggestSplitMethod(
  category: BookingCategory,
  participants: Participant[],
  booking?: Booking
): {
  method: SplitMethod;
  reason: string;
  confidence: number;
} {
  // Rule 1: Lodging with room tiers or uneven room allocation
  if (category === 'lodging' || (booking && booking.category === 'lodging')) {
    const hasDifferentTiers = participants.some((p) => p.roomTier && p.roomTier !== 'standard');
    if (hasDifferentTiers) {
      return {
        method: 'room_tier',
        reason: 'Recommended Room-Tier Split: Travelers have configured room tiers (Suite 1.4x / Standard 1.0x / Economy 0.8x) for fair occupancy weighting.',
        confidence: 0.95,
      };
    }
    return {
      method: 'weighted',
      reason: 'Recommended Weighted (Per-Night) Split: Lodging stays can be weighted by nights stayed per person.',
      confidence: 0.9,
    };
  }

  // Rule 2: Booking with restricted participant subset
  const bPids = booking?.participantIds || [];
  if (booking && bPids.length > 0 && bPids.length < participants.length) {
    return {
      method: 'equal',
      reason: `Scoped Activity: Cost will automatically be divided only among the ${bPids.length} travelers participating in "${booking.title}".`,
      confidence: 0.92,
    };
  }

  // Rule 3: Food & Dining
  if (category === 'food') {
    return {
      method: 'line_item',
      reason: 'Recommended Line-Item Split: Food & bar bills often have individual item shares or alcohol exclusions.',
      confidence: 0.88,
    };
  }

  // Default Fallback
  return {
    method: 'equal',
    reason: 'Equal Split: Standard uniform sharing across all active trip participants.',
    confidence: 0.8,
  };
}

/**
 * Itinerary Feasibility Checker (F22 — Logistics, Not Money)
 * Scans itinerary bookings for non-financial logistical conflicts
 */
export function checkItineraryFeasibility(
  trip: Trip,
  bookings: Booking[],
  participants: Participant[]
): ItineraryConflict[] {
  const conflicts: ItineraryConflict[] = [];
  const tripId = trip.id;
  const now = new Date().toISOString();

  // 1. Check for overlapping transit bookings
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      const b1 = bookings[i];
      const b2 = bookings[j];
      if (b1.status === 'cancelled' || b2.status === 'cancelled') continue;

      const t1Start = new Date(b1.startTime).getTime();
      const t1End = new Date(b1.endTime).getTime();
      const t2Start = new Date(b2.startTime).getTime();
      const t2End = new Date(b2.endTime).getTime();

      const overlaps = t1Start < t2End && t2Start < t1End;
      if (overlaps) {
        const p1 = b1.participantIds || [];
        const p2 = b2.participantIds || [];
        const shared = p1.filter((id) => p2.includes(id));
        if (shared.length > 0 && (b1.category === 'transport' || b2.category === 'transport')) {
          conflicts.push({
            id: `conflict-transit-${b1.id}-${b2.id}`,
            tripId,
            type: 'TRANSIT_OVERLAP',
            severity: 'high',
            title: `Transit Schedule Clash: "${b1.title}" & "${b2.title}"`,
            description: `Travelers cannot be in two locations during overlapping transit windows (${b1.vendor} & ${b2.vendor}).`,
            bookingIds: [b1.id, b2.id],
            createdAt: now,
          });
        }
      }
    }
  }

  // 2. Check for lodging checkout after departure
  const lodgings = bookings.filter((b) => b.category === 'lodging' && b.status !== 'cancelled');
  const transports = bookings.filter((b) => b.category === 'transport' && b.status !== 'cancelled');

  lodgings.forEach((lodging) => {
    const checkoutTime = new Date(lodging.endTime).getTime();
    transports.forEach((transit) => {
      const departureTime = new Date(transit.startTime).getTime();
      // If departure is earlier than checkout for shared travelers
      if (departureTime < checkoutTime) {
        const lPids = lodging.participantIds || [];
        const tPids = transit.participantIds || [];
        const shared = lPids.filter((id) => tPids.includes(id));
        if (shared.length > 0 && departureTime > new Date(lodging.startTime).getTime()) {
          conflicts.push({
            id: `conflict-checkout-${lodging.id}-${transit.id}`,
            tripId,
            type: 'CHECKOUT_START_MISMATCH',
            severity: 'medium',
            title: `Checkout Logistics Gap: "${lodging.title}" vs "${transit.title}"`,
            description: `Departure for "${transit.title}" is scheduled prior to lodging checkout time. Check key drop arrangements.`,
            bookingIds: [lodging.id, transit.id],
            createdAt: now,
          });
        }
      }
    });
  });

  return conflicts;
}

/**
 * Natural Language / Chat-Native Expense Parser (F14 & F15)
 * Extracts structured expense fields from plain chat text or voice transcription
 */
export function parseNaturalChatExpense(
  chatText: string,
  participants: Participant[],
  defaultCategory: BookingCategory = 'activity'
): ParsedChatExpense {
  const text = chatText.trim();

  // 1. Amount Extraction (handles ₹1200, 1200rs, 1200, 12k, 12.5k)
  let totalAmount = 0;
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    totalAmount = parseFloat(kMatch[1]) * 1000;
  } else {
    const numMatch = text.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i);
    if (numMatch) {
      totalAmount = parseFloat(numMatch[1].replace(/,/g, ''));
    }
  }

  // 2. Category & Vendor Inference
  let category: BookingCategory = defaultCategory;
  const lower = text.toLowerCase();
  if (lower.includes('cab') || lower.includes('taxi') || lower.includes('uber') || lower.includes('flight') || lower.includes('train') || lower.includes('ferry') || lower.includes('petrol')) {
    category = 'transport';
  } else if (lower.includes('dinner') || lower.includes('lunch') || lower.includes('breakfast') || lower.includes('food') || lower.includes('bar') || lower.includes('cafe') || lower.includes('drinks')) {
    category = 'food';
  } else if (lower.includes('hotel') || lower.includes('resort') || lower.includes('villa') || lower.includes('room') || lower.includes('airbnb') || lower.includes('stay')) {
    category = 'lodging';
  }

  // 3. Participant Matching
  const detectedParticipantIds: string[] = [];
  participants.forEach((p) => {
    const firstName = p.name.split(' ')[0].toLowerCase();
    if (lower.includes(firstName)) {
      detectedParticipantIds.push(p.id);
    }
  });

  // If no specific participants mentioned, default to all active
  const finalParticipants = detectedParticipantIds.length > 0
    ? detectedParticipantIds
    : participants.filter((p) => p.status === 'active').map((p) => p.id);

  // 4. Clean Title Formulation
  let title = text.replace(/(\d+(?:\.\d+)?)\s*k\b/gi, '').replace(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/gi, '').trim();
  title = title.replace(/^(i paid for|paid for|for|just me|me and|split)/gi, '').trim();
  if (!title || title.length < 3) {
    title = category === 'transport' ? 'Cab / Transit Fare' : category === 'food' ? 'Group Dining' : 'Shared Activity';
  }
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return {
    title,
    totalAmount: totalAmount > 0 ? totalAmount : 1000,
    detectedParticipantIds: finalParticipants,
    suggestedSplitMethod: detectedParticipantIds.length > 0 && detectedParticipantIds.length < participants.length ? 'equal' : 'equal',
    confidence: totalAmount > 0 && detectedParticipantIds.length > 0 ? 0.9 : 0.65,
    rawText: chatText,
    category,
  };
}

/**
 * Cross-Trip Squad Netting Engine (F21)
 * Consolidates balances across multiple trips for the same squad into a single minimal debt matrix
 */
export interface CrossTripSettlementResult {
  aggregatedBalances: Array<{
    participantId: string;
    participantName: string;
    netBalance: number;
    status: 'surplus' | 'deficit' | 'settled';
    tripCount: number;
  }>;
  simplifiedDebts: SimplifiedDebt[];
  totalConsolidatedVolume: number;
}

export function netCrossTripSquadBalances(
  squad: Squad,
  trips: Trip[],
  participantsMap: Record<string, Participant[]>,
  expensesMap: Record<string, Expense[]>,
  paymentsMap: Record<string, Payment[]>,
  refundsMap: Record<string, RefundEvent[]>,
  bookingsMap: Record<string, Booking[]>
): CrossTripSettlementResult {
  const memberNetMap: Record<string, { name: string; totalNet: number; tripCount: number; participant: Participant }> = {};

  squad.members.forEach((m) => {
    memberNetMap[m.email] = { name: m.name, totalNet: 0, tripCount: 0, participant: {} as Participant };
  });

  trips.forEach((t) => {
    const parts = participantsMap[t.id] || [];
    const exps = expensesMap[t.id] || [];
    const pays = paymentsMap[t.id] || [];
    const refs = refundsMap[t.id] || [];
    const bks = bookingsMap[t.id] || [];

    const balances = computeNetBalances(parts.filter((p) => p.status === 'active'), exps, pays, refs, bks);

    balances.forEach((b) => {
      const email = b.participant.email;
      if (memberNetMap[email]) {
        memberNetMap[email].totalNet += b.netBalance;
        memberNetMap[email].tripCount += 1;
        memberNetMap[email].participant = b.participant;
      }
    });
  });

  const consolidatedBalances: ParticipantNetBalance[] = Object.entries(memberNetMap).map(([email, data], idx) => {
    const net = Number(data.totalNet.toFixed(2));
    let status: 'surplus' | 'deficit' | 'settled' = 'settled';
    if (net > 0.01) status = 'surplus';
    else if (net < -0.01) status = 'deficit';

    const p: Participant = data.participant.id
      ? data.participant
      : {
          id: `sq-part-${idx}`,
          tripId: trips[0]?.id || 'trip-1',
          name: data.name,
          email,
          avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
          isOrganizer: idx === 0,
          status: 'active',
          upiId: squad.members.find((m) => m.email === email)?.upiId || 'member@upi',
        };

    return {
      participant: p,
      totalPaid: net > 0 ? net : 0,
      totalOwed: net < 0 ? Math.abs(net) : 0,
      netBalance: net,
      status,
    };
  });

  const simplified = simplifyDebts(consolidatedBalances);
  const totalVolume = consolidatedBalances.reduce((acc, b) => acc + (b.netBalance > 0 ? b.netBalance : 0), 0);

  const aggregatedBalances = Object.entries(memberNetMap).map(([email, data], idx) => {
    const net = Number(data.totalNet.toFixed(2));
    return {
      participantId: data.participant.id || `sq-part-${idx}`,
      participantName: data.name,
      netBalance: net,
      status: (net > 0.01 ? 'surplus' : net < -0.01 ? 'deficit' : 'settled') as 'surplus' | 'deficit' | 'settled',
      tripCount: data.tripCount,
    };
  });

  return {
    aggregatedBalances,
    simplifiedDebts: simplified,
    totalConsolidatedVolume: Number(totalVolume.toFixed(2)),
  };
}

/**
 * Structured Accounting Export Adapter (F23)
 * Produces RFC 4180 compliant CSV format for corporate expense reimbursement & accounting handoff
 */
export function generateAccountingExportCSV(
  trip: Trip,
  participants: Participant[],
  expenses: Expense[],
  bookings: Booking[]
): string {
  const headers = [
    'Expense Date',
    'Expense ID',
    'Category',
    'Title',
    'Vendor Name',
    'Gross Amount (INR)',
    'Organizer Subsidy (INR)',
    'Claimable Net (INR)',
    'Paid By Name',
    'Paid By UPI',
    'Split Strategy',
    'Participant Allocations Breakdown',
    'Receipt Verified',
    'Receipt Reference URL',
  ];

  const rows: string[] = [headers.map((h) => `"${h}"`).join(',')];

  expenses.forEach((e) => {
    const payer = participants.find((p) => p.id === e.paidById);
    const linkedBooking = bookings.find((b) => b.id === e.bookingId);
    const subsidy = e.subsidyAmount || 0;
    const claimable = Math.max(0, e.totalAmount - subsidy);

    const allocBreakdown = (e.allocations || [])
      .map((a) => {
        const pName = participants.find((part) => part.id === a.participantId)?.name || 'Member';
        return `${pName}: Rs.${(a.amountOwed || 0).toFixed(2)}`;
      })
      .join('; ');

    const dateStr = new Date(e.createdAt).toISOString().split('T')[0];

    const values = [
      dateStr,
      e.id,
      e.category.toUpperCase(),
      e.title.replace(/"/g, '""'),
      linkedBooking?.vendor || 'External / Merchant',
      e.totalAmount.toFixed(2),
      subsidy.toFixed(2),
      claimable.toFixed(2),
      payer?.name || 'Organizer',
      payer?.upiId || 'N/A',
      e.splitMethod.toUpperCase(),
      allocBreakdown.replace(/"/g, '""'),
      e.receiptUrl ? 'YES' : 'NO',
      e.receiptUrl || 'None',
    ];

    rows.push(values.map((v) => `"${v}"`).join(','));
  });

  return rows.join('\r\n');
}


