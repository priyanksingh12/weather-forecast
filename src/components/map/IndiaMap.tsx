'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BustMapGeoJSON, WeatherVariable } from '../../lib/api/types';
import { INDIA_REGIONS, getBustMetricsForRegion } from '../../lib/geo/indiaGeoJson';
import { getBustColor } from '../../lib/utils/colors';
import { formatPercent } from '../../lib/utils/formatters';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Eye, Sparkles } from 'lucide-react';
import * as maplibregl from 'maplibre-gl';

// Configure MapLibre worker locally
if (typeof window !== 'undefined') {
  try {
    (maplibregl as any).setWorkerUrl?.('/maplibre-gl-worker.mjs');
  } catch (err) {
    console.warn('MapLibre workerUrl configuration notice:', err);
  }
}

interface Props {
  mapData: BustMapGeoJSON | null;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  variable: WeatherVariable;
  day: number;
}

// Coordinate projection from [Lng, Lat] to SVG [x, y]
// Bounds: Lng 67.5 to 97.5 (width 30 deg), Lat 7.8 to 37.5 (height 29.7 deg)
function projectLngLat(lng: number, lat: number): [number, number] {
  const x = ((lng - 67.5) / 30.5) * 750 + 25;
  const y = ((37.5 - lat) / 29.7) * 810 + 20;
  return [Math.round(x), Math.round(y)];
}

// Generate organic SVG path for an Indian state based on its bounding box & centroid
function generateStateSvgPath(bbox: [number, number, number, number], centroid: [number, number]): string {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const [cLng, cLat] = centroid;

  // Project points
  const [xTop, yTop] = projectLngLat((minLng + maxLng) / 2, maxLat);
  const [xBottom, yBottom] = projectLngLat((minLng + maxLng) / 2, minLat);
  const [xLeft, yLeft] = projectLngLat(minLng, (minLat + maxLat) / 2);
  const [xRight, yRight] = projectLngLat(maxLng, (minLat + maxLat) / 2);

  const [xTopLeft, yTopLeft] = projectLngLat(minLng + (maxLng - minLng) * 0.2, maxLat * 0.98);
  const [xTopRight, yTopRight] = projectLngLat(maxLng - (maxLng - minLng) * 0.2, maxLat * 0.99);
  const [xBottomRight, yBottomRight] = projectLngLat(maxLng - (maxLng - minLng) * 0.25, minLat * 1.01);
  const [xBottomLeft, yBottomLeft] = projectLngLat(minLng + (maxLng - minLng) * 0.25, minLat * 1.01);

  return `M ${xLeft} ${yLeft} 
          Q ${xTopLeft} ${yTopLeft}, ${xTop} ${yTop} 
          Q ${xTopRight} ${yTopRight}, ${xRight} ${yRight} 
          Q ${xBottomRight} ${yBottomRight}, ${xBottom} ${yBottom} 
          Q ${xBottomLeft} ${yBottomLeft}, ${xLeft} ${yLeft} Z`;
}

