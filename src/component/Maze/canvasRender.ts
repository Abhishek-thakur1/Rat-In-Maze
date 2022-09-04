import {Maze} from './class'

export const canvas_Render = (ctx: CanvasRenderingContext2D) => {
    let newMaze = new Maze(500, 10, 10)
    newMaze.setup()
    console.log(newMaze)
    
}