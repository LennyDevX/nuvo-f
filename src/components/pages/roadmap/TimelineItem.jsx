import React from 'react';
import { motion } from 'framer-motion';

const TimelineItem = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay: index * 0.1 }}
    className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8"
  >
    {/* Dot marker with pulse animation */}
    <div className={`absolute left-4 sm:left-1/2 w-4 h-4 rounded-full bg-purple-500 
      transform -translate-x-2 sm:-translate-x-2 z-10 
      ${item.status === "Active" ? "animate-pulse" : ""}`}
      style={{ 
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.2)",
        top: "30px"
      }}
    />
    
    {/* Main Card with enhanced styling */}
    <div 
      className={`ml-10 sm:ml-0 bg-black/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-purple-500/20
        hover:border-purple-500/40 transition-all duration-300
        ${index % 2 === 0 ? 'sm:mr-8' : 'sm:ml-8 sm:col-start-2'}`}
      style={{ 
        boxShadow: item.status === "Completed" ? "0 8px 32px rgba(139, 92, 246, 0.1)" : "none" 
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{item.icon}</span>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text">
            {item.title}
          </h3>
          <p className="text-sm text-purple-300">{item.phase}</p>
        </div>
      </div>

      {/* Progress Bar with enhanced styling */}
      <div className="h-2.5 bg-purple-900/30 rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${item.progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${
            item.progress === 100 ? 'bg-gradient-to-r from-green-500 to-green-400' : 
            item.progress > 0 ? 'bg-gradient-to-r from-purple-600 to-fuchsia-500' : 
            'bg-gray-700'
          }`}
        />
      </div>

      {/* Items List with enhanced styling */}
      <ul className="space-y-3">
        {item.items.map((subItem, i) => (
          <motion.li 
            key={i} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + (i * 0.1) }}
            className="flex items-center gap-3 text-sm sm:text-base"
          >
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
              subItem.status === 'completed' ? 'bg-green-500' :
              subItem.status === 'in-progress' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} />
            <span className="text-gray-300 flex-1">{subItem.text}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300">
              {subItem.date}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>

    {/* Secondary Content with enhanced styling */}
    <div className={`hidden sm:block ${index % 2 === 0 ? 'sm:col-start-2' : ''}`}>
      <div className="bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
        <h4 className="text-xl font-semibold text-transparent bg-clip-text bg-nuvo-gradient-text mb-4">
          Phase Objectives
        </h4>
        
        {/* Strategic Focus */}
        <div className="mb-5">
          <span className="text-xs font-medium text-purple-300 tracking-wider">STRATEGIC FOCUS</span>
          <div className="mt-2 text-sm text-gray-300 bg-black/20 p-3 rounded-lg">
            {item.status === "Completed" ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Phase Completed Successfully
              </div>
            ) : item.status === "Active" ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                In Active Development
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Planning & Preparation
              </div>
            )}
          </div>
        </div>

        {/* Key Deliverables with enhanced styling */}
        <div className="space-y-2 mb-5">
          <span className="text-xs font-medium text-purple-300 tracking-wider">KEY DELIVERABLES</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-600/10">
              <div className="text-xs text-purple-200 mb-1">Progress</div>
              <div className="text-xl font-semibold text-transparent bg-clip-text bg-nuvo-gradient-text">
                {item.progress}%
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-600/10">
              <div className="text-xs text-purple-200 mb-1">Timeline</div>
              <div className="text-xl font-semibold text-transparent bg-clip-text bg-nuvo-gradient-text">
                {item.items[0].date.split(' ')[0]}
              </div>
            </div>
          </div>
        </div>

        {/* Development Status with enhanced styling */}
        <div className="mt-4">
          <span className="text-xs font-medium text-purple-300 tracking-wider">PHASE IMPACT</span>
          <div className="mt-2 text-sm bg-black/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-gray-300">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              {item.status === "Completed" ? "Milestone Achieved" : 
               item.status === "Active" ? "Development in Progress" : "Future Implementation"}
            </div>
            <div className="flex items-center gap-2 text-gray-300 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              {`Phase ${item.progress >= 100 ? "Completed" : 
                item.progress > 0 ? "In Progress" : "Not Started"}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export default TimelineItem;
