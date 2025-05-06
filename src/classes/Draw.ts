export class Draw {
  private ctx;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to get 2D context from canvas");
    }
    this.ctx = context;
  }

  public draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    floors.forEach((floor) => {
      this.ctx.fillStyle =
        textureColors[floor.texture as keyof typeof textureColors];
      this.ctx.fillRect(floor.x, floor.y, floor.width, floor.height);

      // Draw floor border
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);

      // If selected, highlight with a different color
      if (selectedObject && selectedObject.id === floor.id) {
        this.ctx.strokeStyle = "#ffcc00";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(floor.x, floor.y, floor.width, floor.height);
      }
    });

    // Draw grid if enabled
    if (showGrid) {
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

    steps.forEach((step) => {
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
        if (selectedObject && selectedObject.id === step.id) {
          this.ctx.strokeStyle = "#ffcc00";
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(stepX, stepY, step.width, step.depth);
        }

        this.ctx.restore();
      });
    });

    // Draw blocks
    blocks.forEach((block) => {
      this.ctx.save();

      // Translate to the center of the block
      this.ctx.translate(block.x, block.z);

      // Rotate based on block rotation
      this.ctx.rotate((block.rotation * Math.PI) / 2);

      // Fill with block texture color
      this.ctx.fillStyle =
        textureColors[block.texture as keyof typeof textureColors];

      // Draw the block rectangle
      const blockX = -block.width / 2;
      const blockY = -block.depth / 2;
      this.ctx.fillRect(blockX, blockY, block.width, block.depth);

      // Draw block border
      this.ctx.strokeStyle = "#000";
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(blockX, blockY, block.width, block.depth);

      // If selected, highlight with a different color
      if (selectedObject && selectedObject.id === block.id) {
        this.ctx.strokeStyle = "#ffcc00";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(blockX, blockY, block.width, block.depth);
      }

      this.ctx.restore();
    });

    // Draw temporary block when in addBlock mode
    if (tempBlock) {
      this.ctx.save();

      // Translate to the center of the block
      this.ctx.translate(tempBlock.x, tempBlock.z);

      // Rotate based on block rotation
      this.ctx.rotate((tempBlock.rotation * Math.PI) / 2);

      // Fill with semi-transparent color
      this.ctx.fillStyle = "rgba(0, 136, 255, 0.3)";

      // Draw the block rectangle
      const blockX = -tempBlock.width / 2;
      const blockY = -tempBlock.depth / 2;
      this.ctx.fillRect(blockX, blockY, tempBlock.width, tempBlock.depth);

      // Draw dashed border
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(blockX, blockY, tempBlock.width, tempBlock.depth);
      this.ctx.setLineDash([]);

      this.ctx.restore();
    }

    // Draw walls
    walls.forEach((wall) => {
      this.ctx.beginPath();
      this.ctx.moveTo(wall.x1, wall.y1);
      this.ctx.lineTo(wall.x2, wall.y2);
      this.ctx.strokeStyle =
        textureColors[wall.texture as keyof typeof textureColors];
      this.ctx.lineWidth = 10;
      this.ctx.stroke();

      // If selected, highlight with a different color
      if (selectedObject && selectedObject.id === wall.id) {
        this.ctx.strokeStyle = "#ffcc00";
        this.ctx.lineWidth = 12;
        this.ctx.stroke();
      }
    });

    // Draw temporary wall when in addWall mode
    if (tempWall) {
      this.ctx.beginPath();
      this.ctx.moveTo(tempWall.x1, tempWall.y1);
      this.ctx.lineTo(tempWall.x2, tempWall.y2);
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 8;
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Draw temporary floor when in addFloor mode
    if (tempFloor) {
      this.ctx.fillStyle = "rgba(0, 136, 255, 0.3)";
      this.ctx.fillRect(
        tempFloor.x,
        tempFloor.y,
        tempFloor.width,
        tempFloor.height
      );
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(
        tempFloor.x,
        tempFloor.y,
        tempFloor.width,
        tempFloor.height
      );
      this.ctx.setLineDash([]);
    }
    if (tempStep) {
      this.ctx.save();

      // Translate to the center of the step
      this.ctx.translate(tempStep.x, tempStep.z);

      // Rotate based on step rotation
      this.ctx.rotate((tempStep.rotation * Math.PI) / 2);

      // Fill with step texture color
      this.ctx.fillStyle =
        textureColors[tempStep.texture as keyof typeof textureColors];

      // Draw the step rectangle
      const stepX = -tempStep.width / 2;
      const stepY = -tempStep.depth / 2;
      this.ctx.fillRect(stepX, stepY, tempStep.width, tempStep.depth);

      // Draw step border with dashed line to indicate it's temporary
      this.ctx.strokeStyle = "#0088ff";
      this.ctx.setLineDash([5, 5]);
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(stepX, stepY, tempStep.width, tempStep.depth);

      // Add rotation indicator
      this.ctx.strokeStyle = "#ff3300";
      this.ctx.setLineDash([]);
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.lineTo(0, -tempStep.depth / 2 - 15);
      this.ctx.stroke();

      // Draw rotation angle text
      this.ctx.fillStyle = "black";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        `${tempStep.rotation * 90}°`,
        0,
        -tempStep.depth / 2 - 20
      );

      this.ctx.restore();
    }

    if (spawnPoint?.x) {
      this.ctx.font = "25px Arial"; // Set font size and family
      this.ctx.fillStyle = "red"; // Set text color

      // Write text at specific coordinates (x, y)
      this.ctx.fillText("P", spawnPoint.x, spawnPoint.z);
      this.ctx.restore();
    }
  }
}
