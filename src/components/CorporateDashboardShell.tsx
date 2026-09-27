'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  DollarSign,
  Receipt,
  Download,
  LogOut,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  Check,
  X,
  RefreshCw,
  Plus,
  Sliders,
  ShieldAlert,
  FileText,
  Compass,
  Info,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApprovalQueueSection } from './ApprovalQueueSection';
import { OrgPortfolioDashboard } from './OrgPortfolioDashboard';
import { DepartmentSpendView } from './DepartmentSpendView';
import { DutyOfCareDashboard } from './DutyOfCareDashboard';
import { DocumentExpiryTracker } from './DocumentExpiryTracker';
import { BulkBookingWizard } from './BulkBookingWizard';
import { HeadlessApiDocsModal } from './HeadlessApiDocsModal';
import { generateGSTBreakdownJournalCSV } from '@/lib/ledger-engine';
import { Trip, Booking, Expense, Participant } from '@/lib/types';

interface CorporateDashboardShellProps {
  currentUser: any;
  currentOrg: any;
  onSwitchToSquadDashboard: () => void;
  onLogout: () => void;
  activeTrips?: any[];
}

export const CorporateDashboardShell: React.FC<CorporateDashboardShellProps> = ({
  currentUser,
  currentOrg,
  onSwitchToSquadDashboard,
  onLogout,
  activeTrips = [],
}) => {
  const [activeTab, setActiveTab] = useState<
    'portfolio' | 'approvals' | 'departments' | 'duty_of_care' | 'documents' | 'policies' | 'erp'
  >('portfolio');
  const [policies, setPolicies] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBulkWizardOpen, setIsBulkWizardOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [customTrips, setCustomTrips] = useState<Trip[]>([]);

  const orgId = currentOrg?.id || currentUser?.organizationId || 'org-demo-hackcelestial';
  const orgName = currentOrg?.name || currentUser?.organizationName || 'Acme Global Corp';
  const orgDomain = currentOrg?.domain || currentUser?.organizationDomain || 'acmeglobal.com';
  const costCenter = currentUser?.costCenter || currentUser?.department || 'CC-GLOBAL-801';
  const userRole = currentUser?.role === 'corporate_manager' ? 'Travel Director / Approver' : 'Business Traveler';

  useEffect(() => {
    fetchOrgDetails();
  }, [orgId]);

  const fetchOrgDetails = async () => {
    setIsLoadingOrg(true);
    try {
      const res = await fetch(`/api/org?orgId=${encodeURIComponent(orgId)}`);
      const data = await res.json();
      if (data.success) {
        setPolicies(data.policies || []);
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Failed to fetch org details:', err);
    } finally {
      setIsLoadingOrg(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Export RFC 4180 CSV for SAP / NetSuite / Concur (FC.1)
  const handleExportRFC4180 = () => {
    const headers = [
      'Transaction_ID',
      'Posting_Date',
      'Cost_Center',
      'GL_Account_Code',
      'Employee_Name',
      'Employee_Email',
      'Expense_Category',
      'Merchant_Vendor',
      'Amount_INR',
      'Tax_GST_INR',
      'Policy_Compliance',
      'Manager_Approval_Status',
      'Audit_Hash',
    ];

    const sampleRows = [
      [
        'TX-2026-0901',
        '2026-09-24',
        costCenter,
        'GL-6200-TRAVEL',
        currentUser?.name || 'Alex Chen',
        currentUser?.email || 'alex.chen@deloitte.com',
        'Accommodation',
        'Taj Lake Palace Luxury Suite',
        '18500.00',
        '3330.00',
        'Exception Approved',
        'Approved',
        '0x7F9B88E31A',
      ],
      [
        'TX-2026-0902',
        '2026-09-25',
        costCenter,
        'GL-6210-AIRFARE',
        currentUser?.name || 'Alex Chen',
        currentUser?.email || 'alex.chen@deloitte.com',
        'Transportation',
        'Air India Business Flight AI-842',
        '24500.00',
        '2940.00',
        'Within Policy',
        'Auto-Approved',
        '0x2A1C94B80F',
      ],
      [
        'TX-2026-0903',
        '2026-09-26',
        costCenter,
        'GL-6220-MEALS',
        'Rachel Adams',
        'rachel.adams@acmecorp.com',
        'Food & Dining',
        'Chokhi Dhani Ethnic Dinner',
        '3800.00',
        '190.00',
        'Within Policy',
        'Approved',
        '0x5E8B19D42C',
      ],
      [
        'TX-2026-0904',
        '2026-09-26',
        'CC-ENG-402',
        'GL-6230-CAB',
        'Priya Sharma',
        'priya.sharma@technova.io',
        'Transportation',
        'Uber Intercity Airport Express',
        '2450.00',
        '122.50',
        'Within Policy',
        'Auto-Approved',
        '0x9C3F45E11D',
      ],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${orgDomain.replace(/[^a-zA-Z0-9]/g, '_')}_SAP_RFC4180_Ledger_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('RFC 4180 ERP CSV export generated and downloaded!');
  };

  // FC.9: Export Tax Breakdown Journal (India GST / HSN / SAC Estimates)
  const handleExportGSTJournal = () => {
    const currentTrip = allCorporateTrips[0] || {
      id: 'trip-corp-1',
      title: `${orgName} Consolidated Travel`,
      destination: 'India',
      baseCurrency: 'INR',
      startDate: '2026-09-24',
      endDate: '2026-09-30',
      budgetCeiling: 1000000,
      inviteCode: 'CORP2026',
      organizerId: currentUser?.id || 'u-corp-dir',
      createdAt: '2026-09-20',
    };
    const allParticipants = Object.values(participantsMap).flat();
    const allBookings = Object.values(bookingsMap).flat();
    const csvContent = generateGSTBreakdownJournalCSV(
      currentTrip,
      allParticipants,
      corporateExpenses,
      allBookings
    );

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `${orgDomain.replace(/[^a-zA-Z0-9]/g, '_')}_GST_Breakdown_Journal_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('India GST / HSN / SAC Breakdown Journal CSV downloaded!');
  };

  // Default corporate trips data
  const baseCorporateTrips: Trip[] = useMemo(() => [
    {
      id: 'trip-corp-1',
      title: 'Q3 Enterprise Client Summit',
      destination: 'Bangalore & Hyderabad',
      baseCurrency: 'INR',
      startDate: '2026-09-24',
      endDate: '2026-09-29',
      budgetCeiling: 450000,
      inviteCode: 'BLR2026',
      organizerId: 'u-corp-dir',
      createdAt: '2026-09-20',
      costCenter: 'CC-SALES-102',
      department: 'Sales & Solutions',
      status: 'In Progress',
    },
    {
      id: 'trip-corp-2',
      title: 'Annual Technology Hackathon & Delegation',
      destination: 'Pune & Mumbai',
      baseCurrency: 'INR',
      startDate: '2026-10-04',
      endDate: '2026-10-08',
      budgetCeiling: 250000,
      inviteCode: 'PUN2026',
      organizerId: 'u-corp-dir',
      createdAt: '2026-09-21',
      costCenter: 'CC-ENG-402',
      department: 'Engineering & R&D',
      status: 'Approved',
    },
    {
      id: 'trip-corp-3',
      title: 'Global Leadership Strategy Offsite',
      destination: 'Goa & Gokarna',
      baseCurrency: 'INR',
      startDate: '2026-09-26',
      endDate: '2026-09-30',
      budgetCeiling: 650000,
      inviteCode: 'GOA2026',
      organizerId: 'u-corp-dir',
      createdAt: '2026-09-22',
      costCenter: 'CC-EXEC-001',
      department: 'Executive Leadership',
      status: 'In Progress',
    },
  ], []);

  const allCorporateTrips: Trip[] = useMemo(() => {
    return [...customTrips, ...(activeTrips.length > 0 ? activeTrips : baseCorporateTrips)];
  }, [customTrips, activeTrips, baseCorporateTrips]);

  // Mock participants mapped by trip
  const participantsMap: Record<string, Participant[]> = useMemo(() => ({
    'trip-corp-1': [
      {
        id: 'p-corp-1',
        tripId: 'trip-corp-1',
        name: currentUser?.name || 'Alex Chen',
        email: currentUser?.email || 'alex.chen@deloitte.com',
        avatarUrl: '',
        isOrganizer: true,
        status: 'active',
        upiId: 'alex@okhdfc',
        safetyMode: true,
        lastPing: '2 mins ago',
      } as any,
      {
        id: 'p-corp-2',
        tripId: 'trip-corp-1',
        name: 'Rachel Adams',
        email: 'rachel.adams@acmecorp.com',
        avatarUrl: '',
        isOrganizer: false,
        status: 'active',
        upiId: 'rachel@okicici',
        safetyMode: true,
        lastPing: '15 mins ago',
      } as any,
      {
        id: 'p-corp-3',
        tripId: 'trip-corp-1',
        name: 'Vikram Patel',
        email: 'vikram.patel@acmecorp.com',
        avatarUrl: '',
        isOrganizer: false,
        status: 'active',
        upiId: 'vikram@oksbi',
        safetyMode: false,
      } as any,
    ],
    'trip-corp-2': [
      {
        id: 'p-corp-4',
        tripId: 'trip-corp-2',
        name: 'Priya Sharma',
        email: 'priya.sharma@technova.io',
        avatarUrl: '',
        isOrganizer: true,
        status: 'active',
        safetyMode: true,
        lastPing: 'Just now',
      } as any,
      {
        id: 'p-corp-5',
        tripId: 'trip-corp-2',
        name: 'Arjun Nair',
        email: 'arjun.nair@technova.io',
        avatarUrl: '',
        isOrganizer: false,
        status: 'active',
        safetyMode: false,
      } as any,
    ],
    'trip-corp-3': [
      {
        id: 'p-corp-6',
        tripId: 'trip-corp-3',
        name: 'Sameer Sen',
        email: 'sameer.sen@acmecorp.com',
        avatarUrl: '',
        isOrganizer: true,
        status: 'active',
        safetyMode: true,
        lastPing: '45 mins ago',
      } as any,
    ],
  }), [currentUser]);

  // Mock corporate expenses
  const corporateExpenses: Expense[] = useMemo(() => [
    {
      id: 'exp-corp-1',
      tripId: 'trip-corp-1',
      title: 'Taj West End Executive Suite Block',
      totalAmount: 185000,
      currency: 'INR',
      splitMethod: 'equal',
      paidById: 'p-corp-1',
      category: 'lodging',
      createdAt: '2026-09-24T10:00:00Z',
      allocations: [],
      costCenter: 'CC-SALES-102',
    } as any,
    {
      id: 'exp-corp-2',
      tripId: 'trip-corp-1',
      title: 'Air India Business Group Flight AI-502',
      totalAmount: 98000,
      currency: 'INR',
      splitMethod: 'equal',
      paidById: 'p-corp-1',
      category: 'transport',
      createdAt: '2026-09-24T14:30:00Z',
      allocations: [],
      costCenter: 'CC-SALES-102',
    } as any,
    {
      id: 'exp-corp-3',
      tripId: 'trip-corp-2',
      title: 'The Orchid Hotel R&D Team Stay',
      totalAmount: 120000,
      currency: 'INR',
      splitMethod: 'equal',
      paidById: 'p-corp-4',
      category: 'lodging',
      createdAt: '2026-09-25T09:00:00Z',
      allocations: [],
      costCenter: 'CC-ENG-402',
    } as any,
    {
      id: 'exp-corp-4',
      tripId: 'trip-corp-2',
      title: 'Server Hardware Onsite Rental & Demo Kits',
      totalAmount: 75000,
      currency: 'INR',
      splitMethod: 'equal',
      paidById: 'p-corp-4',
      category: 'activity',
      createdAt: '2026-09-25T11:00:00Z',
      allocations: [],
      costCenter: 'CC-ENG-402',
    } as any,
    {
      id: 'exp-corp-5',
      tripId: 'trip-corp-3',
      title: 'Taj Exotica Goa Executive Boardroom & Stay',
      totalAmount: 340000,
      currency: 'INR',
      splitMethod: 'equal',
      paidById: 'p-corp-6',
      category: 'lodging',
      createdAt: '2026-09-26T12:00:00Z',
      allocations: [],
      costCenter: 'CC-EXEC-001',
    } as any,
    {
      id: 'exp-corp-6',
      tripId: 'trip-corp-3',
      title: 'Private Chauffeur Airport Shuttle Transfer',
      totalAmount: 22000,
      currency: 'INR',
      splitMethod: 'equal',
      paidById: 'p-corp-6',
      category: 'transport',
      createdAt: '2026-09-26T16:00:00Z',
      allocations: [],
      costCenter: 'CC-EXEC-001',
    } as any,
  ], []);

  const expensesMap: Record<string, Expense[]> = useMemo(() => {
    const map: Record<string, Expense[]> = {};
    corporateExpenses.forEach((exp) => {
      if (!map[exp.tripId]) map[exp.tripId] = [];
      map[exp.tripId].push(exp);
    });
    return map;
  }, [corporateExpenses]);

  // Bookings map
  const bookingsMap: Record<string, Booking[]> = useMemo(() => ({
    'trip-corp-1': [
      {
        id: 'bk-corp-1',
        tripId: 'trip-corp-1',
        category: 'lodging',
        title: 'Taj West End Executive Suite Block',
        vendor: 'Taj Hotels',
        startTime: '2026-09-24',
        endTime: '2026-09-29',
        estimatedCost: 185000,
        actualCost: 185000,
        status: 'confirmed',
        confirmationCode: 'TAJ-BLR-892',
        participantIds: ['p-corp-1', 'p-corp-2', 'p-corp-3'],
      },
    ],
    'trip-corp-2': [
      {
        id: 'bk-corp-2',
        tripId: 'trip-corp-2',
        category: 'lodging',
        title: 'The Orchid Hotel R&D Team Stay',
        vendor: 'The Orchid Hotel',
        startTime: '2026-10-04',
        endTime: '2026-10-08',
        estimatedCost: 120000,
        actualCost: 120000,
        status: 'confirmed',
        confirmationCode: 'ORC-PUN-331',
        participantIds: ['p-corp-4', 'p-corp-5'],
      },
    ],
  }), []);

  const handleBulkBookingSuccess = (newTripData: any) => {
    if (newTripData?.trip) {
      setCustomTrips((prev) => [newTripData.trip, ...prev]);
    }
    showToast(`Consolidated corporate trip "${newTripData?.trip?.title || 'Delegation'}" created successfully!`);
    setActiveTab('portfolio');
  };

  return (
    <div className="min-h-screen bg-[#0C110E] text-stone-100 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs font-semibold shadow-2xl flex items-center gap-2 backdrop-blur-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corporate Top Command Header */}
      <header className="border-b border-[#1E2C22] bg-[#0F1712]/90 backdrop-blur-xl sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white tracking-tight">
                {orgName}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 uppercase font-semibold">
                Enterprise Suite
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="font-mono text-emerald-400">{orgDomain}</span>
              <span>•</span>
              <span className="font-mono">{costCenter}</span>
              <span>•</span>
              <span className="text-stone-300 font-medium">{userRole}</span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* FC.8: Consolidated Bulk Booking Wizard Trigger */}
          <button
            onClick={() => setIsBulkWizardOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
            title="Consolidated Multi-Employee Trip Booking (FC.8)"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bulk Booking</span>
          </button>

          {/* FC.1: RFC 4180 ERP Export */}
          <button
            onClick={handleExportRFC4180}
            className="px-3.5 py-2 rounded-xl bg-[#142219] hover:bg-[#1A2E22] border border-[#2B4333] hover:border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="Download RFC 4180 Compliant CSV for SAP / NetSuite"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export ERP CSV</span>
          </button>

          <button
            onClick={onSwitchToSquadDashboard}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Switch to personal casual squad travel dashboard"
          >
            <span>🌴 Squad Trips</span>
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all cursor-pointer"
            title="Sign out of Corporate Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Corporate Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Tabs Pill Bar */}
        <div className="flex items-center gap-1 p-1 bg-[#111A14] border border-[#213025] rounded-2xl overflow-x-auto scrollbar-none text-xs font-medium">
          {[
            { id: 'portfolio', label: 'Portfolio & Intelligence', icon: TrendingUp },
            { id: 'approvals', label: 'Approval Queue', icon: CheckCircle2, badge: '2 Pending' },
            { id: 'departments', label: 'Department Spend', icon: Layers },
            { id: 'duty_of_care', label: 'Duty of Care', icon: ShieldAlert, badge: 'Live Pings' },
            { id: 'documents', label: 'Compliance & Expiry', icon: FileText },
            { id: 'policies', label: 'Expense Policy Rules', icon: ShieldCheck },
            { id: 'erp', label: 'SAP / ERP GL Export', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50'
                    : 'text-stone-400 hover:text-white hover:bg-[#18251C]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800/40">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: FC.3 Central Travel-Desk Portfolio Dashboard */}
        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <OrgPortfolioDashboard
              orgName={orgName}
              trips={allCorporateTrips}
              expensesMap={expensesMap}
              bookingsMap={bookingsMap}
              participantsMap={participantsMap}
              pendingApprovalsCount={2}
              onCreateBulkBooking={() => setIsBulkWizardOpen(true)}
              onExportRFC4180={handleExportRFC4180}
            />
          </motion.div>
        )}

        {/* TAB 2: FC.2 Multi-Level Approval Queue */}
        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025]">
              <h3 className="font-bold text-base text-white">Corporate Travel Approval Queue</h3>
              <p className="text-xs text-stone-400">
                Line-item expenses requiring manager or director sign-off (Tier-1 Manager &lt; ₹15k, Tier-2 Director &ge; ₹15k).
              </p>
            </div>

            <ApprovalQueueSection orgId={orgId} currentUserId={currentUser?.id} />
          </motion.div>
        )}

        {/* TAB 3: FC.4 Real-Time Department Spend Dashboard */}
        {activeTab === 'departments' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DepartmentSpendView expenses={corporateExpenses} />
          </motion.div>
        )}

        {/* TAB 4: FC.6 Duty-of-Care Dashboard */}
        {activeTab === 'duty_of_care' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DutyOfCareDashboard
              orgName={orgName}
              trips={allCorporateTrips}
              participantsMap={participantsMap}
            />
          </motion.div>
        )}

        {/* TAB 5: FC.7 Document & Compliance Expiry Tracking */}
        {activeTab === 'documents' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <DocumentExpiryTracker />
          </motion.div>
        )}

        {/* TAB 6: Policy Rules & Per-Diem (FC.1, FC.5) */}
        {activeTab === 'policies' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-[#111A14] border border-[#213025] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Enterprise Expense Policy Matrix</h3>
                  <p className="text-xs text-stone-400">
                    Configured rules enforced across OCR receipt extraction, per-diem allowances, and auto-approval engines.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    category: 'Accommodation & Lodging',
                    dailyCap: '₹12,000 / night',
                    autoApproval: 'Up to ₹7,000',
                    requiresReceipt: true,
                    rule: 'Max 4-star standard room. 5-star requires VP Finance approval.',
                  },
                  {
                    category: 'Food & Dining Allowance',
                    dailyCap: '₹4,500 / day',
                    autoApproval: 'Up to ₹2,000',
                    requiresReceipt: true,
                    rule: 'Alcohol line-items automatically separated from reimbursement claim per FC.5.',
                  },
                  {
                    category: 'Transportation & Cabs',
                    dailyCap: '₹3,500 / day',
                    autoApproval: 'Up to ₹1,500',
                    requiresReceipt: true,
                    rule: 'Uber/Ola Premier or Airport Express. Rental cars require manager sign-off.',
                  },
                  {
                    category: 'Flight & Rail Travel',
                    dailyCap: '₹25,000 / leg',
                    autoApproval: 'Up to ₹15,000',
                    requiresReceipt: true,
                    rule: 'Economy class for flights under 6 hours. Business class for international only.',
                  },
                ].map((pol, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#16221A] border border-[#26372B] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{pol.category}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-mono">Daily Cap</span>
                        <span className="font-semibold text-emerald-300 font-mono">{pol.dailyCap}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block font-mono">Auto-Approval</span>
                        <span className="font-semibold text-teal-300 font-mono">{pol.autoApproval}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-stone-400 pt-1 border-t border-[#233327]">
                      {pol.rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 7: ERP Export */}
        {activeTab === 'erp' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User-Approved FC.9 Tax Disclaimer Banner */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3 text-xs text-amber-200/90 shadow-sm">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-amber-300">Statutory Tax & Record-Keeping Notice</div>
                <p className="leading-relaxed text-amber-200/80">
                  Tax Breakdown Journal (India GST / HSN / SAC Estimates) — Generated for expense record-keeping; consult a certified tax professional for official filing.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#111A14] border border-[#213025] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-white">
                    ERP Accounting & Tax Journals
                  </h3>
                  <p className="text-xs text-stone-400">
                    Compliant transaction journal ready for ingestion into SAP Concur, Oracle NetSuite, and India GST record-keeping systems.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                  <button
                    onClick={() => setIsApiDocsOpen(true)}
                    className="px-4 py-2.5 rounded-2xl bg-[#16221A] hover:bg-[#203025] text-cyan-400 border border-cyan-500/40 font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Headless API Sandbox</span>
                  </button>

                  <button
                    onClick={handleExportGSTJournal}
                    className="px-4 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-950/40 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Download GST Breakdown Journal</span>
                  </button>

                  <button
                    onClick={handleExportRFC4180}
                    className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download RFC 4180 CSV</span>
                  </button>
                </div>
              </div>

              {/* Sample Table Preview: Standard ERP */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300">SAP / NetSuite General Ledger Feed</span>
                  <span className="text-[10px] font-mono text-emerald-400">RFC 4180 Specification</span>
                </div>
                <div className="border border-[#26372B] rounded-2xl overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-[#16221A] text-stone-400 text-[11px] border-b border-[#26372B]">
                      <tr>
                        <th className="p-3">Tx ID</th>
                        <th className="p-3">Cost Center</th>
                        <th className="p-3">GL Code</th>
                        <th className="p-3">Employee</th>
                        <th className="p-3">Vendor</th>
                        <th className="p-3">Amount (INR)</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#213025] text-stone-300">
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">TX-2026-0901</td>
                        <td className="p-3">{costCenter}</td>
                        <td className="p-3">GL-6200-TRAVEL</td>
                        <td className="p-3">{currentUser?.name || 'Alex Chen'}</td>
                        <td className="p-3">Taj Lake Palace Luxury Suite</td>
                        <td className="p-3 text-white font-bold">₹18,500.00</td>
                        <td className="p-3 text-emerald-400">Approved</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">TX-2026-0902</td>
                        <td className="p-3">{costCenter}</td>
                        <td className="p-3">GL-6210-AIRFARE</td>
                        <td className="p-3">{currentUser?.name || 'Alex Chen'}</td>
                        <td className="p-3">Air India Business Flight AI-842</td>
                        <td className="p-3 text-white font-bold">₹24,500.00</td>
                        <td className="p-3 text-teal-400">Auto-Approved</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">TX-2026-0903</td>
                        <td className="p-3">{costCenter}</td>
                        <td className="p-3">GL-6220-MEALS</td>
                        <td className="p-3">Rachel Adams</td>
                        <td className="p-3">Chokhi Dhani Ethnic Dinner</td>
                        <td className="p-3 text-white font-bold">₹3,800.00</td>
                        <td className="p-3 text-emerald-400">Approved</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sample Table Preview: GST / HSN / SAC Journal */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-300">India GST & HSN/SAC Breakdown Preview</span>
                  <span className="text-[10px] font-mono text-teal-400">Estimates for Record-Keeping</span>
                </div>
                <div className="border border-[#26372B] rounded-2xl overflow-x-auto text-xs font-mono">
                  <table className="w-full text-left">
                    <thead className="bg-[#16221A] text-stone-400 text-[11px] border-b border-[#26372B]">
                      <tr>
                        <th className="p-3">Expense / Vendor</th>
                        <th className="p-3">HSN / SAC</th>
                        <th className="p-3">Taxable Base</th>
                        <th className="p-3">CGST</th>
                        <th className="p-3">SGST</th>
                        <th className="p-3">Total (INR)</th>
                        <th className="p-3">ITC Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#213025] text-stone-300">
                      <tr>
                        <td className="p-3 text-white font-semibold">Taj West End Suite Block</td>
                        <td className="p-3 text-stone-400">996331 (Lodging)</td>
                        <td className="p-3">₹156,779.66</td>
                        <td className="p-3 text-teal-400">9% (₹14,110.17)</td>
                        <td className="p-3 text-teal-400">9% (₹14,110.17)</td>
                        <td className="p-3 text-emerald-400 font-bold">₹185,000.00</td>
                        <td className="p-3 text-emerald-400">Eligible</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-semibold">Air India Business Flight AI-502</td>
                        <td className="p-3 text-stone-400">996411 (Passenger)</td>
                        <td className="p-3">₹93,333.33</td>
                        <td className="p-3 text-teal-400">2.5% (₹2,333.33)</td>
                        <td className="p-3 text-teal-400">2.5% (₹2,333.33)</td>
                        <td className="p-3 text-emerald-400 font-bold">₹98,000.00</td>
                        <td className="p-3 text-amber-300">Composite Rate</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-white font-semibold">Server Hardware Onsite Rental</td>
                        <td className="p-3 text-stone-400">998311 (IT Services)</td>
                        <td className="p-3">₹63,559.32</td>
                        <td className="p-3 text-teal-400">9% (₹5,720.34)</td>
                        <td className="p-3 text-teal-400">9% (₹5,720.34)</td>
                        <td className="p-3 text-emerald-400 font-bold">₹75,000.00</td>
                        <td className="p-3 text-emerald-400">Eligible</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* FC.8 Consolidated Multi-Employee Booking Wizard Modal */}
      <BulkBookingWizard
        isOpen={isBulkWizardOpen}
        onClose={() => setIsBulkWizardOpen(false)}
        onSuccess={handleBulkBookingSuccess}
        defaultCostCenter={costCenter}
        orgName={orgName}
      />

      {/* F-M3: Headless Travel Ledger API Explorer Modal */}
      <HeadlessApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />
    </div>
  );
};
