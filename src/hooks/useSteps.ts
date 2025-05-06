import { useState } from "react";
import { Step } from "../types/editor";

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
  };

  return stepsObject;
};

export default useSteps;
