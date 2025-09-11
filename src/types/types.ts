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
