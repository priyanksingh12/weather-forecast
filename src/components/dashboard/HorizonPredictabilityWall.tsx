'use client';

import React, { useEffect, useState } from 'react';
import { weatherApi, HorizonData, HorizonDay } from '../../services/api';
import { WeatherVariable } from '../../lib/api/types';
import { 
  TrendingDown, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Flame, 
  ArrowRight,
  Maximize2,
  Activity,
  Heart,
  TrendingUp,
  Droplets,
  Wind
} from 'lucide-react';
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

interface Props {
  regionSlug: string;
  variable: WeatherVariable;
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export const HorizonPredictabilityWall: React.FC<Props> = ({
  regionSlug,
  variable,
  selectedDay,
  onSelectDay
}) => {
  const [data, setData] = useState<HorizonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    weatherApi.getHorizon(regionSlug, variable)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.warn('Failed to load horizon data:', err);
      })
      .finally(() => setLoading(false));
  }, [regionSlug, variable]);

  if (loading && !data) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-base font-mono text-[var(--weather-blue)] font-bold">
          Computing 10-Day Predictability Horizon & Bust Wall Decay...
        </span>
      </div>
    );
  }

  if (!data) return null;

  const currentDayData = data.horizon_days.find((d) => d.lead_day === selectedDay) || data.horizon_days[0];
  const bustWallDay = data.bust_horizon_day || 5;

  return (
    <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Top Badges - Stacked Pattern */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6">
        {/* Top Section: Title & Subtitle */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border border-[var(--risk-watch)]/40 shrink-0">
              <TrendingDown className="h-6 w-6" />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              10-Day Predictability Horizon & Bust Wall
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium pl-1 leading-relaxed">
            Deterministic Skill Decay · Operational Cutoff: <span className="text-[var(--risk-watch)] font-bold">Day {data.operational_cutoff_day} ({data.operational_cutoff_day * 24}h)</span>
          </p>
        </div>

        {/* Predictability Wall Indicator Row Underneath */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3.5 w-full">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--risk-extreme)]/20 border border-[var(--risk-extreme)]/50 text-[var(--risk-extreme)] text-xs sm:text-sm font-mono font-black shadow-sm">
            <Flame className="h-4 w-4 text-[var(--risk-extreme)] animate-pulse" />
            <span>PREDICTABILITY WALL: DAY {bustWallDay}</span>
          </div>
        </div>
      </div>

      {/* Recharts 10-Day Predictability Decay & Bust Envelope */}
      <div className="p-4 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--text-secondary)] font-bold flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Skill Horizon Decay vs Bust Risk Elevation</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[var(--weather-blue)]">
              <span className="h-2 w-2 rounded-full bg-[var(--weather-blue)]" />
              <span>Confidence Skill (%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--risk-high)]">
              <span className="h-2 w-2 rounded-full bg-[var(--risk-high)]" />
              <span>Bust Probability (%)</span>
            </span>
          </div>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data.horizon_days.map((hd) => ({
                day: hd.lead_day,
                label: `D${hd.lead_day} (${hd.lead_hours}h)`,
                confidence: hd.confidence_score,
                bust: hd.bust_probability,
                mae: hd.expected_mae
              }))} 
              margin={{ top: 8, right: 12, left: -22, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  onSelectDay(e.activePayload[0].payload.day);
                }
              }}
            >
              <defs>
                <linearGradient id="decayConfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="decayBustGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BA6A6A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#BA6A6A" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
              <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--text-secondary)" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5 shadow-xl text-xs font-mono space-y-1">
                      <div className="font-bold text-[var(--text-primary)]">Day {d.day} (+{d.day * 24}h)</div>
                      <div className="text-[var(--weather-blue)]">Confidence: {d.confidence}%</div>
                      <div className="text-[var(--risk-high)]">Bust Probability: {d.bust}%</div>
                      <div className="text-[var(--text-secondary)]">Expected MAE: ±{d.mae}</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine x={`D${bustWallDay} (${bustWallDay * 24}h)`} stroke="var(--risk-extreme)" strokeDasharray="3 3" label={{ value: 'WALL', fill: 'var(--risk-extreme)', fontSize: 9, position: 'top' }} />
              <Area type="monotone" dataKey="confidence" name="Confidence" stroke="var(--weather-blue)" strokeWidth={2} fill="url(#decayConfGrad)" />
              <Area type="monotone" dataKey="bust" name="Bust Risk" stroke="#BA6A6A" strokeWidth={2} strokeDasharray="3 3" fill="url(#decayBustGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 10-Day Scrubber Cards */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)] px-1">
          <span>SELECT LEAD DAY TO INSPECT (DAY 1 TO 10):</span>
          <span>WALL CUTOFF: DAY {bustWallDay} (120H)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
          {data.horizon_days.map((hd) => {
            const isSelected = hd.lead_day === selectedDay;
            const isWall = hd.is_bust_wall || hd.lead_day === bustWallDay;
            const isPostWall = hd.lead_day > bustWallDay;

            let borderColor = 'border-[var(--border)]';
            let bgStyle = 'bg-[var(--muted-surface)]';
            let textColor = 'text-[var(--safe-green)]';

            if (hd.confidence_score < 30) {
              textColor = 'text-[var(--risk-extreme)]';
              if (isSelected) {
                borderColor = 'border-[var(--risk-extreme)]';
                bgStyle = 'bg-[var(--risk-extreme)]/20 shadow-md';
              }
            } else if (hd.confidence_score < 50) {
              textColor = 'text-[var(--risk-watch)]';
              if (isSelected) {
                borderColor = 'border-[var(--risk-watch)]';
                bgStyle = 'bg-[var(--risk-watch)]/20 shadow-md';
              }
            } else {
              if (isSelected) {
                borderColor = 'border-[var(--weather-blue)]';
                bgStyle = 'bg-[var(--weather-blue)]/20 shadow-md';
              }
            }

            return (
              <button
                key={hd.lead_day}
                onClick={() => onSelectDay(hd.lead_day)}
                className={`relative p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${borderColor} ${bgStyle} ${
                  isSelected ? 'scale-105 z-10' : 'hover:border-[var(--weather-blue)]/40 hover:bg-[var(--muted-surface)]'
                }`}
              >
                {/* Wall Badge */}
                {isWall && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full bg-[var(--risk-extreme)] text-white text-[9px] font-black uppercase tracking-wider shadow">
                    WALL
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                      D{hd.lead_day}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {hd.lead_hours}h
                    </span>
                  </div>

                  <div className={`text-xl sm:text-2xl font-mono font-black mt-1 ${textColor}`}>
                    {hd.confidence_score.toFixed(0)}%
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--border)] text-[10px] font-mono flex justify-between text-[var(--text-secondary)]">
                  <span>MAE:</span>
                  <span className="text-[var(--text-primary)] font-bold">{hd.expected_mae.toFixed(1)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Deep Dive Panel */}
      {currentDayData && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[var(--weather-blue)]/20 text-[var(--weather-blue)] font-mono font-black text-sm border border-[var(--weather-blue)]/40">
                Day {currentDayData.lead_day} ({currentDayData.lead_hours} Hours)
              </span>
              <span className="text-base font-bold text-[var(--text-primary)]">
                Detailed Lead Intelligence
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[var(--text-secondary)]">Confidence Band:</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold ${
                currentDayData.confidence_band === 'HIGH'
                  ? 'bg-[var(--safe-green)]/20 text-[var(--safe-green)] border border-[var(--safe-green)]/40'
                  : currentDayData.confidence_band === 'MODERATE'
                  ? 'bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border border-[var(--risk-watch)]/40'
                  : 'bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)] border border-[var(--risk-extreme)]/40'
              }`}>
                {currentDayData.confidence_band}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {/* 1. Bust Probability */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                Bust Probability
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--risk-extreme)]">
                {currentDayData.bust_probability.toFixed(1)}%
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Chances model exceeds acceptable error bounds
              </p>
            </div>

            {/* 2. Expected MAE */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                Expected Mean Error
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--risk-watch)]">
                ±{currentDayData.expected_mae.toFixed(2)}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Historical error distribution at this lead time
              </p>
            </div>

            {/* 3. Model Divergence */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                ECMWF vs GFS Confidence
              </span>
              <div className="text-lg font-mono font-bold text-[var(--text-primary)] pt-1">
                ECMWF: <span className="text-[var(--weather-blue)] font-black">{currentDayData.ecmwf_confidence ?? 50}%</span> · GFS: <span className="text-[var(--ai-indigo)] font-black">{currentDayData.gfs_confidence ?? 45}%</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Inter-model confidence divergence
              </p>
            </div>
          </div>

          {/* Uncertainty Driver */}
          <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--weather-blue)]">
              Primary Uncertainty Driver:
            </span>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {currentDayData.primary_uncertainty_driver}
            </p>
          </div>
        </div>
      )}

      {/* Operational Advisory Banner */}
      <div className="p-5 rounded-2xl bg-[var(--risk-watch)]/10 border-2 border-[var(--risk-watch)]/30 flex items-start gap-3.5">
        <AlertTriangle className="h-6 w-6 text-[var(--risk-watch)] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-mono font-black uppercase tracking-wider text-[var(--risk-watch)] block">
            Official Operational Advisory:
          </span>
          <p className="text-sm sm:text-base text-[var(--text-primary)] font-medium leading-relaxed">
            {data.operational_guidance_en || `High deterministic reliability holds through Day 4. Beyond Day ${bustWallDay}, forecast uncertainty increases rapidly. Do not allocate irreversible civil defense resources without ensemble verification.`}
          </p>
        </div>
      </div>
    </div>
  );
};
