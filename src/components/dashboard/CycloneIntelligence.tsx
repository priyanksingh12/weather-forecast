'use client';

import React, { useEffect, useState } from 'react';
import { weatherApi, CycloneData } from '../../services/api';
import { 
  Compass, 
  Wind, 
  ShieldAlert, 
  AlertTriangle, 
  Waves, 
  ThermometerSun, 
  Flame, 
  Navigation, 
  History,
  Languages,
  CheckCircle2
} from 'lucide-react';

export const CycloneIntelligence: React.FC = () => {
  const [data, setData] = useState<CycloneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  useEffect(() => {
    weatherApi.getCyclone()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.warn('Failed to load cyclone data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading && !data) {
    return (
      <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-base font-mono text-[var(--weather-blue)] font-bold">
          Monitoring Bay of Bengal & Arabian Sea Active Cyclones...
        </span>
      </div>
    );
  }

  if (!data || !data.active_cyclones || data.active_cyclones.length === 0) {
    return null;
  }

  const cyclone = data.active_cyclones[0];
  const ri = cyclone.ri_risk;
  const landfall = cyclone.landfall;

  return (
    <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6 sm:p-8 space-y-6">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="p-3 rounded-2xl bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)] border border-[var(--risk-extreme)]/40 shadow-xs">
              <Compass className="h-6 w-6 animate-spin" style={{ animationDuration: '8s' }} />
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              Cyclone Intelligence & Rapid Intensification (RI)
            </h2>
          </div>
          <p className="text-base sm:text-lg text-[var(--text-secondary)] font-medium pl-1">
            Bay of Bengal & Arabian Sea · Track Spread & Intensity Bust Modeling
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[var(--risk-extreme)]/20 border border-[var(--risk-extreme)]/40 text-[var(--risk-extreme)] text-sm font-mono font-black shadow-sm">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--risk-extreme)] animate-ping"></span>
            <span>ACTIVE SYSTEM: {cyclone.name.toUpperCase()}</span>
          </div>

          <button
            onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <Languages className="h-4 w-4 text-[var(--weather-blue)]" />
            <span>{lang === 'en' ? 'हिंदी' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: RI Risk Score */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Rapid Intensification (RI)
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--risk-extreme)] tracking-tight">
            {ri?.risk_score ?? 84.3}%
          </div>
          <p className="text-sm text-[var(--risk-extreme)] font-bold font-mono uppercase">
            Risk Level: {ri?.risk_level ?? 'EXTREME'}
          </p>
        </div>

        {/* Card 2: Sea Surface Temperature */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            SST Fuel Index
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--risk-watch)] tracking-tight">
            {ri?.sst_celsius ?? 30.2}°C
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Threshold &gt;28.5°C triggers rapid feeding
          </p>
        </div>

        {/* Card 3: Track Coordinate Spread */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            NWP Track Spread
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--weather-blue)] tracking-tight">
            {landfall?.coordinate_spread_km ?? 145} <span className="text-xl font-normal text-[var(--text-secondary)]">km</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Multi-model landfall cone uncertainty
          </p>
        </div>

        {/* Card 4: Timing Uncertainty */}
        <div className="p-6 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
            Landfall Timing Window
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-black text-[var(--ai-indigo)] tracking-tight">
            ±{landfall?.timing_uncertainty_hours ?? 18} <span className="text-xl font-normal text-[var(--text-secondary)]">hours</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-medium">
            Target: {landfall?.target_coastline || 'East Coast'}
          </p>
        </div>
      </div>

      {/* Coastal Impact Table */}
      {cyclone.coastal_impacts && cyclone.coastal_impacts.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2.5">
              <ShieldAlert className="h-5 w-5 text-[var(--risk-watch)]" />
              State-by-State Coastal Impacts & IMD Alert Warnings
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-[var(--text-secondary)]">Day 1 to 5 Horizon</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-base">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs sm:text-sm font-mono font-bold text-[var(--text-secondary)] uppercase">
                  <th className="pb-3">Coastal State</th>
                  <th className="pb-3">Lead</th>
                  <th className="pb-3">Peak Wind</th>
                  <th className="pb-3">Peak Rain</th>
                  <th className="pb-3">Bust Risk</th>
                  <th className="pb-3">IMD Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {cyclone.coastal_impacts.map((ci, idx) => (
                  <tr key={idx} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="py-3.5 font-bold text-[var(--text-primary)] text-base">{ci.state_name}</td>
                    <td className="py-3.5 font-mono text-[var(--text-secondary)] text-sm sm:text-base">Day {ci.lead_day}</td>
                    <td className="py-3.5 font-mono text-[var(--weather-blue)] font-bold text-base sm:text-lg">{ci.max_wind_kmh} km/h</td>
                    <td className="py-3.5 font-mono text-[var(--forecast-blue)] font-bold text-base sm:text-lg">{ci.peak_rainfall_mm} mm</td>
                    <td className="py-3.5 font-mono font-bold text-[var(--risk-extreme)] text-base sm:text-lg">{ci.bust_risk_score}%</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${
                        ci.imd_alert_level === 'RED'
                          ? 'bg-[var(--risk-extreme)] text-white shadow-sm'
                          : ci.imd_alert_level === 'ORANGE'
                          ? 'bg-[var(--risk-high)] text-black font-extrabold'
                          : 'bg-[var(--risk-watch)] text-black'
                      }`}>
                        {ci.imd_alert_level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Historical Failure Catalog: Cyclone Ockhi & Biparjoy */}
      {data.historical_failure_catalog && data.historical_failure_catalog.length > 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <History className="h-5 w-5 text-[var(--weather-blue)]" />
            <span>Historical Cyclone Forecast Bust Catalog & Operational Lessons</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {data.historical_failure_catalog.map((hf, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[var(--text-primary)] text-base">{hf.name} ({hf.year})</span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-[var(--risk-extreme)]/20 text-[var(--risk-extreme)] font-bold">
                    {hf.bust_type}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  <strong className="text-[var(--weather-blue)] font-mono font-bold">Lesson:</strong> {hf.operational_lesson}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational Advisory */}
      <div className="p-6 rounded-2xl bg-[var(--risk-extreme)]/10 border-2 border-[var(--risk-extreme)]/30 flex items-start gap-4">
        <AlertTriangle className="h-7 w-7 text-[var(--risk-extreme)] shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <span className="text-sm font-mono font-black uppercase tracking-wider text-[var(--risk-extreme)] block">
            Coastline Advisory ({lang === 'en' ? 'English' : 'हिंदी'}):
          </span>
          <p className="text-base sm:text-lg text-[var(--text-primary)] font-medium leading-relaxed">
            {lang === 'en'
              ? cyclone.operational_guidance_en || 'High Rapid Intensification risk detected. Deep convective feeding supported by high ocean heat content. Enforce preemptive storm surge evacuation protocols 24h ahead of schedule.'
              : cyclone.operational_guidance_hi || 'तीव्र चक्रवाती गतिशीलता के कारण तटीय क्षेत्रों में समय पूर्व चेतावनी लागू करें।'}
          </p>
        </div>
      </div>
    </div>
  );
};
