'use client';

import React from 'react';
import { StateMeshUserData } from './types';
import { getConditions } from './WeatherDialog';

interface Props {
  data: StateMeshUserData | null;
  x: number;
  y: number;
}

export const WeatherTooltip: React.FC<Props> = ({ data, x, y }) => {
  if (!data) return null;

  const conditions = getConditions(data.w);
  const condText = conditions.map((c) => c.t).join(' · ');

  return (
    <div
      className="fixed z-40 pointer-events-none rounded-xl bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] p-2.5 px-3 text-xs text-[var(--text-primary)] shadow-xl transition-all duration-75 space-y-1"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -125%)',
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-1">
        <span className="font-bold text-sm text-[var(--text-primary)]" style={{ fontFamily: 'Fraunces, serif' }}>
          {data.name}
        </span>
        <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--muted-surface)] text-[var(--text-secondary)] border border-[var(--border)]">
          {condText}
        </span>
      </div>

      <div className="flex items-center gap-3 pt-0.5 text-xs font-mono">
        <span className="flex items-center gap-1 font-semibold text-[var(--weather-blue)]">
          <span className="text-xs">🌧️</span>
          <span>{data.w.rain} mm</span>
        </span>
        <span className="text-[var(--border)]">|</span>
        <span className="flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
          <span className="text-xs">💨</span>
          <span>{data.w.wind} m/s</span>
        </span>
        {data.w.temp !== null && (
          <>
            <span className="text-[var(--border)]">|</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {data.w.temp}°C
            </span>
          </>
        )}
      </div>
    </div>
  );
};
