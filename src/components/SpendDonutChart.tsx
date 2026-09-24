'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DonutSlice {
  label: string;
  amount: number;
  color: string;
  percentage: number;
}

interface SpendDonutChartProps {
  categoryStats: Record<string, { estimated: number; actual: number }>;
  totalActual: number;
}

export const SpendDonutChart: React.FC<SpendDonutChartProps> = ({ categoryStats, totalActual }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // FinTech palette: Harmonious colors for light and dark theme
  const categoryColors: Record<string, string> = {
    lodging: '#10B981',   // Emerald
    transport: '#3B82F6', // Blue
    activity: '#8B5CF6',  // Purple
    food: '#F59E0B',      // Amber
    general: '#64748B',   // Slate
  };

  const slices: DonutSlice[] = Object.entries(categoryStats).map(([cat, stats]) => ({
    label: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: stats.actual,
    color: categoryColors[cat] || '#64748B',
    percentage: totalActual > 0 ? (stats.actual / totalActual) * 100 : 0,
  }));

  // Calculate SVG arc paths
  const radius = 64;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-1">
      {/* Interactive SVG Donut Chart */}
      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
          {slices.map((slice, idx) => {
            const strokeDasharray = `${(slice.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += slice.percentage;

            const isHovered = hoveredIndex === idx;

            return (
              <motion.circle
                key={slice.label}
                cx="90"
                cy="90"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-all duration-200"
                style={{
                  filter: isHovered ? 'drop-shadow(0px 0px 8px rgba(16,185,129,0.35))' : 'none',
                }}
              />
            );
          })}
        </svg>

        {/* Center Total Summary */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] uppercase font-mono text-ink-muted tracking-wider">Total Spend</span>
          <span className="font-numeric font-bold text-lg text-ink-primary">
            ₹{totalActual.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </span>
          {hoveredIndex !== null && (
            <span className="text-[11px] font-mono font-medium text-brand-emerald">
              {slices[hoveredIndex].label}: {slices[hoveredIndex].percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      {/* Interactive Legend Grid */}
      <div className="flex-1 space-y-2 w-full">
        {slices.map((slice, idx) => (
          <div
            key={slice.label}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
              hoveredIndex === idx
                ? 'bg-surface-raised border-brand-emerald/50 text-ink-primary shadow-sm'
                : 'bg-surface-raised/60 border-surface-hairline text-ink-secondary'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="font-medium text-ink-primary">{slice.label}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-ink-muted text-[11px] font-mono">{slice.percentage.toFixed(0)}%</span>
              <span className="font-numeric font-semibold text-ink-primary">
                ₹{slice.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
