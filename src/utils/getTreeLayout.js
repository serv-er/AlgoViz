export const getTreeLayout = (nodes, edges) => {
  const nodeMap = new Map();
  const childMap = new Map();
  const inDegree = new Map();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    childMap.set(n.id, []);
    inDegree.set(n.id, 0);
  });

  edges.forEach((e) => {
    if (childMap.has(e.source)) {
      childMap.get(e.source).push(e.target);
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    }
  });

  // 🌳 Step 1: Detect root (single node with in-degree 0 & connects all)
  let root = nodes.find((n) => inDegree.get(n.id) === 0);
  if (!root) root = nodes[0]; // fallback

  const positioned = {};
  let currentX = 0;
  const spacingX = 150;
  const spacingY = 120;

  const layoutSubtree = (nodeId, depth = 0) => {
    const children = childMap.get(nodeId) || [];
    const childPositions = [];

    for (const child of children) {
      const pos = layoutSubtree(child, depth + 1);
      childPositions.push(pos);
    }

    let x;

    if (childPositions.length === 0) {
      x = currentX;
      currentX += spacingX;
    } else {
      const first = childPositions[0].x;
      const last = childPositions[childPositions.length - 1].x;
      x = (first + last) / 2;
    }

    positioned[nodeId] = { x, y: depth * spacingY };
    return positioned[nodeId];
  };

  layoutSubtree(root.id, 0);

  // Step 2: Place disconnected or orphan nodes (optional)
  nodes.forEach((n) => {
    if (!positioned[n.id]) {
      positioned[n.id] = { x: currentX, y: 0 };
      currentX += spacingX;
    }
  });
  return nodes.map((n) => ({
    ...n,
    position: positioned[n.id] || { x: 0, y: 0 },
  }));
};
