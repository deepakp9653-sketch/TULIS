'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LiquidLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const LiquidLogo: React.FC<LiquidLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-subtle border border-white/15 bg-zinc-950/90 backdrop-blur-md group"
        style={{ width: size, height: size }}
      >
        {/* Subtle breathing ambient emerald/teal glow behind emblem */}
        <motion.div
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-tr from-emerald-500/25 via-teal-500/15 to-transparent pointer-events-none"
        />

        {/* Official TripSync Emblem */}
        <img
          src="/fareshare-icon.png"
          alt="TripSync Logo"
          className="relative z-10 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-sans font-bold text-base tracking-tight text-ink-primary leading-tight">
            TripSync
          </span>
          <span className="text-[9px] uppercase font-mono tracking-widest text-ink-muted">
            One Trip. One Ledger. Zero Confusion.
          </span>
        </div>
      )}
    </div>
  );
};

