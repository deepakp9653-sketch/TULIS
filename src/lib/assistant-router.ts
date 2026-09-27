/**
 * F-M1: Unified AI Companion ("Gogo, Everywhere") Intent Router
 *
 * Dispatches natural language user queries across specialized backends:
 * - PLANNING: Trip itinerary generation, activities, weather, rebooking
 * - EXPENSE: Natural language expense logging, bill parsing, dynamic splits
 * - EXPLAIN: Zero-sum balance & fairness invariant mathematical proofs
 * - SAFETY: Emergency assistance, nearest hospitals, check-in, safety briefs
 * - GENERAL: Conversational squad coordination, travel advice, packing tips
 */

import { Trip, Participant, Expense, Booking, SimplifiedDebt, ParticipantNetBalance } from './types';
import { explainLedgerValue } from './ledger-engine';

export type AssistantIntent = 'PLANNING' | 'EXPENSE' | 'EXPLAIN' | 'SAFETY' | 'GENERAL';

export interface AssistantRouteResult {
  intent: AssistantIntent;
  confidence: number;
  replyText: string;
  actionPayload?: {
    type: 'PLAN_PREVIEW' | 'EXPENSE_DRAFT' | 'SETTLEMENT_EXPLANATION' | 'SAFETY_ALERT' | 'NAVIGATION';
    data: any;
  };
  suggestedFollowUps?: string[];
}

export function classifyIntent(query: string): { intent: AssistantIntent; confidence: number } {
  const q = query.toLowerCase().trim();

  // 1. Safety Intent
  if (
    q.includes('hospital') ||
    q.includes('emergency') ||
    q.includes('police') ||
    q.includes('sos') ||
    q.includes('doctor') ||
    q.includes('danger') ||
    q.includes('safe') ||
    q.includes('clinic') ||
    q.includes('ambulance') ||
    q.includes('check in') ||
    q.includes('check-in')
  ) {
    return { intent: 'SAFETY', confidence: 0.95 };
  }

  // 2. Explain & Settlement Invariant Intent
  if (
    q.includes('why do i owe') ||
    q.includes('explain balance') ||
    q.includes('who owes who') ||
    q.includes('settlement') ||
    q.includes('breakdown of my') ||
    q.includes('is it fair') ||
    q.includes('discrepancy') ||
    q.includes('reconciliation') ||
    q.includes('how much do i owe') ||
    q.includes('how much am i owed')
  ) {
    return { intent: 'EXPLAIN', confidence: 0.92 };
  }

  // 3. Expense Logging & Splitting Intent
  if (
    (q.includes('paid') || q.includes('spent') || q.includes('bought') || q.includes('cost') || q.includes('rs') || q.includes('₹') || q.includes('split') || q.includes('bill') || q.includes('lunch') || q.includes('dinner') || q.includes('cab') || q.includes('uber') || q.includes('auto') || q.includes('receipt')) &&
    (/\d+/.test(q) || q.includes('add') || q.includes('log') || q.includes('split'))
  ) {
    return { intent: 'EXPENSE', confidence: 0.94 };
  }

  // 4. Planning & Itinerary Intent
  if (
    q.includes('plan') ||
    q.includes('itinerary') ||
    q.includes('gogo') ||
    q.includes('schedule') ||
    q.includes('weather') ||
    q.includes('forecast') ||
    q.includes('things to do') ||
    q.includes('recommend') ||
    q.includes('visit') ||
    q.includes('places') ||
    q.includes('sightseeing') ||
    q.includes('cancel') ||
    q.includes('rebook') ||
    q.includes('day 1') ||
    q.includes('day 2') ||
    q.includes('day 3')
  ) {
    return { intent: 'PLANNING', confidence: 0.91 };
  }

  return { intent: 'GENERAL', confidence: 0.85 };
}

