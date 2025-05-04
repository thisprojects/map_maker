// Types
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
