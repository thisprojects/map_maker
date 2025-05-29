// Types

export interface Wall3D {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  rotation: number;
  texture: string;
  depth: number;
  normal: {
    x: number;
    y: number;
    z: number;
  };
}

export interface Floor3D {
  x: number;
  y: number;
  z: number;
  width: number;
  length: number;
  texture: string;
  rotation: number;
}

export interface Room {
  walls: (Wall3D | undefined)[];
  floors: (Floor3D | undefined)[];
  steps: Step[];
  blocks: (Block | undefined)[];
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  texture: string;
  roomId?: string;
}

export interface Floor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  roomId?: string;
}

export interface ObjectWithKeyStrings {
  [key: string]: string;
}

export interface SelectedObject {
  id: string;
  type: "wall" | "floor" | "step" | "block";
  texture: string;
  roomId?: string;
  position?: {
    x: number;
    y: number;
  };
  clickPoint?: {
    x: number;
    y: number;
  };
}

export interface SpawnPoint {
  x: number;
  rotation: number;
  y: number;
  z: number;
}

export interface Step {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  rotation: number;
  texture: string;
  dir?: number;
  normal: {
    x: number;
    y: number;
    z: number;
  };
  roomId?: string;
}

export interface Block {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  rotation: number;
  texture: string;
  roomId?: string;
}
