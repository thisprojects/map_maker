import { Dispatch, SetStateAction } from "react";
import { Block, Floor, SelectedObject, Step, Wall } from "../../types/editor";

interface ISelectedObjectToolProps {
  selectedObject: SelectedObject | null;
  setWalls: Dispatch<SetStateAction<Wall[]>>;
  setFloors: Dispatch<SetStateAction<Floor[]>>;
  floors: Floor[];
  walls: Wall[];
  steps: Step[];
  setSteps: Dispatch<SetStateAction<Step[]>>;
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  setSelectedObject: Dispatch<SetStateAction<SelectedObject | null>>;
  setShowRoomPicker: Dispatch<SetStateAction<boolean>>;
  showRoomPicker: boolean;
  rooms: string[];
}

const SelectedObjectTool = ({
  selectedObject,
  setWalls,
  setFloors,
  floors,
  walls,
  steps,
  setSteps,
  blocks,
  setBlocks,
  setSelectedObject,
  setShowRoomPicker,
  showRoomPicker,
  rooms,
}: ISelectedObjectToolProps) => {
  return (
    selectedObject && (
      <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white p-4 m-4 rounded flex">
        <div>
          <h3 className="text-xl font-bold mb-2">Selected Object</h3>
          <p>
            <strong>ID:</strong> {selectedObject.id}
          </p>
          <p>
            <strong>Room ID:</strong> {selectedObject?.roomId}
          </p>
          <p>
            <strong>Type:</strong> {selectedObject.type}
          </p>
          {selectedObject.clickPoint && (
            <p>
              <strong>Click Position:</strong> x:{" "}
              {selectedObject.clickPoint.x.toFixed(2)}, y:{" "}
              {selectedObject.clickPoint.y.toFixed(2)}
            </p>
          )}
          <p>
            <strong>Texture:</strong> {selectedObject.texture}
          </p>

          <button
            className="bg-white text-black p-2 rounded mt-4"
            onClick={() => {
              if (selectedObject.type === "wall") {
                const newWalls = walls.filter(
                  (wall: Wall) => wall.id !== selectedObject.id
                );
                setWalls(newWalls);
              } else if (selectedObject.type === "floor") {
                const newFloors = floors.filter(
                  (floor: Floor) => floor.id !== selectedObject.id
                );
                setFloors(newFloors);
              }
              if (selectedObject.type === "step") {
                const newSteps = steps.filter(
                  (step: Step) => step.id !== selectedObject.id
                );
                setSteps(newSteps);
              }

              if (selectedObject.type === "block") {
                const newBlocks = blocks.filter(
                  (block: Block) => block.id !== selectedObject.id
                );
                setBlocks(newBlocks);
              }

              setSelectedObject(null);
            }}
          >
            Delete
          </button>

          <button
            onClick={() => {
              setShowRoomPicker((prev: boolean) => !prev);
            }}
            className="ml-2 bg-white text-black p-2 rounded cursor-pointer"
          >
            Add to room
          </button>
        </div>
        {showRoomPicker && (
          <div className="bg-black min-w-[100px] text-center">
            {rooms?.map((room: string) => (
              <button
                key={room}
                className="border border-solid bg-white text-black border-white p-2 rounded cursor-pointer m-1"
                onClick={() => {
                  if (selectedObject.type === "wall") {
                    console.log("select obj", selectedObject);
                    setWalls((prev: Wall[]) => {
                      const newWalls = [...prev];
                      const selectedWall = newWalls.find(
                        (wall) => wall.id === selectedObject.id
                      );
                      console.log("SELECTED WALL", selectedWall);
                      if (selectedWall) {
                        selectedWall.roomId = room;
                      }
                      return newWalls;
                    });
                    setSelectedObject((prev: SelectedObject | null) => {
                      const newObject: SelectedObject = {
                        ...prev,
                      } as SelectedObject;
                      newObject.roomId = String(room);
                      return newObject;
                    });
                  }
                  if (selectedObject.type === "floor") {
                    setFloors((prev: Floor[]) => {
                      const newFloors = [...prev];
                      const selectedFloor = newFloors.find(
                        (floor) => floor.id === selectedObject.id
                      );

                      if (selectedFloor) {
                        selectedFloor.roomId = room;
                      }
                      return newFloors;
                    });
                    setSelectedObject((prev: SelectedObject | null) => {
                      const newObject: SelectedObject = {
                        ...prev,
                      } as SelectedObject;
                      newObject.roomId = String(room);
                      return newObject;
                    });
                  }
                  setShowRoomPicker(false);
                }}
              >
                {room}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  );
};

export default SelectedObjectTool;
