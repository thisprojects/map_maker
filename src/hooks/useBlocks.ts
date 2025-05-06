import { useState } from "react";
import { Block } from "../types/editor";

const useBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [tempBlock, setTempBlock] = useState<Block | null>(null);
  const [isDrawingBlock, setIsDrawingBlock] = useState(false);

  const blocksObject = {
    blocks,
    setBlocks,
    tempBlock,
    setTempBlock,
    isDrawingBlock,
    setIsDrawingBlock,
  };

  return blocksObject;
};

export default useBlocks;
