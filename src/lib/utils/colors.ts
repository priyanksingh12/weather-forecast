import { ConfidenceBand } from '../api/types';

// Color-blind safe sequential palette for Forecast Bust Probability
// Low risk (reliable): Cyan/Soft Teal (#06b6d4 / #0284c7)
// Moderate risk: Amber/Gold (#f59e0b / #d97706)
// High risk (bust likely): Coral/Red-Magenta (#f43f5e / #e11d48)

export function getBustColor(pBust: number): string {
  if (pBust < 0.25) return '#06b6d4'; // Cyan (High reliability)
  if (pBust < 0.40) return '#38bdf8'; // Sky blue
  if (pBust < 0.52) return '#f59e0b'; // Amber (Moderate reliability)
  if (pBust < 0.70) return '#f97316'; // Orange
  return '#f43f5e'; // Rose / Coral (Low reliability / High bust probability)
}

export function getConfidenceBandBadgeStyles(band: ConfidenceBand): {
  bg: string;
  text: string;
  border: string;
  glow: string;
  label: string;
} {
  switch (band) {
    case 'High':
      return {
        bg: 'bg-[var(--safe-green)]/15',
        text: 'text-[var(--safe-green)]',
        border: 'border-[var(--safe-green)]/30',
        glow: 'shadow-sm',
        label: 'High Reliability'
      };
    case 'Moderate':
      return {
        bg: 'bg-[var(--risk-watch)]/15',
        text: 'text-[var(--risk-watch)]',
        border: 'border-[var(--risk-watch)]/30',
        glow: 'shadow-sm',
        label: 'Moderate Reliability'
      };
    case 'Low':
    default:
      return {
        bg: 'bg-[var(--risk-extreme)]/15',
        text: 'text-[var(--risk-extreme)]',
        border: 'border-[var(--risk-extreme)]/30',
        glow: 'shadow-sm',
        label: 'Low Reliability (Bust Risk)'
      };
  }
}
