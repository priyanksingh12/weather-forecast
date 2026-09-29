'use client';

import React from 'react';
import { AirQualityOut } from '../../services/api';
import { Wind, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface AirQualityWidgetProps {
  airQuality: AirQualityOut | null;
  loading?: boolean;
}

const aqiThemeMap: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-[var(--safe-green)]/15 border-[var(--safe-green)]/30', text: 'text-[var(--safe-green)]', label: 'Good' },
  2: { bg: 'bg-[var(--atmospheric-teal)]/15 border-[var(--atmospheric-teal)]/30', text: 'text-[var(--atmospheric-teal)]', label: 'Fair' },
  3: { bg: 'bg-[var(--risk-watch)]/15 border-[var(--risk-watch)]/30', text: 'text-[var(--risk-watch)]', label: 'Moderate' },
  4: { bg: 'bg-[var(--risk-high)]/15 border-[var(--risk-high)]/30', text: 'text-[var(--risk-high)]', label: 'Poor' },
  5: { bg: 'bg-[var(--risk-extreme)]/15 border-[var(--risk-extreme)]/30', text: 'text-[var(--risk-extreme)]', label: 'Very Poor' },
};

export const AirQualityWidget: React.FC<AirQualityWidgetProps> = ({ airQuality, loading }) => {
  if (loading || !airQuality) {
    return (
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4 animate-pulse min-h-[220px]">
        <div className="h-4 bg-[var(--muted-surface)] rounded-xl w-1/3" />
        <div className="h-10 bg-[var(--muted-surface)] rounded-xl w-1/2" />
        <div className="grid grid-cols-3 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--muted-surface)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const theme = aqiThemeMap[airQuality.aqi] || aqiThemeMap[3];
  const p = airQuality.pollutants;

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs flex flex-col justify-between transition-all">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-[var(--weather-blue)]" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Atmospheric Air Quality Index (AQI)
          </h3>
        </div>

        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.bg} ${theme.text}`}>
          AQI {airQuality.aqi} • {airQuality.aqi_category}
        </span>
      </div>

      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Direct European standard aerosol optical and particulate loading for {airQuality.region_name || 'Current Region'}.
      </p>

      {/* 6 Pollutant Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] text-[11px]">PM2.5 (Fine Particulate)</div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(p.pm2_5)} µg/m³</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] text-[11px]">PM10 (Coarse Aerosol)</div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(p.pm10)} µg/m³</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] text-[11px]">NO₂ (Nitrogen Dioxide)</div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(p.no2)} µg/m³</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] text-[11px]">SO₂ (Sulphur Dioxide)</div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(p.so2)} µg/m³</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] text-[11px]">O₃ (Ground Ozone)</div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(p.o3)} µg/m³</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] text-[11px]">CO (Carbon Monoxide)</div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(p.co)} µg/m³</div>
        </div>
      </div>
    </div>
  );
};
