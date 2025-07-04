import React, {
  useCallback,
  useState,
  useLayoutEffect,
  useRef,
} from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Toast from '../components/Toast';
import { AnimatePresence } from 'framer-motion'; 
import NodeLabelEditor from '../components/NodeLabelEditor';
import CustomNode from '../components/CustomNode';
import Buttons from '../components/Buttons';
import ContextMenu from '../components/ContextMenu';
import EdgeLabelEditor from '../components/EdgeLabelEditor';
import TrackerOverlay from '../components/TrackerOverlay';
import { getTreeLayout } from '../utils/getTreeLayout';
import useUndoRedo from '../hook/useUndoRedo';
import { getLayoutedNodes } from '../utils/dagreLayout';
import usePipelineValidation from '../hook/usePipelineValidation';
import useGraphValidation from '../hook/usePipelineValidation';
import useKeyboardShortcuts from '../hook/useKeyboardShortcuts';

// Register custom node type for React Flow
const nodeTypes = { custom: CustomNode };

// Helper to filter out invalid/ghost nodes
const isValidNode = (node) =>
  node?.id &&
  typeof node.id === 'string' &&
  node.type !== 'dimensions' &&
  node.position?.x !== undefined &&
  node.position?.y !== undefined;

function PipelineEditor() {
  // React Flow node and edge state management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Undo/Redo custom hook
  const undoRedo = useUndoRedo(nodes, edges, setNodes, setEdges);
  const [validationMode, setValidationMode] = useState('dag');

  // UI state for label editing, selection, validation, etc.
  const [toastMessage, setToastMessage] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nodeLabel, setNodeLabel] = useState('');
  const [invalidEdgeIds, setInvalidEdgeIds] = useState([]);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [edgeLabel, setEdgeLabel] = useState('');
  const [draggingNode, setDraggingNode] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
const [validationReason, setValidationReason] = useState('');

  // Ref for focusing input fields
  const inputRef = useRef(null);

  // React Flow viewport for overlay positioning
  const { getViewport } = useReactFlow();

  // Remove invalid nodes injected by devtools or state corruption
  useLayoutEffect(() => {
    const filtered = nodes.filter(isValidNode);
    if (filtered.length !== nodes.length) {
      const removed = nodes.filter((n) => !isValidNode(n));
      removed.forEach((b) => console.warn('🧹 Removed ghost node:', b));
      setNodes(filtered);
    }
  }, [nodes, setNodes]);

  // DAG validation (cycles, edge rules, etc.)
