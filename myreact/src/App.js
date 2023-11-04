// src/App.js

import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Canvas from './components/Canvas';

function App() {

  const [measurement, setMeasurement] = useState({
    rudimentaryOcclusionCount: 0,
    quadtreeOcclusionCount: 0
  });

  const [cy, setCy] = useState(null);


  return (
    <div className="d-flex flex-column h-100">
      <Header />
      <div className="d-flex flex-row flex-grow-1">
        <LeftSidebar cy={cy} />
        <Canvas measurement={measurement} setMeasurement={setMeasurement} setCy={setCy} />
        <RightSidebar measurement={measurement} />
      </div>
    </div>
  );
}

export default App;
