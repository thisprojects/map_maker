import { Block, Floor, Step, Wall } from "../types/editor";

interface IDetectCollisionOptions {
  x: number;
  y: number;
}

class DetectCollision {
  private x: number;
  private y: number;

  constructor({ x, y }: IDetectCollisionOptions) {
    this.x = x;
    this.y = y;
  }

  isPointOnWall = (wall: Wall): boolean => {
    const lineWidth = 10; // Wall thickness

    // Calculate perpendicular distance from point to line
    const A = wall.y2 - wall.y1;
    const B = wall.x1 - wall.x2;
    const C = wall.x2 * wall.y1 - wall.x1 * wall.y2;

    const distance =
      Math.abs(A * this.x + B * this.y + C) / Math.sqrt(A * A + B * B);

    // Check if point is within line segment (not just the infinite line)
    const minX = Math.min(wall.x1, wall.x2) - lineWidth;
    const maxX = Math.max(wall.x1, wall.x2) + lineWidth;
    const minY = Math.min(wall.y1, wall.y2) - lineWidth;
    const maxY = Math.max(wall.y1, wall.y2) + lineWidth;

    const withinBounds =
      this.x >= minX && this.x <= maxX && this.y >= minY && this.y <= maxY;

    return distance <= lineWidth && withinBounds;
  };

  isPointOnBlock = (block: Block): boolean => {
    // Convert mouse coordinates to the local coordinate system of the rotated block
    const dx = this.x - block.x;
    const dy = this.y - block.z;

    // Rotate the point in the opposite direction of the block's rotation
    const angle = (-block.rotation * Math.PI) / 2;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    // Check if the rotated point is within the block bounds
    return (
      rotatedX >= -block.width / 2 &&
      rotatedX <= block.width / 2 &&
      rotatedY >= -block.depth / 2 &&
      rotatedY <= block.depth / 2
    );
  };

  isPointOnStep = (step: Step): boolean => {
    // Convert mouse coordinates to the local coordinate system of the rotated step
    const dx = this.x - step.x;
    const dy = this.y - step.z;

    // Rotate the point in the opposite direction of the step's rotation
    const angle = (-step.rotation * Math.PI) / 2;
    const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
    const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);

    // Check if the rotated point is within the step bounds
    return (
      rotatedX >= -step.width / 2 &&
      rotatedX <= step.width / 2 &&
      rotatedY >= -step.depth / 2 &&
      rotatedY <= step.depth / 2
    );
  };

  isPointOnFloor = (floor: Floor): boolean => {
    return (
      this.x >= floor.x &&
      this.x <= floor.x + floor.width &&
      this.y >= floor.y &&
      this.y <= floor.y + floor.height
    );
  };
}

export default DetectCollision;
