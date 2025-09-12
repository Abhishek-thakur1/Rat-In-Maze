// canvasRender.ts
import { Maze } from '../maze-generation/dfs/maze';

export const canvas_Render = (
  ctx: CanvasRenderingContext2D,
  mazeCanvas: HTMLCanvasElement,
  onTimeUpdate?: (data: { generationTime: number; pathfindingTime: number }) => void,
) => {
  let newMaze = new Maze(600, 10, 10);

  newMaze.draw(ctx, mazeCanvas).then(() => {
    newMaze.traverse();

    // Report times continuously
    const tick = () => {
      if (onTimeUpdate) {
        onTimeUpdate({
          generationTime: newMaze.generationTime,
          pathfindingTime: newMaze.pathfindingTime,
        });
      }
      requestAnimationFrame(tick);
    };
    tick();
  });

  return newMaze;
};
