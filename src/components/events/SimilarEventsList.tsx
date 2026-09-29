'use client';

import React from 'react';
import { SimilarEventsData } from '../../lib/api/types';
import { Layers, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { formatPercent } from '../../lib/utils/formatters';

interface Props {
  data: SimilarEventsData | null;
  loading?: boolean;
}

export const SimilarEventsList: React.FC<Props> = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-52 bg-[var(--muted-surface)] rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl bg-[var(--muted-surface)]"></div>
          <div className="h-40 rounded-2xl bg-[var(--muted-surface)]"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.analogs.length) return null;

  const bustedAnalogsCount = data.analogs.filter((a) => a.did_bust).length;

  return (
    <div className="space-y-4">
      {/* Header & Sanity Check Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="h-5 w-5 text-[var(--weather-blue)]" />
            <span>Similar Historical Situations (Analogs)</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Top nearest atmospheric analogs in same-season archives for {data.region_name} at Day {data.lead_day}
          </p>
        </div>

        {/* Independent Sanity Check */}
        <div className="rounded-xl border border-[var(--risk-extreme)]/30 bg-[var(--risk-extreme)]/10 px-3.5 py-1.5 flex items-center gap-2 text-[var(--risk-extreme)] self-start sm:self-auto shadow-sm">
          <ShieldAlert className="h-4 w-4 text-[var(--risk-extreme)] shrink-0" />
          <span className="text-xs font-semibold">
            Similar situations busted:{' '}
            <span className="font-mono font-bold text-[var(--risk-extreme)]">
              {bustedAnalogsCount} / {data.analogs.length}
            </span>
          </span>
        </div>
      </div>

      {/* Analog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.analogs.map((analog) => (
          <div
            key={analog.analog_event_id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-5 hover:border-[var(--weather-blue)]/40 transition-all space-y-3 group shadow-xl"
          >
            {/* Date & Similarity */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
              <span className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--weather-blue)] transition-colors">
                {analog.historical_date}
              </span>
              <span className="font-mono text-xs font-bold text-[var(--weather-blue)] bg-[var(--weather-blue)]/10 px-2 py-0.5 rounded border border-[var(--weather-blue)]/20">
                {formatPercent(analog.similarity_score)} match
              </span>
            </div>

            {/* Event Name & Synoptic Context */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-[var(--text-secondary)]">{analog.event_name}</h4>
              <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                {analog.synoptic_summary}
              </p>
            </div>

            {/* Numbers: Forecast vs Actual */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--muted-surface)] border border-[var(--border)] text-[11px] font-mono">
              <div>
                <span className="text-[var(--text-secondary)] text-[10px] block">Forecast Issued</span>
                <span className="text-[var(--text-secondary)] font-semibold">{analog.forecast_issued} mm</span>
              </div>
              <div>
                <span className="text-[var(--text-secondary)] text-[10px] block">Observed Truth</span>
                <span className="text-[var(--safe-green)] font-semibold">{analog.observed_actual} mm</span>
              </div>
              <div className="col-span-2 pt-1.5 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-[10px]">Actual Error</span>
                <span className={analog.actual_error > 0 ? 'text-[var(--risk-watch)] font-semibold' : 'text-[var(--text-secondary)]'}>
                  {analog.actual_error > 0 ? `+${analog.actual_error}` : analog.actual_error} mm
                </span>
              </div>
            </div>

            {/* Bust Flag Badge */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[var(--text-secondary)]">Forecast Bust:</span>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                  analog.did_bust
                    ? 'bg-[var(--risk-extreme)]/15 text-[var(--risk-extreme)] border-[var(--risk-extreme)]/30'
                    : 'bg-[var(--safe-green)]/15 text-[var(--safe-green)] border-[var(--safe-green)]/30'
                }`}
              >
                {analog.did_bust ? 'YES (BUST)' : 'NO (ACCURATE)'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
