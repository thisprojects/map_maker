import { useState } from "react";
import { Step } from "../types/editor";
import { GRID_SIZE, SCALE_FACTOR } from "../constants/constants";

const useSteps = () => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [isDrawingStep, setIsDrawingStep] = useState(false);
  const [tempStep, setTempStep] = useState<Step | null>(null);

  const stepsObject = {
    steps,
    setSteps,
    isDrawingStep,
    setIsDrawingStep,
    tempStep,
    setTempStep,
    stepRotation: 0,
    stepCount: 6,

    calcNormal(stepRot: number) {
      let normal;

      switch (stepRot) {
        case 0: // North
          normal = { x: 0, y: 1, z: 0 };
          break;
        case 1: // East
          normal = { x: 1, y: 1, z: 0 };
          break;
        case 2: // South
          normal = { x: 0, y: 1, z: 0 };
          break;
        case 3: // West
          normal = { x: -1, y: 1, z: 0 };
          break;
        default:
          normal = { x: 0, y: 1, z: 0 };
      }
      return normal;
    },

    drawSteps(tempStep: Step) {
      let newSteps = [];
      let stepHeight = 1.5;

      if (tempStep.rotation === 2) {
        stepHeight = 0.25;
      }

      for (let i = 0; i < stepsObject.stepCount; i++) {
        // Calculate the step position based on rotation
        let stepX = tempStep.x; // Use the position of the temp step
        let stepZ = tempStep.z;
        const offset = (i * GRID_SIZE) / 7 + 7;
        let width = 0;
        let depth = 0;
        let dir = 0;

        switch (tempStep.rotation) {
          case 0: // North
            stepZ -= offset - GRID_SIZE / 2;
            width = GRID_SIZE;
            depth = 10;
            dir = 0;

            break;
          case 1: // East
            stepX += offset - GRID_SIZE / 2;
            width = 10;
            depth = GRID_SIZE;
            dir = 1;
            break;
          case 2: // South
            stepZ -= offset - GRID_SIZE / 2;
            width = GRID_SIZE;
            depth = 10;
            dir = 2;
            break;
          case 3: // West
            stepX -= offset - GRID_SIZE / 2;
            width = 10;
            depth = GRID_SIZE;
            dir = 3;
            break;
        }

        // Create a new step with decreasing height for each step
        const newStep: Step = {
          id: `step-${Date.now()}-${i}`,
          x: stepX,
          y: -1, // Ground level
          z: stepZ,
          width: width,
          depth: depth, // Fixed depth
          height: stepHeight,
          rotation: 0,
          texture: "woodFloor", // Using an existing texture
          normal: tempStep.normal,
          dir,
          roomId: "1",
        };

        newSteps.push(newStep);

        // decrease step height with each iteration
        if (tempStep.rotation === 2) {
          stepHeight += 0.25;
        } else {
          stepHeight -= 0.25;
        }
      }

      return newSteps;
    },

    rotateSteps(mode: string, direction: number) {
      if (mode === "addStep" && isDrawingStep && tempStep) {
        // Calculate new rotation (0: North, 1: East, 2: South, 3: West)
        // Using modulo to ensure the value stays in the range 0-3
        let newRotation = (tempStep.rotation + direction + 4) % 4;

        // Calculate normal based on new rotation
        let normal;
        switch (newRotation) {
          case 0: // North
            normal = { x: 0, y: 1, z: 0 };
            break;
          case 1: // East
            normal = { x: 1, y: 1, z: 0 };
            break;
          case 2: // South
            normal = { x: 0, y: 1, z: 0 };
            break;
          case 3: // West
            normal = { x: -1, y: 1, z: 0 };
            break;
          default:
            normal = { x: 0, y: 1, z: 0 };
        }

        // Make sure to preserve ALL properties of the tempStep
        setTempStep({
          ...tempStep,
          rotation: newRotation,
          normal: normal,
        });
      }
    },

    exportSteps() {
      return steps.map((step) => {
        const roomStep = {
          x: step.x * SCALE_FACTOR,
          y: step.y,
          z: step.z * SCALE_FACTOR,
          width: step.width * SCALE_FACTOR,
          depth: step.depth * SCALE_FACTOR,
          height: step.height,
          normal: step.normal,
          rotation: step.rotation,
          texture: "step",
        };

        return roomStep;
      });
    },
  };

  return stepsObject;
};

export default useSteps;
