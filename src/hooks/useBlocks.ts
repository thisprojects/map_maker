import { useState } from "react";
import { Block } from "../types/editor";
import { SCALE_FACTOR } from "../constants/constants";

interface IAddBlock {
  x: number;
  y: number;
  startPoint: { x: number; y: number };
}

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

    makeBlock(tempBlock: Block) {
      return {
        id: `block-${Date.now()}`,
        x: tempBlock.x,
        y: tempBlock.y,
        z: tempBlock.z,
        width: tempBlock.width,
        height: tempBlock.height,
        depth: tempBlock.depth,
        rotation: tempBlock.rotation,
        texture: "woodFloor",
        roomId: "1",
      };
    },

    addBlock({ x, y, startPoint }: IAddBlock) {
      // Calculate width and depth (ensure they're positive)
      const width = Math.abs(x - startPoint.x);
      const depth = Math.abs(y - startPoint.y);

      // Calculate the position of the block (center)
      const blockX = (startPoint.x + x) / 2;
      const blockZ = (startPoint.y + y) / 2;

      // Update temp block
      setTempBlock({
        ...tempBlock!,
        x: blockX,
        z: blockZ,
        width: width,
        depth: depth,
      });
    },

    exportBlocks(room: string) {
      return blocks
        .map((block) => {
          if (block.roomId === room) {
            return {
              x: block.x * SCALE_FACTOR,
              y: block.y,
              z: block.z * SCALE_FACTOR,
              width: block.width * SCALE_FACTOR,
              depth: block.depth * SCALE_FACTOR,
              height: block.height,
              rotation: block.rotation,
              texture: "block",
            };
          }
        })
        .filter(Boolean);
    },

    drawTempblock(
      setStartPoint: (point: { x: number; y: number } | null) => void,
      x: number,
      y: number
    ) {
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
    },
  };

  return blocksObject;
};

export default useBlocks;
