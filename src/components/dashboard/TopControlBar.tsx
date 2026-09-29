'use client';

import React, { useEffect, useState } from 'react';
import { weatherApi, RegionItem } from '../../services/api';
import { 
  RefreshCw, 
  MapPin, 
  Clock, 
  Activity, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Gauge, 
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { WeatherVariable } from '../../lib/api/types';
import { ALL_STATES_LIST, ALL_UTS_LIST, ALL_CITIES_LIST } from '../../lib/data/regionalIntelligence';

interface Props {
  selectedRegionSlug: string;
  onSelectRegion: (slug: string) => void;
  variable: WeatherVariable;
  onVariableChange: (v: WeatherVariable) => void;
  leadDay: number;
  onLeadDayChange: (d: number) => void;
  onRefreshAll: () => void;
  isRefreshing?: boolean;
}

export const TopControlBar: React.FC<Props> = ({
  selectedRegionSlug,
  onSelectRegion,
  variable,
  onVariableChange,
  leadDay,
  onLeadDayChange,
  onRefreshAll,
  isRefreshing = false
}) => {
  const [regions, setRegions] = useState<RegionItem[]>([]);
  const [countdown, setCountdown] = useState<number>(60);
  const [backendStatus, setBackendStatus] = useState<'healthy' | 'checking' | 'stale'>('checking');

  // Load 56 Indian regions dynamically
  useEffect(() => {
    weatherApi.getRegions(100)
      .then((data) => {
        if (data && data.length > 0) {
          // Sort alphabetically by name
          const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
          setRegions(sorted);
        }
      })
      .catch((err) => {
        console.warn('Could not load regions from backend:', err);
      });

    weatherApi.getHealth()
      .then(() => setBackendStatus('healthy'))
      .catch(() => setBackendStatus('stale'));
  }, []);

  // 60-second countdown timer for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setTimeout(() => {
            onRefreshAll();
          }, 0);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRefreshAll]);

  const handleManualSync = () => {
    setCountdown(60);
    onRefreshAll();
  };

  const variables: Array<{ id: WeatherVariable; label: string; unit: string; icon: React.ReactNode }> = [
    { id: 'rainfall', label: 'Rainfall', unit: 'mm/24h', icon: <CloudRain className="h-4 w-4" /> },
    { id: 'tmax', label: 'Temperature', unit: '°C', icon: <Thermometer className="h-4 w-4" /> },
    { id: 'wind', label: 'Wind Speed', unit: 'm/s', icon: <Wind className="h-4 w-4" /> },
    { id: 'mslp', label: 'MSLP Pressure', unit: 'hPa', icon: <Gauge className="h-4 w-4" /> },
  ];

  const leadDays = [
    { day: 1, label: 'Day 1', hours: '24h' },
    { day: 2, label: 'Day 2', hours: '48h' },
    { day: 3, label: 'Day 3', hours: '72h' },
    { day: 5, label: 'Day 5', hours: '120h' },
    { day: 7, label: 'Day 7', hours: '168h' },
    { day: 10, label: 'Day 10', hours: '240h' }
  ];

  return (
    <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl p-4 sm:p-6 shadow-xl space-y-4">
      {/* Top Row: Region Selector + Live Backend Badge + Countdown Sync */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        {/* Left: Region Dropdown */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap flex-1 max-w-xl">
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--weather-blue)]/15 border border-[var(--weather-blue)]/30 text-[var(--weather-blue)] shrink-0">
            <MapPin className="h-5 w-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider hidden sm:inline">Region</span>
          </div>

          <div className="relative w-full">
            <select
              value={selectedRegionSlug}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base sm:text-lg font-bold text-[var(--text-primary)] shadow-inner focus:border-[var(--weather-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--weather-blue)]/40 cursor-pointer transition-all"
            >
              <optgroup label="28 Indian States (All Available)">
                {ALL_STATES_LIST.map((r) => (
                  <option key={r.slug} value={r.slug} className="bg-[var(--surface)] text-[var(--text-primary)] py-1">
                    {r.name} (STATE)
                  </option>
                ))}
              </optgroup>
              <optgroup label="8 Union Territories (All Available)">
                {ALL_UTS_LIST.map((r) => (
                  <option key={r.slug} value={r.slug} className="bg-[var(--surface)] text-[var(--text-primary)] py-1">
                    {r.name} (UT)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Major Metropolitan Cities">
                {ALL_CITIES_LIST.map((r) => (
                  <option key={r.slug} value={r.slug} className="bg-[var(--surface)] text-[var(--text-primary)] py-1">
                    {r.name} ({r.state})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Right: Live Sync & Status Badge */}
        <div className="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)]">
            <span className={`h-2.5 w-2.5 rounded-full ${
              backendStatus === 'healthy' ? 'bg-[var(--safe-green)] animate-pulse' : 'bg-[var(--risk-watch)]'
            }`} />
            <span className="text-xs font-mono font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              {backendStatus === 'healthy' ? 'Render Live API' : 'Connecting'}
            </span>
          </div>

          {/* 60s Countdown and Refresh Button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] text-xs font-mono text-[var(--text-secondary)]">
              <Clock className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
              <span>Sync: <span className="font-bold text-[var(--weather-blue)]">{countdown}s</span></span>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--weather-blue)]/20 border border-[var(--weather-blue)]/40 hover:bg-[var(--weather-blue)]/30 text-[var(--weather-blue)] text-sm font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[var(--weather-blue)]' : ''}`} />
              <span className="hidden sm:inline">Sync Live Models</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Variable Selector Tabs & Lead Day Scrubber */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Variable Switcher */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
            Atmospheric Variable:
          </span>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => {
              const active = variable === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => onVariableChange(v.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-bold transition-all cursor-pointer border ${
                    active
                      ? 'bg-gradient-to-r from-[var(--weather-blue)] to-[var(--forecast-blue)] text-white border-[var(--weather-blue)] shadow-md'
                      : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--muted-surface)]/80 hover:text-[var(--text-primary)]'
                  }`}
                >
                  {v.icon}
                  <span>{v.label}</span>
                  <span className={`text-[11px] font-mono ${active ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                    ({v.unit})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Lead Day Quick Pills */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
            Forecast Lead Horizon:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 bg-[var(--muted-surface)] p-1.5 rounded-2xl border border-[var(--border)]">
            {leadDays.map((ld) => {
              const active = leadDay === ld.day;
              return (
                <button
                  key={ld.day}
                  onClick={() => onLeadDayChange(ld.day)}
                  className={`flex flex-col items-center px-3 py-1.5 rounded-xl font-mono transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--weather-blue)] text-white font-extrabold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <span className="text-xs font-bold leading-tight">{ld.label}</span>
                  <span className={`text-[10px] ${active ? 'text-white/80 font-bold' : 'text-[var(--text-secondary)]'}`}>
                    {ld.hours}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
