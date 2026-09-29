'use client';

import React, { useEffect, useRef } from 'react';
import { StateWeather, WeatherCondition } from './types';
import { RAIN_MIN, WIND_MIN } from './sampleData';
import { RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  stateName: string | null;
  weather: StateWeather | null;
  onClose: () => void;
  onRetry?: () => void;
}

export function getConditions(w: StateWeather): WeatherCondition[] {
  const c: WeatherCondition[] = [];
  if (w.rain >= RAIN_MIN) c.push({ t: 'Rain', c: 'var(--cyan)' });
  if (w.wind >= WIND_MIN) c.push({ t: 'Strong wind', c: 'var(--ok)' });
  if (!c.length) c.push({ t: 'Calm', c: 'var(--dim)' });
  return c;
}

export const WeatherDialog: React.FC<Props> = ({
  isOpen,
  stateName,
  weather,
  onClose,
  onRetry
}) => {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement;
      // Focus close button on open
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        previouslyFocusedElementRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !stateName || !weather) return null;

  const conditions = getConditions(weather);
  const condText = conditions.map((c) => c.t).join(' and ');

  const confScore = weather.conf ?? 75;
  const confBand = confScore >= 75 
    ? { label: 'High', color: 'var(--safe-green)', bg: 'rgba(106, 186, 150, 0.15)', border: 'rgba(106, 186, 150, 0.3)' }
    : confScore >= 55 
    ? { label: 'Moderate', color: 'var(--warning)', bg: 'rgba(186, 158, 106, 0.15)', border: 'rgba(186, 158, 106, 0.3)' } 
    : { label: 'Low', color: 'var(--danger)', bg: 'rgba(186, 106, 106, 0.15)', border: 'rgba(186, 106, 106, 0.3)' };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="weather-dialog-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      style={{
        fontFamily: 'Inter, sans-serif'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-6 shadow-2xl flex flex-col text-[var(--text-primary)]"
      >
        {/* Header */}
        <header className="flex justify-between items-start gap-3">
          <div>
            <h2
              id="weather-dialog-title"
              className="text-2xl font-bold leading-tight text-[var(--text-primary)]"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              {stateName}
            </h2>
            {weather.status === 'loading' && (
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-1 font-mono">
                <RefreshCw className="h-3 w-3 animate-spin text-[var(--weather-blue)]" />
                Loading latest forecast...
              </span>
            )}
          </div>

          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center text-lg hover:bg-[var(--muted-surface)] focus-visible:outline-2 focus-visible:outline-[var(--weather-blue)] cursor-pointer transition-colors"
          >
            &times;
          </button>
        </header>

        {/* Large Temperature */}
        <div
          className="text-5xl font-extrabold mt-3 leading-none text-[var(--text-primary)]"
          style={{ fontFamily: 'Fraunces, serif' }}
        >
          {weather.temp !== null ? `${weather.temp}°C` : '—'}
        </div>

        {/* Condition Subtitle */}
        <div className="text-sm text-[var(--text-secondary)] mb-5 mt-1.5 font-medium">
          {condText}
        </div>

        {/* 2x2 Grid of Values */}
        <div className="grid grid-cols-2 gap-3">
          {/* Rainfall (Blue) */}
          <div className="border border-[var(--border)] bg-[var(--muted-surface)]/60 rounded-xl p-3">
            <small className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Rainfall (Blue)
            </small>
            <b className="text-xl font-bold text-[var(--weather-blue)]">{weather.rain}</b>
            <span className="text-xs text-[var(--text-secondary)] ml-1">mm/24h</span>
          </div>

          {/* Wind (Grey) */}
          <div className="border border-[var(--border)] bg-[var(--muted-surface)]/60 rounded-xl p-3">
            <small className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Wind (Grey)
            </small>
            <b className="text-xl font-bold text-[var(--text-secondary)]">{weather.wind}</b>
            <span className="text-xs text-[var(--text-secondary)] ml-1">m/s</span>
          </div>

          {/* Pressure */}
          <div className="border border-[var(--border)] bg-[var(--muted-surface)]/60 rounded-xl p-3">
            <small className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Pressure
            </small>
            <b className="text-xl font-bold text-[var(--text-primary)]">
              {weather.pressure !== null ? weather.pressure : '—'}
            </b>
            <span className="text-xs text-[var(--text-secondary)] ml-1">hPa</span>
          </div>

          {/* Humidity */}
          <div className="border border-[var(--border)] bg-[var(--muted-surface)]/60 rounded-xl p-3">
            <small className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Humidity
            </small>
            <b className="text-xl font-bold text-[var(--text-primary)]">
              {weather.rh !== null ? weather.rh : '—'}
            </b>
            <span className="text-xs text-[var(--text-secondary)] ml-1">%</span>
          </div>
        </div>

        {/* Forecast Confidence Row */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border)] text-sm text-[var(--text-secondary)]">
          <span>Forecast Confidence</span>
          <span
            style={{
              color: confBand.color,
              backgroundColor: confBand.bg,
              borderColor: confBand.border
            }}
            className="px-2.5 py-1 rounded-full text-xs font-mono font-bold border"
          >
            {confBand.label} · {weather.conf !== null ? `${weather.conf}%` : '—'}
          </span>
        </div>

        {/* 5-Day Forecast Strip */}
        {weather.forecast && weather.forecast.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
            <span className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              5-Day Model Trajectory (ECMWF + GFS Consensus)
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {weather.forecast.map((f) => (
                <div
                  key={f.day}
                  className="p-2 rounded-xl bg-[var(--muted-surface)]/70 border border-[var(--border)]/60 text-center space-y-1"
                >
                  <span className="block text-[10px] font-mono font-bold text-[var(--text-secondary)]">
                    Day {f.day}
                  </span>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {f.temp !== undefined ? `${f.temp}°` : '—'}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--weather-blue)] font-bold">
                    {f.rain}mm
                  </div>
                  <div className="text-[9px] font-mono text-[var(--text-secondary)]">
                    {f.wind}m/s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Set Active & Close */}
        <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--muted-surface)] hover:bg-[var(--border)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Error Retry Notice */}
        {weather.status === 'error' && onRetry && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between text-xs text-red-500 font-medium">
            <span>{weather.errorMessage || 'Could not load full forecast.'}</span>
            <button
              onClick={onRetry}
              className="px-2 py-0.5 rounded-lg bg-red-500/20 font-bold hover:bg-red-500/30 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
