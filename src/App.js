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
                    toggleHighlight={toggleHighlight}
                    highlightRectangles={highlightRectangles}
                    setCy={setCy} />
                <Canvas
                    setCy={setCy}
                    updateContainerHeight={updateContainerHeight}
                />
            </div>
        </div>
    );
}

export default App;
