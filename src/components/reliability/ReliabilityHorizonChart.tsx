'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  ReferenceLine 
} from 'recharts';
import { motion } from 'framer-motion';
import { DayReliabilityPoint } from '../../lib/api/types';
import { getBustColor } from '../../lib/utils/colors';
import { ReliabilityBandBadge } from './ReliabilityBandBadge';
import { TrendingUp, Activity, Heart, Droplets, Wind, Layers } from 'lucide-react';

interface Props {
  horizon: DayReliabilityPoint[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  unit: string;
}

export const ReliabilityHorizonChart: React.FC<Props> = ({
  horizon,
  selectedDay,
  onSelectDay,
  unit
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayReliabilityPoint | null>(null);
  const [viewMode, setViewMode] = useState<'area' | 'list'>('area');

  if (!horizon || !horizon.length) return null;

  // Format data for Recharts AreaChart
  const chartData = horizon.map((pt) => {
    const bustPct = Math.round(pt.p_bust_cal * 100);
    return {
      day: pt.lead_day,
      label: `D${pt.lead_day} (${pt.lead_day * 24}h)`,
      bustProbability: bustPct,
      confidenceScore: pt.confidence_score,
      forecastValue: pt.forecast_value,
      confidenceBand: pt.confidence_band,
      raw: pt
    };
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 space-y-4 shadow-xl"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>Forecast Reliability Horizon</span>
            <span className="text-xs font-mono text-[var(--weather-blue)] bg-[var(--weather-blue)]/10 px-2 py-0.5 rounded border border-[var(--weather-blue)]/20">
              Day 1 → Day 10
            </span>
          </h4>
          <p className="text-xs text-[var(--text-secondary)]">
            Probability of forecast bust across lead days. Reliability degrades as lead increases.
          </p>
        </div>

        {/* View Toggle & Hover preview */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-[var(--muted-surface)] p-1 rounded-xl border border-[var(--border)] text-xs">
            <button
              onClick={() => setViewMode('area')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'area' ? 'bg-[var(--weather-blue)] text-white shadow-xs' : 'text-[var(--text-secondary)]'
              }`}
            >
              Recharts Curve
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-[var(--weather-blue)] text-white shadow-xs' : 'text-[var(--text-secondary)]'
              }`}
            >
              Day Bands
            </button>
          </div>

          {hoveredDay ? (
            <div className="text-right flex items-center gap-2 self-start sm:self-auto bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
              <div className="text-right">
                <div className="text-xs font-bold text-[var(--text-primary)]">Day {hoveredDay.lead_day}</div>
                <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                  Bust: {Math.round(hoveredDay.p_bust_cal * 100)}% · Trust: {hoveredDay.confidence_score}%
                </div>
              </div>
              <ReliabilityBandBadge band={hoveredDay.confidence_band} size="sm" />
            </div>
          ) : (
            <div className="text-[11px] text-[var(--text-secondary)] font-mono hidden md:block">
              Hover point to inspect
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      {viewMode === 'area' ? (
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const clickedDay = e.activePayload[0].payload.day;
                  onSelectDay(clickedDay);
                }
              }}
            >
              <defs>
                <linearGradient id="bustGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BA6A6A" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#BA6A6A" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
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
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xl text-xs font-mono space-y-1">
                      <div className="font-bold text-[var(--text-primary)]">Day {d.day} (+{d.day * 24}h)</div>
                      <div className="text-[var(--risk-high)] font-bold">Bust Risk: {d.bustProbability}%</div>
                      <div className="text-[var(--weather-blue)]">Confidence: {d.confidenceScore}%</div>
                      <div className="text-[var(--text-secondary)]">Forecast: {d.forecastValue} {unit}</div>
                      <div className="text-[10px] text-[var(--safe-green)] font-semibold uppercase">{d.confidenceBand} BAND</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine y={50} stroke="var(--risk-extreme)" strokeDasharray="3 3" label={{ value: 'WALL THRESHOLD', fill: 'var(--risk-extreme)', fontSize: 9, position: 'right' }} />
              <Area
                type="monotone"
                dataKey="bustProbability"
                name="Bust Probability"
                stroke="#BA6A6A"
                strokeWidth={2.5}
                fill="url(#bustGrad)"
                activeDot={{ r: 5, stroke: '#BA6A6A', strokeWidth: 2, fill: 'var(--surface)' }}
              />
              <Area
                type="monotone"
                dataKey="confidenceScore"
                name="Trust Score"
                stroke="var(--weather-blue)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#trustGrad)"
                activeDot={{ r: 4, stroke: 'var(--weather-blue)', strokeWidth: 2, fill: 'var(--surface)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="space-y-2 pt-1">
          {horizon.map((point) => {
            const isSelected = point.lead_day === selectedDay;
            const pBustPercent = Math.round(point.p_bust_cal * 100);
            const color = getBustColor(point.p_bust_cal);

            return (
              <div
                key={point.lead_day}
                onClick={() => onSelectDay(point.lead_day)}
                onMouseEnter={() => setHoveredDay(point)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`group flex items-center gap-3 p-2 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-[var(--weather-blue)]/50 bg-[var(--weather-blue)]/10 shadow-sm'
                    : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--muted-surface)]'
                }`}
              >
                <div className="w-16 shrink-0 flex items-center justify-between">
                  <span className={`text-xs font-mono font-semibold ${isSelected ? 'text-[var(--weather-blue)]' : 'text-[var(--text-secondary)]'}`}>
                    Day {point.lead_day}
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-mono">
                    +{point.lead_day * 24}h
                  </span>
                </div>

                <div className="flex-1 h-3.5 bg-[var(--background)] rounded-full overflow-hidden p-0.5 border border-[var(--border)]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(8, pBustPercent)}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 10px ${color}80`
                    }}
                  />
                </div>

                <div className="w-24 shrink-0 text-right">
                  <div className="text-xs font-mono font-bold" style={{ color }}>
                    {pBustPercent}% bust
                  </div>
                  <div className="text-[10px] text-[var(--text-secondary)] font-mono">
                    {point.forecast_value} {unit}
                  </div>
                </div>

                <div className="w-20 shrink-0 hidden sm:block text-right">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color }}
                  >
                    {point.confidence_band}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Axis notes */}
      <div className="flex justify-between items-center text-[10px] text-[var(--text-secondary)] font-mono pt-2 border-t border-[var(--border)]">
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-[var(--safe-green)]" />
          <span>Day 1 (High assimilation certainty)</span>
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-[var(--risk-extreme)]" />
          <span>Day 10 (Predictability threshold limit)</span>
        </span>
      </div>
    </motion.div>
  );
};
