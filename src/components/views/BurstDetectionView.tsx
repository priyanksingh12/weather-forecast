'use client';

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  Zap, 
  ArrowRight,
  Sparkles,
  Layers,
  Droplets,
  Wind
} from 'lucide-react';
import { MultiModelConsensus } from '../dashboard/MultiModelConsensus';
import { ChangeExplanation } from '../explain/ChangeExplanation';
import { LocationQuickPicker } from '../common/LocationQuickPicker';
import { RegionalData } from '../../lib/data/regionalIntelligence';

interface BurstDetectionViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const BurstDetectionView: React.FC<BurstDetectionViewProps> = ({
  currentRegion,
  onSelectRegion
}) => {
  const [selectedDay, setSelectedDay] = useState(1);

  // Gauge data for Recharts PieChart
  const gaugeData = [
    { name: 'Bust Probability', value: currentRegion.burstProbability },
    { name: 'Stability Buffer', value: Math.max(0, 100 - currentRegion.burstProbability) }
  ];

  const getBustColor = (prob: number) => {
    if (prob >= 70) return '#BA6A6A';
    if (prob >= 40) return '#F2994A';
    return '#6ABA96';
  };

  const activeColor = getBustColor(currentRegion.burstProbability);
  const trackColor = 'var(--muted-surface)';

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* View Header - Stacked Pattern */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs"
      >
        {/* Top Section: Title, Badges, and Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--ai-indigo)]/15 text-[var(--ai-indigo)] shadow-xs mt-0.5">
            <Activity className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                AI Forecast Bust Detection & Microservice Engine
              </h1>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--safe-green)]/15 text-[var(--safe-green)] border border-[var(--safe-green)]/30 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--safe-green)] animate-pulse" />
                LightGBM v2.1 Live
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Automated failure mode classification, SHAP feature attributions, and consensus divergence for <strong className="text-[var(--text-primary)] font-bold">{currentRegion.name}</strong>
            </p>
          </div>
        </div>

        {/* Filter Section Underneath: Location Switcher */}
        <div className="pt-4 border-t border-[var(--border)]/70 w-full">
          <LocationQuickPicker
            currentRegion={currentRegion}
            onSelectRegion={onSelectRegion}
            label="Regions:"
          />
        </div>
      </motion.div>

      {/* Top AI Intelligence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recharts Donut Gauge & Core Probability (5 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between shadow-xs"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-500 fill-rose-500/20" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                Calibrated Bust Probability
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--risk-high)] bg-[var(--risk-high)]/15 px-2.5 py-0.5 rounded-full border border-[var(--risk-high)]/30">
              {currentRegion.burstRiskLabel}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={86}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell key="cell-0" fill={activeColor} />
                    <Cell key="cell-1" fill={trackColor} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-5xl font-black tracking-tight text-[var(--text-primary)] font-mono">
                  {currentRegion.burstProbability}%
                </span>
                <span className="text-xs font-bold text-[var(--risk-high)] mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>P(Bust) Calibrated</span>
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] text-center mt-4 max-w-xs">
              Expected bust window: <strong className="text-[var(--weather-blue)]">{currentRegion.timeWindow}</strong> across {currentRegion.affectedAreas}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border)] text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[var(--muted-surface)] flex items-center justify-between">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Model Accuracy</span>
                <span className="text-[var(--text-primary)] font-bold text-sm">{currentRegion.modelConfidence}%</span>
              </div>
              <Activity className="h-4 w-4 text-[var(--weather-blue)]" />
            </div>
            <div className="p-3 rounded-2xl bg-[var(--muted-surface)] flex items-center justify-between">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Intensity Tier</span>
                <span className="text-[var(--risk-high)] font-bold text-sm">{currentRegion.expectedIntensity}</span>
              </div>
              <ShieldAlert className="h-4 w-4 text-[var(--risk-high)]" />
            </div>
          </div>
        </motion.div>

        {/* Right: SHAP Explainability & Microservice Telemetry (7 cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ y: -3 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col justify-between shadow-xs space-y-5"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                SHAP Explanations & Uncertainty Drivers
              </h3>
            </div>
            <span className="text-xs font-mono text-[var(--text-secondary)]">LightGBM Tree Attributions</span>
          </div>

          <div className="space-y-3">
            {/* Factor 1 */}
            <div className="p-3.5 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--text-primary)]">1. ECMWF IFS vs NOAA GFS Boundary Layer Spread</span>
                <span className="font-mono text-[var(--risk-high)] font-bold">+38% bust lift</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Models exhibit a 3.4 mm divergence in precipitation timing, amplifying probability of local convective failure.
              </p>
            </div>

            {/* Factor 2 */}
            <div className="p-3.5 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
                  <span>2. Surface Relative Humidity & Convective Ingestion</span>
                </span>
                <span className="font-mono text-[var(--risk-watch)] font-bold">+24% bust lift</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                In-situ humidity ({currentRegion.humidity}%) is 8% above assimilation baseline, indicating rapid cloudburst potential.
              </p>
            </div>

            {/* Factor 3 */}
            <div className="p-3.5 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                  <Wind className="h-3.5 w-3.5 text-[var(--atmospheric-teal)]" />
                  <span>3. Wind Velocity Shear Direction ({currentRegion.windDirection})</span>
                </span>
                <span className="font-mono text-[var(--safe-green)] font-bold">-12% stabilizing</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Moderate surface airflow ({currentRegion.windSpeedKmH} km/h) prevents extreme stationary squall clustering.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--weather-blue)]/10 border border-[var(--weather-blue)]/30 text-xs text-[var(--text-primary)] leading-relaxed">
            <strong>Operational Advisory:</strong> Deterministic forecasts should not be relied upon for critical infrastructure between {currentRegion.timeWindow}. Enact ensemble threshold contingency plans.
          </div>
        </motion.div>
      </div>

      {/* Multi-Model Consensus Section */}
      <MultiModelConsensus
        regionSlug={currentRegion.slug}
        variable="rainfall"
        leadDay={selectedDay}
      />
    </div>
  );
};
