import React from 'react';

const EdgeLabelEditor = ({ inputRef, edgeLabel, setEdgeLabel, handleLabelSave }) => (
  <div className="absolute top-20 right-6 z-10 bg-white shadow-lg p-4 rounded border w-64">
    <h3 className="font-semibold mb-2">Edit Edge Label</h3>
    <input
      ref={inputRef}
      value={edgeLabel}
      onChange={(e) => setEdgeLabel(e.target.value)}
      placeholder="Enter label"
      className="w-full border px-2 py-1 rounded mb-2"
    />
    <button
      onClick={handleLabelSave}
      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
    >
      Save
    </button>
  </div>
);

export default EdgeLabelEditor;
