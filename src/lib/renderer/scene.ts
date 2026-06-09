import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  startLoop: (onFrame?: () => void) => void;
  stopLoop: () => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
  setFog: (enabled: boolean, density: number, color: string) => void;
  setSunAngle: (azimuthDeg: number, elevationDeg: number, intensity: number) => void;
}

export function initScene(canvas: HTMLCanvasElement): SceneContext {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0d0d0f);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
  camera.position.set(0, 80, 120);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 0, 0);

  // Warm directional sun + soft fill light
  const dirLight = new THREE.DirectionalLight(0xfff5e0, 1.8);
  dirLight.position.set(60, 100, 40);
  scene.add(dirLight);

  const ambLight = new THREE.AmbientLight(0x8090a0, 0.6);
  scene.add(ambLight);

  const clearColor = new THREE.Color(0x0d0d0f);

  function setFog(enabled: boolean, density: number, color: string): void {
    if (enabled) {
      const fogColor = new THREE.Color(color);
      scene.fog = new THREE.FogExp2(fogColor, density);
      renderer.setClearColor(fogColor);
    } else {
      scene.fog = null;
      renderer.setClearColor(clearColor);
    }
  }

  function setSunAngle(azimuthDeg: number, elevationDeg: number, intensity: number): void {
    const az = (azimuthDeg * Math.PI) / 180;
    const el = (elevationDeg * Math.PI) / 180;
    const dist = 200;
    dirLight.position.set(
      dist * Math.cos(el) * Math.sin(az),
      dist * Math.sin(el),
      dist * Math.cos(el) * Math.cos(az),
    );
    dirLight.intensity = intensity;
  }

  let rafId: number | null = null;

  function startLoop(onFrame?: () => void): void {
    if (rafId !== null) return;
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      controls.update();
      onFrame?.();
      renderer.render(scene, camera);
    };
    tick();
  }

  function stopLoop(): void {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // false = don't update CSS — canvas size is controlled by CSS/ResizeObserver
  function resize(width: number, height: number): void {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function dispose(): void {
    stopLoop();
    controls.dispose();
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    renderer.dispose();
  }

  return { scene, camera, renderer, controls, startLoop, stopLoop, resize, dispose, setFog, setSunAngle };
}
