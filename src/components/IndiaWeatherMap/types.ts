import * as THREE from 'three';

export interface DayForecastSummary {
  day: number;
  rain: number;
  wind: number;
  temp?: number;
}

export interface StateWeather {
  rain: number;
  wind: number;
  pressure: number | null;
  temp: number | null;
  rh: number | null;
  conf: number | null;
  dir: number;
  status: 'loading' | 'loaded' | 'error';
  errorMessage?: string;
  forecast?: DayForecastSummary[];
}

export type WeatherCondition = {
  t: string;
  c: string;
};

export interface StateGeoRing {
  ring: number[][];
  b: [number, number, number, number]; // [minX, minZ, maxX, maxZ]
  w: StateWeather;
  A: number;
  col: THREE.Color;
}

export interface IndiaStatesGeoJSON {
  country: number[][][];
  states: Record<string, number[][][]>;
}

export interface StateMeshUserData {
  name: string;
  slug: string;
  w: StateWeather;
}
