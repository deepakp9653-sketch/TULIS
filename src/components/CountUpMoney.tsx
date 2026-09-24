'use client';

import React, { useEffect, useState } from 'react';

interface CountUpMoneyProps {
  value: number;
  duration?: number;
  prefix?: string;
  className?: string;
}

export const CountUpMoney: React.FC<CountUpMoneyProps> = ({
  value,
  duration = 800,
  prefix = '₹',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOut cubic: 1 - Math.pow(1 - progress, 3)
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOutProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    const animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [value, duration]);

  const formatted = Math.abs(displayValue).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const sign = value < 0 ? '-' : value > 0 && prefix.includes('+') ? '+' : '';
  const cleanPrefix = prefix.replace('+', '');

  return (
    <span className={`tabular-nums font-numeric ${className}`}>
      {sign}{cleanPrefix}{formatted}
    </span>
  );
};
