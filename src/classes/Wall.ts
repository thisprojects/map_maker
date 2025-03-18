import * as THREE from "three";

interface WallCreatorOptions {
  texture: THREE.Texture;
  roughness: number;
  metalness: number;
  x: number;
  y: number;
  z: number;
  rotation: number;
  castShadow: boolean;
  receiveShadow: boolean;
  width: number;
  height: number;
  depth: number;
  userData: any;
}

export class WallCreator {
  private wallGeometry: THREE.BoxGeometry;
  private wallMaterial: THREE.MeshStandardMaterial;
  private wallMesh: THREE.Mesh;
  private texture: THREE.Texture;
  private roughness: number;
  private metalness: number;
  private x: number;
  private y: number;
  private z: number;
  private rotation: number;
  private castShadow: boolean;
  private receiveShadow: boolean;
  private width: number;
  private height: number;
  private depth: number;
  private userData: any;

  constructor({
    texture,
    roughness,
    metalness,
    x,
    y,
    z,
    rotation,
    castShadow,
    receiveShadow,
    width,
    height,
    depth,
    userData,
  }: WallCreatorOptions) {
    this.wallGeometry = new THREE.BoxGeometry(width, height, depth);
    this.wallMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness,
      metalness,
    });

    this.wallMesh = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
    this.wallMesh.position.set(x, y + 1.5, z);
    this.wallMesh.rotation.y = rotation;
    this.wallMesh.castShadow = castShadow;
    this.wallMesh.receiveShadow = receiveShadow;
    this.wallMesh.userData = userData;

    this.texture = texture;

    this.roughness = roughness;
    this.metalness = metalness;
    this.x = x;
    this.y = y;
    this.z = z;
    this.rotation = rotation;
    this.castShadow = castShadow;
    this.receiveShadow = receiveShadow;
    this.width = width;
    this.depth = depth;
    this.height = height;
  }

  getWallMesh(): THREE.Mesh {
    return this.wallMesh;
  }
}
