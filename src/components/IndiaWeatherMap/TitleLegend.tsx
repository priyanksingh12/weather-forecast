'use client';

import React from 'react';

interface TitleLegendProps {
  day?: number;
}

export const TitleLegend: React.FC<TitleLegendProps> = ({
  day = 1
}) => {
  return (
    <div
      className="absolute top-5 left-6 z-10 select-none pointer-events-auto max-w-sm sm:max-w-md p-3 rounded-2xl bg-[var(--surface)]/90 backdrop-blur-md border border-[var(--border)] shadow-sm"
      style={{
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div className="flex items-center gap-2">
        <h1
          className="text-xl sm:text-2xl font-bold m-0 leading-tight text-[var(--text-primary)]"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          India 3D Atmosphere
        </h1>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30">
          Day {day} NWP
        </span>
      </div>
      <p className="m-0 text-xs sm:text-[0.82rem] text-[var(--text-secondary)] mt-1 font-medium">
        Live Atmospheric Telemetry · Click any state to view values
      </p>

      {/* Legend: Blue for Rain, Grey for Wind */}
      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
          <i className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#6AA8B9] shadow-xs" />
          Rain (Blue)
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
          <i className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#94A3B8] shadow-xs" />
          Wind (Grey)
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <i className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[#7A9DAA]" />
          Both
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <i className="inline-block w-2.5 h-2.5 rounded-[3px] bg-[var(--muted-surface)] border border-[var(--border)]" />
          Calm
        </span>
      </div>
    </div>
  );
};
