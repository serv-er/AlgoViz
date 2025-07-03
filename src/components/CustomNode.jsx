import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node bg-white border shadow px-4 py-2 rounded">
      <Handle
        type="target"
        position={Position.Left}
        id="a"
        style={{ background: '#4ade80' }}
      />
      <div className="font-semibold text-sm">{data.label}</div>
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{ background: '#3b82f6' }}
      />
    </div>
  );
};

export default CustomNode;
