'use client';

import React, { useState, useEffect } from 'react';
import { ForecastVsActualChart } from '../../components/history/ForecastVsActualChart';
import { ErrorTrendsChart } from '../../components/history/ErrorTrendsChart';
import { getForecastVsActual, getErrorTrends } from '../../lib/api/history';
import { ForecastVsActualData, ErrorTrendsData, WeatherVariable } from '../../lib/api/types';
import { INDIA_REGIONS } from '../../lib/geo/indiaGeoJson';
import { History, Sliders, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const [regionId, setRegionId] = useState('uttar-pradesh');
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [leadDay, setLeadDay] = useState(7);
  const [windowDays, setWindowDays] = useState(30);

  const [vsActualData, setVsActualData] = useState<ForecastVsActualData | null>(null);
  const [errorTrends, setErrorTrends] = useState<ErrorTrendsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getForecastVsActual(regionId, variable, leadDay),
      getErrorTrends(regionId, variable, leadDay, windowDays)
    ])
      .then(([fRes, eRes]) => {
        setVsActualData(fRes.data);
        setErrorTrends(eRes.data);
      })
      .finally(() => setLoading(false));
  }, [regionId, variable, leadDay, windowDays]);

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
            <span className="text-xs font-mono text-[var(--weather-blue)]">Historical Verification Audit</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <History className="h-6 w-6 text-[var(--weather-blue)]" />
            <span>Forecast vs Verified Truth</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Auditing medium-range forecast skill against actual matured satellite and ground-truth observations
          </p>
        </div>
      </div>

      {/* Query Filters */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 backdrop-blur-xl">
        {/* Region */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Region</label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none"
          >
            {INDIA_REGIONS.map((r) => (
              <option key={r.id} value={r.id} className="bg-[var(--surface)] text-[var(--text-primary)]">
                {r.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Variable */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Variable</label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value as WeatherVariable)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none"
          >
            <option value="rainfall" className="bg-[var(--surface)] text-[var(--text-primary)]">Rainfall (24h)</option>
            <option value="tmax" className="bg-[var(--surface)] text-[var(--text-primary)]">Max Temperature</option>
            <option value="tmin" className="bg-[var(--surface)] text-[var(--text-primary)]">Min Temperature</option>
            <option value="wind" className="bg-[var(--surface)] text-[var(--text-primary)]">Wind Speed</option>
            <option value="mslp" className="bg-[var(--surface)] text-[var(--text-primary)]">MSLP (Pressure)</option>
            <option value="humidity" className="bg-[var(--surface)] text-[var(--text-primary)]">Relative Humidity</option>
          </select>
        </div>

        {/* Lead Day */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Lead Time: Day {leadDay} ({leadDay * 24}h)
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

        {/* Time Window */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Evaluation Window</label>
          <div className="grid grid-cols-3 gap-1 pt-0.5">
            {[7, 30, 90].map((w) => (
              <button
                key={w}
                onClick={() => setWindowDays(w)}
                className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  windowDays === w
                    ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                    : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {w}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Chart 1: Forecast vs Actual */}
      <section>
        <ForecastVsActualChart data={vsActualData} loading={loading} />
      </section>

      {/* Primary Chart 2: Historical Error Trends */}
      <section>
        <ErrorTrendsChart data={errorTrends} loading={loading} />
      </section>
    </div>
  );
}
