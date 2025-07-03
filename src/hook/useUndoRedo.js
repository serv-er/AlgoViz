import { useRef } from 'react';

export default function useUndoRedo(initialNodes, initialEdges, setNodes, setEdges) {
  const history = useRef([{ nodes: initialNodes, edges: initialEdges }]);
  const pointer = useRef(0);

  const updateHistory = (nodes, edges) => {
    const next = { nodes: [...nodes], edges: [...edges] };
    history.current = history.current.slice(0, pointer.current + 1);
    history.current.push(next);
    pointer.current++;
  };

  const undo = () => {
    if (pointer.current <= 0) return;
    pointer.current--;
    const { nodes, edges } = history.current[pointer.current];
    setNodes(nodes);
    setEdges(edges);
  };

  const redo = () => {
    if (pointer.current >= history.current.length - 1) return;
    pointer.current++;
    const { nodes, edges } = history.current[pointer.current];
    setNodes(nodes);
    setEdges(edges);
  };

  return { updateHistory, undo, redo };
}
