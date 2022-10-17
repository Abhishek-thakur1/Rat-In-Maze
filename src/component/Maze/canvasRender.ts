import { MutableRefObject } from 'react';
import {Maze} from './class'

export const canvas_Render = (ctx: CanvasRenderingContext2D, maze: any) => {
    let newMaze = new Maze(600, 15, 15)
    newMaze.setup()
    newMaze.draw(ctx, maze).then(newMaze.traverse);
    console.log(newMaze)
    
}