export async function routeAssistantMessage({
  message,
  trip,
  participants,
  expenses = [],
  bookings = [],
  netBalances = [],
  simplifiedDebts = [],
  currentUser,
}: {
  message: string;
  trip: Trip;
  participants: Participant[];
  expenses?: Expense[];
  bookings?: Booking[];
  netBalances?: ParticipantNetBalance[];
  simplifiedDebts?: SimplifiedDebt[];
  currentUser?: any;
}): Promise<AssistantRouteResult> {
  const { intent, confidence } = classifyIntent(message);

  // 1. SAFETY DISPATCH
  if (intent === 'SAFETY') {
    const destination = trip.destination || 'your destination';
    const primaryContact = participants.find((p) => p.isOrganizer) || participants[0];

    return {
      intent: 'SAFETY',
      confidence,
      replyText: `🚨 **Safety & Emergency Protocol Active for ${destination}**\n\n• **Squad Lead / Emergency POC:** ${primaryContact?.name || 'Organizer'} (${primaryContact?.email || 'N/A'})\n• **Emergency Medical:** National Emergency Helpline dial **112** (India) or tap Emergency SOS below.\n• **Nearest Care:** Verified emergency medical care and hospital locator are pinned to your safety dashboard.`,
      actionPayload: {
        type: 'SAFETY_ALERT',
        data: {
          destination,
          contactName: primaryContact?.name,
          nationalEmergency: '112',
          tripId: trip.id,
        },
      },
      suggestedFollowUps: [
        'Send Passive Check-In to Squad',
        'Trigger Safety Mode Beacon',
        'Show Hospital Directory',
      ],
    };
  }

  // 2. EXPLAIN / SETTLEMENT DISPATCH
  if (intent === 'EXPLAIN') {
    const currentPart = participants.find(
      (p) => p.id === currentUser?.id || p.email === currentUser?.email
    ) || participants[0];

    const myBalance = netBalances.find((b) => b.participant.id === currentPart?.id);
    const balanceVal = myBalance ? myBalance.netBalance : 0;

    const myDebtsToPay = simplifiedDebts.filter((d) => d.fromId === currentPart?.id);
    const myDebtsToReceive = simplifiedDebts.filter((d) => d.toId === currentPart?.id);

    let explanationSummary = '';
    if (balanceVal > 0) {
      explanationSummary = `You are currently owed **₹${balanceVal.toFixed(2)}** in net reimbursement across squad expenses.`;
    } else if (balanceVal < 0) {
      explanationSummary = `You currently owe a net deficit of **₹${Math.abs(balanceVal).toFixed(2)}** to reconcile the group ledger.`;
    } else {
      explanationSummary = `Your ledger is **fully settled (₹0.00)**. All expenses and shares are in balance!`;
    }

    if (myDebtsToPay.length > 0) {
      explanationSummary += `\n\n**Optimal UPI Settlement Paths (N-1 Invariant):**\n` +
        myDebtsToPay.map((d) => `• Pay **${d.toName}**: ₹${d.amount.toFixed(2)} (${d.payeeUpiId || 'UPI'})`).join('\n');
    }

    return {
      intent: 'EXPLAIN',
      confidence,
      replyText: `⚖️ **Ledger Explanation & Net Balance Verification**\n\n${explanationSummary}`,
      actionPayload: {
        type: 'SETTLEMENT_EXPLANATION',
        data: {
          participantId: currentPart?.id,
          netBalance: balanceVal,
          debtsToPay: myDebtsToPay,
          debtsToReceive: myDebtsToReceive,
        },
      },
      suggestedFollowUps: [
        'How was this calculated?',
        'Export Settlement PDF',
        'View Zero-Sum Trust Badge',
      ],
    };
  }

  // 3. EXPENSE LOGGING DISPATCH
  if (intent === 'EXPENSE') {
    // Attempt fast heuristic regex extraction
    const amountMatch = message.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)/i);
    const parsedAmount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 500;

    let guessedCategory = 'food';
    const lower = message.toLowerCase();
    if (lower.includes('cab') || lower.includes('uber') || lower.includes('flight') || lower.includes('train') || lower.includes('auto')) {
      guessedCategory = 'transport';
    } else if (lower.includes('hotel') || lower.includes('resort') || lower.includes('stay') || lower.includes('room')) {
      guessedCategory = 'lodging';
    } else if (lower.includes('ticket') || lower.includes('entry') || lower.includes('tour') || lower.includes('safari')) {
      guessedCategory = 'activity';
    }

    const currentPart = participants.find(
      (p) => p.id === currentUser?.id || p.email === currentUser?.email
    ) || participants[0];

    const draftExpense = {
      title: message.replace(/(?:log|add|spent|paid|split|\d+|rs|inr|₹)/gi, '').trim() || `${guessedCategory.toUpperCase()} Expense`,
      amount: parsedAmount,
      currency: trip.baseCurrency || 'INR',
      category: guessedCategory,
      paidById: currentPart?.id,
      splitMethod: 'equal',
    };

    return {
      intent: 'EXPENSE',
      confidence,
      replyText: `🧾 **Expense Parsed & Ready to Log**\n\n• **Title:** ${draftExpense.title}\n• **Total:** ₹${draftExpense.amount.toFixed(2)}\n• **Category:** ${draftExpense.category}\n• **Payer:** ${currentPart?.name || 'You'}\n• **Split:** Equal across ${participants.length} squad members (₹${(draftExpense.amount / Math.max(1, participants.length)).toFixed(2)} / person)`,
      actionPayload: {
        type: 'EXPENSE_DRAFT',
        data: draftExpense,
      },
      suggestedFollowUps: [
        'Confirm & Add to Ledger',
        'Custom Split Percentage',
        'Upload Receipt Proof',
      ],
    };
  }

  // 4. PLANNING DISPATCH
  if (intent === 'PLANNING') {
    return {
      intent: 'PLANNING',
      confidence,
      replyText: `🗺️ **Gogo Itinerary Planner for ${trip.destination}**\n\nI can build, optimize, or rebook your day-by-day plan taking into account live weather, budget ceilings (₹${trip.budgetCeiling?.toLocaleString('en-IN') || 'Flexible'}), and rooming assignments.`,
      actionPayload: {
        type: 'PLAN_PREVIEW',
        data: {
          tripId: trip.id,
          destination: trip.destination,
          dates: `${trip.startDate} to ${trip.endDate}`,
        },
      },
      suggestedFollowUps: [
        `Generate 3-day itinerary for ${trip.destination}`,
        'Check 7-day weather forecast',
        'Suggest indoor rainy-day alternatives',
      ],
    };
  }

  // 5. GENERAL DISPATCH (Calls LLM /api/chat or fallback response)
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        tripId: trip.id,
        currentUserId: currentUser?.id,
        context: {
          destination: trip.destination,
          participantCount: participants.length,
          totalExpenses: expenses.reduce((s, e) => s + e.totalAmount, 0),
          budgetCeiling: trip.budgetCeiling,
        },
      }),
    });
    const data = await res.json();
    if (data.reply) {
      return {
        intent: 'GENERAL',
        confidence,
        replyText: data.reply,
        suggestedFollowUps: [
          'What is our remaining budget?',
          'Who owes the most right now?',
          'Plan activities for tomorrow',
        ],
      };
    }
  } catch {
    // Fallback if network offline
  }

  return {
    intent: 'GENERAL',
    confidence: 0.8,
    replyText: `I'm Gogo, your unified companion for **${trip.title}**. You can ask me to plan activities, log shared expenses, explain ledger balances, or check emergency safety protocols!`,
    suggestedFollowUps: [
      'How much do I owe right now?',
      'Log an expense of ₹1,500 for dinner',
      'Check emergency hospitals nearby',
    ],
  };
}
