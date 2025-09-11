import { Cell } from '@/component/maze-generation/dfs/cell';
import { Stack } from '@/data-structure/stack';

export class Rat {
  private readonly grid: Cell[][];
  private currentCell: Cell;
  private visitedCells: Set<Cell> = new Set();
  private cellStack: Stack<Cell> = new Stack();
  private path: Cell[] = [];

  constructor(grid: Cell[][]) {
    this.grid = grid;
    this.currentCell = this.grid[0][0];
    this.cellStack.push(this.currentCell);
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

  step() {
    this.path.push(this.currentCell);
    const n = this.grid.length;

    if (this.currentCell === this.grid[n - 1][n - 1]) {
      return;
    }

    const nextCell = this.cellStack.pop();
    if (!nextCell) return;

    this.currentCell = nextCell;

    this.visitedCells.add(this.currentCell);
    const unvisitedNeighbors = this.currentCell.neighbors.filter(
      (cell) => !this.visitedCells.has(cell),
    );
    this.cellStack.push(...unvisitedNeighbors);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.showGrid(ctx);
    this.currentCell.highlight(this.grid[0].length, ctx);
    this.path.forEach((cell) => {
      cell.highlight(this.grid[0].length, ctx, '#1289A7');
    });
  }
}
