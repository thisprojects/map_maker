import { Dispatch, SetStateAction, useRef } from "react";
import { Modes } from "../../types/editor";

interface IButtonsProps {
  setModeAndResetDrawing: (mode: Modes) => void;
  mode: Modes;
  setRooms: Dispatch<SetStateAction<string[]>>;
  toggleGrid: () => void;
  saveMap: () => void;
  showGrid: boolean;
}

const Buttons = ({
  setModeAndResetDrawing,
  mode,
  setRooms,
  toggleGrid,
  saveMap,
  showGrid,
}: IButtonsProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="absolute top-10 left-10 flex gap-2">
      <button
        onClick={() => setModeAndResetDrawing("select")}
        className={`text-black border border-white rounded p-2 cursor-pointer ${
          mode === "select" ? "bg-blue-200" : "bg-white"
        }`}
      >
        Select Mode
      </button>

      <button
        onClick={() => setModeAndResetDrawing("addWall")}
        className={`text-black border border-white rounded p-2 cursor-pointer ${
          mode === "addWall" ? "bg-blue-200" : "bg-white"
        }`}
      >
        Add Wall
      </button>
      <button
        onClick={() => setModeAndResetDrawing("addStep")}
        className={`text-black border border-white rounded p-2 cursor-pointer ${
          mode === "addStep" ? "bg-blue-200" : "bg-white"
        }`}
      >
        Add Step
      </button>

      <button
        onClick={() => setModeAndResetDrawing("addFloor")}
        className={`text-black border border-white rounded p-2 cursor-pointer ${
          mode === "addFloor" ? "bg-blue-200" : "bg-white"
        }`}
      >
        Add Floor
      </button>
      <button
        onClick={() => setModeAndResetDrawing("addBlock")}
        className={`text-black border border-white rounded p-2 cursor-pointer ${
          mode === "addBlock" ? "bg-blue-200" : "bg-white"
        }`}
      >
        Add Block
      </button>
      <div className="flex flex-col">
        <button
          onClick={() =>
            setRooms((rooms: string[]) => {
              const newRooms = [...rooms];
              if (inputRef?.current) {
                newRooms.push(inputRef?.current?.value);
              }
              return newRooms;
            })
          }
          className={`text-black border border-white rounded p-2 cursor-pointer ${
            mode === "addRoom" ? "bg-blue-200" : "bg-white"
          }`}
        >
          Add Room
        </button>
        <input
          onFocus={() => setModeAndResetDrawing("addRoom")}
          ref={inputRef}
          type="text"
          className="bg-white border border-solid border-black rounded p-2 m-1"
        />
      </div>

      <button
        onClick={toggleGrid}
        className="text-black border border-white rounded p-2 cursor-pointer bg-white"
      >
        {showGrid ? "Hide Grid" : "Show Grid"}
      </button>
      <button
        className="text-black border border-white rounded p-2 cursor-pointer bg-white"
        onClick={saveMap}
      >
        Export Map (1/10 Scale)
      </button>

      <button
        onClick={() => setModeAndResetDrawing("spawnPoint")}
        className={`text-black border border-white rounded p-2 cursor-pointer ${
          mode === "spawnPoint" ? "bg-blue-200" : "bg-white"
        }`}
      >
        Add Spawn Point
      </button>
    </div>
  );
};

export default Buttons;
