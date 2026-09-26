'use client';

import React from 'react';
import { Sparkles, CheckSquare, RefreshCw, Layers } from 'lucide-react';

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
    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#172318] to-[#121A12] border border-[#2B3C2A] space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">AI Discussion Catchup</span>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-400 hover:bg-[#1E2A1D] transition-colors"
            title="Refresh AI Summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        )}
      </div>

      <p className="text-xs text-stone-300 leading-relaxed">{summary}</p>

      {actionItems && actionItems.length > 0 && (
        <div className="pt-2 border-t border-[#233122] space-y-1.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Action Items Detected:</span>
          <div className="space-y-1">
            {actionItems.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-stone-300">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
