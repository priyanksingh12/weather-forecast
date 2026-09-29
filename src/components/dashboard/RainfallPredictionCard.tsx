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
import { Droplets, TrendingUp, CloudRain, Activity } from 'lucide-react';
import { RegionalData } from '../../lib/data/regionalIntelligence';

interface RainfallPredictionCardProps {
  predictionData?: RegionalData['rainfallPrediction'];
}

export const RainfallPredictionCard: React.FC<RainfallPredictionCardProps> = ({ predictionData }) => {
  const DEFAULT_DATA = [
    { hour: 0, label: '12 AM', val: 2, isObserved: true },
    { hour: 2, label: '2 AM', val: 4, isObserved: true },
    { hour: 4, label: '4 AM', val: 6, isObserved: true },
    { hour: 6, label: '6 AM', val: 12, isObserved: true },
    { hour: 8, label: '8 AM', val: 22, isObserved: true },
    { hour: 10, label: '10 AM', val: 36, isObserved: true },
    { hour: 12, label: '12 PM', val: 48, isObserved: true },
    { hour: 14, label: '2 PM', val: 41, isObserved: false },
    { hour: 16, label: '4 PM', val: 34, isObserved: false },
    { hour: 18, label: '6 PM', val: 24, isObserved: false },
    { hour: 20, label: '8 PM', val: 14, isObserved: false },
    { hour: 22, label: '10 PM', val: 6, isObserved: false },
  ];

  const rawItems = predictionData && predictionData.length > 0 ? predictionData : DEFAULT_DATA;
  const maxVal = Math.max(60, ...rawItems.map((i) => i.val * 1.15));

  // Find pivot point where observation ends and prediction begins
  const lastObservedIdx = rawItems.findLastIndex ? rawItems.findLastIndex(d => d.isObserved) : 6;

  // Format data for Recharts AreaChart
  const chartData = rawItems.map((d, idx) => {
    return {
      label: d.label,
      hour: d.hour,
      total: d.val,
      observed: idx <= lastObservedIdx ? d.val : null,
      predicted: idx >= lastObservedIdx ? d.val : null,
      isObserved: d.isObserved
    };
  });

  const peakRain = Math.max(...rawItems.map(d => d.val));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs transition-all h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]">
            <Droplets className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)] flex items-center gap-1.5">
              <span>Rainfall Prediction</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] font-mono font-bold">
                24H Radar
              </span>
            </h3>
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              Calibrated hourly radar accumulation
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-[var(--weather-blue)]">
            <span className="h-2 w-2 rounded-full bg-[var(--weather-blue)]" />
            <span>Observed</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--forecast-blue)]">
            <span className="w-3 border-b-2 border-dashed border-[var(--forecast-blue)]" />
            <span>Predicted</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="relative my-3 pt-2 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id="rainfallObservedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="rainfallPredictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--forecast-blue)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--forecast-blue)" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--border)" 
              opacity={0.5} 
            />

            <XAxis 
              dataKey="label" 
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
              domain={[0, Math.ceil(maxVal / 10) * 10]}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xl text-xs font-mono">
                    <div className="font-bold text-[var(--text-primary)] mb-1 flex items-center justify-between gap-3">
                      <span>{d.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        d.isObserved ? 'bg-[var(--weather-blue)]/20 text-[var(--weather-blue)]' : 'bg-[var(--forecast-blue)]/20 text-[var(--forecast-blue)]'
                      }`}>
                        {d.isObserved ? 'Observed' : 'Predicted'}
                      </span>
                    </div>
                    <div className="text-[var(--text-secondary)] flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                      <span>Intensity:</span>
                      <strong className="text-[var(--text-primary)] font-bold">{d.total} mm/h</strong>
                    </div>
                  </div>
                );
              }}
            />

            {/* Observed Curve */}
            <Area
              type="monotone"
              dataKey="observed"
              stroke="var(--weather-blue)"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#rainfallObservedGradient)"
              activeDot={{ r: 4, stroke: 'var(--weather-blue)', strokeWidth: 2, fill: 'var(--surface)' }}
            />

            {/* Predicted Curve */}
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="var(--forecast-blue)"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#rainfallPredictedGradient)"
              activeDot={{ r: 4, stroke: 'var(--forecast-blue)', strokeWidth: 2, fill: 'var(--surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-[10px] font-mono text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-[var(--safe-green)]" />
          <span>Peak: <strong className="text-[var(--text-primary)]">{peakRain} mm/h</strong></span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-[var(--weather-blue)]" />
          <span>IMD & IMERG Calibrated</span>
        </div>
      </div>
    </motion.div>
  );
};
