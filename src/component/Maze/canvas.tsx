import React, { useRef, useEffect } from "react";
import { canvas_Render } from "./canvasRender";

const Canvas = () => {
  const maze = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = maze.current;
    let ctx = (canvas as unknown as HTMLCanvasElement).getContext("2d");

    canvas_Render(ctx, canvas);
  }, []);

  return <canvas ref={maze}></canvas>;
};

export default Canvas;
