'use client';

import React, { useState, useEffect } from 'react';
import { getRegionalData } from '../../lib/data/regionalIntelligence';
import { WeatherVariable } from '../../lib/api/types';
import { 
  X, 
  Globe2, 
  Layers, 
  RotateCw, 
  Maximize2, 
  Wind, 
  CloudRain, 
  Thermometer, 
  ShieldAlert,
  ArrowLeft,
  Info,
  Sparkles,
  MapPin
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import for Three.js WebGL 3D India Weather Map
const IndiaWeatherMap = dynamic(
  () => import('../IndiaWeatherMap').then((m) => m.IndiaWeatherMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-[#101b20]">
        <div className="h-12 w-12 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-sm font-mono text-[var(--weather-blue)] font-bold">
          Rendering 3D Atmosphere Relief Simulation...
        </span>
      </div>
    ),
  }
);

// Dynamic import for MapLibre 3D Globe
const GlobeView = dynamic(
  () => import('./GlobeView').then((m) => m.GlobeView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-[var(--background)]">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-sm font-mono text-[var(--weather-blue)]">
          Projecting 3D Earth Globe...
        </span>
      </div>
    ),
  }
);

interface Props {
  isOpen: boolean;
  regionId: string | null;
  day: number;
  variable: WeatherVariable;
  onClose: () => void;
  onDayChange: (day: number) => void;
  onVariableChange: (v: WeatherVariable) => void;
}

export const Location3DModal: React.FC<Props> = ({
  isOpen,
  regionId,
  day,
  variable,
  onClose,
  onDayChange,
  onVariableChange,
}) => {
  const [viewMode, setViewMode] = useState<'relief-3d' | 'globe-3d'>('relief-3d');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !regionId) return null;

  const region = getRegionalData(regionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-7xl h-[92vh] rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 sm:px-6 py-3.5 bg-[var(--surface)]/95 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Map</span>
            </button>
            <div className="h-4 w-[1px] bg-[var(--border)] hidden sm:block" />
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[var(--weather-blue)]" />
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
                3D Geospatial Visualization · {region.name}
              </h3>
              <span className="hidden sm:inline-block rounded-full bg-[var(--weather-blue)]/10 px-2.5 py-0.5 text-xs font-mono text-[var(--weather-blue)] border border-[var(--weather-blue)]/30">
                {region.lat.toFixed(2)}°N, {region.lon.toFixed(2)}°E
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher: 3D Relief vs 3D Globe */}
            <div className="flex items-center bg-[var(--muted-surface)] p-1 rounded-xl border border-[var(--border)] text-xs">
              <button
                onClick={() => setViewMode('relief-3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'relief-3d'
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>3D India Relief</span>
              </button>
              <button
                onClick={() => setViewMode('globe-3d')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  viewMode === 'globe-3d'
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Globe2 className="h-3.5 w-3.5" />
                <span>3D Earth Globe</span>
              </button>
            </div>

            {/* Day Selector Pill */}
            <div className="hidden md:flex items-center gap-1 bg-[var(--muted-surface)] p-1 rounded-xl border border-[var(--border)] text-xs">
              <span className="text-[var(--text-secondary)] px-2 font-mono">Lead:</span>
              {[1, 3, 5, 7, 10].map((d) => (
                <button
                  key={d}
                  onClick={() => onDayChange(d)}
                  className={`px-2 py-0.5 rounded-lg font-mono font-medium transition-all cursor-pointer ${
                    day === d
                      ? 'bg-[var(--weather-blue)] text-white font-bold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                >
                  D{d}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 3D Visualizer Canvas Container */}
        <div className="relative flex-1 w-full h-full overflow-hidden bg-[#0d1518]">
          {viewMode === 'relief-3d' ? (
            <IndiaWeatherMap
              className="w-full h-full"
              day={day}
              onStateSelect={(name, slug) => {
                console.log('Selected 3D state:', name, slug);
              }}
            />
          ) : (
            <GlobeView
              mapData={null}
              selectedRegionId={region.slug}
              onSelectRegion={() => {}}
              variable={variable}
              onVariableChange={onVariableChange}
              day={day}
            />
          )}

          {/* Floating 3D HUD Overlay: Region Telemetry */}
          <div className="absolute top-4 left-4 z-20 max-w-xs sm:max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-4 shadow-2xl space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-sm font-extrabold text-[var(--text-primary)]">{region.name}</span>
              <span className="text-xs font-mono text-[var(--weather-blue)] font-bold bg-[var(--weather-blue)]/15 px-2 py-0.5 rounded border border-[var(--weather-blue)]/30">
                Day {day} Horizon
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Atmosphere Layer:</span>
                <span className="font-semibold text-[var(--text-primary)] uppercase">{variable}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Centroid Coordinates:</span>
                <span className="font-mono text-[var(--weather-blue)]">{region.lat.toFixed(2)}°N, {region.lon.toFixed(2)}°E</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">State / Province:</span>
                <span className="font-medium text-[var(--text-primary)]">{region.state}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">24h Rainfall:</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{region.rainfall24h} mm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[var(--text-secondary)]">Burst Probability:</span>
                <span className="font-mono font-bold text-amber-400">{region.burstProbability}%</span>
              </div>
            </div>

            {/* Layer Switcher Buttons */}
            <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Atmosphere Overlays
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => onVariableChange('rainfall')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    variable === 'rainfall'
                      ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                      : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent'
                  }`}
                >
                  <CloudRain className="h-3.5 w-3.5" />
                  <span>Rainfall Spread</span>
                </button>
                <button
                  onClick={() => onVariableChange('tmax')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    variable === 'tmax'
                      ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                      : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent'
                  }`}
                >
                  <Thermometer className="h-3.5 w-3.5" />
                  <span>Temperature</span>
                </button>
                <button
                  onClick={() => onVariableChange('wind')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    variable === 'wind'
                      ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                      : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent'
                  }`}
                >
                  <Wind className="h-3.5 w-3.5" />
                  <span>Wind Vectors</span>
                </button>
                <button
                  onClick={() => onVariableChange('mslp')}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    variable === 'mslp'
                      ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-bold'
                      : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] border border-transparent'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>MSLP Isobars</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom HUD Hint */}
          <div className="absolute bottom-4 left-4 z-20 bg-[var(--surface)]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] pointer-events-none shadow-md hidden sm:block">
            Click & drag to rotate 3D relief · Scroll to zoom · Click any state mesh to inspect synoptic dialog
          </div>
        </div>
      </div>
    </div>
  );
};
