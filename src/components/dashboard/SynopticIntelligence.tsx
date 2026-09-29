'use client';

import React, { useEffect, useState } from 'react';
import { weatherApi, SynopticData } from '../../services/api';
import { 
  Mountain, 
  CloudLightning, 
  ShieldAlert, 
  AlertTriangle, 
  Snowflake, 
  Droplets, 
  History, 
  Activity,
  Layers
} from 'lucide-react';

export const SynopticIntelligence: React.FC = () => {
  const [data, setData] = useState<SynopticData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    weatherApi.getSynoptic()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.warn('Failed to load synoptic data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-base font-mono text-[var(--weather-blue)] font-bold">
          Analyzing Synoptic Western Disturbances & Himalayan Orographic Amplifiers...
        </span>
      </div>
    );
  }

  if (!data) return null;

  const wd = data.active_western_disturbances?.[0];
  const md = data.active_monsoon_depressions?.[0];
  const analog = data.historical_failure_analogs?.[0];

  return (
    <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shadow-xs">
              <Mountain className="h-6 w-6" />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Synoptic Intelligence & Himalayan Orography
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium pl-1">
            Western Disturbances (WD) · Cloudburst Vulnerability · Freezing Level Shift
          </p>
        </div>
      </div>

      {/* 4 Key Synoptic Metric Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Orographic Amplification */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Orographic Multiplier
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--weather-blue)] tracking-tight">
            {wd?.orographic_amplification_factor ?? 2.2}×
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            NWP rain under-estimation on windward slopes
          </p>
        </div>

        {/* Metric 2: 0°C Freezing Level */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            0°C Freezing Level
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--forecast-blue)] tracking-tight">
            {wd?.affected_states?.[0]?.freezing_level_m ?? 2450} <span className="text-xl font-normal text-[var(--text-secondary)]">m</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Himalayan snow/rain transitional boundary
          </p>
        </div>

        {/* Metric 3: Snowline Uncertainty */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Snowline Uncertainty
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--risk-watch)] tracking-tight">
            ±{wd?.affected_states?.[0]?.snow_rain_boundary_uncertainty_m ?? 360} <span className="text-xl font-normal text-[var(--text-secondary)]">m</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Vertical error margin triggering flash floods
          </p>
        </div>

        {/* Metric 4: Trough Axis Divergence */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Trough Axis Shift
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--ai-indigo)] tracking-tight">
            ~{md?.affected_states?.[0]?.trough_axis_divergence_km ?? 200} <span className="text-xl font-normal text-[var(--text-secondary)]">km</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            ECMWF vs GFS monsoon trough divergence
          </p>
        </div>
      </div>

      {/* Western Disturbance Affected Himalayan States */}
      {wd?.affected_states && wd.affected_states.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2.5">
              <Snowflake className="h-5 w-5 text-[var(--weather-blue)]" />
              Himalayan High-Altitude States under Active WD Alert
            </span>
            <span className="text-xs sm:text-sm font-mono text-[var(--weather-blue)] font-bold">
              {wd.name}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wd.affected_states.map((st, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[var(--text-primary)] text-lg">{st.state_name}</span>
                    <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${
                      st.alert_level === 'RED'
                        ? 'bg-[var(--risk-extreme)] text-white'
                        : st.alert_level === 'ORANGE'
                        ? 'bg-[var(--risk-high)] text-black font-extrabold'
                        : 'bg-[var(--risk-watch)] text-black font-bold'
                    }`}>
                      {st.alert_level}
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-[var(--risk-extreme)]">
                    Bust Risk: {st.bust_risk_score}%
                  </span>
                </div>

                <div className="text-sm text-[var(--text-secondary)] space-y-1.5">
                  <div>Zone: <span className="text-[var(--text-primary)] font-medium">{st.elevation_zone || 'High Altitude'}</span></div>
                  <div>0°C Freezing Level: <span className="text-[var(--weather-blue)] font-mono font-bold text-base">{st.freezing_level_m}m</span> (Uncertainty ±{st.snow_rain_boundary_uncertainty_m}m)</div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans border-t border-[var(--border)] pt-2 leading-relaxed">
                  <strong className="text-[var(--risk-watch)] font-semibold">Failure Mode:</strong> {st.primary_failure_mode}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historical Analog: Kedarnath 2013 Deluge */}
      {analog && (
        <div className="p-6 rounded-2xl bg-[var(--risk-watch)]/10 border-2 border-[var(--risk-watch)]/40 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--risk-watch)]/30 pb-3">
            <div className="flex items-center gap-2.5">
              <History className="h-6 w-6 text-[var(--risk-watch)]" />
              <span className="font-black text-[var(--text-primary)] text-lg sm:text-xl">
                Historical Analog: {analog.event_name} ({analog.year})
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-black px-3.5 py-1.5 rounded-xl bg-[var(--risk-watch)]/20 text-[var(--risk-watch)] border border-[var(--risk-watch)]/40">
              Pattern Match Similarity: {Math.round((analog.similarity ?? 0.94) * 100)}%
            </span>
          </div>

          <div className="space-y-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans">
            <div>
              <strong className="text-[var(--risk-watch)] font-mono font-bold">Why NWP Failed:</strong> {analog.nwp_forecast_error || 'Under-predicted 24h rainfall by >280 mm'} — {analog.failure_analysis || 'Standard NWP models decoupled the tropical monsoon branch from the mid-latitude trough.'}
            </div>
            <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--risk-watch)]/30 text-[var(--text-primary)] font-medium text-sm sm:text-base">
              <strong className="font-bold text-[var(--text-primary)]">Operational Lesson for Hackathon:</strong> {analog.operational_lesson}
            </div>
          </div>
        </div>
      )}

      {/* Operational Guidance */}
      {wd?.operational_guidance_en && (
        <div className="p-6 rounded-2xl bg-[var(--weather-blue)]/10 border-2 border-[var(--weather-blue)]/30 flex items-start gap-4">
          <AlertTriangle className="h-7 w-7 text-[var(--weather-blue)] shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <span className="text-sm font-mono font-black uppercase tracking-wider text-[var(--weather-blue)] block">
              High-Altitude Advisory:
            </span>
            <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed">
              {wd.operational_guidance_en}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
