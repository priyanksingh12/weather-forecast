'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { motion } from 'framer-motion';
import { ForecastVsActualData } from '../../lib/api/types';
import { Award, AlertTriangle, CheckCircle2, TrendingUp, Activity, Droplets } from 'lucide-react';

interface Props {
  data: ForecastVsActualData | null;
  loading?: boolean;
}

export const ForecastVsActualChart: React.FC<Props> = ({ data, loading = false }) => {
  const [viewStyle, setViewStyle] = useState<'area' | 'bars'>('area');

  if (loading) {
    return (
      <div className="h-72 rounded-2xl border border-[var(--border)] bg-[var(--surface)] animate-pulse flex items-center justify-center">
        <span className="text-xs text-[var(--text-secondary)] font-mono">Loading verification audit...</span>
      </div>
    );
  }

  if (!data || !data.points.length) {
    return (
      <div className="h-72 rounded-2xl border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center p-6 text-center space-y-2">
        <AlertTriangle className="h-8 w-8 text-[var(--risk-watch)]" />
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">No verified history available for this region.</h4>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm">
          Truth observation assimilation is expanding to cover this district. The platform never displays fabricated historical figures.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(...data.points.map((p) => Math.max(p.forecast_value, p.observed_value)), 10);
  const bustCount = data.points.filter((p) => p.is_bust).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-5 space-y-4 shadow-xl"
    >
      {/* Header - Stacked Pattern */}
      <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-4">
        {/* Top Section: Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Forecast vs Observed Truth</h4>
            <span className="text-xs font-mono text-[var(--weather-blue)] bg-[var(--weather-blue)]/15 px-2 py-0.5 rounded border border-[var(--weather-blue)]/30 font-bold">
              Day {data.lead_day} Lead Audit
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Validating forecasts against matured satellite and airport truth observations
          </p>
        </div>

        {/* Controls Row Underneath */}
        <div className="pt-2.5 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-2.5 w-full">
          <div className="flex items-center bg-[var(--muted-surface)] p-1 rounded-xl border border-[var(--border)] text-xs">
            <button
              onClick={() => setViewStyle('area')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewStyle === 'area' ? 'bg-[var(--weather-blue)] text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Recharts Area
            </button>
            <button
              onClick={() => setViewStyle('bars')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewStyle === 'bars' ? 'bg-[var(--weather-blue)] text-white shadow-xs' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Columns
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs">
            <Award className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span className="text-[var(--text-secondary)]">Truth:</span>
            <span className="font-mono text-[var(--weather-blue)] font-semibold">{data.points[0]?.truth_source || 'NASA IMERG'}</span>
          </div>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[var(--weather-blue)]"></span>
          <span>Forecast ({data.unit})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded bg-[var(--safe-green)]"></span>
          <span>Observed Truth</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--risk-extreme)]">
          <span className="h-2.5 w-2.5 rounded bg-[var(--risk-extreme)]"></span>
          <span>Bust Days ({bustCount} / {data.points.length})</span>
        </div>
      </div>

      {/* Main Chart Area */}
      {viewStyle === 'area' ? (
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="observedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--safe-green)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--safe-green)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis 
                dataKey="valid_date" 
                stroke="var(--text-secondary)" 
                fontSize={10} 
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <YAxis 
                stroke="var(--text-secondary)" 
                fontSize={10} 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const pt = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xl text-xs font-mono space-y-1">
                      <div className="font-bold text-[var(--text-primary)]">{pt.valid_date}</div>
                      <div className="text-[var(--weather-blue)]">Forecast: {pt.forecast_value} {data.unit}</div>
                      <div className="text-[var(--safe-green)]">Observed: {pt.observed_value} {data.unit}</div>
                      <div className={pt.is_bust ? 'text-[var(--risk-extreme)] font-bold' : 'text-[var(--text-secondary)]'}>
                        Error: {pt.error > 0 ? `+${pt.error}` : pt.error} {data.unit} {pt.is_bust ? '(BUST)' : ''}
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="forecast_value"
                name="Forecast"
                stroke="var(--weather-blue)"
                strokeWidth={2}
                fill="url(#forecastAreaGrad)"
              />
              <Area
                type="monotone"
                dataKey="observed_value"
                name="Observed Truth"
                stroke="var(--safe-green)"
                strokeWidth={2}
                fill="url(#observedAreaGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-2 pt-2">
          <div className="h-56 flex items-end gap-1.5 pt-6 pb-2 overflow-x-auto">
            {data.points.map((pt) => {
              const fHeight = (pt.forecast_value / maxVal) * 100;
              const oHeight = (pt.observed_value / maxVal) * 100;

              return (
                <div
                  key={pt.valid_date}
                  className="group relative flex-1 min-w-[20px] h-full flex items-end justify-center gap-0.5"
                >
                  <div
                    className="w-2 rounded-t bg-[var(--weather-blue)]/80 group-hover:bg-[var(--weather-blue)] transition-all"
                    style={{ height: `${Math.max(4, fHeight)}%` }}
                  />

                  <div
                    className={`w-2 rounded-t transition-all ${
                      pt.is_bust
                        ? 'bg-[var(--risk-extreme)] group-hover:brightness-110 shadow-sm'
                        : 'bg-[var(--safe-green)]/80 group-hover:bg-[var(--safe-green)]'
                    }`}
                    style={{ height: `${Math.max(4, oHeight)}%` }}
                  />

                  <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col z-20 rounded-lg bg-[var(--surface)] border border-[var(--border)] p-2 text-[10px] font-mono text-[var(--text-primary)] shadow-xl whitespace-nowrap pointer-events-none">
                    <span className="font-bold text-[var(--text-secondary)]">{pt.valid_date}</span>
                    <span className="text-[var(--weather-blue)]">Forecast: {pt.forecast_value} {data.unit}</span>
                    <span className="text-[var(--safe-green)]">Truth: {pt.observed_value} {data.unit}</span>
                    <span className={pt.is_bust ? 'text-[var(--risk-extreme)] font-bold' : 'text-[var(--text-secondary)]'}>
                      Error: {pt.error > 0 ? `+${pt.error}` : pt.error} {data.unit} {pt.is_bust ? '(BUST)' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-mono border-t border-[var(--border)] pt-1">
            <span>{data.points[0]?.valid_date}</span>
            <span>Timeline (Matured Valid Dates)</span>
            <span>{data.points[data.points.length - 1]?.valid_date}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};
