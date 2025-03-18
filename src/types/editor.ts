import * as THREE from "three";

export interface Wall {
  id: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  texture: string;
  normal: THREE.Vector3;
}

export interface Floor {
  id: string;
  width: number;
  length: number;
  texture: string;
  rotation: number;
  y: number;
  z: number;
  x: number;
}

export interface Texture {
  name: string;
  path: string;
  type: "wall" | "floor";
}

export interface SelectedObject {
  id: string;
  type: "wall" | "floor";
  position: { x: number; y: number; z: number };
  texture: string;
}
