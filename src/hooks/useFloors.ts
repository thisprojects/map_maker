import { useState } from "react";
import { Floor } from "../types/editor";

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
  };
  return floorsObject;
};

export default useFloors;
