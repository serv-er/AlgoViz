import { useEffect } from 'react';

export default function usePipelineValidation(nodes, edges, setIsValid, setInvalidEdgeIds) {
  useEffect(() => {
    const nodeIds = nodes.map((n) => n.id);
    const edgeMap = new Map(nodeIds.map((id) => [id, []]));
    const edgeIdLookup = new Map(); // Map from source-target pair to edge ID

    for (const edge of edges) {
      if (
        edge.source === edge.target ||
        edge.sourceHandle === edge.targetHandle
      ) {
        setIsValid(false);
        setInvalidEdgeIds([edge.id]);
        return;
      }

      edgeMap.get(edge.source)?.push(edge.target);
      edgeIdLookup.set(`${edge.source}->${edge.target}`, edge.id);
    }

    if (nodes.length < 2) {
      setIsValid(false);
      setInvalidEdgeIds([]);
      return;
    }

    const allConnected = nodes.every((node) =>
      edges.some((e) => e.source === node.id || e.target === node.id)
    );
    if (!allConnected) {
      setIsValid(false);
      setInvalidEdgeIds([]);
      return;
    }

    const visited = new Set();
    const recStack = new Set();
    const cycleEdges = new Set();

    const dfs = (nodeId, path = []) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const neighbors = edgeMap.get(nodeId) || [];
      for (const neighbor of neighbors) {
        const edgeKey = `${nodeId}->${neighbor}`;
        const edgeId = edgeIdLookup.get(edgeKey);

        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, edgeId]);
        } else if (recStack.has(neighbor)) {
          // Found a cycle: collect cycle path from current path
          cycleEdges.add(edgeId);
          for (let i = path.length - 1; i >= 0; i--) {
            cycleEdges.add(path[i]);
            if (edges.find((e) => e.id === path[i])?.target === neighbor) break;
          }
        }
      }

      recStack.delete(nodeId);
    };

    for (const id of nodeIds) {
      if (!visited.has(id)) dfs(id);
    }

    const isCycle = cycleEdges.size > 0;
    setIsValid(!isCycle);
    setInvalidEdgeIds([...cycleEdges]);
  }, [nodes, edges, setIsValid, setInvalidEdgeIds]);
}
