import React from 'react';

const TrackerOverlay = ({ position }) => {
  if (!position) return null;
  return (
    <div
      className="absolute z-50 px-2 py-1 text-xs text-white bg-black/80 rounded shadow pointer-events-none"
      style={{ left: position.left, top: position.top }}
    >
      ({Math.round(position.left)}, {Math.round(position.top)})
    </div>
  );
};


export default TrackerOverlay;
