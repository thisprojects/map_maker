import * as THREE from "three";

interface WireframeWallOptions {
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

export class WireframeWall {
  private wallGeometry: THREE.BoxGeometry;
  private wallMaterial: THREE.MeshBasicMaterial;
  private wallMesh: THREE.Mesh;
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
  }: WireframeWallOptions) {
    this.wallGeometry = new THREE.BoxGeometry(width, height, depth);
    this.wallMaterial = new THREE.MeshBasicMaterial({
      color: "0xffffff",
      wireframe: true,
    });

    this.wallMesh = new THREE.Mesh(this.wallGeometry, this.wallMaterial);
    this.wallMesh.position.set(x, y + height / 2, z);
    this.wallMesh.rotation.y = rotation;
    this.wallMesh.castShadow = castShadow;
    this.wallMesh.receiveShadow = receiveShadow;
    this.wallMesh.userData = userData;

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
