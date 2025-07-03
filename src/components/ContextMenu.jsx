import React from 'react';

const ContextMenu = ({ x, y, onAdd, onLayout, onClose }) => (
  <div
    className="absolute z-50 bg-white shadow border rounded w-40"
    style={{ top: y, left: x }}
    onMouseLeave={onClose}
  >
    <button onClick={onAdd} className="w-full text-left px-3 py-2 hover:bg-gray-100">
      ➕ Add Node
    </button>
    <button onClick={onLayout} className="w-full text-left px-3 py-2 hover:bg-gray-100">
      🧭 Auto Layout
    </button>
  </div>
);

export default ContextMenu;
