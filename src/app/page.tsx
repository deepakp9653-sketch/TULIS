'use client';

import React, { useState, useEffect } from 'react';
import {
  INITIAL_TRIP,
  INITIAL_PARTICIPANTS,
  INITIAL_BOOKINGS,
  INITIAL_EXPENSES,
  INITIAL_PAYMENTS,
  INITIAL_EVENTS,
  INITIAL_VENDORS,
  INITIAL_REFUNDS,
} from '@/lib/mock-data';
import {
  Trip,
  Participant,
  Booking,
  Expense,
  ExpenseAllocation,
  Payment,
  LedgerEvent,
  SplitMethod,
  BookingCategory,
  Vendor,
  RefundEvent,
  RefundPolicy,
  Anomaly,
  Squad,
  OfflineCommand,
  ParsedChatExpense,
  TabType,
} from '@/lib/types';
import {
  computeNetBalances,
  simplifyDebts,
  calculateSplits,
  processBookingCancellation,
  detectAnomalies,
  computeReconciliationAudit,
  checkDuplicateExpense,
  netCrossTripSquadBalances,
} from '@/lib/ledger-engine';
import { DashboardShell } from '@/components/DashboardShell';
import { OverviewSection } from '@/components/OverviewSection';
import { ItineraryGraph } from '@/components/ItineraryGraph';
import { ParticipantsSection } from '@/components/ParticipantsSection';
import { ExpensesSection } from '@/components/ExpensesSection';
import { PlanAndLedgerView } from '@/components/PlanAndLedgerView';
import { SquadAndSettlementsView } from '@/components/SquadAndSettlementsView';
import { DynamicSplitDrawer } from '@/components/DynamicSplitDrawer';
import { SettlementVisualizer } from '@/components/SettlementVisualizer';
import { ActivityLogSection } from '@/components/ActivityLogSection';
import { AddBookingModal } from '@/components/AddBookingModal';
import { CancelBookingModal } from '@/components/CancelBookingModal';
import { EditBookingModal } from '@/components/EditBookingModal';
import { VendorSummaryModal } from '@/components/VendorSummaryModal';
import { LandingPage } from '@/components/LandingPage';
import { LiquidLogo } from '@/components/LiquidLogo';
import { CreateTripModal } from '@/components/CreateTripModal';
import { JoinTripModal } from '@/components/JoinTripModal';
import { TripSwitcherModal } from '@/components/TripSwitcherModal';
import { AuthModal } from '@/components/AuthModal';
import { MyTripsModal } from '@/components/MyTripsModal';
import { TripAccessGateModal } from '@/components/TripAccessGateModal';
import { AuthSessionUser } from '@/lib/auth-service';
import { UpiSetupModal } from '@/components/UpiSetupModal';
import { ChaosDemoModal } from '@/components/ChaosDemoModal';
import { WhatIfSimulatorModal } from '@/components/WhatIfSimulatorModal';
import { ExplainBalanceModal } from '@/components/ExplainBalanceModal';
import { RoomOptimizerModal } from '@/components/RoomOptimizerModal';
import { SettlementReportModal } from '@/components/SettlementReportModal';
import { SquadManagerModal } from '@/components/SquadManagerModal';
import { ChatExpenseModal } from '@/components/ChatExpenseModal';
import { DuplicateExpenseWarningModal } from '@/components/DuplicateExpenseWarningModal';
import { NudgeReminderModal } from '@/components/NudgeReminderModal';
import { DebtReassignmentModal } from '@/components/DebtReassignmentModal';
import { OfflineQueueIndicator } from '@/components/OfflineQueueIndicator';
import { AccountSwitcherModal } from '@/components/AccountSwitcherModal';
import { ShareTripModal } from '@/components/ShareTripModal';
import { DashboardAccessModal } from '@/components/DashboardAccessModal';
import { ProfileCompletionModal } from '@/components/ProfileCompletionModal';
import { TripSelectionGatewayModal } from '@/components/TripSelectionGatewayModal';
import { DEMO_USERS } from '@/lib/user-store';
import { logEventToNeon, saveRefundToNeon, updateBookingInNeon, saveBookingToNeon } from '@/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Plus, Key, Sun, Moon } from 'lucide-react';
import { SafetyDock } from '@/components/SafetyDock';
import { SafetyModeOnboardingScreen } from '@/components/SafetyModeOnboardingScreen';
import { GogoFAB } from '@/components/GogoFAB';
import { GogoInterviewModal } from '@/components/GogoInterviewModal';
import { GogoPlanPreviewModal } from '@/components/GogoPlanPreviewModal';
import { ReceiptUploadDropzone } from '@/components/ReceiptUploadDropzone';
import { ReceiptExtractionReviewModal, ExtractedReceipt } from '@/components/ReceiptExtractionReviewModal';
import { OrgDashboardModal } from '@/components/OrgDashboardModal';
import { ApprovalQueueSection } from '@/components/ApprovalQueueSection';
import { TripChatPanel } from '@/components/TripChatPanel';
import { TripChatFAB } from '@/components/TripChatFAB';
import { CorporateAuthModal } from '@/components/CorporateAuthModal';
import { CorporateDashboardShell } from '@/components/CorporateDashboardShell';

