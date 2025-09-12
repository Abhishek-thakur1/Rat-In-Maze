import { Cell } from '@/component/maze-generation/dfs/cell';
import { Stack } from '@/data-structure/stack';

export class Rat {
  private readonly grid: Cell[][];
  private currentCell: Cell;
  private visitedCells: Set<Cell> = new Set();
  private cellStack: Stack<Cell> = new Stack();
  private path: Cell[] = [];
  private posX: number;
  private posY: number;

  constructor(grid: Cell[][]) {
    this.grid = grid;
    this.currentCell = this.grid[0][0];
    this.cellStack.push(this.currentCell);
    this.visitedCells.add(this.currentCell);
  }

  showGrid(ctx: CanvasRenderingContext2D) {
    const rows = this.grid.length;
    const cols = this.grid[0].length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.grid[r][c].show(600, rows, cols, ctx);
      }
    }
  }

  //   step() {
  //     this.path.push(this.currentCell);
  //     const n = this.grid.length;

  //     if (this.currentCell === this.grid[n - 1][n - 1]) {
  //       return;
  //     }

  //     const nextCell = this.cellStack.pop();
  //     if (!nextCell) return;

  //     this.currentCell = nextCell;

  //     this.visitedCells.add(this.currentCell);
  //     const unvisitedNeighbors = this.currentCell.neighbors.filter(
  //       (cell) => !this.visitedCells.has(cell),
  //     );
  //     this.cellStack.push(...unvisitedNeighbors);
  //   }

  //   draw(ctx: CanvasRenderingContext2D) {
  //     this.showGrid(ctx);
  //     this.currentCell.highlight(this.grid[0].length, ctx);
  //     this.path.forEach((cell) => {
  //       cell.highlight(this.grid[0].length, ctx, '#70863eff');
  //     });
  //   }
  public pathfindingTime: number = 0;
  private startTime: number = performance.now();

  step() {
    this.path.push(this.currentCell);
    const n = this.grid.length;

    if (this.currentCell === this.grid[n - 1][n - 1]) {
      if (this.pathfindingTime === 0) {
        this.pathfindingTime = performance.now() - this.startTime;
      }
      return;
    }

    const nextCell = this.cellStack.pop();
    if (!nextCell) return;

    // 👇 keep reference for trailing line
    (nextCell as any).prevCell = this.currentCell;

    this.currentCell = nextCell;
    this.visitedCells.add(this.currentCell);

    const unvisitedNeighbors = this.getUnvisitedConnectedNeighbors(this.currentCell);
    this.cellStack.push(...unvisitedNeighbors);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.showGrid(ctx);

    // Rat (current position)
    this.currentCell.highlight(this.grid[0].length, ctx, 'red', 'circle');

    // Path trail (draw line between prevCell → currentCell)
    ctx.strokeStyle = '#70863eff';

    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    for (const cell of this.path) {
      if ((cell as any).prevCell) {
        const prev = (cell as any).prevCell;

        const w = ctx.canvas.width / this.grid.length;

        // centers
        const x1 = prev.colNum * w + w / 2;
        const y1 = prev.rowNum * w + w / 2;
        const x2 = cell.colNum * w + w / 2;
        const y2 = cell.rowNum * w + w / 2;

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
    }

    ctx.stroke();
  }

  private getUnvisitedConnectedNeighbors(cell: Cell): Cell[] {
    const neighbors: Cell[] = [];

    const { rowNum, colNum, walls } = cell;

    // top
    if (!walls.topWall) {
      const top = this.grid[rowNum - 1]?.[colNum];
      if (top && !this.visitedCells.has(top)) neighbors.push(top);
    }

    // right
    if (!walls.rightWall) {
      const right = this.grid[rowNum]?.[colNum + 1];
      if (right && !this.visitedCells.has(right)) neighbors.push(right);
    }

    // bottom
    if (!walls.bottomWall) {
      const bottom = this.grid[rowNum + 1]?.[colNum];
      if (bottom && !this.visitedCells.has(bottom)) neighbors.push(bottom);
    }

    // left
    if (!walls.leftWall) {
      const left = this.grid[rowNum]?.[colNum - 1];
      if (left && !this.visitedCells.has(left)) neighbors.push(left);
    }

    return neighbors;
  }
}
