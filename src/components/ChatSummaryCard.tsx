'use client';

import React from 'react';
import { Sparkles, CheckSquare, RefreshCw } from 'lucide-react';

interface ChatSummaryCardProps {
  summary: string;
  actionItems?: string[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const ChatSummaryCard: React.FC<ChatSummaryCardProps> = ({
  summary,
  actionItems = [],
  onRefresh,
  isRefreshing,
}) => {
  if (!summary) return null;

  return (
    <div className="p-4 rounded-2xl bg-surface-inset border border-surface-hairline space-y-3 shadow-subtle neu-raised">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-ink-primary block leading-tight">
              AI Discussion Catchup
            </span>
            <span className="text-[10px] text-ink-muted font-mono">
              Auto-generated conversation highlights
            </span>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-ink-muted hover:text-brand-emerald hover:bg-surface-elevated transition-colors cursor-pointer"
            title="Refresh AI Summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand-emerald' : ''}`} />
          </button>
        )}
      </div>

      <p className="text-xs text-ink-secondary leading-relaxed bg-surface-base/60 p-3 rounded-xl border border-surface-hairline/60">
        {summary}
      </p>

      {actionItems && actionItems.length > 0 && (
        <div className="pt-2 border-t border-surface-hairline space-y-1.5">
          <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block">
            Action Items Detected ({actionItems.length})
          </span>
          <div className="space-y-1.5">
            {actionItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-ink-primary bg-surface-base/40 p-2 rounded-lg border border-surface-hairline/40"
              >
                <CheckSquare className="w-3.5 h-3.5 text-brand-emerald shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
