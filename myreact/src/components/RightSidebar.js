import React from 'react';

function RightSidebar({ measurement, setMeasurement, cy }) {
    const showMesurements = () => {
        countEdgeCrossings(cy);
    };

    // edge crossing mesurements
    const countEdgeCrossings = (cy) => {
        console.log(`countEdgeCrossings`);
        let crossings = 0;
        const edges = cy.edges();
        console.log(edges);
        for (let i = 0; i < edges.length - 1; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const edge1 = edges[i];
                const edge2 = edges[j];
                if (edgesIntersect(edge1, edge2)) {
                    crossings++;
                }
            }
        }

        console.log(`Number of edge crossings: ${crossings}`);
        setMeasurement(prevMeasurement => ({
            ...prevMeasurement,
            edgeCrossingCount: crossings,
        }));
    };

    const edgesIntersect = (edge1, edge2) => {
        const edge1Data = edge1.data();
        const edge2Data = edge2.data();
        const p0 = edge1.sourceEndpoint(); // Get the starting point of edge1
        const p1 = edge1.targetEndpoint(); // Get the ending point of edge1
        const q0 = edge2.sourceEndpoint(); // Get the starting point of edge2
        const q1 = edge2.targetEndpoint(); // Get the ending point of edge2
        console.log(p0);

        const result = doLineSegmentsIntersect(p0, p1, q0, q1);
        if (result) {
            console.log(`Testing intersection between edge1: ${edge1Data.source}, ${edge1Data.target} and edge2: ${edge2Data.source}, ${edge2Data.target}, Result: ${result}`);

        }

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

    return (
        <div className="bg-light p-3" style={{ width: '250px' }}>
            <button onClick={showMesurements} className="btn btn-primary ">Show Mesurements</button>
            <h2>Results</h2>
            <p>Rudimentary Occlusions Count: {measurement.rudimentaryOcclusionCount}</p>
            <p>QuadTree Occlusions Count: {measurement.quadtreeOcclusionCount}</p>
            <p>Edge Crossing Count: {measurement.edgeCrossingCount}</p>
            <p>Edge Crossing Count: {measurement.edgeCrossingCount}</p>
            <p>Edge Crossing Count: {measurement.edgeCrossingCount}</p>
        </div>
    );
}

export default RightSidebar;
