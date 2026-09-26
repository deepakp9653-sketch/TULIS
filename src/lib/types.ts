// Tulis Core Domain Types

export type SplitMethod = 'equal' | 'weighted' | 'line_item' | 'room_tier' | 'organizer_subsidy' | 'manual';

export type BookingCategory = 'transport' | 'lodging' | 'activity' | 'food' | 'other' | 'general';

export type TabType =
  | 'overview'
  | 'plan-ledger'
  | 'squad-settlements'
  | 'chat'
  | 'activity'
  | 'expenses'
  | 'itinerary'
  | 'participants'
  | 'settlement'
  | 'corporate';

export type EventType =
  | 'TRIP_CREATED'
  | 'PARTICIPANT_ADDED'
  | 'PARTICIPANT_REMOVED'
  | 'BOOKING_CREATED'
  | 'BOOKING_MODIFIED'
  | 'BOOKING_CANCELLED'
  | 'EXPENSE_LOGGED'
  | 'EXPENSE_CORRECTED'
  | 'REFUND_CREDITED'
  | 'PAYMENT_RECORDED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_DISPUTED'
  | 'ALLOCATION_DISPUTED'
  | 'ALLOCATION_DISPUTE_RESOLVED'
  | 'ANOMALY_FLAGGED'
  | 'ANOMALY_DISMISSED'
  | 'BUDGET_CEILING_SET'
  | 'VARIANCE_THRESHOLD_BREACHED'
  | 'SETTLEMENT_SIMPLIFIED'
  | 'SETTLEMENT_CONFIRMED'
  | 'USER_LOGGED_IN'
  | 'UPI_SETUP_UPDATED'
  | 'TRIP_JOINED_VIA_CODE'
  | 'SQUAD_CREATED'
  | 'SQUAD_MEMBER_LINKED'
  | 'DEBT_REASSIGNED'
  | 'DEBT_REASSIGNMENT_ACCEPTED'
  | 'DEBT_REASSIGNMENT_REJECTED'
  | 'REMINDER_SENT'
  | 'ITINERARY_CONFLICT_FLAGGED'
  | 'ITINERARY_CONFLICT_DISMISSED'
  | 'OFFLINE_COMMAND_SYNCED'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_DECIDED';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  baseCurrency: string; // Default 'INR'
  startDate: string;
  endDate: string;
  budgetCeiling: number;
  inviteCode: string; // Unique 6-character code (e.g. "GOA2026")
  organizerId: string; // Participant ID of Creator
  createdAt: string;
  categoryBudgets?: Record<string, number>;
  organizationId?: string;
  safetyModeEnabled?: boolean; // Human safety shield & Emergency SOS toggle
}

export interface Participant {
  id: string;
  tripId: string;
  name: string;
  email: string;
  avatarUrl: string;
  isOrganizer: boolean;
  status: 'active' | 'removed';
  upiId?: string; // UPI VPA
  qrCodeUrl?: string; // Custom uploaded UPI QR code image URL or base64
  passwordHash?: string;
  isLoggedIn?: boolean;
  weight?: number;
  roomTier?: 'suite' | 'standard' | 'economy';
}

export interface Vendor {
  id: string;
  tripId: string;
  name: string;
  category: BookingCategory;
  contactPhone?: string;
  email?: string;
  website?: string;
  rating?: number;
  totalBookingsCount?: number;
  totalSpent?: number;
}

export type RefundPolicy = 'full' | 'partial' | 'per_head' | 'non_refundable';

export interface RefundEvent {
  id: string;
  tripId: string;
  bookingId?: string;
  expenseId?: string;
  amount: number;
  currency: string;
  refundedToPayerId: string; // Participant who originally paid or receives credit
  policy: RefundPolicy;
  reason?: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  tripId: string;
  category: BookingCategory;
  title: string;
  vendor: string;
  vendorId?: string;
  startTime: string;
  endTime: string;
  estimatedCost: number;
  actualCost: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  participantIds: string[];
  refundPolicy?: RefundPolicy;
  cancellationReason?: string;
  refundAmount?: number;
  roomCapacity?: number;
}

