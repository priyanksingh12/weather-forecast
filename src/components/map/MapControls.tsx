import React from 'react';
import { WeatherVariable } from '../../lib/api/types';
import { Layers, Calendar, Sliders, Globe2, MapPin } from 'lucide-react';
import Link from 'next/link';

interface Props {
  variable: WeatherVariable;
  onVariableChange: (v: WeatherVariable) => void;
  day: number;
  onDayChange: (d: number) => void;
  cycle: string;
  is3d?: boolean;
}

export const MapControls: React.FC<Props> = ({
  variable,
  onVariableChange,
  day,
  onDayChange,
  cycle,
  is3d = false
}) => {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Top Header & 3D Switch */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 gap-3">
        <div className="flex items-center gap-2.5 text-sm sm:text-base font-extrabold text-[var(--text-primary)]">
          <Sliders className="h-5 w-5 text-[var(--weather-blue)]" />
          <span className="uppercase tracking-wider">Map Query Controls</span>
        </div>
        <Link
          href={is3d ? '/' : '/globe'}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--weather-blue)]/15 hover:bg-[var(--weather-blue)]/25 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 text-xs sm:text-sm font-bold transition-all shadow-sm"
        >
          <Globe2 className="h-4 w-4" />
          <span>{is3d ? 'Switch to 2D Map' : '3D Globe Layer'}</span>
        </Link>
      </div>

      {/* Variable Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-[var(--text-secondary)]">Predictive Variable</label>
          <span className="text-xs text-[var(--weather-blue)] font-mono font-semibold">Target</span>
        </div>
        <select
          value={variable}
          onChange={(e) => onVariableChange(e.target.value as WeatherVariable)}
          className="w-full rounded-2xl border-2 border-[var(--border)] bg-[var(--muted-surface)] px-4 py-3 text-sm sm:text-base font-medium text-[var(--text-primary)] focus:border-[var(--weather-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--weather-blue)]"
        >
          <option value="rainfall" className="bg-[var(--surface)] text-[var(--text-primary)]">Rainfall (24h Accumulation)</option>
          <option value="tmax" className="bg-[var(--surface)] text-[var(--text-primary)]">Maximum Temperature (Tmax)</option>
          <option value="tmin" className="bg-[var(--surface)] text-[var(--text-primary)]">Minimum Temperature (Tmin)</option>
          <option value="wind" className="bg-[var(--surface)] text-[var(--text-primary)]">10m Surface Wind Speed</option>
          <option value="mslp" className="bg-[var(--surface)] text-[var(--text-primary)]">Mean Sea Level Pressure (MSLP)</option>
          <option value="humidity" className="bg-[var(--surface)] text-[var(--text-primary)]">Relative Humidity</option>
        </select>
      </div>

      {/* Forecast Day Horizon Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[var(--text-secondary)]">Forecast Lead Time</span>
          <span className="font-mono text-[var(--weather-blue)] font-black text-sm sm:text-base bg-[var(--weather-blue)]/15 px-3 py-1 rounded-xl border border-[var(--weather-blue)]/30 shadow-sm">
            Day {day} ({day * 24}h Ahead)
          </span>
        </div>

        <input
          type="range"
          min={1}
          max={10}
          value={day}
          onChange={(e) => onDayChange(Number(e.target.value))}
          className="w-full accent-[var(--weather-blue)] cursor-pointer h-2.5 bg-[var(--muted-surface)] rounded-lg"
        />

        {/* Quick Stepper Buttons with larger fonts */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {[1, 3, 5, 7, 10].map((d) => (
            <button
              key={d}
              onClick={() => onDayChange(d)}
              className={`py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
                day === d
                  ? 'bg-[var(--weather-blue)] text-white shadow-md'
                  : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-[var(--border)]'
              }`}
            >
              Day {d}
            </button>
          ))}
        </div>
      </div>

      {/* Active NWP Cycle Indicator */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)] p-3.5 flex items-center justify-between text-xs sm:text-sm">
        <span className="text-[var(--text-secondary)] font-medium">Assimilation Cycle:</span>
        <span className="font-mono text-[var(--weather-blue)] font-bold">{cycle || 'ECMWF IFS 00Z (23 Sep 2026)'}</span>
      </div>
    </div>
  );
};
