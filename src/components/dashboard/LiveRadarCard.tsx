'use client';

import React, { useState, useRef } from 'react';
import {
  Disc,
  ChevronDown,
  Play,
  Pause,
  Maximize2,
  Plus,
  Minus,
  Layers,
  Crosshair,
  Sparkles,
  MapPin,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { RegionalData } from '../../lib/data/regionalIntelligence';
import { LocationQuickPicker } from '../common/LocationQuickPicker';
import { OwmLayerId, OWM_LAYERS } from '../radar/radarTypes';
import { RadarColorGradeBar } from '../radar/RadarColorGradeBar';

// Dynamic import for 3D India Weather Map (Three.js extruded states, rain particles, wind streamlines)
const IndiaWeatherMap = dynamic(
  () => import('../IndiaWeatherMap').then((m) => m.IndiaWeatherMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] rounded-2xl bg-[var(--muted-surface)] flex flex-col items-center justify-center p-6 space-y-3 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-[var(--weather-blue)] font-bold">
          Loading 3D Atmospheric Relief Simulation...
        </span>
      </div>
    ),
  }
);

// Dynamic import for Leaflet Radar Map (SSR-disabled)
const WeatherRadarMap = dynamic(
  () => import('../radar/WeatherRadarMap').then((m) => m.WeatherRadarMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[380px] rounded-2xl bg-[var(--muted-surface)] flex flex-col items-center justify-center p-6 space-y-3 animate-pulse">
        <div className="h-10 w-10 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-[var(--weather-blue)] font-bold">
          Loading Live Weather Radar Tiles...
        </span>
      </div>
    ),
  }
);

interface LiveRadarCardProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
  onOpen3DFullscreen?: () => void;
}

export const LiveRadarCard: React.FC<LiveRadarCardProps> = ({
  currentRegion,
  onSelectRegion,
  onOpen3DFullscreen,
}) => {
  const [activeLayer, setActiveLayer] = useState<OwmLayerId>('precipitation_new');
  const [isPlaying, setIsPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'radar-2d' | 'relief-3d'>('radar-2d');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleStateSelect = React.useCallback(
    (name: string, slug: string) => {
      onSelectRegion(slug || name.toLowerCase().replace(/\s+/g, '-'));
    },
    [onSelectRegion]
  );

  // Get current layer description for footer
  const currentLayerMeta = OWM_LAYERS.find((l) => l.id === activeLayer);

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col justify-between shadow-xs transition-all h-full">
      {/* Header bar - Stacked Pattern */}
      <div className="flex flex-col gap-3 pb-3 border-b border-[var(--border)]">
        {/* Top Section: Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs">
            <Disc className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-[var(--text-primary)]">
              Live Radar & Thermal Satellite Overlay
            </h2>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              OpenWeather Slippy Tile Layers · Click any location to update
            </span>
          </div>
        </div>

        {/* Controls Row: Layer Select + View Toggle */}
        <div className="pt-2.5 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Layer Selector Dropdown */}
            <div className="relative">
              <select
                value={activeLayer}
                onChange={(e) => setActiveLayer(e.target.value as OwmLayerId)}
                className="appearance-none pl-3 pr-8 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--weather-blue)] cursor-pointer"
              >
                {OWM_LAYERS.map((layer) => (
                  <option key={layer.id} value={layer.id}>
                    {layer.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-secondary)] pointer-events-none" />
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-xs font-mono font-bold text-[var(--safe-green)]">
              <span className="w-2 h-2 rounded-full bg-[var(--safe-green)] animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 3D / 2D Switcher */}
            <button
              onClick={() =>
                setViewMode(viewMode === 'radar-2d' ? 'relief-3d' : 'radar-2d')
              }
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'relief-3d'
                  ? 'border-[var(--weather-blue)] bg-[var(--weather-blue)] text-white shadow-xs'
                  : 'border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Toggle 3D Relief Simulation"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>3D</span>
            </button>

            {/* Fullscreen Button */}
            {onOpen3DFullscreen && (
              <button
                onClick={onOpen3DFullscreen}
                className="p-1.5 rounded-xl border border-[var(--border)] bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                title="Expand Fullscreen 3D Atmosphere"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layer Switcher Pills (visible in 2D radar mode) */}
      {viewMode === 'radar-2d' && (
        <div className="py-2.5 flex flex-wrap gap-1.5">
          {OWM_LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            let activeStyle = 'bg-sky-600 text-white shadow-lg shadow-sky-500/30 border-sky-400';
            if (layer.id === 'temp_new') {
              activeStyle = 'bg-amber-600 text-white shadow-lg shadow-amber-500/30 border-amber-400';
            } else if (layer.id === 'wind_new') {
              activeStyle = 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 border-emerald-400';
            } else if (layer.id === 'pressure_new') {
              activeStyle = 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-blue-400';
            } else if (layer.id === 'clouds_new') {
              activeStyle = 'bg-slate-700 text-white shadow-lg shadow-slate-500/30 border-slate-400';
            }

            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isActive
                    ? activeStyle
                    : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border)] hover:border-[var(--weather-blue)]/40'
                }`}
              >
                <span>{layer.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Location Chips */}
      <div className="py-2 border-b border-[var(--border)]/50">
        <LocationQuickPicker
          currentRegion={currentRegion}
          onSelectRegion={onSelectRegion}
          label="Quick Areas:"
        />
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="relative mt-3 rounded-2xl overflow-hidden min-h-[380px] sm:min-h-[400px] border border-[var(--border)] bg-[#0f1a24] flex items-center justify-center"
      >
        {viewMode === 'relief-3d' ? (
          <div className="w-full h-full min-h-[380px]">
            <IndiaWeatherMap
              className="w-full h-full min-h-[380px]"
              day={1}
              onStateSelect={handleStateSelect}
            />
          </div>
        ) : (
          <WeatherRadarMap
            center={[
              currentRegion.lat ?? 22.5,
              currentRegion.lon ?? 78.9,
            ]}
            regionName={currentRegion.name}
            activeLayer={activeLayer}
            zoom={7}
            minHeight="380px"
          />
        )}
      </div>

      {/* Dynamic Radar Color Grade & Spatial Telemetry Bar */}
      <RadarColorGradeBar
        activeLayer={activeLayer}
        currentRegion={currentRegion}
        className="mt-3.5"
      />

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[10px] sm:text-xs text-[var(--text-secondary)]">
        <span>
          Layer:{' '}
          <strong className="text-[var(--text-primary)]">
            {currentLayerMeta?.description || activeLayer}
          </strong>
        </span>
        <span>© OpenWeather · Esri</span>
      </div>
    </div>
  );
};
