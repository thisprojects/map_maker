import React, { useEffect, useRef, useState } from "react";
import "./index.css";

// Types
interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  texture: string;
}

interface Floor {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
}

interface SelectedObject {
  id: string;
  type: "wall" | "floor";
  texture: string;
  position?: {
    x: number;
    y: number;
  };
  clickPoint?: {
    x: number;
    y: number;
  };
}

// Initial data
const wallArray: Wall[] = [
  // Top wall
  {
    id: "wall-top",
    x1: 100,
    y1: 100,
    x2: 500,
    y2: 100,
    texture: "brickWall",
  },
  // Bottom wall
  {
    id: "wall-bottom",
    x1: 100,
    y1: 500,
    x2: 500,
    y2: 500,
    texture: "brickWall",
  },
  // Left wall
  {
    id: "wall-left",
    x1: 100,
    y1: 100,
    x2: 100,
    y2: 500,
    texture: "brickWall",
  },
  // Right wall
  {
    id: "wall-right",
    x1: 500,
    y1: 100,
    x2: 500,
    y2: 500,
    texture: "brickWall",
  },
];

const floorArray: Floor[] = [
  {
    id: "floor-main",
    x: 100,
    y: 100,
    width: 400,
    height: 400,
    texture: "concreteFloor",
  },
];

const FloorPlanEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [walls, setWalls] = useState<Wall[]>(wallArray);
  const [floors, setFloors] = useState<Floor[]>(floorArray);
  const [selectedObject, setSelectedObject] = useState<SelectedObject | null>(
    null
  );
  const [tempWall, setTempWall] = useState<Wall | null>(null);
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [mode, setMode] = useState<"select" | "addWall">("select");

  // Map for textures - in a real app, we'd load image patterns
  const textureColors = {
    brickWall: "#a52a2a",
    concreteFloor: "#cccccc",
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

      // Draw floors
      floors.forEach((floor) => {
        ctx.fillStyle =
          textureColors[floor.texture as keyof typeof textureColors];
        ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

        // Draw floor border
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);
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
  }, [walls, floors, selectedObject, tempWall]);

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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (mode === "select") {
        // Check if we clicked on a wall
        let clickedObject = false;

        for (const wall of walls) {
          if (isPointOnWall(x, y, wall)) {
            setSelectedObject({
              id: wall.id,
              type: "wall",
              texture: wall.texture,
              clickPoint: { x, y },
            });
            clickedObject = true;
            break;
          }
        }

        // If not on a wall, check floors
        if (!clickedObject) {
          for (const floor of floors) {
            if (isPointOnFloor(x, y, floor)) {
              setSelectedObject({
                id: floor.id,
                type: "floor",
                texture: floor.texture,
                clickPoint: { x, y },
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
      } else if (mode === "addWall") {
        if (!isDrawingWall) {
          // Start drawing a wall
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
                x2: x,
                y2: y,
                texture: "brickWall",
              };
              setWalls([...walls, newWall]);
            }
          }

          setTempWall(null);
          setStartPoint(null);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (mode === "addWall" && isDrawingWall && startPoint) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setTempWall({
          id: "temp-wall",
          x1: startPoint.x,
          y1: startPoint.y,
          x2: x,
          y2: y,
          texture: "brickWall",
        });
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, [walls, floors, mode, isDrawingWall, startPoint, tempWall]);

  const toggleMode = () => {
    setMode(mode === "select" ? "addWall" : "select");
    // Reset drawing state when switching modes
    setIsDrawingWall(false);
    setTempWall(null);
    setStartPoint(null);
  };

  return (
    <div className="relative">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }} />

      <div className="absolute top-10 left-10 flex gap-2">
        <button
          onClick={toggleMode}
          className="text-black border border-white rounded p-2 cursor-pointer bg-white"
        >
          {mode === "select" ? "Add Wall Mode" : "Select Mode"}
        </button>

        {isDrawingWall && (
          <div className="text-white bg-black bg-opacity-70 p-2 rounded">
            Click to place the end of the wall
          </div>
        )}
      </div>

      {/* Object info panel */}
      {selectedObject && (
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white p-4 m-4 rounded">
          <h3 className="text-xl font-bold mb-2">Selected Object</h3>
          <p>
            <strong>ID:</strong> {selectedObject.id}
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
        </div>
      )}
    </div>
  );
};

export default FloorPlanEditor;
