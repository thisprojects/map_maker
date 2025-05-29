import { useState } from "react";
import { Block, Floor, SelectedObject, Step, Wall } from "../types/editor";
import DetectCollision from "../classes/DetectCollision";

interface IDetectSelectorCollision {
  walls: Wall[];
  blocks: Block[];
  floors: Floor[];
  steps: Step[];
  detectCollision: DetectCollision;
}

const useSelect = () => {
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
    null
  );
  const select = {
    selectedObject,
    setSelectedObject,

    detectSelectorCollision({
      walls,
      detectCollision,
      blocks,
      floors,
      steps,
    }: IDetectSelectorCollision) {
      let clickedObject = false;

      for (const wall of walls) {
        if (detectCollision.isPointOnWall(wall)) {
          setSelectedObject({
            id: wall.id,
            type: "wall",
            texture: wall.texture,
            clickPoint: { x: detectCollision.x, y: detectCollision.y },
            roomId: wall.roomId,
          });
          clickedObject = true;
          break;
        }
      }

      if (!clickedObject) {
        for (const step of steps) {
          if (detectCollision.isPointOnStep(step)) {
            setSelectedObject({
              id: step.id,
              type: "step",
              texture: step.texture,
              clickPoint: { x: detectCollision.x, y: detectCollision.y },
              roomId: step.roomId,
            });
            clickedObject = true;
            break;
          }
        }
      }

      if (!clickedObject) {
        for (const block of blocks) {
          if (detectCollision.isPointOnBlock(block)) {
            setSelectedObject({
              id: block.id,
              type: "block",
              texture: block.texture,
              clickPoint: { x: detectCollision.x, y: detectCollision.y },
              roomId: block.roomId,
            });
            clickedObject = true;
            break;
          }
        }
      }

      if (!clickedObject) {
        for (const floor of floors) {
          if (detectCollision.isPointOnFloor(floor)) {
            setSelectedObject({
              id: floor.id,
              type: "floor",
              texture: floor.texture,
              clickPoint: { x: detectCollision.x, y: detectCollision.y },
              roomId: floor.roomId,
            });
            clickedObject = true;
            break;
          }
        }
      }

      // Clear selection if clicked on empty space
      if (!clickedObject) {
        setSelectedObject(null);
      }
    },
  };
  return select;
};

export default useSelect;
