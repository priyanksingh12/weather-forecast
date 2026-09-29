import React from 'react';
import { Info } from 'lucide-react';

interface Props {
  className?: string;
}

export const MapLegend: React.FC<Props> = ({ className = '' }) => {
  return (
    <div className={`rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl p-4 shadow-2xl text-xs sm:text-sm space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between text-[var(--text-secondary)] font-bold">
        <span className="uppercase tracking-wider text-xs sm:text-sm">Forecast Bust Probability</span>
        <span className="text-xs text-[var(--weather-blue)] font-mono font-bold">P(bust)</span>
      </div>

      {/* Gradient Bar */}
      <div className="h-3 w-full rounded-full bg-gradient-to-r from-[var(--weather-blue)] via-[var(--risk-watch)] to-[var(--risk-extreme)] shadow-inner" />

      {/* Legend Labels */}
      <div className="flex justify-between items-center text-xs font-mono font-bold">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--weather-blue)]"></span>
          <span className="text-[var(--weather-blue)]">Low (&lt;25%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--risk-watch)]"></span>
          <span className="text-[var(--risk-watch)]">Moderate (25–52%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--risk-extreme)]"></span>
          <span className="text-[var(--risk-extreme)]">High (&gt;52%)</span>
        </div>
      </div>

      <p className="text-xs text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border)] leading-snug flex items-start gap-1.5">
        <Info className="h-4 w-4 text-[var(--weather-blue)] shrink-0 mt-0.5" />
        <span>Calibrated threshold standards: Avoid irreversible actions on High Bust Risk leads.</span>
      </p>
    </div>
  );
};
