import { useState } from "react";
import { Room, SpawnPoint } from "../types/editor";
import { SCALE_FACTOR } from "../constants/constants";

const useLevel = () => {
  const [showRoomPicker, setShowRoomPicker] = useState<boolean>(false);
  const [rooms, setRooms] = useState<string[]>(["1"]);
  const [spawnPoint, setSpawnPoint] = useState<SpawnPoint | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  const levelObject = {
    showRoomPicker,
    setShowRoomPicker,
    rooms,
    setRooms,
    spawnPoint,
    setSpawnPoint,
    startPoint,
    setStartPoint,

    exportLevel(roomList: Room[], spawnPoint: SpawnPoint | null) {
      const scaledSpawnPoint =
        Object.keys(spawnPoint || []).length > 0
          ? {
              x: (spawnPoint as any).x * SCALE_FACTOR,
              y: (spawnPoint as any).y * SCALE_FACTOR,
              z: (spawnPoint as any).z * SCALE_FACTOR,
              rotation: (spawnPoint as any).rotation,
            }
          : spawnPoint;

      return {
        name: "Level 1",
        spawnPoint: scaledSpawnPoint,
        textures: [
          { type: "wall", name: "north", path: "FreeDoomWall1.png" },
          { type: "wall", name: "south", path: "FreeDoomWall1.png" },
          { type: "wall", name: "east", path: "FreeDoomWall2.png" },
          { type: "wall", name: "west", path: "FreeDoomWall2.png" },
          { type: "floor", name: "floor", path: "FreeDoomFloor1.png" },
          { type: "block", name: "block", path: "FreeDoomFloor2.png" },
        ],
        rooms: roomList,
        enemies: [],
        entities: [
          {
            type: "player",
            // Scale the entity positions too
            position: { x: 2 * SCALE_FACTOR, y: 0, z: 2 * SCALE_FACTOR },
            properties: { speed: 5, health: 100 },
          },
          {
            type: "enemy",
            // Scale the entity positions too
            position: { x: 8 * SCALE_FACTOR, y: 0, z: 8 * SCALE_FACTOR },
            properties: { ai: "patrol", damage: 10 },
          },
        ],
      };
    },
  };

  return levelObject;
};

export default useLevel;
