'use client';

import React, { useState } from 'react';
import { Participant, Squad } from '@/lib/types';
import { Users, X, Plus, Sparkles, CheckCircle2, Bookmark, ArrowRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SquadManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentParticipants: Participant[];
  squads: Squad[];
  onSaveCurrentSquad: (name: string, description: string) => void;
  onDeleteSquad?: (squadId: string) => void;
}

export const SquadManagerModal: React.FC<SquadManagerModalProps> = ({
  isOpen,
  onClose,
  currentParticipants,
  squads,
  onSaveCurrentSquad,
  onDeleteSquad,
}) => {
  const [squadName, setSquadName] = useState<string>('Goa Travel Tribe');
  const [squadDesc, setSquadDesc] = useState<string>('Frequent travel buddies with saved UPIs');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!squadName.trim()) return;
    onSaveCurrentSquad(squadName.trim(), squadDesc.trim());
    setSquadName('');
    setSquadDesc('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-surface-overlay border border-surface-hairline rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
      >
        {/* Header Ribbon */}
        <div className="p-6 bg-gradient-to-r from-surface-base via-surface-raised to-surface-base border-b border-surface-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-serif-display font-bold text-ink-primary">
                  Persistent Travel Squads
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Multi-Trip Memory
                </span>
              </div>
              <p className="text-xs text-ink-secondary mt-0.5">
                Save friend groups and default split preferences across trips so trip setup takes 30 seconds.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink-primary rounded-xl hover:bg-surface-base transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Squad Section */}
        <div className="p-5 bg-surface-base/70 border-b border-surface-hairline space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-emerald-400" /> Save Current Active Group ({currentParticipants.length} Travelers)
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <input
              type="text"
              placeholder="Squad Name (e.g. College Buddies)"
              value={squadName}
              onChange={(e) => setSquadName(e.target.value)}
              className="px-3 py-2 bg-surface-raised border border-surface-hairline rounded-xl text-ink-primary"
            />
            <input
              type="text"
              placeholder="Description / Notes"
              value={squadDesc}
              onChange={(e) => setSquadDesc(e.target.value)}
              className="px-3 py-2 bg-surface-raised border border-surface-hairline rounded-xl text-ink-primary"
            />
            <button
              onClick={handleSave}
              className="py-2 px-4 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-subtle"
            >
              <Plus className="w-4 h-4" /> Save Squad
            </button>
          </div>
        </div>

        {/* Saved Squads Feed */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <h4 className="text-xs font-bold text-ink-muted uppercase tracking-wider">
            Your Reusable Squads ({squads.length})
          </h4>

          {squads.length > 0 ? (
            <div className="space-y-3">
              {squads.map((sq) => (
                <div
                  key={sq.id}
                  className="p-4 bg-surface-base border border-surface-hairline rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-sm text-ink-primary">{sq.name}</h5>
                      <span className="px-2 py-0.5 rounded-full bg-surface-overlay text-ink-secondary text-[10px] font-mono">
                        {sq.members.length} members
                      </span>
                    </div>
                    {sq.description && (
                      <p className="text-ink-secondary text-[11px] mt-0.5">{sq.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {sq.members.map((m, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-surface-raised border border-surface-hairline text-[11px] text-ink-muted"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {onDeleteSquad && (
                    <button
                      onClick={() => onDeleteSquad(sq.id)}
                      className="p-2 text-ink-muted hover:text-red-400 rounded-lg hover:bg-surface-raised transition self-end sm:self-center"
                      title="Delete Squad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-surface-base/50 rounded-2xl border border-dashed border-surface-hairline space-y-2">
              <Users className="w-8 h-8 text-ink-muted mx-auto" />
              <p className="text-xs text-ink-muted">
                No saved squads yet. Save your current group above to reuse it across future trips!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-base border-t border-surface-hairline flex items-center justify-between text-xs text-ink-muted">
          <span>Squad profiles store UPI VPAs and preferred room tiers.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-raised border border-surface-hairline text-ink-primary font-bold hover:bg-surface-hairline transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};