import React, { createContext, useState, useRef, ReactNode } from "react";

// Context interface
interface MapEditorContextType {
  // Mode state
  mode: Mode;
  setMode: (mode: Mode) => void;
  setModeAndResetDrawing: (mode: Mode) => void;

  // Drawing states
  isDrawingWall: boolean;
  setIsDrawingWall: (drawing: boolean) => void;
  isDrawingFloor: boolean;
  setIsDrawingFloor: (drawing: boolean) => void;

  // Objects arrays
  walls: Wall[];
  setWalls: React.Dispatch<React.SetStateAction<Wall[]>>;
  floors: Floor[];
  setFloors: React.Dispatch<React.SetStateAction<Floor[]>>;
  steps: Step[];
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;

  // Rooms
  rooms: string[];
  setRooms: React.Dispatch<React.SetStateAction<string[]>>;
  inputRef: React.RefObject<HTMLInputElement>;

  // Selection
  selectedObject: SelectedObject | null;
  setSelectedObject: React.Dispatch<
    React.SetStateAction<SelectedObject | null>
  >;
  showRoomPicker: boolean;
  setShowRoomPicker: React.Dispatch<React.SetStateAction<boolean>>;

  // Grid
  showGrid: boolean;
  toggleGrid: () => void;

  // Methods
  changeFloorTexture: (floorId: string, texture: string) => void;
  saveMap: () => void;
}

// Create context
const MapEditorContext = createContext<MapEditorContextType | undefined>(
  undefined
);

// Provider component
export const MapEditorProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Mode state
  const [mode, setMode] = useState<Mode>("select");

  // Drawing states
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [isDrawingFloor, setIsDrawingFloor] = useState(false);

  // Objects arrays
  const [walls, setWalls] = useState<Wall[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Rooms
  const [rooms, setRooms] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Selection
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
    null
  );
  const [showRoomPicker, setShowRoomPicker] = useState(false);

  // Grid
  const [showGrid, setShowGrid] = useState(true);

  // Methods
  const setModeAndResetDrawing = (newMode: Mode) => {
    setMode(newMode);
    setIsDrawingWall(false);
    setIsDrawingFloor(false);
    setSelectedObject(null);
    // Reset any other drawing states as needed
  };

  const toggleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  const changeFloorTexture = (floorId: string, texture: string) => {
    setFloors((prev) =>
      prev.map((floor) =>
        floor.id === floorId ? { ...floor, texture } : floor
      )
    );

    // Update selected object if it's the floor being changed
    if (selectedObject?.id === floorId) {
      setSelectedObject((prev) => (prev ? { ...prev, texture } : null));
    }
  };

  const saveMap = () => {
    // Placeholder for map export functionality
    const mapData = {
      walls,
      floors,
      steps,
      blocks,
      rooms,
    };

    console.log("Exporting map data:", mapData);

    // Example: Download as JSON
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "map-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const contextValue: MapEditorContextType = {
    // Mode
    mode,
    setMode,
    setModeAndResetDrawing,

    // Drawing states
    isDrawingWall,
    setIsDrawingWall,
    isDrawingFloor,
    setIsDrawingFloor,

    // Objects
    walls,
    setWalls,
    floors,
    setFloors,
    steps,
    setSteps,
    blocks,
    setBlocks,

    // Rooms
    rooms,
    setRooms,
    inputRef,

    // Selection
    selectedObject,
    setSelectedObject,
    showRoomPicker,
    setShowRoomPicker,

    // Grid
    showGrid,
    toggleGrid,

    // Methods
    changeFloorTexture,
    saveMap,
  };

  return (
    <MapEditorContext.Provider value={contextValue}>
      {children}
    </MapEditorContext.Provider>
  );
};

export default MapEditorContext;
