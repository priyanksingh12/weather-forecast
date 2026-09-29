'use client';

import React, { useMemo } from 'react';
import { StateWeather } from './types';
import { Wind, CloudRain, Activity } from 'lucide-react';

interface Props {
  weatherMap: Record<string, StateWeather>;
  day?: number;
  onSelectState: (stateName: string) => void;
}

export const LiveTelemetryStrip: React.FC<Props> = ({
  weatherMap,
  day = 1,
  onSelectState
}) => {
  const { topWind, topRain, totalRainStates, totalWindStates } = useMemo(() => {
    const list = Object.entries(weatherMap).map(([name, w]) => ({
      name,
      rain: w.rain || 0,
      wind: w.wind || 0
    }));

    const sortedWind = [...list].sort((a, b) => b.wind - a.wind);
    const sortedRain = [...list].sort((a, b) => b.rain - a.rain);

    return {
      topWind: sortedWind.slice(0, 5),
      topRain: sortedRain.slice(0, 5),
      totalRainStates: list.filter((s) => s.rain >= 0.8).length,
      totalWindStates: list.filter((s) => s.wind >= 1.8).length
    };
  }, [weatherMap]);

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto select-none">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#DDE3E8] p-2.5 px-3.5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#1F2A33]">
        {/* Telemetry Summary Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold font-mono text-[#2F5D7C]">
            <Activity className="h-3.5 w-3.5 animate-pulse text-[#2F5D7C]" />
            <span>Live ECMWF IFS Day {day}:</span>
          </div>

          <span className="flex items-center gap-1 bg-[#6F9FC4]/15 text-[#2F5D7C] px-2 py-0.5 rounded-full font-medium">
            <CloudRain className="h-3 w-3" />
            <span>Rainfall Active: <b>{totalRainStates} states</b></span>
          </span>

          <span className="flex items-center gap-1 bg-[#DCC48F]/25 text-[#7A5A17] px-2 py-0.5 rounded-full font-medium">
            <Wind className="h-3 w-3" />
            <span>Wind Belts: <b>{totalWindStates} states</b></span>
          </span>
        </div>

        {/* Live Top Movers / Clickable Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
          <span className="text-[#5F6C76] font-medium hidden sm:inline whitespace-nowrap">Peak Winds:</span>
          {topWind.slice(0, 4).map((s) => (
            <button
              key={s.name}
              onClick={() => onSelectState(s.name)}
              className="px-2 py-0.5 rounded-lg bg-zinc-100 hover:bg-[#DCC48F]/30 text-[#1F2A33] border border-[#DDE3E8] transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-mono"
              title={`View ${s.name} details`}
            >
              <span className="font-sans font-bold">{s.name.split(' ')[0]}</span>
              <span className="text-[#B9821F] font-bold">💨 {s.wind} m/s</span>
            </button>
          ))}

          {topRain.filter(r => r.rain > 0).slice(0, 2).map((s) => (
            <button
              key={s.name}
              onClick={() => onSelectState(s.name)}
              className="px-2 py-0.5 rounded-lg bg-cyan-50 hover:bg-[#6F9FC4]/30 text-[#1F2A33] border border-cyan-200 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-mono"
              title={`View ${s.name} details`}
            >
              <span className="font-sans font-bold">{s.name.split(' ')[0]}</span>
              <span className="text-[#2F5D7C] font-bold">🌧️ {s.rain} mm</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
