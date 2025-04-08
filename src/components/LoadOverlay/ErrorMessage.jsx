// src/components/ErrorMessage.js
import React from "react";
import { m } from 'framer-motion'; // Changed from motion to m

const ErrorMessage = ({ error }) => (
  <m.div // Changed from motion.div to m.div
    className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/20 backdrop-blur-sm"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 10 }}
  >
    <div className="flex items-center gap-3">
      <span className="text-red-400 text-2xl">⚠️</span>
      <p className="text-red-100 text-sm">{error}</p>
    </div>
  </m.div>
);

export default ErrorMessage;