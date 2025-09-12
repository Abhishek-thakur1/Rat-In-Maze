import { Walls } from '@/types/types';

export class Cell {
  rowNum: number;
  parentGrid: any[];
  parentSize: number;
  visited: boolean;
  walls: Walls;
  colNum: number;

  constructor(rowNum: number, columnNum: number, parentGrid: Array<any>, parentSize: number) {
    this.rowNum = rowNum;
    this.colNum = columnNum;
    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
    this.visited = false;
    this.walls = {
      topWall: true,
      rightWall: true,
      bottomWall: true,
      leftWall: true,
    };

    this.parentGrid = parentGrid;
    this.parentSize = parentSize;
  }

  get neighbors(): Cell[] {
    const [row, col] = [this.rowNum, this.colNum];
    const grid = this.parentGrid;

    const top = row !== 0 ? grid[row - 1][col] : null;
    const right = col !== grid.length - 1 ? grid[row][col + 1] : null;
    const bottom = row !== grid.length - 1 ? grid[row + 1][col] : null;
    const left = col !== 0 ? grid[row][col - 1] : null;

    const neighbors: Cell[] = [];
    if (!this.walls.topWall) neighbors.push(top);
    if (!this.walls.rightWall) neighbors.push(right);
    if (!this.walls.leftWall) neighbors.push(left);
    if (!this.walls.bottomWall) neighbors.push(bottom);

    return neighbors;
  }

  checkNeighbours() {
    let grid = this.parentGrid;
    let row = this.rowNum;
    let col = this.colNum;
    let neighbours = [];

    // The following lines push all available neighbors to the neighbors array
    // undefined is returned where the index is out of bounds (...edge cases)
    let top = row !== 0 ? grid[row - 1][col] : undefined;
    let right = col !== grid.length - 1 ? grid[row][col + 1] : undefined;
    let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
    let left = col !== 0 ? grid[row][col - 1] : undefined;

    // if the following are not 'undefined' then push them to the neighbours array
    if (top && !top.visited) neighbours.push(top);
    if (right && !right.visited) neighbours.push(right);
    if (bottom && !bottom.visited) neighbours.push(bottom);
    if (left && !left.visited) neighbours.push(left);

    // Choose a random neighbour from the neighbours array
    if (neighbours.length !== 0) {
      let random = Math.floor(Math.random() * neighbours.length);
      return neighbours[random];
    } else {
      return undefined;
    }
  }

