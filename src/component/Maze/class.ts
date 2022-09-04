
var current;
export class Maze{
    size: number;
    rows: number;
    columns: number;
    grid: any[];
    stack: any[];
    current: any;

    constructor(size:number, rows:number, columns:number) {
        this.size = size;
        this.rows = rows;
        this.columns = columns;
        this.grid = [];
        this.stack = [];
    }

    //@setup() -> setup Grid on the canvas and draw each individual cell
    setup() {
        for (let r = 0; r < this.rows; r++) {
            let row = []; 
            for (let c = 0; c < this.columns; c++){
                let cell = new Cell(r, c, this.grid, this.size)
                row.push(cell);
            }
            this.grid.push(row);
        }
        current = this.grid[0][0];
    }
}

export class Cell{  
    rowNum: number;
    columnNum: number;
    parentGrid: any[];
    parentSize: number;
    visited: boolean;
    walls: { topWall: boolean; rightWall: boolean; bottomWall: boolean; leftWall: boolean; };

    constructor(rowNum:number, columnNum:number, parentGrid:Array<any>, parentSize:number) {
        this.rowNum = rowNum;
        this.columnNum = columnNum;
        this.parentGrid = parentGrid;
        this.parentSize = parentSize;
        this.visited = false;
        this.walls = {
            topWall: true,
            rightWall: true,
            bottomWall: true,
            leftWall: true
        }
    }

    //Wall drawing functions for each cell. Will be called if relevant wall is set to true in cell constructor
    drawTopWall(x:number, y:number, size:number, columns:number, rows:number): void {

    }
}
