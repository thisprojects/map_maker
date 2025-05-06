import { useState } from "react";
import { SpawnPoint } from "../types/editor";

const useLevel = () => {
  const [showRoomPicker, setShowRoomPicker] = useState<boolean>(false);
  const [rooms, setRooms] = useState<string[]>(["1"]);
  const [spawnPoint, setSpawnPoint] = useState<SpawnPoint | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const textureColors = {
    brickWall: "#a52a2a",
    concreteFloor: "#cccccc",
    woodFloor: "#d2b48c",
    tileFloor: "#add8e6",
  };

  const levelObject = {
    showRoomPicker,
    setShowRoomPicker,
    rooms,
    setRooms,
    spawnPoint,
    setSpawnPoint,
    startPoint,
    setStartPoint,
    textureColors,
  };

  return levelObject;
};

export default useLevel;
