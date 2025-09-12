// Canvas.tsx
import React, { useRef, useEffect } from 'react';
import { canvas_Render } from './canvasRender';

type CanvasProps = {
  onTimeUpdate?: (data: { generationTime: number; pathfindingTime: number }) => void;
};

const Canvas: React.FC<CanvasProps> = ({ onTimeUpdate }) => {
  const maze = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = maze.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set size once, avoid resetting every frame
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.background = 'black';

    canvas_Render(ctx, canvas, onTimeUpdate);
  }, [onTimeUpdate]);

  return <canvas ref={maze}></canvas>;
};

export default Canvas;
