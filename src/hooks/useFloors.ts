import { useState } from "react";
import { Floor } from "../types/editor";
import { SCALE_FACTOR } from "../constants/constants";

interface IAddFloor {
  startPoint: { x: number; y: number };
  x: number;
  y: number;
}

const floorArray: Floor[] = [];

const useFloors = () => {
  const [floors, setFloors] = useState<Floor[]>(floorArray);
  const [tempFloor, setTempFloor] = useState<Floor | null>(null);
  const [isDrawingFloor, setIsDrawingFloor] = useState(false);

  const floorsObject = {
    floors,
    setFloors,
    tempFloor,
    setTempFloor,
    isDrawingFloor,
    setIsDrawingFloor,

    makeFloor(tempFloor: Floor) {
      return {
        id: `floor-${Date.now()}`,
        x: tempFloor.x,
        y: tempFloor.y,
        width: tempFloor.width,
        height: tempFloor.height,
        texture: "concreteFloor",
        roomId: "1",
      };
    },

    addFloor({ x, y, startPoint }: IAddFloor) {
      // Calculate width and height (ensure they're positive)
      const width = Math.abs(x - startPoint.x);
      const height = Math.abs(y - startPoint.y);

      // Calculate the top-left corner of the rectangle
      const floorX = Math.min(startPoint.x, x);
      const floorY = Math.min(startPoint.y, y);

      setTempFloor({
        id: "temp-floor",
        x: floorX,
        y: floorY,
        width,
        height,
        texture: "concreteFloor",
      });
    },

    exportFloors(room: string) {
      return floors
        .map((floor) => {
          if (floor.roomId === room) {
            // Correct the floor positioning, using the top-left corner
            const x = floor.x + floor.width / 2; // This should center the floor on x
            const z = floor.y + floor.height / 2; // This should center the floor on z
            const y = -1; // Ground level (adjust as needed)

            // Apply scaling to the coordinates and dimensions
            return {
              x: x * SCALE_FACTOR,
              y: y,
              z: z * SCALE_FACTOR,
              width: floor.width * SCALE_FACTOR,
              length: floor.height * SCALE_FACTOR,
              texture: "floor",
              rotation: -Math.PI / 2, // Correct rotation for the floor
            };
          }
        })
        .filter(Boolean);
    },

    drawTempFloor(
      setStartPoint: (point: { x: number; y: number } | null) => void,
      x: number,
      y: number
    ) {
      const escapeKeyHandler = (event: KeyboardEvent) => {
        if (
          event.key === "Escape" ||
          event.key === "Esc" ||
          event.keyCode === 27
        ) {
          setIsDrawingFloor(false);
          setTempFloor(null);
          setStartPoint(null);

          document.removeEventListener("keydown", escapeKeyHandler);
        }
      };
      document.addEventListener("keydown", escapeKeyHandler);
      setIsDrawingFloor(true);
      setStartPoint({ x, y });

      setTempFloor({
        id: "temp-floor",
        x,
        y,
        width: 0,
        height: 0,
        texture: "concreteFloor",
      });
    },
  };
  return floorsObject;
};

export default useFloors;
