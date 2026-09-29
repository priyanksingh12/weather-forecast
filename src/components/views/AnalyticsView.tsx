'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Activity,
  Heart,
  Droplets,
  Wind,
  Award,
  Cpu,
  Sliders,
  Layers,
} from 'lucide-react';
import { GroundTruthVerification } from '../dashboard/GroundTruthVerification';
import { CalibrationChart } from '../model/CalibrationChart';
import { ValidationMetrics } from '../model/ValidationMetrics';
import { getModelCalibration } from '../../lib/api/model';
import { ModelCalibrationData, WeatherVariable } from '../../lib/api/types';
import { getMockModelCalibration } from '../../data/mock/modelMetricsData';
import { LocationQuickPicker } from '../common/LocationQuickPicker';
import { RegionalData } from '../../lib/data/regionalIntelligence';

interface AnalyticsViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentRegion,
  onSelectRegion,
}) => {
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [leadDay, setLeadDay] = useState<number>(7);
  const [calibrationData, setCalibrationData] = useState<ModelCalibrationData>(
    () => getMockModelCalibration('rainfall', 7)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getModelCalibration(variable, leadDay)
      .then((res) => {
        if (res && res.data) {
          setCalibrationData(res.data);
        } else {
          setCalibrationData(getMockModelCalibration(variable, leadDay));
        }
      })
      .catch(() => {
        setCalibrationData(getMockModelCalibration(variable, leadDay));
      })
      .finally(() => setLoading(false));
  }, [variable, leadDay]);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. View Header - Stacked Pattern */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs"
      >
        {/* Top Section: Title, Badges, and Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--atmospheric-teal)]/15 text-[var(--atmospheric-teal)] shadow-xs mt-0.5">
            <BarChart3 className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                Ground-Truth Analytics & Scientific Model Calibration
              </h1>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--safe-green)]/15 text-[var(--safe-green)] border border-[var(--safe-green)]/30">
                FVA Audited (IMERG & METAR)
              </span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30">
                LightGBM + Isotonic
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Empirical verification, Brier scores, reliability diagrams, and rolling error metrics for{' '}
              <strong className="text-[var(--text-primary)] font-bold">{currentRegion.name}</strong>
            </p>
          </div>
        </div>

        {/* Filter Section Underneath: Location Switcher supporting all Indian states & UTs */}
        <div className="pt-4 border-t border-[var(--border)]/70 w-full">
          <LocationQuickPicker
            currentRegion={currentRegion}
            onSelectRegion={onSelectRegion}
            label="Regions:"
          />
        </div>
      </motion.div>

      {/* 2. Ground-Truth Verification (FVA) Component with Recharts AreaChart & PieChart */}
      <GroundTruthVerification
        regionSlug={currentRegion.slug}
        variable={variable}
      />

      {/* 3. Scientific Calibration Diagram Controls */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 shadow-xl"
      >
        {/* Top Section: Title & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-[var(--weather-blue)]" />
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Reliability Diagrams & Binned Probability Verification
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] pl-8">
            Empirical reliability curves against 1:1 perfect calibration, isotonic verification, and Brier skill scores
          </p>
        </div>

        {/* Filter Row Underneath: Variable & Lead Day Selectors */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-4 w-full">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">Variable:</span>
              <select
                value={variable}
                onChange={(e) => setVariable(e.target.value as WeatherVariable)}
                className="rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] px-4 py-2 text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)] cursor-pointer"
              >
                <option value="rainfall">🌧️ Rainfall</option>
                <option value="tmax">🌡️ Temperature</option>
                <option value="wind">💨 Wind Speed</option>
                <option value="mslp">🔵 Pressure</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-sm font-semibold text-[var(--text-secondary)]">Lead Day:</span>
              <select
                value={leadDay}
                onChange={(e) => setLeadDay(Number(e.target.value))}
                className="rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] px-4 py-2 text-sm sm:text-base font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)] font-mono cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                  <option key={d} value={d}>
                    Day {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
              Active: <span className="font-bold text-[var(--weather-blue)]">{variable.toUpperCase()}</span> (Day {leadDay})
            </span>
          </div>
        </div>

        {/* Calibration Chart & Validation Metrics */}
        <div className="space-y-6 pt-2">
          <CalibrationChart data={calibrationData} />
          <ValidationMetrics data={calibrationData} />
        </div>
      </motion.div>
    </div>
  );
};
