import { Stack } from '@/data-structure/stack';
import { Cell } from './cell';
import { State } from '@/types/types';

export class MazeGenerator {
  private readonly grid: Cell[][];
  private readonly stack: Stack<Cell>;
  private current: Cell;
  private readonly size: number;
  private readonly rows: number;
  private readonly columns: number;
  public steps: { cell: Cell; action: 'visit' | 'backtrack' }[] = [];
  constructor(grid: Cell[][], size: number, rows: number, columns: number) {
    this.grid = grid;
    this.size = size;
    this.rows = rows;
    this.columns = columns;
    this.stack = new Stack<Cell>();
    this.current = this.grid[0][0];
  }

  public generationTime: number = 0;
  private startTime: number = performance.now();

  renderMakeGrid(ctx: CanvasRenderingContext2D, maze: HTMLCanvasElement): State {
    // Set the first cell as visited
    this.current.visited = true;
    this.steps.push({ cell: this.current, action: 'visit' });

    // Loop through the 2d grid array and call the show method for each cell instance
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.columns; c++) {
        let grid = this.grid;
        grid[r][c].show(this.size, this.rows, this.columns, ctx);
      }
    }

    // This function will assign the variable 'next' to random cell out of the current cells available neighboring cells
    let next = this.current.checkNeighbours();
    // this.current.show(this.size, this.rows, this.columns, ctx); // draw only current cell
    // if (next) next.show(this.size, this.rows, this.columns, ctx);

    // If there is a non visited neighbor cell
    if (next) {
      next.visited = true;
      // Add the current cell to the stack for backtracking
      this.stack.push(this.current);
      // this function will highlight the current cell on the grid. The parameter columns is passed
      // in order to set the size of the cell
      this.current.highlight(this.columns, ctx);
      // This function compares the current cell to the next cell and removes the relevant walls for each cell
      this.current.removeWalls(this.current, next);
      // Set the next cell to the current cell
      this.current = next;

      // Else if there are no available neighbours start backtracking using the stack
    } else if (this.stack.length > 0) {
      let cell = this.stack.pop();
      this.current = cell;
      this.steps.push({ cell, action: 'backtrack' });
      this.current.highlight(this.columns, ctx);
    }

    // If no more items in the stack then all cells have been visited and the function can be exited
    if (this.stack.length === 0) {
      this.generationTime = performance.now() - this.startTime;
      return State.FindingPath;
    }
    if (this.generationTime === 0 && this.stack.length === 0) {
    }

    return State.MakingGrid;
  }
}
