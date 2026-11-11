import React, { useState } from 'react';
import Canvas from '@/component/canvas/canvas';
import { formatTime } from '@/utils/timeUtils';
import { useNavigate } from 'react-router-dom';

export default function DFS() {
  const [times, setTimes] = useState({ generationTime: 0, pathfindingTime: 0 });
  const navigate = useNavigate();

  return (
    <div className="dfs-page-wrapper">
      <nav className="dfs-top-nav">
        <button className="btn-nav-back" onClick={() => navigate('/')}>
          ← Home
        </button>
        <div className="time-badge">
          <span>⚡ Gen: {formatTime(times.generationTime)}</span>
          <span className="dot-divider">•</span>
          <span>🧭 Path: {formatTime(times.pathfindingTime)}</span>
        </div>
      </nav>
      <Canvas onTimeUpdate={setTimes} />
    </div>
  );
}
