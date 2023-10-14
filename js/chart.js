document.addEventListener('DOMContentLoaded', function () {

    // Get the canvas element and its context
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Set the canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Grid settings
    const gridSize = 20; // Size of each grid cell
    const gridColor = '#ddd'; // Grid line color

    // Function to draw the grid
    function drawGrid() {
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = gridSize; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = gridSize; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // Initial draw
    drawGrid();

    // Redraw the grid when the window is resized
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth - 40; // Adjust for margin
        canvas.height = window.innerHeight - 40; // Adjust for margin
        drawGrid();
    });


    var cy = cytoscape({
        container: document.getElementById('cy'),
        elements: [],

        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#66ccff',
                    'label': 'data(id)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'curve-style': 'bezier',
                    'target-arrow-shape': 'triangle',
                    'target-arrow-color': '#ff9900',
                    'line-color': '#666'
                }
            }
        ],

        layout: {
            name: 'grid'
        },
        userZoomingEnabled: false,
        zoomingEnabled: false 
    });

    // Variable to keep track of the currently selected element (node or edge)
    var selectedElement = null;

    // Add event listeners for creating states and transitions
    let nodeCounter = 0;

    document.getElementById('addState').addEventListener('click', function () {
        var newStateId = 'State' + Date.now();
        
        // Calculate position based on nodeCounter
        let xPosition = (nodeCounter % 5) * 150 + 100;  // 150 is the distance between nodes, change as needed
        let yPosition = Math.floor(nodeCounter / 5) * 150 + 100;
    
        cy.add({ data: { id: newStateId, label: 'State' }, position: { x: xPosition, y: yPosition } });
        
        nodeCounter++;  // Increment the counter for the next node
    });

    document.getElementById('addTransition').addEventListener('click', function () {
        if (selectedElement === null) {
            alert('Select a source state first.');
            return;
        }

        var transitionId = 'Transition' + Date.now();
        cy.add({ data: { id: transitionId, source: selectedElement.id(), target: 'State' + Date.now() } });

        // Deselect the previously selected element
        selectedElement = null;
    });
    cy.on('tap', 'node', function (e) {
        var node = e.target;
        if (selectedElement === null) {
            // Select the clicked state
            selectedElement = node;
        } else {
            // Create a transition from the selected state to the clicked state
            var transitionId = 'Transition' + Date.now();
            cy.add({ data: { id: transitionId, source: selectedElement.id(), target: node.id() } });
            // Deselect the previously selected element
            selectedElement = null;
        }
    });
    // Enable moving of elements
    cy.on('select', 'node', function (e) {
        var node = e.target;
        node.ungrabify(); // Allow the node to be moved

        // Add double-click event to edit node label
        node.on('dblclick', function () {
            editNodeLabel(node);
        });
    });

    cy.on('unselect', 'node', function (e) {
        var node = e.target;
        node.grabify(); // Prevent the node from being moved when not selected
    });

    // Function to edit node label
    function editNodeLabel(node) {
        var nodeLabel = prompt('Enter a new label for the node:', node.data('label'));
        if (nodeLabel !== null) {
            // Update the node's label data
            cy.batch(function () {
                node.data('label', nodeLabel);
            });
        }
    }


    // Function to change the layout to a circular layout
    function changeToCircularLayout() {
        cy.layout({ name: 'circle' }).run();
    }

    document.getElementById('circularLayout').addEventListener('click', changeToCircularLayout);


    // Function to change the layout to a dag layout
    function changeToDAGLayout() {
        cy.layout({
            name: 'dagre',
            nodeSep: 100,
            edgeSep: 50,
        }).run();
    }

    document.getElementById('dagLayout').addEventListener('click', changeToDAGLayout);


    // Function to change the layout to a dag layout
    function changeToColaLayout() {
        cy.layout({
            name: 'dagre',
            nodeSep: 100,
            edgeSep: 50,
        }).run();
    }

    document.getElementById('colaLayout').addEventListener('click', changeToColaLayout);


    // Function to load a JSON file and apply it to the chart
    function loadJsonData() {
        var input = document.getElementById('jsonFileInput');
        var file = input.files[0];

        if (!file) {
            alert('Please select a JSON file.');
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            var json = JSON.parse(e.target.result);
            // Clear existing elements and load the new JSON data
            cy.batch(function () {
                cy.elements().remove();
                cy.add(json.elements);
                cy.layout({ name: 'grid' }).run();
            });
        };

        reader.readAsText(file);
    }

    document.getElementById('loadJSON').addEventListener('click', loadJsonData);


    // Function to load a JSON file and apply it to the chart
    function loadDrawIoXML() {
        var input = document.getElementById('jsonFileInput');
        var file = input.files[0];

        if (!file) {
            alert('Please select a XML file.');
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            // Parse the XML string
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');
            parseXmlToCytoscape(xmlDoc);
        };
        reader.readAsText(file);
    }

    function parseXmlToCytoscape(xmlDoc) {
        const json = {
            nodes: [],
            edges: []
        };

        // Extract nodes
        xmlDoc.querySelectorAll('mxCell[parent="1"][vertex="1"]').forEach(node => {
            const id = node.getAttribute('id');
            const label = node.getAttribute('value');
            const x = parseFloat(node.querySelector('mxGeometry').getAttribute('x'));
            const y = parseFloat(node.querySelector('mxGeometry').getAttribute('y'));

            json.nodes.push({ data: { id, label }, position: { x, y } });
        });

        // Extract edges
        xmlDoc.querySelectorAll('mxCell[parent="1"][edge="1"]').forEach(edge => {
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

    }


    document.getElementById('loaddrawioXML').addEventListener('click', loadDrawIoXML);


    // Function to load a JSON file and apply it to the chart
    function loadGraphVizJsonData() {
        var input = document.getElementById('jsonFileInput');
        var file = input.files[0];

        if (!file) {
            alert('Please select a JSON file.');
            return;
        }

        var reader = new FileReader();

        reader.onload = function (e) {
            var graphvizData = JSON.parse(e.target.result);

            // Initialize an empty Cytoscape.js-compatible graph
            const cyData = {
                nodes: [],
                edges: [],
            };

            // Extract nodes and edges from Graphviz data and convert to Cytoscape.js format
            graphvizData.objects.forEach((object) => {
                if (object.name) {
                    cyData.nodes.push({
                        data: {
                            id: object.name,
                            // You can map other attributes as needed, e.g., label, color, shape, etc.
                        },
                    });
                }
            });

            graphvizData.edges.forEach((edge) => {
                if (edge.tail !== undefined && edge.head !== undefined) {
                    cyData.edges.push({
                        data: {
                            id: `edge-${edge.tail}-${edge.head}`,
                            source: graphvizData.objects[edge.tail].name,
                            target: graphvizData.objects[edge.head].name,
                            // You can map other attributes as needed.
                        },
                    });
                }
            });
            cy.batch(function () {
                cy.elements().remove();
                console.log(cyData);

                cy.add(cyData);
                cy.layout({ name: 'grid' }).run();
            });
        };

        reader.readAsText(file);
    }

    document.getElementById('loadGraphvizJSON').addEventListener('click', loadGraphVizJsonData);


    // mesurements

    function countEdgeCrossings(cy) {
        let crossings = 0;
        const edges = cy.edges();
        // Loop through each pair of edges
        for (let i = 0; i < edges.length - 1; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const edge1 = edges[i];
                const edge2 = edges[j];

                // Check if the two edges intersect
                if (edgesIntersect1(edge1, edge2)) {
                    crossings++;
                }
            }
        }
        console.log(`Number of edge crossings: ${crossings}`);

        return crossings;
    }

    //Detecting edge crossings in a more complex manner, especially considering edge bends and control points, can be quite challenging. However, I can provide you with a function that takes into account the intersection of two line segments (edges) based on their start and end points. This function uses vector mathematics to detect intersections

    //Please note that this function assumes straight-line edges without bends or control points. Detecting edge crossings in a more complex scenario with bends and control points would require a more advanced algorithm.
    function edgesIntersect(edge1, edge2) {
        const source1 = edge1.source();
        const target1 = edge1.target();
        const source2 = edge2.source();
        const target2 = edge2.target();
        console.log('Edge Data:', edge1.data());
        console.log('Edge Data:', edge2.data());


        const p0 = { x: source1.position('x'), y: source1.position('y') };
        const p1 = { x: target1.position('x'), y: target1.position('y') };
        const q0 = { x: source2.position('x'), y: source2.position('y') };
        const q1 = { x: target2.position('x'), y: target2.position('y') };
        console.log('p0:', p0);
        console.log('p1:', p1);
        console.log('q0:', q0);
        console.log('q1:', q1);


        // Calculate vectors for each edge
        const v1 = { x: p1.x - p0.x, y: p1.y - p0.y };
        const v2 = { x: q1.x - q0.x, y: q1.y - q0.y };
        const v0 = { x: q0.x - p0.x, y: q0.y - p0.y };

        // Calculate the determinant
        const det = v2.x * v1.y - v2.y * v1.x;

        console.log('Det:', det); // Log the determinant value


        if (det === 0) {
            // Edges are parallel, so they don't intersect
            return false;
        }

        // Calculate parameters for the intersection point
        const t1 = (v2.x * v0.y - v2.y * v0.x) / det;
        const t2 = (v1.x * v0.y - v1.y * v0.x) / det;

        console.log('T1:', t1); // Log the value of t1
        console.log('T2:', t2); // Log the value of t2
        console.log('result:', (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1)); // Log the value of t2

        // Check if the intersection point is within both edges
        return (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1);
    }

    // Add an event listener to the button
    document.getElementById('measureButton').addEventListener('click', function () {
        // Measure edge crossings and update the result display
        const edgeCrossings = countEdgeCrossings(cy);
        document.getElementById('measurementResult').textContent = `Edge Crossings: ${edgeCrossings}`;
    });

    function edgesIntersect1(edge1, edge2) {
        const p0 = edge1.sourceEndpoint(); // Get the starting point of edge1
        const p1 = edge1.targetEndpoint(); // Get the ending point of edge1
        const q0 = edge2.sourceEndpoint(); // Get the starting point of edge2
        const q1 = edge2.targetEndpoint(); // Get the ending point of edge2

        result = doLineSegmentsIntersect(p0, p1, q0, q1);
        return result;
    }

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

});