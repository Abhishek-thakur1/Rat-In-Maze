// DFS.tsx
import Canvas from '@/component/canvas/canvas';
import { formatTime, } from '@/utils/timeUtils';
import React, { useState } from 'react';

export default function DFS() {
    const [times, setTimes] = useState({ generationTime: 0, pathfindingTime: 0 });

    return (
        <div>
            <Canvas onTimeUpdate={setTimes} />
            <div style={{ color: 'blue', marginTop: '10px' }}>
                <p>Generation Time: {formatTime(times.generationTime)}</p>
                <p>Pathfinding Time: {formatTime(times.pathfindingTime)}</p>
            </div>
        </div>
    );
}
