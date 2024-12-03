// src/components/LoadingOverlay.js
import React from "react";
import { motion } from "framer-motion";

const LoadingOverlay = () => (
  <motion.div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-black/80 rounded-2xl p-6 border border-purple-500/20"
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <p className="text-purple-400 text-base">Loading data...</p>
      </div>
    </motion.div>
  </motion.div>
);

export default LoadingOverlay;