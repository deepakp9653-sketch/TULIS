'use client';

import React from 'react';
import { ParticipantNetBalance } from '@/lib/types';
import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface ParticipantBarChartProps {
  netBalances: ParticipantNetBalance[];
}

export const ParticipantBarChart: React.FC<ParticipantBarChartProps> = ({ netBalances }) => {
  const maxVal = Math.max(...netBalances.flatMap((b) => [b.totalPaid, b.totalOwed]), 10000);

  return (
    <div className="space-y-3">
      {netBalances.map((nb) => {
        const paidPercent = Math.min(100, (nb.totalPaid / maxVal) * 100);
        const owedPercent = Math.min(100, (nb.totalOwed / maxVal) * 100);

        return (
          <div
            key={nb.participant.id}
            className="p-3 rounded-xl bg-surface-raised border border-surface-hairline space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <UserAvatar
                  name={nb.participant.name}
                  id={nb.participant.id}
                  avatarUrl={nb.participant.avatarUrl}
                  size="xs"
                />
                <span className="font-semibold text-ink-primary">{nb.participant.name}</span>
                {nb.participant.isOrganizer && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-inset text-ink-muted">
                    Host
                  </span>
                )}
              </div>

              <span
                className={`font-numeric text-[11px] font-semibold px-2 py-0.5 rounded ${
                  nb.netBalance > 0
                    ? 'bg-brand-emerald/15 text-brand-emerald'
                    : nb.netBalance < 0
                    ? 'bg-rose-500/15 text-rose-500'
                    : 'bg-surface-inset text-ink-muted'
                }`}
              >
                {nb.netBalance > 0
                  ? `+₹${nb.netBalance.toLocaleString('en-IN')}`
                  : nb.netBalance < 0
                  ? `-₹${Math.abs(nb.netBalance).toLocaleString('en-IN')}`
                  : 'Settled'}
              </span>
            </div>

            {/* Dual Progress Bars: Fronted (Emerald) vs Share (Muted) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-14 text-ink-muted shrink-0 text-[10px] uppercase font-mono">Fronted</span>
                <div className="h-1.5 flex-1 bg-surface-inset rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paidPercent}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-brand-emerald rounded-full"
                  />
                </div>
                <span className="font-numeric font-medium text-ink-primary w-20 text-right">
                  ₹{nb.totalPaid.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-14 text-ink-muted shrink-0 text-[10px] uppercase font-mono">Share</span>
                <div className="h-1.5 flex-1 bg-surface-inset rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${owedPercent}%` }}
                    transition={{ duration: 0.6, delay: 0.05 }}
                    className="h-full bg-ink-muted/50 rounded-full"
                  />
                </div>
                <span className="font-numeric font-medium text-ink-muted w-20 text-right">
                  ₹{nb.totalOwed.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
