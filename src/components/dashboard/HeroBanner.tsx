'use client';

import React from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Gauge, 
  Eye, 
  MapPin 
} from 'lucide-react';

interface HeroBannerProps {
  cityName?: string;
  stateName?: string;
  coordinates?: string;
  temperature?: number;
  conditionText?: string;
  feelsLike?: number;
  humidity?: number;
  windSpeedKmH?: number;
  pressureHpa?: number;
  visibilityKm?: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  cityName = 'Lucknow',
  stateName = 'Uttar Pradesh, India',
  coordinates = '26.85°N, 80.95°E',
  temperature = 28,
  conditionText = 'Partly Cloudy',
  feelsLike = 31,
  humidity = 72,
  windSpeedKmH = 14,
  pressureHpa = 1008,
  visibilityKm = 8,
}) => {
  // Determine greeting based on current time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] shadow-md transition-all">
      {/* Background Graphic: Mountains & Atmospheric Clouds */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
        style={{
          backgroundImage: `
            radial-gradient(circle at 75% 35%, rgba(106, 168, 185, 0.45), transparent 60%),
            linear-gradient(to right, rgba(20, 42, 51, 0.85) 0%, rgba(20, 42, 51, 0.55) 45%, rgba(20, 42, 51, 0.82) 100%),
            url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')
          `
        }}
      />

      {/* Atmospheric Mountain Silhouette Layer */}
      <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

      {/* Content Grid */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Location & Greeting */}
        <div className="space-y-1.5 max-w-sm">
          <span className="text-sm sm:text-base font-medium text-white/80 block">
            {greeting}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-sm">
            {cityName}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-white/90">
            {stateName}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-white/70 pt-0.5">
            <MapPin className="h-3.5 w-3.5 text-[var(--weather-blue)] shrink-0" />
            <span>{coordinates}</span>
          </div>
        </div>

        {/* Center: Large Weather Condition & Temperature */}
        <div className="flex items-center gap-4 sm:gap-6 bg-white/10 dark:bg-black/25 backdrop-blur-md px-5 py-3.5 rounded-3xl border border-white/15 shadow-sm">
          <div className="flex items-center justify-center p-2.5 rounded-2xl bg-white/15 backdrop-blur-sm text-amber-300">
            <CloudSun className="h-10 w-10 sm:h-12 sm:w-12 animate-pulse drop-shadow-sm" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
                {temperature}°C
              </span>
            </div>
            <span className="text-sm sm:text-base font-bold text-white/95 leading-tight">
              {conditionText}
            </span>
            <span className="text-xs text-white/75 font-medium">
              Feels like {feelsLike}°C
            </span>
          </div>
        </div>

        {/* Right: 4 Atmospheric Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 gap-x-6 gap-y-2.5 bg-black/20 dark:bg-black/35 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/10 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-[var(--weather-blue)] shrink-0" />
            <span className="text-white/75 font-normal">Humidity:</span>
            <span className="text-white ml-auto font-bold">{humidity}%</span>
          </div>

          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-[var(--weather-blue)] shrink-0" />
            <span className="text-white/75 font-normal">Wind:</span>
            <span className="text-white ml-auto font-bold">{windSpeedKmH} km/h</span>
          </div>

          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-[var(--weather-blue)] shrink-0" />
            <span className="text-white/75 font-normal">Pressure:</span>
            <span className="text-white ml-auto font-bold">{pressureHpa} hPa</span>
          </div>

          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-[var(--weather-blue)] shrink-0" />
            <span className="text-white/75 font-normal">Visibility:</span>
            <span className="text-white ml-auto font-bold">{visibilityKm} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
