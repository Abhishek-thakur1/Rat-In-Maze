import { Maze } from './class'

export const canvas_Render = (ctx: CanvasRenderingContext2D, mazeCanvas: HTMLCanvasElement) => {
    let newMaze = new Maze(600, 15, 15)
    newMaze.draw(ctx, mazeCanvas).then(newMaze.traverse);
    console.log(newMaze)

}