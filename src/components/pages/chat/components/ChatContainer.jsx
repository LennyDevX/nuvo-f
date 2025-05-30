import React, { memo, useMemo, lazy, Suspense } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaBars, FaUser } from 'react-icons/fa';
import memoWithName from '../../../../utils/performance/memoWithName';
import useIntersectionObserver from '../../../../hooks/performance/useIntersectionObserver';
import GeminiChat from '../../../GeminiChat';

const ChatContainer = ({ 
  leftSidebarOpen, 
  rightSidebarOpen,
  toggleLeftSidebar, 
  toggleRightSidebar,
  shouldReduceMotion,
  isLowPerformance
}) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  // Simplify animations for better performance
  const animationProps = useMemo(() => {
    const simpleAnims = shouldReduceMotion || isLowPerformance;
    
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.2 }
    };
  }, [shouldReduceMotion, isLowPerformance]);
  
  if (!isVisible) {
    return <div ref={ref} className="flex-1 flex flex-col relative" />;
  }
  
  return (
    <div ref={ref} className="absolute inset-0">
      {/* Remove the old toggle buttons since they're now in the GeminiChat component */}
      
      {/* Chat area - Full height and width */}
      <div className="w-full h-full">
        <GeminiChat 
          key="chat-instance" 
          shouldReduceMotion={shouldReduceMotion}
          isLowPerformance={isLowPerformance}
          // Pass the sidebar toggle functions
          toggleLeftSidebar={toggleLeftSidebar}
          toggleRightSidebar={toggleRightSidebar}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
        />
      </div>
    </div>
  );
};

export default memoWithName(ChatContainer);
