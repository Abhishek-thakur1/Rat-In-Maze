import { MutableRefObject } from 'react';
import {Maze} from './class'

export const canvas_Render = (ctx: CanvasRenderingContext2D, maze: any) => {
    let newMaze = new Maze(500, 20, 20)
    newMaze.setup()
    newMaze.draw(ctx, maze);
    console.log(newMaze)
    
}