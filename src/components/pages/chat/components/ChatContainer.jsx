import React from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaBars, FaUser } from 'react-icons/fa';
import GeminiChat from '../../../GeminiChat/GeminiChat';
import '../../../../styles/chat.css'; // Import your CSS file for chat styles


const ChatContainer = ({ 
  leftSidebarOpen, 
  rightSidebarOpen,
  toggleLeftSidebar, 
  toggleRightSidebar 
}) => {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Toggle buttons - Fixed position to avoid overlapping with content */}
      <div className="fixed top-[calc(var(--header-height)+1rem)] left-6 z-30 pointer-events-none">
        <AnimatePresence>
          {!leftSidebarOpen && (
            <m.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={toggleLeftSidebar}
              className="p-3 mt-3 bg-gray-800/50 hover:bg-gray-700/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all pointer-events-auto"
              aria-label="Open tools panel"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaBars className="text-gray-200" />
            </m.button>
          )}
        </AnimatePresence>
      </div>

      {/* Right sidebar button - Fixed position */}
      <div className="fixed top-[calc(var(--header-height)+1rem)] right-6 z-30 pointer-events-none">
        <AnimatePresence>
          {!rightSidebarOpen && (
            <m.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              onClick={toggleRightSidebar}
              className="hidden md:block p-3 bg-gray-800/50 hover:bg-gray-700/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all pointer-events-auto"
              aria-label="Open profile panel"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaUser className="text-gray-200" />
            </m.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Chat area - Full height and width */}
      <div className="w-full h-full">
        <GeminiChat key="chat-instance" />
      </div>
    </div>
  );
};

export default ChatContainer;
