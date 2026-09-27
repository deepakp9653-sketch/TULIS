'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────
// BentoGrid — Asymmetric, confident block sizing for dashboard layouts
//
// Per TULIS_ANTIGRAVITY_BUILD_SPEC.md Section 2.3:
//   "Bento-grid layouts for dashboards and summary screens — irregular,
//    confident block sizing, not a uniform card grid."
//
// Uses CSS Grid with named template areas for responsive control.
// Items declare their span via the `span` prop (1–4 columns, 1–2 rows).
// ─────────────────────────────────────────────────────────────────────

interface BentoGridProps {
  /** Number of columns at the desktop breakpoint (default: 4) */
  columns?: 2 | 3 | 4;
  /** Gap between grid items in rem (default: 1.25) */
  gap?: number;
  /** Additional CSS classes */
  className?: string;
  children: React.ReactNode;
}

interface BentoItemProps {
  /** Number of columns this item spans (default: 1) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Number of rows this item spans (default: 1) */
  rowSpan?: 1 | 2;
  /** Additional CSS classes */
  className?: string;
  children: React.ReactNode;
}

const columnClasses: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export function BentoGrid({
  columns = 4,
  gap = 1.25,
  className = '',
  children,
}: BentoGridProps) {
  return (
    <div
      className={`grid ${columnClasses[columns]} ${className}`}
      style={{ gap: `${gap}rem` }}
      role="region"
      aria-label="Dashboard grid"
    >
      {children}
    </div>
  );
}

export function BentoItem({
  colSpan = 1,
  rowSpan = 1,
  className = '',
  children,
}: BentoItemProps) {
  // Map span values to Tailwind grid span classes
  const colSpanClass = colSpan > 1 ? `sm:col-span-${colSpan}` : '';
  const rowSpanClass = rowSpan > 1 ? `row-span-${rowSpan}` : '';

  return (
    <motion.div
      className={`col-span-1 ${colSpanClass} ${rowSpanClass} ${className}`.trim()}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      // Ensure grid items with colSpan > columns don't overflow
      style={{
        gridColumn: colSpan > 1 ? `span ${colSpan}` : undefined,
        gridRow: rowSpan > 1 ? `span ${rowSpan}` : undefined,
        minWidth: 0, // Prevent grid blowout
      }}
    >
      {children}
    </motion.div>
  );
}
