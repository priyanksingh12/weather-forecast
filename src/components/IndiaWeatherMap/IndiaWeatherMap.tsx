'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { StateMeshUserData, StateWeather, IndiaStatesGeoJSON } from './types';
import { getMapColors, TOP, SAMPLE_WX } from './sampleData';
import { fetchIndiaStatesGeo, buildIndiaWeatherScene, BuildGeoResult } from './geo';
import { initWeatherSimulation, WeatherSimulation } from './particles';
import { setupCameraControls, CameraControlsHandle } from './camera';
import { loadAllStatesWeather, loadStateDetails, initSlugMapping, normalizeStateName } from './dataLoader';
import { TitleLegend } from './TitleLegend';
import { WeatherDialog } from './WeatherDialog';
import { WeatherTooltip } from './WeatherTooltip';
import { useTheme } from '../theme/ThemeProvider';

export interface IndiaWeatherMapProps {
  className?: string;
  day?: number;
  onStateSelect?: (stateName: string, slug: string) => void;
}

export const IndiaWeatherMap: React.FC<IndiaWeatherMapProps> = ({
  className = 'w-full h-[650px] sm:h-[750px]',
  day = 1,
  onStateSelect
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tooltip & Dialog State
  const [hoverData, setHoverData] = useState<{ data: StateMeshUserData | null; x: number; y: number }>({
    data: null,
    x: 0,
    y: 0
  });
  const [selectedState, setSelectedState] = useState<{ name: string; weather: StateWeather } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingForecast, setIsLoadingForecast] = useState(true);
  const [webglError, setWebglError] = useState(false);

  // Live NWP Data State
  const [weatherMap, setWeatherMap] = useState<Record<string, StateWeather>>({});
  const [camTick, setCamTick] = useState(0);

  // References for mutable simulation and cleanup
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const geoResultRef = useRef<BuildGeoResult | null>(null);
  const simRef = useRef<WeatherSimulation | null>(null);
  const controlsRef = useRef<CameraControlsHandle | null>(null);
  const weatherMapRef = useRef<Record<string, StateWeather>>({});
  const geoDataRef = useRef<IndiaStatesGeoJSON | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const uScaleRef = useRef<{ value: number }>({ value: 1 });

  const onStateSelectRef = useRef(onStateSelect);
  useEffect(() => {
    onStateSelectRef.current = onStateSelect;
  }, [onStateSelect]);

  // Handle click on state
  const handleStateClick = useCallback(async (stateData: StateMeshUserData) => {
    const sample = SAMPLE_WX[stateData.name];
    const initialWeather: StateWeather = {
      rain: stateData.w.rain,
      wind: stateData.w.wind,
      pressure: stateData.w.pressure ?? sample?.pressure ?? 1008.0,
      temp: stateData.w.temp ?? sample?.temp ?? 28.0,
      rh: stateData.w.rh ?? sample?.rh ?? 68,
      conf: stateData.w.conf ?? sample?.conf ?? 80,
      dir: stateData.w.dir,
      status: 'loading' as const,
      forecast: stateData.w.forecast ?? [1, 2, 3, 4, 5].map((d) => ({
        day: d,
        rain: +(stateData.w.rain * (1 + (d - 1) * 0.05)).toFixed(1),
        wind: +(stateData.w.wind * (1 - (d - 1) * 0.03)).toFixed(1),
        temp: Math.round((sample?.temp ?? 28.0) + ((d % 2 === 0 ? 1 : -1) * (d - 1) * 0.4))
      }))
    };

    setSelectedState({ name: stateData.name, weather: initialWeather });
    setIsDialogOpen(true);

    if (onStateSelectRef.current) {
      onStateSelectRef.current(stateData.name, stateData.slug);
    }

    // Lazily fetch full details (temperature, pressure, consensus)
    try {
      const fullDetails = await loadStateDetails(stateData.name);
      setSelectedState({ name: stateData.name, weather: fullDetails });
      // Update mesh user data as well
      stateData.w = fullDetails;
    } catch (err) {
      console.warn('Lazy fetch error for state:', stateData.name, err);
    }
  }, []);

  // Handle retry click in dialog
  const handleRetryDetails = useCallback(async () => {
    if (!selectedState) return;
    try {
      const full = await loadStateDetails(selectedState.name);
      setSelectedState({ name: selectedState.name, weather: full });
    } catch (err) {
      console.warn('Retry error:', err);
    }
  }, [selectedState]);

  // Re-build weather effects when fresh weather data arrives
  const refreshWeatherLayers = useCallback((freshWeather: Record<string, StateWeather>, darkMode: boolean = false) => {
    if (!sceneRef.current || !geoDataRef.current) return;

    weatherMapRef.current = freshWeather;

    // Clean up previous particle simulation
    if (simRef.current) {
      simRef.current.cleanup();
      simRef.current = null;
    }

    // Clean up previous meshes & line loops
    if (geoResultRef.current) {
      geoResultRef.current.cleanup();
      geoResultRef.current = null;
    }

    // Rebuild meshes and particles with updated colors (blue for rain, grey for wind)
    const geoResult = buildIndiaWeatherScene(geoDataRef.current, freshWeather, sceneRef.current, darkMode);
    geoResultRef.current = geoResult;
    setWeatherMap(freshWeather);

    const sim = initWeatherSimulation(
      geoResult.rainStates,
      geoResult.windStates,
      uScaleRef.current,
      sceneRef.current,
      darkMode
    );
    simRef.current = sim;

    // Update meshes in camera controls without resetting camera or dropping event listeners
    if (controlsRef.current) {
      controlsRef.current.setMeshes(geoResult.meshes);
    } else if (cameraRef.current && canvasRef.current) {
      controlsRef.current = setupCameraControls(
        cameraRef.current,
        canvasRef.current,
        geoResult.meshes,
        (data, x, y) => setHoverData({ data, x, y }),
        handleStateClick
      );
    }
  }, [handleStateClick]);

  // Synchronize 3D map colors when user toggles light / dark theme
  useEffect(() => {
    if (!sceneRef.current) return;
    const currentColors = getMapColors(isDark);
    sceneRef.current.background = new THREE.Color(currentColors.bg);
    if (weatherMapRef.current && Object.keys(weatherMapRef.current).length > 0) {
      refreshWeatherLayers(weatherMapRef.current, isDark);
    }
  }, [isDark, refreshWeatherLayers]);

  useEffect(() => {
    if (!containerRef.current || !mountRef.current) return;

    const container = containerRef.current;
    const mount = mountRef.current;

    // Safely create WebGLRenderer with graceful fallback
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance'
      });
    } catch (e1) {
      console.warn('[IndiaWeatherMap] High-performance WebGL failed, retrying standard mode:', e1);
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: false,
          powerPreference: 'default'
        });
      } catch (e2) {
        console.error('[IndiaWeatherMap] WebGL is unavailable:', e2);
        setWebglError(true);
        setIsLoadingForecast(false);
        return;
      }
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    rendererRef.current = renderer;

    const canvas = renderer.domElement;
    canvas.className = 'block w-full h-full touch-none cursor-grab';
    canvasRef.current = canvas;
    mount.appendChild(canvas);

    // 1. Initialize Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const initColors = getMapColors(isDarkRef.current);
    scene.background = new THREE.Color(initColors.bg);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 2000);
    cameraRef.current = camera;

    // Immediately position camera matching media_1790627532316.png
    const initTarget = new THREE.Vector3(0, TOP, 0);
    camera.position.set(
      initTarget.x + 150 * Math.sin(0.95) * Math.sin(0.25),
      initTarget.y + 150 * Math.cos(0.95),
      initTarget.z + 150 * Math.sin(0.95) * Math.cos(0.25)
    );
    camera.lookAt(initTarget);

    // Initialize camera controls immediately on canvas
    controlsRef.current = setupCameraControls(
      camera,
      canvas,
      [],
      (data, x, y) => setHoverData({ data, x, y }),
      handleStateClick
    );

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x9aa8b3, 0.65);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(80, 100, 30);
    scene.add(dirLight);

    const clock = new THREE.Clock();
    let isTabHidden = false;

    // 2. Animation loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (isTabHidden) return;

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsedTime = clock.elapsedTime;

      if (simRef.current) {
        simRef.current.step(elapsedTime, delta);
      }

      renderer.render(scene, camera);
    };

    // 3. Tab visibility pause / resume
    const handleVisibilityChange = () => {
      isTabHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Resize Observer for dynamic container sizing
    const updateSize = () => {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      uScaleRef.current.value = (height * renderer.getPixelRatio()) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);
    updateSize();

    // 5. Load GeoJSON and initial State Weather
    let isCancelled = false;

    const initializeMap = async () => {
      try {
        setIsLoadingForecast(true);
        const geo = await fetchIndiaStatesGeo();
        if (isCancelled) return;
        geoDataRef.current = geo;

        const stateNames = Object.keys(geo.states);

        // Fetch rainfall and wind for all states
        const initialWeather = await loadAllStatesWeather(stateNames, day);
        if (isCancelled) return;

        setWeatherMap(initialWeather);
        refreshWeatherLayers(initialWeather, isDarkRef.current);
        setIsLoadingForecast(false);

        // Start render loop
        animate();
      } catch (err) {
        console.error('[IndiaWeatherMap] Initialization failed:', err);
        setIsLoadingForecast(false);
      }
    };

    initializeMap();

    // 6. 60-second auto-refresh timer
    const refreshInterval = setInterval(async () => {
      if (document.hidden || !geoDataRef.current) return;
      const stateNames = Object.keys(geoDataRef.current.states);
      const freshWeather = await loadAllStatesWeather(stateNames, day);
      if (!isCancelled) {
        refreshWeatherLayers(freshWeather, isDarkRef.current);
      }
    }, 60000);

    // 7. Cleanup on unmount
    return () => {
      isCancelled = true;
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();

      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }

      if (controlsRef.current) {
        controlsRef.current.cleanup();
        controlsRef.current = null;
      }

      if (simRef.current) {
        simRef.current.cleanup();
        simRef.current = null;
      }

      if (geoResultRef.current) {
        geoResultRef.current.cleanup();
        geoResultRef.current = null;
      }

      renderer.dispose();
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      canvasRef.current = null;
    };
  }, []);

  // Re-load weather layers when lead day changes
  useEffect(() => {
    if (!geoDataRef.current) return;
    const stateNames = Object.keys(geoDataRef.current.states);
    loadAllStatesWeather(stateNames, day).then((freshWeather) => {
      setWeatherMap(freshWeather);
      refreshWeatherLayers(freshWeather, isDarkRef.current);
    });
  }, [day, refreshWeatherLayers]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-[var(--border)] shadow-xl select-none bg-[var(--surface)] transition-colors duration-200 ${className}`}
      style={{
        fontFamily: 'Inter, sans-serif'
      }}
    >
      {/* Title & Legend HUD */}
      <TitleLegend day={day} />

      {/* Interactive Map HUD Controls (Zoom In, Zoom Out, Reset Camera) */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => controlsRef.current?.zoomIn()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-md transition-all cursor-pointer active:scale-95 backdrop-blur-xs"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => controlsRef.current?.zoomOut()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-md transition-all cursor-pointer active:scale-95 backdrop-blur-xs"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => controlsRef.current?.resetCamera()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--surface)]/90 hover:bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-md transition-all cursor-pointer active:scale-95 backdrop-blur-xs mt-0.5"
          title="Reset Camera View to Default"
          aria-label="Reset Camera View"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Loading non-blocking overlay */}
      {isLoadingForecast && (
        <div className="absolute top-5 right-20 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surface)]/90 backdrop-blur-xs border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] shadow-sm animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[var(--weather-blue)] animate-ping" />
          <span>Loading live state forecasts...</span>
        </div>
      )}

      {/* Clean Three.js Canvas Container (Rain: Blue, Wind: Grey) */}
      <div
        ref={mountRef}
        className="w-full h-full relative"
      />

      {/* WebGL Error / Fallback Card */}
      {webglError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[var(--background)]">
          <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] max-w-md shadow-sm space-y-3">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">3D Hardware Acceleration Unavailable</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              WebGL hardware acceleration is disabled or unsupported in your current browser session. Please switch to the <b>2D Bust Heatmap</b> mode using the toggle above to explore all forecasts and model reliability.
            </p>
          </div>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      <WeatherTooltip
        data={hoverData.data}
        x={hoverData.x}
        y={hoverData.y}
      />

      {/* Accessible Weather Dialog (Opens on state click) */}
      <WeatherDialog
        isOpen={isDialogOpen}
        stateName={selectedState?.name || null}
        weather={selectedState?.weather || null}
        onClose={() => setIsDialogOpen(false)}
        onRetry={handleRetryDetails}
      />
    </div>
  );
};

export default IndiaWeatherMap;
