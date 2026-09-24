'use client';

import React, { useState } from 'react';
import { Anomaly } from '@/lib/types';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Home,
  TrendingUp,
  UserX,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnomalyFeedBannerProps {
  anomalies: Anomaly[];
  onDismissAnomaly: (id: string) => void;
}

export const AnomalyFeedBanner: React.FC<AnomalyFeedBannerProps> = ({
  anomalies,
  onDismissAnomaly,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const activeAnomalies = anomalies.filter((a) => !a.dismissed);
  if (activeAnomalies.length === 0) return null;

  const highCount = activeAnomalies.filter((a) => a.severity === 'high').length;

  const getIcon = (type: Anomaly['type']) => {
    switch (type) {
      case 'SCHEDULE_CONFLICT':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'ROOM_OVERCAPACITY':
        return <Home className="w-4 h-4 text-brand-gold" />;
      case 'BUDGET_VARIANCE':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'ROSTER_MISMATCH':
        return <UserX className="w-4 h-4 text-purple-400" />;
      case 'ALLOCATION_MISMATCH':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-surface-raised to-surface-raised rounded-2xl p-4 shadow-paper transition-all">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-ink-primary">
                Deterministic Conflict & Anomaly Detector
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeAnomalies.length} Flagged
              </span>
              {highCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  {highCount} High Priority
                </span>
              )}
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              Automated rules engine scanned bookings, room caps, and budget ceilings for mathematical and logistical discrepancies.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:underline px-3 py-1.5 rounded-lg hover:bg-surface-elevated transition"
        >
          <span>{isExpanded ? 'Hide Conflicts' : 'Inspect Issues'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Anomaly List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-surface-hairline/60 space-y-2.5">
              {activeAnomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-3 bg-surface-base/70 border border-surface-hairline rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">{getIcon(anom.type)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-ink-primary">{anom.title}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${
                            anom.severity === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : anom.severity === 'medium'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-surface-hairline text-ink-muted'
                          }`}
                        >
                          {anom.severity}
                        </span>
                      </div>
                      <p className="text-ink-secondary mt-0.5 text-[11px] leading-relaxed">
                        {anom.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDismissAnomaly(anom.id)}
                    className="p-1 text-ink-muted hover:text-ink-primary rounded-lg hover:bg-surface-hairline transition"
                    title="Dismiss Anomaly"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
