'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Database, 
  Server, 
  Check, 
  RefreshCw,
  Sun,
  Moon,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { RegionalData, REGIONAL_DATA_CATALOG, ALL_STATES_LIST, ALL_UTS_LIST, ALL_CITIES_LIST } from '../../lib/data/regionalIntelligence';

interface SettingsViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentRegion,
  onSelectRegion
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activeCycle, setActiveCycle] = useState('2026092800');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* View Header */}
      <div className="flex items-center gap-3.5 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs">
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)]">
            Platform Configuration & Telemetry Gateways
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
            Manage forecast cycles, OpenWeather failover keys, API gateways, and visual preferences
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Numerical Weather Prediction Cycle */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Server className="h-5 w-5 text-[var(--weather-blue)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Forecast Model Run Cycle</h2>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Select which ECMWF IFS and NOAA GFS numerical assimilation cycle to evaluate across India.
          </p>

          <div className="space-y-2">
            {[
              { id: '2026092800', label: '2026-09-28 00:00 UTC (Latest Operational Run)', active: true },
              { id: '2026092712', label: '2026-09-27 12:00 UTC (Previous Cycle for Run-to-Run Delta)', active: false },
            ].map((c) => (
              <label
                key={c.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  activeCycle === c.id
                    ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/10 text-[var(--weather-blue)] font-bold'
                    : 'border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="cycle"
                    checked={activeCycle === c.id}
                    onChange={() => setActiveCycle(c.id)}
                    className="accent-[var(--weather-blue)]"
                  />
                  <span className="text-xs">{c.label}</span>
                </div>
                {c.active && (
                  <span className="text-[10px] font-mono bg-[var(--safe-green)]/20 text-[var(--safe-green)] px-2 py-0.5 rounded-full">
                    Live
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* 2. OpenWeather Dual-Key Failover Monitor */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Key className="h-5 w-5 text-[var(--safe-green)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">OpenWeather Failover Monitor</h2>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Automated server-side key rotation protects against quota limits and 401 token errors.
          </p>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Primary Key</span>
                <span className="text-[var(--text-primary)] font-bold">161121...e5849 (Active)</span>
              </div>
              <span className="text-xs font-bold text-[var(--safe-green)] flex items-center gap-1">
                <ShieldCheck className="h-4 w-4" /> Healthy
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Backup Failover Key</span>
                <span className="text-[var(--text-primary)] font-bold">bdac24...e3612 (Standby)</span>
              </div>
              <span className="text-xs font-bold text-[var(--safe-green)] flex items-center gap-1">
                <Check className="h-4 w-4" /> Ready
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--muted-surface)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <span className="text-[var(--text-secondary)] block text-[10px]">Redis Telemetry Caching</span>
                <span className="text-[var(--text-primary)] font-bold">TTL 600 seconds (sub-2ms response)</span>
              </div>
              <span className="text-xs text-[var(--weather-blue)]">Enabled</span>
            </div>
          </div>
        </div>

        {/* 3. Theme & Appearance */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Sun className="h-5 w-5 text-amber-400" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Color Palette & Theme</h2>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Toggle between the light design system and deep atmospheric dark mode.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                theme === 'light'
                  ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs'
                  : 'border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Sun className="h-4 w-4" />
              <span>Light Mode</span>
            </button>

            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs'
                  : 'border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Moon className="h-4 w-4" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* 4. Default Regional Headquarters */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
            <Database className="h-5 w-5 text-[var(--weather-blue)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Default Operations Center</h2>
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Set the default centroid loaded on platform launch.
          </p>

          <select
            value={currentRegion.slug}
            onChange={(e) => onSelectRegion(e.target.value)}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-3 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)]"
          >
            <optgroup label="28 Indian States (All Available)">
              {ALL_STATES_LIST.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} — {r.state} (STATE)
                </option>
              ))}
            </optgroup>
            <optgroup label="8 Union Territories (All Available)">
              {ALL_UTS_LIST.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} — {r.state} (UT)
                </option>
              ))}
            </optgroup>
            <optgroup label="Major Metropolitan Cities">
              {ALL_CITIES_LIST.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name} — {r.state}
                </option>
              ))}
            </optgroup>
          </select>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[var(--weather-blue)] text-white font-bold text-xs shadow-md hover:brightness-110 active:scale-98 transition-all cursor-pointer"
            >
              {isSaved ? <Check className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
              <span>{isSaved ? 'Preferences Saved!' : 'Apply Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
