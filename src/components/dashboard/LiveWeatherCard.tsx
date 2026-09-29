'use client';

import React from 'react';
import { LiveWeatherOut } from '../../services/api';
import { 
  Droplets, 
  Wind, 
  Gauge, 
  Cloud, 
  CloudRain, 
  Eye, 
  Radio, 
  CheckCircle2 
} from 'lucide-react';

interface LiveWeatherCardProps {
  weather: LiveWeatherOut | null;
  loading?: boolean;
}

export const LiveWeatherCard: React.FC<LiveWeatherCardProps> = ({ weather, loading }) => {
  if (loading || !weather) {
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

  const cond = weather.weather?.[0] || { main: 'Clear', description: 'Clear sky', icon_url: '' };

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xs flex flex-col justify-between transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[11px] font-bold text-[var(--safe-green)] bg-[var(--safe-green)]/15 border border-[var(--safe-green)]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe-green)] animate-pulse" />
            Live Ground Truth (OpenWeather)
          </span>
          <h3 className="text-xl font-black text-[var(--text-primary)] mt-1.5">
            {weather.region_name}, {weather.country}
          </h3>
        </div>

        {cond.icon_url ? (
          <img src={cond.icon_url} alt={cond.description} className="w-12 h-12 object-contain" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)]">
            <Radio className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
          {Math.round(weather.temp)}°C
        </span>
        <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          Feels like {Math.round(weather.feels_like)}°C
        </span>
        <span className="text-xs text-[var(--text-secondary)] capitalize ml-auto font-semibold">
          ({cond.description})
        </span>
      </div>

      {/* 6 Atmospheric Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[11px]">
            <Droplets className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Humidity</span>
          </div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{weather.humidity_pct}%</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[11px]">
            <Wind className="h-3.5 w-3.5 text-[var(--atmospheric-teal)]" />
            <span>Wind</span>
          </div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{weather.wind_speed_mps} m/s</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[11px]">
            <Gauge className="h-3.5 w-3.5 text-[var(--forecast-blue)]" />
            <span>Pressure</span>
          </div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{Math.round(weather.pressure_hpa)} hPa</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[11px]">
            <Cloud className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
            <span>Cloudiness</span>
          </div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{weather.clouds_pct}%</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[11px]">
            <CloudRain className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Rain (1h)</span>
          </div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">{weather.rain_1h_mm ?? 0.0} mm</div>
        </div>

        <div className="bg-[var(--muted-surface)] border border-[var(--border)] rounded-2xl p-2.5">
          <div className="text-[var(--text-secondary)] flex items-center gap-1 text-[11px]">
            <Eye className="h-3.5 w-3.5 text-[var(--safe-green)]" />
            <span>Visibility</span>
          </div>
          <div className="text-[var(--text-primary)] font-bold text-sm mt-0.5">
            {weather.visibility_m ? (weather.visibility_m / 1000).toFixed(1) + ' km' : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};
