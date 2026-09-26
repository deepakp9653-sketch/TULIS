'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApprovalQueueSection } from './ApprovalQueueSection';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'policies' | 'departments' | 'erp'>('overview');
  const [policies, setPolicies] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Export RFC 4180 CSV for SAP / NetSuite / Concur
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

  // Mock corporate trips if none passed
  const corporateTrips = activeTrips.length > 0 ? activeTrips : [
    {
      id: 'trip-corp-1',
      title: 'Q3 Enterprise Client Summit',
      destination: 'Bangalore & Hyderabad',
      budgetCeiling: 450000,
      spent: 284000,
      employeesCount: 6,
      department: 'Sales & Solutions',
      status: 'In Progress',
      dates: 'Sep 24 - Sep 29, 2026',
    },
    {
      id: 'trip-corp-2',
      title: 'Annual Technology Hackathon & Delegation',
      destination: 'Pune & Mumbai',
      budgetCeiling: 250000,
      spent: 195000,
      employeesCount: 8,
      department: 'Engineering & R&D',
      status: 'Approved',
      dates: 'Oct 04 - Oct 08, 2026',
    },
    {
      id: 'trip-corp-3',
      title: 'Global Leadership Strategy Offsite',
      destination: 'Goa & Gokarna',
      budgetCeiling: 650000,
      spent: 420000,
      employeesCount: 5,
      department: 'Executive Leadership',
      status: 'In Progress',
      dates: 'Sep 26 - Sep 30, 2026',
    },
  ];

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
            { id: 'overview', label: 'Executive Intelligence', icon: TrendingUp },
            { id: 'approvals', label: 'Approval Queue', icon: CheckCircle2, badge: '2 Pending' },
            { id: 'policies', label: 'Expense Policy Rules', icon: ShieldCheck },
            { id: 'departments', label: 'Cost Center Budgets', icon: Layers },
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

        {/* Tab 1: Executive Intelligence */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top KPI Metrics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                  Annual Travel Ceiling
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">₹50,00,000</span>
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block font-mono">
                  Allocated across 4 Cost Centers
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                  YTD Spend Disbursed
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">₹23,45,000</span>
                  <span className="text-xs text-stone-400 font-mono">46.9%</span>
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Runway intact through Q4
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                  Per-Diem Compliance
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-teal-300">98.2%</span>
                </div>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Only 2 flagged line items
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-1">
                  Active Travelers
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-white">19 Employees</span>
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">
                  3 Corporate Trips in flight
                </span>
              </div>
            </div>

            {/* Active Business Trips Ledger */}
            <div className="rounded-3xl bg-[#111A14] border border-[#213025] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Active Corporate Business Trips</h3>
                  <p className="text-xs text-stone-400">
                    Live department delegations linked to corporate cost centers and policy rails.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400">
                  {corporateTrips.length} Active Delegations
                </span>
              </div>

              <div className="space-y-3">
                {corporateTrips.map((tr) => (
                  <div
                    key={tr.id}
                    className="p-4 rounded-2xl bg-[#16221A] border border-[#26372B] hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{tr.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                          {tr.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-400" /> {tr.destination}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" /> {tr.dates}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-stone-400" /> {tr.employeesCount} Travelers
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 sm:text-right">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-stone-400 block">
                          Disbursed Spend
                        </span>
                        <span className="text-sm font-bold font-mono text-emerald-300">
                          ₹{tr.spent.toLocaleString()} / ₹{tr.budgetCeiling.toLocaleString()}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 text-[11px] font-semibold">
                        {tr.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Approval Queue */}
        {activeTab === 'approvals' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#111A14] border border-[#213025]">
              <h3 className="font-bold text-base text-white">Corporate Travel Approval Queue</h3>
              <p className="text-xs text-stone-400">
                Line-item expenses requiring manager audit due to per-diem limit exceedance or missing tax invoice.
              </p>
            </div>

            <ApprovalQueueSection orgId={orgId} currentUserId={currentUser?.id} />
          </motion.div>
        )}

        {/* Tab 3: Policy Rules */}
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
                    Configured rules enforced across OCR receipt extraction and auto-approval engines.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  Enforced in Neon DB
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
                    rule: 'Alcohol line-items automatically separated from reimbursement claim.',
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

        {/* Tab 4: Cost Centers & Departments */}
        {activeTab === 'departments' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-[#111A14] border border-[#213025] space-y-4">
              <div>
                <h3 className="font-bold text-base text-white">Department Cost Center Budgets</h3>
                <p className="text-xs text-stone-400">
                  Annual allocations, disbursed disbursements, and remaining runway per cost center.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Engineering & Tech', code: 'CC-ENG-402', budget: 1500000, spent: 680000 },
                  { name: 'Sales & Business Dev', code: 'CC-SALES-102', budget: 2000000, spent: 1120000 },
                  { name: 'Product & Design', code: 'CC-PROD-201', budget: 800000, spent: 345000 },
                  { name: 'Executive Leadership', code: 'CC-EXEC-001', budget: 700000, spent: 200000 },
                ].map((cc, idx) => {
                  const pct = Math.round((cc.spent / cc.budget) * 100);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#16221A] border border-[#26372B] space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{cc.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400">{cc.code}</span>
                      </div>

                      <div className="flex items-baseline justify-between text-xs font-mono">
                        <span className="text-emerald-300 font-bold">₹{cc.spent.toLocaleString()}</span>
                        <span className="text-stone-400">₹{cc.budget.toLocaleString()}</span>
                      </div>

                      <div className="w-full h-2 bg-[#0E1510] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                        <span>Burn: {pct}%</span>
                        <span className="text-emerald-400">Remaining: {100 - pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 5: ERP Export */}
        {activeTab === 'erp' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-3xl bg-[#111A14] border border-[#213025] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-white">
                    RFC 4180 ERP Accounting Export
                  </h3>
                  <p className="text-xs text-stone-400">
                    Compliant transaction journal ready for ingestion into SAP Concur, Oracle NetSuite, and QuickBooks.
                  </p>
                </div>

                <button
                  onClick={handleExportRFC4180}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer self-start sm:self-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download RFC 4180 CSV</span>
                </button>
              </div>

              {/* Sample Table Preview */}
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
          </motion.div>
        )}
      </div>
    </div>
  );
};
