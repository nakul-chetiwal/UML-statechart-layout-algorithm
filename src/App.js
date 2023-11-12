// src/App.js

import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import Canvas from './components/Canvas';

function App() {
    const [containerHeight, setContainerHeight] = useState(0);

    const updateContainerHeight = (height) => {
        setContainerHeight(height);
    };

    const [measurement, setMeasurement] = useState({
        rudimentaryOcclusionCount: 0,
        quadtreeOcclusionCount: 0,
        edgeCrossingCount: 0
    });

    const [cy, setCy] = useState(null);

    const [highlightRectangles, setHighlightRectangles] = useState(false);

    const toggleHighlight = () => {
        setHighlightRectangles(!highlightRectangles);
    };


    return (
        <div className="d-flex flex-column h-100">
            <Header />
            <div className="d-flex flex-row flex-grow-1">
                <LeftSidebar
                    cy={cy}
                    containerHeight={containerHeight}
                    measurement={measurement}
                    setMeasurement={setMeasurement}
                    toggleHighlight={toggleHighlight}
                    highlightRectangles={highlightRectangles}
                    setCy={setCy} />
                <Canvas
                    measurement={measurement}
                    setMeasurement={setMeasurement}
                    setCy={setCy}
                    updateContainerHeight={updateContainerHeight}
                    highlightRectangles={highlightRectangles}
                />
            </div>
        </div>
    );
}

export default App;
