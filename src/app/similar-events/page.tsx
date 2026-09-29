'use client';

import React, { useState, useEffect } from 'react';
import { SimilarEventsList } from '../../components/events/SimilarEventsList';
import { getSimilarEvents } from '../../lib/api/events';
import { SimilarEventsData, WeatherVariable } from '../../lib/api/types';
import { INDIA_REGIONS } from '../../lib/geo/indiaGeoJson';
import { Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SimilarEventsPage() {
  const [regionId, setRegionId] = useState('uttar-pradesh');
  const [day, setDay] = useState(7);
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [similarData, setSimilarData] = useState<SimilarEventsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSimilarEvents(regionId, 'latest', day, variable)
      .then((res) => setSimilarData(res.data))
      .finally(() => setLoading(false));
  }, [regionId, day, variable]);

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
            <span className="text-xs font-mono text-[var(--weather-blue)]">Synoptic Analogs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight mt-1 flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-[var(--weather-blue)]" />
            <span>Similar Historical Situations</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Uncovering past weather events with matching pressure gradients, moisture flux, and ensemble spread
          </p>
        </div>
      </div>

      {/* Query Filters */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 backdrop-blur-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Target Region</label>
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none"
          >
            {INDIA_REGIONS.map((r) => (
              <option key={r.id} value={r.id} className="bg-[var(--surface)]">
                {r.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Variable</label>
          <select
            value={variable}
            onChange={(e) => setVariable(e.target.value as WeatherVariable)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] px-3 py-2 text-xs text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none"
          >
            <option value="rainfall" className="bg-[var(--surface)]">Rainfall (24h)</option>
            <option value="tmax" className="bg-[var(--surface)]">Max Temperature</option>
            <option value="wind" className="bg-[var(--surface)]">Wind Speed</option>
            <option value="mslp" className="bg-[var(--surface)]">MSLP (Pressure)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Lead Day: Day {day} ({day * 24}h)
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-full accent-[var(--weather-blue)] cursor-pointer h-2 bg-[var(--muted-surface)] rounded-lg mt-2"
          />
        </div>
      </div>

      {/* Similar Events List */}
      <section>
        <SimilarEventsList data={similarData} loading={loading} />
      </section>
    </div>
  );
}
