// src/App.js

import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';

function App() {

  const [measurement, setMeasurement] = useState({
    rudimentaryOcclusionCount: 0,
    quadtreeOcclusionCount: 0
  });


  return (
    <div className="d-flex flex-column h-100">
      <Header />
      <div className="d-flex flex-row flex-grow-1">
        <Sidebar measurement={measurement} />
        <Canvas measurement={measurement} setMeasurement={setMeasurement} />
      </div>
    </div>
  );
}

export default App;
