import { Stack } from '@/data-structure/stack';
import { Cell } from './cell';
import { MazeGenerator } from './mazeGeneratorDFS';
import { State } from '@/types/types';
import { Rat } from '@/component/pathfinding/dfs/ratDFS';
import gsap from 'gsap';

export class Maze {
  size: number;
  rows: number;
  columns: number;
  private readonly grid: Cell[][] = [];
  stack: Stack<Cell>;
  current: Cell;
  currentState: State = State.MakingGrid;
  rat: Rat;
  private mazeGenerator: MazeGenerator;

  constructor(size: number, rows: number, columns: number) {
    this.size = size;
    this.rows = rows;
    this.columns = columns;
    this.stack = new Stack<Cell>();
    this.initGrid();

    this.rat = new Rat(this.grid);
    this.mazeGenerator = new MazeGenerator(this.grid, size, rows, columns);
  }
  get generationTime(): number {
    return this.mazeGenerator.generationTime;
  }

  get pathfindingTime(): number {
    return this.rat.pathfindingTime;
  }
  //@setup() -> setup Grid on the canvas and draw each individual cell
  initGrid() {
    for (let r = 0; r < this.rows; r++) {
      let row = [];
      for (let c = 0; c < this.columns; c++) {
        let cell = new Cell(r, c, this.grid, this.size);
        row.push(cell);
      }
      this.grid.push(row);
    }
  }

  renderPathFind(ctx: CanvasRenderingContext2D, maze: HTMLCanvasElement) {
    this.rat.step();
    this.rat.draw(ctx);
  }

  renderMakeGrid(ctx: CanvasRenderingContext2D, maze: HTMLCanvasElement) {
    this.currentState = this.mazeGenerator.renderMakeGrid(ctx, maze);
  }

  draw_utils(ctx: CanvasRenderingContext2D, maze: HTMLCanvasElement) {
    const step = () => {
      maze.width = this.size;
      maze.height = this.size;
      maze.style.background = 'black';

      if (this.currentState === State.MakingGrid) {
        this.renderMakeGrid(ctx, maze);
      } else {
        this.renderPathFind(ctx, maze);
      }

      window.requestAnimationFrame(step);
    };

    // Recursively call the draw function. This will be called up until the stack is empty
    // window.requestAnimationFrame(() => {
    //   this.draw_utils(ctx, maze);
    // });
    step();
  }

  // Draw the canvas by setting the size and placing the cells in the grid array on the canvas.
  draw(ctx: CanvasRenderingContext2D, maze: HTMLCanvasElement): Promise<any> {
    return new Promise<any>((_resolve, _reject): void => {
      _resolve(this.draw_utils(ctx, maze));
    });
  }

  traverse() {
    // while (true) {
    //     current = this.stack.top();
    // }
    console.log('Callback! Successful...');
  }
}
