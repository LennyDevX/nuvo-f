import React, { memo, useMemo } from 'react';
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
  
  if (!isVisible) {
    return <div ref={ref} className="flex-1 flex flex-col relative bg-white dark:bg-gray-900" />;
  }
  
  return (
    <div ref={ref} className="flex-1 flex flex-col h-full overflow-hidden">
      <GeminiChat 
        key="chat-instance" 
        shouldReduceMotion={shouldReduceMotion}
        isLowPerformance={isLowPerformance}
        toggleLeftSidebar={toggleLeftSidebar}
        toggleRightSidebar={toggleRightSidebar}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
      />
    </div>
  );
};

export default memoWithName(ChatContainer);
