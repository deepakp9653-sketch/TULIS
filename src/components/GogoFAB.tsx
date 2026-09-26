'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Compass } from 'lucide-react';

interface GogoFABProps {
  onClick: () => void;
}

export const GogoFAB: React.FC<GogoFABProps> = ({ onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title="Plan a new adventure with Gogo AI"
      className="fixed bottom-6 left-6 z-40 h-12 px-4 rounded-full bg-gradient-to-r from-[#203022] via-[#2A3F2C] to-[#1E2E20] border border-[#5FA97D]/50 text-[#F4F2E6] font-bold text-xs shadow-2xl flex items-center gap-2.5 backdrop-blur-xl group cursor-pointer"
    >
      <div className="w-6 h-6 rounded-full bg-[#5FA97D]/20 text-[#5FA97D] flex items-center justify-center font-bold group-hover:rotate-45 transition-transform">
        <Sparkles className="w-3.5 h-3.5" />
      </div>
      <span className="tracking-wide">Plan with Gogo</span>
      <span className="text-[9px] bg-[#5FA97D]/20 text-[#5FA97D] px-1.5 py-0.5 rounded font-mono uppercase">
        AI
      </span>
    </motion.button>
  );
};
