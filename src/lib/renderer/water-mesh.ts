import * as THREE from 'three';
import { TERRAIN_SIZE } from './terrain-mesh';

export interface WaterMesh {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
}

export function createWaterMesh(): WaterMesh {
  const geometry = new THREE.PlaneGeometry(TERRAIN_SIZE * 2, TERRAIN_SIZE * 2);
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0x2255aa,
    transparent: true,
    opacity: 0.6,
    roughness: 0.1,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  return { mesh };
}

export function updateWaterLevel(water: WaterMesh, seaLevel: number, heightScale: number): void {
  water.mesh.position.y = seaLevel * heightScale;
}

export function updateWaterAppearance(
  water: WaterMesh,
  params: { waterColor: string; waterOpacity: number; waterRoughness: number },
): void {
  water.mesh.material.color.set(params.waterColor);
  water.mesh.material.opacity = params.waterOpacity;
  water.mesh.material.roughness = params.waterRoughness;
}
