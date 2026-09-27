'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  Loader2,
  Check,
  X,
} from 'lucide-react';

interface ApprovalItem {
  id: string;
  expense_id: string;
  organization_id: string;
  requester_id: string;
  status: 'pending' | 'pending_tier2' | 'approved' | 'rejected';
  violation_reason: string;
  comments?: string;
  created_at: string;
  expense_title: string;
  expense_amount: number;
  expense_category: string;
  expense_cost_center?: string;
  requester_name?: string;
  requester_email?: string;
}

interface ApprovalQueueSectionProps {
  orgId: string | null;
  currentUserId?: string;
}

export const ApprovalQueueSection: React.FC<ApprovalQueueSectionProps> = ({ orgId, currentUserId }) => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  useEffect(() => {
    if (orgId) {
      fetchApprovals();
    }
  }, [orgId]);

  const fetchApprovals = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/approvals?orgId=${orgId}`);
      const data = await res.json();
      if (data.success) {
        setApprovals(data.approvals || []);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (approvalId: string, decision: 'approved' | 'rejected') => {
    setDecidingId(approvalId);
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decide',
          approvalId,
          decision,
          userId: currentUserId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setApprovals((prev) =>
          prev.map((item) => (item.id === approvalId ? { ...item, status: decision } : item))
        );
      } else {
        alert(data.error || 'Failed to update approval status');
      }
    } catch (err) {
      console.error('Decision error:', err);
    } finally {
      setDecidingId(null);
    }
  };

  const filteredApprovals = approvals.filter((item) => {
    if (filter === 'pending') return item.status === 'pending' || item.status === 'pending_tier2';
    return true;
  });

  const pendingCount = approvals.filter((item) => item.status === 'pending' || item.status === 'pending_tier2').length;

  if (!orgId) {
    return (
      <div className="p-8 rounded-3xl bg-[#121812] border border-[#243323] text-center space-y-2">
        <ShieldAlert className="w-8 h-8 text-stone-500 mx-auto" />
        <h4 className="text-sm font-semibold text-stone-300">Corporate Approvals Inactive</h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Link this trip to your corporate organization workspace to enforce manager approval routing and spend caps.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">Manager Approval Queue</h3>
          {pendingCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141B14] border border-[#263525] text-xs">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'pending'
                ? 'bg-[#223021] text-emerald-400 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              filter === 'all' ? 'bg-[#223021] text-emerald-400 shadow' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All History
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-xs text-stone-400">Loading pending requests...</span>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#111711] border border-[#222F22] text-center space-y-1">
          <CheckCircle2 className="w-7 h-7 text-emerald-500/60 mx-auto" />
          <h4 className="text-xs font-semibold text-stone-300">All expenses compliant</h4>
          <p className="text-[11px] text-stone-500">No pending manager approvals in this queue.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApprovals.map((item) => {
            const isPending = item.status === 'pending';
            const isDeciding = decidingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#141C14] border border-[#283827] hover:border-[#384C36] transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{item.expense_title}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1F2C1E] text-stone-300 border border-[#2F422E]">
                        {item.expense_category}
                      </span>
                      {item.expense_cost_center && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-900 text-stone-400 border border-stone-800">
                          {item.expense_cost_center}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-400 flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-stone-500" />
                      <span>{item.requester_name || item.requester_email || 'Employee'}</span>
                      <span>•</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      ₹{Number(item.expense_amount)?.toLocaleString('en-IN')}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        item.status === 'approved'
                          ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
                          : item.status === 'rejected'
                          ? 'bg-rose-950/60 text-rose-400 border-rose-800/40'
                          : item.status === 'pending_tier2'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800/50'
                          : 'bg-amber-950/60 text-amber-400 border-amber-800/40'
                      }`}
                    >
                      {item.status === 'pending_tier2' ? 'Tier-2 Clearance Req.' : item.status}
                    </span>
                  </div>
                </div>

                {/* Violation Reason Box */}
                {item.violation_reason && (
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/40 flex items-start gap-2 text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item.violation_reason}</span>
                  </div>
                )}

                {/* Actions (if pending) */}
                {isPending && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#222E21]">
                    <button
                      type="button"
                      onClick={() => handleDecision(item.id, 'rejected')}
                      disabled={isDeciding}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-xs font-semibold text-rose-300 flex items-center gap-1.5 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision(item.id, 'approved')}
                      disabled={isDeciding}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/50 transition-all"
                    >
                      {isDeciding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {item.status === 'pending_tier2'
                          ? 'Clear Tier-2 Director Approval'
                          : Number(item.expense_amount) >= 20000
                          ? 'Approve (Routes Tier-2)'
                          : 'Approve Spend'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
