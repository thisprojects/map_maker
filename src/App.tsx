import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import { Floor, SelectedObject, Wall } from "./types/editor";

// Grid settings
const GRID_SIZE = 50; // Size of each grid cell
const SCALE_FACTOR = 0.1; // Scale factor to reduce the map size to 1/10th

// Initial data
const wallArray: Wall[] = [];

const floorArray: Floor[] = [];

const FloorPlanEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showRoomPicker, setShowRoomPicker] = useState<boolean>(false);
  const [walls, setWalls] = useState<Wall[]>(wallArray);
  const [spawnPoint, setSpawnPoint] = useState({});
  const [floors, setFloors] = useState<Floor[]>(floorArray);
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
    null
  );
  const [rooms, setRooms] = useState<string[]>(["1"]);
  const [tempWall, setTempWall] = useState<Wall | null>(null);
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [mode, setMode] = useState<
    "select" | "addWall" | "addFloor" | "addRoom" | "spawnPoint"
  >("select");
  const [showGrid, setShowGrid] = useState(true);
  const [tempFloor, setTempFloor] = useState<Floor | null>(null);
  const [isDrawingFloor, setIsDrawingFloor] = useState(false);

  // Map for textures - in a real app, we'd load image patterns
  const textureColors = {
    brickWall: "#a52a2a",
    concreteFloor: "#cccccc",
    woodFloor: "#d2b48c",
    tileFloor: "#add8e6",
  };

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

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw function
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid if enabled
      if (showGrid) {
        ctx.strokeStyle = "#e0e0e0";
        ctx.lineWidth = 0.5;

        // Draw vertical grid lines
        for (let x = 0; x < canvas.width; x += GRID_SIZE) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Draw horizontal grid lines
        for (let y = 0; y < canvas.height; y += GRID_SIZE) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
      }

      // Draw floors
      floors.forEach((floor) => {
        ctx.fillStyle =
          textureColors[floor.texture as keyof typeof textureColors];
        ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

        // Draw floor border
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);

        // If selected, highlight with a different color
        if (selectedObject && selectedObject.id === floor.id) {
          ctx.strokeStyle = "#ffcc00";
          ctx.lineWidth = 2;
          ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);
        }
      });

      // Draw walls
      walls.forEach((wall) => {
        ctx.beginPath();
        ctx.moveTo(wall.x1, wall.y1);
        ctx.lineTo(wall.x2, wall.y2);
        ctx.strokeStyle =
          textureColors[wall.texture as keyof typeof textureColors];
        ctx.lineWidth = 10;
        ctx.stroke();

        // If selected, highlight with a different color
        if (selectedObject && selectedObject.id === wall.id) {
          ctx.strokeStyle = "#ffcc00";
          ctx.lineWidth = 12;
          ctx.stroke();
        }
      });

      // Draw temporary wall when in addWall mode
      if (tempWall) {
        ctx.beginPath();
        ctx.moveTo(tempWall.x1, tempWall.y1);
        ctx.lineTo(tempWall.x2, tempWall.y2);
        ctx.strokeStyle = "#0088ff";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw temporary floor when in addFloor mode
      if (tempFloor) {
        ctx.fillStyle = "rgba(0, 136, 255, 0.3)";
        ctx.fillRect(
          tempFloor.x,
          tempFloor.y,
          tempFloor.width,
          tempFloor.height
        );
        ctx.strokeStyle = "#0088ff";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 2;
        ctx.strokeRect(
          tempFloor.x,
          tempFloor.y,
          tempFloor.width,
          tempFloor.height
        );
        ctx.setLineDash([]);
      }
    };

    // Initial draw
    draw();

    // Set up animation loop
    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [walls, floors, selectedObject, tempWall, showGrid, tempFloor]);

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Helper function to check if mouse is on a wall
    const isPointOnWall = (x: number, y: number, wall: Wall): boolean => {
      const lineWidth = 10; // Wall thickness

      // Calculate perpendicular distance from point to line
      const A = wall.y2 - wall.y1;
      const B = wall.x1 - wall.x2;
      const C = wall.x2 * wall.y1 - wall.x1 * wall.y2;

      const distance = Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B);

      // Check if point is within line segment (not just the infinite line)
      const minX = Math.min(wall.x1, wall.x2) - lineWidth;
      const maxX = Math.max(wall.x1, wall.x2) + lineWidth;
      const minY = Math.min(wall.y1, wall.y2) - lineWidth;
      const maxY = Math.max(wall.y1, wall.y2) + lineWidth;

      const withinBounds = x >= minX && x <= maxX && y >= minY && y <= maxY;

      return distance <= lineWidth && withinBounds;
    };

    // Helper function to check if mouse is on a floor
    const isPointOnFloor = (x: number, y: number, floor: Floor): boolean => {
      return (
        x >= floor.x &&
        x <= floor.x + floor.width &&
        y >= floor.y &&
        y <= floor.y + floor.height
      );
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Snap coordinates to grid
      const { x, y } = snapToGrid(mouseX, mouseY);

      switch (mode) {
        case "select":
          // Check if we clicked on a wall
          let clickedObject = false;

          for (const wall of walls) {
            if (isPointOnWall(mouseX, mouseY, wall)) {
              setSelectedObject({
                id: wall.id,
                type: "wall",
                texture: wall.texture,
                clickPoint: { x: mouseX, y: mouseY },
                roomId: wall.roomId,
              });
              clickedObject = true;
              break;
            }
          }

          // If not on a wall, check floors
          if (!clickedObject) {
            for (const floor of floors) {
              if (isPointOnFloor(mouseX, mouseY, floor)) {
                setSelectedObject({
                  id: floor.id,
                  type: "floor",
                  texture: floor.texture,
                  clickPoint: { x: mouseX, y: mouseY },
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
          break;
        case "addWall":
          if (!isDrawingWall) {
            const escapeKeyHandler = (event: KeyboardEvent) => {
              if (
                event.key === "Escape" ||
                event.key === "Esc" ||
                event.keyCode === 27
              ) {
                setIsDrawingWall(false);
                setTempWall(null);
                setStartPoint(null);
                console.log("Escape key was pressed!");

                document.removeEventListener("keydown", escapeKeyHandler);
                console.log("Event listener removed");
              }
            };

            document.addEventListener("keydown", escapeKeyHandler);

            setIsDrawingWall(true);
            setStartPoint({ x, y });
            setTempWall({
              id: "temp-wall",
              x1: x,
              y1: y,
              x2: x,
              y2: y,
              texture: "brickWall",
            });
          } else {
            // Finish drawing the wall
            setIsDrawingWall(false);

            if (tempWall && startPoint) {
              // Only add wall if it has some minimum length
              const length = Math.sqrt(
                Math.pow(tempWall.x2 - tempWall.x1, 2) +
                  Math.pow(tempWall.y2 - tempWall.y1, 2)
              );

              if (length > 20) {
                const newWall: Wall = {
                  id: `wall-${Date.now()}`,
                  x1: startPoint.x,
                  y1: startPoint.y,
                  x2: tempWall.x2,
                  y2: tempWall.y2,
                  texture: "brickWall",
                  roomId: "1",
                };
                setWalls([...walls, newWall]);
              }
            }

            setTempWall(null);
            setStartPoint(null);
          }
          break;
        case "addFloor":
          if (!isDrawingFloor) {
            // Setup escape key handler for canceling floor creation
            const escapeKeyHandler = (event: KeyboardEvent) => {
              if (
                event.key === "Escape" ||
                event.key === "Esc" ||
                event.keyCode === 27
              ) {
                setIsDrawingFloor(false);
                setTempFloor(null);
                setStartPoint(null);
                console.log("Escape key was pressed - floor creation canceled");
                document.removeEventListener("keydown", escapeKeyHandler);
              }
            };

            document.addEventListener("keydown", escapeKeyHandler);

            // Start drawing floor
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
          } else {
            // Finish drawing the floor
            setIsDrawingFloor(false);

            if (tempFloor && startPoint) {
              // Only add floor if it has some minimum size
              if (tempFloor.width > 20 && tempFloor.height > 20) {
                const newFloor: Floor = {
                  id: `floor-${Date.now()}`,
                  x: tempFloor.x,
                  y: tempFloor.y,
                  width: tempFloor.width,
                  height: tempFloor.height,
                  texture: "concreteFloor",
                  roomId: "1",
                };
                setFloors([...floors, newFloor]);
              }
            }

            setTempFloor(null);
            setStartPoint(null);
          }
          break;
        case "spawnPoint":
          setSpawnPoint({ x, z: y, y: 0, rotation: 0 });
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mode === "addWall" && isDrawingWall && startPoint) {
        // Get the snapped and angle-enforced end point
        const endPoint = enforceAngle(
          startPoint.x,
          startPoint.y,
          mouseX,
          mouseY
        );

        setTempWall({
          id: "temp-wall",
          x1: startPoint.x,
          y1: startPoint.y,
          x2: endPoint.x,
          y2: endPoint.y,
          texture: "brickWall",
        });
      } else if (mode === "addFloor" && isDrawingFloor && startPoint) {
        // Snap mouse coordinates to grid
        const { x, y } = snapToGrid(mouseX, mouseY);

        // Calculate width and height (ensure they're positive)
        const width = Math.abs(x - startPoint.x);
        const height = Math.abs(y - startPoint.y);

        // Calculate the top-left corner of the rectangle
        const floorX = Math.min(startPoint.x, x);
        const floorY = Math.min(startPoint.y, y);

        // Update temp floor
        setTempFloor({
          id: "temp-floor",
          x: floorX,
          y: floorY,
          width,
          height,
          texture: "concreteFloor",
        });
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    walls,
    floors,
    mode,
    isDrawingWall,
    isDrawingFloor,
    startPoint,
    tempWall,
    tempFloor,
  ]);

  const setModeAndResetDrawing = (
    newMode: "select" | "addWall" | "addFloor" | "addRoom" | "spawnPoint"
  ) => {
    setMode(newMode);
    // Reset all drawing states when switching modes
    setIsDrawingWall(false);
    setIsDrawingFloor(false);
    setTempWall(null);
    setTempFloor(null);
    setStartPoint(null);
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  // Function to change floor texture
  const changeFloorTexture = (floorId: string, newTexture: string) => {
    setFloors(
      floors.map((floor) =>
        floor.id === floorId ? { ...floor, texture: newTexture } : floor
      )
    );
  };

  // Available floor textures
  const floorTextures = ["concreteFloor", "woodFloor", "tileFloor"];

  const saveMap = () => {
    const roomList = rooms.map((room) => {
      const roomWalls = walls.map((wall) => {
        if (wall.roomId === room) {
          let x,
            y,
            z,
            width,
            height,
            rotation,
            texture,
            depth,
            normal,
            roomWall;

          if (wall.x1 === wall.x2) {
            // Vertical wall (West/East)
            width = Math.abs(wall.y2 - wall.y1);
            height = 5;
            z = (wall.y2 + wall.y1) / 2;
            x = wall.x1;
            y = 0;
            rotation = -Math.PI / 2; // flipped
            texture = "west";
            depth = 0;
            normal = { x: -1, y: 0, z: 0 }; // flipped
          } else if (wall.y1 === wall.y2) {
            // Horizontal wall (North/South)
            width = Math.abs(wall.x2 - wall.x1);
            height = 5;
            x = (wall.x2 + wall.x1) / 2;
            z = wall.y1;
            y = 0;
            rotation = 0;
            texture = "north";
            depth = 0;
            normal = { x: 0, y: 0, z: -1 }; // flipped
          } else {
            // Diagonal wall
            const dx = wall.x2 - wall.x1;
            const dy = wall.y2 - wall.y1;
            const length = Math.sqrt(dx * dx + dy * dy);

            width = length;
            height = 5;
            x = (wall.x1 + wall.x2) / 2;
            z = (wall.y1 + wall.y2) / 2;
            y = 0;

            rotation = -Math.atan2(dy, dx); // flipped sign
            texture = "diagonal";
            depth = 0;

            normal = {
              x: dy / length, // flipped
              y: 0,
              z: -dx / length, // flipped
            };
          }

          // Apply scaling to the 3D coordinates and dimensions
          roomWall = {
            x: x && x * SCALE_FACTOR,
            y: y && y * SCALE_FACTOR,
            z: z && z * SCALE_FACTOR,
            width: width && width * SCALE_FACTOR,
            height,
            rotation,
            texture,
            depth: depth && depth * SCALE_FACTOR,
            normal,
          };

          return roomWall;
        }
      });

      const roomFloors = floors
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

      return { walls: roomWalls.filter(Boolean), floors: roomFloors };
    });

    // Scale spawn point if it exists
    const scaledSpawnPoint =
      Object.keys(spawnPoint).length > 0
        ? {
            x: (spawnPoint as any).x * SCALE_FACTOR,
            y: (spawnPoint as any).y * SCALE_FACTOR,
            z: (spawnPoint as any).z * SCALE_FACTOR,
            rotation: (spawnPoint as any).rotation,
          }
        : spawnPoint;

    const savedMap = JSON.stringify({
      name: "Level 1",
      spawnPoint: scaledSpawnPoint,
      textures: [
        { type: "wall", name: "north", path: "FreeDoomWall1.png" },
        { type: "wall", name: "south", path: "FreeDoomWall1.png" },
        { type: "wall", name: "east", path: "FreeDoomWall2.png" },
        { type: "wall", name: "west", path: "FreeDoomWall2.png" },
        { type: "floor", name: "floor", path: "FreeDoomFloor1.png" },
      ],
      rooms: roomList,
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
    });

    // Create a blob with the JSON data
    const blob = new Blob([savedMap], { type: "application/json" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = "map";

    // Append to the document, click it to trigger download, then remove it
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />

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
          onClick={() => setModeAndResetDrawing("addFloor")}
          className={`text-black border border-white rounded p-2 cursor-pointer ${
            mode === "addFloor" ? "bg-blue-200" : "bg-white"
          }`}
        >
          Add Floor
        </button>
        <div className="flex flex-col">
          <button
            onClick={() =>
              setRooms((rooms) => {
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
          Save Map (1/10 Scale)
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

      {isDrawingWall && (
        <div className="absolute top-24 left-10 text-white bg-black bg-opacity-70 p-2 rounded">
          Click to place the end of the wall (45° angles only)
        </div>
      )}

      {isDrawingFloor && (
        <div className="absolute top-24 left-10 text-white bg-black bg-opacity-70 p-2 rounded">
          Click and drag to set floor dimensions
        </div>
      )}

      {selectedObject && (
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

            {/* Texture selection for floors */}
            {selectedObject.type === "floor" && (
              <div className="mt-2">
                <p>
                  <strong>Change Texture:</strong>
                </p>
                <div className="flex gap-2 mt-2">
                  {floorTextures.map((texture) => (
                    <div
                      key={texture}
                      onClick={() =>
                        changeFloorTexture(selectedObject.id, texture)
                      }
                      className="w-8 h-8 cursor-pointer border border-white"
                      style={{
                        backgroundColor:
                          textureColors[texture as keyof typeof textureColors],
                        outline:
                          selectedObject.texture === texture
                            ? "2px solid yellow"
                            : "none",
                      }}
                      title={texture}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              className="bg-white text-black p-2 rounded mt-4"
              onClick={() => {
                if (selectedObject.type === "wall") {
                  const newWalls = walls.filter(
                    (wall) => wall.id !== selectedObject.id
                  );
                  setWalls(newWalls);
                } else if (selectedObject.type === "floor") {
                  const newFloors = floors.filter(
                    (floor) => floor.id !== selectedObject.id
                  );
                  setFloors(newFloors);
                }
                setSelectedObject(null);
              }}
            >
              Delete
            </button>
            <button
              onClick={() => {
                setShowRoomPicker((prev) => !prev);
              }}
              className="ml-2 bg-white text-black p-2 rounded cursor-pointer"
            >
              Add to room
            </button>
          </div>
          {showRoomPicker && (
            <div className="bg-black min-w-[100px] text-center">
              {rooms?.map((room) => (
                <button
                  key={room}
                  className="border border-solid bg-white text-black border-white p-2 rounded cursor-pointer m-1"
                  onClick={() => {
                    if (selectedObject.type === "wall") {
                      console.log("select obj", selectedObject);
                      setWalls((prev) => {
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
                      setSelectedObject((prev) => {
                        const newObject: SelectedObject = {
                          ...prev,
                        } as SelectedObject;
                        newObject.roomId = String(room);
                        return newObject;
                      });
                    }
                    if (selectedObject.type === "floor") {
                      setFloors((prev) => {
                        const newFloors = [...prev];
                        const selectedFloor = newFloors.find(
                          (floor) => floor.id === selectedObject.id
                        );

                        if (selectedFloor) {
                          selectedFloor.roomId = room;
                        }
                        return newFloors;
                      });
                      setSelectedObject((prev) => {
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
      )}
    </div>
  );
};

export default FloorPlanEditor;
