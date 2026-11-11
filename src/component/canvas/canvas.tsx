import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MazeEngine } from '../maze-generation/dfs/MazeEngine';
import { SimulationMode, AlgorithmType, SpeedMode, MazeStats } from '@/types/types';

type CanvasProps = {
  onTimeUpdate?: (data: { generationTime: number; pathfindingTime: number }) => void;
};

const Canvas: React.FC<CanvasProps> = ({ onTimeUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MazeEngine | null>(null);

  const [mode, setMode] = useState<SimulationMode>('GENERATING');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('DFS');
  const [speed, setSpeed] = useState<SpeedMode>('normal');
  const [gridSize, setGridSize] = useState<number>(15);
  const [stats, setStats] = useState<MazeStats>({
    visitedCount: 0,
    pathLength: 0,
    stepCount: 0,
    percentExplored: 0,
    generationTime: 0,
    pathfindingTime: 0,
  });

  // Sync speed changes to engine
  useEffect(() => {
    engineRef.current?.setSpeed(speed);
  }, [speed]);

  // Sync algorithm changes to engine
  useEffect(() => {
    engineRef.current?.setAlgorithm(algorithm);
  }, [algorithm]);

  // Initialize Maze Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new MazeEngine(canvasRef.current, gridSize, gridSize, {
      onStateChange: (newMode) => setMode(newMode),
      onStatsChange: (newStats) => {
        setStats(newStats);
        if (onTimeUpdate) {
          onTimeUpdate({
            generationTime: newStats.generationTime,
            pathfindingTime: newStats.pathfindingTime,
          });
        }
      },
    });

    engineRef.current = engine;
    engine.setAlgorithm(algorithm);
    engine.setSpeed(speed);
    engine.generateMaze();

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resizeCanvas();
        engineRef.current.render();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSize]);

  const handleSpeedChange = (newSpeed: SpeedMode) => {
    setSpeed(newSpeed);
  };

  const handleAlgorithmChange = (newAlgo: AlgorithmType) => {
    setAlgorithm(newAlgo);
    if (mode === 'SOLVED' || mode === 'PAUSED' || mode === 'IDLE') {
      engineRef.current?.solveMaze(newAlgo);
    }
  };

  const handlePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
  }, []);

  const handleAutoFind = useCallback(() => {
    engineRef.current?.autoFindPath();
  }, []);

  const handleInstantSolve = useCallback(() => {
    engineRef.current?.instantSolve();
  }, []);

  const handleStep = useCallback(() => {
    engineRef.current?.stepOnce();
  }, []);

  const handleNewMaze = useCallback(() => {
    engineRef.current?.generateMaze();
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'KeyA':
          e.preventDefault();
          handleAutoFind();
          break;
        case 'KeyI':
          e.preventDefault();
          handleInstantSolve();
          break;
        case 'KeyN':
          e.preventDefault();
          handleNewMaze();
          break;
        case 'KeyS':
          e.preventDefault();
          handleStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleAutoFind, handleInstantSolve, handleNewMaze, handleStep]);

  const getStatusBadge = () => {
    switch (mode) {
      case 'GENERATING':
        return { label: 'Generating Maze...', color: 'status-generating' };
      case 'SOLVING':
        return { label: `Finding Path (${algorithm})...`, color: 'status-solving' };
      case 'SOLVED':
        return { label: 'Cheese Reached! Solved 🎉', color: 'status-solved' };
      case 'PAUSED':
        return { label: 'Paused', color: 'status-paused' };
      case 'NO_PATH':
        return { label: 'No Path Found', color: 'status-nopath' };
      default:
        return { label: 'Ready', color: 'status-idle' };
    }
  };

  const statusInfo = getStatusBadge();

  return (
    <div className="maze-container">
      {/* Header & Live HUD */}
      <header className="maze-header">
        <div className="title-area">
          <div className="title-row">
            <span className="logo-icon">🧀</span>
            <h1 className="maze-title">Rat In A Maze</h1>
            <span className={`status-pill ${statusInfo.color}`}>
              <span className="status-dot"></span>
              {statusInfo.label}
            </span>
          </div>
          <p className="maze-subtitle">
            Interactive Recursive Backtracking Generator &amp; Animated Pathfinding Visualizer
          </p>
        </div>

        {/* Live Metrics HUD */}
        <div className="metrics-bar">
          <div className="metric-card">
            <span className="metric-label">Grid Size</span>
            <span className="metric-value">{gridSize} × {gridSize}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Explored Cells</span>
            <span className="metric-value">
              {stats.visitedCount} <span className="metric-sub">({stats.percentExplored}%)</span>
            </span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Step Count</span>
            <span className="metric-value">{stats.stepCount}</span>
          </div>
          <div className="metric-card highlight-card">
            <span className="metric-label">Path Length</span>
            <span className="metric-value">
              {stats.pathLength > 0 ? `${stats.pathLength} cells` : '—'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Visualizer Body */}
      <main className="maze-workspace">
        {/* Canvas Frame */}
        <div className="canvas-wrapper">
          <div className="canvas-glow-frame">
            <canvas ref={canvasRef} className="maze-canvas" width={600} height={600} />
          </div>
        </div>

        {/* Controls Sidebar */}
        <aside className="controls-panel">
          {/* Primary Action Buttons */}
          <div className="controls-section">
            <h3 className="section-title">Playback Controls</h3>

            {/* Auto-Find Path Button (Continuous search without stepping) */}
            <button
              className={`btn btn-auto-find ${mode === 'SOLVING' ? 'running' : ''}`}
              onClick={handleAutoFind}
              title="Automatically finds path continuously without stepping (Press A)"
            >
              <span className="btn-icon">{mode === 'SOLVING' ? '⚡' : '🚀'}</span>
              {mode === 'SOLVING' ? 'Finding Path Continuously...' : 'Auto-Find Path'}
            </button>

            <div className="button-group primary-actions">
              <button
                className={`btn btn-primary ${mode === 'SOLVING' || mode === 'GENERATING' ? 'active' : ''}`}
                onClick={handlePlayPause}
                title="Spacebar"
              >
                {mode === 'SOLVING' || mode === 'GENERATING' ? (
                  <>
                    <span className="btn-icon">⏸</span> Pause
                  </>
                ) : (
                  <>
                    <span className="btn-icon">▶</span> Resume
                  </>
                )}
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleStep}
                disabled={mode === 'SOLVED'}
                title="Single step forward (Press S)"
              >
                <span className="btn-icon">⏭</span> Step
              </button>

              <button
                className="btn btn-instant"
                onClick={handleInstantSolve}
                title="Instant solve (Press I)"
              >
                <span className="btn-icon">⚡</span> Instant
              </button>

              <button
                className="btn btn-accent"
                onClick={handleNewMaze}
                title="Generate new random maze (Press N)"
              >
                <span className="btn-icon">🎲</span> New Maze
              </button>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="controls-section">
            <h3 className="section-title">Solving Algorithm</h3>
            <div className="segmented-control">
              <button
                className={`segment-btn ${algorithm === 'DFS' ? 'selected' : ''}`}
                onClick={() => handleAlgorithmChange('DFS')}
              >
                DFS (Rat Explorer)
              </button>
              <button
                className={`segment-btn ${algorithm === 'BFS' ? 'selected' : ''}`}
                onClick={() => handleAlgorithmChange('BFS')}
              >
                BFS (Shortest Path)
              </button>
            </div>
          </div>

          {/* Maze Dimensions */}
          <div className="controls-section">
            <h3 className="section-title">Maze Dimensions</h3>
            <div className="size-selector">
              {[10, 15, 20, 25].map((size) => (
                <button
                  key={size}
                  className={`chip-btn ${gridSize === size ? 'selected' : ''}`}
                  onClick={() => setGridSize(size)}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Speed Selection */}
          <div className="controls-section">
            <h3 className="section-title">Simulation Speed</h3>
            <div className="speed-selector">
              {(['slow', 'normal', 'fast', 'turbo'] as SpeedMode[]).map((spd) => (
                <button
                  key={spd}
                  className={`chip-btn ${speed === spd ? 'selected' : ''}`}
                  onClick={() => handleSpeedChange(spd)}
                >
                  {spd.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Legend */}
          <div className="controls-section">
            <h3 className="section-title">Legend</h3>
            <ul className="legend-list">
              <li className="legend-item">
                <span className="legend-swatch swatch-start"></span>
                <span className="legend-text">Start Position (0, 0)</span>
              </li>
              <li className="legend-item">
                <span className="legend-swatch swatch-target"></span>
                <span className="legend-text">Target / Cheese (Exit)</span>
              </li>
              <li className="legend-item">
                <span className="legend-swatch swatch-rat"></span>
                <span className="legend-text">Rat Agent (Head)</span>
              </li>
              <li className="legend-item">
                <span className="legend-swatch swatch-trail"></span>
                <span className="legend-text">Active Trailing Line</span>
              </li>
              <li className="legend-item">
                <span className="legend-swatch swatch-solution"></span>
                <span className="legend-text">Optimal Solution Path</span>
              </li>
            </ul>
          </div>

          {/* Hotkey Guide */}
          <div className="hotkeys-hint">
            <span>⌨️ Hotkeys:</span> <code>A</code> Auto-Find • <code>I</code> Instant • <code>Space</code> Pause/Resume • <code>S</code> Step • <code>N</code> New Maze
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Canvas;
