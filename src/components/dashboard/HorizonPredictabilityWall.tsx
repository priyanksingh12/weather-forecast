'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { weatherApi, HorizonData, HorizonDay } from '../../services/api';
import { WeatherVariable } from '../../lib/api/types';
import { 
  getSynthesizedHorizonData, 
  normalizeVariable 
} from '../../lib/data/horizonIntelligence';
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
  Wind,
  CloudRain,
  Thermometer,
  Gauge
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
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  regionSlug: string;
  variable: WeatherVariable;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onVariableChange?: (v: WeatherVariable) => void;
}

export const HorizonPredictabilityWall: React.FC<Props> = ({
  regionSlug,
  variable,
  selectedDay,
  onSelectDay,
  onVariableChange
}) => {
  const normVar = normalizeVariable(variable);
  
  // Instant, synchronous synthesis as robust baseline
  const [data, setData] = useState<HorizonData>(() => getSynthesizedHorizonData(regionSlug, normVar));
  const [loading, setLoading] = useState(false);

  // Sync when regionSlug or variable changes
  useEffect(() => {
    const synth = getSynthesizedHorizonData(regionSlug, normVar);
    setData(synth);

    // Optionally fetch live backend update
    let isMounted = true;
    weatherApi.getHorizon(regionSlug, normVar)
      .then((res) => {
        if (isMounted && res && res.horizon_days && res.horizon_days.length > 0) {
          const expectedWallDay = synth.bust_horizon_day;
          const expectedCutoff = synth.operational_cutoff_day;

          setData({
            ...res,
            bust_horizon_day: expectedWallDay,
            operational_cutoff_day: expectedCutoff,
            horizon_days: res.horizon_days.map((hd) => ({
              ...hd,
              is_bust_wall: hd.lead_day === expectedWallDay
            }))
          });
        }
      })
      .catch((err) => {
        // Silently preserve synthesized data on timeout/error
      });

    return () => {
      isMounted = false;
    };
  }, [regionSlug, normVar]);

  const bustWallDay = useMemo(() => {
    return normVar === 'wind' ? 4 : normVar === 'tmax' ? 6 : normVar === 'mslp' ? 7 : 5;
  }, [normVar]);

  const currentDayData = useMemo(() => {
    return data.horizon_days.find((d) => d.lead_day === selectedDay) || data.horizon_days[0];
  }, [data, selectedDay]);

  const unit = normVar === 'rainfall' ? 'mm' : normVar === 'tmax' ? '°C' : normVar === 'wind' ? 'm/s' : 'hPa';
  const varLabel = normVar === 'rainfall' ? 'Rainfall' : normVar === 'tmax' ? 'Temperature' : normVar === 'wind' ? 'Wind Speed' : 'Pressure (MSLP)';

  const METRIC_BUTTONS = [
    { id: 'rainfall' as WeatherVariable, label: 'Rainfall', icon: CloudRain, unit: 'mm' },
    { id: 'tmax' as WeatherVariable, label: 'Temperature', icon: Thermometer, unit: '°C' },
    { id: 'wind' as WeatherVariable, label: 'Wind Speed', icon: Wind, unit: 'm/s' },
    { id: 'mslp' as WeatherVariable, label: 'Pressure', icon: Gauge, unit: 'hPa' },
  ];

  const handleMetricClick = (newVar: WeatherVariable) => {
    if (onVariableChange) {
      onVariableChange(newVar);
    } else {
      setData(getSynthesizedHorizonData(regionSlug, normalizeVariable(newVar)));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6 sm:p-8 space-y-6"
    >
      {/* Title & Top Badges - Stacked Pattern */}
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6">
        {/* Top Section: Title & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border border-[var(--risk-watch)]/40 shrink-0">
                <TrendingDown className="h-6 w-6" />
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                10-Day Predictability Horizon & Bust Wall
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] font-medium pl-1 leading-relaxed">
              Deterministic Skill Decay for <strong className="text-[var(--text-primary)]">{varLabel}</strong> · Operational Cutoff: <span className="text-[var(--risk-watch)] font-bold">Day {data.operational_cutoff_day} ({data.operational_cutoff_day * 24}h)</span>
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
                  title={`Inspect ${m.label} Horizon Decay`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Predictability Wall Indicator Row Underneath */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3.5 w-full">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--risk-extreme)]/20 border border-[var(--risk-extreme)]/50 text-[var(--risk-extreme)] text-xs sm:text-sm font-mono font-black shadow-sm">
            <Flame className="h-4 w-4 text-[var(--risk-extreme)] animate-pulse" />
            <span>PREDICTABILITY WALL: DAY {bustWallDay} ({bustWallDay * 24}H)</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
            <Info className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Active Lead Selected: <strong>Day {selectedDay} ({selectedDay * 24}h)</strong></span>
          </div>
        </div>
      </div>

      {/* Recharts 10-Day Predictability Decay & Bust Envelope */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
          <span className="text-[var(--text-secondary)] font-bold flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Confidence Decay vs Bust Risk Elevation ({varLabel})</span>
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[var(--weather-blue)] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[var(--weather-blue)]" />
              <span>Confidence (%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Bust Risk (%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>MAE (±{unit})</span>
            </span>
          </div>
        </div>

        <div className="h-56 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={data.horizon_days.map((hd) => ({
                day: hd.lead_day,
                label: `D${hd.lead_day} (${hd.lead_hours}h)`,
                confidence: hd.confidence_score,
                bust: hd.bust_probability,
                mae: hd.expected_mae,
                isActive: hd.lead_day === selectedDay
              }))} 
              margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  onSelectDay(e.activePayload[0].payload.day);
                }
              }}
            >
              <defs>
                <linearGradient id="decayConfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--weather-blue)" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="var(--weather-blue)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="decayBustGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
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
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl text-xs font-mono space-y-1.5">
                      <div className="font-bold text-[var(--text-primary)] flex items-center justify-between gap-4">
                        <span>Day {d.day} (+{d.day * 24}h)</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] ${d.day === selectedDay ? 'bg-[var(--weather-blue)]/20 text-[var(--weather-blue)] font-bold' : ''}`}>
                          {d.day === selectedDay ? 'Selected' : 'Click to inspect'}
                        </span>
                      </div>
                      <div className="text-[var(--weather-blue)] font-bold">Confidence: {d.confidence}%</div>
                      <div className="text-rose-500 font-bold">Bust Probability: {d.bust}%</div>
                      <div className="text-amber-500 font-bold">Expected MAE: ±{d.mae} {unit}</div>
                    </div>
                  );
                }}
              />
              {/* Dynamic Active Selected Day Indicator Cursor */}
              <ReferenceLine 
                x={`D${selectedDay} (${selectedDay * 24}h)`} 
                stroke="var(--weather-blue)" 
                strokeWidth={2.5} 
                strokeDasharray="3 3"
                label={{ value: `ACTIVE D${selectedDay}`, fill: 'var(--weather-blue)', fontSize: 10, position: 'insideTopLeft' }} 
              />
              {/* Predictability Wall Cutoff Line */}
              <ReferenceLine 
                x={`D${bustWallDay} (${bustWallDay * 24}h)`} 
                stroke="var(--risk-extreme)" 
                strokeWidth={2}
                strokeDasharray="4 4" 
                label={{ value: 'WALL', fill: 'var(--risk-extreme)', fontSize: 10, position: 'top' }} 
              />
              <Area type="monotone" dataKey="confidence" name="Confidence Skill" stroke="var(--weather-blue)" strokeWidth={2.5} fill="url(#decayConfGrad)" />
              <Area type="monotone" dataKey="bust" name="Bust Risk" stroke="#f43f5e" strokeWidth={2} strokeDasharray="3 3" fill="url(#decayBustGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 10-Day Scrubber Cards */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono text-[var(--text-secondary)] px-1">
          <span>SELECT LEAD DAY TO INSPECT (DAY 1 TO 10):</span>
          <span className="text-[var(--risk-extreme)] font-bold">WALL CUTOFF: DAY {bustWallDay} ({bustWallDay * 24}H)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
          {data.horizon_days.map((hd) => {
            const isSelected = hd.lead_day === selectedDay;
            const isWall = hd.is_bust_wall || hd.lead_day === bustWallDay;

            let borderColor = 'border-[var(--border)]';
            let bgStyle = 'bg-[var(--muted-surface)]';
            let textColor = 'text-[var(--safe-green)]';

            if (hd.confidence_score < 30) {
              textColor = 'text-[var(--risk-extreme)]';
              if (isSelected) {
                borderColor = 'border-[var(--risk-extreme)]';
                bgStyle = 'bg-[var(--risk-extreme)]/20 shadow-md ring-2 ring-[var(--risk-extreme)]/40';
              }
            } else if (hd.confidence_score < 50) {
              textColor = 'text-[var(--risk-watch)]';
              if (isSelected) {
                borderColor = 'border-[var(--risk-watch)]';
                bgStyle = 'bg-[var(--risk-watch)]/20 shadow-md ring-2 ring-[var(--risk-watch)]/40';
              }
            } else {
              if (isSelected) {
                borderColor = 'border-[var(--weather-blue)]';
                bgStyle = 'bg-[var(--weather-blue)]/20 shadow-md ring-2 ring-[var(--weather-blue)]/40';
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
                  <span className="text-[var(--text-primary)] font-bold">±{hd.expected_mae.toFixed(1)}</span>
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
                Detailed Telemetry · {varLabel}
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
                Chances model exceeds acceptable error bounds ({varLabel})
              </p>
            </div>

            {/* 2. Expected MAE */}
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold">
                Expected Mean Error (MAE)
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-black text-[var(--risk-watch)]">
                ±{currentDayData.expected_mae.toFixed(1)} {unit}
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Historical error distribution at Day {currentDayData.lead_day}
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
                Inter-model confidence divergence at {currentDayData.lead_hours}h
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
            {data.operational_guidance_en || `High deterministic reliability holds through Day ${data.operational_cutoff_day}. Beyond Day ${bustWallDay}, forecast uncertainty increases rapidly. Do not allocate irreversible civil defense resources without ensemble verification.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
