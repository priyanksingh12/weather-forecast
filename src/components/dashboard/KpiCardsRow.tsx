'use client';

import React from 'react';
import { 
  CloudRain, 
  Activity, 
  Wind, 
  Thermometer, 
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';

interface KpiCardsRowProps {
  rainfall24h?: number;
  rainfallTrend?: string;
  burstProbability?: number;
  burstRiskLabel?: string;
  windSpeedKmH?: number;
  windDirection?: string;
  temperature?: number;
  tempTrend?: string;
}

export const KpiCardsRow: React.FC<KpiCardsRowProps> = ({
  rainfall24h = 12.4,
  rainfallTrend = '+18% vs yesterday',
  burstProbability = 76,
  burstRiskLabel = 'High Risk',
  windSpeedKmH = 14,
  windDirection = 'NW',
  temperature = 28,
  tempTrend = '2° vs yesterday',
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* 1. Total Rainfall (24h) */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]">
              <CloudRain className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                Total Rainfall (24h)
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {rainfall24h} mm
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-2">
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--safe-green)]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>{rainfallTrend}</span>
          </div>

          {/* Mini Bar Sparkline */}
          <div className="flex items-end gap-1 h-7">
            <span className="w-1.5 h-3 rounded-full bg-[var(--weather-blue)]/30" />
            <span className="w-1.5 h-4.5 rounded-full bg-[var(--weather-blue)]/40" />
            <span className="w-1.5 h-6 rounded-full bg-[var(--weather-blue)]/70" />
            <span className="w-1.5 h-5 rounded-full bg-[var(--weather-blue)]/60" />
            <span className="w-1.5 h-7 rounded-full bg-[var(--weather-blue)]" />
          </div>
        </div>
      </div>

      {/* 2. Burst Probability */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--ai-indigo)]/15 text-[var(--ai-indigo)]">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                Burst Probability
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[var(--risk-high)] tracking-tight">
                  {burstProbability}%
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--risk-high)]/15 text-[var(--risk-high)] border border-[var(--risk-high)]/30">
                  {burstRiskLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Segmented Horizontal Progress Bar */}
        <div className="mt-4 pt-2">
          <div className="h-2.5 w-full rounded-full bg-[var(--muted-surface)] overflow-hidden flex">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[var(--risk-watch)] to-[var(--risk-high)] transition-all duration-500"
              style={{ width: `${burstProbability}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Wind Speed */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--atmospheric-teal)]/15 text-[var(--atmospheric-teal)]">
              <Wind className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                Wind Speed
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {windSpeedKmH} km/h
              </span>
            </div>
          </div>

          <span className="flex items-center gap-0.5 text-xs font-bold text-[var(--forecast-blue)] font-mono bg-[var(--forecast-blue)]/10 px-2 py-1 rounded-xl">
            <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
            <span>{windDirection}</span>
          </span>
        </div>

        {/* Smooth Wave Sparkline SVG */}
        <div className="mt-4 pt-2">
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
            <path
              d="M0,18 C20,12 30,22 50,14 C70,6 80,18 100,10"
              fill="none"
              stroke="var(--weather-blue)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* 4. Temperature */}
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--risk-extreme)]/15 text-[var(--risk-extreme)]">
              <Thermometer className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] block">
                Temperature
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {temperature}°C
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mt-4 pt-2">
          <div className="flex items-center gap-1 text-xs font-bold text-[var(--risk-extreme)]">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>↑ {tempTrend}</span>
          </div>

          {/* Smooth Red Wave Sparkline SVG */}
          <div className="w-24">
            <svg className="w-full h-7 overflow-visible" viewBox="0 0 100 24" preserveAspectRatio="none">
              <path
                d="M0,16 C25,22 45,6 70,12 C85,16 95,8 100,6"
                fill="none"
                stroke="var(--risk-extreme)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