export interface ExpenseAllocation {
  participantId: string;
  amountOwed: number;
  note?: string;
  disputeStatus?: 'none' | 'active' | 'resolved';
  disputeReason?: string;
  disputeResolution?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  bookingId?: string;
  title: string;
  totalAmount: number;
  currency: string;
  splitMethod: SplitMethod;
  paidById: string;
  paidBySplits?: { participantId: string; amount: number }[];
  category: BookingCategory;
  createdAt: string;
  allocations: ExpenseAllocation[];
  subsidyAmount?: number;
  receiptUrl?: string;
  receiptName?: string;
  hasActiveDisputes?: boolean;
  isDuplicateAcknowledged?: boolean;
  chatSourceRaw?: string;
  receiptConfidence?: number;
  costCenter?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

export interface Payment {
  id: string;
  tripId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  note?: string;
  createdAt: string;
  status?: 'pending' | 'confirmed' | 'disputed';
}

export interface LedgerEvent {
  id: string;
  tripId: string;
  eventType: EventType;
  actorId: string;
  actorName: string;
  timestamp: string;
  description: string;
  payload: Record<string, any>;
  sequenceNum: number;
}

export interface SimplifiedDebt {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
  status: 'proposed' | 'settled';
  payeeUpiId?: string;
  payeeQrCodeUrl?: string;
  paymentId?: string;
  isPendingVerification?: boolean;
}

export interface ParticipantNetBalance {
  participant: Participant;
  totalPaid: number;
  totalOwed: number;
  netBalance: number;
  status: 'surplus' | 'deficit' | 'settled';
}

export interface ReconciliationAudit {
  totalExpenses: number;
  totalRefunds: number;
  totalSubsidies: number;
  netIncurred: number;
  totalPaidByParticipants: number;
  totalAllocatedOwed: number;
  netBalanceSum: number;
  isReconciled: boolean;
  discrepancy: number;
}

export type AnomalySeverity = 'high' | 'medium' | 'low';

export interface Anomaly {
  id: string;
  tripId: string;
  type: 'SCHEDULE_CONFLICT' | 'ROOM_OVERCAPACITY' | 'BUDGET_VARIANCE' | 'ROSTER_MISMATCH' | 'ALLOCATION_MISMATCH';
  severity: AnomalySeverity;
  title: string;
  description: string;
  affectedEntityIds: string[];
  createdAt: string;
  dismissed?: boolean;
}

export interface SquadMember {
  name: string;
  email: string;
  upiId: string;
  roomTier?: 'suite' | 'standard' | 'economy';
}

export interface Squad {
  id: string;
  name: string;
  description?: string;
  members: SquadMember[];
  createdAt: string;
}

export interface DryRunDelta {
  participantId: string;
  participantName: string;
  currentNet: number;
  projectedNet: number;
  delta: number;
}

export interface DryRunResult {
  actionType: string;
  description: string;
  deltas: DryRunDelta[];
  projectedAudit: ReconciliationAudit;
  newSimplifiedDebts: SimplifiedDebt[];
}

export interface DebtReassignment {
  id: string;
  tripId: string;
  allocationId?: string;
  originalDebtorId: string;
  newDebtorId: string;
  creditorId: string;
  amount: number;
  reason?: string;
  status: 'proposed' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ItineraryConflict {
  id: string;
  tripId: string;
  type: 'TRANSIT_OVERLAP' | 'CHECKOUT_START_MISMATCH' | 'HOURS_BREACH';
  severity: 'high' | 'medium';
  title: string;
  description: string;
  bookingIds: string[];
  createdAt: string;
  dismissed?: boolean;
}

export interface OfflineCommand {
  id: string;
  tripId: string;
  type: 'LOG_EXPENSE' | 'RECORD_PAYMENT';
  payload: any;
  clientTimestamp: string;
  status: 'queued' | 'syncing' | 'synced';
}

export interface ParsedChatExpense {
  title: string;
  totalAmount: number;
  detectedParticipantIds: string[];
  suggestedSplitMethod: SplitMethod;
  confidence: number;
  rawText: string;
  payerId?: string;
  category: BookingCategory;
  receiptUrl?: string;
}



