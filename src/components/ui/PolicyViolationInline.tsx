'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, AlertOctagon, CheckCircle2, Info } from 'lucide-react';

export interface PolicyCheckResult {
  isCorporate: boolean;
  isCompliant: boolean;
  severity: 'compliant' | 'warning' | 'violation';
  ruleName: string;
  category: string;
  amount: number;
  threshold: number;
  overage: number;
  message: string;
  requiresJustification: boolean;
}

export function evaluateExpensePolicy(
  amount: number,
  category: string = 'general',
  isCorporate: boolean = false,
  orgName: string = 'Enterprise'
): PolicyCheckResult {
  if (!isCorporate) {
    return {
      isCorporate: false,
      isCompliant: true,
      severity: 'compliant',
      ruleName: 'Personal Trip',
      category,
      amount,
      threshold: Infinity,
      overage: 0,
      message: '',
      requiresJustification: false,
    };
  }

  const cat = category.toLowerCase();
  let threshold = 5000;
  let autoApproveThreshold = 2000;
  let ruleName = 'General B2B Expense Cap';

  if (cat.includes('lodging') || cat.includes('hotel') || cat.includes('stay') || cat.includes('accommodation')) {
    threshold = 12000;
    autoApproveThreshold = 7000;
    ruleName = 'Per-Night Lodging Ceiling';
  } else if (cat.includes('food') || cat.includes('dining') || cat.includes('meal')) {
    threshold = 4500;
    autoApproveThreshold = 2000;
    ruleName = 'Daily Meal & Per-Diem Cap';
  } else if (cat.includes('transit') || cat.includes('cab') || cat.includes('transport') || cat.includes('taxi')) {
    threshold = 3500;
    autoApproveThreshold = 1500;
    ruleName = 'Ground Transportation Cap';
  } else if (cat.includes('flight') || cat.includes('air') || cat.includes('train') || cat.includes('rail')) {
    threshold = 25000;
    autoApproveThreshold = 15000;
    ruleName = 'Flight & Rail Travel Allowance';
  }

  const overage = Math.max(0, amount - threshold);

  if (amount > threshold) {
    return {
      isCorporate: true,
      isCompliant: false,
      severity: 'violation',
      ruleName,
      category,
      amount,
      threshold,
      overage,
      message: `Exceeds ${ruleName} (₹${threshold.toLocaleString('en-IN')}) by ₹${overage.toLocaleString('en-IN')}. Director/VP justification required.`,
      requiresJustification: true,
    };
  }

  if (amount > autoApproveThreshold) {
    return {
      isCorporate: true,
      isCompliant: true,
      severity: 'warning',
      ruleName,
      category,
      amount,
      threshold: autoApproveThreshold,
      overage: amount - autoApproveThreshold,
      message: `Within maximum ceiling, but exceeds auto-approval threshold of ₹${autoApproveThreshold.toLocaleString('en-IN')}. Manager sign-off required.`,
      requiresJustification: false,
    };
  }

  return {
    isCorporate: true,
    isCompliant: true,
    severity: 'compliant',
    ruleName,
    category,
    amount,
    threshold,
    overage: 0,
    message: `Compliant with ${orgName} travel policy (within ₹${threshold.toLocaleString('en-IN')} limit).`,
    requiresJustification: false,
  };
}

interface PolicyViolationInlineProps {
  amount: number;
  category?: string;
  isCorporate?: boolean;
  orgName?: string;
  className?: string;
}

export const PolicyViolationInline: React.FC<PolicyViolationInlineProps> = ({
  amount,
  category = 'general',
  isCorporate = false,
  orgName = 'Corporate',
  className = '',
}) => {
  if (!isCorporate) return null;

  const result = evaluateExpensePolicy(amount, category, isCorporate, orgName);

  const configs = {
    compliant: {
      bg: 'bg-[#5FA97D]/10 border-[#5FA97D]/30 text-[#5FA97D]',
      icon: CheckCircle2,
      label: 'Policy Compliant',
    },
    warning: {
      bg: 'bg-[#E0B84C]/15 border-[#E0B84C]/40 text-[#E0B84C]',
      icon: AlertTriangle,
      label: 'Manager Approval Required',
    },
    violation: {
      bg: 'bg-[#B5484C]/15 border-[#B5484C]/40 text-[#B5484C]',
      icon: AlertOctagon,
      label: 'Policy Ceiling Exceeded',
    },
  }[result.severity];

  const IconComponent = configs.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs ${configs.bg} ${className}`}
      role="status"
      aria-live="polite"
    >
      <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold">{configs.label}</span>
          <span className="text-[10px] font-mono uppercase opacity-75">
            {result.ruleName}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">{result.message}</p>
      </div>
    </motion.div>
  );
};
export default PolicyViolationInline;
