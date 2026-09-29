import React from 'react';
import { ChangeExplanationData } from '../../lib/api/types';
import { RefreshCw, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { ReliabilityBandBadge } from '../reliability/ReliabilityBandBadge';

interface Props {
  data: ChangeExplanationData | null;
}

export const ChangeExplanation: React.FC<Props> = ({ data }) => {
  if (!data) return null;

  const prevTrust = Math.round((1 - data.prev_p_bust) * 100);
  const currTrust = Math.round((1 - data.curr_p_bust) * 100);
  const delta = currTrust - prevTrust;
  const isDrop = delta < 0;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-[var(--weather-blue)]" />
          <h4 className="text-sm font-bold text-[var(--text-primary)]">What Changed Since Previous Cycle?</h4>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">Run-to-Run Delta</span>
      </div>

      {/* Delta Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Previous Cycle */}
        <div className="p-3 rounded-xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1">
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Previous Cycle</span>
          <div className="text-lg font-mono font-bold text-[var(--text-secondary)]">{prevTrust}%</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-secondary)]">Trust Score</span>
            <span className="text-[10px] text-[var(--text-secondary)]">{data.prev_band}</span>
          </div>
        </div>

        {/* Current Cycle */}
        <div className="p-3 rounded-xl bg-[var(--muted-surface)] border border-[var(--weather-blue)]/30 space-y-1">
          <span className="text-[10px] text-[var(--weather-blue)] uppercase tracking-wider font-semibold">Current Cycle</span>
          <div className="text-lg font-mono font-bold text-[var(--weather-blue)]">{currTrust}%</div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-secondary)]">Trust Score</span>
            <span className="text-[10px] text-[var(--weather-blue)] font-semibold">{data.curr_band}</span>
          </div>
        </div>

        {/* Difference */}
        <div className={`p-3 rounded-xl bg-[var(--muted-surface)] border space-y-1 ${isDrop ? 'border-[var(--risk-extreme)]/30' : 'border-[var(--safe-green)]/30'}`}>
          <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Net Shift</span>
          <div className={`text-lg font-mono font-bold flex items-center gap-1 ${isDrop ? 'text-[var(--risk-extreme)]' : 'text-[var(--safe-green)]'}`}>
            {isDrop ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            <span>{Math.abs(delta)} pp</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {isDrop ? 'Degraded reliability' : 'Improved consensus'}
          </span>
        </div>
      </div>

      {/* Synthesis Explanation Text */}
      <div className="p-3.5 rounded-xl bg-[var(--weather-blue)]/10 border border-[var(--border)] text-xs text-[var(--text-primary)] leading-relaxed">
        {data.summary_en}
      </div>

      {/* Delta Factors List */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Contributing Shifts</span>
        <div className="space-y-1.5">
          {data.delta_factors.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--weather-blue)] font-mono font-bold">›</span>
              <div>
                <strong className="text-[var(--text-primary)]">{f.factor_name}:</strong> {f.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