useGraphValidation(nodes, edges, validationMode, setIsValid, setInvalidEdgeIds, setValidationReason);


  // Keyboard shortcuts (e.g., delete, undo/redo)
  useKeyboardShortcuts(setNodes, setEdges);

  /**
   * Handle connecting two nodes.
   * Enforces edge rules: no self-loops, must connect source→target, no same-side handles.
   * Highlights invalid edges in red briefly.
   */
  const onConnect = useCallback(
    (params) => {
      const { source, target, sourceHandle, targetHandle } = params;

      // Prevent self-loop
      if (!source || !target || source === target) {
        alert('❌ Cannot connect node to itself');
        return;
      }

      // Must connect from source handle to target handle
      if (!sourceHandle || !targetHandle) {
        alert('❌ Connection must be from source → target handle');
        return;
      }

      // Prevent same-side connections (a→a or b→b)
      if (
        (sourceHandle === 'a' && targetHandle === 'a') ||
        (sourceHandle === 'b' && targetHandle === 'b')
      ) {
        alert('❌ Invalid edge: Cannot connect same sides');
        // Show invalid edge in red for 1 second
        const invalidEdge = {
          ...params,
          id: `invalid_${+new Date()}`,
          style: { stroke: 'red', strokeWidth: 2 },
          markerEnd: { type: MarkerType.Arrow },
        };
        setEdges((eds) => [...eds, invalidEdge]);
        setTimeout(() => {
          setEdges((eds) => eds.filter((e) => e.id !== invalidEdge.id));
        }, 1000);
        return;
      }

      // Add valid edge
      const newEdge = {
        ...params,
        id: `edge_${+new Date()}`,
        label: '',
        markerEnd: { type: MarkerType.Arrow },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Style edges: highlight invalid edges in red
  const styledEdges = edges.map((e) => ({
    ...e,
    style: invalidEdgeIds.includes(e.id)
      ? { stroke: 'red', strokeWidth: 2 }
      : { stroke: '#1a192b' },
  }));

  /**
   * Add a new node at a random position.
   */
  const addNode = () => {
    const label = prompt('Enter node label');
    if (!label) return;

    const newNode = {
      id: `node_${+new Date()}`,
      type: 'custom',
      data: { label },
      position: {
        x: Math.random() * 250 + 100,
        y: Math.random() * 250 + 100,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  /**
   * Auto-layout nodes using DAGRE.
   */
const handleAutoLayout = () => {
  let layouted;

  if (validationMode === 'tree') {
    layouted = getTreeLayout(nodes, edges); // You'll define this in utils
  } else {
    layouted = getLayoutedNodes(nodes, edges); // DAG-style layout
  }

  setNodes(layouted);
};


  /**
   * Edge label editing: open editor on edge click.
   */
  const onEdgeClick = useCallback((event, edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id);
    setEdgeLabel(edge.label || '');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  /**
   * Save edited edge label.
   */
  const handleLabelSave = () => {
    setEdges((eds) =>
      eds.map((e) => (e.id === selectedEdgeId ? { ...e, label: edgeLabel } : e))
    );
    setSelectedEdgeId(null);
    setEdgeLabel('');
  };

  /**
   * Node label editing: open editor on node click.
   */
  const onNodeClick = useCallback((event, node) => {
    event.stopPropagation();
    setSelectedNodeId(node.id);
    setNodeLabel(node.data?.label || '');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  /**
   * Track node/edge changes for undo/redo.
   */
  const handleNodesChange = (changes) => {
    onNodesChange(changes);
    undoRedo.updateHistory(nodes, edges);
  };

  const handleEdgesChange = (changes) => {
    onEdgesChange(changes);
    undoRedo.updateHistory(nodes, edges);
  };


  // Validator Info

  const validatorInfo = {
  dag: {
    title: 'DAG Validator',
    rules: [
      '✅ No cycles',
      '✅ All nodes must be connected',
      '✅ Directional edges only',
    ],
  },
  tree: {
    title: 'Tree Validator',
    rules: [
      '✅ Exactly one root (no incoming edge)',
      '✅ Each node has at most one parent',
      '✅ No cycles allowed',
      '✅ Must be connected',
    ],
  },
};


  /**
   * Save edited node label.
   */
  const handleNodeLabelSave = () => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNodeId
          ? { ...node, data: { ...node.data, label: nodeLabel } }
          : node
      )
    );
    setSelectedNodeId(null);
    setNodeLabel('');
  };

  /**
   * Track node dragging for overlay.
   */
  const onNodeDragStart = useCallback((event, node) => {
    setDraggingNode(node);
  }, []);

  const onNodeDrag = useCallback((event, node) => {
    setDraggingNode({
      id: node.id,
      x: node.position?.x ?? 0,
      y: node.position?.y ?? 0,
    });
  }, []);

  const onNodeDragStop = useCallback((event, draggedNode) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node
      )
    );
    setDraggingNode(null);
  }, [setNodes]);

  /**
   * Calculate overlay position for drag tracker.
   */
  const getTrackerStyle = () => {
    if (!draggingNode) return null;

    const { zoom = 1, x: offsetX = 0, y: offsetY = 0 } = getViewport?.() || {};

    return {
      left: draggingNode.x * zoom + offsetX + 100,
      top: draggingNode.y * zoom + offsetY + 100,
    };
  };

  /**
   * Show context menu on right-click.
   */
  const onPaneContextMenu = (event) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  };

  // --- Render ---
  return (
    <div className="w-screen h-screen p-4 relative bg-gray-50">
      <h1 className="text-center text-2xl font-bold my-4">AlgoViz(Graphs)</h1>

      {/* Top action buttons */}
      <Buttons addNode={addNode} handleAutoLayout={handleAutoLayout} />

      {/* Undo/Redo controls */}
      
      <div className="flex justify-center gap-4 my-4">
        <select
    value={validationMode}
    onChange={(e) => setValidationMode(e.target.value)}
    className="border px-4 py-2 rounded shadow text-sm bg-white"
  >
    <option value="dag">DAG Validator</option>
    <option value="tree">Tree Validator</option>
    <option value="bipartite">Bipartite Checker</option>
  </select>

        <button
          onClick={undoRedo.undo}
          className="px-4 py-2 bg-blue-100 text-blue-800 rounded shadow hover:bg-blue-200"
        >
          Undo
        </button>
        <button
          onClick={undoRedo.redo}
          className="px-4 py-2 bg-green-100 text-green-800 rounded shadow hover:bg-green-200"
        >
          Redo
        </button>
      </div>

      {/* DAG validity banner */}
<div
  className={`absolute top-6 right-6 z-10 px-4 py-2 rounded font-semibold border shadow max-w-xs ${
    isValid ? 'bg-green-100 text-green-800 border-green-400' : 'bg-red-100 text-red-800 border-red-400'
  }`}
  title={validationReason}
>
  {validationReason}
</div>

<div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-[260px] bg-white border shadow rounded p-3 text-sm">
  <h2 className="font-bold text-md mb-2">{validatorInfo[validationMode].title}</h2>
  <ul className="list-disc list-inside text-gray-700 space-y-1">
    {validatorInfo[validationMode].rules.map((rule, idx) => (
      <li key={idx}>{rule}</li>
    ))}
  </ul>
</div>



      {/* JSON Preview Panel */}
      <div className="absolute bottom-4 right-4 z-10 bg-white border shadow rounded p-2 text-xs w-[400px] h-[150px] overflow-auto">
        <strong className="block mb-1">🔍 DAG JSON Preview:</strong>
        <pre className="text-gray-800 whitespace-pre-wrap">
          {JSON.stringify({ nodes, edges }, null, 2)}
        </pre>
      </div>

      {/* Context menu for right-click actions */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onAdd={addNode}
          onLayout={handleAutoLayout}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Edge label editor modal */}
      {selectedEdgeId && (
        <EdgeLabelEditor
          inputRef={inputRef}
          edgeLabel={edgeLabel}
          setEdgeLabel={setEdgeLabel}
          handleLabelSave={handleLabelSave}
        />
      )}

      {/* Node label editor modal */}
      {selectedNodeId && (
        <NodeLabelEditor
          inputRef={inputRef}
          label={nodeLabel}
          setLabel={setNodeLabel}
          onSave={handleNodeLabelSave}
        />
      )}

      {/* Drag tracker overlay */}
      {draggingNode && (
        <TrackerOverlay position={getTrackerStyle()} />
      )}

      {/* Main React Flow canvas */}
      <div className="w-full h-150 border rounded shadow overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
      {/* <AnimatePresence>
  {toastMessage && (
    <Toast
      message={toastMessage}
      type={toastMessage.startsWith('✅') ? 'success' : 'error'}
      onClose={() => setToastMessage('')}
    />
  )}
</AnimatePresence> */}
    </div>
  );
}

export default PipelineEditor;
