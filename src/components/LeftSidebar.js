// src/components/Sidebar.js

import React, { useState, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);


function LeftSidebar({ cy, containerHeight, measurement, setMeasurement, setCy }) {

    const fileInputRef = useRef(null);
    const [layoutDuration, setLayoutDuration] = useState('');
    const [highlightRectangles, setHighlightRectangles] = useState(false);
    const [widthPadding, setWidthPadding] = useState(10);
    const [heightPadding, setHeightPadding] = useState(10);
    const [showEdit, setShowEdit] = useState(false);
    const [nodeCount, setNodeCount] = useState(0);
    const [edgeCount, setEdgeCount] = useState(0);
    const [edgeNodeOverlap, setEdgeNodeOverlap] = useState(8);
    const [aspectRatio, setAspectRatio] = useState('900*500');
    const [minimumDistanceBetweenNode, setMinimumDistanceBetweenNode] = useState('30px');
    const [edgeLengths, setEdgeLengths] = useState({
        average: 0,
        longest: 0,
        shortest: 0
    });

    const [metrics, setMetrics] = useState({
        node_count: 1,
        edge_count: 1,
        node_occlusion: 1,
        edge_crossing: 1,
        edge_node_overlap: 1,
        shortest_edge_length: 1,
        average_edge_length: 1,
        longest_edge_length: 1,
        aspect_ratio: 1,
        minimum_distance_between_node: 1,
    });

    // Event handlers to update the state
    const handleWidthChange = (event) => {
        setWidthPadding(event.target.value);
    };

    const handleHeightChange = (event) => {
        setHeightPadding(event.target.value);
    };

    // Change layout through cytoscape
    const changeLayout = (layoutName) => {
        cy.layout({
            name: layoutName
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
        setLayoutDuration(duration + 'ms');
    };

    const showMesurements = () => {
        const widthPad = widthPadding;
        const heightPad = heightPadding;

        const widthPaddingNum = Number(widthPad) || 0;
        const heightPaddingNum = Number(heightPad) || 0;

        const nodes = cy.elements('node');
        const edges = cy.elements('edge');
        setNodeCount(nodes.length);
        setEdgeCount(edges.length);
        calculateAspectRatio(cy);
        countEdgeCrossings(cy);
        countNodeOcclusions(cy, widthPaddingNum, heightPaddingNum);
        setEdgeLengths(calculateEdgeLengths(cy));
    };

    const calculateAspectRatio = (cy) => {
        const boundingBox = cy.elements().boundingBox({});
        const width = boundingBox.w;
        const height = boundingBox.h;
        const ratio = width / height;
        setAspectRatio(ratio.toFixed(2)); // Keeping two decimal places for aspect ratio
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


    const countNodeOcclusions = (cy, widthPadding, heightPadding) => {
        let occlusions = 0;
        const nodes = cy.nodes();

        for (let i = 0; i < nodes.length - 1; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                if (nodesOverlap(nodes[i], nodes[j], widthPadding, heightPadding)) {
                    occlusions++;
                }
            }
        }

        setMeasurement((prevMeasurement) => ({
            ...prevMeasurement,
            nodeOcclusionCount: occlusions,
        }));
    };

    // Helper function to determine if two nodes overlap
    const nodesOverlap = (node1, node2, widthPadding, heightPadding) => {
        const n1 = node1.renderedBoundingBox();
        const n2 = node2.renderedBoundingBox();

        // Inflate the bounding boxes by widthPadding and heightPadding
        const inflatedN1 = {
            x1: n1.x1 - widthPadding,
            y1: n1.y1 - heightPadding,
            x2: n1.x2 + widthPadding,
            y2: n1.y2 + heightPadding
        };

        const inflatedN2 = {
            x1: n2.x1 - widthPadding,
            y1: n2.y1 - heightPadding,
            x2: n2.x2 + widthPadding,
            y2: n2.y2 + heightPadding
        };

        // Check if the inflated bounding boxes intersect
        return !(inflatedN2.x1 > inflatedN1.x2 ||
            inflatedN2.x2 < inflatedN1.x1 ||
            inflatedN2.y1 > inflatedN1.y2 ||
            inflatedN2.y2 < inflatedN1.y1);
    };


    const toggleHighlight = () => {
        if (highlightRectangles) {
            const widthPad = document.getElementById('widthPadding').value;
            const heightPad = document.getElementById('heightPadding').value;

            const widthPaddingNum = Number(widthPad) || 0;
            const heightPaddingNum = Number(heightPad) || 0;
            cy.nodes().forEach(node => {
                // Get the rendered bounding box of the node
                let nodeBoundingBox = node.renderedBoundingBox();
                // Define width and height of the rectangle with padding
                let rectWidth = nodeBoundingBox.x2 - nodeBoundingBox.x1 + 2 * widthPaddingNum; // 10 is the widthPadding
                let rectHeight = nodeBoundingBox.y2 - nodeBoundingBox.y1 + 2 * heightPaddingNum; // 10 is the heightPadding

                // Define the position of the highlight rectangle to center it on the node
                let position = {
                    x: node.position('x') + 10 - nodeBoundingBox.w / 2, // Center the rectangle by adjusting x
                    y: node.position('y') + 10 - nodeBoundingBox.h / 2  // Center the rectangle by adjusting y
                };
                // Add the highlight rectangle
                cy.add({
                    group: 'nodes',
                    data: { id: 'highlight_' + node.id(), boundary: position },
                    position: position,
                    classes: 'highlight-rectangle',
                    style: {
                        'shape': 'rectangle',
                        'width': rectWidth + 'px',
                        'height': rectHeight + 'px',
                        'border-width': '1px',
                        'border-color': 'black',
                        'background-opacity': 0, // This makes the node's background fully transparent

                    }
                });
            });
        } else {
            cy.elements('.highlight-rectangle').remove();
        }
        setCy(cy);
        setHighlightRectangles(!highlightRectangles);
    }


    const calculateEdgeLengths = (cy) => {
        let totalLength = 0;
        let longest = 0;
        let shortest = Infinity;

        cy.edges().forEach(edge => {
            const sourcePosition = edge.source().position();
            const targetPosition = edge.target().position();
            const length = Math.sqrt(
                Math.pow(sourcePosition.x - targetPosition.x, 2) +
                Math.pow(sourcePosition.y - targetPosition.y, 2)
            );

            // Add to total length for average calculation
            totalLength += length;

            // Check for longest edge
            if (length > longest) {
                longest = length;
            }

            // Check for shortest edge
            if (length < shortest) {
                shortest = length;
            }
        });

        const averageLength = totalLength / cy.edges().length;

        return {
            average: averageLength,
            longest: longest,
            shortest: shortest
        };
    };



    return (
        <nav className="bg-light p-3 left-sidebar shadow-sm" style={{ width: '280px', maxHeight: "calc(100dvh - 60px)", overflow: "auto" }}>
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
                    <button onClick={() => changeLayout('grid')} className="btn btn-secondary ">Grid Layout</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <button onClick={() => changeLayout('breadthfirst')} className="btn btn-secondary ">Breadthfirst Layout</button>
                </li>
                <li className="nav-item border-top mb-2">
                    <button onClick={() => changeLayout('breadthfirst')} className="btn btn-warning">SC Auto Layout</button>
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

            <div className='result-data'><b><h1>Mesurements Results</h1></b></div>
            <div className='result-data'><p><b>Computational Efficiency: </b>{layoutDuration}</p></div>
            <div className='result-data'><p><b>Total Node Count: </b>{nodeCount}</p></div>
            <div className='result-data'><p><b>Total Edge Count: </b>{edgeCount}</p></div>
            <div className='result-data'>
                <p><b>Edge Lengths </b></p>
                <p>Average Edge Length: {edgeLengths.average.toFixed(2)} px</p>
                <p>Longest Edge Length: {edgeLengths.longest.toFixed(2)} px</p>
                <p>Shortest Edge Length: {edgeLengths.shortest.toFixed(2)} px</p>
            </div>

            <div className='result-data'><p><b>Edge Crossing Count: </b>{measurement.edgeCrossingCount}</p></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className='result-data'>
                <p style={{ margin: 0 }}>
                    <b>Node occlusions: </b>{measurement.nodeOcclusionCount}
                </p>
                <a onClick={() => setShowEdit(!showEdit)} className="btn-link">
                    <i className="fas fa-cog"></i>
                </a>
            </div>
            {
                showEdit && (
                    <div className='settings-div'>
                        <label for="widthPadding">Width:</label>
                        <input type="number" id="widthPadding" name="widthPadding" value={widthPadding} onChange={handleWidthChange} />
                        <label for="heightPadding">Height:</label>
                        <input type="number" id="heightPadding" name="heightPadding" value={heightPadding} onChange={handleHeightChange} />
                        <button onClick={toggleHighlight} className="btn btn-primary ">{highlightRectangles ? "Hide" : "Show"} boundary</button>
                    </div>
                )
            }
            <div className='result-data'><p><b>Edge Node Overlap: </b>{edgeNodeOverlap}</p></div>
            <div className='result-data'><p><b>Aspect Ratio: </b>{aspectRatio}</p></div>
            <div className='result-data'><p><b>Minimum Distance Between Nodes: </b>{minimumDistanceBetweenNode}</p></div>

            <div className='result-data'><b><h1>Analytical Results</h1></b></div>
            <div className='metrics'>
                <b><h1>Metrics</h1></b>
                <div className=''><p><b>Node Count: </b><input type='number' min="0" max="1" value={metrics.node_count} /></p></div>
                <div className=''><p><b>Edge Count: </b><input type='number' min="0" max="1" value={metrics.edge_count} /></p></div>
                <div className=''><p><b>Node occlusions: </b><input type='number' min="0" max="1" value={metrics.node_occlusion} /></p></div>
                <div className=''><p><b>Edge Crossing: </b><input type='number' min="0" max="1" value={metrics.edge_crossing} /></p></div>
                <div className=''><p><b>Edge Node Overlap: </b><input type='number' min="0" max="1" value={metrics.edge_node_overlap} /></p></div>
                <div className=''><p><b>Shortest Edge Length: </b><input type='number' min="0" max="1" value={metrics.shortest_edge_length} /></p></div>
                <div className=''><p><b>Average Edge Length: </b><input type='number' min="0" max="1" value={metrics.average_edge_length} /></p></div>
                <div className=''><p><b>Longest Edge Length: </b><input type='number' min="0" max="1" value={metrics.longest_edge_length} /></p></div>
                <div className=''><p><b>Minimum Distance Between Nodes: </b><input type='number' min="0" max="1" value={metrics.minimum_distance_between_node} /></p></div>
                <div className=''><p><b>Aspect Ratio: </b><input type='number' min="0" max="1" value={metrics.aspect_ratio} /></p></div>
            </div>
            <div className='result-data' ><b><h1 style={{ color: 'green' }}>State Chart Score:</h1></b></div>
        </nav >
    );
}

export default LeftSidebar;