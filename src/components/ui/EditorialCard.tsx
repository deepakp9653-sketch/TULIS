'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────
// EditorialCard — Flat editorial vector card for the Editorial Forest layer
//
// Variants:
//   default  → ef-card (warm cream, subtle border, gentle hover lift)
//   hero     → ef-card-hero (neo-brutalist 2px border + hard offset shadow)
//   block    → color-blocked background (lime/yellow/sage) behind key numbers
//
// Per TULIS_ANTIGRAVITY_BUILD_SPEC.md Section 2.3:
//   "Neo-brutalist touches used sparingly and deliberately — a visible 2px
//    Deep Forest border and a hard offset shadow on a SMALL NUMBER of
//    high-priority elements per screen"
// ─────────────────────────────────────────────────────────────────────

type EditorialCardVariant = 'default' | 'hero' | 'block-lime' | 'block-yellow' | 'block-sage' | 'block-cream';

interface EditorialCardProps {
  variant?: EditorialCardVariant;
  className?: string;
  children: React.ReactNode;
  /** Optional click handler — if provided, renders as a button for a11y */
  onClick?: () => void;
  /** Accessible label for interactive cards */
  ariaLabel?: string;
}

const variantClasses: Record<EditorialCardVariant, string> = {
  'default': 'ef-card',
  'hero': 'ef-card-hero',
  'block-lime': 'ef-card ef-block-lime',
  'block-yellow': 'ef-card ef-block-yellow',
  'block-sage': 'ef-card ef-block-sage',
  'block-cream': 'ef-card ef-block-cream',
};

export default function EditorialCard({
  variant = 'default',
  className = '',
  children,
  onClick,
  ariaLabel,
}: EditorialCardProps) {
  const baseClasses = variantClasses[variant];
  const combinedClasses = `${baseClasses} ${className}`.trim();

  // Interactive cards render as buttons for semantic HTML / a11y
  if (onClick) {
    return (
      <motion.button
        type="button"
        className={combinedClasses}
        onClick={onClick}
        aria-label={ariaLabel}
        whileTap={{ scale: 0.98 }}
        style={{ textAlign: 'left', width: '100%' }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      className={combinedClasses}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
