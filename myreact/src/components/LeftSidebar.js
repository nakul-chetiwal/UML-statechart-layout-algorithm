// src/components/Sidebar.js

import React, { useEffect, useState, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);


function LeftSidebar({ cy, containerHeight, measurement, setMeasurement }) {

    const fileInputRef = useRef(null);
    const [layoutDuration, setLayoutDuration] = useState('');

    const [rudimentaryOcclusionCount, setRudiMentaryOcclusionCount] = useState(0);
    const [quadtreeOcclusionCount, setQuadtreeOcclusionCount] = useState(0)



    // Change layout through cytoscape
    const changeLayout = (layoutName) => {
        cy.layout({
            name: layoutName,
            nodeSep: 100,
            edgeSep: 50,
        }).run();
    };

    //load json from cytoscape
    const handleLoadJsonClick = () => {
        fileInputRef.current.click();
    };

    const handleLoadJsonFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            loadCytoscapeJsonFromFile(file);
        }
    };

    const loadCytoscapeJsonFromFile = (file) => {
        if (!file) {
            alert('Please select a file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target.result;
                console.log("File Content:", result);  // Log file content for debugging

                if (result) {
                    const json = JSON.parse(result);
                    console.log("Parsed JSON:", json);  // Log parsed JSON for debugging

                    if (cy && json.elements) {
                        cy.batch(() => {
                            debugger;
                            cy.elements().remove();
                            cy.add(json.elements);
                            cy.layout({ name: 'grid' }).run();
                        });
                    } else {
                        if (!cy) {
                            throw new Error('Cytoscape instance (cy) is not initialized.');
                        }
                        if (!json.elements) {
                            throw new Error('Parsed JSON does not contain elements property.');
                        }
                    }
                } else {
                    throw new Error('No result from file reader');
                }
            } catch (err) {
                console.error('Error loading or parsing file', err);
                alert('Error loading or parsing file.');
            }
        };

        reader.onerror = (err) => {
            console.error('Error reading file', err);
            alert('Error reading file.');
        };

        reader.readAsText(file);
    };

    //Drawio

    // Function to trigger the file input
    const handleDrawIoFileInputClick = () => {
        document.getElementById('drawIoXMLFileInput').click();
    };

    // Function to parse Draw.io XML to Cytoscape JSON
    const parseXmlToCytoscape = (xmlDoc) => {
        const json = {
            nodes: [],
            edges: [],
        };

        // Extract nodes
        xmlDoc.querySelectorAll('mxCell[parent="1"][vertex="1"]').forEach((node) => {
            const id = node.getAttribute('id');
            const label = node.getAttribute('value');
            const x = parseFloat(node.querySelector('mxGeometry').getAttribute('x'));
            const y = parseFloat(node.querySelector('mxGeometry').getAttribute('y'));

            json.nodes.push({ data: { id, label }, position: { x, y } });
        });

        // Extract edges
        xmlDoc.querySelectorAll('mxCell[parent="1"][edge="1"]').forEach((edge) => {
            const id = edge.getAttribute('id');
            const source = edge.getAttribute('source');
            const target = edge.getAttribute('target');

            json.edges.push({ data: { id, source, target } });
        });

        cy.batch(function () {
            cy.elements().remove();
            console.log(json);
            cy.add(json);
            cy.layout({ name: 'grid' }).run();
        });
    };

    // Function to load a Draw.io XML file and apply it to the Cytoscape
    const loadDrawIoXML = (event) => {
        const file = event.target.files[0];

        if (!file) {
            alert('Please select a XML file.');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');
            parseXmlToCytoscape(xmlDoc);
        };

        reader.readAsText(file);
    };

    //Graphviz

    // Function to trigger the file input
    const handleGraphVizJsonFileInputClick = () => {
        document.getElementById('graphVizJsonFileInput').click();
    };

    // Function to load a Draw.io XML file and apply it to the Cytoscape
    const loadGraphvizJson = (event) => {
        const file = event.target.files[0];

        if (!file) {
            alert('Please select a JSON file.');
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const graphvizData = JSON.parse(e.target.result);
            parseGraphvizJsonToCytoscapeJson(graphvizData);
        };

        reader.readAsText(file);
    };

    // Function to load a Graphviz json and apply it to the Cytoscape
    const parseGraphvizJsonToCytoscapeJson = (graphvizData) => {
        const startTime = new Date().getTime();

        const cyElements = {
            nodes: [],
            edges: [],
        };

        // Process nodes
        graphvizData.objects.forEach((object) => {
            if (object.name && object.pos) {
                const coords = object.pos.split(',');
                const position = {
                    x: parseFloat(coords[0]),
                    y: containerHeight - parseFloat(coords[1]), // Flip the y-coordinate
                };
                cyElements.nodes.push({
                    data: { id: object.name },
                    position,
                });
            }
        });

        // Process edges
        graphvizData.edges.forEach((edge) => {
            if (edge.tail !== undefined && edge.head !== undefined) {
                cyElements.edges.push({
                    data: {
                        id: `edge-${edge.tail}-${edge.head}`,
                        source: graphvizData.objects[edge.tail].name,
                        target: graphvizData.objects[edge.head].name,
                    },
                });
            }
        });

        cy.batch(function () {
            cy.elements().remove();
            console.log(cyElements);
            cy.add(cyElements);
        });

        cy.ready(function () {
            cy.fit();
        });

        const endTime = new Date().getTime();
        const duration = endTime - startTime;
        console.log('Layout took: ' + duration + 'ms');
        setLayoutDuration(`Layout took: ${duration}ms`);
    };

    const showMesurements = () => {
        setQuadtreeOcclusionCount(measurement?.quadtreeOcclusionCount)
        setRudiMentaryOcclusionCount(measurement?.rudimentaryOcclusionCount)

        countEdgeCrossings(cy);
    };

    const edgesIntersect = (edge1, edge2) => {
        const p0 = edge1.sourceEndpoint(); // Get the starting point of edge1
        const p1 = edge1.targetEndpoint(); // Get the ending point of edge1
        const q0 = edge2.sourceEndpoint(); // Get the starting point of edge2
        const q1 = edge2.targetEndpoint(); // Get the ending point of edge2

        const result = doLineSegmentsIntersect(p0, p1, q0, q1);
        return result;
    };

    function doLineSegmentsIntersect(p0, p1, q0, q1) {
        const dx1 = p1.x - p0.x;
        const dy1 = p1.y - p0.y;
        const dx2 = q1.x - q0.x;
        const dy2 = q1.y - q0.y;

        const determinant = dx1 * dy2 - dx2 * dy1;

        if (determinant === 0) {
            return false; // Line segments are parallel
        }

        const t1 = ((q0.x - p0.x) * dy2 - (q0.y - p0.y) * dx2) / determinant;
        const t2 = ((q0.x - p0.x) * dy1 - (q0.y - p0.y) * dx1) / determinant;

        return t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
    }

    // edge crossing mesurements
    const countEdgeCrossings = (cy) => {
        let crossings = 0;
        const edges = cy.edges();

      
        console.log("edges**", cy.on)
        for (let i = 0; i < edges.length - 1; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const edge1 = edges[i];
                const edge2 = edges[j];
                console.log("crossings", crossings)
                if (edgesIntersect(edge1, edge2)) {
                    crossings++;
                }
            }
        }

        setMeasurement(prevMeasurement => ({
            ...prevMeasurement,
            edgeCrossingCount: crossings,
        }));
    };


    return (
        <nav className="bg-light p-3 left-sidebar" style={{ width: '200px', maxHeight: "calc(100dvh - 60px)", overflow: "auto" }}>
            <ul className="nav flex-column">
                <li className="nav-item border-top mb-2">
                    <button id="addState" className="btn btn-primary ">Add State</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <button id="addTransition" className="btn btn-primary ">Add Transition</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <button onClick={() => changeLayout('circle')} className="btn btn-secondary ">Circular Layout</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <button onClick={() => changeLayout('dagre')} className="btn btn-secondary ">DAG Layout</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLoadJsonFileChange}
                        style={{ display: 'none' }}
                        accept=".json"
                    />
                    <button onClick={handleLoadJsonClick} className="btn btn-success " >Load Cytoscape JSON</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <input
                        type="file"
                        id="graphVizJsonFileInput"
                        style={{ display: 'none' }}
                        onChange={loadGraphvizJson}
                        accept=".json"
                    />
                    <button onClick={handleGraphVizJsonFileInputClick} className="btn btn-success ">Load Graphviz JSON</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <input
                        type="file"
                        id="drawIoXMLFileInput"
                        style={{ display: 'none' }}
                        onChange={loadDrawIoXML}
                        accept=".xml"
                    />
                    <button onClick={handleDrawIoFileInputClick} className="btn btn-success ">Load draw.io XML</button>
                </li>
            </ul>

            <button onClick={showMesurements} className="btn btn-primary ">Show Mesurements</button>
            <h2>Results</h2>
            <p>Rudimentary Occlusions Count: {rudimentaryOcclusionCount}</p>
            <p>QuadTree Occlusions Count: {quadtreeOcclusionCount}</p>
            <p>Edge Crossing Count: {measurement.edgeCrossingCount}</p>
            {/* <p>Edge Crossing Count: {measurement.edgeCrossingCount}</p>
            <p>Edge Crossing Count: {measurement.edgeCrossingCount}</p> */}
        </nav>
    );
}

export default LeftSidebar;
