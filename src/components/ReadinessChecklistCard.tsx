'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ClipboardList,
  PartyPopper,
  ExternalLink,
} from 'lucide-react';
import { ReadinessChecklistItem } from '@/lib/trip-health';

interface ReadinessChecklistCardProps {
  checklist: ReadinessChecklistItem[];
  onNavigateTab: (tab: any) => void;
  className?: string;
}

export const ReadinessChecklistCard: React.FC<ReadinessChecklistCardProps> = ({
  checklist,
  onNavigateTab,
  className = '',
}) => {
  const completedCount = checklist.filter((item) => item.status === 'complete').length;
  const isAllComplete = completedCount === checklist.length && checklist.length > 0;

  return (
    <div
      className={`rounded-3xl border-2 border-[#2A3B29] bg-[#141C14] p-5 sm:p-6 text-[#F4F2E6] shadow-xl relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background soft glow */}
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#5FA97D]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#0E120D]/60 border border-white/10 flex items-center justify-center text-[#5FA97D]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#F4F2E6] tracking-tight">
                Readiness Checklist
              </h3>
              <span className="text-[11px] text-[#8B9A8C] block">
                Pre-departure operational milestones
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E120D]/60 border border-white/10 text-xs font-mono">
            <span className="text-[#5FA97D] font-bold">{completedCount}</span>
            <span className="text-[#8B9A8C]">/</span>
            <span className="text-[#F4F2E6] font-semibold">{checklist.length}</span>
            <span className="text-[10px] text-[#8B9A8C] uppercase ml-1">Done</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 w-full h-2 bg-[#0E120D] rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-[#5FA97D] to-[#8FD9A8]"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / Math.max(checklist.length, 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* All-Complete Celebratory Banner */}
        {isAllComplete ? (
          <div className="mt-5 p-4 rounded-2xl bg-[#5FA97D]/15 border border-[#5FA97D]/40 flex items-center gap-3 text-xs text-[#5FA97D]">
            <div className="w-10 h-10 rounded-xl bg-[#5FA97D]/25 flex items-center justify-center text-[#5FA97D] shrink-0">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#F4F2E6]">All Departure Milestones Cleared!</h4>
              <p className="text-[11px] text-[#8FD9A8] mt-0.5">
                Every reservation is confirmed, ledger is reconciled, and all squad accounts are verified.
              </p>
            </div>
          </div>
        ) : (
          /* Checklist Items List */
          <div className="mt-4 space-y-2">
            {checklist.map((item) => {
              const isDone = item.status === 'complete';
              const isWarning = item.status === 'warning';

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    isDone
                      ? 'bg-[#0E120D]/30 border-white/5 text-[#8B9A8C]'
                      : isWarning
                      ? 'bg-[#291719]/60 border-[#B5484C]/40 text-[#F4F2E6]'
                      : 'bg-[#262115]/60 border-[#E0B84C]/40 text-[#F4F2E6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#5FA97D] shrink-0" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-[#B5484C] shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#E0B84C] shrink-0" />
                    )}

                    <div className="min-w-0">
                      <span className={`font-semibold block truncate ${isDone ? 'line-through text-[#8B9A8C]' : 'text-white'}`}>
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#8B9A8C] block truncate">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  {!isDone && item.actionTab && (
                    <button
                      type="button"
                      onClick={() => onNavigateTab(item.actionTab)}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-[11px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#8B9A8C]">
        <span>Dynamic real-time sync with database</span>
        <span className="font-mono">{completedCount}/{checklist.length} Verified</span>
      </div>
    </div>
  );
};
export default ReadinessChecklistCard;
