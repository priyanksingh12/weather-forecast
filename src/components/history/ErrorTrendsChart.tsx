'use client';

import React from 'react';
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
import { ErrorTrendsData } from '../../lib/api/types';
import { TrendingUp, Activity, BarChart2, Heart, Droplets } from 'lucide-react';

interface Props {
  data: ErrorTrendsData | null;
  loading?: boolean;
}

export const ErrorTrendsChart: React.FC<Props> = ({ data, loading = false }) => {
  if (loading || !data || !data.trends.length) {
    return (
      <div className="h-64 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] animate-pulse flex items-center justify-center">
        <span className="text-xs text-[var(--text-secondary)] font-mono">Loading error trend metrics...</span>
      </div>
    );
  }

  const latest = data.trends[data.trends.length - 1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-5 space-y-4 shadow-xl"
    >
      {/* Header - Stacked Pattern */}
      <div className="flex flex-col gap-2.5 border-b border-[var(--border)] pb-3.5">
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--weather-blue)]" />
            <span>Historical Error Performance Trends</span>
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Rolling metrics for {data.region_name} at Day {data.lead_day}
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--border)]/70 flex items-center justify-between gap-2">
          <span className="text-xs font-mono text-[var(--text-secondary)]">Verification Rolling Baseline</span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--safe-green)] bg-[var(--safe-green)]/15 px-2.5 py-1 rounded-full border border-[var(--safe-green)]/30">
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>Recharts V3 Stream</span>
          </div>
        </div>
      </div>

      {/* Aggregate Scorecards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-0.5">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase">MAE</span>
          <div className="text-xl font-bold font-mono text-[var(--weather-blue)]">
            {latest.mae} <span className="text-xs text-[var(--text-secondary)]">{data.unit}</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Mean Absolute Error</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-0.5">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase">RMSE</span>
          <div className="text-xl font-bold font-mono text-[var(--risk-watch)]">
            {latest.rmse} <span className="text-xs text-[var(--text-secondary)]">{data.unit}</span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Root Mean Square Error</span>
        </div>

        <div className="p-3 rounded-xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-0.5">
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold uppercase">Bust Rate</span>
          <div className="text-xl font-bold font-mono text-[var(--risk-extreme)]">
            {Math.round(latest.bust_rate * 100)}%
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Exceeds Tolerance</span>
        </div>
      </div>

      {/* Recharts Area Chart for Error Trends */}
      <div className="h-40 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.trends} margin={{ top: 8, right: 10, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="maeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="rmseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--risk-watch)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--risk-watch)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis 
              dataKey="date" 
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
                const t = payload[0].payload;
                return (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xl text-xs font-mono space-y-1">
                    <div className="font-bold text-[var(--text-primary)]">{t.date}</div>
                    <div className="text-[var(--weather-blue)]">MAE: {t.mae} {data.unit}</div>
                    <div className="text-[var(--risk-watch)]">RMSE: {t.rmse} {data.unit}</div>
                    <div className="text-[var(--risk-extreme)]">Bust Rate: {Math.round(t.bust_rate * 100)}%</div>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="mae"
              name="MAE"
              stroke="var(--weather-blue)"
              strokeWidth={2}
              fill="url(#maeGrad)"
            />
            <Area
              type="monotone"
              dataKey="rmse"
              name="RMSE"
              stroke="var(--risk-watch)"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fill="url(#rmseGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono border-t border-[var(--border)] pt-2">
        <span>{data.trends[0]?.date}</span>
        <span>Rolling 30-Day Evaluation Window</span>
        <span>{latest?.date}</span>
      </div>
    </motion.div>
  );
};
