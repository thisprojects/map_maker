import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import useWalls from "./hooks/useWalls";
import { Floor, SelectedObject, Wall, Step, Block, Room } from "./types/editor";
import useFloors from "./hooks/useFloors";
import useSteps from "./hooks/useSteps";
import useBlocks from "./hooks/useBlocks";
import useLevel from "./hooks/useLevel";
import useDrawingTools from "./hooks/useDrawingTools";
import {
  GRID_SIZE,
  SCALE_FACTOR,
  TEXTURE_COLOURS,
} from "./constants/constants";
import Screen from "./classes/Screen";
import DetectCollision from "./classes/DetectCollision";
import useSelect from "./hooks/useSelect";
import MakeExportedMap from "./classes/MakeExportedMap";

// Initial data

const FloorPlanEditor: React.FC = () => {
  const {
    setWalls,
    walls,
    tempWall,
    setTempWall,
    isDrawingWall,
    setIsDrawingWall,
    addWall,
    exportWalls,
  } = useWalls();

  const {
    setFloors,
    floors,
    tempFloor,
    setTempFloor,
    isDrawingFloor,
    setIsDrawingFloor,
    makeFloor,
    addFloor,
    exportFloors,
  } = useFloors();

  const {
    setSteps,
    steps,
    tempStep,
    setTempStep,
    isDrawingStep,
    setIsDrawingStep,
    stepRotation,
    calcNormal,
    drawSteps,
    rotateSteps,
    exportSteps,
  } = useSteps();

  const { selectedObject, setSelectedObject, detectSelectorCollision } =
    useSelect();

  const {
    setBlocks,
    blocks,
    setTempBlock,
    tempBlock,
    isDrawingBlock,
    setIsDrawingBlock,
    makeBlock,
    addBlock,
    exportBlocks,
  } = useBlocks();

  const {
    showRoomPicker,
    setShowRoomPicker,
    rooms,
    setRooms,
    spawnPoint,
    setSpawnPoint,
    startPoint,
    setStartPoint,
  } = useLevel();

  const { enforceAngle, snapToGrid, showGrid, setShowGrid } = useDrawingTools();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<
    | "select"
    | "addWall"
    | "addFloor"
    | "addRoom"
    | "spawnPoint"
    | "addStep"
    | "addBlock"
  >("select");

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const screen = new Screen({
      canvas,
      floors,
      steps,
      blocks,
      walls,
      selectedObject,
      showGrid,
      tempStep,
      tempWall,
      tempBlock,
      tempFloor,
      spawnPoint,
    });

    // Initial draw
    screen.draw();

    // Set up animation loop with proper timing
    let lastFrameTime = 0;
    const targetFPS = 30; // Adjust this value as needed (lower = less CPU usage)
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      // Calculate time elapsed since last frame
      const elapsed = timestamp - lastFrameTime;

      // Only render if enough time has passed
      if (elapsed > frameInterval) {
        // Update last frame time, accounting for any excess time
        lastFrameTime = timestamp - (elapsed % frameInterval);

        // Perform drawing operation
        screen.draw();
      }

      // Schedule next frame
      requestAnimationFrame(animate);
    };

    // Start animation loop
    requestAnimationFrame(animate);

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      screen.draw();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
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
    tempStep,
    steps,
    isDrawingStep,
    spawnPoint,
    blocks,
    isDrawingBlock,
    tempBlock,
  ]);

  // Handle mouse events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Snap coordinates to grid
      const { x, y } = snapToGrid(mouseX, mouseY);

      switch (mode) {
        case "addStep":
          if (!isDrawingStep) {
            const escapeKeyHandler = (event: KeyboardEvent) => {
              if (
                event.key === "Escape" ||
                event.key === "Esc" ||
                event.keyCode === 27
              ) {
                setIsDrawingStep(false);
                setTempStep(null);

                document.removeEventListener("keydown", escapeKeyHandler);
              }
            };

            document.addEventListener("keydown", escapeKeyHandler);
            let normal = calcNormal(stepRotation);

            const newTempStep = {
              id: "temp-step",
              x: x,
              y: -1, // Ground level
              z: y,
              width: GRID_SIZE,
              depth: GRID_SIZE,
              height: 0.25,
              rotation: stepRotation,
              texture: "woodFloor",
              normal: normal,
            };

            setTempStep(newTempStep);
            setIsDrawingStep(true);
          } else {
            if (tempStep) {
              let newSteps = drawSteps(tempStep);
              setSteps((prevSteps) => [...prevSteps, ...newSteps]);
            }

            setIsDrawingStep(false);
            setTempStep(null);
          }
          break;

        case "addBlock":
          if (!isDrawingBlock) {
            const escapeKeyHandler = (event: KeyboardEvent) => {
              if (
                event.key === "Escape" ||
                event.key === "Esc" ||
                event.keyCode === 27
              ) {
                setIsDrawingBlock(false);
                setTempBlock(null);
                setStartPoint(null);

                document.removeEventListener("keydown", escapeKeyHandler);
              }
            };
            document.addEventListener("keydown", escapeKeyHandler);
            setIsDrawingBlock(true);
            setStartPoint({ x, y });

            setTempBlock({
              id: "temp-block",
              x,
              y: 0, // Default height of 0
              z: y,
              width: 0,
              height: 1, // Default thickness of 1
              depth: 0,
              rotation: 0,
              texture: "woodFloor",
            });
          } else {
            setIsDrawingBlock(false);

            if (tempBlock && startPoint) {
              if (tempBlock.width > 20 && tempBlock.depth > 20) {
                const newBlock: Block = makeBlock(tempBlock);
                setBlocks([...blocks, newBlock]);
              }
            }

            setTempBlock(null);
            setStartPoint(null);
          }
          break;

        case "select":
          const detectCollision = new DetectCollision({
            x: mouseX,
            y: mouseY,
          });

          detectSelectorCollision({
            walls,
            detectCollision,
            blocks,
            floors,
            steps,
          });

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

                document.removeEventListener("keydown", escapeKeyHandler);
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
            setIsDrawingWall(false);

            if (tempWall && startPoint) {
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
            const escapeKeyHandler = (event: KeyboardEvent) => {
              if (
                event.key === "Escape" ||
                event.key === "Esc" ||
                event.keyCode === 27
              ) {
                setIsDrawingFloor(false);
                setTempFloor(null);
                setStartPoint(null);

                document.removeEventListener("keydown", escapeKeyHandler);
              }
            };
            document.addEventListener("keydown", escapeKeyHandler);
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
            setIsDrawingFloor(false);

            if (tempFloor && startPoint) {
              if (tempFloor.width > 20 && tempFloor.height > 20) {
                const newFloor: Floor = makeFloor(tempFloor);
                setFloors([...floors, newFloor]);
              }
            }

            setTempFloor(null);
            setStartPoint(null);
          }
          break;
        case "spawnPoint":
          setSpawnPoint({ x: mouseX, z: mouseY, y: 0, rotation: 0 });
          break;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { x, y } = snapToGrid(mouseX, mouseY);

      if (startPoint) {
        switch (mode) {
          case "addWall":
            if (isDrawingWall) {
              addWall({
                startPoint,
                enforceAngle,
                mouse: { x: mouseX, y: mouseY },
              });
            }
            break;

          case "addFloor":
            if (isDrawingFloor) {
              addFloor({ startPoint, x, y });
            }
            break;

          case "addBlock":
            if (isDrawingBlock) {
              addBlock({ startPoint, x, y });
            }
            break;
        }
      } else if (mode === "addStep" && isDrawingStep && tempStep) {
        setTempStep({
          ...tempStep,
          x: mouseX,
          z: mouseY,
        });
      }
    };

    const handleRotateSteps = (e: WheelEvent) => {
      if (mode === "addStep" && isDrawingStep && tempStep) {
        e.preventDefault();

        // Determine rotation direction based on wheel delta
        const direction = e.deltaY > 0 ? 1 : -1;
        rotateSteps(mode, direction);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("wheel", handleRotateSteps);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("wheel", handleRotateSteps);
    };
  }, [
    walls,
    floors,
    mode,
    isDrawingWall,
    blocks,
    isDrawingBlock,
    tempBlock,
    isDrawingFloor,
    startPoint,
    tempWall,
    tempFloor,
    tempStep,
    steps,
    isDrawingStep,
  ]);

  const setModeAndResetDrawing = (
    newMode:
      | "select"
      | "addWall"
      | "addFloor"
      | "addRoom"
      | "spawnPoint"
      | "addStep"
      | "addBlock"
  ) => {
    setMode(newMode);
    // Reset all drawing states when switching modes
    setIsDrawingWall(false);
    setIsDrawingFloor(false);
    setIsDrawingStep(false);
    setIsDrawingBlock(false);
    setTempWall(null);
    setTempBlock(null);
    setTempFloor(null);
    setTempStep(null);
    setStartPoint(null);
  };

  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };

  const changeFloorTexture = (floorId: string, newTexture: string) => {
    setFloors(
      floors.map((floor) =>
        floor.id === floorId ? { ...floor, texture: newTexture } : floor
      )
    );
  };

  const floorTextures = ["concreteFloor", "woodFloor", "tileFloor"];

  const saveMap = () => {
    const roomList: any = rooms.map((room) => {
      const roomWalls = exportWalls(room);
      const roomSteps = exportSteps();
      const roomBlocks = exportBlocks(room);
      const roomFloors = exportFloors(room);

      return {
        walls: roomWalls,
        floors: roomFloors,
        steps: roomSteps,
        blocks: roomBlocks,
      };
    });

    const exporter = new MakeExportedMap();
    const exportObject = exporter.export(roomList, spawnPoint);
    const savedMap = JSON.stringify(exportObject);

    const blob = new Blob([savedMap], { type: "application/json" });
    const url = URL.createObjectURL(blob);

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
                          TEXTURE_COLOURS[
                            texture as keyof typeof TEXTURE_COLOURS
                          ],
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
                if (selectedObject.type === "step") {
                  const newSteps = steps.filter(
                    (step) => step.id !== selectedObject.id
                  );
                  setSteps(newSteps);
                }

                if (selectedObject.type === "block") {
                  const newBlocks = blocks.filter(
                    (block) => block.id !== selectedObject.id
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
