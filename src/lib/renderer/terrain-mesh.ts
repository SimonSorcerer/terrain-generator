import * as THREE from 'three';
import { getColor, type BiomeConfig } from '../terrain/biomes';

// World-space size of the terrain plane in Three.js units.
export const TERRAIN_SIZE = 100;

export interface TerrainMesh {
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshLambertMaterial>;
  resolution: number;
}

function buildGeometry(resolution: number): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, resolution, resolution);
  // Bake the rotation into vertex data so position.y can be used directly for height.
  geo.rotateX(-Math.PI / 2);
  const count = geo.attributes.position.count;
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  return geo;
}

export function createTerrainMesh(resolution: number): TerrainMesh {
  const geometry = buildGeometry(resolution);
  const material = new THREE.MeshLambertMaterial({ vertexColors: true });
  const mesh = new THREE.Mesh(geometry, material);
  return { mesh, resolution };
}

// Updates vertex positions and colors in place. Only rebuilds geometry when
// resolution changes — avoids GPU re-allocation on every param tweak.
export function updateTerrainMesh(
  terrain: TerrainMesh,
  heightmap: Float32Array,
  heightScale: number,
  biomes: BiomeConfig,
): void {
  const resolution = Math.round(Math.sqrt(heightmap.length) - 1);

  if (resolution !== terrain.resolution) {
    terrain.mesh.geometry.dispose();
    terrain.mesh.geometry = buildGeometry(resolution);
    terrain.resolution = resolution;
  }

  const position = terrain.mesh.geometry.attributes.position;
  const color = terrain.mesh.geometry.attributes.color;

  for (let i = 0; i < position.count; i++) {
    position.setY(i, heightmap[i] * heightScale);
    const [r, g, b] = getColor(heightmap[i], biomes);
    color.setXYZ(i, r, g, b);
  }

  position.needsUpdate = true;
  color.needsUpdate = true;
  terrain.mesh.geometry.computeVertexNormals();
}
