import * as THREE from 'three';
import { IndiaStatesGeoJSON, StateGeoRing, StateMeshUserData, StateWeather } from './types';
import { TOP, RAIN_MIN, WIND_MIN, getMapColors } from './sampleData';

// Polygon area calculation
export const area = (r: number[][]): number => {
  let a = 0;
  for (let i = 0; i < r.length - 1; i++) {
    a += r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1];
  }
  return a / 2;
};

// Point-in-polygon raycasting test
export const pip = (x: number, z: number, r: number[][]): boolean => {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i];
    const b = r[j];
    if ((a[1] > z) !== (b[1] > z) && x < ((b[0] - a[0]) * (z - a[1])) / (b[1] - a[1]) + a[0]) {
      c = !c;
    }
  }
  return c;
};

// Sample random point within state's bounding box that lies inside its polygon
export function samplePoint(st: StateGeoRing): [number, number] {
  const r = st.ring;
  for (let k = 0; k < 40; k++) {
    const x = st.b[0] + Math.random() * (st.b[2] - st.b[0]);
    const z = st.b[1] + Math.random() * (st.b[3] - st.b[1]);
    if (pip(x, z, r)) return [x, z];
  }
  return [r[0][0], r[0][1]];
}

// Load pre-projected GeoJSON
export async function fetchIndiaStatesGeo(): Promise<IndiaStatesGeoJSON> {
  const res = await fetch('/data/india-states.json');
  if (!res.ok) {
    throw new Error(`Failed to load /data/india-states.json: ${res.statusText}`);
  }
  return await res.json();
}

export interface BuildGeoResult {
  meshes: THREE.Mesh[];
  lineLoops: THREE.LineLoop[];
  groundMesh: THREE.Mesh;
  rainStates: StateGeoRing[];
  windStates: StateGeoRing[];
  centroids: Record<string, { x: number; y: number; z: number }>;
  cleanup: () => void;
}

export function buildIndiaWeatherScene(
  geoData: IndiaStatesGeoJSON,
  weatherMap: Record<string, StateWeather>,
  scene: THREE.Scene,
  isDark: boolean = false
): BuildGeoResult {
  const colors = getMapColors(isDark);
  const meshes: THREE.Mesh[] = [];
  const lineLoops: THREE.LineLoop[] = [];
  const rainStates: StateGeoRing[] = [];
  const windStates: StateGeoRing[] = [];
  const centroids: Record<string, { x: number; y: number; z: number }> = {};

  // 1. Soft ground disc under map
  const groundGeo = new THREE.CircleGeometry(95, 64);
  const groundMat = new THREE.MeshBasicMaterial({ color: colors.ground });
  const groundMesh = new THREE.Mesh(groundGeo, groundMat);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.05;
  scene.add(groundMesh);

  // 2. Extrude each state polygon
  for (const [name, rings] of Object.entries(geoData.states)) {
    const w = weatherMap[name] || {
      rain: 0,
      wind: 3,
      pressure: null,
      temp: null,
      rh: null,
      conf: null,
      dir: 0.5,
      status: 'loaded'
    };

    const isR = w.rain >= RAIN_MIN;
    const isW = w.wind >= WIND_MIN;
    // Blue for rain, Grey for wind, Blend for both, Muted for calm
    const colHex = isR && isW ? colors.both : isR ? colors.rain : isW ? colors.wind : colors.calm;

    const shapes = rings.map((r) => {
      const s = new THREE.Shape();
      r.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1])));
      return s;
    });

    const g = new THREE.ExtrudeGeometry(shapes, { depth: TOP, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);

    const m = new THREE.Mesh(
      g,
      new THREE.MeshStandardMaterial({
        color: colHex,
        roughness: 0.85,
        flatShading: true
      })
    );

    const userData: StateMeshUserData = { name, slug: name.toLowerCase().replace(/\s+/g, '-'), w };
    m.userData = userData;
    scene.add(m);
    meshes.push(m);

    // State borders at TOP + 0.05
    rings.forEach((r) => {
      const linePts = r.map((p) => new THREE.Vector3(p[0], TOP + 0.05, -p[1]));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
      const lineMat = new THREE.LineBasicMaterial({
        color: colors.line,
        transparent: true,
        opacity: isDark ? 0.75 : 0.95
      });
      const line = new THREE.LineLoop(lineGeo, lineMat);
      scene.add(line);
      lineLoops.push(line);
    });

    // Largest ring for sampling particles
    const ring = rings.reduce((a, b) => (Math.abs(area(a)) > Math.abs(area(b)) ? a : b));
    const A = Math.abs(area(ring));
    const xs = ring.map((p) => p[0]);
    const zs = ring.map((p) => p[1]);

    const st: StateGeoRing = {
      ring,
      b: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)],
      w,
      A,
      col: new THREE.Color(colHex)
    };

    centroids[name] = {
      x: (st.b[0] + st.b[2]) / 2,
      y: TOP + 0.2,
      z: -((st.b[1] + st.b[3]) / 2)
    };

    if (isR) rainStates.push(st);
    if (isW) windStates.push(st);
  }

  // Cleanup helper
  const cleanup = () => {
    scene.remove(groundMesh);
    groundGeo.dispose();
    groundMat.dispose();

    meshes.forEach((m) => {
      scene.remove(m);
      m.geometry.dispose();
      if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
      else m.material.dispose();
    });

    lineLoops.forEach((l) => {
      scene.remove(l);
      l.geometry.dispose();
      if (Array.isArray(l.material)) l.material.forEach((mat) => mat.dispose());
      else l.material.dispose();
    });
  };

  return {
    meshes,
    lineLoops,
    groundMesh,
    rainStates,
    windStates,
    centroids,
    cleanup
  };
}