  //Wall drawing functions for each cell. Will be called if relevant wall is set to true in cell constructor
  drawTopWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number,
    ctx: CanvasRenderingContext2D,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size / columns, y);
    ctx.stroke();
  }

  drawRightWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number,
    ctx: CanvasRenderingContext2D,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + size / columns, y);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawBottomWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number,
    ctx: CanvasRenderingContext2D,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x, y + size / rows);
    ctx.lineTo(x + size / columns, y + size / rows);
    ctx.stroke();
  }

  drawLeftWall(
    x: number,
    y: number,
    size: number,
    columns: number,
    rows: number,
    ctx: CanvasRenderingContext2D,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size / rows);
    ctx.stroke();
  }

  /**
   * @param columns Total number of columns in grid
   * @param ctx The canvas ctx
   */
  // Highlights the current cell on the grid. Columns is once again passed in to set the size of the grid.
  // highlight(columns: number, ctx: CanvasRenderingContext2D, color: string = 'blue') {
  //   // Additions and subtractions added so the highlighted cell does cover the walls
  //   let x = (this.colNum * this.parentSize) / columns + 1;
  //   let y = (this.rowNum * this.parentSize) / columns + 1;
  //   ctx.fillStyle = color;
  //   ctx.fillRect(x, y, this.parentSize / columns - 3, this.parentSize / columns - 3);
  // }

  highlight(
    cols: number,
    ctx: CanvasRenderingContext2D,
    color = 'red',
    mode: 'fill' | 'circle' | 'trail' = 'fill',
  ) {
    const w = ctx.canvas.width / cols;
    const x = this.colNum * w;
    const y = this.rowNum * w;

    if (mode === 'fill') {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, w);
    } else if (mode === 'circle') {
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(x + w / 2, y + w / 2, w * 0.1, 0, Math.PI * 2); // radius = 30% of cell
      ctx.fill();
    } else if (mode === 'trail') {
      ctx.strokeStyle = color;
      ctx.lineWidth = w * 0.3; // thickness of the trail
      ctx.lineCap = 'round'; // smooth line ends
      ctx.lineJoin = 'round'; // smooth corners
      ctx.beginPath();

      const cx = x + w / 2;
      const cy = y + w / 2;

      if ((this as any).prevCell) {
        const prev = (this as any).prevCell as Cell;
        const px = prev.colNum * w + w / 2;
        const py = prev.rowNum * w + w / 2;

        // shared wall midpoint
        let mx = cx;
        let my = cy;

        if (prev.colNum < this.colNum) {
          mx = x;
          my = cy; // came from left
        } else if (prev.colNum > this.colNum) {
          mx = x + w;
          my = cy; // came from right
        } else if (prev.rowNum < this.rowNum) {
          mx = cx;
          my = y; // came from top
        } else if (prev.rowNum > this.rowNum) {
          mx = cx;
          my = y + w; // came from bottom
        }

        // 2-step path: prev → midpoint → current
        ctx.moveTo(px, py);
        ctx.lineTo(mx, my);
        ctx.lineTo(cx, cy);
      } else {
        ctx.moveTo(cx, cy); // starting point
      }

      ctx.stroke();
    }
  }

  removeWalls(cell1: any, cell2: any) {
    // compares to two cells on x axis
    let x = cell1.colNum - cell2.colNum;
    // Removes the relevant walls if there is a different on x axis
    if (x === 1) {
      cell1.walls.leftWall = false;
      cell2.walls.rightWall = false;
    } else if (x === -1) {
      cell1.walls.rightWall = false;
      cell2.walls.leftWall = false;
    }
    // compares to two cells on x axis
    let y = cell1.rowNum - cell2.rowNum;
    // Removes the relevant walls if there is a different on y axis
    if (y === 1) {
      cell1.walls.topWall = false;
      cell2.walls.bottomWall = false;
    } else if (y === -1) {
      cell1.walls.bottomWall = false;
      cell2.walls.topWall = false;
    }
  }

  // Draws each of the cells on the maze canvas
  show(size: number, rows: number, columns: number, ctx: CanvasRenderingContext2D): void {
    let x = (this.colNum * size) / columns;
    let y = (this.rowNum * size) / rows;

    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = 'black';
    ctx.lineWidth = 2;

    if (this.walls.topWall) this.drawTopWall(x, y, size, columns, rows, ctx);
    if (this.walls.rightWall) this.drawRightWall(x, y, size, columns, rows, ctx);
    if (this.walls.bottomWall) this.drawBottomWall(x, y, size, columns, rows, ctx);
    if (this.walls.leftWall) this.drawLeftWall(x, y, size, columns, rows, ctx);
    if (this.visited) {
      ctx.fillRect(x + 1, y + 1, size / columns - 2, size / rows - 2);
    }
  }
  hasWallBetween(other: Cell): boolean {
    if (this.rowNum === other.rowNum) {
      if (this.colNum === other.colNum + 1) return this.walls.leftWall || other.walls.rightWall;
      if (this.colNum === other.colNum - 1) return this.walls.rightWall || other.walls.leftWall;
    }
    if (this.colNum === other.colNum) {
      if (this.rowNum === other.rowNum + 1) return this.walls.topWall || other.walls.bottomWall;
      if (this.rowNum === other.rowNum - 1) return this.walls.bottomWall || other.walls.topWall;
    }
    return true; // not neighbors
  }
  highlightTrail(cols: number, ctx: CanvasRenderingContext2D, prev?: Cell, color = 'green') {
    const w = ctx.canvas.width / cols;
    const cx = this.colNum * w + w / 2;
    const cy = this.rowNum * w + w / 2;

    ctx.strokeStyle = color;
    ctx.lineWidth = w * 0.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (prev) {
      ctx.lineTo(cx, cy); // extend line from previous cell
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy); // start at the first cell
    }
  }
}
