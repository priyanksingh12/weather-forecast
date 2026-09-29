import * as THREE from 'three';
import { StateGeoRing } from './types';
import { samplePoint, pip } from './geo';
import { TOP, getMapColors } from './sampleData';

const RH = 15;
const G = TOP * 1.7 + 0.1;
const K = 14;

let _tDrop: THREE.CanvasTexture | null = null;
let _tRing: THREE.CanvasTexture | null = null;
let _tSoft: THREE.CanvasTexture | null = null;

// Helper to create 2D canvas texture
function createTexture(drawFn: (ctx: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    // Return empty placeholder if called during SSR
    return new THREE.CanvasTexture({} as any);
  }
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// 1. Teardrop texture for raindrops
function getDropTexture(): THREE.CanvasTexture {
  if (!_tDrop) {
    _tDrop = createTexture((ctx) => {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(32, 6);
      ctx.quadraticCurveTo(43, 32, 43, 44);
      ctx.arc(32, 44, 11, 0, Math.PI);
      ctx.quadraticCurveTo(21, 32, 32, 6);
      ctx.fill();
    });
  }
  _tDrop.needsUpdate = true;
  return _tDrop;
}

// 2. Ring texture for landing ripples
function getRingTexture(): THREE.CanvasTexture {
  if (!_tRing) {
    _tRing = createTexture((ctx) => {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(32, 32, 26, 0, Math.PI * 2);
      ctx.stroke();
    });
  }
  _tRing.needsUpdate = true;
  return _tRing;
}

// 3. Radial soft texture for clouds & wind stream glowing heads
function getSoftTexture(): THREE.CanvasTexture {
  if (!_tSoft) {
    _tSoft = createTexture((ctx) => {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    });
  }
  _tSoft.needsUpdate = true;
  return _tSoft;
}

export interface ParticleSystemHandle {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  pos: Float32Array;
  sz: Float32Array;
  al: Float32Array;
  count: number;
  dispose: () => void;
}

function createPoints(
  count: number,
  texture: THREE.CanvasTexture,
  color: number,
  uScale: { value: number },
  scene: THREE.Scene
): ParticleSystemHandle {
  const geometry = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  const sz = new Float32Array(count);
  const al = new Float32Array(count);

  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
  geometry.setAttribute('aAlpha', new THREE.BufferAttribute(al, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      map: { value: texture },
      color: { value: new THREE.Color(color) },
      uScale
    },
    vertexShader: `
      attribute float aSize;
      attribute float aAlpha;
      uniform float uScale;
      varying float vA;
      void main() {
        vA = aAlpha;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uScale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec3 color;
      varying float vA;
      void main() {
        gl_FragColor = vec4(color, texture2D(map, gl_PointCoord).a * vA);
      }
    `
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  const dispose = () => {
    scene.remove(points);
    geometry.dispose();
    material.dispose();
  };

  return { points, geometry, pos, sz, al, count, dispose };
}

function updatePoints(handle: ParticleSystemHandle) {
  handle.geometry.attributes.position.needsUpdate = true;
  handle.geometry.attributes.aSize.needsUpdate = true;
  handle.geometry.attributes.aAlpha.needsUpdate = true;
}

export interface WeatherSimulation {
  step: (t: number, dt: number) => void;
  cleanup: () => void;
}

export function initWeatherSimulation(
  rainStates: StateGeoRing[],
  windStates: StateGeoRing[],
  uScale: { value: number },
  scene: THREE.Scene,
  isDark: boolean = false
): WeatherSimulation {
  const colors = getMapColors(isDark);
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768;
  const particleMultiplier = isSmallScreen ? 0.5 : 1.0;

  // 1. Rain drops & Clouds
  const drops: Array<{ x: number; z: number; u: number; cy: number }> = [];
  const clouds: Array<{ x: number; z: number; ph: number; s: number; a: number }> = [];

  rainStates.forEach((st) => {
    const n = Math.max(4, Math.round(Math.min(90, Math.round(st.A * 0.25)) * particleMultiplier));
    for (let i = 0; i < n; i++) {
      const p = samplePoint(st);
      drops.push({
        x: p[0],
        z: -p[1],
        u: Math.random(),
        cy: RH / (7 + st.w.rain * 0.12)
      });
    }

    const k = Math.max(1, Math.min(4, Math.round((st.A / 90) * particleMultiplier)));
    for (let i = 0; i < k; i++) {
      const p = samplePoint(st);
      clouds.push({
        x: p[0],
        z: -p[1],
        ph: Math.random() * 6,
        s: Math.min(26, 10 + Math.sqrt(st.A) * 0.8),
        a: 0.10 + st.w.rain / 500
      });
    }
  });

  const dropsCount = Math.max(1, drops.length);
  const cloudsCount = Math.max(1, clouds.length);

  // Blue rain teardrops and ripple rings
  const DP = createPoints(dropsCount, getDropTexture(), colors.drop, uScale, scene);
  const RP = createPoints(dropsCount, getRingTexture(), colors.drop, uScale, scene);
  const CP = createPoints(cloudsCount, getSoftTexture(), colors.cloud, uScale, scene);

  // 2. Wind streamlines & Glowing Heads (Grey)
  const gusts: Array<{ st: StateGeoRing; h: Float32Array; ph: number }> = [];
  windStates.forEach((st) => {
    const n = Math.max(3, Math.round(Math.min(22, Math.round(st.A * 0.07)) * particleMultiplier));
    for (let i = 0; i < n; i++) {
      const p = samplePoint(st);
      const h = new Float32Array(K * 2);
      for (let j = 0; j < K; j++) {
        h[j * 2] = p[0];
        h[j * 2 + 1] = p[1];
      }
      gusts.push({ st, h, ph: Math.random() * 6 });
    }
  });

  const gustsCount = Math.max(1, gusts.length);
  const WP = new Float32Array(gustsCount * (K - 1) * 6);
  const WC = new Float32Array(WP.length);

  const windGeo = new THREE.BufferGeometry();
  windGeo.setAttribute('position', new THREE.BufferAttribute(WP, 3));
  windGeo.setAttribute('color', new THREE.BufferAttribute(WC, 3));

  const windMat = new THREE.LineBasicMaterial({ vertexColors: true });
  const windLine = new THREE.LineSegments(windGeo, windMat);
  windLine.frustumCulled = false;
  scene.add(windLine);

  // Grey glowing stream heads
  const HP = createPoints(gustsCount, getSoftTexture(), colors.windHead, uScale, scene);
  const fg = new THREE.Color(colors.windHead);
  const tempCol = new THREE.Color();

  // Animation Step Function
  const step = (t: number, dt: number) => {
    // 1. Rain teardrops fall, land and expand into ripples
    drops.forEach((d, i) => {
      const u = (t / d.cy + d.u) % 1;
      const o = i * 3;
      if (u < 0.85) {
        DP.pos[o] = d.x;
        DP.pos[o + 1] = G + RH * (1 - u / 0.85);
        DP.pos[o + 2] = d.z;
        DP.sz[i] = 1.9;
        DP.al[i] = 1;
        RP.al[i] = 0;
      } else {
        const r = (u - 0.85) / 0.15;
        RP.pos[o] = d.x;
        RP.pos[o + 1] = G;
        RP.pos[o + 2] = d.z;
        RP.sz[i] = 1 + 4.5 * r;
        RP.al[i] = 0.75 * (1 - r);
        DP.al[i] = 0;
      }
    });
    updatePoints(DP);
    updatePoints(RP);

    // 2. Soft floating clouds
    clouds.forEach((c, i) => {
      CP.pos[i * 3] = c.x + Math.sin(t * 0.25 + c.ph) * 2;
      CP.pos[i * 3 + 1] = G + RH + 2;
      CP.pos[i * 3 + 2] = c.z;
      CP.sz[i] = c.s;
      CP.al[i] = c.a;
    });
    updatePoints(CP);

    // 3. Flowing streamlines
    gusts.forEach((g, gi) => {
      const w = g.st.w;
      const h = g.h;
      const hx = h[(K - 1) * 2];
      const hz = h[(K - 1) * 2 + 1];
      const sp = Math.max(2.5, w.wind * 2.2);
      const ang = w.dir + Math.sin(hx * 0.13 + t * 0.8) * 0.75 + Math.cos(hz * 0.11 - t * 0.6) * 0.5;

      let nx = hx + Math.cos(ang) * sp * dt;
      let nz = hz + Math.sin(ang) * sp * dt;

      if (!pip(nx, nz, g.st.ring)) {
        const p = samplePoint(g.st);
        for (let j = 0; j < K; j++) {
          h[j * 2] = p[0];
          h[j * 2 + 1] = p[1];
        }
        nx = p[0];
        nz = p[1];
      }

      if (Math.hypot(nx - hx, nz - hz) > 0.04) {
        h.copyWithin(0, 2);
        h[(K - 1) * 2] = nx;
        h[(K - 1) * 2 + 1] = nz;
      } else {
        h[(K - 1) * 2] = nx;
        h[(K - 1) * 2 + 1] = nz;
      }

      for (let j = 0; j < K - 1; j++) {
        const o = (gi * (K - 1) + j) * 6;
        for (let e = 0; e < 2; e++) {
          const k = j + e;
          const f = Math.pow(k / (K - 1), 1.6);
          WP[o + e * 3] = h[k * 2];
          WP[o + e * 3 + 1] = G + 1 + Math.sin(t * 2 + g.ph + k * 0.3) * 0.35;
          WP[o + e * 3 + 2] = -h[k * 2 + 1];

          tempCol.copy(g.st.col).lerp(fg, f);
          WC[o + e * 3] = tempCol.r;
          WC[o + e * 3 + 1] = tempCol.g;
          WC[o + e * 3 + 2] = tempCol.b;
        }
      }

      HP.pos[gi * 3] = nx;
      HP.pos[gi * 3 + 1] = G + 1;
      HP.pos[gi * 3 + 2] = -nz;
      HP.sz[gi] = Math.max(2.4, Math.min(4.5, 2.0 + w.wind * 0.4));
      HP.al[gi] = 0.95;
    });

    windGeo.attributes.position.needsUpdate = true;
    windGeo.attributes.color.needsUpdate = true;
    updatePoints(HP);
  };

  const cleanup = () => {
    DP.dispose();
    RP.dispose();
    CP.dispose();
    HP.dispose();
    scene.remove(windLine);
    windGeo.dispose();
    windMat.dispose();
  };

  return { step, cleanup };
}
