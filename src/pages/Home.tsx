import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-card">
        <div className="hero-badge">
          <span className="hero-badge-dot"></span>
          <span>Version 2.0 • Interactive Visualizer</span>
        </div>

        <div className="hero-header">
          <span className="hero-icon">🧀</span>
          <h1 className="hero-title">Rat In A Maze</h1>
        </div>

        <p className="hero-description">
          An interactive, high-performance algorithm visualizer featuring animated Recursive Backtracking maze generation, Depth-First Search exploration with single-line trailing paths, and Breadth-First Search shortest-path solvers.
        </p>

        <div className="feature-grid">
          <div className="feature-item">
            <span className="feature-emoji">🎲</span>
            <div>
              <h4 className="feature-heading">Randomized DFS</h4>
              <p className="feature-text">Recursive backtracker carving perfect labyrinth corridors.</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-emoji">🧭</span>
            <div>
              <h4 className="feature-heading">Continuous Auto-Find</h4>
              <p className="feature-text">Automated pathfinding animation with real-time trailing neon ribbon.</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-emoji">⚡</span>
            <div>
              <h4 className="feature-heading">Instant &amp; Step Debugger</h4>
              <p className="feature-text">Step through frame-by-frame or resolve the path instantly.</p>
            </div>
          </div>
        </div>

        <button className="btn-hero-launch" onClick={() => navigate('/dfs')}>
          Launch Visualizer <span>→</span>
        </button>
      </div>
    </div>
  );
}
