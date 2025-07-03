import { useEffect } from 'react';

export default function useKeyboardShortcuts(setNodes, setEdges) {
  useEffect(() => {
    const handleKeyDown = (e) => {
           const activeElement = document.activeElement;
    const isTyping =
      activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA';

    // ⛔ Don't delete if focused inside an input
    if (isTyping) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((e) => !e.selected));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNodes, setEdges]);
}
