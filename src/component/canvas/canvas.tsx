import React, { useRef, useEffect } from 'react';
import { canvas_Render } from './canvasRender';

const Canvas = () => {
  const maze = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = maze.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set size once, avoid resetting every frame
    canvas.width = 600; // you can make this dynamic
    canvas.height = 600;
    canvas.style.background = 'black';

    canvas_Render(ctx, canvas);
  }, []);

  return <canvas ref={maze}></canvas>;
};

export default Canvas;