export default function Home() {
  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'corporate'>('landing');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Multi-Trip State Management
  const [trips, setTrips] = useState<Trip[]>([INITIAL_TRIP]);
  const [activeTripId, setActiveTripId] = useState<string>(INITIAL_TRIP.id);

  // Floating Trip Chat & AI State
  const [isTripChatOpen, setIsTripChatOpen] = useState<boolean>(false);

  // Phase 2 Supertool States
  const [isSafetyOnboardingOpen, setIsSafetyOnboardingOpen] = useState<boolean>(false);
  const [isGogoInterviewOpen, setIsGogoInterviewOpen] = useState<boolean>(false);
  const [isGogoPreviewOpen, setIsGogoPreviewOpen] = useState<boolean>(false);
  const [generatedGogoPlan, setGeneratedGogoPlan] = useState<any | null>(null);

  const [isReceiptDropzoneOpen, setIsReceiptDropzoneOpen] = useState<boolean>(false);
  const [isReceiptReviewOpen, setIsReceiptReviewOpen] = useState<boolean>(false);
  const [extractedReceiptData, setExtractedReceiptData] = useState<ExtractedReceipt | null>(null);
  const [receiptImagePreview, setReceiptImagePreview] = useState<string | null>(null);

  const [isOrgModalOpen, setIsOrgModalOpen] = useState<boolean>(false);

  const [participantsMap, setParticipantsMap] = useState<Record<string, Participant[]>>({
    [INITIAL_TRIP.id]: INITIAL_PARTICIPANTS,
  });
  const [bookingsMap, setBookingsMap] = useState<Record<string, Booking[]>>({
    [INITIAL_TRIP.id]: INITIAL_BOOKINGS,
  });
  const [expensesMap, setExpensesMap] = useState<Record<string, Expense[]>>({
    [INITIAL_TRIP.id]: INITIAL_EXPENSES,
  });
  const [paymentsMap, setPaymentsMap] = useState<Record<string, Payment[]>>({
    [INITIAL_TRIP.id]: INITIAL_PAYMENTS,
  });
  const [eventsMap, setEventsMap] = useState<Record<string, LedgerEvent[]>>({
    [INITIAL_TRIP.id]: INITIAL_EVENTS,
  });
  const [vendorsMap, setVendorsMap] = useState<Record<string, Vendor[]>>({
    [INITIAL_TRIP.id]: INITIAL_VENDORS,
  });
  const [refundsMap, setRefundsMap] = useState<Record<string, RefundEvent[]>>({
    [INITIAL_TRIP.id]: INITIAL_REFUNDS,
  });

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentUserId, setCurrentUserId] = useState<string>('p1');

  // Modals
  const [isSplitDrawerOpen, setIsSplitDrawerOpen] = useState<boolean>(false);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState<boolean>(false);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState<boolean>(false);
  const [isJoinTripOpen, setIsJoinTripOpen] = useState<boolean>(false);
  const [isTripSwitcherOpen, setIsTripSwitcherOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isCorporateAuthOpen, setIsCorporateAuthOpen] = useState<boolean>(false);
  const [currentCorporateOrg, setCurrentCorporateOrg] = useState<any | null>(null);
  const [isMyTripsOpen, setIsMyTripsOpen] = useState<boolean>(false);
  const [isAccessGateOpen, setIsAccessGateOpen] = useState<boolean>(false);
  const [currentUserSession, setCurrentUserSession] = useState<AuthSessionUser | null>(null);
  const [isUpiSetupOpen, setIsUpiSetupOpen] = useState<boolean>(false);
  const [isAccountSwitcherOpen, setIsAccountSwitcherOpen] = useState<boolean>(false);
  const [isShareTripOpen, setIsShareTripOpen] = useState<boolean>(false);
  const [isDashboardAccessOpen, setIsDashboardAccessOpen] = useState<boolean>(false);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState<boolean>(false);
  const [isTripGatewayOpen, setIsTripGatewayOpen] = useState<boolean>(false);
  const [userAssociatedTrips, setUserAssociatedTrips] = useState<Trip[]>([]);

  // Seamless Light/Dark Theme Management State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tulis_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }
  };

  // Hydrate persistent state on client mount (trips, settings, viewMode, URL deep-linking)
  useEffect(() => {
    try {
      const savedTheme = (localStorage.getItem('tulis_theme') as 'dark' | 'light') || 'dark';
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }

      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const urlTrip = urlParams?.get('trip') || urlParams?.get('join') || urlParams?.get('code');
      const dedicatedMode = localStorage.getItem('tulis_view_mode');
      const dedicatedTripId = localStorage.getItem('tulis_active_trip_id');

      const saved = localStorage.getItem('group_ledger_session_v4');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.activeTripId) setActiveTripId(data.activeTripId);
        if (data.activeTab) setActiveTab(data.activeTab);
        if (data.currentUserId) setCurrentUserId(data.currentUserId);
        if (Array.isArray(data.trips) && data.trips.length > 0) setTrips(data.trips);
        if (data.expensesMap) {
          const sanitizedExpensesMap: Record<string, Expense[]> = {};
          Object.keys(data.expensesMap).forEach((tid) => {
            sanitizedExpensesMap[tid] = (data.expensesMap[tid] || []).map((e: any) => ({
              ...e,
              allocations: Array.isArray(e.allocations) ? e.allocations : [],
            }));
          });
          setExpensesMap(sanitizedExpensesMap);
        }
        if (data.bookingsMap) {
          const sanitizedBookingsMap: Record<string, Booking[]> = {};
          Object.keys(data.bookingsMap).forEach((tid) => {
            sanitizedBookingsMap[tid] = (data.bookingsMap[tid] || []).map((b: any) => ({
              ...b,
              participantIds: Array.isArray(b.participantIds) ? b.participantIds : [],
            }));
          });
          setBookingsMap(sanitizedBookingsMap);
        }
        if (data.participantsMap) setParticipantsMap(data.participantsMap);
        if (data.paymentsMap) setPaymentsMap(data.paymentsMap);
        if (data.eventsMap) {
          const sanitizedEventsMap: Record<string, LedgerEvent[]> = {};
          Object.keys(data.eventsMap).forEach((tid) => {
            sanitizedEventsMap[tid] = (data.eventsMap[tid] || []).map((e: any, idx: number) => {
              const eventType = e.eventType || e.event_type || 'LEDGER_EVENT';
              const payload = e.payload || e.payload_json || {};
              const description = e.description || payload.description || payload.reason || `${eventType.replace(/_/g, ' ')} recorded`;
              return {
                id: e.id || `evt-${Date.now()}-${idx}`,
                tripId: e.tripId || e.trip_id || tid,
                eventType,
                actorId: e.actorId || e.actor_id || 'system',
                actorName: e.actorName || e.actor_name || 'Traveler',
                timestamp: e.timestamp || e.created_at || new Date().toISOString(),
                description,
                payload,
                sequenceNum: Number(e.sequenceNum ?? e.sequence_num ?? idx + 1),
              };
            });
          });
          setEventsMap(sanitizedEventsMap);
        }

        // Keep in app dashboard if previously in app or invite code present in URL or storage
        if (dedicatedMode === 'app' || data.viewMode === 'app' || urlTrip) {
          setViewMode('app');
        }
      } else if (dedicatedMode === 'app' || urlTrip) {
        setViewMode('app');
      }

      if (dedicatedTripId) {
        setActiveTripId(dedicatedTripId);
      }

      // If URL has invite code/trip code, resolve and load
      if (urlTrip) {
        const cleanCode = urlTrip.trim().toUpperCase();
        fetch(`/api/trips?inviteCode=${cleanCode}`)
          .then((res) => res.json())
          .then((json) => {
            if (json.success && json.trip) {
              setTrips((prev) => [json.trip, ...prev.filter((t) => t.id !== json.trip.id)]);
              if (json.participants) setParticipantsMap((prev) => ({ ...prev, [json.trip.id]: json.participants }));
              if (json.bookings) {
                const safeBookings = (json.bookings || []).map((b: any) => ({
                  ...b,
                  participantIds: Array.isArray(b.participantIds) ? b.participantIds : [],
                }));
                setBookingsMap((prev) => ({ ...prev, [json.trip.id]: safeBookings }));
              }
              if (json.expenses) {
                const safeExpenses = (json.expenses || []).map((e: any) => ({
                  ...e,
                  allocations: Array.isArray(e.allocations) ? e.allocations : [],
                }));
                setExpensesMap((prev) => ({ ...prev, [json.trip.id]: safeExpenses }));
              }
              if (json.events) {
                const safeEvents = (json.events || []).map((e: any, idx: number) => {
                  const eventType = e.eventType || e.event_type || 'LEDGER_EVENT';
                  const payload = e.payload || e.payload_json || {};
                  const description = e.description || payload.description || payload.reason || `${eventType.replace(/_/g, ' ')} recorded`;
                  return {
                    id: e.id || `evt-${Date.now()}-${idx}`,
                    tripId: e.tripId || e.trip_id || json.trip.id,
                    eventType,
                    actorId: e.actorId || e.actor_id || 'system',
                    actorName: e.actorName || e.actor_name || 'Traveler',
                    timestamp: e.timestamp || e.created_at || new Date().toISOString(),
                    description,
                    payload,
                    sequenceNum: Number(e.sequenceNum ?? e.sequence_num ?? idx + 1),
                  };
                });
                setEventsMap((prev) => ({ ...prev, [json.trip.id]: safeEvents }));
              }
              setActiveTripId(json.trip.id);
              if (json.participants && json.participants.length > 0) {
                setCurrentUserId(json.participants[0].id);
              }
              setViewMode('app');
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.warn('Could not restore session from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Verify user session on mount and synchronize their associated trips
  useEffect(() => {
    fetch('/api/auth?action=me')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUserSession(data.user);
          syncUserTrips(data.user);
        }
      })
      .catch((err) => console.warn('Session verification error:', err));
  }, []);

  // Persist state changes to localStorage (Only runs AFTER client hydration so it NEVER overwrites saved session on mount)
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(
        'group_ledger_session_v4',
        JSON.stringify({
          viewMode,
          activeTripId,
          activeTab,
          currentUserId,
          trips,
          expensesMap,
          bookingsMap,
          participantsMap,
          paymentsMap,
          eventsMap,
        })
      );
      localStorage.setItem('tulis_view_mode', viewMode);
      if (viewMode === 'app') {
        localStorage.setItem('tulis_active_trip_id', activeTripId);
      }
    } catch (e) {
      console.warn('Could not save session to localStorage:', e);
    }
  }, [
    isHydrated,
    viewMode,
    activeTripId,
    activeTab,
    currentUserId,
    trips,
    expensesMap,
    bookingsMap,
    participantsMap,
    paymentsMap,
    eventsMap,
  ]);

  // Keep URL search params in sync with active dashboard trip
  useEffect(() => {
    if (isHydrated && viewMode === 'app' && typeof window !== 'undefined') {
      const activeTrip = trips.find((t) => t.id === activeTripId);
      const code = activeTrip?.inviteCode || activeTripId;
      if (code) {
        const currentParams = new URLSearchParams(window.location.search);
        if (currentParams.get('trip') !== code) {
          window.history.replaceState(null, '', `?trip=${encodeURIComponent(code)}`);
        }
      }
    }
  }, [isHydrated, viewMode, activeTripId, trips]);

  // Phase 1 New Modals State
  const [isVendorsOpen, setIsVendorsOpen] = useState<boolean>(false);
  const [isCancelBookingOpen, setIsCancelBookingOpen] = useState<boolean>(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState<boolean>(false);
  const [activeBookingToCancel, setActiveBookingToCancel] = useState<Booking | null>(null);
  const [activeBookingToEdit, setActiveBookingToEdit] = useState<Booking | null>(null);

  // Phase 2 & 4 Advanced Feature Modals State
  const [isChaosDemoOpen, setIsChaosDemoOpen] = useState<boolean>(false);
  const [chaosStep, setChaosStep] = useState<number>(0);
  const [isChaosRunning, setIsChaosRunning] = useState<boolean>(false);

  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isExplainBalanceOpen, setIsExplainBalanceOpen] = useState<boolean>(false);
  const [explainParticipantId, setExplainParticipantId] = useState<string>('p1');
  const [isRoomOptimizerOpen, setIsRoomOptimizerOpen] = useState<boolean>(false);
  const [isSettlementReportOpen, setIsSettlementReportOpen] = useState<boolean>(false);
  const [isSquadManagerOpen, setIsSquadManagerOpen] = useState<boolean>(false);

  // Phase 5 Vol 2 Feature Modals & State (F14 - F23)
  const [isChatExpenseOpen, setIsChatExpenseOpen] = useState<boolean>(false);
  const [chatDraftExpense, setChatDraftExpense] = useState<
    (Partial<Expense> & { chatSourceRaw?: string; receiptConfidence?: number }) | undefined
  >(undefined);

  const [isDuplicateWarningOpen, setIsDuplicateWarningOpen] = useState<boolean>(false);
  const [pendingDuplicateData, setPendingDuplicateData] = useState<{
    expenseData: any;
    duplicateMatch: any;
  } | null>(null);

  const [isNudgeModalOpen, setIsNudgeModalOpen] = useState<boolean>(false);
  const [isDebtReassignmentOpen, setIsDebtReassignmentOpen] = useState<boolean>(false);
  const [selectedDebtToReassign, setSelectedDebtToReassign] = useState<{
    id: string;
    fromParticipantId: string;
    toParticipantId: string;
    amount: number;
  } | null>(null);

  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineCommand[]>([]);
  const [isSyncingQueue, setIsSyncingQueue] = useState<boolean>(false);

  const [isCrossTripNettingActive, setIsCrossTripNettingActive] = useState<boolean>(false);

  const [dismissedAnomalyIds, setDismissedAnomalyIds] = useState<string[]>([]);
  const [squads, setSquads] = useState<Squad[]>([
    {
      id: 'squad-1',
      name: 'Hackathon Travel Tribe',
      description: 'Core developer squad for Goa offsite',
      members: [
        { name: 'Aditya (Organizer)', email: 'aditya@travel.in', upiId: 'aditya@upi', roomTier: 'suite' },
        { name: 'Rahul Sharma', email: 'rahul@travel.in', upiId: 'rahul@okhdfcbank', roomTier: 'standard' },
        { name: 'Sneha Roy', email: 'sneha@travel.in', upiId: 'sneha@icici', roomTier: 'standard' },
        { name: 'Ananya Verma', email: 'ananya@travel.in', upiId: 'ananya@paytm', roomTier: 'economy' },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Current active trip entities
  const trip = trips.find((t) => t.id === activeTripId) || trips[0];
  const participants = participantsMap[trip.id] || [];
  const bookings = bookingsMap[trip.id] || [];
  const expenses = expensesMap[trip.id] || [];
  const payments = paymentsMap[trip.id] || [];
  const events = eventsMap[trip.id] || [];
  const vendors = vendorsMap[trip.id] || [];
  const refunds = refundsMap[trip.id] || [];

  const activeParticipants = participants.filter((p) => p.status === 'active');
  const netBalances = computeNetBalances(participants, expenses, payments, refunds, bookings);
  const currentUser = participants.find((p) => p.id === currentUserId) || participants[0] || {
    id: currentUserId || 'p-default',
    tripId: trip?.id || 'trip-default',
    name: 'Traveler',
    email: 'traveler@tulis.in',
    avatarUrl: '',
    isOrganizer: false,
    status: 'active' as const,
    upiId: 'traveler@upi',
    weight: 1,
    roomTier: 'standard' as const,
  };

  const audit = computeReconciliationAudit(participants, expenses, payments, refunds, bookings);
  const rawAnomalies = detectAnomalies(trip, participants, bookings, expenses, payments);
  const activeAnomalies = rawAnomalies.filter((a) => !dismissedAnomalyIds.includes(a.id));

  const simplifiedDebts = simplifyDebts(netBalances).map((d) => {
    const payee = participants.find((p) => p.id === d.toId);
    return {
      ...d,
      payeeQrCodeUrl: payee?.qrCodeUrl,
    };
  });

  // F21: Cross-trip squad netting
  const crossTripResults = isCrossTripNettingActive
    ? netCrossTripSquadBalances(squads[0], trips, participantsMap, expensesMap, paymentsMap, refundsMap, bookingsMap)
    : null;

  const effectiveNetBalances = crossTripResults
    ? crossTripResults.aggregatedBalances.map((b) => {
        const p = participants.find((part) => part.id === b.participantId) || {
          id: b.participantId,
          tripId: trip.id,
          name: b.participantName,
          email: `${b.participantName.toLowerCase().replace(/\s+/g, '')}@travel.in`,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          isOrganizer: false,
          status: 'active' as const,
          upiId: `${b.participantName.toLowerCase().replace(/\s+/g, '')}@upi`,
          weight: 1,
          roomTier: 'standard' as const,
        };
        return {
          participant: p,
          totalPaid: b.netBalance > 0 ? b.netBalance : 0,
          totalOwed: b.netBalance < 0 ? Math.abs(b.netBalance) : 0,
          netBalance: b.netBalance,
          status: b.status,
        };
      })
    : netBalances;

  const effectiveSimplifiedDebts = crossTripResults
    ? crossTripResults.simplifiedDebts.map((d) => ({
        ...d,
        payeeQrCodeUrl: participants.find((p) => p.id === d.toId)?.qrCodeUrl,
      }))
    : simplifiedDebts;

  const isSettled = effectiveSimplifiedDebts.length === 0 && expenses.length > 0;

  const recordEvent = (eventType: any, description: string, payload: any) => {
    const actor = participants.find((p) => p.id === currentUserId);
    const newEvt: LedgerEvent = {
      id: 'evt-' + Date.now(),
      tripId: trip.id,
      eventType,
      actorId: currentUserId,
      actorName: actor?.name || 'User',
      timestamp: new Date().toISOString(),
      description,
      payload,
      sequenceNum: events.length + 1,
    };

    setEventsMap((prev) => ({
      ...prev,
      [trip.id]: [newEvt, ...(prev[trip.id] || [])],
    }));

    // Secure server-side event logging to Neon DB
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId: trip.id,
        eventType,
        actorId: currentUserId,
        payload,
      }),
    }).catch((err) => console.warn('Neon DB event persistence background sync:', err));
  };

  // Helper to switch to dashboard app mode and immediately persist state and URL
  const enterAppMode = (tripId: string, inviteCode?: string) => {
    setActiveTripId(tripId);
    setViewMode('app');
    try {
      localStorage.setItem('tulis_view_mode', 'app');
      localStorage.setItem('tulis_active_trip_id', tripId);
      const saved = localStorage.getItem('group_ledger_session_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.viewMode = 'app';
        parsed.activeTripId = tripId;
        localStorage.setItem('group_ledger_session_v4', JSON.stringify(parsed));
      }
      if (typeof window !== 'undefined') {
        const targetTrip = trips.find((t) => t.id === tripId);
        const code = inviteCode || targetTrip?.inviteCode || tripId;
        window.history.replaceState(null, '', `?trip=${encodeURIComponent(code)}`);
      }
    } catch (e) {
      console.warn('Could not persist app mode:', e);
    }
  };

  const loadTripById = async (targetTripId: string, userEmail?: string) => {
    try {
      const res = await fetch(`/api/trips?tripId=${targetTripId}`);
      const json = await res.json();
      if (json.success && json.trip) {
        const fetchedTrip: Trip = json.trip;
        const allParts: Participant[] = json.participants || [];

        setTrips((prev) => {
          const exists = prev.some((t) => t.id === fetchedTrip.id);
          if (!exists) return [fetchedTrip, ...prev];
          return prev.map((t) => (t.id === fetchedTrip.id ? fetchedTrip : t));
        });
        setParticipantsMap((prev) => ({ ...prev, [fetchedTrip.id]: allParts }));
        if (json.bookings) setBookingsMap((prev) => ({ ...prev, [fetchedTrip.id]: json.bookings }));
        if (json.expenses) setExpensesMap((prev) => ({ ...prev, [fetchedTrip.id]: json.expenses }));
        if (json.events) setEventsMap((prev) => ({ ...prev, [fetchedTrip.id]: json.events }));

        const emailToMatch = (userEmail || currentUserSession?.email || '').trim().toLowerCase();
        const matchingPart = emailToMatch
          ? allParts.find((p) => p.email?.trim().toLowerCase() === emailToMatch)
          : null;

        if (matchingPart) {
          setCurrentUserId(matchingPart.id);
        } else if (allParts.length > 0) {
          setCurrentUserId(allParts[0].id);
        }
        enterAppMode(fetchedTrip.id, fetchedTrip.inviteCode);
        return true;
      }
    } catch (err) {
      console.warn('Load trip by ID error:', err);
    }
    return false;
  };

  // Synchronize and showcase strictly the trips associated with this user's account
  const syncUserTrips = async (
    user: AuthSessionUser,
    preferredTripId?: string,
    autoEnterDashboard: boolean = false
  ): Promise<Trip[]> => {
    try {
      const userEmail = user.email.trim().toLowerCase();
      const res = await fetch(`/api/trips?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        const userTrips: Trip[] = data.trips;
        setTrips(userTrips);
        setUserAssociatedTrips(userTrips);

        if (autoEnterDashboard) {
          if (userTrips.length > 0) {
            const targetTrip =
              (preferredTripId && userTrips.find((t) => t.id === preferredTripId)) ||
              userTrips.find((t) => t.id === activeTripId) ||
              userTrips[0];
            setActiveTripId(targetTrip.id);
            await loadTripById(targetTrip.id, userEmail);
            setViewMode('app');
          } else {
            setActiveTripId('');
            setViewMode('app');
          }
        }
        return userTrips;
      }
    } catch (err) {
      console.warn('Could not sync user associated trips:', err);
    }
    return [];
  };

  const handleUnlockWithCode = async (code: string) => {
    const clean = code.trim().toUpperCase();
    const res = await fetch(`/api/trips?inviteCode=${encodeURIComponent(clean)}`);
    const data = await res.json();
    if (data.success && data.trip) {
      setIsAccessGateOpen(false);
      setIsTripGatewayOpen(false);
      setIsDashboardAccessOpen(false);
      enterAppMode(data.trip.id, clean);
      triggerToast(`Unlocked trip "${data.trip.title}"!`);
      return true;
    }
    return false;
  };

  // Explicit Logout handler: clears session, auth cookies, and resets to landing
  const handleLogout = async () => {
    setViewMode('landing');
    setCurrentUserSession(null);
    setIsMyTripsOpen(false);
    setIsTripGatewayOpen(false);
    setIsProfileCompletionOpen(false);
    setUserAssociatedTrips([]);
    setTrips([INITIAL_TRIP]);
    setActiveTripId(INITIAL_TRIP.id);
    setCurrentUserId('p1');
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      localStorage.setItem('tulis_view_mode', 'landing');
      localStorage.removeItem('tulis_active_trip_id');
      localStorage.removeItem('group_ledger_session_v4');
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      triggerToast('Logged out successfully.');
    } catch (e) {
      console.warn('Could not persist logout state:', e);
    }
  };

  // Creator-First Trip Creation
  const handleCreateTrip = (
    creator: {
      name: string;
      email: string;
      upiId: string;
      avatarUrl?: string;
    },
    tripData: {
      title: string;
      destination: string;
      startDate: string;
      endDate: string;
      budgetCeiling: number;
      safetyModeEnabled?: boolean;
    },
    initialParticipants: Array<{
      name: string;
      email: string;
      upiId: string;
      roomTier: 'suite' | 'standard' | 'economy';
      avatarUrl?: string;
    }>
  ) => {
    const newTripId = 'trip-' + Date.now();
    const creatorId = 'p-creator-' + Date.now();

    // Generate unique 6-character Invite Code (e.g. MANALI88)
    const codePrefix = tripData.destination.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase() || 'TRIP';
    const inviteCode = `${codePrefix}${Math.floor(100 + Math.random() * 900)}`;

    const newTrip: Trip = {
      id: newTripId,
      title: tripData.title,
      destination: tripData.destination,
      baseCurrency: 'INR',
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      budgetCeiling: tripData.budgetCeiling,
      safetyModeEnabled: Boolean(tripData.safetyModeEnabled),
      inviteCode,
      organizerId: creatorId,
      createdAt: new Date().toISOString(),
    };

    const activeEmail = currentUserSession?.email || creator.email;
    const activeName = currentUserSession?.name || creator.name;
    const activeUpi = currentUserSession?.upiId || creator.upiId;

    const creatorParticipant: Participant = {
      id: creatorId,
      tripId: newTripId,
      name: activeName,
      email: activeEmail,
      avatarUrl: creator.avatarUrl?.trim() || currentUserSession?.avatar || '',
      isOrganizer: true,
      status: 'active',
      upiId: activeUpi,
      weight: 1,
      roomTier: 'suite',
    };

    const memberParticipants: Participant[] = initialParticipants.map((p, idx) => ({
      id: `p-member-${idx + 1}-${Date.now()}`,
      tripId: newTripId,
      name: p.name,
      email: p.email,
      avatarUrl: p.avatarUrl?.trim() || '',
      isOrganizer: false,
      status: 'active',
      upiId: p.upiId,
      weight: 1,
      roomTier: p.roomTier,
    }));

    const allParts = [creatorParticipant, ...memberParticipants];

    setTrips((prev) => [newTrip, ...prev]);
    setActiveTripId(newTripId);
    setParticipantsMap((prev) => ({ ...prev, [newTripId]: allParts }));
    setBookingsMap((prev) => ({ ...prev, [newTripId]: [] }));
    setExpensesMap((prev) => ({ ...prev, [newTripId]: [] }));
    setPaymentsMap((prev) => ({ ...prev, [newTripId]: [] }));

    const initEvt: LedgerEvent = {
      id: 'evt-1',
      tripId: newTripId,
      eventType: 'TRIP_CREATED',
      actorId: creatorId,
      actorName: creator.name,
      timestamp: new Date().toISOString(),
      description: `Initialized new trip "${newTrip.title}" by organizer ${creator.name}. Invite Code: ${inviteCode}.`,
      payload: { budget: newTrip.budgetCeiling, inviteCode },
      sequenceNum: 1,
    };
    setEventsMap((prev) => ({ ...prev, [newTripId]: [initEvt] }));

    // Secure server-side trip and participant persistence to Neon PostgreSQL DB
    fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip: newTrip, participants: allParts }),
    }).catch((err) => console.warn('Neon DB trip persistence background sync:', err));

    setCurrentUserId(creatorId);
    enterAppMode(newTripId, inviteCode);
    setActiveTab('overview');
    triggerToast(`Created trip "${newTrip.title}"! Share code: ${inviteCode}`);
  };

  // Join Trip via Invite Code (Database Connected)
  const handleJoinTrip = async (
    inviteCode: string,
    travelerName: string,
    travelerEmail: string,
    upiId: string,
    avatarUrl?: string
  ): Promise<boolean> => {
    const cleanCode = inviteCode.trim().toUpperCase();
    const finalEmail = currentUserSession?.email || travelerEmail;
    const finalName = currentUserSession?.name || travelerName;
    const finalUpi = currentUserSession?.upiId || upiId;

    // 1. Call server API to join trip in Neon DB
    try {
      const res = await fetch('/api/trips/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: cleanCode,
          name: finalName,
          email: finalEmail,
          upiId: finalUpi,
          avatarUrl: avatarUrl || currentUserSession?.avatar,
        }),
      });

      const json = await res.json();
      if (json.success && json.trip) {
        const joinedTrip: Trip = json.trip;
        const currentPart = json.currentParticipant;
        const allParts: Participant[] = json.participants || [];

        // Update local state with joined trip and participants
        setTrips((prev) => {
          const exists = prev.some((t) => t.id === joinedTrip.id);
          return exists ? prev.map((t) => (t.id === joinedTrip.id ? joinedTrip : t)) : [joinedTrip, ...prev];
        });

        setParticipantsMap((prev) => ({
          ...prev,
          [joinedTrip.id]: allParts,
        }));

        if (json.bookings && json.bookings.length > 0) {
          setBookingsMap((prev) => ({
            ...prev,
            [joinedTrip.id]: json.bookings,
          }));
        }

        if (json.expenses && json.expenses.length > 0) {
          setExpensesMap((prev) => ({
            ...prev,
            [joinedTrip.id]: json.expenses,
          }));
        }

        if (json.events && json.events.length > 0) {
          setEventsMap((prev) => ({
            ...prev,
            [joinedTrip.id]: json.events,
          }));
        }

        setCurrentUserId(currentPart?.id || allParts[allParts.length - 1]?.id || 'p-1');
        enterAppMode(joinedTrip.id, cleanCode);
        setActiveTab('overview');
        triggerToast(`Welcome to ${joinedTrip.title}, ${travelerName}! Shares updated.`);
        return true;
      }
    } catch (err) {
      console.warn('Join trip server call failed, trying local fallback:', err);
    }

    // 2. Local fallback if offline or already cached
    const targetTrip = trips.find((t) => t.inviteCode?.toUpperCase() === cleanCode);
    if (!targetTrip) return false;

    const newPartId = 'p-joined-' + Date.now();
    const newPart: Participant = {
      id: newPartId,
      tripId: targetTrip.id,
      name: travelerName,
      email: travelerEmail,
      avatarUrl: avatarUrl?.trim() || '',
      isOrganizer: false,
      status: 'active',
      upiId,
      weight: 1,
      roomTier: 'standard',
    };

    const updatedParts = [...(participantsMap[targetTrip.id] || []), newPart];

    setParticipantsMap((prev) => ({
      ...prev,
      [targetTrip.id]: updatedParts,
    }));

    // Auto-add new participant to general group bookings
    setBookingsMap((prev) => ({
      ...prev,
      [targetTrip.id]: (prev[targetTrip.id] || []).map((b) => ({
        ...b,
        participantIds: Array.from(new Set([...b.participantIds, newPartId])),
      })),
    }));

    setCurrentUserId(newPartId);
    enterAppMode(targetTrip.id, cleanCode);
    setActiveTab('overview');

    recordEvent('TRIP_JOINED_VIA_CODE', `${travelerName} joined trip via Invite Code "${cleanCode}".`, {
      participantId: newPartId,
      inviteCode: cleanCode,
    });

    triggerToast(`Welcome to ${targetTrip.title}, ${travelerName}! Shares updated.`);
    return true;
  };

  const handleLogin = (participantId: string, email: string) => {
    setCurrentUserId(participantId);
    const user = participants.find((p) => p.id === participantId);
    recordEvent('USER_LOGGED_IN', `Member ${user?.name} logged into session.`, { participantId });
    triggerToast(`Welcome back, ${user?.name}!`);

    setTimeout(() => {
      setIsUpiSetupOpen(true);
    }, 400);
  };

  const handleRegister = (name: string, email: string, password: string) => {
    const newP: Participant = {
      id: 'p-' + Date.now(),
      tripId: trip.id,
      name,
      email,
      avatarUrl: '',
      isOrganizer: false,
      status: 'active',
      upiId: `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
      passwordHash: password,
      weight: 1,
      roomTier: 'standard',
    };

    const updatedParts = [...(participantsMap[trip.id] || []), newP];

    setParticipantsMap((prev) => ({
      ...prev,
      [trip.id]: updatedParts,
    }));

    setBookingsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((b) => ({
        ...b,
        participantIds: Array.from(new Set([...b.participantIds, newP.id])),
      })),
    }));

    setCurrentUserId(newP.id);
    recordEvent('PARTICIPANT_ADDED', `Registered member account for ${name}.`, { participantId: newP.id });
    triggerToast(`Account created for ${name}! Please configure your UPI ID.`);

    // Persist new member to Neon DB
    fetch('/api/trips/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteCode: trip.inviteCode || 'GOA2026',
        name,
        email,
        upiId: newP.upiId,
      }),
    }).catch((err) => console.warn('Could not sync registered member to DB:', err));

    setTimeout(() => {
      setIsUpiSetupOpen(true);
    }, 400);
  };

  const handleSaveUpiDetails = (participantId: string, upiId: string, qrCodeUrl?: string) => {
    setParticipantsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((p) => (p.id === participantId ? { ...p, upiId, qrCodeUrl } : p)),
    }));
    recordEvent('UPI_SETUP_UPDATED', `Updated UPI payment VPA & QR code for traveler.`, { participantId, upiId });
    triggerToast(`Updated UPI VPA to "${upiId}". Custom QR ready!`);
  };

  const handleDirectAddParticipant = (newP: Participant) => {
    const updatedParts = [...(participantsMap[trip.id] || []).filter((p) => p.id !== newP.id), newP];
    setParticipantsMap((prev) => ({
      ...prev,
      [trip.id]: updatedParts,
    }));
    setBookingsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((b) => ({
        ...b,
        participantIds: Array.from(new Set([...b.participantIds, newP.id])),
      })),
    }));
    recordEvent('PARTICIPANT_ADDED', `Added participant ${newP.name} to trip roster.`, { participantId: newP.id });
    triggerToast(`Added ${newP.name} to roster. Balances recalculated!`);

    // Persist direct member to Neon DB
    fetch('/api/trips/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteCode: trip.inviteCode || 'GOA2026',
        name: newP.name,
        email: newP.email,
        upiId: newP.upiId,
        avatarUrl: newP.avatarUrl,
      }),
    }).catch((err) => console.warn('Could not sync direct participant to DB:', err));
  };

  const handleAddParticipant = (name: string, email: string, isOrganizer: boolean, avatarUrl?: string) => {
    const newP: Participant = {
      id: 'p-' + Date.now(),
      tripId: trip.id,
      name,
      email,
      avatarUrl: avatarUrl?.trim() || '',
      isOrganizer,
      status: 'active',
      upiId: `${name.toLowerCase().replace(/\s+/g, '')}@upi`,
      weight: 1,
      roomTier: 'standard',
    };

    const updatedParts = [...(participantsMap[trip.id] || []), newP];

    setParticipantsMap((prev) => ({
      ...prev,
      [trip.id]: updatedParts,
    }));

    setBookingsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((b) => ({
        ...b,
        participantIds: Array.from(new Set([...b.participantIds, newP.id])),
      })),
    }));

    recordEvent('PARTICIPANT_ADDED', `Added new participant ${name} to trip roster.`, { participantId: newP.id });
    triggerToast(`Added ${name} to roster. Balances & allocations recalculated!`);

    // Persist member added via roster to Neon DB
    fetch('/api/trips/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteCode: trip.inviteCode || 'GOA2026',
        name,
        email,
        upiId: newP.upiId,
        avatarUrl: newP.avatarUrl,
      }),
    }).catch((err) => console.warn('Could not sync roster participant to DB:', err));
  };

  const handleToggleParticipantStatus = (participantId: string) => {
    setParticipantsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((p) =>
        p.id === participantId ? { ...p, status: p.status === 'active' ? 'removed' : 'active' } : p
      ),
    }));
    const target = participants.find((p) => p.id === participantId);
    recordEvent('PARTICIPANT_REMOVED', `Participant ${target?.name} status updated.`, { participantId });
    triggerToast(`Updated ${target?.name} status. Shares recalculated.`);
  };

  const handleUpdateParticipantWeight = (
    participantId: string,
    weight: number,
    roomTier: 'suite' | 'standard' | 'economy'
  ) => {
    setParticipantsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((p) =>
        p.id === participantId ? { ...p, weight, roomTier } : p
      ),
    }));
    triggerToast(`Updated share configuration for traveler. Balances updated.`);
  };

  const handleSubmitExpense = (data: {
    title: string;
    totalAmount: number;
    splitMethod: SplitMethod;
    paidById: string;
    paidBySplits?: { participantId: string; amount: number }[];
    allocations?: ExpenseAllocation[];
    bookingId?: string;
    category: BookingCategory;
    subsidyAmount?: number;
    receiptUrl?: string;
    receiptName?: string;
    chatSourceRaw?: string;
    receiptConfidence?: number;
    isDuplicateAcknowledged?: boolean;
    createdAt?: string;
    costCenter?: string;
  }) => {
    // F19: If simulated offline, queue command in local outbox
    if (isOffline) {
      const offlineCmd: OfflineCommand = {
        id: 'cmd-' + Date.now(),
        tripId: trip.id,
        type: 'LOG_EXPENSE',
        payload: data,
        clientTimestamp: data.createdAt || new Date().toISOString(),
        status: 'queued',
      };
      setOfflineQueue((prev) => [...prev, offlineCmd]);
      triggerToast(`Offline Mode: "${data.title}" queued safely in outbox (F19).`);
      return;
    }

    // F16: Duplicate expense guard pre-commit check
    if (!data.isDuplicateAcknowledged) {
      const dupCheck = checkDuplicateExpense(data, expenses);
      if (dupCheck) {
        setPendingDuplicateData({ expenseData: data, duplicateMatch: dupCheck });
        setIsDuplicateWarningOpen(true);
        return;
      }
    }

    const activeParts = participants.filter((p) => p.status === 'active');
    const allocations = (data.splitMethod === 'manual' && data.allocations && data.allocations.length > 0)
      ? data.allocations
      : calculateSplits(data.totalAmount, data.splitMethod, activeParts, {
          subsidyAmount: data.subsidyAmount,
        });

    const newExpense: Expense = {
      id: 'e-' + Date.now(),
      tripId: trip.id,
      bookingId: data.bookingId,
      title: data.title,
      totalAmount: data.totalAmount,
      currency: 'INR',
      splitMethod: data.splitMethod,
      paidById: data.paidById,
      paidBySplits: data.paidBySplits,
      category: data.category,
      createdAt: data.createdAt || new Date().toISOString(),
      allocations,
      subsidyAmount: data.subsidyAmount,
      receiptUrl: data.receiptUrl,
      receiptName: data.receiptName,
      chatSourceRaw: data.chatSourceRaw,
      receiptConfidence: data.receiptConfidence,
      isDuplicateAcknowledged: data.isDuplicateAcknowledged,
      costCenter: data.costCenter,
      approvalStatus: trip.organizationId ? 'pending' : 'approved',
    };

    setExpensesMap((prev) => ({
      ...prev,
      [trip.id]: [newExpense, ...(prev[trip.id] || [])],
    }));

    if (trip.organizationId) {
      fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'evaluate-expense',
          expenseId: newExpense.id,
          orgId: trip.organizationId,
          amount: data.totalAmount,
          category: data.category,
          hasReceipt: !!data.receiptUrl,
          costCenter: data.costCenter,
          userId: currentUserId,
        }),
      })
        .then(async (res) => {
          const resJson = await res.json();
          if (resJson.success && resJson.status === 'pending') {
            triggerToast(`Flagged for corporate manager approval: ${resJson.violationReason}`);
            recordEvent('APPROVAL_REQUESTED', `Expense "${data.title}" flagged for manager approval.`, {
              expenseId: newExpense.id,
              violationReason: resJson.violationReason,
            });
          }
        })
        .catch((e) => console.warn('Corporate approval check error:', e));
    }

    if (data.bookingId) {
      setBookingsMap((prev) => ({
        ...prev,
        [trip.id]: (prev[trip.id] || []).map((b) =>
          b.id === data.bookingId ? { ...b, actualCost: b.actualCost + data.totalAmount } : b
        ),
      }));
    }

    // Secure server-side expense and allocations persistence to Neon PostgreSQL DB
    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense: newExpense }),
    }).catch((err) => console.warn('Neon DB expense persistence error:', err));

    recordEvent(
      'EXPENSE_LOGGED',
      `Logged expense "${data.title}" (₹${data.totalAmount.toFixed(2)}) via ${data.splitMethod} split rule${
        data.chatSourceRaw ? ' (parsed via Chat/Voice)' : ''
      }.`,
      { expenseId: newExpense.id, amount: data.totalAmount }
    );

    triggerToast(`Logged "${data.title}". Balances recalculated across ${allocations.length} participants.`);
  };

  // F19: Sync / Replay Offline Command Queue
  const handleSyncOfflineQueue = () => {
    const pendingCmds = offlineQueue.filter((c) => c.status === 'queued');
    if (pendingCmds.length === 0) return;

    setIsSyncingQueue(true);
    setTimeout(() => {
      pendingCmds.forEach((cmd) => {
        if (cmd.type === 'LOG_EXPENSE') {
          const expenseData = { ...cmd.payload, isDuplicateAcknowledged: true };
          const activeParts = participants.filter((p) => p.status === 'active');
          const allocations = calculateSplits(expenseData.totalAmount, expenseData.splitMethod, activeParts, {
            subsidyAmount: expenseData.subsidyAmount,
          });

          const newExpense: Expense = {
            id: 'e-offline-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            tripId: trip.id,
            bookingId: expenseData.bookingId,
            title: expenseData.title,
            totalAmount: expenseData.totalAmount,
            currency: 'INR',
            splitMethod: expenseData.splitMethod,
            paidById: expenseData.paidById,
            category: expenseData.category,
            createdAt: cmd.clientTimestamp,
            allocations,
            subsidyAmount: expenseData.subsidyAmount,
            receiptUrl: expenseData.receiptUrl,
            receiptName: expenseData.receiptName,
            chatSourceRaw: expenseData.chatSourceRaw,
            receiptConfidence: expenseData.receiptConfidence,
            isDuplicateAcknowledged: true,
          };

          setExpensesMap((prev) => ({
            ...prev,
            [trip.id]: [newExpense, ...(prev[trip.id] || [])],
          }));

          // Secure server-side expense persistence to Neon PostgreSQL DB
          fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expense: newExpense }),
          }).catch((err) => console.warn('Neon DB offline expense sync error:', err));

          recordEvent(
            'OFFLINE_COMMAND_SYNCED',
            `Replayed offline command: Added expense "${expenseData.title}" (₹${expenseData.totalAmount.toFixed(2)}).`,
            { commandId: cmd.id, expenseId: newExpense.id }
          );
        }
      });

      setOfflineQueue((prev) => prev.map((c) => ({ ...c, status: 'synced' })));
      setIsSyncingQueue(false);
      triggerToast(`Successfully synced ${pendingCmds.length} offline actions to ledger!`);
    }, 800);
  };

  // F18: Debt Reassignment / IOU Transfer Handler
  const handleReassignDebt = (params: {
    originalDebtorId: string;
    surrogateDebtorId: string;
    creditorId: string;
    amount: number;
    reason: string;
  }) => {
    const origDebtor = participants.find((p) => p.id === params.originalDebtorId);
    const surrogate = participants.find((p) => p.id === params.surrogateDebtorId);
    const creditor = participants.find((p) => p.id === params.creditorId);

    const reassignPayment: Payment = {
      id: 'pay-reassign-' + Date.now(),
      tripId: trip.id,
      payerId: params.surrogateDebtorId,
      payeeId: params.originalDebtorId,
      amount: params.amount,
      status: 'confirmed',
      note: `Debt reassigned: ${params.reason}`,
      createdAt: new Date().toISOString(),
    };

    setPaymentsMap((prev) => ({
      ...prev,
      [trip.id]: [...(prev[trip.id] || []), reassignPayment],
    }));

    recordEvent(
      'DEBT_REASSIGNED',
      `${origDebtor?.name} reassigned ₹${params.amount.toLocaleString('en-IN')} debt obligation to ${surrogate?.name} (Reason: ${params.reason}).`,
      { ...params, paymentId: reassignPayment.id }
    );

    triggerToast(`Debt obligation of ₹${params.amount.toLocaleString('en-IN')} transferred to ${surrogate?.name}!`);
  };

  // F20: Nudge Reminder Handler
  const handleSendNudge = (debtorId: string, amount: number, channel: 'in_app' | 'whatsapp') => {
    const debtor = participants.find((p) => p.id === debtorId);
    recordEvent(
      'REMINDER_SENT',
      `Sent settlement reminder to ${debtor?.name} for ₹${amount.toLocaleString('en-IN')} via ${channel}.`,
      { debtorId, amount, channel }
    );
    triggerToast(`Settlement reminder dispatched to ${debtor?.name}!`);
  };

  // F14: Natural Chat / Receipt Draft Handler
  const handleApplyParsedChatDraft = (draft: ParsedChatExpense) => {
    setChatDraftExpense({
      title: draft.title,
      totalAmount: draft.totalAmount,
      splitMethod: draft.suggestedSplitMethod,
      paidById: draft.payerId || currentUserId,
      category: draft.category,
      chatSourceRaw: draft.rawText,
      receiptConfidence: draft.confidence,
      receiptUrl: draft.receiptUrl,
    });
    setIsSplitDrawerOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).filter((e) => e.id !== eventId),
    }));
    triggerToast('Audit event removed from activity log.');
  };

  const handleAddBooking = (data: {
    category: BookingCategory;
    title: string;
    vendor: string;
    estimatedCost: number;
    actualCost: number;
    participantIds: string[];
  }) => {
    const newBooking: Booking = {
      id: 'b-' + Date.now(),
      tripId: trip.id,
      category: data.category,
      title: data.title,
      vendor: data.vendor,
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
      status: 'confirmed',
      participantIds: data.participantIds,
    };

    setBookingsMap((prev) => ({
      ...prev,
      [trip.id]: [...(prev[trip.id] || []), newBooking],
    }));
    saveBookingToNeon(newBooking).catch((err) => console.warn('Neon DB booking sync:', err));
    recordEvent('BOOKING_CREATED', `Added booking "${data.title}" to itinerary.`, { bookingId: newBooking.id });
    triggerToast(`Added booking "${data.title}" to itinerary graph.`);
  };

  const handleSettleDebt = (fromId: string, toId: string, amount: number) => {
    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      tripId: trip.id,
      payerId: fromId,
      payeeId: toId,
      amount,
      status: 'pending',
      note: 'UPI Payment initiated via Debt Engine',
      createdAt: new Date().toISOString(),
    };

    setPaymentsMap((prev) => ({
      ...prev,
      [trip.id]: [...(prev[trip.id] || []), newPayment],
    }));

    const payer = participants.find((p) => p.id === fromId);
    const payee = participants.find((p) => p.id === toId);

    recordEvent(
      'PAYMENT_RECORDED',
      `Recorded payment of ₹${amount.toFixed(2)} from ${payer?.name} to ${payee?.name} via UPI (Pending payee confirmation).`,
      { payerId: fromId, payeeId: toId, amount }
    );

    triggerToast(`UPI Settlement payment of ₹${amount.toFixed(2)} recorded! Awaiting ${payee?.name}'s confirmation.`);
  };

  const handleConfirmPaymentReceipt = (paymentId: string) => {
    setPaymentsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((p) =>
        p.id === paymentId ? { ...p, status: 'confirmed' } : p
      ),
    }));
    const pay = payments.find((p) => p.id === paymentId);
    const payer = participants.find((p) => p.id === pay?.payerId);
    recordEvent('PAYMENT_CONFIRMED', `Confirmed receipt of ₹${pay?.amount.toFixed(2)} from ${payer?.name}.`, { paymentId });
    triggerToast(`Receipt confirmed! Balance updated.`);
  };

  const handleDisputePayment = (paymentId: string) => {
    setPaymentsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((p) =>
        p.id === paymentId ? { ...p, status: 'disputed' } : p
      ),
    }));
    const pay = payments.find((p) => p.id === paymentId);
    recordEvent('PAYMENT_DISPUTED', `Disputed payment claim of ₹${pay?.amount.toFixed(2)}.`, { paymentId });
    triggerToast(`Payment disputed and reverted to standing debt.`);
  };

  const handleDisputeAllocation = (expenseId: string, participantId: string, reason: string) => {
    setExpensesMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((e) => {
        if (e.id === expenseId) {
          return {
            ...e,
            hasActiveDisputes: true,
            allocations: (e.allocations || []).map((a) =>
              a.participantId === participantId ? { ...a, disputeStatus: 'active', disputeReason: reason } : a
            ),
          };
        }
        return e;
      }),
    }));
    const part = participants.find((p) => p.id === participantId);
    recordEvent('ALLOCATION_DISPUTED', `${part?.name} disputed allocation: "${reason}".`, { expenseId, participantId, reason });
    triggerToast(`Allocation flagged as disputed for organizer review.`);
  };

  const handleResolveDispute = (expenseId: string, participantId: string) => {
    setExpensesMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((e) => {
        if (e.id === expenseId) {
          return {
            ...e,
            allocations: (e.allocations || []).map((a) =>
              a.participantId === participantId ? { ...a, disputeStatus: 'resolved', disputeResolution: 'Approved exemption' } : a
            ),
          };
        }
        return e;
      }),
    }));
    const part = participants.find((p) => p.id === participantId);
    recordEvent('ALLOCATION_DISPUTE_RESOLVED', `Dispute on expense allocation resolved for ${part?.name}.`, { expenseId, participantId });
    triggerToast(`Dispute resolved! Ledger compensated.`);
  };

  const handleDismissAnomaly = (id: string) => {
    setDismissedAnomalyIds((prev) => [...prev, id]);
    recordEvent('ANOMALY_DISMISSED', `Dismissed conflict flag "${id}".`, { anomalyId: id });
    triggerToast(`Conflict flag dismissed.`);
  };

  const handleSaveCurrentSquad = (name: string, description: string) => {
    const newSquad: Squad = {
      id: 'squad-' + Date.now(),
      name,
      description,
      members: participants.map((p) => ({
        name: p.name,
        email: p.email,
        upiId: p.upiId || `${p.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        roomTier: p.roomTier,
      })),
      createdAt: new Date().toISOString(),
    };
    setSquads((prev) => [newSquad, ...prev]);
    recordEvent('SQUAD_CREATED', `Saved persistent squad "${name}" with ${newSquad.members.length} travelers.`, { squadId: newSquad.id });
    triggerToast(`Saved squad "${name}"! Reusable across trips.`);
  };

  const handleDeleteSquad = (squadId: string) => {
    setSquads((prev) => prev.filter((s) => s.id !== squadId));
    triggerToast(`Squad removed.`);
  };

  // Chaos Demonstration Sequence Handler (F7)
  const handleExecuteChaosStep = (stepId: number) => {
    setChaosStep(stepId);
    if (stepId === 1) {
      const vikram: Participant = {
        id: 'p-vikram',
        tripId: trip.id,
        name: 'Vikram Sharma',
        email: 'vikram@sharma.in',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        isOrganizer: false,
        status: 'active',
        upiId: 'vikram@okaxis',
        weight: 1,
        roomTier: 'standard',
      };
      setParticipantsMap((prev) => ({
        ...prev,
        [trip.id]: [...(prev[trip.id] || []).filter((p) => p.id !== 'p-vikram'), vikram],
      }));
      recordEvent('PARTICIPANT_ADDED', `[CHAOS STEP 1] Late joiner Vikram Sharma added to trip roster.`, { participantId: 'p-vikram' });
      triggerToast(`[Chaos 1/7] Vikram joined! Allocations shifted dynamically.`);
    } else if (stepId === 2) {
      const activeParts = [...participants.filter((p) => p.status === 'active')];
      if (!activeParts.some((p) => p.id === 'p-vikram')) {
        activeParts.push({
          id: 'p-vikram',
          tripId: trip.id,
          name: 'Vikram Sharma',
          email: 'vikram@sharma.in',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          isOrganizer: false,
          status: 'active',
          upiId: 'vikram@okaxis',
          weight: 1,
          roomTier: 'standard',
        });
      }
      const allocs = calculateSplits(12000, 'equal', activeParts);
      const catamaranExp: Expense = {
        id: 'exp-catamaran',
        tripId: trip.id,
        title: 'Sunset Catamaran Yacht Cruise',
        totalAmount: 12000,
        currency: 'INR',
        splitMethod: 'equal',
        paidById: 'p-vikram',
        category: 'activity',
        createdAt: new Date().toISOString(),
        allocations: allocs,
      };
      setExpensesMap((prev) => ({
        ...prev,
        [trip.id]: [catamaranExp, ...(prev[trip.id] || []).filter((e) => e.id !== 'exp-catamaran')],
      }));
      recordEvent('EXPENSE_LOGGED', `[CHAOS STEP 2] Logged ₹12,000 Catamaran Cruise fronted by Vikram.`, { amount: 12000 });
      triggerToast(`[Chaos 2/7] Vikram fronted ₹12,000! He holds +₹9,600 surplus.`);
    } else if (stepId === 3) {
      setParticipantsMap((prev) => ({
        ...prev,
        [trip.id]: (prev[trip.id] || []).map((p) =>
          p.id === 'p3' || p.name.includes('Sneha') ? { ...p, status: 'removed' as const } : p
        ),
      }));
      recordEvent('PARTICIPANT_REMOVED', `[CHAOS STEP 3] Sneha Roy departed trip early. Historical debts preserved without erasure.`, { participantId: 'p3' });
      triggerToast(`[Chaos 3/7] Sneha exited! Historical shares retained.`);
    } else if (stepId === 4) {
      const scuba = bookings.find((b) => b.category === 'activity' && b.status !== 'cancelled') || bookings[0];
      if (scuba) {
        handleConfirmCancelBooking(scuba.id, 'partial', 75, 'Sea turbulence advisory cancellation');
        triggerToast(`[Chaos 4/7] Cancelled "${scuba.title}" under 75% refund policy!`);
      }
    } else if (stepId === 5) {
      const refEvt: RefundEvent = {
        id: 'ref-chaos-' + Date.now(),
        tripId: trip.id,
        amount: 6000,
        currency: 'INR',
        refundedToPayerId: trip.organizerId,
        policy: 'partial',
        reason: '[CHAOS STEP 5] Operator wire transfer refund credited to group front-runner.',
        createdAt: new Date().toISOString(),
      };
      setRefundsMap((prev) => ({
        ...prev,
        [trip.id]: [refEvt, ...(prev[trip.id] || [])],
      }));
      recordEvent('REFUND_CREDITED', `[CHAOS STEP 5] Credited ₹6,000 operator refund to trip front-runner.`, { amount: 6000 });
      triggerToast(`[Chaos 5/7] ₹6,000 vendor refund credited!`);
    } else if (stepId === 6) {
      setActiveTab('overview');
      triggerToast(`[Chaos 6/7] Reconciled! Mathematical invariant verified (Discrepancy Δ = 0.00).`);
    } else if (stepId === 7) {
      setActiveTab('settlement');
      triggerToast(`[Chaos 7/7] Settled! Debt graph collapsed into optimal N-1 paths.`);
    }
  };

  const handleRunAutoSequence = () => {
    setIsChaosRunning(true);
    let nextStep = chaosStep < 7 ? chaosStep + 1 : 1;
    const timer = setInterval(() => {
      handleExecuteChaosStep(nextStep);
      nextStep++;
      if (nextStep > 7) {
        clearInterval(timer);
        setIsChaosRunning(false);
        triggerToast(`Chaos demonstration sequence fully complete!`);
      }
    }, 1400);
  };

  const handleResetChaosDemo = () => {
    setChaosStep(0);
    setIsChaosRunning(false);
    setParticipantsMap((prev) => ({ ...prev, [trip.id]: INITIAL_PARTICIPANTS }));
    setBookingsMap((prev) => ({ ...prev, [trip.id]: INITIAL_BOOKINGS }));
    setExpensesMap((prev) => ({ ...prev, [trip.id]: INITIAL_EXPENSES }));
    setPaymentsMap((prev) => ({ ...prev, [trip.id]: INITIAL_PAYMENTS }));
    setRefundsMap((prev) => ({ ...prev, [trip.id]: INITIAL_REFUNDS }));
    triggerToast(`Reset trip state to initial baseline.`);
  };

  const handleConfirmCancelBooking = (
    bookingId: string,
    policy: RefundPolicy,
    refundPercent: number,
    reason: string
  ) => {
    const targetBooking = bookings.find((b) => b.id === bookingId);
    if (!targetBooking) return;

    const bookingExpenses = expenses.filter((e) => e.bookingId === bookingId);
    const generatedRefunds = processBookingCancellation(
      targetBooking,
      bookingExpenses,
      policy,
      refundPercent,
      undefined,
      reason
    );

    const totalRefundAmt = generatedRefunds.reduce((sum, r) => sum + r.amount, 0);

    setBookingsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              refundPolicy: policy,
              cancellationReason: reason,
              refundAmount: totalRefundAmt,
            }
          : b
      ),
    }));

    if (generatedRefunds.length > 0) {
      setRefundsMap((prev) => ({
        ...prev,
        [trip.id]: [...(prev[trip.id] || []), ...generatedRefunds],
      }));

      generatedRefunds.forEach((ref) => saveRefundToNeon(ref));

      recordEvent(
        'REFUND_CREDITED',
        `Credited ₹${totalRefundAmt.toFixed(2)} vendor refund for cancelled booking "${targetBooking.title}".`,
        { bookingId, refundCount: generatedRefunds.length, totalRefundAmt }
      );
    }

    updateBookingInNeon(bookingId, 'cancelled', policy, reason, totalRefundAmt);

    recordEvent(
      'BOOKING_CANCELLED',
      `Cancelled booking "${targetBooking.title}" under ${policy} refund policy (${refundPercent}%).`,
      { bookingId, policy, reason }
    );

    triggerToast(`Cancelled "${targetBooking.title}". Ledger re-derived with ₹${totalRefundAmt.toFixed(2)} refund!`);
  };

  const handleSaveBooking = (updatedFields: Partial<Booking> & { id: string }) => {
    setBookingsMap((prev) => ({
      ...prev,
      [trip.id]: (prev[trip.id] || []).map((b) =>
        b.id === updatedFields.id ? { ...b, ...updatedFields } : b
      ),
    }));

    if (updatedFields.status) {
      updateBookingInNeon(updatedFields.id, updatedFields.status);
    }

    const bTitle = updatedFields.title || bookings.find((b) => b.id === updatedFields.id)?.title;
    recordEvent('BOOKING_MODIFIED', `Revised rates & traveler roster for booking "${bTitle}".`, {
      bookingId: updatedFields.id,
      actualCost: updatedFields.actualCost,
    });

    triggerToast(`Revised booking "${bTitle}". Participant shares recalculated!`);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LiquidLogo size={42} showText={false} />
          <span className="text-xs font-mono text-ink-muted animate-pulse">Syncing Tulis Ledger...</span>
        </div>
      </div>
    );
  }

  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={() => {
            if (currentUserSession?.isCorporate) {
              setViewMode('corporate');
            } else if (currentUserSession) {
              syncUserTrips(currentUserSession, undefined, false).then(() => {
                setIsTripGatewayOpen(true);
              });
            } else {
              setIsDashboardAccessOpen(true);
            }
          }}
          onOpenCreateTrip={() => setIsCreateTripOpen(true)}
          onOpenJoinTrip={() => setIsJoinTripOpen(true)}
          currentUser={currentUserSession}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCorporateAuth={() => setIsCorporateAuthOpen(true)}
          onOpenMyTrips={() => {
            if (currentUserSession?.isCorporate) {
              setViewMode('corporate');
            } else if (currentUserSession) {
              syncUserTrips(currentUserSession, undefined, false).then(() => {
                setIsTripGatewayOpen(true);
              });
            } else {
              setIsAuthOpen(true);
            }
          }}
        />

        <DashboardAccessModal
          isOpen={isDashboardAccessOpen}
          onClose={() => setIsDashboardAccessOpen(false)}
          onEnterInviteCode={async (code) => {
            const cleanCode = code.trim().toUpperCase();

            // 1. Check local memory state
            const targetTrip = trips.find((t) => t.inviteCode?.toUpperCase() === cleanCode);
            if (targetTrip) {
              enterAppMode(targetTrip.id, cleanCode);
              return true;
            }

            // 2. Fetch directly from Neon PostgreSQL Database
            try {
              const res = await fetch(`/api/trips?inviteCode=${cleanCode}`);
              const json = await res.json();
              if (json.success && json.trip) {
                const fetchedTrip: Trip = json.trip;
                const allParts: Participant[] = json.participants || [];

                setTrips((prev) => [fetchedTrip, ...prev.filter((t) => t.id !== fetchedTrip.id)]);
                setParticipantsMap((prev) => ({ ...prev, [fetchedTrip.id]: allParts }));
                if (json.bookings) setBookingsMap((prev) => ({ ...prev, [fetchedTrip.id]: json.bookings }));
                if (json.expenses) setExpensesMap((prev) => ({ ...prev, [fetchedTrip.id]: json.expenses }));
                if (json.events) setEventsMap((prev) => ({ ...prev, [fetchedTrip.id]: json.events }));

                if (allParts.length > 0) {
                  setCurrentUserId(allParts[0].id);
                }
                enterAppMode(fetchedTrip.id, cleanCode);
                triggerToast(`Loaded trip "${fetchedTrip.title}" from database!`);
                return true;
              }
            } catch (err) {
              console.warn('Database trip lookup failed:', err);
            }

            return false;
          }}
          onOpenCreateTrip={() => {
            setIsDashboardAccessOpen(false);
            setIsCreateTripOpen(true);
          }}
          onOpenDemoTrip={() => {
            enterAppMode(INITIAL_TRIP.id, INITIAL_TRIP.inviteCode);
          }}
        />

        <CreateTripModal
          isOpen={isCreateTripOpen}
          onClose={() => setIsCreateTripOpen(false)}
          onCreateTrip={handleCreateTrip}
          currentUser={currentUserSession}
        />

        <JoinTripModal
          isOpen={isJoinTripOpen}
          onClose={() => setIsJoinTripOpen(false)}
          onJoinTrip={handleJoinTrip}
          currentUser={currentUserSession}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSwitchToCorporate={() => {
            setIsAuthOpen(false);
            setIsCorporateAuthOpen(true);
          }}
          onAuthSuccess={async (sessionUser, needsProfileCompletion) => {
            setCurrentUserSession(sessionUser);
            setIsAuthOpen(false);
            await syncUserTrips(sessionUser, undefined, false);
            if (needsProfileCompletion || !sessionUser.profileCompleted) {
              setIsProfileCompletionOpen(true);
            } else {
              setIsTripGatewayOpen(true);
              triggerToast(`Welcome, ${sessionUser.name}! Choose how you'd like to get started.`);
            }
          }}
        />

        <CorporateAuthModal
          isOpen={isCorporateAuthOpen}
          onClose={() => setIsCorporateAuthOpen(false)}
          onCorporateSuccess={(corpUser, org) => {
            setCurrentUserSession(corpUser);
            setCurrentCorporateOrg(org);
            setIsCorporateAuthOpen(false);
            setViewMode('corporate');
            triggerToast(`Welcome to ${org?.name || 'Corporate'} Travel Command Center!`);
          }}
          onSwitchToNormalLogin={() => {
            setIsCorporateAuthOpen(false);
            setIsAuthOpen(true);
          }}
        />

        <ProfileCompletionModal
          isOpen={isProfileCompletionOpen}
          user={currentUserSession}
          onComplete={async (updatedUser) => {
            setCurrentUserSession(updatedUser);
            setIsProfileCompletionOpen(false);
            await syncUserTrips(updatedUser, undefined, false);
            setIsTripGatewayOpen(true);
            triggerToast(`Profile completed! Welcome aboard, ${updatedUser.name}.`);
          }}
          onClose={() => setIsProfileCompletionOpen(false)}
        />

        <TripSelectionGatewayModal
          isOpen={isTripGatewayOpen}
          user={currentUserSession}
          userTrips={userAssociatedTrips}
          onSelectTrip={async (selectedTripId) => {
            await loadTripById(selectedTripId);
            setIsTripGatewayOpen(false);
          }}
          onCreateNewTrip={() => {
            setIsTripGatewayOpen(false);
            setIsCreateTripOpen(true);
          }}
          onJoinTrip={() => {
            setIsTripGatewayOpen(false);
            setIsJoinTripOpen(true);
          }}
          onQuickJoinCode={async (code) => {
            return await handleUnlockWithCode(code);
          }}
          onLogout={handleLogout}
        />

        <MyTripsModal
          isOpen={isMyTripsOpen}
          onClose={() => setIsMyTripsOpen(false)}
          currentUser={currentUserSession}
          currentTripId={activeTripId}
          onSelectTrip={async (selectedTripId) => {
            await loadTripById(selectedTripId);
            setIsMyTripsOpen(false);
          }}
          onCreateNewTrip={() => {
            setIsMyTripsOpen(false);
            setIsCreateTripOpen(true);
          }}
          onJoinTrip={() => {
            setIsMyTripsOpen(false);
            setIsJoinTripOpen(true);
          }}
          onLogout={handleLogout}
        />
      </>
    );
  }

  // Dedicated Empty Workspace for Authenticated Users with 0 Associated Trips
  if (currentUserSession && (!trip || trips.length === 0)) {
    return (
      <div className="min-h-screen bg-surface-base text-ink-primary font-sans flex flex-col justify-between">
        {/* Top Navbar */}
        <header className="border-b border-border-default bg-surface-card/60 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LiquidLogo size={32} />
            <div>
              <span className="font-bold text-base tracking-tight font-serif-display text-ink-primary">Tulis</span>
              <span className="text-[10px] ml-2 font-mono uppercase px-2 py-0.5 rounded bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 font-semibold">
                Personal Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-card border border-border-default">
              {currentUserSession.avatar ? (
                <img src={currentUserSession.avatar} alt={currentUserSession.name} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-brand-emerald text-surface-base text-[10px] font-bold flex items-center justify-center">
                  {currentUserSession.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-medium text-ink-primary">{currentUserSession.email}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border-default bg-surface-card hover:bg-surface-elevated text-ink-muted hover:text-ink-primary transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl border border-border-default bg-surface-card hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 text-xs font-semibold text-ink-secondary transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Empty State Hero Container */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-6 bg-surface-card/90 border border-border-default p-8 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-brand-emerald/15 border border-brand-emerald/30 text-brand-emerald flex items-center justify-center mx-auto shadow-emerald">
              <Compass className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-serif-display text-ink-primary">
                No Associated Trips Found
              </h2>
              <p className="text-xs text-ink-secondary leading-relaxed">
                You are authenticated as <strong className="text-brand-emerald">{currentUserSession.email}</strong>. This account is not yet associated with any group trips in the database.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsCreateTripOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-surface-base font-bold text-xs flex items-center justify-center gap-2 shadow-emerald transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create a New Trip</span>
              </button>

              <button
                onClick={() => setIsJoinTripOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-surface-base hover:bg-surface-elevated border border-border-default text-ink-primary font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Key className="w-4 h-4 text-brand-emerald" />
                <span>Join Trip via Invite Code</span>
              </button>
            </div>

            <div className="pt-2 border-t border-border-default/50 text-[11px] text-ink-muted">
              <span>Want to preview group reconciliation features? </span>
              <button
                onClick={() => {
                  setTrips([INITIAL_TRIP]);
                  setActiveTripId(INITIAL_TRIP.id);
                  setCurrentUserId('p1');
                }}
                className="text-brand-emerald hover:underline font-semibold cursor-pointer"
              >
                Explore Demo Trip
              </button>
            </div>
          </div>
        </main>

        <footer className="text-center py-4 text-xs text-ink-muted border-t border-border-default">
          Tulis • Deterministic Group Travel Finance Ledger
        </footer>

        <CreateTripModal
          isOpen={isCreateTripOpen}
          onClose={() => setIsCreateTripOpen(false)}
          onCreateTrip={handleCreateTrip}
          currentUser={currentUserSession}
        />
        <JoinTripModal
          isOpen={isJoinTripOpen}
          onClose={() => setIsJoinTripOpen(false)}
          onJoinTrip={handleJoinTrip}
          currentUser={currentUserSession}
        />
      </div>
    );
  }

  if (viewMode === 'corporate') {
    return (
      <div className="min-h-screen bg-[#0C110E] text-stone-100 font-sans">
        <CorporateDashboardShell
          currentUser={currentUserSession}
          currentOrg={currentCorporateOrg}
          onSwitchToSquadDashboard={() => setViewMode('app')}
          onLogout={() => {
            fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'logout' }),
            }).catch(console.error);
            setCurrentUserSession(null);
            setCurrentCorporateOrg(null);
            setViewMode('landing');
            triggerToast('Signed out of corporate session.');
          }}
          activeTrips={trips}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-base text-ink-primary font-sans">
      <DashboardShell
        trip={trip}
        participants={participants}
        currentUserId={currentUserId}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'chat') {
            setIsTripChatOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        netBalances={effectiveNetBalances}
        simplifiedDebts={effectiveSimplifiedDebts}
        eventCount={events.length}
        expensesCount={expenses.length}
        bookingsCount={bookings.length}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenTripSwitcher={() => setIsTripSwitcherOpen(true)}
        onOpenAccountSwitcher={() => setIsAccountSwitcherOpen(true)}
        onOpenShareTrip={() => setIsShareTripOpen(true)}
        onOpenAddExpense={() => setIsSplitDrawerOpen(true)}
        onOpenAddBooking={() => setIsAddBookingOpen(true)}
        onOpenChaosDemo={() => setIsChaosDemoOpen(true)}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        onOpenRoomOptimizer={() => setIsRoomOptimizerOpen(true)}
        onOpenSettlementReport={() => setIsSettlementReportOpen(true)}
        onOpenExplainBalance={(pid) => {
          setExplainParticipantId(pid);
          setIsExplainBalanceOpen(true);
        }}
        onOpenMyTrips={() => {
          if (!currentUserSession) {
            setIsAuthOpen(true);
            triggerToast('Sign in to access your cloud trips.');
          } else {
            syncUserTrips(currentUserSession, undefined, false).then(() => {
              setIsTripGatewayOpen(true);
            });
          }
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUserSession={currentUserSession}
        onGoToLanding={handleLogout}
        onOpenScanReceipt={() => setIsReceiptDropzoneOpen(true)}
        onOpenCorporateOrg={() => setViewMode('corporate')}
        onOpenGogoPlanner={() => setIsGogoInterviewOpen(true)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + trip.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && (
              <OverviewSection
                trip={trip}
                bookings={bookings}
                expenses={expenses}
                payments={payments}
                netBalances={effectiveNetBalances}
                simplifiedDebts={effectiveSimplifiedDebts}
                refunds={refunds}
                vendors={vendors}
                anomalies={activeAnomalies}
                currentUserId={currentUserId}
                onOpenAddExpense={(defaults) => {
                  if (defaults && (defaults.desc || defaults.amount || defaults.payerId)) {
                    setChatDraftExpense({
                      title: defaults.desc || 'Trip Expense',
                      totalAmount: defaults.amount ? Number(defaults.amount) : undefined,
                      paidById: defaults.payerId || currentUserId,
                      splitMethod: 'equal',
                    });
                  } else {
                    setChatDraftExpense(undefined);
                  }
                  setIsSplitDrawerOpen(true);
                }}
                onOpenAddBooking={() => setIsAddBookingOpen(true)}
                onOpenUpiSetup={() => setIsUpiSetupOpen(true)}
                onOpenVendors={() => setIsVendorsOpen(true)}
                onNavigateTab={setActiveTab}
                onDismissAnomaly={handleDismissAnomaly}
                onOpenWhatIf={() => setIsWhatIfOpen(true)}
                onOpenChaosDemo={() => setIsChaosDemoOpen(true)}
                onOpenExplainBalance={(pid) => {
                  setExplainParticipantId(pid);
                  setIsExplainBalanceOpen(true);
                }}
                onOpenRoomOptimizer={() => setIsRoomOptimizerOpen(true)}
                onOpenSettlementReport={() => setIsSettlementReportOpen(true)}
                onOpenSquadManager={() => setIsSquadManagerOpen(true)}
                onOpenGogoPlanner={() => setIsGogoInterviewOpen(true)}
                onOpenScanReceipt={() => setIsReceiptDropzoneOpen(true)}
                onToggleSafetyMode={() => {
                  setTrips((prevTrips) =>
                    prevTrips.map((t) =>
                      t.id === trip.id ? { ...t, safetyModeEnabled: !t.safetyModeEnabled } : t
                    )
                  );
                }}
              />
            )}

            {/* MERGED VIEW 1: Plan & Live Ledger (Itinerary + Expenses) */}
            {(activeTab === 'plan-ledger' || activeTab === 'itinerary' || activeTab === 'expenses') && (
              <PlanAndLedgerView
                trip={trip}
                bookings={bookings}
                expenses={expenses}
                participants={participants}
                refunds={refunds}
                currentUserId={currentUserId}
                onOpenAddBooking={() => setIsAddBookingOpen(true)}
                onOpenAddExpense={() => setIsSplitDrawerOpen(true)}
                onOpenEditBooking={(b) => {
                  setActiveBookingToEdit(b);
                  setIsEditBookingOpen(true);
                }}
                onOpenCancelBooking={(b) => {
                  setActiveBookingToCancel(b);
                  setIsCancelBookingOpen(true);
                }}
                onOpenVendors={() => setIsVendorsOpen(true)}
                onDisputeAllocation={handleDisputeAllocation}
                onResolveDispute={handleResolveDispute}
              />
            )}

            {/* MERGED VIEW 2: Squad & Settlements (Squad Roster + Settlement Graph) */}
            {(activeTab === 'squad-settlements' || activeTab === 'participants' || activeTab === 'settlement') && (
              <SquadAndSettlementsView
                participants={participants}
                netBalances={effectiveNetBalances}
                simplifiedDebts={effectiveSimplifiedDebts}
                currentUserId={currentUserId}
                payments={payments}
                onAddParticipant={handleAddParticipant}
                onToggleStatus={handleToggleParticipantStatus}
                onUpdateParticipantWeight={handleUpdateParticipantWeight}
                onSettleDebt={handleSettleDebt}
                onConfirmPaymentReceipt={handleConfirmPaymentReceipt}
                onDisputePayment={handleDisputePayment}
                isSettled={isSettled}
                isCrossTripNetting={isCrossTripNettingActive}
                onToggleCrossTripNetting={() => setIsCrossTripNettingActive(!isCrossTripNettingActive)}
                onOpenReassignDebt={(s) => {
                  setSelectedDebtToReassign(s);
                  setIsDebtReassignmentOpen(true);
                }}
                onOpenExplainBalance={(pid) => {
                  setExplainParticipantId(pid);
                  setIsExplainBalanceOpen(true);
                }}
              />
            )}

            {activeTab === 'chat' && (
              <div className="h-[calc(100vh-14rem)] max-w-4xl mx-auto">
                <TripChatPanel
                  tripId={trip.id}
                  currentUserId={currentUserId}
                  currentUserName={
                    currentUserSession?.name ||
                    participants.find((p) => p.id === currentUserId)?.name ||
                    'Traveler'
                  }
                />
              </div>
            )}

            {activeTab === 'corporate' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                <div className="p-6 rounded-3xl bg-gradient-to-r from-[#172418] to-[#121A12] border border-[#2D3F2C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                        Corporate B2B Suite
                      </span>
                      <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Travel Spends</h2>
                    </div>
                    <p className="text-xs text-stone-400 max-w-xl">
                      Automated policy enforcement, per-category daily allowances, cost center allocation, and manager approval queues.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsOrgModalOpen(true)}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                    >
                      {trip.organizationId ? 'Manage Org Policies' : 'Link Corporate Workspace'}
                    </button>
                  </div>
                </div>

                <ApprovalQueueSection
                  orgId={trip.organizationId || null}
                  currentUserId={currentUserId}
                />
              </div>
            )}

            {activeTab === 'activity' && (
              <ActivityLogSection events={events} onDeleteEvent={handleDeleteEvent} trip={trip} />
            )}
          </motion.div>
        </AnimatePresence>
      </DashboardShell>

      {/* Dynamic Split Engine Drawer with F17 Advisor & Draft Pre-fill */}
      <DynamicSplitDrawer
        isOpen={isSplitDrawerOpen}
        onClose={() => {
          setIsSplitDrawerOpen(false);
          setChatDraftExpense(undefined);
        }}
        participants={participants}
        bookings={bookings}
        initialDraft={chatDraftExpense}
        isCorporate={!!trip.organizationId}
        onSubmitExpense={handleSubmitExpense}
      />

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddBookingOpen}
        onClose={() => setIsAddBookingOpen(false)}
        participants={participants}
        onAddBooking={handleAddBooking}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelBookingOpen}
        onClose={() => {
          setIsCancelBookingOpen(false);
          setActiveBookingToCancel(null);
        }}
        booking={activeBookingToCancel}
        expenses={expenses}
        participants={participants}
        onConfirmCancel={handleConfirmCancelBooking}
      />

      {/* Edit Booking Revision Modal */}
      <EditBookingModal
        isOpen={isEditBookingOpen}
        onClose={() => {
          setIsEditBookingOpen(false);
          setActiveBookingToEdit(null);
        }}
        booking={activeBookingToEdit}
        participants={participants}
        onSaveBooking={handleSaveBooking}
      />

      {/* Multi-Vendor Management Modal */}
      <VendorSummaryModal
        isOpen={isVendorsOpen}
        onClose={() => setIsVendorsOpen(false)}
        vendors={vendors}
        bookings={bookings}
      />

      {/* Create New Trip Wizard Modal */}
      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
        onCreateTrip={handleCreateTrip}
        currentUser={currentUserSession}
      />

      {/* Join Trip via Code Modal */}
      <JoinTripModal
        isOpen={isJoinTripOpen}
        onClose={() => setIsJoinTripOpen(false)}
        onJoinTrip={handleJoinTrip}
        currentUser={currentUserSession}
      />

      {/* My Trips Switcher Drawer */}
      <TripSwitcherModal
        isOpen={isTripSwitcherOpen}
        onClose={() => setIsTripSwitcherOpen(false)}
        trips={trips}
        activeTripId={activeTripId}
        participantsMap={participantsMap}
        onSelectTrip={(id) => {
          setActiveTripId(id);
          const firstUser = participantsMap[id]?.[0]?.id;
          if (firstUser) setCurrentUserId(firstUser);
          triggerToast(`Switched active workspace to "${trips.find((t) => t.id === id)?.title}".`);
        }}
        onOpenCreateTrip={() => setIsCreateTripOpen(true)}
        onOpenJoinTrip={() => setIsJoinTripOpen(true)}
      />

      {/* Auth & Login Modal (Google OAuth & Email OTP) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSwitchToCorporate={() => {
          setIsAuthOpen(false);
          setIsCorporateAuthOpen(true);
        }}
        onAuthSuccess={async (sessionUser, needsProfileCompletion) => {
          setCurrentUserSession(sessionUser);
          setIsAuthOpen(false);
          await syncUserTrips(sessionUser, undefined, false);
          if (needsProfileCompletion || !sessionUser.profileCompleted) {
            setIsProfileCompletionOpen(true);
          } else {
            setIsTripGatewayOpen(true);
            triggerToast(`Welcome, ${sessionUser.name}! Choose how you'd like to get started.`);
          }
        }}
      />

      {/* Dedicated Corporate Enterprise Auth Modal */}
      <CorporateAuthModal
        isOpen={isCorporateAuthOpen}
        onClose={() => setIsCorporateAuthOpen(false)}
        onCorporateSuccess={(corpUser, org) => {
          setCurrentUserSession(corpUser);
          setCurrentCorporateOrg(org);
          setIsCorporateAuthOpen(false);
          setViewMode('corporate');
          triggerToast(`Welcome to ${org?.name || 'Corporate'} Travel Command Center!`);
        }}
        onSwitchToNormalLogin={() => {
          setIsCorporateAuthOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* Mandatory Onboarding Profile Completion for Google & New Users */}
      <ProfileCompletionModal
        isOpen={isProfileCompletionOpen}
        user={currentUserSession}
        onComplete={async (updatedUser) => {
          setCurrentUserSession(updatedUser);
          setIsProfileCompletionOpen(false);
          await syncUserTrips(updatedUser, undefined, false);
          setIsTripGatewayOpen(true);
          triggerToast(`Profile completed! Welcome aboard, ${updatedUser.name}.`);
        }}
        onClose={() => setIsProfileCompletionOpen(false)}
      />

      {/* Post-Login Trip Selection Gateway Hub (Create Trip, Join with Code, or Pre-Existing Trips) */}
      <TripSelectionGatewayModal
        isOpen={isTripGatewayOpen}
        user={currentUserSession}
        userTrips={userAssociatedTrips}
        onSelectTrip={async (selectedTripId) => {
          await loadTripById(selectedTripId);
          setIsTripGatewayOpen(false);
        }}
        onCreateNewTrip={() => {
          setIsTripGatewayOpen(false);
          setIsCreateTripOpen(true);
        }}
        onJoinTrip={() => {
          setIsTripGatewayOpen(false);
          setIsJoinTripOpen(true);
        }}
        onQuickJoinCode={async (code) => {
          return await handleUnlockWithCode(code);
        }}
        onLogout={handleLogout}
      />

      {/* User Cloud Trips Drawer / Modal */}
      <MyTripsModal
        isOpen={isMyTripsOpen}
        onClose={() => setIsMyTripsOpen(false)}
        currentUser={currentUserSession}
        currentTripId={activeTripId}
        onSelectTrip={async (selectedTripId) => {
          await loadTripById(selectedTripId);
          setIsMyTripsOpen(false);
        }}
        onCreateNewTrip={() => {
          setIsMyTripsOpen(false);
          setIsCreateTripOpen(true);
        }}
        onJoinTrip={() => {
          setIsMyTripsOpen(false);
          setIsJoinTripOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Private Trip Access Gate Modal */}
      <TripAccessGateModal
        isOpen={isAccessGateOpen}
        tripTitle={trip?.title}
        onUnlockWithCode={async (code) => {
          const res = await fetch(`/api/trips?inviteCode=${code}`);
          const data = await res.json();
          if (data.success && data.trip) {
            setIsAccessGateOpen(false);
            enterAppMode(data.trip.id, code);
            triggerToast(`Unlocked trip "${data.trip.title}"!`);
            return true;
          }
          return false;
        }}
        onOpenAuth={() => {
          setIsAccessGateOpen(false);
          setIsAuthOpen(true);
        }}
        onGoHome={handleLogout}
      />

      {/* Post-Login UPI VPA & QR Code Setup Modal */}
      <UpiSetupModal
        isOpen={isUpiSetupOpen}
        onClose={() => setIsUpiSetupOpen(false)}
        currentUser={currentUser}
        onSaveUpiDetails={handleSaveUpiDetails}
      />

      {/* Chaos Demo Mode Suite Modal (F7) */}
      <ChaosDemoModal
        isOpen={isChaosDemoOpen}
        onClose={() => setIsChaosDemoOpen(false)}
        currentStep={chaosStep}
        isRunning={isChaosRunning}
        onExecuteStep={handleExecuteChaosStep}
        onRunAutoSequence={handleRunAutoSequence}
        onResetDemo={handleResetChaosDemo}
      />

      {/* What-If Scenario Simulator Modal (F2) */}
      <WhatIfSimulatorModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        participants={participants}
        expenses={expenses}
        payments={payments}
        refunds={refunds}
        bookings={bookings}
      />

      {/* Explain My Balance Grounded Assistant Modal (F8) */}
      <ExplainBalanceModal
        isOpen={isExplainBalanceOpen}
        onClose={() => setIsExplainBalanceOpen(false)}
        participantId={explainParticipantId}
        participants={participants}
        expenses={expenses}
        payments={payments}
        refunds={refunds}
        bookings={bookings}
      />

      {/* Lodging & Room Optimizer Modal (F10) */}
      <RoomOptimizerModal
        isOpen={isRoomOptimizerOpen}
        onClose={() => setIsRoomOptimizerOpen(false)}
        participants={participants}
      />

      {/* Printable / Shareable Settlement Audit Report Modal (F12 & F23) */}
      <SettlementReportModal
        isOpen={isSettlementReportOpen}
        onClose={() => setIsSettlementReportOpen(false)}
        trip={trip}
        participants={participants}
        netBalances={effectiveNetBalances}
        simplifiedDebts={effectiveSimplifiedDebts}
        audit={audit}
        expenses={expenses}
        bookings={bookings}
      />

      {/* Persistent Travel Squads Modal (F11) */}
      <SquadManagerModal
        isOpen={isSquadManagerOpen}
        onClose={() => setIsSquadManagerOpen(false)}
        currentParticipants={participants}
        squads={squads}
        onSaveCurrentSquad={handleSaveCurrentSquad}
        onDeleteSquad={handleDeleteSquad}
      />

      {/* F14 & F15: Chat & Voice Expense Capture Modal */}
      <ChatExpenseModal
        isOpen={isChatExpenseOpen}
        onClose={() => setIsChatExpenseOpen(false)}
        participants={participants}
        onApplyDraft={handleApplyParsedChatDraft}
      />

      {/* F16: Duplicate Expense Guard Warning Modal */}
      <DuplicateExpenseWarningModal
        isOpen={isDuplicateWarningOpen}
        proposedExpense={pendingDuplicateData?.expenseData || null}
        existingExpense={pendingDuplicateData?.duplicateMatch?.existingExpense || null}
        similarityScore={pendingDuplicateData?.duplicateMatch?.similarityScore || 0}
        reason={pendingDuplicateData?.duplicateMatch?.reason || ''}
        onCancel={() => {
          setIsDuplicateWarningOpen(false);
          setPendingDuplicateData(null);
        }}
        onConfirmDuplicate={() => {
          if (pendingDuplicateData) {
            handleSubmitExpense({
              ...pendingDuplicateData.expenseData,
              isDuplicateAcknowledged: true,
            });
            setIsDuplicateWarningOpen(false);
            setPendingDuplicateData(null);
          }
        }}
      />

      {/* F20: Nudge & Reminder Engine Modal */}
      <NudgeReminderModal
        isOpen={isNudgeModalOpen}
        onClose={() => setIsNudgeModalOpen(false)}
        tripTitle={trip.title}
        participants={participants}
        settlements={effectiveSimplifiedDebts.map((d) => ({
          id: `settle-${d.fromId}-${d.toId}`,
          tripId: trip.id,
          fromParticipantId: d.fromId,
          toParticipantId: d.toId,
          amount: d.amount,
          status: 'unsettled',
          createdAt: new Date().toISOString(),
        }))}
        onSendNudge={handleSendNudge}
      />

      {/* F18: Debt Reassignment / IOU Transfer Modal */}
      <DebtReassignmentModal
        isOpen={isDebtReassignmentOpen}
        onClose={() => {
          setIsDebtReassignmentOpen(false);
          setSelectedDebtToReassign(null);
        }}
        participants={participants}
        settlement={selectedDebtToReassign}
        onReassignDebt={handleReassignDebt}
      />

      {/* Account Switcher Modal with Password Authentication */}
      <AccountSwitcherModal
        isOpen={isAccountSwitcherOpen}
        onClose={() => setIsAccountSwitcherOpen(false)}
        currentUserId={currentUserId}
        onSwitchUser={(newUserId) => {
          setCurrentUserId(newUserId);
          const found = DEMO_USERS.find((u) => u.id === newUserId);
          triggerToast(`Switched account to ${found?.name || newUserId}! Welcome to your dashboard.`);
        }}
      />

      {/* Share Trip & Manage Member Access Modal */}
      <ShareTripModal
        isOpen={isShareTripOpen}
        onClose={() => setIsShareTripOpen(false)}
        trip={trip}
        participants={participants}
        currentUserId={currentUserId}
        onAddParticipant={handleDirectAddParticipant}
      />

      {/* Phase 2: Women's Safety Dock (Pulsing SOS, 112 Dial, Police Finder, Audio Shield) - Opt-in only */}
      {trip.safetyModeEnabled && (
        <SafetyDock
          isActive={true}
          userId={currentUserSession?.id || currentUserId}
          tripId={trip.id}
          userName={currentUserSession?.name || participants.find((p) => p.id === currentUserId)?.name || 'Traveler'}
          userPhone={currentUserSession?.phone}
          onOpenContacts={() => setIsSafetyOnboardingOpen(true)}
        />
      )}

      {/* Safety Mode Onboarding & Contacts Configuration Screen */}
      <SafetyModeOnboardingScreen
        isOpen={isSafetyOnboardingOpen}
        userId={currentUserSession?.id || currentUserId}
        onComplete={() => setIsSafetyOnboardingOpen(false)}
        onClose={() => setIsSafetyOnboardingOpen(false)}
      />

      {/* Phase 2: Gogo Autonomous Conversational Trip Planner FAB */}
      <GogoFAB onClick={() => setIsGogoInterviewOpen(true)} />

      {/* Floating Trip Chat & AI Panel */}
      <AnimatePresence>
        {isTripChatOpen && (
          <TripChatPanel
            tripId={trip.id}
            currentUserId={currentUserId}
            currentUserName={
              currentUserSession?.name ||
              participants.find((p) => p.id === currentUserId)?.name ||
              'Traveler'
            }
            isFloating={true}
            onClose={() => setIsTripChatOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Trip Chat & AI Icon at Right Bottommost Corner */}
      <TripChatFAB
        isOpen={isTripChatOpen}
        onToggle={() => setIsTripChatOpen((prev) => !prev)}
      />

      {/* Gogo Voice & Preset Interview Modal */}
      <GogoInterviewModal
        isOpen={isGogoInterviewOpen}
        onClose={() => setIsGogoInterviewOpen(false)}
        onPlanGenerated={(plan) => {
          setGeneratedGogoPlan(plan);
          setIsGogoPreviewOpen(true);
        }}
        currentUserId={currentUserId}
      />

      {/* Gogo Itinerary Blueprint Review & 1-Click Materialize Modal */}
      <GogoPlanPreviewModal
        isOpen={isGogoPreviewOpen}
        onClose={() => setIsGogoPreviewOpen(false)}
        plan={generatedGogoPlan}
        onTripCreated={(newTrip) => {
          setTrips((prev) => [newTrip, ...prev.filter((t) => t.id !== newTrip.id)]);
          setActiveTripId(newTrip.id);
          triggerToast(`Trip "${newTrip.title}" materialized and saved to Neon DB!`);
        }}
        currentUserId={currentUserId}
      />

      {/* Phase 2: Receipt OCR Ingestion Dropzone & Camera Trigger */}
      <ReceiptUploadDropzone
        isOpen={isReceiptDropzoneOpen}
        onClose={() => setIsReceiptDropzoneOpen(false)}
        tripId={trip.id}
        onExtractionSuccess={(extracted, previewUrl) => {
          setExtractedReceiptData(extracted);
          setReceiptImagePreview(previewUrl);
          setIsReceiptReviewOpen(true);
        }}
      />

      {/* Receipt Extraction Review Modal */}
      <ReceiptExtractionReviewModal
        isOpen={isReceiptReviewOpen}
        onClose={() => setIsReceiptReviewOpen(false)}
        extractedData={extractedReceiptData}
        previewUrl={receiptImagePreview}
        onProceedToSplit={(finalData) => {
          setIsReceiptReviewOpen(false);
          setChatDraftExpense({
            title: finalData.vendor || 'Scanned Receipt',
            totalAmount: finalData.totalAmount || 0,
            category:
              finalData.category.toLowerCase().includes('dining') ||
              finalData.category.toLowerCase().includes('food')
                ? 'food'
                : 'general',
            receiptUrl: receiptImagePreview || undefined,
            receiptConfidence: finalData.confidenceScore || 0.92,
          });
          setIsSplitDrawerOpen(true);
        }}
      />

      {/* Phase 2: Corporate Organization Modal */}
      <OrgDashboardModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        currentTripId={trip.id}
        userEmail={currentUserSession?.email}
        onTripLinked={() => {
          setTrips((prev) =>
            prev.map((t) => (t.id === trip.id ? { ...t, organizationId: 'org-active' } : t))
          );
          triggerToast('Linked this trip to your corporate organization!');
        }}
      />

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface-raised text-ink-primary border border-emerald-500/40 px-5 py-3 rounded-2xl shadow-emerald flex items-center gap-3 text-xs sm:text-sm font-semibold backdrop-blur-md"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
