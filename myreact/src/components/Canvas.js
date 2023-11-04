import React, { useRef, useEffect, useState } from 'react';

import cytoscape from 'cytoscape';
import gridGuide from 'cytoscape-grid-guide';
import Quadtree from '../utils/Quadtree';
import Rectangle from '../utils/Rectangle';

cytoscape.use(gridGuide);

const cellSize = 50;

function Canvas({ measurement, setMeasurement, setCy }) {
    const cyRef = useRef(null);

    const canvasWidth = 800;
    const canvasHeight = 600;

    const boundary = new Rectangle(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
    const quadtree = new Quadtree(boundary, 4); // Capacity can be adjusted

    useEffect(() => {
        if (cyRef.current) {
            const cy = cytoscape({
                container: cyRef.current,
                elements: [
                    { data: { id: 'a' } },
                    { data: { id: 'b' } },
                    { data: { id: 'a-b', source: 'a', target: 'b' } },
                ],
                style: [
                    {
                        selector: 'node',
                        style: {
                            'background-color': '#666',
                            'label': 'data(id)'
                        }
                    },
                    {
                        selector: 'edge',
                        style: {
                            'width': 3,
                            'line-color': '#ccc',
                            'target-arrow-color': '#ccc',
                            'target-arrow-shape': 'triangle'
                        }
                    }
                ],
                layout: {
                    name: 'grid',
                    rows: 1
                },
                wheelSensitivity: 0
            });

            cy.gridGuide({
                snapToGridDuringDrag: true,
                drawGrid: true,
                gridColor: '#ff0000',
                gridSpacing: cellSize,
                zoomThreshold: 0.5,
                gridSpacing: 20
            });

            // Add nodes to grid when they're added to cytoscape
            cy.on('add', 'node', (evt) => {
                handleNodeOcclusion(evt.target, cy);

                let node = evt.target;
                let point = {
                    x: node.position().x,
                    y: node.position().y,
                    data: node // Store the node reference in the point data
                };
                quadtree.insert(point);
                checkOcclusionUsingQuadtree(node, quadtree);


                // Add a rectangle visualization for the node's boundary
                /*let boundary = node.boundary; // Assuming each node has a 'boundary' property
                cy.add({
                    group: 'nodes',
                    data: { id: 'rect_' + node.id() },
                    position: { x: boundary.x, y: boundary.y },
                    classes: 'boundary-rectangle'
                });*/
            });

            cy.style()
                .selector('.boundary-rectangle')
                .css({
                    'shape': 'rectangle',
                    'width': 'data(boundary.w)',  // Assuming boundary has a width property
                    'height': 'data(boundary.h)', // Assuming boundary has a height property
                    'background-color': 'transparent',
                    'border-color': '#FF0000',
                    'border-width': 2,
                    'events': 'no',
                    'user-draggable': 'no',
                    'user-selectable': 'no'
                })
                .update();


            // Handle node movement
            cy.on('dragfreeon position', 'node', (evt) => {
                handleNodeOcclusion(evt.target, cy);

                let node = evt.target;
                let point = {
                    x: node.position().x,
                    y: node.position().y,
                    data: node // Store the node reference in the point data
                };
                quadtree.insert(point);
                checkOcclusionUsingQuadtree(node, quadtree);
                // Add a rectangle visualization for the node's boundary
            });
            setCy(cy);
        }
    }, []);

    //rudimentary approach
    const handleNodeOcclusion = (node, cy) => {
        let overlappingNodes = cy.nodes().filter((otherNode) => {
            if (node === otherNode) return false; // Don't check against itself
            let dx = node.position().x - otherNode.position().x;
            let dy = node.position().y - otherNode.position().y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (2 * node.outerWidth()); // Assuming nodes are roughly the same size
        });

        if (overlappingNodes.length > 0) {
            setMeasurement(prevMeasurement => ({
                ...prevMeasurement,
                rudimentaryOcclusionCount: prevMeasurement.rudimentaryOcclusionCount + overlappingNodes.length,
            }));
        }

        overlappingNodes.forEach((overlapNode) => {
            console.log(`Node ${node.id()} overlaps with node ${overlapNode.id()}`);
            // TODO: Handle the overlap, either by moving the node or some other action
        });
    };

    //Quadtree approch
    const checkOcclusionUsingQuadtree = (node, quadtree) => {
        let range = new Rectangle(node.position().x, node.position().y, node.outerWidth(), node.outerHeight());
        let potentialOverlaps = [];
        quadtree.query(range, potentialOverlaps);
        for (let point of potentialOverlaps) {
            if (point.data !== node) {
                console.log(`Booom`);
            }
        }

        if (potentialOverlaps.length > 1) { // > 1 because the node itself is included

            setMeasurement(prevMeasurement => ({
                ...prevMeasurement,
                quadtreeOcclusionCount: prevMeasurement.quadtreeOcclusionCount + (potentialOverlaps.length - 1),
            }));
        }
    };

    return (
        <div className="p-3" style={{ flexGrow: 1, height: 'calc(100vh - 60px)', position: 'relative' }}>
            <div ref={cyRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}

export default Canvas;
