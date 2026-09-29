'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { BustMapGeoJSON, WeatherVariable } from '../../lib/api/types';
import { INDIA_REGIONS } from '../../lib/geo/indiaGeoJson';
import { Layers, RotateCw, AlertTriangle } from 'lucide-react';
import { getBustColor } from '../../lib/utils/colors';

interface Props {
  mapData: BustMapGeoJSON | null;
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  variable: WeatherVariable;
  onVariableChange: (v: WeatherVariable) => void;
  day: number;
}

export const GlobeView: React.FC<Props> = ({
  mapData,
  selectedRegionId,
  onSelectRegion,
  variable,
  onVariableChange,
  day
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [webGlSupported, setWebGlSupported] = useState(true);
  const [activeLayer, setActiveLayer] = useState<'bust' | 'rainfall' | 'tmax' | 'wind'>('bust');

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    try {
      if (typeof (maplibregl as any).setWorkerUrl === 'function') {
        (maplibregl as any).setWorkerUrl('/maplibre-gl-worker.mjs');
      }

      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#03050c'
              }
            }
          ]
        },
        center: [78.9, 22.0],
        zoom: 2.5,
        minZoom: 1.5,
        maxZoom: 8.0,
        attributionControl: false
      });

      // Set projection safely only after style is loaded
      map.on('style.load', () => {
        try {
          if (typeof (map as any).setProjection === 'function') {
            (map as any).setProjection({ type: 'globe' });
          }
        } catch (projErr) {
          // Fallback seamlessly to Mercator
        }
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

      map.on('load', () => {
        // Add GeoJSON
        map.addSource('globe-bust-source', {
          type: 'geojson',
          data: (mapData as any) || { type: 'FeatureCollection', features: [] }
        });

        // 3D Choropleth Fill
        map.addLayer({
          id: 'globe-regions-fill',
          type: 'fill',
          source: 'globe-bust-source',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'p_bust_cal'],
              0.0, '#06b6d4',
              0.25, '#0284c7',
              0.45, '#f59e0b',
              0.65, '#f97316',
              0.85, '#f43f5e'
            ],
            'fill-opacity': 0.75
          }
        });

        // Outlines
        map.addLayer({
          id: 'globe-regions-line',
          type: 'line',
          source: 'globe-bust-source',
          paint: {
            'line-color': '#38bdf8',
            'line-width': 1.2,
            'line-opacity': 0.6
          }
        });

        // Click to select region
        map.on('click', 'globe-regions-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const props = e.features[0].properties as any;
            const regId = props.region_id;
            onSelectRegion(regId);
          }
        });

        map.on('mouseenter', 'globe-regions-fill', () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'globe-regions-fill', () => {
          map.getCanvas().style.cursor = '';
        });
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('WebGL initialization failure:', err);
      setWebGlSupported(false);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update source data when mapData changes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapData) return;
    const map = mapInstanceRef.current;
    if (map.isStyleLoaded() && map.getSource('globe-bust-source')) {
      const src = map.getSource('globe-bust-source') as maplibregl.GeoJSONSource;
      src.setData(mapData as any);
    }
  }, [mapData]);

  const rotateToIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({
        center: [78.9, 22.0],
        zoom: 3.2,
        duration: 1500
      });
    }
  };

  if (!webGlSupported) {
    return (
      <div className="w-full h-[650px] rounded-3xl border border-[var(--risk-extreme)]/30 bg-[var(--surface)] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <AlertTriangle className="h-10 w-10 text-[var(--risk-watch)]" />
        <h3 className="text-base font-semibold text-[var(--text-primary)]">WebGL Globe Rendering Degraded</h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-md">
          Your browser or graphics hardware could not initialize the 3D globe pipeline. Switching automatically to the 2D National View map engine.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[680px] rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl bg-[var(--surface)]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Globe Layer Controls */}
      <div className="absolute top-4 left-4 z-20 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-xl p-3 shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] gap-4">
          <span className="flex items-center gap-1.5 text-[var(--weather-blue)]">
            <Layers className="h-4 w-4" />
            <span>Globe Layers</span>
          </span>
          <button
            onClick={rotateToIndia}
            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--muted-surface)]"
            title="Reset focus to India"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => {
              setActiveLayer('bust');
              onVariableChange('rainfall');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'bust'
                ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30 shadow-sm'
                : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Bust Probability
          </button>

          <button
            onClick={() => {
              setActiveLayer('rainfall');
              onVariableChange('rainfall');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'rainfall'
                ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30'
                : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Rainfall
          </button>

          <button
            onClick={() => {
              setActiveLayer('tmax');
              onVariableChange('tmax');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'tmax'
                ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30'
                : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Temperature
          </button>

          <button
            onClick={() => {
              setActiveLayer('wind');
              onVariableChange('wind');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeLayer === 'wind'
                ? 'bg-[var(--weather-blue)]/15 text-[var(--weather-blue)] border border-[var(--weather-blue)]/30'
                : 'bg-[var(--muted-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Wind Speed
          </button>
        </div>
      </div>

      {/* Floating Instructions */}
      <div className="absolute bottom-4 left-4 z-10 text-[11px] text-[var(--text-secondary)] bg-[var(--surface)]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[var(--border)] pointer-events-none">
        Drag to rotate globe · Scroll to zoom · Click any region to inspect reliability
      </div>
    </div>
  );
};
