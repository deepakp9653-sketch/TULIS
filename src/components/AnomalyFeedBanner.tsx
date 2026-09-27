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
  Bot,
  Sparkles,
  Loader2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainLedgerValue, LedgerValueExplanation } from '@/lib/ledger-engine';
import ExplainButton from './ui/ExplainButton';
import ExplainModal from './ExplainModal';

interface AnomalyFeedBannerProps {
  anomalies: Anomaly[];
  onDismissAnomaly: (id: string) => void;
}

interface TriageCluster {
  name: string;
  urgency: 'critical' | 'warning' | 'advisory';
  anomalyIds: string[];
  rootCause: string;
  recommendedAction: string;
}

interface TriageResult {
  diagnosis: string;
  clusters: TriageCluster[];
  resolutionSteps: string[];
}

export const AnomalyFeedBanner: React.FC<AnomalyFeedBannerProps> = ({
  anomalies,
  onDismissAnomaly,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [explainState, setExplainState] = useState<LedgerValueExplanation | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);

  const activeAnomalies = anomalies.filter((a) => !a.dismissed);
  if (activeAnomalies.length === 0) return null;

  const highCount = activeAnomalies.filter((a) => a.severity === 'high').length;

  const handleRunTriage = async () => {
    setIsTriaging(true);
    setIsExpanded(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'triage-anomalies',
          anomalies: activeAnomalies,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTriageResult({
          diagnosis: data.diagnosis,
          clusters: data.clusters || [],
          resolutionSteps: data.resolutionSteps || [],
        });
      }
    } catch (err) {
      console.error('Triage error:', err);
    } finally {
      setIsTriaging(false);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunTriage}
            disabled={isTriaging}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 transition-colors shadow-subtle cursor-pointer"
            title="AI Groq root-cause clustering and proposed fix order"
          >
            {isTriaging ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-purple-400" />
            )}
            <span>AI Triage</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:underline px-3 py-1.5 rounded-lg hover:bg-surface-elevated transition cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Conflicts' : 'Inspect Issues'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
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
              {/* F6.1 AI Triage Assistant Results */}
              {triageResult && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1d1627] via-[#15101d] to-[#0d0912] border border-purple-500/40 text-stone-100 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-2.5">
                    <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wider">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span>Groq AI Triage Diagnosis & Fix Order (F6.1)</span>
                    </div>
                    <button
                      onClick={() => setTriageResult(null)}
                      className="text-stone-400 hover:text-white p-1 rounded-lg"
                      title="Close Triage"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-stone-200 leading-relaxed font-medium">
                    {triageResult.diagnosis}
                  </p>

                  {/* Root cause clusters */}
                  {triageResult.clusters.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] uppercase font-bold text-purple-400 tracking-wider">
                        Root-Cause Clusters:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {triageResult.clusters.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-black/40 border border-purple-900/50 space-y-1.5 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-100">{c.name}</span>
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                                  c.urgency === 'critical'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : c.urgency === 'warning'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-emerald-500/20 text-emerald-300'
                                }`}
                              >
                                {c.urgency}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-300">
                              <strong className="text-stone-400">Cause:</strong> {c.rootCause}
                            </p>
                            <p className="text-[11px] text-purple-300">
                              <strong className="text-purple-400">Fix:</strong> {c.recommendedAction}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resolution Order Steps */}
                  {triageResult.resolutionSteps.length > 0 && (
                    <div className="p-3 rounded-xl bg-black/30 border border-purple-950 space-y-1.5">
                      <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
                        Recommended Resolution Sequence:
                      </span>
                      <div className="space-y-1 text-xs text-stone-300">
                        {triageResult.resolutionSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 block pt-1 font-mono">
                        Advisory only — you retain full authority over which anomalies to address or dismiss.
                      </span>
                    </div>
                  )}
                </div>
              )}

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

                  <div className="flex items-center gap-1.5 shrink-0">
                    <ExplainButton
                      onExplain={() => {
                        const exp = explainLedgerValue('anomaly', anom.id, {
                          participants: [],
                          expenses: [],
                          anomalies,
                        });
                        setExplainState(exp);
                      }}
                      ariaLabel={`Explain why ${anom.title} was flagged`}
                      tooltip="Why was this flagged?"
                    />
                    <button
                      onClick={() => onDismissAnomaly(anom.id)}
                      className="p-1 text-ink-muted hover:text-ink-primary rounded-lg hover:bg-surface-hairline transition cursor-pointer"
                      title="Dismiss Anomaly"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Explain Any Number Modal */}
      <ExplainModal
        isOpen={!!explainState}
        onClose={() => setExplainState(null)}
        explanation={explainState}
      />
    </div>
  );
};
