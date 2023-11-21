import React, { useRef, useEffect } from 'react';

import cytoscape from 'cytoscape';
import gridGuide from 'cytoscape-grid-guide';

cytoscape.use(gridGuide);

const cellSize = 20;

function Canvas({ setCy, updateContainerHeight }) {
    const cyRef = useRef(null);

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
                userZoomingEnabled: false,
                // zoomingEnabled: false
            });

            cy.gridGuide({
                snapToGridDuringDrag: true,
                drawGrid: true,
                gridColor: '#aeaeae',
                gridSpacing: cellSize,
                zoomThreshold: 0.5
            });

            setCy(cy);
            updateContainerHeight(cyRef.current.clientHeight);
        }

    }, []);

    return (
        <div className="p-3" style={{ flexGrow: 1, height: 'calc(100vh - 60px)', position: 'relative', maxHeight: 'calc(100vh - 60px)', maxWidth: 'calc(100dvw - 200px)' }}>
            <div ref={cyRef} style={{ width: '100%', height: '100%', border: '1px solid #3a3a3a' }}></div>
        </div>
    );
}

export default Canvas;
