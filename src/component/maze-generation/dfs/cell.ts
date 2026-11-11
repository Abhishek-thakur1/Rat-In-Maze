import { Walls } from '@/types/types';

export class Cell {
  public readonly rowNum: number;
  public readonly colNum: number;
  public parentGrid?: Cell[][];
  public parentSize?: number;
  public visited: boolean = false;
  public explored: boolean = false;
  public inPath: boolean = false;
  public isSolution: boolean = false;
  public parent: Cell | null = null;
  public prevCell?: Cell;

  public walls: Walls = {
    topWall: true,
    rightWall: true,
    bottomWall: true,
    leftWall: true,
  };

  constructor(
    rowNum: number,
    columnNum: number,
    parentGrid?: Cell[][],
    parentSize?: number
  ) {
    this.rowNum = rowNum;
    this.colNum = columnNum;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
  }

  public resetSolvingState(): void {
    this.explored = false;
    this.inPath = false;
    this.isSolution = false;
    this.parent = null;
    this.prevCell = undefined;
  }

  public resetAll(): void {
    this.resetSolvingState();
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };
  }

  public get neighbors(): Cell[] {
    if (!this.parentGrid) return [];
    return this.getAccessibleNeighbors(this.parentGrid);
  }

  public getUnvisitedNeighbors(grid: Cell[][]): Cell[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const neighbors: Cell[] = [];

    if (this.rowNum > 0 && !grid[this.rowNum - 1][this.colNum].visited) {
      neighbors.push(grid[this.rowNum - 1][this.colNum]);
    }
    if (this.colNum < cols - 1 && !grid[this.rowNum][this.colNum + 1].visited) {
      neighbors.push(grid[this.rowNum][this.colNum + 1]);
    }
    if (this.rowNum < rows - 1 && !grid[this.rowNum + 1][this.colNum].visited) {
      neighbors.push(grid[this.rowNum + 1][this.colNum]);
    }
    if (this.colNum > 0 && !grid[this.rowNum][this.colNum - 1].visited) {
      neighbors.push(grid[this.rowNum][this.colNum - 1]);
    }

    return neighbors;
  }

  public checkNeighbours(): Cell | undefined {
    if (!this.parentGrid) return undefined;
    const unvisited = this.getUnvisitedNeighbors(this.parentGrid);
    if (unvisited.length === 0) return undefined;
    return unvisited[Math.floor(Math.random() * unvisited.length)];
  }

  public getAccessibleNeighbors(grid: Cell[][]): Cell[] {
    const rows = grid.length;
    const cols = grid[0].length;
    const accessible: Cell[] = [];

    if (!this.walls.topWall && this.rowNum > 0) {
      accessible.push(grid[this.rowNum - 1][this.colNum]);
    }
    if (!this.walls.rightWall && this.colNum < cols - 1) {
      accessible.push(grid[this.rowNum][this.colNum + 1]);
    }
    if (!this.walls.bottomWall && this.rowNum < rows - 1) {
      accessible.push(grid[this.rowNum + 1][this.colNum]);
    }
    if (!this.walls.leftWall && this.colNum > 0) {
      accessible.push(grid[this.rowNum][this.colNum - 1]);
    }

    return accessible;
  }

  public static removeWalls(a: Cell, b: Cell): void {
    const dCol = a.colNum - b.colNum;
    if (dCol === 1) {
      a.walls.leftWall = false;
      b.walls.rightWall = false;
    } else if (dCol === -1) {
      a.walls.rightWall = false;
      b.walls.leftWall = false;
    }

    const dRow = a.rowNum - b.rowNum;
    if (dRow === 1) {
      a.walls.topWall = false;
      b.walls.bottomWall = false;
    } else if (dRow === -1) {
      a.walls.bottomWall = false;
      b.walls.topWall = false;
    }
  }

  public removeWalls(a: Cell, b: Cell): void {
    Cell.removeWalls(a, b);
  }

  public drawBackground(
    ctx: CanvasRenderingContext2D,
    cellW: number,
    cellH: number,
    isStart: boolean,
    isTarget: boolean
  ): void {
    const x = this.colNum * cellW;
    const y = this.rowNum * cellH;

    if (isStart) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
    } else if (isTarget) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
    } else if (this.explored) {
      // Subtle centered breadcrumb dot - keeps corridors clear!
      const cx = x + cellW / 2;
      const cy = y + cellH / 2;
      const dotRadius = Math.max(1.5, Math.min(cellW, cellH) * 0.08);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
      ctx.beginPath();
      ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public drawWalls(
    ctx: CanvasRenderingContext2D,
    cellW: number,
    cellH: number
  ): void {
    const x = this.colNum * cellW;
    const y = this.rowNum * cellH;

    if (this.walls.topWall) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + cellW, y);
      ctx.stroke();
    }
    if (this.walls.rightWall) {
      ctx.beginPath();
      ctx.moveTo(x + cellW, y);
      ctx.lineTo(x + cellW, y + cellH);
      ctx.stroke();
    }
    if (this.walls.bottomWall) {
      ctx.beginPath();
      ctx.moveTo(x, y + cellH);
      ctx.lineTo(x + cellW, y + cellH);
      ctx.stroke();
    }
    if (this.walls.leftWall) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + cellH);
      ctx.stroke();
    }
  }

  public show(
    size: number,
    rows: number,
    columns: number,
    ctx: CanvasRenderingContext2D
  ): void {
    const cellW = size / columns;
    const cellH = size / rows;
    this.drawWalls(ctx, cellW, cellH);
  }

  public highlight(
    columns: number,
    ctx: CanvasRenderingContext2D,
    color: string = 'blue',
    shape: string = 'square'
  ): void {
    const size = this.parentSize || 600;
    const cellW = size / columns;
    const x = this.colNum * cellW + cellW / 2;
    const y = this.rowNum * cellW + cellW / 2;
    const radius = Math.max(3, cellW * 0.3);

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    if (shape === 'circle') {
      ctx.arc(x, y, radius, 0, Math.PI * 2);
    } else {
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    }
    ctx.fill();
    ctx.restore();
  }
}
