import React from 'react';
import { FaPlus, FaProjectDiagram } from 'react-icons/fa';

const Buttons = ({ addNode, handleAutoLayout }) => (
  <div className="absolute top-6 left-6 z-10 flex gap-3">
    <button
      onClick={addNode}
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      <FaPlus /> Add Node
    </button>
    <button
      onClick={handleAutoLayout}
      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
    >
      <FaProjectDiagram /> Auto Layout
    </button>
  </div>
);

export default Buttons;
