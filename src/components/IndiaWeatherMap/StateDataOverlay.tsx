'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { StateWeather } from './types';

interface Props {
  centroids: Record<string, { x: number; y: number; z: number }>;
  weatherMap: Record<string, StateWeather>;
  camera: THREE.PerspectiveCamera | null;
  width: number;
  height: number;
  showBadges: boolean;
  onSelectState: (stateName: string) => void;
}

export const StateDataOverlay: React.FC<Props> = ({
  centroids,
  weatherMap,
  camera,
  width,
  height,
  showBadges,
  onSelectState
}) => {
  const projectedBadges = useMemo(() => {
    if (!camera || !showBadges || width <= 0 || height <= 0) return [];

    const tempV = new THREE.Vector3();
    const list: Array<{
      name: string;
      x: number;
      y: number;
      rain: number;
      wind: number;
      temp: number | null;
      isRain: boolean;
      isWind: boolean;
    }> = [];

    // Filter states to avoid overcrowding while ensuring all active weather states are shown
    for (const [name, pos] of Object.entries(centroids)) {
      tempV.set(pos.x, pos.y, pos.z);
      tempV.project(camera);

      // Check if in front of camera
      if (tempV.z >= 1.0) continue;

      const sx = ((tempV.x + 1) * width) / 2;
      const sy = ((-tempV.y + 1) * height) / 2;

      // Keep within canvas bounds
      if (sx < 25 || sx > width - 25 || sy < 50 || sy > height - 40) continue;

      const w = weatherMap[name] || { rain: 0, wind: 0, temp: null };
      const isRain = w.rain >= 0.8;
      const isWind = w.wind >= 1.8;

      list.push({
        name,
        x: Math.round(sx),
        y: Math.round(sy),
        rain: w.rain,
        wind: w.wind,
        temp: w.temp,
        isRain,
        isWind
      });
    }

    return list;
  }, [centroids, weatherMap, camera, width, height, showBadges]);

  if (!showBadges || projectedBadges.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {projectedBadges.map((b) => (
        <div
          key={b.name}
          onClick={() => onSelectState(b.name)}
          className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-75 hover:scale-115 hover:z-30 select-none group"
          style={{ left: `${b.x}px`, top: `${b.y}px` }}
        >
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-xs transition-colors text-[10px] sm:text-[11px] font-sans ${
              b.isRain && b.isWind
                ? 'bg-[#86A9BE]/90 border-[#6F9FC4] text-white font-bold'
                : b.isRain
                ? 'bg-[#6F9FC4]/90 border-[#2F5D7C] text-white font-bold'
                : b.isWind
                ? 'bg-[#DCC48F]/95 border-[#B9821F] text-[#1F2A33] font-bold'
                : 'bg-white/80 border-[#DDE3E8] text-[#1F2A33] hover:bg-white'
            }`}
          >
            <span className="font-semibold">{b.name}</span>
            <span className="opacity-40">|</span>
            <span className="font-mono flex items-center gap-0.5">
              <span>🌧️</span>
              <span>{b.rain}m</span>
            </span>
            <span className="font-mono flex items-center gap-0.5">
              <span>💨</span>
              <span>{b.wind}s</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
