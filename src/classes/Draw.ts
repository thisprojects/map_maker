import { GRID_SIZE } from "../constants/constants";
import { Block, Floor, Step, Wall } from "../types/editor";

export interface IDrawOptions {
  canvas: HTMLCanvasElement;
  floors: Floor[];
  steps: Step[];
  blocks: Block[];
  walls: Wall[];
  selectedObject;
  textureColors;
  showGrid;
  tempStep;
  tempWall;
  tempBlock;
  tempFloor;
  spawnPoint;
}

export default class Draw {
  private ctx;
  private canvas: HTMLCanvasElement;
  private floors: Floor[];
  private steps: Step[];
  private blocks: Block[];
  private walls: Wall[];
  private selectedObject;
  private textureColours;
  private showGrid;
  private tempWall;
  private tempBlock;
  private tempStep;
  private tempFloor;
  private spawnPoint;

  constructor({
    canvas,
    floors,
    steps,
    blocks,
    walls,
    selectedObject,
    textureColors,
    showGrid,
    tempStep,
    tempWall,
    tempBlock,
    tempFloor,
    spawnPoint,
  }: IDrawOptions) {
    this.canvas = canvas as HTMLCanvasElement;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.textureColours = textureColors;
    this.selectedObject = selectedObject;
    this.showGrid = showGrid;
    this.tempStep = tempStep;
    this.tempBlock = tempBlock;
    this.tempWall = tempWall;
    this.tempFloor = tempFloor;
    this.spawnPoint = spawnPoint;
    this.floors = floors;
    this.steps = steps;
    this.blocks = blocks;
    this.walls = walls;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to get 2D context from canvas");
    }
    this.ctx = context;
  }

  public draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.floors.forEach((floor: Floor) => {
      this.ctx.fillStyle =
        this.textureColours[floor.texture as keyof typeof this.textureColours];
      this.ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

      // Draw floor border
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);

      // If selected, highlight with a different color
      if (this.selectedObject && this.selectedObject.id === floor.id) {
        this.ctx.strokeStyle = "#ffcc00";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);
      }
    });

    // Draw grid if enabled
    if (this.showGrid) {
      this.ctx.strokeStyle = "#e0e0e0";
      this.ctx.lineWidth = 0.5;

      // Draw vertical grid lines
      for (let x = 0; x < this.canvas.width; x += GRID_SIZE) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.canvas.height);
        this.ctx.stroke();
      }

      // Draw horizontal grid lines
      for (let y = 0; y < this.canvas.height; y += GRID_SIZE) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
      }
    }

    const stairGroups: { [key: string]: Step[] } = {};

    this.steps.forEach((step: Step) => {
      const stepDirection = step.dir as number;
      if (!isNaN(stepDirection)) {
        if (!stairGroups[stepDirection]) {
          stairGroups[stepDirection] = [];
        }
        stairGroups[stepDirection].push(step);
      }
    });

    // Process each group of stairs with the correct drawing order
    Object.entries(stairGroups).forEach(([dir, stepsInGroup]) => {
      // Sort based on direction
      // dir 0 = North: Draw from south to north (low Z to high Z)
      // dir 2 = South: Draw from north to south (high Z to low Z)
      if (dir === "0") {
        // North stairs
        stepsInGroup.sort((a, b) => a.z - b.z); // Ascending Z (south to north)
      } else if (dir === "2") {
        // South stairs
        stepsInGroup.sort((a, b) => b.z - a.z); // Descending Z (north to south)
      }
      // Add other directions (East/West) as needed

      // Draw the sorted steps
      stepsInGroup.forEach((step) => {
        this.ctx.save();

        // Translate to the center of the step
        this.ctx.translate(step.x, step.z);

        // Rotate based on step rotation
        this.ctx.rotate((step.rotation * Math.PI) / 2);

        // Fill with step texture color
        this.ctx.fillStyle = "#d2b48c";

        // Draw the step rectangle (moved back to account for the rotation around center)
        const stepX = -step.width / 2;
        const stepY = -step.depth / 2;
        this.ctx.fillRect(stepX, stepY, step.width, step.depth);

        // Draw step border
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(stepX, stepY, step.width, step.depth);

        // If selected, highlight with a different color
        if (this.selectedObject && this.selectedObject.id === step.id) {
          this.ctx.strokeStyle = "#ffcc00";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(stepX, stepY, step.width, step.depth);
        }

        this.ctx.restore();
      });
    });

    // Draw blocks
    this.blocks.forEach((block: Block) => {
      this.ctx.save();

      // Translate to the center of the block
      this.ctx.translate(block.x, block.z);

      // Rotate based on block rotation
      this.ctx.rotate((block.rotation * Math.PI) / 2);

      // Fill with block texture color
      this.ctx.fillStyle =
        this.textureColours[block.texture as keyof typeof this.textureColours];

      // Draw the block rectangle
      const blockX = -block.width / 2;
      const blockY = -block.depth / 2;
      this.ctx.fillRect(blockX, blockY, block.width, block.depth);

      // Draw block border
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(blockX, blockY, block.width, block.depth);

      // If selected, highlight with a different color
      if (this.selectedObject && this.selectedObject.id === block.id) {
        this.ctx.strokeStyle = "#ffcc00";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(blockX, blockY, block.width, block.depth);
      }

      this.ctx.restore();
    });

    // Draw temporary block when in addBlock mode
    if (this.tempBlock) {
      this.ctx.save();

      // Translate to the center of the block
      this.ctx.translate(this.tempBlock.x, this.tempBlock.z);

      // Rotate based on block rotation
      this.ctx.rotate((this.tempBlock.rotation * Math.PI) / 2);

      // Fill with semi-transparent color
      this.ctx.fillStyle = "rgba(0, 136, 255, 0.3)";

      // Draw the block rectangle
      const blockX = -this.tempBlock.width / 2;
      const blockY = -this.tempBlock.depth / 2;
      this.ctx.fillRect(
        blockX,
        blockY,
        this.tempBlock.width,
        this.tempBlock.depth
      );

      // Draw dashed border
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        blockX,
        blockY,
        this.tempBlock.width,
        this.tempBlock.depth
      );
      this.ctx.setLineDash([]);

      this.ctx.restore();
    }

    // Draw walls
    this.walls.forEach((wall: Wall) => {
      this.ctx.beginPath();
      this.ctx.moveTo(wall.x1, wall.y1);
      this.ctx.lineTo(wall.x2, wall.y2);
      this.ctx.strokeStyle =
        this.textureColours[wall.texture as keyof typeof this.textureColours];
      this.ctx.lineWidth = 10;
      this.ctx.stroke();

      // If selected, highlight with a different color
      if (this.selectedObject && this.selectedObject.id === wall.id) {
        this.ctx.strokeStyle = "#ffcc00";
        this.ctx.lineWidth = 12;
        this.ctx.stroke();
      }
    });

    // Draw temporary wall when in addWall mode
    if (this.tempWall) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.tempWall.x1, this.tempWall.y1);
      this.ctx.lineTo(this.tempWall.x2, this.tempWall.y2);
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 8;
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Draw temporary floor when in addFloor mode
    if (this.tempFloor) {
      this.ctx.fillStyle = "rgba(0, 136, 255, 0.3)";
      this.ctx.fillRect(
        this.tempFloor.x,
        this.tempFloor.y,
        this.tempFloor.width,
        this.tempFloor.height
      );
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        this.tempFloor.x,
        this.tempFloor.y,
        this.tempFloor.width,
        this.tempFloor.height
      );
      this.ctx.setLineDash([]);
    }
    if (this.tempStep) {
      this.ctx.save();

      // Translate to the center of the step
      this.ctx.translate(this.tempStep.x, this.tempStep.z);

      // Rotate based on step rotation
      this.ctx.rotate((this.tempStep.rotation * Math.PI) / 2);

      // Fill with step texture color
      this.ctx.fillStyle =
        this.textureColours[
          this.tempStep.texture as keyof typeof this.textureColours
        ];

      // Draw the step rectangle
      const stepX = -this.tempStep.width / 2;
      const stepY = -this.tempStep.depth / 2;
      this.ctx.fillRect(stepX, stepY, this.tempStep.width, this.tempStep.depth);

      // Draw step border with dashed line to indicate it's temporary
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        stepX,
        stepY,
        this.tempStep.width,
        this.tempStep.depth
      );

      // Add rotation indicator
      this.ctx.strokeStyle = "#ff3300";
      this.ctx.setLineDash([]);
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -this.tempStep.depth / 2 - 15);
      this.ctx.stroke();

      // Draw rotation angle text
      this.ctx.fillStyle = "black";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        `${this.tempStep.rotation * 90}°`,
        0,
        -this.tempStep.depth / 2 - 20
      );

      this.ctx.restore();
    }

    if (this.spawnPoint?.x) {
      this.ctx.font = "25px Arial"; // Set font size and family
      this.ctx.fillStyle = "red"; // Set text color

      // Write text at specific coordinates (x, y)
      this.ctx.fillText("P", this.spawnPoint.x, this.spawnPoint.z);
      this.ctx.restore();
    }
  }
}
