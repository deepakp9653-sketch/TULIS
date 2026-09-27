'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface GogoSingleFABProps {
  onClick: () => void;
}

export const GogoSingleFAB: React.FC<GogoSingleFABProps> = ({ onClick }) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 bg-[#D9EE86] hover:bg-[#cbe273] text-[#12382E] font-bold text-xs px-4 py-2.5 rounded-full shadow-xl border border-[#b8d462] flex items-center gap-2 cursor-pointer transition-all"
      title="Ask Gogo AI: Itinerary Planner, Balance Answers & Venue Intelligence"
    >
      <div className="w-5 h-5 rounded-full bg-[#12382E] text-[#D9EE86] flex items-center justify-center shrink-0 shadow-inner">
        <Sparkles className="w-3 h-3" />
      </div>
      <span className="font-semibold tracking-wide">Ask Gogo AI</span>
    </motion.button>
  );
};
