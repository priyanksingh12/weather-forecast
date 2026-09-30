'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { weatherApi } from '../../services/api';
import { WeatherVariable } from '../../lib/api/types';
import { 
  getSynthesizedDifferencePoints, 
  normalizeVariable,
  DayDiffPoint
} from '../../lib/data/horizonIntelligence';
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
  Heart,
  CloudRain,
  Thermometer,
  Gauge
} from 'lucide-react';

interface Props {
  regionSlug: string;
  variable: WeatherVariable;
  selectedLeadDay: number;
  onSelectLeadDay: (day: number) => void;
  onVariableChange?: (v: WeatherVariable) => void;
}

export const EverydayDifferenceChart: React.FC<Props> = ({
  regionSlug,
  variable,
  selectedLeadDay,
  onSelectLeadDay,
  onVariableChange
}) => {
  const normVar = normalizeVariable(variable);

  // Instantly available calibrated points
  const [points, setPoints] = useState<DayDiffPoint[]>(() => getSynthesizedDifferencePoints(regionSlug, normVar));
  const [chartType, setChartType] = useState<'area' | 'bars'>('area');
  const [viewMode, setViewMode] = useState<'spread' | 'day_over_day' | 'mae'>('spread');
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync points when regionSlug or variable changes
  useEffect(() => {
    const synthPoints = getSynthesizedDifferencePoints(regionSlug, normVar);
    setPoints(synthPoints);

    // Optionally fetch backend updates
    let isMounted = true;
    Promise.all([
      weatherApi.getHorizon(regionSlug, normVar).catch(() => null),
      weatherApi.getForecast(regionSlug, normVar).catch(() => null)
    ]).then(([horizonRes, forecastRes]) => {
      if (!isMounted) return;
      if (horizonRes && horizonRes.horizon_days && horizonRes.horizon_days.length > 0) {
        // Enhance points with live backend data if available
        const enhanced = synthPoints.map((sp, idx) => {
          const liveHd = horizonRes.horizon_days.find((h) => h.lead_day === sp.day);
          if (!liveHd) return sp;
          return {
            ...sp,
            confidence: liveHd.confidence_score ?? sp.confidence,
            bustProb: liveHd.bust_probability ?? sp.bustProb,
            expectedMae: liveHd.expected_mae ?? sp.expectedMae,
            spread: liveHd.model_spread ?? sp.spread,
            driver: liveHd.primary_uncertainty_driver || sp.driver,
            isWall: liveHd.is_bust_wall ?? sp.isWall
          };
        });
        setPoints(enhanced);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [regionSlug, normVar]);

  // Auto-play timeline progression
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      onSelectLeadDay(selectedLeadDay >= 10 ? 1 : selectedLeadDay + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, [isPlaying, selectedLeadDay, onSelectLeadDay]);

  const unit = normVar === 'rainfall' ? 'mm' : normVar === 'tmax' ? '°C' : normVar === 'wind' ? 'm/s' : 'hPa';
  const varLabel = normVar === 'rainfall' ? 'Rainfall' : normVar === 'tmax' ? 'Temperature' : normVar === 'wind' ? 'Wind Speed' : 'Pressure (MSLP)';

  const activePoint = useMemo(() => {
    return points.find((d) => d.day === selectedLeadDay) || points[0];
  }, [points, selectedLeadDay]);

  const maxSpread = Math.max(...points.map((d) => d.spread), 5);
  const maxMae = Math.max(...points.map((d) => d.expectedMae), 5);
  const maxDelta = Math.max(...points.map((d) => Math.abs(d.dayOverDayDelta)), 5);

  const METRIC_BUTTONS = [
    { id: 'rainfall' as WeatherVariable, label: 'Rainfall', icon: CloudRain },
    { id: 'tmax' as WeatherVariable, label: 'Temperature', icon: Thermometer },
    { id: 'wind' as WeatherVariable, label: 'Wind Speed', icon: Wind },
    { id: 'mslp' as WeatherVariable, label: 'Pressure', icon: Gauge },
  ];

  const handleMetricClick = (newVar: WeatherVariable) => {
    if (onVariableChange) {
      onVariableChange(newVar);
    } else {
      setPoints(getSynthesizedDifferencePoints(regionSlug, normalizeVariable(newVar)));
    }
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shrink-0">
                <BarChart3 className="h-6 w-6 text-[var(--weather-blue)]" />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                Everyday Forecast Difference & Model Divergence
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium pl-1 flex flex-wrap items-center gap-2.5 leading-relaxed">
              <span>Evaluating inter-model divergence & day-over-day flip-flops for <strong className="text-[var(--text-primary)]">{varLabel}</strong></span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--safe-green)] bg-[var(--safe-green)]/15 px-2.5 py-0.5 rounded-full border border-[var(--safe-green)]/30">
                <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                Active Recharts Matrix
              </span>
            </p>
          </div>

          {/* Metric Selector Pills inside Header */}
          <div className="flex items-center gap-1.5 bg-[var(--muted-surface)] p-1 rounded-2xl border border-[var(--border)] self-start sm:self-auto flex-wrap">
            {METRIC_BUTTONS.map((m) => {
              const Icon = m.icon;
              const isActive = normVar === normalizeVariable(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleMetricClick(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                  title={`Switch to ${m.label}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
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

            {/* Adjacent 3 Filters (Spread, Day Drift, Expected MAE) */}
            <div className="flex items-center gap-1 bg-[var(--muted-surface)] p-1 rounded-2xl border border-[var(--border)]">
              <button
                onClick={() => setViewMode('spread')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'spread'
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>ECMWF vs GFS Spread</span>
              </button>
              <button
                onClick={() => setViewMode('day_over_day')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'day_over_day'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Day Drift</span>
              </button>
              <button
                onClick={() => setViewMode('mae')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'mae'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Expected MAE</span>
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
            <span>{isPlaying ? 'Pause Timeline' : 'Play Timeline'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] space-y-6">
        {/* Dynamic Header Metrics for the Active Selected Day */}
        {activePoint && (
          <motion.div 
            key={`${activePoint.day}-${normVar}-${viewMode}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[var(--border)] pb-5"
          >
            {/* Active Day Pill */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                <span>Active Lead Horizon</span>
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--weather-blue)] flex items-center gap-2">
                <span>Day {activePoint.day}</span>
                <span className="text-xs text-[var(--text-secondary)] font-normal">({activePoint.hours}h)</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                {activePoint.isWall ? '⚠️ Predictability Wall boundary' : 'Deterministic forecast horizon'}
              </p>
            </div>

            {/* Everyday Spread */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-[var(--risk-watch)]" />
                <span>Inter-Model Spread (Δ)</span>
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
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>Day-Over-Day Shift</span>
              </span>
              <div className={`text-2xl sm:text-3xl font-mono font-black ${
                Math.abs(activePoint.dayOverDayDelta) > 5 ? 'text-[var(--risk-extreme)]' : 'text-emerald-500'
              }`}>
                {activePoint.dayOverDayDelta > 0 ? `+${activePoint.dayOverDayDelta}` : activePoint.dayOverDayDelta} <span className="text-sm font-normal text-[var(--text-secondary)]">{unit}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                24h trend drift vs Day {Math.max(1, activePoint.day - 1)}
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

        {/* Graphical Representation: Reactive Recharts AreaChart for ALL 3 Filter Modes */}
        {chartType === 'area' ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <span className="text-[var(--text-primary)] font-bold flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 uppercase">
                  {viewMode === 'spread' ? 'Mode: ECMWF vs GFS Divergence' : viewMode === 'day_over_day' ? 'Mode: Day-Over-Day Shift & Volatility' : 'Mode: Expected Mean Absolute Error & Bust Risk'}
                </span>
                <span className="text-[var(--text-secondary)]">({varLabel} in {unit})</span>
              </span>

              <div className="flex items-center gap-3">
                {viewMode === 'spread' && (
                  <>
                    <span className="flex items-center gap-1.5 text-[var(--weather-blue)] font-semibold">
                      <span className="h-2 w-2 rounded-full bg-[var(--weather-blue)]" />
                      <span>ECMWF IFS</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                      <span>NOAA GFS</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span>Spread (Δ)</span>
                    </span>
                  </>
                )}
                {viewMode === 'day_over_day' && (
                  <>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>24h Forecast Drift</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <span className="h-2 w-2 rounded-full bg-[var(--border)]" />
                      <span>Zero Baseline</span>
                    </span>
                  </>
                )}
                {viewMode === 'mae' && (
                  <>
                    <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      <span>Expected MAE (±{unit})</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                      <span className="h-2 w-2 rounded-full bg-purple-400" />
                      <span>Bust Probability (%)</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  key={`${normVar}-${viewMode}`}
                  data={points} 
                  margin={{ top: 14, right: 14, left: -10, bottom: 6 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      const clickedDay = e.activePayload[0].payload.day;
                      onSelectLeadDay(clickedDay);
                    }
                  }}
                >
                  <defs>
                    {/* Spread Gradients */}
                    <linearGradient id="ecmwfGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="gfsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="spreadAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                    {/* Day Drift Gradients */}
                    <linearGradient id="driftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    {/* MAE Gradients */}
                    <linearGradient id="maeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="bustGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
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

                  {/* Mode-Specific Y-Axis */}
                  {viewMode === 'mae' ? (
                    <YAxis 
                      stroke="var(--text-secondary)" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `±${v}${unit}`}
                    />
                  ) : viewMode === 'day_over_day' ? (
                    <YAxis 
                      stroke="var(--text-secondary)" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}${unit}`}
                    />
                  ) : (
                    <YAxis 
                      stroke="var(--text-secondary)" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}${unit}`}
                    />
                  )}

                  {/* Active Selected Day Marker Line */}
                  <ReferenceLine 
                    x={activePoint.dayLabel} 
                    stroke="var(--weather-blue)" 
                    strokeWidth={2.5} 
                    strokeDasharray="3 3"
                    label={{ value: `ACTIVE D${activePoint.day}`, fill: 'var(--weather-blue)', fontSize: 10, position: 'insideTopLeft' }} 
                  />

                  {/* Wall Reference Line */}
                  <ReferenceLine 
                    x="D5 (120h)" 
                    stroke="var(--risk-extreme)" 
                    strokeDasharray="4 4" 
                    label={{ value: 'WALL', fill: 'var(--risk-extreme)', fontSize: 10, position: 'top' }} 
                  />

                  {/* Zero Drift Line in Day Drift mode */}
                  {viewMode === 'day_over_day' && (
                    <ReferenceLine y={0} stroke="var(--text-secondary)" strokeWidth={1.5} label={{ value: '0 DRIFT', fill: 'var(--text-secondary)', fontSize: 9, position: 'right' }} />
                  )}

                  {/* Dynamic Tooltip */}
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const d = payload[0].payload as DayDiffPoint;
                      return (
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-2xl text-xs font-mono space-y-1.5 min-w-[200px]">
                          <div className="font-bold text-[var(--text-primary)] text-sm flex items-center justify-between gap-4 border-b border-[var(--border)] pb-1.5">
                            <span>Day {d.day} ({d.hours}h)</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] ${d.day === selectedLeadDay ? 'bg-[var(--weather-blue)]/20 text-[var(--weather-blue)] font-bold' : ''}`}>
                              {d.day === selectedLeadDay ? 'Selected' : 'Click to inspect'}
                            </span>
                          </div>

                          {viewMode === 'spread' && (
                            <>
                              <div className="text-[var(--weather-blue)] font-bold">ECMWF IFS: {d.ecmwfVal} {unit}</div>
                              <div className="text-cyan-400 font-bold">NOAA GFS: {d.gfsVal} {unit}</div>
                              <div className="text-amber-400 font-bold pt-1 border-t border-[var(--border)]">
                                Inter-Model Spread: {d.spread} {unit}
                              </div>
                            </>
                          )}

                          {viewMode === 'day_over_day' && (
                            <>
                              <div className="text-emerald-400 font-bold">
                                24h Forecast Drift: {d.dayOverDayDelta > 0 ? `+${d.dayOverDayDelta}` : d.dayOverDayDelta} {unit}
                              </div>
                              <div className="text-[var(--text-secondary)]">ECMWF Value: {d.ecmwfVal} {unit}</div>
                              <div className="text-[var(--text-secondary)]">GFS Value: {d.gfsVal} {unit}</div>
                            </>
                          )}

                          {viewMode === 'mae' && (
                            <>
                              <div className="text-rose-500 font-bold">Expected MAE: ±{d.expectedMae} {unit}</div>
                              <div className="text-purple-400 font-bold">Bust Probability: {d.bustProb.toFixed(1)}%</div>
                              <div className="text-[var(--weather-blue)]">Confidence Score: {d.confidence.toFixed(1)}%</div>
                            </>
                          )}

                          <div className="text-[10px] text-[var(--text-secondary)] pt-1 border-t border-[var(--border)] italic">
                            Uncertainty: {d.driver}
                          </div>
                        </div>
                      );
                    }}
                  />

                  {/* 1. SPREAD MODE RENDERING */}
                  {viewMode === 'spread' && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="ecmwfVal"
                        name="ECMWF IFS"
                        stroke="var(--weather-blue)"
                        strokeWidth={2.5}
                        fill="url(#ecmwfGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="gfsVal"
                        name="NOAA GFS"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fill="url(#gfsGradient)"
                      />
                      <Area
                        type="monotone"
                        dataKey="spread"
                        name="Spread (Δ)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#spreadAreaGrad)"
                      />
                    </>
                  )}

                  {/* 2. DAY DRIFT MODE RENDERING */}
                  {viewMode === 'day_over_day' && (
                    <Area
                      type="monotone"
                      dataKey="dayOverDayDelta"
                      name="Day Drift"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#driftGrad)"
                    />
                  )}

                  {/* 3. MAE MODE RENDERING */}
                  {viewMode === 'mae' && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="expectedMae"
                        name="Expected MAE"
                        stroke="#f43f5e"
                        strokeWidth={2.5}
                        fill="url(#maeGrad)"
                      />
                      <Area
                        type="monotone"
                        dataKey="bustProb"
                        name="Bust Probability"
                        stroke="#a855f7"
                        strokeWidth={2}
                        strokeDasharray="3 3"
                        fill="url(#bustGrad)"
                      />
                    </>
                  )}
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

              {points.map((d) => {
                const isSelected = d.day === selectedLeadDay;
                let metricVal = d.spread;
                let maxBound = maxSpread;
                let barColor = 'from-[var(--weather-blue)] to-[var(--forecast-blue)]';

                if (viewMode === 'day_over_day') {
                  metricVal = Math.abs(d.dayOverDayDelta);
                  maxBound = maxDelta;
                  barColor = d.dayOverDayDelta >= 0 ? 'from-emerald-500 to-teal-400' : 'from-rose-500 to-amber-500';
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
                            ? 'brightness-125 shadow-md border-2 border-[var(--border)] ring-2 ring-[var(--weather-blue)]/50' 
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
            key={`${activePoint.day}-${normVar}-${viewMode}`}
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
