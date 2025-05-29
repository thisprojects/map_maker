import { useState } from "react";
import { Wall, Wall3D } from "../types/editor";
import { SCALE_FACTOR } from "../constants/constants";

interface IAddWall {
  startPoint: { x: number; y: number };
  enforceAngle: (
    a: number,
    b: number,
    c: number,
    d: number
  ) => { x: number; y: number };
  mouse: { x: number; y: number };
}

const wallArray: Wall[] = [];

const useWalls = () => {
  const [walls, setWalls] = useState<Wall[]>(wallArray);
  const [tempWall, setTempWall] = useState<Wall | null>(null);
  const [isDrawingWall, setIsDrawingWall] = useState(false);

  const wallsObject = {
    walls,
    setWalls,
    tempWall,
    setTempWall,
    isDrawingWall,
    setIsDrawingWall,

    addWall({ startPoint, enforceAngle, mouse }: IAddWall) {
      const endPoint = enforceAngle(
        startPoint.x,
        startPoint.y,
        mouse.x,
        mouse.y
      );

      setTempWall({
        id: "temp-wall",
        x1: startPoint.x,
        y1: startPoint.y,
        x2: endPoint.x,
        y2: endPoint.y,
        texture: "brickWall",
      });
    },

    exportWalls(room: string) {
      return walls
        .map((wall) => {
          if (wall.roomId === room) {
            let x,
              y,
              z,
              width,
              height,
              rotation,
              texture,
              depth,
              normal,
              roomWall;

            if (wall.x1 === wall.x2) {
              // Vertical wall (West/East)
              width = Math.abs(wall.y2 - wall.y1);
              height = 5;
              z = (wall.y2 + wall.y1) / 2;
              x = wall.x1;
              y = 0;
              rotation = -Math.PI / 2; // flipped
              texture = "west";
              depth = 0;
              normal = { x: -1, y: 0, z: 0 }; // flipped
            } else if (wall.y1 === wall.y2) {
              // Horizontal wall (North/South)
              width = Math.abs(wall.x2 - wall.x1);
              height = 5;
              x = (wall.x2 + wall.x1) / 2;
              z = wall.y1;
              y = 0;
              rotation = 0;
              texture = "north";
              depth = 0;
              normal = { x: 0, y: 0, z: -1 }; // flipped
            } else {
              // Diagonal wall
              const dx = wall.x2 - wall.x1;
              const dy = wall.y2 - wall.y1;
              const length = Math.sqrt(dx * dx + dy * dy);

              width = length;
              height = 5;
              x = (wall.x1 + wall.x2) / 2;
              z = (wall.y1 + wall.y2) / 2;
              y = 0;

              rotation = -Math.atan2(dy, dx); // flipped sign
              texture = "diagonal";
              depth = 0;

              normal = {
                x: dy / length, // flipped
                y: 0,
                z: -dx / length, // flipped
              };
            }

            // Apply scaling to the 3D coordinates and dimensions
            roomWall = {
              x: x && x * SCALE_FACTOR,
              y: y && y * SCALE_FACTOR,
              z: z && z * SCALE_FACTOR,
              width: width && width * SCALE_FACTOR,
              height,
              rotation,
              texture,
              depth: depth && depth * SCALE_FACTOR,
              normal,
            };

            return roomWall;
          }
        })
        .filter(Boolean);
    },
  };
  return wallsObject;
};

export default useWalls;
