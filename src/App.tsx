import React, { useEffect, useRef, useState } from "react";
import "./index.css";
import useWalls from "./hooks/useWalls";
import { Floor, Wall, Block, Modes } from "./types/editor";
import useFloors from "./hooks/useFloors";
import useSteps from "./hooks/useSteps";
import useBlocks from "./hooks/useBlocks";
import useLevel from "./hooks/useLevel";
import useDrawingTools from "./hooks/useDrawingTools";
import Screen from "./classes/Screen";
import DetectCollision from "./classes/DetectCollision";
import useSelect from "./hooks/useSelect";
import Buttons from "./components/Buttons";
import SelectedObjectTool from "./components/SelectedObjectTool";
import DrawingTips from "./components/DrawringTips";

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
    drawTempWall,
    makeWall,
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
    drawTempFloor,
  } = useFloors();

  const {
    setSteps,
    steps,
    tempStep,
    setTempStep,
    isDrawingStep,
    setIsDrawingStep,
    drawSteps,
    rotateSteps,
    exportSteps,
    drawTempSteps,
  } = useSteps();

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
    drawTempblock,
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
    exportLevel,
  } = useLevel();

  const { selectedObject, setSelectedObject, detectSelectorCollision } =
    useSelect();

  const { enforceAngle, snapToGrid, showGrid, setShowGrid } = useDrawingTools();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Modes>("select");

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

    screen.draw();
    let lastFrameTime = 0;
    const targetFPS = 30; // Adjust this value as needed (lower = less CPU usage)
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastFrameTime;

      if (elapsed > frameInterval) {
        lastFrameTime = timestamp - (elapsed % frameInterval);
        screen.draw();
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { x, y } = snapToGrid(mouseX, mouseY);

      switch (mode) {
        case "addStep":
          if (!isDrawingStep) {
            drawTempSteps(x, y);
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
            drawTempblock(setStartPoint, x, y);
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
            drawTempWall(setStartPoint, x, y);
          } else {
            setIsDrawingWall(false);

            if (tempWall && startPoint) {
              // Calculate wall length using distance formula
              const length = Math.sqrt(
                Math.pow(tempWall.x2 - tempWall.x1, 2) +
                  Math.pow(tempWall.y2 - tempWall.y1, 2)
              );

              if (length > 20) {
                const newWall: Wall = makeWall(startPoint);
                setWalls([...walls, newWall]);
              }
            }

            setTempWall(null);
            setStartPoint(null);
          }
          break;

        case "addFloor":
          if (!isDrawingFloor) {
            drawTempFloor(setStartPoint, x, y);
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

    const exportObject = exportLevel(roomList, spawnPoint);
    const savedMap = JSON.stringify(exportObject);

    const blob = new Blob([savedMap], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "map";

    // Append to the document, click it to trigger download, then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />
      <Buttons
        setModeAndResetDrawing={setModeAndResetDrawing}
        mode={mode}
        setRooms={setRooms}
        toggleGrid={toggleGrid}
        saveMap={saveMap}
        showGrid={showGrid}
      />
      <DrawingTips
        isDrawingWall={isDrawingWall}
        isDrawingFloor={isDrawingFloor}
      />
      <SelectedObjectTool
        selectedObject={selectedObject}
        setWalls={setWalls}
        setFloors={setFloors}
        floors={floors}
        walls={walls}
        steps={steps}
        setSteps={setSteps}
        blocks={blocks}
        setBlocks={setBlocks}
        setSelectedObject={setSelectedObject}
        setShowRoomPicker={setShowRoomPicker}
        showRoomPicker={showRoomPicker}
        rooms={rooms}
      />
    </div>
  );
};

export default FloorPlanEditor;
