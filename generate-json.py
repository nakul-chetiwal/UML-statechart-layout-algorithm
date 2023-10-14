import json
import random

# Generate nodes
nodes = []
for i in range(1, 101):
    node_id = f"Node{i}"
    label = f"Node {i}"
    color = random.choice(["red", "blue", "green", "orange", "purple"])
    shape = random.choice(["ellipse", "rectangle", "triangle", "hexagon", "octagon"])
    node = {"data": {"id": node_id, "label": label, "color": color, "shape": shape}}
    nodes.append(node)

# Generate edges
edges = []
for i in range(1, 201):
    source = f"Node{random.randint(1, 100)}"
    target = f"Node{random.randint(1, 100)}"
    label = f"Edge {i}"
    edge = {"data": {"source": source, "target": target, "label": label}}
    edges.append(edge)

# Create the JSON structure
json_data = {"elements": {"nodes": nodes, "edges": edges}}

# Save the JSON to a file
with open("json/chart-data1.json", "w") as json_file:
    json.dump(json_data, json_file, indent=2)

print("JSON file with 100 nodes and 200 edges has been generated: chart-data1.json")
