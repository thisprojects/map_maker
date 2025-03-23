// Types
export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  texture: string;
  roomId?: number;
}

export interface Floor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  roomId?: number;
}

export interface SelectedObject {
  id: string;
  type: "wall" | "floor";
  texture: string;
  position?: {
    x: number;
    y: number;
  };
  clickPoint?: {
    x: number;
    y: number;
  };
}
