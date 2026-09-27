'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// ConfidenceBadge — Unified AI confidence indicator
//
// Per TULIS_ANTIGRAVITY_BUILD_SPEC.md Feature F6.5:
//   "Ensure each [AI touchpoint] surfaces its real confidence value
//    using one shared, consistent UI pattern."
//
// Used across: ReceiptExtractionReviewModal, ChatExpenseModal,
// AudioShieldModal, GogoPlanPreviewModal, and any future AI touchpoint.
//
// The pattern is ONE shared component — not five bespoke implementations.
// ─────────────────────────────────────────────────────────────────────

type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceBadgeProps {
  /** Confidence value between 0 and 1 (or 0 and 100) */
  score: number;
  /** Optional label override (default: "AI Confidence") */
  label?: string;
  /** Show the percentage value next to the indicator */
  showValue?: boolean;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

function normalizeScore(score: number): number {
  // Accept both 0-1 and 0-100 ranges
  if (score > 1) return Math.min(score, 100);
  return score * 100;
}

function getLevel(percent: number): ConfidenceLevel {
  if (percent >= 80) return 'high';
  if (percent >= 50) return 'medium';
  return 'low';
}

const levelConfig: Record<ConfidenceLevel, {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  label: string;
}> = {
  high: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    icon: ShieldCheck,
    label: 'High confidence',
  },
  medium: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    icon: HelpCircle,
    label: 'Medium confidence',
  },
  low: {
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
    icon: AlertTriangle,
    label: 'Low confidence',
  },
};

export function ConfidenceBadge({
  score,
  label = 'AI Confidence',
  showValue = true,
  compact = false,
  className = '',
}: ConfidenceBadgeProps) {
  const percent = normalizeScore(score);
  const level = getLevel(percent);
  const config = levelConfig[level];
  const Icon = config.icon;
  const displayPercent = Math.round(percent);

  if (compact) {
    return (
      <motion.span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
          ${config.bgColor} ${config.color} border ${config.borderColor} ${className}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        role="status"
        aria-label={`${label}: ${displayPercent}% — ${config.label}`}
      >
        <Icon className="w-3 h-3" aria-hidden="true" />
        {showValue && <span className="font-numeric">{displayPercent}%</span>}
      </motion.span>
    );
  }

  return (
    <motion.div
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border
        ${config.bgColor} ${config.borderColor} ${className}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-label={`${label}: ${displayPercent}% — ${config.label}`}
    >
      <Icon className={`w-4 h-4 ${config.color} shrink-0`} aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <span className={`text-xs font-medium ${config.color}`}>{label}</span>
        {showValue && (
          <div className="flex items-center gap-2">
            {/* Visual bar */}
            <div className="w-16 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  level === 'high'
                    ? 'bg-emerald-500'
                    : level === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${displayPercent}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-xs font-numeric font-semibold ${config.color}`}>
              {displayPercent}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default ConfidenceBadge;
