// components/Toast.js
import { motion } from 'framer-motion';

export default function Toast({ message, type = 'error', onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-sm font-medium
        ${type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 text-xl leading-none">×</button>
      </div>
    </motion.div>
  );
}
