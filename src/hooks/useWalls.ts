import { useState } from "react";
import { Wall } from "../types/editor";

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
  };
  return wallsObject;
};

export default useWalls;
