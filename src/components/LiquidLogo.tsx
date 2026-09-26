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
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-subtle border border-white/20 bg-white/95 px-2 py-0.5 group transition-transform hover:scale-[1.02]"
        style={{ height: size, minWidth: Math.round(size * 1.8) }}
      >
        {/* Subtle breathing ambient emerald glow */}
        <motion.div
          animate={{
            opacity: [0.15, 0.35, 0.15],
            scale: [0.98, 1.02, 0.98],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent pointer-events-none"
        />

        {/* Official New Tulis Logo */}
        <img
          src="/tulis-logo.png.jpeg"
          alt="Tulis Logo"
          className="relative z-10 h-full w-auto object-contain"
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-sans font-bold text-base tracking-tight text-ink-primary leading-tight">
            Tulis
          </span>
          <span className="text-[9px] uppercase font-mono tracking-widest text-ink-muted">
            One Trip. One Ledger. Zero Confusion.
          </span>
        </div>
      )}
    </div>
  );
};

