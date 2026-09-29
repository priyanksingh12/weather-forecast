'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  CloudRain,
  Thermometer,
  Wind,
  Eye,
  Calendar,
  Layers,
  MapPin,
  Maximize2,
  Info,
} from 'lucide-react';
import { RegionalData } from '../../lib/data/regionalIntelligence';
import { LocationQuickPicker } from '../common/LocationQuickPicker';

// Dynamic import for the 3D India Weather Map (Three.js WebGL)
const IndiaWeatherMap = dynamic(
  () => import('../IndiaWeatherMap').then((m) => m.IndiaWeatherMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] sm:h-[750px] rounded-3xl bg-[var(--muted-surface)] flex flex-col items-center justify-center p-6 space-y-3 animate-pulse border border-[var(--border)]">
        <div className="h-12 w-12 rounded-full border-3 border-[var(--weather-blue)] border-t-transparent animate-spin" />
        <span className="text-sm font-mono text-[var(--weather-blue)] font-bold">
          Initializing 3D India Weather Relief Simulation...
        </span>
      </div>
    ),
  }
);

interface LiveRadarViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const LiveRadarView: React.FC<LiveRadarViewProps> = ({
  currentRegion,
  onSelectRegion,
}) => {
  const [selectedOverlay, setSelectedOverlay] = useState<'rain' | 'temp' | 'wind' | 'clouds'>('rain');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const handleStateSelect = React.useCallback(
    (name: string, slug: string) => {
      onSelectRegion(slug || name.toLowerCase().replace(/\s+/g, '-'));
    },
    [onSelectRegion]
  );

  const OVERLAYS = [
    { id: 'rain', label: 'Rain Radar', icon: CloudRain },
    { id: 'temp', label: 'Temperature', icon: Thermometer },
    { id: 'wind', label: 'Wind Velocity', icon: Wind },
    { id: 'clouds', label: 'Satellite Clouds', icon: Eye },
  ] as const;

  const LEAD_DAYS = [1, 2, 3, 4, 5, 7, 10];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Page Header - 3D Visualization */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Top: Title, Badges, and Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs mt-0.5">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                3D Visualization
              </h1>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--safe-green)]/15 text-[var(--safe-green)] border border-[var(--safe-green)]/30">
                Interactive WebGL
              </span>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30">
                NWP Day {selectedDay} Horizon
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              High-resolution 3D relief model of India with extruded state geometry, real-time particle rainfall, and streamline wind dynamics.
              Click any state to inspect atmospheric telemetry and multi-model forecast reliability.
            </p>
          </div>
        </div>

        {/* Lead Day Horizon Selector Row */}
        <div className="pt-4 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-[var(--weather-blue)]" />
              Lead Day:
            </span>
            {LEAD_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedDay === d
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                }`}
              >
                Day {d}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
            <Info className="h-3.5 w-3.5 text-[var(--weather-blue)]" />
            <span>Click any state mesh to open full synoptic dialog</span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar: Overlays and Quick Locations (Matching media_1790627532316.png) */}
      <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Overlays selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1 shrink-0">
            Overlays:
          </span>
          {OVERLAYS.map((overlay) => {
            const Icon = overlay.icon;
            const isActive = selectedOverlay === overlay.id;
            return (
              <button
                key={overlay.id}
                onClick={() => setSelectedOverlay(overlay.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs border border-[var(--weather-blue)]'
                    : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{overlay.label}</span>
              </button>
            );
          })}
        </div>

        {/* Locations Bar with all 36 Indian states, UTs, and major cities */}
        <div className="pt-3 border-t border-[var(--border)]/70 w-full">
          <LocationQuickPicker
            currentRegion={currentRegion}
            onSelectRegion={onSelectRegion}
            label="Locations:"
          />
        </div>
      </div>

      {/* 3. Main 3D Canvas Viewport */}
      <div className="rounded-3xl border border-[var(--border)] bg-[#101b20] overflow-hidden min-h-[650px] sm:min-h-[750px] relative shadow-xl">
        <IndiaWeatherMap
          className="w-full h-[650px] sm:h-[750px]"
          day={selectedDay}
          onStateSelect={handleStateSelect}
        />
      </div>

      {/* 4. Bottom Info Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text-secondary)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--safe-green)] animate-pulse" />
            3D Relief Online
          </span>
          <span>•</span>
          <span>
            Active Center: <strong className="text-[var(--text-primary)]">{currentRegion.name}, {currentRegion.state}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span>Rain: {currentRegion.rainfall24h} mm</span>
          <span>•</span>
          <span>Wind: {currentRegion.windSpeedKmH} km/h</span>
          <span>•</span>
          <span>P(Bust): {currentRegion.burstProbability}%</span>
        </div>

        <span className="text-[11px] font-mono text-[var(--text-secondary)]">
          Three.js · Extruded GeoJSON Boundaries · Particle Simulation
        </span>
      </div>
    </div>
  );
};
