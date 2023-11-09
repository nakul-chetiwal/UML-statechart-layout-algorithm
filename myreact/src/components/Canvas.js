import React, { useRef, useEffect, useState } from 'react';

import cytoscape from 'cytoscape';
import gridGuide from 'cytoscape-grid-guide';
import Quadtree from '../utils/Quadtree';
import Rectangle from '../utils/Rectangle';

cytoscape.use(gridGuide);

const cellSize = 20;

function Canvas({ measurement, setMeasurement, setCy, updateContainerHeight, highlightRectangles }) {
    const cyRef = useRef(null);

    const canvasWidth = 800;
    const canvasHeight = 600;

    const boundary = new Rectangle(canvasWidth / 2, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
    const quadtree = new Quadtree(boundary, 4); // Capacity can be adjusted

    useEffect(() => {
        if (cyRef.current) {
            const cy = cytoscape({
                container: cyRef.current,

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
                    name: 'grid',
                    rows: 1
                },
                userZoomingEnabled: false,
                // zoomingEnabled: false
            });

            cy.gridGuide({
                snapToGridDuringDrag: true,
                drawGrid: true,
                gridColor: '#ff0000',
                gridSpacing: cellSize,
                zoomThreshold: 0.5
            });


            setCy(cy);
            updateContainerHeight(cyRef.current.clientHeight);
        }

    }, []);

    return (
        <div className="p-3" style={{ flexGrow: 1, height: 'calc(100vh - 60px)', position: 'relative', maxHeight: 'calc(100vh - 60px)', maxWidth: 'calc(100dvw - 200px)' }}>
            <div ref={cyRef} style={{ width: '100%', height: '100%' }}></div>
        </div>
    );
}

export default Canvas;
