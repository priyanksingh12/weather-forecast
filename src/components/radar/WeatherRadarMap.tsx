'use client';

import React, { useEffect, useRef, useState } from 'react';
import { OwmLayerId, OWM_KEY } from './radarTypes';

interface WeatherRadarMapProps {
  center: [number, number];
  regionName: string;
  activeLayer: OwmLayerId;
  zoom?: number;
  className?: string;
  minHeight?: string;
}

export const WeatherRadarMap: React.FC<WeatherRadarMapProps> = ({
  center,
  regionName,
  activeLayer,
  zoom = 6,
  className = '',
  minHeight = '380px',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const weatherLayerRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Leaflet Map on Client-side only
  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (!containerRef.current) return;
      if (mapInstanceRef.current) return;

      try {
        // Dynamically import Leaflet on client-side only (prevents SSR 'window is not defined')
        const L = (await import('leaflet')).default || (await import('leaflet'));
        leafletModuleRef.current = L;

        if (isCancelled || !containerRef.current) return;

        // Create Leaflet instance
        const map = L.map(containerRef.current, {
          center,
          zoom,
          zoomControl: true,
          attributionControl: false,
        });

        // Layer 0: Esri Dark Canvas Base (100% free, high contrast)
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            maxZoom: 16,
          }
        ).addTo(map);

        // Layer 1: OpenWeather Tile Layer
        const tileUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
        const weatherLayer = L.tileLayer(tileUrl, {
          opacity: 0.65,
          maxZoom: 18,
        }).addTo(map);
        weatherLayerRef.current = weatherLayer;

        // Layer 2: Esri Dark Reference (Borders & Labels above weather layer)
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          {
            opacity: 0.85,
            maxZoom: 16,
          }
        ).addTo(map);

        // Layer 3: Glowing Center Pin Marker
        const customPin = L.divIcon({
          className: 'radar-station-pin',
          html: `<div style="
            background: #38bdf8;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 0 14px rgba(56, 189, 248, 0.7), 0 0 28px rgba(56, 189, 248, 0.3);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker(center, { icon: customPin }).addTo(map);
        marker.bindPopup(
          `<div style="font-family: system-ui; font-size: 13px; color: #1e293b;">
            <strong>${regionName}</strong><br/>
            <span style="color: #64748b;">Live Ground Truth Station</span>
          </div>`
        );
        markerRef.current = marker;
        mapInstanceRef.current = map;
        setIsReady(true);

        // Invalidate size to guarantee complete tile rendering
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);
      } catch (err) {
        console.error('Failed to initialize Leaflet radar map:', err);
      }
    };

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        weatherLayerRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Run once on mount

  // React to center and regionName updates (fly to new region)
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.flyTo(center, zoom, { duration: 1.2 });
    markerRef.current.setLatLng(center);
    markerRef.current.setPopupContent(
      `<div style="font-family: system-ui; font-size: 13px; color: #1e293b;">
        <strong>${regionName}</strong><br/>
        <span style="color: #64748b;">Live Ground Truth Station</span>
      </div>`
    );
  }, [center[0], center[1], regionName, zoom]);

  // React to active weather layer switches
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletModuleRef.current) return;
    const L = leafletModuleRef.current;

    if (weatherLayerRef.current) {
      mapInstanceRef.current.removeLayer(weatherLayerRef.current);
    }

    const tileUrl = `https://tile.openweathermap.org/map/${activeLayer}/{z}/{x}/{y}.png?appid=${OWM_KEY}`;
    const newLayer = L.tileLayer(tileUrl, {
      opacity: 0.65,
      maxZoom: 18,
    }).addTo(mapInstanceRef.current);
    weatherLayerRef.current = newLayer;
  }, [activeLayer]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`} style={{ minHeight }}>
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight, background: '#0f1a24' }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f1a24] text-[var(--weather-blue)] space-y-2 z-10 pointer-events-none">
          <div className="h-8 w-8 rounded-full border-2 border-[var(--weather-blue)] border-t-transparent animate-spin" />
          <span className="text-xs font-mono font-bold">Loading Live Radar Tiles...</span>
        </div>
      )}
    </div>
  );
};
