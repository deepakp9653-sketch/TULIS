'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────
// ExplainButton — Reusable "why?" affordance for ledger values
//
// Per TULIS_ANTIGRAVITY_BUILD_SPEC.md Feature F4.1:
//   "Every settlement transfer, anomaly card, and variance figure gets
//    a 'why?' affordance wired to [explainLedgerValue]."
//
// This is a small, inline button that appears next to any number in the
// UI that can be traced back through the events table.
// ─────────────────────────────────────────────────────────────────────

interface ExplainButtonProps {
  /** Callback when the user clicks "why?" */
  onExplain: () => void;
  /** Accessible label describing what this explains */
  ariaLabel?: string;
  /** Optional tooltip text on hover */
  tooltip?: string;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

export default function ExplainButton({
  onExplain,
  ariaLabel = 'Explain this number',
  tooltip = 'Why this number?',
  size = 'sm',
  className = '',
}: ExplainButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'w-5 h-5 text-xs'
    : 'w-6 h-6 text-sm';

  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <motion.button
      type="button"
      className={`inline-flex items-center justify-center rounded-full
        bg-ef-soft-sage/50 hover:bg-ef-soft-sage text-ef-editorial-green
        border border-ef-editorial-green/20 hover:border-ef-editorial-green/40
        transition-colors duration-150 cursor-pointer
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ef-editorial-green
        focus-visible:ring-offset-2 focus-visible:ring-offset-white
        dark:focus-visible:ring-offset-gray-900
        ${sizeClasses} ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onExplain();
      }}
      aria-label={ariaLabel}
      title={tooltip}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
    >
      <HelpCircle className={iconSize} aria-hidden="true" />
    </motion.button>
  );
}

export { ExplainButton };
