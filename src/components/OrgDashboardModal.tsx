'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  DollarSign,
  Briefcase,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  Link as LinkIcon,
  ChevronRight,
  Loader2,
  Save,
} from 'lucide-react';

interface OrgDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTripId: string;
  userEmail?: string;
  onTripLinked?: () => void;
}

export const OrgDashboardModal: React.FC<OrgDashboardModalProps> = ({
  isOpen,
  onClose,
  currentTripId,
  userEmail,
  onTripLinked,
}) => {
  const [activeTab, setActiveTab] = useState<'workspace' | 'policies' | 'members'>('workspace');
  const [orgData, setOrgData] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Creation form state
  const [isCreating, setIsCreating] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgDomain, setOrgDomain] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrgDetails();
    }
  }, [isOpen, userEmail]);

  const fetchOrgDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org?email=${encodeURIComponent(userEmail || '')}`);
      const data = await res.json();
      if (data.success && data.organization) {
        setOrgData(data.organization);
        setMembers(data.members || []);
        setPolicies(data.policies || []);
      } else {
        setOrgData(null);
        // Pre-fill domain guess if corporate email
        if (userEmail && userEmail.includes('@')) {
          const parts = userEmail.split('@');
          if (!['gmail.com', 'yahoo.com', 'outlook.com'].includes(parts[1])) {
            setOrgDomain(parts[1]);
            setOrgName(parts[1].split('.')[0].toUpperCase() + ' Corp');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching org:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgDomain.trim()) return;

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-org',
          name: orgName.trim(),
          domain: orgDomain.trim(),
          email: userEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreating(false);
        fetchOrgDetails();
      } else {
        setStatusMsg(data.error || 'Failed to create organization');
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Error creating organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkTrip = async () => {
    if (!orgData?.id || !currentTripId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'link-trip',
          tripId: currentTripId,
          orgId: orgData.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('This trip is now linked to your Corporate Organization workspace!');
        onTripLinked?.();
      }
    } catch (err) {
      console.error('Failed to link trip:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl shadow-2xl shadow-emerald-950/50 text-stone-100 flex flex-col overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#283526] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Corporate B2B Workspace</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                  Enterprise Spends
                </span>
              </div>
              <p className="text-xs text-stone-400">Expense caps, cost centers & manager approval routing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-xs text-stone-400">Loading corporate credentials...</p>
            </div>
          ) : !orgData && !isCreating ? (
            /* Empty state: Prompt to register or join */
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#1B261A] border border-[#2D3F2B] flex items-center justify-center text-emerald-400 shadow-xl">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-lg font-bold text-white">No Corporate Workspace Linked</h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Unlock cost center tagging, corporate spending caps, and automated manager approvals for your business
                  trips.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Corporate Workspace</span>
              </button>
            </div>
          ) : isCreating ? (
            /* Creation Form */
            <form onSubmit={handleCreateOrg} className="space-y-4 max-w-md mx-auto py-2">
              <div className="text-center space-y-1 pb-2">
                <h3 className="text-base font-bold text-white">Register Organization</h3>
                <p className="text-xs text-stone-400">Team members with this email domain will auto-join</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Company Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Technologies India"
                  className="w-full bg-[#111711] border border-[#273626] rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-300">Corporate Email Domain</label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={(e) => setOrgDomain(e.target.value)}
                  placeholder="e.g. acme.com"
                  className="w-full bg-[#111711] border border-[#273626] rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              {statusMsg && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{statusMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Register & Initialize Policies</span>
                </button>
              </div>
            </form>
          ) : (
            /* Active Org Workspace Dashboard */
            <div className="space-y-6">
              {/* Top Summary Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#172418] to-[#121A12] border border-[#2D3F2C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{orgData.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#212E20] text-emerald-400 border border-[#314430]">
                      @{orgData.domain}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    Your Role: <strong className="text-emerald-400 uppercase">{orgData.userRole || 'Admin'}</strong> •
                    Cost Center:{' '}
                    <strong className="text-stone-300">{orgData.userCostCenter || 'Leadership'}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLinkTrip}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#202E1F] hover:bg-[#283B27] border border-[#3A4F39] text-xs font-semibold text-emerald-300 transition-all shrink-0"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Link Active Trip</span>
                </button>
              </div>

              {/* Sub-tabs */}
              <div className="flex border-b border-[#232F22] gap-6 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('workspace')}
                  className={`pb-2.5 transition-all ${
                    activeTab === 'workspace'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Spend Policies & Caps
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`pb-2.5 transition-all ${
                    activeTab === 'members'
                      ? 'text-emerald-400 border-b-2 border-emerald-400'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  Employees ({members.length})
                </button>
              </div>

              {/* Tab 1: Policies */}
              {activeTab === 'workspace' && (
                <div className="space-y-3">
                  <div className="text-xs text-stone-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Expenses exceeding these caps trigger mandatory manager review</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {policies.length > 0 ? (
                      policies.map((p) => (
                        <div
                          key={p.id}
                          className="p-3.5 rounded-2xl bg-[#131913] border border-[#233022] space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">{p.category}</span>
                            <span className="font-mono text-emerald-400 font-bold">
                              ₹{Number(p.daily_cap)?.toLocaleString('en-IN')}/day
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400 flex items-center justify-between pt-1 border-t border-[#1F291E]">
                            <span>Auto-Approve Limit:</span>
                            <span className="font-mono text-stone-300">
                              ₹{Number(p.auto_approval_threshold)?.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="text-[10px] text-stone-500">
                            {p.requires_receipt ? '✓ Verified bill photo required' : 'Receipt optional'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500">No custom policies configured.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Members */}
              {activeTab === 'members' && (
                <div className="space-y-2">
                  {members.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-[#131913] border border-[#233022] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-white">{m.email}</div>
                        <div className="text-[11px] text-stone-400">Cost Center: {m.cost_center || 'Engineering'}</div>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-[#1F2C1E] text-emerald-400 border border-[#2F422E]">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
