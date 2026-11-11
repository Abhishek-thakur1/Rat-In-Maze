export const enum State {
  MakingGrid,
  FindingPath,
  Rest,
}

export interface Walls {
  topWall: boolean;
  rightWall: boolean;
  bottomWall: boolean;
  leftWall: boolean;
}

export type SimulationMode =
  | 'GENERATING'
  | 'SOLVING'
  | 'SOLVED'
  | 'NO_PATH'
  | 'PAUSED'
  | 'IDLE';

export type AlgorithmType = 'DFS' | 'BFS';

export type SpeedMode = 'slow' | 'normal' | 'fast' | 'turbo';

export interface MazeStats {
  visitedCount: number;
  pathLength: number;
  stepCount: number;
  percentExplored: number;
  generationTime: number;
  pathfindingTime: number;
}

export interface EngineCallbacks {
  onStateChange?: (state: SimulationMode) => void;
  onStatsChange?: (stats: MazeStats) => void;
  onSolveComplete?: (pathLength: number) => void;
}
