'use client';

import React, { useState, useEffect } from 'react';
import { CalibrationChart } from '../../components/model/CalibrationChart';
import { ValidationMetrics } from '../../components/model/ValidationMetrics';
import { getModelCalibration } from '../../lib/api/model';
import { ModelCalibrationData, WeatherVariable } from '../../lib/api/types';
import { Cpu, ArrowLeft, Sliders, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ModelValidationPage() {
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [leadDay, setLeadDay] = useState(7);
  const [calibrationData, setCalibrationData] = useState<ModelCalibrationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getModelCalibration(variable, leadDay)
      .then((res) => setCalibrationData(res.data))
      .finally(() => setLoading(false));
  }, [variable, leadDay]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>National View</span>
            </Link>
            <span className="text-[var(--text-secondary)]">/</span>
            <span className="text-xs font-mono text-[var(--weather-blue)]">Scientific Validation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-[var(--weather-blue)]" />
            <span>Model Validation & Scientific Calibration</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Empirical proof that predicted bust probabilities match real-world failure frequencies on held-out test data
          </p>
        </div>
      </div>

      {/* Query Filters */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 backdrop-blur-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target Variable</label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value as WeatherVariable)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none"
          >
            <option value="rainfall" className="bg-[var(--surface)] text-[var(--text-primary)]">Rainfall (24h Accumulation)</option>
            <option value="tmax" className="bg-[var(--surface)] text-[var(--text-primary)]">Maximum Temperature (Tmax)</option>
            <option value="tmin" className="bg-[var(--surface)] text-[var(--text-primary)]">Minimum Temperature (Tmin)</option>
            <option value="wind" className="bg-[var(--surface)] text-[var(--text-primary)]">10m Surface Wind Speed</option>
            <option value="mslp" className="bg-[var(--surface)] text-[var(--text-primary)]">MSLP (Pressure)</option>
            <option value="humidity" className="bg-[var(--surface)] text-[var(--text-primary)]">Relative Humidity</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Lead Horizon: Day {leadDay} ({leadDay * 24}h)
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={leadDay}
            onChange={(e) => setLeadDay(Number(e.target.value))}
            className="w-full accent-[var(--weather-blue)] cursor-pointer h-2 bg-[var(--muted-surface)] rounded-lg mt-2"
          />
        </div>
      </div>

      {calibrationData && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Scientific Validation Scorecards */}
          <section>
            <ValidationMetrics data={calibrationData} />
          </section>

          {/* Reliability Diagram / Calibration Curve */}
          <section>
            <CalibrationChart data={calibrationData} />
          </section>
        </div>
      )}
    </div>
  );
}
