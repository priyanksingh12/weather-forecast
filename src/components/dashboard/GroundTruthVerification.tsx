'use client';

import React, { useEffect, useState } from 'react';
import { weatherApi } from '../../services/api';
import { WeatherVariable } from '../../lib/api/types';
import { 
  CheckCircle, 
  History, 
  ShieldAlert, 
  Database, 
  Activity, 
  TrendingUp, 
  Sliders,
  Filter
} from 'lucide-react';

interface FvaPoint {
  valid_time_utc: string;
  forecast: number;
  truth: number;
  truth_source: string;
  error: number;
  is_bust: boolean;
}

interface FvaResponse {
  region: { id: number; slug: string; name: string; type: string };
  variable: string;
  unit: string;
  lead_day: number;
  truth_sources: string[];
  points: FvaPoint[];
}

interface Props {
  regionSlug: string;
  variable: WeatherVariable;
}

export const GroundTruthVerification: React.FC<Props> = ({
  regionSlug,
  variable
}) => {
  const [data, setData] = useState<FvaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<number>(1);
  const [windowDays, setWindowDays] = useState<number>(30);

  useEffect(() => {
    setLoading(true);
    weatherApi.getHistoryFva(regionSlug, variable, lead, windowDays)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.warn('Failed to load FVA data:', err);
      })
      .finally(() => setLoading(false));
  }, [regionSlug, variable, lead, windowDays]);

  if (loading && !data) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-base font-mono text-[var(--weather-blue)] font-bold">
          Querying Historical Verification Archive (IMERG & AWS Ground-Truth)...
        </span>
      </div>
    );
  }

  if (!data || !data.points || data.points.length === 0) {
    return null;
  }

  // Calculate live metrics from ground truth points
  const points = data.points;
  const absErrors = points.map((p) => Math.abs(p.error));
  const mae = absErrors.reduce((a, b) => a + b, 0) / (points.length || 1);
  const rmse = Math.sqrt(points.map((p) => p.error * p.error).reduce((a, b) => a + b, 0) / (points.length || 1));
  const bustCount = points.filter((p) => p.is_bust || Math.abs(p.error) > 15).length;
  const bustRate = (bustCount / (points.length || 1)) * 100;
  const unit = data.unit || (variable === 'rainfall' ? 'mm' : '°C');

  // Find max value for chart scaling
  const maxVal = Math.max(
    ...points.map((p) => Math.max(p.forecast, p.truth)),
    20
  );

  return (
    <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Controls - Stacked Pattern */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shrink-0">
              <History className="h-6 w-6" />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Ground-Truth Verification (FVA)
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium pl-1 leading-relaxed">
            NWP Forecast vs Observed Truth ({data.truth_sources.join(', ')})
          </p>
        </div>

        {/* Filter Selectors Row Underneath: Lead Day & Window */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Lead Day Switcher */}
            <div className="flex items-center gap-1.5 bg-[var(--muted-surface)] p-1.5 rounded-2xl border border-[var(--border)] text-xs sm:text-sm">
              <span className="text-[var(--text-secondary)] px-2 font-mono font-bold">Lead Day:</span>
              {[1, 3, 5, 7].map((l) => (
                <button
                  key={l}
                  onClick={() => setLead(l)}
                  className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all cursor-pointer ${
                    lead === l
                      ? 'bg-[var(--weather-blue)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  D{l}
                </button>
              ))}
            </div>

            {/* Window Switcher */}
            <div className="flex items-center gap-1.5 bg-[var(--muted-surface)] p-1.5 rounded-2xl border border-[var(--border)] text-xs sm:text-sm">
              <span className="text-[var(--text-secondary)] px-2 font-mono font-bold">Window:</span>
              {[7, 14, 30].map((w) => (
                <button
                  key={w}
                  onClick={() => setWindowDays(w)}
                  className={`px-3 py-1.5 rounded-xl font-mono font-bold transition-all cursor-pointer ${
                    windowDays === w
                      ? 'bg-[var(--forecast-blue)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {w}d
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--safe-green)] animate-ping" />
            <span>Audited against NASA GPM IMERG V07 + IMD AWS</span>
          </div>
        </div>
      </div>

      {/* 4 Summary Metric Boxes with Enlarged Typography */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Mean Absolute Error */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Observed MAE
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--risk-watch)]">
            {mae.toFixed(2)} <span className="text-base sm:text-lg font-normal text-[var(--text-secondary)]">{unit}</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Mean error across {points.length} verification days
          </p>
        </div>

        {/* Metric 2: RMSE */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            RMSE (Penalized)
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--text-primary)]">
            {rmse.toFixed(2)} <span className="text-base sm:text-lg font-normal text-[var(--text-secondary)]">{unit}</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Root mean square error
          </p>
        </div>

        {/* Metric 3: Historical Bust Rate */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Observed Bust Rate
          </span>
          <div className={`text-4xl sm:text-5xl font-mono font-black ${
            bustRate > 25 ? 'text-[var(--risk-extreme)]' : bustRate > 10 ? 'text-[var(--risk-watch)]' : 'text-[var(--safe-green)]'
          }`}>
            {bustRate.toFixed(1)}%
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            {bustCount} of {points.length} cycles failed bounds
          </p>
        </div>

        {/* Metric 4: Satellite & AWS Sources */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Ground Truth Source
          </span>
          <div className="text-xl sm:text-2xl font-mono font-bold text-[var(--weather-blue)] flex items-center gap-2 truncate pt-1">
            <Database className="h-5 w-5 text-[var(--weather-blue)] shrink-0" />
            <span className="truncate">{data.truth_sources[0] || 'NASA IMERG'}</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Calibrated satellite precipitation
          </p>
        </div>
      </div>

      {/* Verification Timeline Graph */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-sm bg-[var(--weather-blue)] inline-block shadow-sm"></span>
              <span className="text-[var(--text-secondary)] font-semibold">Forecast</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-sm bg-[var(--ai-indigo)] inline-block shadow-sm"></span>
              <span className="text-[var(--text-secondary)] font-semibold">Observed Truth (IMERG)</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-sm bg-[var(--risk-extreme)] inline-block"></span>
              <span className="text-[var(--risk-extreme)] font-mono font-bold">Bust Event</span>
            </span>
          </div>
          <span className="font-mono text-[var(--text-secondary)] hidden sm:inline">
            Timeline (Past {points.length} verification days)
          </span>
        </div>

        {/* Bar/Pill Visualization */}
        <div className="h-56 w-full flex items-end gap-1 sm:gap-2 pt-6 pb-2 px-1 overflow-x-auto border-b border-[var(--border)]">
          {points.map((pt, idx) => {
            const forecastHeight = Math.max(8, (pt.forecast / maxVal) * 100);
            const truthHeight = Math.max(8, (pt.truth / maxVal) * 100);
            const dateStr = pt.valid_time_utc ? new Date(pt.valid_time_utc).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : `Day ${idx + 1}`;
            const isBust = pt.is_bust || Math.abs(pt.error) > 15;

            return (
              <div 
                key={idx} 
                className="flex-1 min-w-[20px] max-w-[42px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
              >
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col z-30 bg-[var(--surface)] border border-[var(--border)] p-2.5 rounded-xl shadow-2xl text-[11px] whitespace-nowrap pointer-events-none">
                  <span className="font-bold text-[var(--text-primary)]">{dateStr}</span>
                  <span className="text-[var(--weather-blue)] font-mono">Forecast: {pt.forecast.toFixed(1)} {unit}</span>
                  <span className="text-[var(--ai-indigo)] font-mono">Truth: {pt.truth.toFixed(1)} {unit}</span>
                  <span className={`font-mono font-bold ${pt.error > 0 ? 'text-[var(--risk-watch)]' : 'text-[var(--weather-blue)]'}`}>
                    Error: {pt.error > 0 ? `+${pt.error.toFixed(1)}` : pt.error.toFixed(1)} {unit}
                  </span>
                  {isBust && (
                    <span className="text-[var(--risk-extreme)] font-bold uppercase mt-0.5">⚠️ Model Bust Event</span>
                  )}
                </div>

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  {/* Forecast Bar */}
                  <div
                    className="w-1/2 rounded-t bg-[var(--weather-blue)] group-hover:brightness-125 transition-all"
                    style={{ height: `${forecastHeight}%` }}
                  />
                  {/* Truth Bar */}
                  <div
                    className={`w-1/2 rounded-t transition-all ${
                      isBust ? 'bg-[var(--risk-extreme)] shadow-sm' : 'bg-[var(--ai-indigo)] group-hover:brightness-125'
                    }`}
                    style={{ height: `${truthHeight}%` }}
                  />
                </div>

                {/* Date Label */}
                <span className="text-[9px] font-mono text-[var(--text-secondary)] mt-1 truncate w-full text-center">
                  {dateStr.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
