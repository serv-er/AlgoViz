# 🔗 AlgoViz

An interactive Algorithm Visualizer for **DAGs** and **Trees**, built with ReactFlow, React 19, and TailwindCSS.

- ✅ Directed edge constraints
- 🔁 Undo/Redo
- ❌ Cycle detection with **red edge highlighting**
- ✍️ Node & Edge label editing
- ⚙️ Auto-layout with DAGRE
- 🧠 Real-time DAG validation
- 📍 Tracker overlay
- 🖱️ Context menu + drag-and-drop UX

---



## 🧰 Tech Stack

| Library                 | Purpose                   |
| ----------------------- | ------------------------ |
| `react@19.1.0`          | Core UI library           |
| `react-dom@19.1.0`      | React DOM rendering       |
| `reactflow@11.11.4`     | DAG visual editor         |
| `dagre@0.8.5`           | Automatic graph layout    |
| `tailwindcss@4.1.11`    | Styling framework         |
| `@tailwindcss/vite`     | Tailwind plugin for Vite  |
| `react-icons@5.5.0`     | Icon library              |
| `react-tooltip@5.29.1`  | Tooltip for better UX     |

---

## ✨ Features

- **Strict Edge Rules:** Source → Target only, no loops or same-side links
- **Cycle Detection:** Cycles are caught instantly and edges are highlighted in red
- **Undo/Redo:** Step through node/edge changes using history stack
- **Auto Layout:** Clean layout with DAGRE to reposition nodes
- **Node & Edge Label Editing:** Double-click and edit inline labels
- **Drag Tracker:** Displays real-time position while dragging a node
- **Context Menu:** Right-click to add node or auto-layout
- **DAG Validity Banner:** Shows whether the current structure is valid
- **Live JSON Preview:** See current nodes and edges as formatted JSON

---

## 📸 Demo
**Sample Screenshots:**
- JSON Preview Panel
![Valid DAG with JSON PREVIEW](public/validDagwithjsonpreview.png)
- Node & Edge Label Editors
![Edge Label editor](public/edgeLabelEditor.png)
![Node Label editor](public/nodeLabelEditor.png)

- Cycle Detection with Red Edge
![Cycle detection](public/cycledetection.png)





#

## 👨‍💻 Author

Made with ❤️ by Sarvesh Baranwal

Feel free to contribute or fork the project if you want to extend the DAG builder further!

---

## 🤝 Contributor Guide

We welcome all contributors — beginners and experts alike! Here's how to get started:

### 🔧 Local Setup

```bash
git clone https://github.com/serv-er/AlgoViz.git
cd AlgoViz
npm install
npm run dev

---