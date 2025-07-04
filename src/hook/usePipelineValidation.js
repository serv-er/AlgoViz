import { useEffect } from 'react';

export default function useGraphValidation(
  nodes,
  edges,
  mode,
  setIsValid,
  setInvalidEdgeIds,
  setValidationReason
) {
  useEffect(() => {
    const nodeIds = nodes.map((n) => n.id);
    const edgeMap = new Map(nodeIds.map((id) => [id, []]));
    const edgeIdLookup = new Map();

    // Check edge rules before mode-specific logic
    for (const edge of edges) {
      if (
        edge.source === edge.target || // self-loop
        edge.sourceHandle === edge.targetHandle // invalid direction (e.g. source->source or target->target)
      ) {
        setIsValid(false);
        setInvalidEdgeIds([edge.id]);
        setValidationReason('❌ Self-loop or invalid edge direction detected');
        return;
      }

      edgeMap.get(edge.source)?.push(edge.target);
      edgeIdLookup.set(`${edge.source}->${edge.target}`, edge.id);
    }

    if (mode === 'dag') {
      // ✅ DAG-specific extra checks
      if (nodes.length < 2) {
        setIsValid(false);
        setInvalidEdgeIds([]);
        setValidationReason('❌ DAG must have at least 2 nodes');
        return;
      }

      const allConnected = nodes.every((node) =>
        edges.some((e) => e.source === node.id || e.target === node.id)
      );
      if (!allConnected) {
        setIsValid(false);
        setInvalidEdgeIds([]);
        setValidationReason('❌ Not all nodes are connected');
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

      const hasCycle = cycleEdges.size > 0;
      setIsValid(!hasCycle);
      setInvalidEdgeIds([...cycleEdges]);
      setValidationReason(
        hasCycle ? '❌ Cycle Detected – Not a DAG' : '✅ Graph is a Valid DAG'
      );
      return;
    }

    // ✅ TREE
    if (mode === 'tree') {
      const parentCount = new Map();
      let hasCycle = false;

      const visited = new Set();
      const dfsTree = (nodeId, parentId) => {
        if (visited.has(nodeId)) {
          hasCycle = true;
          return;
        }
        visited.add(nodeId);
        (edgeMap.get(nodeId) || []).forEach((neigh) => dfsTree(neigh, nodeId));
      };

      for (const edge of edges) {
        parentCount.set(edge.target, (parentCount.get(edge.target) || 0) + 1);
      }

      const rootNodes = nodeIds.filter((id) => !edges.some((e) => e.target === id));
      const multipleRoots = rootNodes.length !== 1;
      const invalidParent = [...parentCount.values()].some((v) => v > 1);

      if (multipleRoots) {
        setIsValid(false);
        setInvalidEdgeIds([]);
        setValidationReason('❌ Tree must have exactly one root node');
        return;
      }

      dfsTree(rootNodes[0], null);

      if (hasCycle) {
        setIsValid(false);
        setInvalidEdgeIds([]);
        setValidationReason('❌ Cycle Detected – Not a Tree');
        return;
      }

      if (invalidParent) {
        setIsValid(false);
        setInvalidEdgeIds([]);
        setValidationReason('❌ A node has more than one parent');
        return;
      }

      setIsValid(true);
      setInvalidEdgeIds([]);
      setValidationReason('✅ Graph is a Valid Tree');
      return;
    }

    // ✅ BIPARTITE
    if (mode === 'bipartite') {
      const color = {};
      let isBipartite = true;
      const queue = [];

      for (const id of nodeIds) {
        if (color[id]) continue;

        queue.push(id);
        color[id] = 1;

        while (queue.length) {
          const current = queue.shift();
          for (const neigh of edgeMap.get(current) || []) {
            if (!color[neigh]) {
              color[neigh] = 3 - color[current];
              queue.push(neigh);
            } else if (color[neigh] === color[current]) {
              isBipartite = false;
              break;
            }
          }
        }
      }

      setIsValid(isBipartite);
      setInvalidEdgeIds([]);
      setValidationReason(
        isBipartite
          ? '✅ Graph is Bipartite'
          : '❌ Same group nodes connected – Not Bipartite'
      );
    }
  }, [nodes, edges, mode, setIsValid, setInvalidEdgeIds, setValidationReason]);
}
