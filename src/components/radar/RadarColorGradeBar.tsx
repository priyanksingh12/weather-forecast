'use client';

import React, { useState } from 'react';
import {
  CloudRain,
  Thermometer,
  Wind,
  Gauge,
  Cloud,
  MapPin,
  TrendingDown,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { OwmLayerId } from './radarTypes';
import { RADAR_COLOR_GRADES } from './radarColorGrades';
import { RegionalData } from '../../lib/data/regionalIntelligence';

interface RadarColorGradeBarProps {
  activeLayer: OwmLayerId;
  currentRegion?: RegionalData;
  className?: string;
}

export const RadarColorGradeBar: React.FC<RadarColorGradeBarProps> = ({
  activeLayer,
  currentRegion,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const grade = RADAR_COLOR_GRADES[activeLayer] || RADAR_COLOR_GRADES.precipitation_new;

  const currentVal = currentRegion
    ? grade.getCurrentValue({
        temperature: currentRegion.temperature,
        rainfall24h: currentRegion.rainfall24h,
        windSpeedKmH: currentRegion.windSpeedKmH,
        pressureHpa: currentRegion.pressureHpa,
        humidity: currentRegion.humidity,
      })
    : null;

  const getLayerIcon = () => {
    switch (activeLayer) {
      case 'precipitation_new':
        return <CloudRain className="h-4 w-4 text-cyan-400" />;
      case 'temp_new':
        return <Thermometer className="h-4 w-4 text-amber-400" />;
      case 'wind_new':
        return <Wind className="h-4 w-4 text-emerald-400" />;
      case 'pressure_new':
        return <Gauge className="h-4 w-4 text-blue-400" />;
      case 'clouds_new':
        return <Cloud className="h-4 w-4 text-slate-300" />;
      default:
        return <CloudRain className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--muted-surface)]/90 backdrop-blur-md p-3.5 sm:p-4 space-y-3 transition-all ${className}`}
    >
      {/* Header with Layer Name, Unit, and Current Region Pointer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
            {getLayerIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                {grade.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--weather-blue)] font-bold">
                {grade.unit}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] font-medium">
              Live Color Grade & Spatial Density Matrix
            </span>
          </div>
        </div>

        {/* Current Station Pin on Scale */}
        {currentRegion && currentVal && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs font-mono self-start sm:self-auto shadow-xs">
            <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
            <span className="text-[var(--text-secondary)]">{currentRegion.name}:</span>
            <strong className="text-[var(--text-primary)] font-bold">
              {currentVal.formatted}
            </strong>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
              style={{ backgroundColor: currentVal.badgeColor }}
            >
              {currentVal.statusLabel}
            </span>
          </div>
        )}
      </div>

      {/* The Continuous Color Grade Scale */}
      <div className="space-y-1.5">
        {/* Gradient Bar Container with Pointer */}
        <div className="relative pt-3 pb-1">
          {/* Active Region Cursor Pointer */}
          {currentVal && (
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-all duration-500 z-10"
              style={{ left: `${currentVal.percentage}%` }}
            >
              <span
                className="text-[9px] font-black px-1.5 py-0.2 rounded shadow-md text-slate-900 border border-white/60 uppercase whitespace-nowrap"
                style={{ backgroundColor: '#ffffff' }}
              >
                {currentRegion?.name || 'Current'}
              </span>
              <div
                className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-white -mt-0.5"
              />
            </div>
          )}

          {/* Continuous Gradient Bar */}
          <div
            className="h-3.5 sm:h-4 w-full rounded-full shadow-inner border border-white/20 transition-all"
            style={{ background: grade.gradientCss }}
          />
        </div>

        {/* Lower vs Higher Extreme End Markers */}
        <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold">
          <div className="flex items-center gap-1 text-[var(--weather-blue)]">
            <TrendingDown className="h-3 w-3" />
            <span>{grade.lowLabel}</span>
          </div>
          <div className="text-[10px] font-semibold text-[var(--text-secondary)] hidden sm:inline-block">
            ← LOWER &bull; HIGHER →
          </div>
          <div className="flex items-center gap-1 text-rose-400">
            <span>{grade.highLabel}</span>
            <TrendingUp className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Discrete Stops & Threshold Legend Chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-7 gap-1.5 pt-1">
        {grade.stops.map((stop) => (
          <div
            key={stop.label}
            className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[10px] sm:text-[11px] font-mono"
            title={`${stop.label}: ${stop.description}`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs border border-white/30"
              style={{ backgroundColor: stop.color }}
            />
            <div className="min-w-0 flex flex-col leading-tight">
              <span className="font-bold text-[var(--text-primary)] truncate">
                {stop.label}
              </span>
              <span className="text-[9px] text-[var(--text-secondary)] truncate">
                {stop.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostic Guide: How to Read Higher vs Lower Zones */}
      <div className="pt-2 border-t border-[var(--border)]/60 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[var(--text-secondary)] font-bold text-[11px] uppercase tracking-wider">
            <Info className="h-3.5 w-3.5 text-[var(--weather-blue)] shrink-0" />
            <span>How to Read Radar Colors (Higher vs Lower Zones)</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] text-[var(--weather-blue)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
          >
            <span>{isExpanded ? 'Less details' : 'More details'}</span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Collapsible/Expandable Diagnostic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] leading-relaxed">
          <div className="p-2.5 rounded-xl bg-[var(--surface)]/80 border border-[var(--border)] space-y-1">
            <span className="font-bold text-[var(--weather-blue)] flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>Where Values are LOWER:</span>
            </span>
            <p className="text-[var(--text-secondary)]">{grade.explanation.low}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--surface)]/80 border border-[var(--border)] space-y-1">
            <span className="font-bold text-rose-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Where Values are HIGHER:</span>
            </span>
            <p className="text-[var(--text-secondary)]">{grade.explanation.high}</p>
          </div>
        </div>

        {isExpanded && (
          <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[11px] text-[var(--text-secondary)] font-medium leading-relaxed">
            <strong className="text-[var(--text-primary)]">Spatial Telemetry Tip: </strong>
            {grade.explanation.summary}
          </div>
        )}
      </div>
    </div>
  );
};
