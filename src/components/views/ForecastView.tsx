'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Layers, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Gauge, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';
import { HorizonPredictabilityWall } from '../dashboard/HorizonPredictabilityWall';
import { EverydayDifferenceChart } from '../dashboard/EverydayDifferenceChart';
import { LocationQuickPicker } from '../common/LocationQuickPicker';
import { RegionalData } from '../../lib/data/regionalIntelligence';
import { WeatherVariable } from '../../lib/api/types';

interface ForecastViewProps {
  currentRegion: RegionalData;
  onSelectRegion: (slug: string) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  currentRegion,
  onSelectRegion,
}) => {
  const [variable, setVariable] = useState<WeatherVariable>('rainfall');
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const VARIABLES = [
    { id: 'rainfall' as WeatherVariable, label: 'Rainfall (24h)', icon: CloudRain, unit: 'mm' },
    { id: 'tmax' as WeatherVariable, label: 'Temperature', icon: Thermometer, unit: '°C' },
    { id: 'wind' as WeatherVariable, label: 'Wind Speed', icon: Wind, unit: 'm/s' },
    { id: 'mslp' as WeatherVariable, label: 'Pressure (MSLP)', icon: Gauge, unit: 'hPa' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* View Header - Stacked Pattern */}
      <div className="flex flex-col gap-5 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Top Section: Title, Badges, and Description */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] shadow-xs mt-0.5">
            <Calendar className="h-7 w-7" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
                10-Day Medium-Range Numerical Forecast & Reliability Strip
              </h1>
              <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-bold bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 font-mono">
                Day 1 → Day 10
              </span>
            </div>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              ECMWF IFS 0.25° vs GFS calibrated probabilities, predictability horizons, and run-to-run deltas for <strong className="text-[var(--text-primary)] font-bold">{currentRegion.name}</strong>
            </p>
          </div>
        </div>

        {/* Filter Section Underneath: Location Switcher */}
        <div className="pt-4 border-t border-[var(--border)]/70 w-full">
          <LocationQuickPicker
            currentRegion={currentRegion}
            onSelectRegion={onSelectRegion}
            label="Regions:"
          />
        </div>
      </div>

      {/* Variable & Day Controls - Stacked Pattern */}
      <div className="flex flex-col gap-4 p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
        {/* Variables Selection Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1 shrink-0">
            Metric:
          </span>
          {VARIABLES.map((v) => {
            const Icon = v.icon;
            const isActive = variable === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setVariable(v.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                    : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lead Day 1 to 10 Scrubber Row Underneath */}
        <div className="pt-3 border-t border-[var(--border)]/70 flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2 min-w-0 max-w-full overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mr-1 shrink-0">
              Horizon:
            </span>
            <div className="flex items-center gap-1.5 bg-[var(--muted-surface)] p-1 rounded-2xl border border-[var(--border)]">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all cursor-pointer ${
                    selectedDay === d
                      ? 'bg-[var(--weather-blue)] text-white shadow-xs'
                      : d >= 5
                      ? 'text-[var(--risk-high)] hover:bg-[var(--surface)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
                  }`}
                  title={`Lead Day ${d} (+${d * 24}h)`}
                >
                  D{d}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--muted-surface)] px-3 py-1.5 rounded-xl border border-[var(--border)] shrink-0">
            Selected: <strong className="text-[var(--weather-blue)]">Day {selectedDay} (+{selectedDay * 24}h Forecast)</strong>
          </span>
        </div>
      </div>

      {/* 10-Day Predictability Horizon & Bust Wall Component */}
      <HorizonPredictabilityWall
        regionSlug={currentRegion.slug}
        variable={variable}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onVariableChange={setVariable}
      />

      {/* Everyday Difference Chart */}
      <EverydayDifferenceChart
        regionSlug={currentRegion.slug}
        variable={variable}
        selectedLeadDay={selectedDay}
        onSelectLeadDay={setSelectedDay}
        onVariableChange={setVariable}
      />
    </div>
  );
};
