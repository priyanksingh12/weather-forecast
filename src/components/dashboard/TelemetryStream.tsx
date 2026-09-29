'use client';

import React, { useEffect, useState } from 'react';
import { fetchLiveInSituTelemetry, InSituStation } from '../../services/openMeteoTelemetry';
import { 
  Radio, 
  Waves, 
  Mountain, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  RefreshCw
} from 'lucide-react';

export const TelemetryStream: React.FC = () => {
  const [stations, setStations] = useState<InSituStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    fetchLiveInSituTelemetry()
      .then((data) => {
        setStations(data);
        setLastRefreshed(new Date().toLocaleTimeString());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // 1 min auto refresh
    return () => clearInterval(interval);
  }, []);

  if (loading && stations.length === 0) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-base font-mono text-[var(--weather-blue)] font-bold">
          Streaming Live Oceanic Buoy & Himalayan Radiosonde In-Situ Telemetry...
        </span>
      </div>
    );
  }

  const buoys = stations.filter((s) => s.type === 'oceanic_buoy');
  const sondes = stations.filter((s) => s.type === 'himalayan_radiosonde');

  return (
    <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shadow-xs">
              <Radio className="h-6 w-6 animate-pulse text-[var(--weather-blue)]" />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Live In-Situ Telemetry & Model Drift Stream
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium pl-1">
            Real-Time Sensors vs NWP Output · Bay of Bengal & Himalayan Soundings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs sm:text-sm font-mono text-[var(--text-secondary)] hidden sm:inline">
            Updated: {lastRefreshed || 'Just now'}
          </span>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--weather-blue)]/10 border border-[var(--weather-blue)]/30 text-xs sm:text-sm font-bold text-[var(--weather-blue)] hover:bg-[var(--weather-blue)]/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Poll Sensors</span>
          </button>
        </div>
      </div>

      {/* Grid of Stations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Oceanic Buoys Column */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[var(--weather-blue)] uppercase tracking-wider">
            <Waves className="h-5 w-5" />
            <span>Oceanic Moored Buoys (Bay of Bengal & Arabian Sea)</span>
          </div>

          <div className="space-y-3.5">
            {buoys.map((st) => (
              <div 
                key={st.id}
                className="p-5 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-3 hover:border-[var(--weather-blue)]/40 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">{st.name}</h4>
                    <span className="text-xs sm:text-sm font-mono text-[var(--text-secondary)]">
                      {st.lat}°N, {st.lon}°E · {st.basin_or_range}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-black uppercase shrink-0 ${
                    st.drift_status === 'CRITICAL_BUST_RISK'
                      ? 'bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)] border border-[var(--risk-extreme)]/40'
                      : st.drift_status === 'ELEVATED_DRIFT'
                      ? 'bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border border-[var(--risk-watch)]/40'
                      : 'bg-[var(--safe-green)]/20 text-[var(--safe-green)] border border-[var(--safe-green)]/40'
                  }`}>
                    {st.drift_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-xs font-mono">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-0.5">OBSERVED SST</span>
                    <span className="text-[var(--weather-blue)] font-black text-base sm:text-lg">{st.observed_temp}°C</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-0.5">NWP MODELED</span>
                    <span className="text-[var(--text-primary)] font-bold text-base sm:text-lg">{st.nwp_modeled_temp}°C</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-0.5">DRIFT DELTA</span>
                    <span className={`font-black text-base sm:text-lg ${st.temp_delta > 1.5 ? 'text-[var(--risk-watch)]' : 'text-[var(--safe-green)]'}`}>
                      Δ {st.temp_delta}°C
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Himalayan Radiosondes Column */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[var(--ai-indigo)] uppercase tracking-wider">
            <Mountain className="h-5 w-5" />
            <span>High-Altitude Radiosondes (Himalayan Belt)</span>
          </div>

          <div className="space-y-3.5">
            {sondes.map((st) => (
              <div 
                key={st.id}
                className="p-5 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-3 hover:border-[var(--ai-indigo)]/40 transition-colors"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">{st.name}</h4>
                    <span className="text-xs sm:text-sm font-mono text-[var(--text-secondary)]">
                      {st.lat}°N, {st.lon}°E · Alt: {st.elevation_m}m
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-black uppercase shrink-0 ${
                    st.drift_status === 'CRITICAL_BUST_RISK'
                      ? 'bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)] border border-[var(--risk-extreme)]/40'
                      : st.drift_status === 'ELEVATED_DRIFT'
                      ? 'bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border border-[var(--risk-watch)]/40'
                      : 'bg-[var(--safe-green)]/20 text-[var(--safe-green)] border border-[var(--safe-green)]/40'
                  }`}>
                    {st.drift_status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--border)] text-xs font-mono">
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-0.5">SURFACE PRES</span>
                    <span className="text-[var(--ai-indigo)] font-black text-base sm:text-lg">{st.observed_pressure_hpa} hPa</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-0.5">NWP PRES</span>
                    <span className="text-[var(--text-primary)] font-bold text-base sm:text-lg">{st.nwp_modeled_pressure_hpa} hPa</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)] block text-xs font-semibold mb-0.5">PRES DRIFT</span>
                    <span className={`font-black text-base sm:text-lg ${st.pressure_delta > 2.0 ? 'text-[var(--risk-watch)]' : 'text-[var(--safe-green)]'}`}>
                      Δ {st.pressure_delta} hPa
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
