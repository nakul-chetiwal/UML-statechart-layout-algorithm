// src/components/Sidebar.js

import React from 'react';

function Sidebar({ measurement }) {
    return (
        <div className="bg-light p-3" style={{ width: '250px' }}>
            <h3>Results</h3>
            <p>Rudimentary Occlusions Count: {measurement.rudimentaryOcclusionCount}</p>
            <p>QuadTree Occlusions Count: {measurement.quadtreeOcclusionCount}</p>
        </div>
    );
}

export default Sidebar;
