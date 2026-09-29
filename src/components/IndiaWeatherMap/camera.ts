import * as THREE from 'three';
import { TOP } from './sampleData';
import { StateMeshUserData } from './types';

export interface CameraControlsHandle {
  updateCamera: () => void;
  resetCamera: () => void;
  zoomIn: (amount?: number) => void;
  zoomOut: (amount?: number) => void;
  setMeshes: (newMeshes: THREE.Mesh[]) => void;
  cleanup: () => void;
}

export function setupCameraControls(
  cam: THREE.PerspectiveCamera,
  dom: HTMLCanvasElement,
  initialMeshes: THREE.Mesh[],
  onHover: (data: StateMeshUserData | null, x: number, y: number) => void,
  onClick: (data: StateMeshUserData) => void,
  onCameraMove?: () => void
): CameraControlsHandle {
  let meshes = initialMeshes;

  // Exact framing matching media_1790627532316.png
  const DEFAULT_RAD = 150;
  const DEFAULT_AZ = 0.25;
  const DEFAULT_POL = 0.95;
  const target = new THREE.Vector3(0, TOP, 0);

  let rad = DEFAULT_RAD;
  let az = DEFAULT_AZ;
  let pol = DEFAULT_POL;

  const updateCamera = () => {
    cam.position.set(
      target.x + rad * Math.sin(pol) * Math.sin(az),
      target.y + rad * Math.cos(pol),
      target.z + rad * Math.sin(pol) * Math.cos(az)
    );
    cam.lookAt(target);
    if (onCameraMove) onCameraMove();
  };

  const resetCamera = () => {
    rad = DEFAULT_RAD;
    az = DEFAULT_AZ;
    pol = DEFAULT_POL;
    target.set(0, TOP, 0);
    updateCamera();
  };

  const zoomIn = (amount: number = 20) => {
    rad = Math.max(60, rad - amount);
    updateCamera();
  };

  const zoomOut = (amount: number = 20) => {
    rad = Math.min(300, rad + amount);
    updateCamera();
  };

  const setMeshes = (newMeshes: THREE.Mesh[]) => {
    meshes = newMeshes;
  };

  // Immediate initial camera positioning
  updateCamera();

  let down = false;
  let moved = 0;
  let lx = 0;
  let ly = 0;
  let hov: THREE.Mesh | null = null;

  const rc = new THREE.Raycaster();
  const mv = new THREE.Vector2();

  const pick = (e: MouseEvent | PointerEvent): THREE.Mesh | null => {
    const rect = dom.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    mv.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    rc.setFromCamera(mv, cam);
    const intersects = rc.intersectObjects(meshes);
    return intersects.length > 0 ? (intersects[0].object as THREE.Mesh) : null;
  };

  const handlePointerDown = (e: PointerEvent) => {
    down = true;
    moved = 0;
    lx = e.clientX;
    ly = e.clientY;
    dom.style.cursor = 'grabbing';
  };

  const handlePointerUp = (e: PointerEvent) => {
    // Generous threshold (<15px) so laptop touchpad clicks are reliably captured
    if (down && moved < 15) {
      const h = pick(e) || hov;
      if (h && h.userData) {
        onClick(h.userData as StateMeshUserData);
      }
    }
    down = false;
    dom.style.cursor = hov ? 'pointer' : 'grab';
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (down) {
      const dx = e.clientX - lx;
      const dy = e.clientY - ly;
      lx = e.clientX;
      ly = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      az -= dx * 0.006;
      pol = Math.min(1.4, Math.max(0.3, pol - dy * 0.006));
      updateCamera();
      return;
    }

    const h = pick(e);
    if (hov !== h) {
      if (hov) {
        hov.scale.y = 1;
        if ((hov.material as THREE.MeshStandardMaterial).emissive) {
          (hov.material as THREE.MeshStandardMaterial).emissive.setHex(0);
        }
      }
      hov = h;
      if (h) {
        h.scale.y = 1.7;
        if ((h.material as THREE.MeshStandardMaterial).emissive) {
          (h.material as THREE.MeshStandardMaterial).emissive.setHex(0x222222);
        }
      }
    }

    dom.style.cursor = h ? 'pointer' : 'grab';

    if (h && h.userData) {
      onHover(h.userData as StateMeshUserData, e.clientX, e.clientY);
    } else {
      onHover(null, e.clientX, e.clientY);
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    rad = Math.min(300, Math.max(60, rad + e.deltaY * 0.15));
    updateCamera();
  };

  const handlePointerLeave = () => {
    if (hov) {
      hov.scale.y = 1;
      if ((hov.material as THREE.MeshStandardMaterial).emissive) {
        (hov.material as THREE.MeshStandardMaterial).emissive.setHex(0);
      }
      hov = null;
    }
    onHover(null, 0, 0);
  };

  dom.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointermove', handlePointerMove);
  dom.addEventListener('wheel', handleWheel, { passive: false });
  dom.addEventListener('pointerleave', handlePointerLeave);

  const cleanup = () => {
    dom.removeEventListener('pointerdown', handlePointerDown);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('pointermove', handlePointerMove);
    dom.removeEventListener('wheel', handleWheel);
    dom.removeEventListener('pointerleave', handlePointerLeave);
  };

  return { updateCamera, resetCamera, zoomIn, zoomOut, setMeshes, cleanup };
}
