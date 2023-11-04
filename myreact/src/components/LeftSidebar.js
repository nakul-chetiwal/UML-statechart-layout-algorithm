// src/components/Sidebar.js

import React, { useEffect, useState, useRef } from 'react';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);


function LeftSidebar({ cy }) {

    const changeLayout = (layoutName) => {
        cy.layout({
            name: layoutName,
            nodeSep: 100,
            edgeSep: 50,
        }).run();
    };

    const loadCytoscapeJson = (event) => {
        const file = event.target.files[0];

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



    return (
        <nav className="col-md-2 d-none d-md-block bg-info vh-100" id="sidebar">
            <div className="position-sticky">
                <ul className="nav flex-column">
                    <li className="nav-item border-top mb-2">
                        <button id="addState" className="btn btn-primary btn-block">Add State</button>
                    </li>
                    <li className="nav-item border-top mb-2">
                        <button id="addTransition" className="btn btn-primary btn-block">Add Transition</button>
                    </li>
                    <li className="nav-item border-top mb-2">
                        <button onClick={() => changeLayout('circle')} className="btn btn-secondary btn-block">Circular Layout</button>
                    </li>
                    <li className="nav-item border-top mb-2">
                        <button onClick={() => changeLayout('dagre')} className="btn btn-secondary btn-block">DAG Layout</button>
                    </li>
                    <li className="nav-item border-top mb-2">
                        <input type="file" id="jsonFileInput" className="form-control-file" onChange={loadCytoscapeJson} />
                    </li>
                    <li className="nav-item border-top mb-2">
                        <button className="btn btn-success btn-block">Load JSON</button>
                    </li>
                    <li className="nav-item border-top mb-2">
                        <button id="loadGraphvizJSON" className="btn btn-success btn-block">Load Graphviz JSON</button>
                    </li>
                    <li className="nav-item border-top mb-2">
                        <button id="loadDrawioXML" className="btn btn-success btn-block">Load draw.io XML</button>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default LeftSidebar;
