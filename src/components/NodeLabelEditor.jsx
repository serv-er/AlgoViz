import React from 'react';

const NodeLabelEditor = ({ inputRef, label, setLabel, onSave }) => {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white border shadow rounded p-3 flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Enter node label"
        className="px-2 py-1 border rounded text-sm"
      />
      <button
        onClick={onSave}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Save
      </button>
    </div>
  );
};

export default NodeLabelEditor;
