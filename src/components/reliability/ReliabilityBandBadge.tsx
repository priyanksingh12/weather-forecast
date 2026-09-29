import React from 'react';
import { ConfidenceBand } from '../../lib/api/types';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface Props {
  band: ConfidenceBand;
  size?: 'sm' | 'md' | 'lg';
}

const bandStyles: Record<
  ConfidenceBand,
  {
    bg: string;
    text: string;
    border: string;
    glow: string;
    label: string;
  }
> = {
  High: {
    bg: 'bg-[var(--safe-green)]/15',
    text: 'text-[var(--safe-green)]',
    border: 'border-[var(--safe-green)]/30',
    glow: 'shadow-sm',
    label: 'High Reliability'
  },
  Moderate: {
    bg: 'bg-[var(--risk-watch)]/15',
    text: 'text-[var(--risk-watch)]',
    border: 'border-[var(--risk-watch)]/30',
    glow: 'shadow-sm',
    label: 'Moderate Reliability'
  },
  Low: {
    bg: 'bg-[var(--risk-extreme)]/15',
    text: 'text-[var(--risk-extreme)]',
    border: 'border-[var(--risk-extreme)]/30',
    glow: 'shadow-sm',
    label: 'Low Reliability (Bust Risk)'
  }
};

export function getConfidenceBandBadgeStyles(band: ConfidenceBand) {
  return bandStyles[band] || bandStyles.Low;
}

export const ReliabilityBandBadge: React.FC<Props> = ({ band, size = 'md' }) => {
  const styles = getConfidenceBandBadgeStyles(band);

  const icons = {
    High: ShieldCheck,
    Moderate: AlertTriangle,
    Low: ShieldAlert
  };

  const Icon = icons[band] || AlertTriangle;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2'
  };

  return (
    <div
      className={`inline-flex items-center font-semibold rounded-lg border ${styles.bg} ${styles.text} ${styles.border} ${styles.glow} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      <span>{styles.label}</span>
    </div>
  );
};
