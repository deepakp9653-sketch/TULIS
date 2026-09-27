'use client';

import React from 'react';
import {
  Building2,
  TrendingUp,
  DollarSign,
  PieChart,
  Layers,
  ArrowUpRight,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { Expense } from '@/lib/types';

interface DepartmentSpendViewProps {
  expenses: Expense[];
  className?: string;
}

const DEFAULT_DEPARTMENTS: Array<{
  name: string;
  code: string;
  budget: number;
  color: string;
}> = [
  { name: 'Engineering & Tech', code: 'CC-ENG-101', budget: 350000, color: 'bg-emerald-500' },
  { name: 'Sales & BD', code: 'CC-SALES-201', budget: 250000, color: 'bg-amber-500' },
  { name: 'Product & Design', code: 'CC-PROD-301', budget: 150000, color: 'bg-sky-500' },
  { name: 'Operations & People', code: 'CC-OPS-401', budget: 100000, color: 'bg-purple-500' },
  { name: 'Executive Travel', code: 'CC-EXEC-501', budget: 200000, color: 'bg-rose-500' },
];

export const DepartmentSpendView: React.FC<DepartmentSpendViewProps> = ({
  expenses = [],
  className = '',
}) => {
  // Aggregate expenses by cost_center / department
  const deptSpendMap: Record<string, number> = {};
  const deptCategoryMap: Record<string, Record<string, number>> = {};

  expenses.forEach((e) => {
    const cc = e.costCenter || 'CC-ENG-101';
    const amount = Number(e.totalAmount || 0);

    deptSpendMap[cc] = (deptSpendMap[cc] || 0) + amount;

    if (!deptCategoryMap[cc]) deptCategoryMap[cc] = {};
    const cat = e.category || 'misc';
    deptCategoryMap[cc][cat] = (deptCategoryMap[cc][cat] || 0) + amount;
  });

  const totalAllDeptSpend = Object.values(deptSpendMap).reduce((a, b) => a + b, 0);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#253624] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Real-Time Department Spend Telemetry</h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                FC.4 Live Query
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Live cost-center expense aggregation vs allocated quarterly departmental travel budgets
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">Total Aggregated</span>
          <span className="text-lg font-bold font-numeric text-emerald-400">
            ₹{totalAllDeptSpend.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEFAULT_DEPARTMENTS.map((dept) => {
          const spend = deptSpendMap[dept.code] || 0;
          const percentUsed = Math.min(100, Math.round((spend / dept.budget) * 100));
          const isOver = spend > dept.budget;
          const categories = deptCategoryMap[dept.code] || {};
          const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

          return (
            <div
              key={dept.code}
              className="p-4 rounded-2xl bg-gradient-to-b from-[#141C14] to-[#0D120D] border border-[#273726] hover:border-[#3A5038] transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{dept.name}</h4>
                  <span className="text-[10px] font-mono text-stone-400">{dept.code}</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOver
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : percentUsed > 75
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {percentUsed}% Used
                </span>
              </div>

              {/* Spend Metric */}
              <div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-bold font-numeric text-white">
                    ₹{spend.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    / ₹{dept.budget.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden mt-2 border border-stone-800">
                  <div
                    style={{ width: `${percentUsed}%` }}
                    className={`h-full ${dept.color} transition-all duration-500`}
                  />
                </div>
              </div>

              {/* Sub-strip with Top Category */}
              <div className="pt-2 border-t border-[#222E21] flex items-center justify-between text-[11px] text-stone-400">
                <span>Top spend:</span>
                <span className="font-semibold text-stone-200 capitalize">
                  {topCategory ? `${topCategory[0]} (₹${topCategory[1].toLocaleString('en-IN')})` : 'No expenses yet'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
