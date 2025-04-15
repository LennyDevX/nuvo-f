import React from 'react';
import { motion } from 'framer-motion';

const QuarterSelector = ({ selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter }) => {
  return (
    <motion.div 
      className="mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col sm:flex-row justify-center gap-6">
        {/* Year Selector with enhanced styling */}
        <div className="flex justify-center">
          <div className="bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-purple-500/20 flex gap-2">
            {["2024", "2025"].map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-5 py-2.5 rounded-lg transition-all duration-300 ${
                  selectedYear === year 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30" 
                    : "bg-black/20 text-gray-400 hover:bg-purple-900/30 hover:text-gray-300"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
        
        {/* Quarter Selector with enhanced styling */}
        <div className="flex justify-center">
          <div className="bg-black/30 backdrop-blur-sm p-1.5 rounded-xl border border-purple-500/20 flex gap-2">
            {["Q1", "Q2", "Q3", "Q4"].map(quarter => (
              <button
                key={quarter}
                onClick={() => setSelectedQuarter(quarter)}
                className={`px-5 py-2.5 rounded-lg transition-all duration-300 ${
                  selectedQuarter === quarter 
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30" 
                    : "bg-black/20 text-gray-400 hover:bg-purple-900/30 hover:text-gray-300"
                }`}
              >
                {quarter}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuarterSelector;
