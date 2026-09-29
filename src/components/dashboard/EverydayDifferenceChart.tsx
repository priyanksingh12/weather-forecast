'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { weatherApi, HorizonData, HorizonDay } from '../../services/api';
import { WeatherVariable } from '../../lib/api/types';
import { 
  TrendingUp, 
  TrendingDown, 
  GitCommit, 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Activity, 
  AlertTriangle,
  Info,
  Calendar,
  Zap,
  BarChart3,
  Droplets,
  Wind,
  Heart
} from 'lucide-react';

interface Props {
  regionSlug: string;
  variable: WeatherVariable;
  selectedLeadDay: number;
  onSelectLeadDay: (day: number) => void;
}

interface DayDiffPoint {
  day: number;
  dayLabel: string;
  hours: number;
  ecmwfVal: number;
  gfsVal: number;
  spread: number;
  dayOverDayDelta: number;
  confidence: number;
  bustProb: number;
  expectedMae: number;
  driver: string;
  isWall: boolean;
}

export const EverydayDifferenceChart: React.FC<Props> = ({
  regionSlug,
  variable,
  selectedLeadDay,
  onSelectLeadDay
}) => {
  const [horizonData, setHorizonData] = useState<HorizonData | null>(null);
  const [forecastValues, setForecastValues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bars'>('area');
  const [viewMode, setViewMode] = useState<'spread' | 'day_over_day' | 'mae'>('spread');
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch both horizon and forecast series
  useEffect(() => {
    setLoading(true);
    Promise.all([
      weatherApi.getHorizon(regionSlug, variable).catch(() => null),
      weatherApi.getForecast(regionSlug, variable).catch(() => null)
    ])
      .then(([horizonRes, forecastRes]) => {
        if (horizonRes) setHorizonData(horizonRes);
        if (forecastRes && forecastRes.values) setForecastValues(forecastRes.values);
      })
      .finally(() => setLoading(false));
  }, [regionSlug, variable]);

  // Auto-play lead day progression with Framer Motion
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onSelectLeadDay(selectedLeadDay >= 10 ? 1 : selectedLeadDay + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, selectedLeadDay, onSelectLeadDay]);

  if (loading && !horizonData) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-base font-mono text-[var(--weather-blue)] font-bold">
          Synthesizing Everyday Forecast Differences & Divergence Metrics...
        </span>
      </div>
    );
  }

  // Synthesize 10 days of difference points
  const days: DayDiffPoint[] = (horizonData?.horizon_days || []).map((hd, idx, arr) => {
    const dayForecasts = forecastValues.filter((f) => f.lead_day === hd.lead_day);
    const baseVal = dayForecasts.length > 0 
      ? dayForecasts.reduce((sum, f) => sum + f.value, 0) / dayForecasts.length 
      : (variable === 'rainfall' ? 24 - idx * 1.8 : 28 + Math.sin(idx) * 3);

    const spread = hd.model_spread ?? (idx + 1) * (variable === 'rainfall' ? 1.4 : 0.6);
    const ecmwfVal = +(baseVal + spread * 0.4).toFixed(1);
    const gfsVal = +(baseVal - spread * 0.6).toFixed(1);

    let dayOverDayDelta = 0;
    if (idx > 0) {
      const prevDayForecasts = forecastValues.filter((f) => f.lead_day === arr[idx - 1].lead_day);
      const prevBase = prevDayForecasts.length > 0
        ? prevDayForecasts.reduce((sum, f) => sum + f.value, 0) / prevDayForecasts.length
        : baseVal;
      dayOverDayDelta = +(baseVal - prevBase).toFixed(1);
    }

    return {
      day: hd.lead_day,
      dayLabel: `D${hd.lead_day} (${hd.lead_hours}h)`,
      hours: hd.lead_hours,
      ecmwfVal,
      gfsVal,
      spread: +spread.toFixed(1),
      dayOverDayDelta,
      confidence: hd.confidence_score,
      bustProb: hd.bust_probability,
      expectedMae: hd.expected_mae,
      driver: hd.primary_uncertainty_driver,
      isWall: hd.is_bust_wall || hd.lead_day === (horizonData?.bust_horizon_day ?? 5)
    };
  });

  const unit = variable === 'rainfall' ? 'mm' : variable === 'tmax' ? '°C' : variable === 'wind' ? 'm/s' : 'hPa';
  const activePoint = days.find((d) => d.day === selectedLeadDay) || days[0];

  const maxSpread = Math.max(...days.map((d) => d.spread), 5);
  const maxMae = Math.max(...days.map((d) => d.expectedMae), 5);
  const maxDelta = Math.max(...days.map((d) => Math.abs(d.dayOverDayDelta)), 5);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-6 sm:p-8 space-y-6"
    >
      {/* Title & Mode Switcher - Stacked Pattern */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6">
        {/* Top Section: Title & Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shrink-0">
              <BarChart3 className="h-6 w-6 text-[var(--weather-blue)]" />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Everyday Forecast Difference & Model Divergence
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium pl-1 flex flex-wrap items-center gap-2.5 leading-relaxed">
            <span>Tracking inter-model divergence and day-over-day flip-flops across Lead Day 1 to 10</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--safe-green)] bg-[var(--safe-green)]/15 px-2.5 py-0.5 rounded-full border border-[var(--safe-green)]/30">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
              Recharts Telemetry
            </span>
          </p>
        </div>

        {/* View Mode Buttons & Timeline Playback Row Underneath */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3.5 w-full">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Chart Rendering Toggle: Area vs Bars */}
            <div className="flex items-center gap-1 bg-[var(--muted-surface)] p-1 rounded-2xl border border-[var(--border)]">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Recharts Area
              </button>
              <button
                onClick={() => setChartType('bars')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  chartType === 'bars'
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Interactive Columns
              </button>
            </div>

            <div className="flex items-center gap-1 bg-[var(--muted-surface)] p-1 rounded-2xl border border-[var(--border)]">
              <button
                onClick={() => setViewMode('spread')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'spread'
                    ? 'bg-[var(--forecast-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                ECMWF vs GFS Spread
              </button>
              <button
                onClick={() => setViewMode('day_over_day')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'day_over_day'
                    ? 'bg-[var(--forecast-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Day Drift
              </button>
              <button
                onClick={() => setViewMode('mae')}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'mae'
                    ? 'bg-[var(--forecast-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Expected MAE
              </button>
            </div>
          </div>

          {/* Animate / Playback Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
              isPlaying
                ? 'bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border-[var(--risk-watch)]/50 shadow-md'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--muted-surface)] hover:text-[var(--text-primary)]'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-[var(--weather-blue)]" />}
            <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Framer-Motion Chart Area */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-6">
        {/* Dynamic Header Metrics for the Active Selected Day */}
        {activePoint && (
          <motion.div 
            key={activePoint.day}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[var(--border)] pb-5"
          >
            {/* Active Day Pill */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                <span>Active Horizon</span>
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--weather-blue)] flex items-center gap-2">
                <span>Day {activePoint.day}</span>
                <span className="text-xs text-[var(--text-secondary)] font-normal">({activePoint.hours}h)</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {activePoint.isWall ? '⚠️ Predictability Wall boundary' : 'Deterministic evaluation'}
              </p>
            </div>

            {/* Everyday Spread */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[var(--risk-watch)]" />
                <span>Everyday Divergence (Δ)</span>
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--risk-watch)]">
                {activePoint.spread} <span className="text-sm font-normal text-[var(--text-secondary)]">{unit}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                ECMWF ({activePoint.ecmwfVal} {unit}) vs GFS ({activePoint.gfsVal} {unit})
              </p>
            </div>

            {/* Day over Day Jump */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-[var(--safe-green)]" />
                <span>Day-Over-Day Shift</span>
              </span>
              <div className={`text-2xl sm:text-3xl font-mono font-black ${
                Math.abs(activePoint.dayOverDayDelta) > 5 ? 'text-[var(--risk-extreme)]' : 'text-[var(--safe-green)]'
              }`}>
                {activePoint.dayOverDayDelta > 0 ? `+${activePoint.dayOverDayDelta}` : activePoint.dayOverDayDelta} <span className="text-sm font-normal text-[var(--text-secondary)]">{unit}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                24h trend delta vs Day {Math.max(1, activePoint.day - 1)}
              </p>
            </div>

            {/* Bust Probability */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                <span>Bust Probability</span>
              </span>
              <div className={`text-2xl sm:text-3xl font-mono font-black ${
                activePoint.bustProb > 50 ? 'text-[var(--risk-extreme)]' : 'text-[var(--weather-blue)]'
              }`}>
                {activePoint.bustProb.toFixed(1)}%
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Expected MAE: ±{activePoint.expectedMae.toFixed(1)} {unit}
              </p>
            </div>
          </motion.div>
        )}

        {/* Graphical Representation: Recharts AreaChart or Animated Columns */}
        {chartType === 'area' ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)]">
              <span>DAY 1 (24H)</span>
              <span className="text-[var(--risk-watch)] font-bold">PREDICTABILITY WALL (DAY 5)</span>
              <span>DAY 10 (240H)</span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={days} 
                  margin={{ top: 12, right: 12, left: -10, bottom: 6 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedDay = e.activePayload[0].payload.day;
                      onSelectLeadDay(clickedDay);
                    }
                  }}
                >
                  <defs>
                    <linearGradient id="ecmwfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gfsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--forecast-blue)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--forecast-blue)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="spreadGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#BA6A6A" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#BA6A6A" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />

                  <XAxis 
                    dataKey="dayLabel" 
                    stroke="var(--text-secondary)" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                  />

                  <YAxis 
                    stroke="var(--text-secondary)" 
                    fontSize={11} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}${unit}`}
                  />

                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as DayDiffPoint;
                      return (
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-2xl text-xs font-mono space-y-1.5">
                          <div className="font-bold text-[var(--text-primary)] text-sm flex items-center justify-between gap-4">
                            <span>Day {d.day} ({d.hours}h)</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${d.isWall ? 'bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)]' : 'bg-[var(--safe-green)]/20 text-[var(--safe-green)]'}`}>
                              {d.isWall ? 'Wall Exceeded' : 'Reliable'}
                            </span>
                          </div>
                          <div className="text-[var(--weather-blue)]">ECMWF IFS: {d.ecmwfVal} {unit}</div>
                          <div className="text-[var(--forecast-blue)]">NOAA GFS: {d.gfsVal} {unit}</div>
                          <div className="text-[var(--risk-watch)] font-bold">Inter-Model Spread: {d.spread} {unit}</div>
                          <div className="text-[var(--text-secondary)]">Bust Probability: {d.bustProb.toFixed(1)}%</div>
                          <div className="text-[10px] text-[var(--text-secondary)] italic border-t border-[var(--border)] pt-1">
                            Click point to inspect
                          </div>
                        </div>
                      );
                    }}
                  />

                  <ReferenceLine x="D5 (120h)" stroke="var(--risk-extreme)" strokeDasharray="3 3" label={{ value: 'WALL', fill: 'var(--risk-extreme)', fontSize: 10, position: 'top' }} />

                  {/* ECMWF IFS Area */}
                  <Area
                    type="monotone"
                    dataKey="ecmwfVal"
                    name="ECMWF IFS"
                    stroke="var(--weather-blue)"
                    strokeWidth={2.5}
                    fill="url(#ecmwfGradient)"
                  />

                  {/* NOAA GFS Area */}
                  <Area
                    type="monotone"
                    dataKey="gfsVal"
                    name="NOAA GFS"
                    stroke="var(--forecast-blue)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fill="url(#gfsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Columns view */
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)]">
              <span>DAY 1 (24H)</span>
              <span className="text-[var(--risk-watch)] font-bold">PREDICTABILITY WALL (DAY 5)</span>
              <span>DAY 10 (240H)</span>
            </div>

            <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 border-b border-[var(--border)] relative">
              <div className="absolute top-0 bottom-0 left-[48%] w-[2px] bg-[var(--risk-extreme)]/60 border-l border-dashed border-[var(--risk-extreme)] pointer-events-none z-10 flex flex-col justify-between">
                <span className="bg-[var(--risk-extreme)] text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow self-center -mt-2 uppercase">
                  Wall
                </span>
                <span className="bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)] text-[9px] font-mono px-1 py-0.5 rounded border border-[var(--risk-extreme)]/40 self-center mb-1">
                  &gt;50% Bust
                </span>
              </div>

              {days.map((d) => {
                const isSelected = d.day === selectedLeadDay;
                let metricVal = d.spread;
                let maxBound = maxSpread;
                let barColor = 'from-[var(--weather-blue)] to-[var(--forecast-blue)]';

                if (viewMode === 'day_over_day') {
                  metricVal = Math.abs(d.dayOverDayDelta);
                  maxBound = maxDelta;
                  barColor = d.dayOverDayDelta >= 0 ? 'from-[var(--risk-watch)] to-[var(--risk-high)]' : 'from-[var(--weather-blue)] to-[var(--ai-indigo)]';
                } else if (viewMode === 'mae') {
                  metricVal = d.expectedMae;
                  maxBound = maxMae;
                  barColor = d.day > 5 ? 'from-[var(--risk-high)] to-[var(--risk-extreme)]' : 'from-[var(--safe-green)] to-[var(--atmospheric-teal)]';
                }

                const heightPct = Math.min(100, Math.max(12, (metricVal / (maxBound || 1)) * 100));

                return (
                  <div
                    key={d.day}
                    onClick={() => onSelectLeadDay(d.day)}
                    className="flex-1 h-full flex flex-col justify-end items-center group cursor-pointer relative"
                  >
                    <span className={`text-[10px] sm:text-xs font-mono font-bold mb-1.5 transition-colors ${
                      isSelected ? 'text-[var(--weather-blue)] font-black scale-110' : 'text-[var(--text-secondary)]'
                    }`}>
                      {metricVal.toFixed(1)}
                    </span>

                    <div className="w-full max-w-[38px] flex items-end justify-center h-full">
                      <motion.div
                        layout
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ 
                          type: 'spring', 
                          damping: 20, 
                          stiffness: 120,
                          duration: 0.4
                        }}
                        className={`w-full rounded-t-xl bg-gradient-to-t ${barColor} transition-all ${
                          isSelected 
                            ? 'brightness-125 shadow-md border-2 border-[var(--border)]' 
                            : 'opacity-85 hover:opacity-100'
                        }`}
                      />
                    </div>

                    <div className={`mt-2 flex flex-col items-center font-mono ${
                      isSelected ? 'text-[var(--weather-blue)] font-extrabold' : 'text-[var(--text-secondary)]'
                    }`}>
                      <span className="text-xs sm:text-sm">D{d.day}</span>
                      {isSelected && (
                        <motion.span 
                          layoutId="active-dot" 
                          className="h-1.5 w-1.5 rounded-full bg-[var(--weather-blue)] mt-0.5" 
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Explainability Bar for the Active Selected Day */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePoint.day}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-start gap-3"
          >
            <Info className="h-5 w-5 text-[var(--weather-blue)] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm">
              <span className="font-bold text-[var(--text-primary)] block">
                Why does Day {activePoint.day} diverge by {activePoint.spread} {unit}?
              </span>
              <p className="text-[var(--text-secondary)] leading-relaxed font-sans">
                {activePoint.driver}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
