import { Cell } from './cell';
import { Stack, Queue } from '@/data-structure/stack';
import {
  SimulationMode,
  AlgorithmType,
  SpeedMode,
  MazeStats,
  EngineCallbacks,
} from '@/types/types';

export class MazeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private rows: number;
  private cols: number;

  public grid: Cell[][] = [];
  public mode: SimulationMode = 'IDLE';
  public algorithm: AlgorithmType = 'DFS';
  public speed: SpeedMode = 'normal';

  // Maze Generation State
  private genStack: Stack<Cell> = new Stack();
  private genCurrent: Cell | null = null;
  public generationTime: number = 0;
  private genStartTime: number = 0;

  // Maze Solving State
  private solveStack: Stack<Cell> = new Stack();
  private solveQueue: Queue<Cell> = new Queue();
  private solveCurrent: Cell | null = null;
  private solutionPath: Cell[] = [];
  private solutionAnimIndex: number = 0;
  public pathfindingTime: number = 0;
  private solveStartTime: number = 0;

  // Animation & Loop
  private animFrameId: number | null = null;
  private lastStepTimestamp: number = 0;
  private isRunning: boolean = false;
  private stepCount: number = 0;
  private pulsePhase: number = 0;

  // Callbacks
  private callbacks: EngineCallbacks = {};

  constructor(
    canvas: HTMLCanvasElement,
    rows: number = 15,
    cols: number = 15,
    callbacks?: EngineCallbacks
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to obtain 2D rendering context for Canvas.');
    }
    this.ctx = ctx;
    this.rows = rows;
    this.cols = cols;
    this.width = canvas.clientWidth || 600;
    this.height = canvas.clientHeight || 600;
    if (callbacks) {
      this.callbacks = callbacks;
    }

    this.resizeCanvas();
    this.initGrid();
  }

  public resizeCanvas(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    const displayWidth = rect.width > 0 ? rect.width : 600;
    const displayHeight = rect.height > 0 ? rect.height : 600;

    this.width = displayWidth;
    this.height = displayHeight;

    this.canvas.width = Math.floor(displayWidth * dpr);
    this.canvas.height = Math.floor(displayHeight * dpr);

    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  public initGrid(): void {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < this.cols; c++) {
        row.push(new Cell(r, c, this.grid, this.width));
      }
      this.grid.push(row);
    }
    this.stepCount = 0;
    this.solutionPath = [];
    this.solutionAnimIndex = 0;
    this.solveCurrent = null;
    this.genCurrent = null;
    this.generationTime = 0;
    this.pathfindingTime = 0;
  }

  public generateMaze(): void {
    this.initGrid();
    this.genStack.clear();
    this.solveStack.clear();
    this.solveQueue.clear();

    const startCell = this.grid[0][0];
    startCell.visited = true;
    this.genCurrent = startCell;
    this.genStack.push(startCell);

    this.genStartTime = performance.now();
    this.generationTime = 0;
    this.pathfindingTime = 0;
    this.mode = 'GENERATING';
    this.isRunning = true;
    this.notifyState();
    this.notifyStats();
    this.ensureLoop();
  }

  public solveMaze(algo: AlgorithmType = this.algorithm): void {
    // If still generating, complete generation instantly
    if (this.genCurrent !== null || !this.genStack.isEmpty()) {
      while (this.genCurrent !== null || !this.genStack.isEmpty()) {
        this.stepGeneration();
      }
    }

    this.algorithm = algo;
    this.resetSolvingStateOnly();

    const startCell = this.grid[0][0];
    startCell.explored = true;
    startCell.parent = null;
    this.solveCurrent = startCell;

    if (algo === 'DFS') {
      this.solveStack.clear();
      this.solveStack.push(startCell);
    } else {
      this.solveQueue.clear();
      this.solveQueue.enqueue(startCell);
    }

    this.solveStartTime = performance.now();
    this.mode = 'SOLVING';
    this.isRunning = true;
    this.notifyState();
    this.notifyStats();
    this.ensureLoop();
  }

  public resetSolvingStateOnly(): void {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c].resetSolvingState();
      }
    }
    this.solutionPath = [];
    this.solutionAnimIndex = 0;
    this.solveCurrent = null;
    this.stepCount = 0;
    this.pathfindingTime = 0;
  }

  public setGridSize(rows: number, cols: number): void {
    this.rows = rows;
    this.cols = cols;
    this.generateMaze();
  }

  public setSpeed(speed: SpeedMode): void {
    this.speed = speed;
  }

  public setAlgorithm(algo: AlgorithmType): void {
    this.algorithm = algo;
  }

  public togglePlayPause(): void {
    if (this.mode === 'SOLVED' || this.mode === 'NO_PATH') {
      this.solveMaze(this.algorithm);
      return;
    }

    this.isRunning = !this.isRunning;
    if (this.isRunning) {
      if (this.mode === 'PAUSED') {
        this.mode = this.solveCurrent ? 'SOLVING' : 'GENERATING';
      }
      this.notifyState();
      this.ensureLoop();
    } else {
      this.mode = 'PAUSED';
      this.notifyState();
    }
  }

  public autoFindPath(): void {
    // Flush generation if in progress
    if (this.genCurrent !== null || !this.genStack.isEmpty()) {
      while (this.genCurrent !== null || !this.genStack.isEmpty()) {
        this.stepGeneration();
      }
    }

    if (this.mode === 'SOLVED' || this.mode === 'NO_PATH' || !this.solveCurrent) {
      this.solveMaze(this.algorithm);
    } else {
      this.isRunning = true;
      this.mode = 'SOLVING';
      this.notifyState();
      this.notifyStats();
      this.ensureLoop();
    }
  }

  public instantSolve(): void {
    if (this.genCurrent !== null || !this.genStack.isEmpty()) {
      while (this.genCurrent !== null || !this.genStack.isEmpty()) {
        this.stepGeneration();
      }
    }

    this.resetSolvingStateOnly();
    const startCell = this.grid[0][0];
    startCell.explored = true;
    startCell.parent = null;
    this.solveCurrent = startCell;

    if (this.algorithm === 'DFS') {
      this.solveStack.clear();
      this.solveStack.push(startCell);
    } else {
      this.solveQueue.clear();
      this.solveQueue.enqueue(startCell);
    }

    const tStart = performance.now();
    let safetyCounter = 0;
    const maxSteps = this.rows * this.cols * 10;
    while (this.mode !== 'SOLVED' && this.mode !== 'NO_PATH' && safetyCounter < maxSteps) {
      this.stepSolving();
      safetyCounter++;
    }
    this.pathfindingTime = performance.now() - tStart;

    this.solutionAnimIndex = this.solutionPath.length;
    for (const c of this.solutionPath) {
      c.isSolution = true;
    }
    this.isRunning = false;
    this.mode = 'SOLVED';
    this.render();
    this.notifyStats();
    this.notifyState();
  }

  public stepOnce(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.mode = 'PAUSED';
      this.notifyState();
    }

    if (this.mode === 'GENERATING') {
      this.stepGeneration();
    } else if (this.mode === 'SOLVING' || this.mode === 'PAUSED' || this.mode === 'IDLE') {
      this.stepSolving();
    }
    this.render();
    this.notifyStats();
  }

  private stepGeneration(): void {
    if (!this.genCurrent) return;

    this.stepCount++;
    const unvisited = this.genCurrent.getUnvisitedNeighbors(this.grid);

    if (unvisited.length > 0) {
      const next = unvisited[Math.floor(Math.random() * unvisited.length)];
      next.visited = true;
      this.genStack.push(this.genCurrent);
      Cell.removeWalls(this.genCurrent, next);
      this.genCurrent = next;
    } else if (!this.genStack.isEmpty()) {
      this.genCurrent = this.genStack.pop() || null;
    } else {
      // Generation complete! Record time and transition
      this.genCurrent = null;
      if (this.genStartTime > 0) {
        this.generationTime = performance.now() - this.genStartTime;
      }
      this.mode = 'IDLE';
      this.solveMaze(this.algorithm);
    }
  }

  private stepSolving(): void {
    const targetCell = this.grid[this.rows - 1][this.cols - 1];

    if (this.algorithm === 'DFS') {
      if (this.solveStack.isEmpty()) {
        this.mode = 'NO_PATH';
        this.isRunning = false;
        this.notifyState();
        return;
      }

      const current = this.solveStack.pop()!;
      this.solveCurrent = current;
      current.explored = true;
      this.stepCount++;

      if (current === targetCell) {
        this.reconstructSolution(targetCell);
        return;
      }

      const accessible = current.getAccessibleNeighbors(this.grid);
      for (const neighbor of accessible) {
        if (!neighbor.explored) {
          neighbor.parent = current;
          neighbor.inPath = true;
          this.solveStack.push(neighbor);
        }
      }
    } else {
      // BFS wavefront
      if (this.solveQueue.isEmpty()) {
        this.mode = 'NO_PATH';
        this.isRunning = false;
        this.notifyState();
        return;
      }

      const current = this.solveQueue.dequeue()!;
      this.solveCurrent = current;
      current.explored = true;
      this.stepCount++;

      if (current === targetCell) {
        this.reconstructSolution(targetCell);
        return;
      }

      const accessible = current.getAccessibleNeighbors(this.grid);
      for (const neighbor of accessible) {
        if (!neighbor.explored && !neighbor.parent && neighbor !== this.grid[0][0]) {
          neighbor.parent = current;
          neighbor.explored = true;
          this.solveQueue.enqueue(neighbor);
        }
      }
    }
  }

  private reconstructSolution(target: Cell): void {
    if (this.solveStartTime > 0) {
      this.pathfindingTime = performance.now() - this.solveStartTime;
    }
    const path: Cell[] = [];
    let curr: Cell | null = target;

    while (curr) {
      path.push(curr);
      curr = curr.parent;
    }

    path.reverse();
    this.solutionPath = path;
    this.solutionAnimIndex = 0;
    this.mode = 'SOLVED';
    this.isRunning = true; // Animate path reveal

    this.notifyState();
    this.callbacks.onSolveComplete?.(path.length);
  }

  private loop = (timestamp: number): void => {
    this.animFrameId = null;
    this.pulsePhase = (timestamp / 200) % (Math.PI * 2);

    if (this.isRunning) {
      let interval = 16;
      let stepsPerFrame = 1;

      switch (this.speed) {
        case 'slow':
          interval = 55;
          stepsPerFrame = 1;
          break;
        case 'normal':
          interval = 18;
          stepsPerFrame = 1;
          break;
        case 'fast':
          interval = 0;
          stepsPerFrame = 1;
          break;
        case 'turbo':
          interval = 0;
          stepsPerFrame = Math.max(3, Math.floor((this.rows * this.cols) / 25));
          break;
      }

      if (timestamp - this.lastStepTimestamp >= interval) {
        this.lastStepTimestamp = timestamp;

        if (this.mode === 'SOLVED') {
          if (this.solutionAnimIndex < this.solutionPath.length) {
            const count = this.speed === 'turbo' ? 4 : 1;
            for (let i = 0; i < count && this.solutionAnimIndex < this.solutionPath.length; i++) {
              this.solutionPath[this.solutionAnimIndex].isSolution = true;
              this.solutionAnimIndex++;
            }
          } else {
            this.isRunning = false;
            this.notifyState();
          }
        } else {
          for (let s = 0; s < stepsPerFrame; s++) {
            if (this.mode === 'GENERATING') {
              this.stepGeneration();
            } else if (this.mode === 'SOLVING') {
              this.stepSolving();
            }
            if (!this.isRunning) break;
          }
        }

        this.notifyStats();
      }
    }

    this.render();

    if (
      this.isRunning ||
      this.mode === 'SOLVING' ||
      this.mode === 'GENERATING' ||
      this.mode === 'SOLVED' ||
      this.mode === 'PAUSED'
    ) {
      this.animFrameId = window.requestAnimationFrame(this.loop);
    }
  };

  private ensureLoop(): void {
    if (this.animFrameId === null) {
      this.animFrameId = window.requestAnimationFrame(this.loop);
    }
  }

  public render(): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cellW = w / this.cols;
    const cellH = h / this.rows;

    // 1. Clear background with obsidian gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0a0f1d');
    bgGrad.addColorStop(1, '#05070f');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Render cell subtle highlights & breadcrumbs (NO opaque blocks)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const isStart = r === 0 && c === 0;
        const isTarget = r === this.rows - 1 && c === this.cols - 1;
        this.grid[r][c].drawBackground(ctx, cellW, cellH, isStart, isTarget);
      }
    }

    // 3. Draw generation active head highlight
    if (this.mode === 'GENERATING' && this.genCurrent) {
      const gx = this.genCurrent.colNum * cellW;
      const gy = this.genCurrent.rowNum * cellH;
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 12;
      ctx.fillRect(gx + 2, gy + 2, cellW - 4, cellH - 4);
      ctx.shadowBlur = 0;
    }

    // 4. Draw active single trailing line of the Rat while exploring
    if ((this.mode === 'SOLVING' || this.mode === 'PAUSED') && this.solveCurrent) {
      const activeTrail: Cell[] = [];
      let curr: Cell | null = this.solveCurrent;
      while (curr) {
        activeTrail.push(curr);
        curr = curr.parent;
      }
      activeTrail.reverse();

      if (activeTrail.length > 1) {
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < activeTrail.length; i++) {
          const cell = activeTrail[i];
          const cx = cell.colNum * cellW + cellW / 2;
          const cy = cell.rowNum * cellH + cellH / 2;
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.strokeStyle = '#06b6d4'; // Glowing cyan trailing line
        ctx.lineWidth = Math.max(3, cellW * 0.22);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }
    }

    // 5. Draw continuous glowing ribbon for solution path when solved
    if (this.solutionPath.length > 1) {
      ctx.save();
      ctx.beginPath();
      const revealedLength = Math.min(this.solutionAnimIndex, this.solutionPath.length);
      for (let i = 0; i < revealedLength; i++) {
        const cell = this.solutionPath[i];
        const cx = cell.colNum * cellW + cellW / 2;
        const cy = cell.rowNum * cellH + cellH / 2;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.strokeStyle = '#f59e0b'; // Radiant golden solved ribbon
      ctx.lineWidth = Math.max(3.5, cellW * 0.26);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 16;
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw crisp high-contrast walls (Slate-400)
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c].drawWalls(ctx, cellW, cellH);
      }
    }
    // Outer maze neon border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);
    ctx.restore();

    // 7. Draw Start indicator (Green beacon)
    ctx.save();
    const startX = cellW / 2;
    const startY = cellH / 2;
    const startRadius = Math.max(4, Math.min(cellW, cellH) * 0.3);
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(startX, startY, startRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 8. Draw Target indicator (Cheese 🧀 / Golden diamond with pulse)
    ctx.save();
    const targetX = (this.cols - 1) * cellW + cellW / 2;
    const targetY = (this.rows - 1) * cellH + cellH / 2;
    const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.15;
    const targetRadius = Math.max(4, Math.min(cellW, cellH) * 0.32) * pulseScale;

    ctx.fillStyle = '#eab308';
    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(targetX, targetY, targetRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 9. Draw the Rat marker (when solving or paused)
    if (this.solveCurrent && (this.mode === 'SOLVING' || this.mode === 'PAUSED')) {
      const ratX = this.solveCurrent.colNum * cellW + cellW / 2;
      const ratY = this.solveCurrent.rowNum * cellH + cellH / 2;
      const ratRadius = Math.max(5, Math.min(cellW, cellH) * 0.35);

      ctx.save();
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(ratX, ratY, ratRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ratX - ratRadius * 0.3, ratY - ratRadius * 0.25, ratRadius * 0.22, 0, Math.PI * 2);
      ctx.arc(ratX + ratRadius * 0.3, ratY - ratRadius * 0.25, ratRadius * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private notifyState(): void {
    this.callbacks.onStateChange?.(this.mode);
  }

  private notifyStats(): void {
    let visitedCount = 0;
    const totalCells = this.rows * this.cols;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c].explored || this.grid[r][c].visited) {
          visitedCount++;
        }
      }
    }

    const stats: MazeStats = {
      visitedCount,
      pathLength: this.solutionPath.length,
      stepCount: this.stepCount,
      percentExplored: Math.round((visitedCount / totalCells) * 100),
      generationTime: this.generationTime,
      pathfindingTime: this.pathfindingTime,
    };

    this.callbacks.onStatsChange?.(stats);
  }

  public destroy(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      window.cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }
}