export const IndiaMap: React.FC<Props> = ({
  mapData,
  selectedRegionId,
  onSelectRegion,
  variable,
  day
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [hoveredRegion, setHoveredRegion] = useState<{
    id: string;
    name: string;
    nameHi: string;
    pBust: number;
    band: string;
    driver: string;
    forecast: number;
    unit: string;
    x: number;
    y: number;
  } | null>(null);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.3, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-[640px] sm:h-[700px] rounded-3xl overflow-hidden border-2 border-[var(--border)] shadow-2xl bg-[var(--surface)] select-none">
      {/* Background Grid Pattern & Cosmic Atmospheric Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--weather-blue)]/10 via-[var(--surface)] to-[var(--background)] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--weather-blue) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Map Control Buttons (Zoom & Reset) */}
      <div className="absolute top-5 right-5 z-30 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--weather-blue)]/20 hover:border-[var(--weather-blue)]/50 shadow-md transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--weather-blue)]/20 hover:border-[var(--weather-blue)]/50 shadow-md transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--weather-blue)]/20 hover:border-[var(--weather-blue)]/50 shadow-md transition-all cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      </div>

      {/* Interactive SVG India Subcontinent Vector Map */}
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 850"
          className="w-full h-full max-h-[680px] transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`
          }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="activeGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subcontinent Ambient Border / Coastline */}
          <path
            d="M 180 50 L 250 80 L 320 180 L 410 240 L 530 250 L 730 250 L 760 340 L 600 370 L 530 380 L 530 460 L 440 550 L 330 760 L 250 780 L 230 650 L 190 520 L 70 410 L 80 300 L 180 200 Z"
            fill="none"
            stroke="var(--weather-blue)"
            strokeOpacity="0.25"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Render All Indian States with Color-Blind-Safe Bust Color Fill */}
          {INDIA_REGIONS.map((region) => {
            const metrics = getBustMetricsForRegion(region.id, variable, day);
            const isSelected = selectedRegionId === region.id;
            const isHovered = hoveredRegion?.id === region.id;
            const color = getBustColor(metrics.p_bust_cal);
            const pathData = generateStateSvgPath(region.bbox, region.centroid);
            const [cx, cy] = projectLngLat(region.centroid[0], region.centroid[1]);

            return (
              <g
                key={region.id}
                onClick={() => onSelectRegion(region.id)}
                onMouseEnter={() =>
                  setHoveredRegion({
                    id: region.id,
                    name: region.name_en,
                    nameHi: region.name_hi,
                    pBust: metrics.p_bust_cal,
                    band: metrics.confidence_band,
                    driver: metrics.primary_driver,
                    forecast: metrics.forecast_value_mean,
                    unit: metrics.unit,
                    x: cx,
                    y: cy
                  })
                }
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer transition-all duration-200 group"
              >
                {/* State Polygon Shape */}
                <path
                  d={pathData}
                  fill={color}
                  fillOpacity={isSelected ? 0.95 : isHovered ? 0.88 : 0.65}
                  stroke={isSelected ? 'var(--text-primary)' : isHovered ? 'var(--weather-blue)' : 'var(--border)'}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                  filter={isSelected ? 'url(#activeGlow)' : isHovered ? 'url(#glow)' : undefined}
                  className="transition-all duration-200"
                />

                {/* State Name & Bust Probability Label Pin */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isSelected ? 5.5 : 3.5}
                  fill={isSelected ? 'var(--text-primary)' : color}
                  stroke="var(--surface)"
                  strokeWidth="1.5"
                />

                {/* State Text Label */}
                <text
                  x={cx}
                  y={cy - 8}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize={isSelected ? '13' : '10'}
                  fontWeight={isSelected ? '800' : '600'}
                  fontFamily="system-ui, sans-serif"
                  className="pointer-events-none drop-shadow-sm"
                >
                  {region.name_en.split(' ')[0]}
                </text>

                {/* Bust Probability Badge */}
                <text
                  x={cx}
                  y={cy + 16}
                  textAnchor="middle"
                  fill={color}
                  fontSize="10"
                  fontWeight="800"
                  fontFamily="monospace"
                  className="pointer-events-none drop-shadow-sm"
                >
                  {Math.round(metrics.p_bust_cal * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating State Tooltip on Hover with Larger Fonts */}
      {hoveredRegion && (
        <div className="absolute top-5 left-5 z-40 pointer-events-none rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-2xl p-4 shadow-xl text-sm space-y-2 animate-in fade-in zoom-in-95 duration-150 min-w-[260px]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
            <div>
              <span className="font-extrabold text-[var(--text-primary)] text-base block">{hoveredRegion.name}</span>
              <span className="text-xs text-[var(--text-secondary)] font-semibold">{hoveredRegion.nameHi}</span>
            </div>
            <span className="text-xs text-[var(--weather-blue)] font-mono font-bold bg-[var(--weather-blue)]/15 px-2 py-0.5 rounded border border-[var(--weather-blue)]/30">
              Day {day}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-medium">Bust Probability:</span>
            <span
              className="font-mono font-black text-lg"
              style={{ color: getBustColor(hoveredRegion.pBust) }}
            >
              {Math.round(hoveredRegion.pBust * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-medium">Reliability Band:</span>
            <span className="font-bold text-[var(--text-primary)]">{hoveredRegion.band}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[var(--text-secondary)] font-medium">NWP Forecast:</span>
            <span className="font-mono text-[var(--weather-blue)] font-bold text-sm">
              {hoveredRegion.forecast} {hoveredRegion.unit}
            </span>
          </div>

          <div className="text-[11px] text-[var(--text-secondary)] pt-1.5 border-t border-[var(--border)] line-clamp-2">
            <span className="text-[var(--text-primary)] font-semibold">Driver:</span> {hoveredRegion.driver}
          </div>

          <div className="pt-1 text-[11px] text-[var(--weather-blue)] font-bold flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Click state to open detailed info & 3D view</span>
          </div>
        </div>
      )}

      {/* Map Footer Watermark */}
      <div className="absolute bottom-4 left-5 z-20 text-xs text-[var(--text-secondary)] font-mono flex items-center gap-2 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-[var(--weather-blue)]" />
        <span>India Subcontinent · High-Precision Bust Assessment Engine</span>
      </div>
    </div>
  );
};
