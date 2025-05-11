import { useState } from "react";
import { GRID_SIZE } from "../constants/constants";

const useDrawingTools = () => {
  const [showGrid, setShowGrid] = useState(true);

  // Function to snap point to grid
  const snapToGrid = (x: number, y: number) => {
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE,
    };
  };

  // Function to enforce 45-degree angles for walls
  const enforceAngle = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = x2 - x1;
    const dy = y1 - y2; // Note: y is inverted in canvas (0 is at top)
    const length = Math.sqrt(dx * dx + dy * dy);

    // Calculate angle (in radians) - note we're using arctangent
    let angle = Math.atan2(dy, dx);

    // Normalize angle to [0, 2π]
    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    // Snap to nearest 45 degrees (π/4)
    const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

    // Calculate new end coordinates
    // Remember to invert y again for canvas coordinates
    const newX = x1 + length * Math.cos(snapAngle);
    const newY = y1 - length * Math.sin(snapAngle);

    // Snap to grid
    return snapToGrid(newX, newY);
  };

  const drawingToolsObject = {
    enforceAngle,
    snapToGrid,
    showGrid,
    setShowGrid,
  };
  return drawingToolsObject;
};
export default useDrawingTools;
