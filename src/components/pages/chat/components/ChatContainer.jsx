import React, { memo, useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GeminiChat from '../../../GeminiChat';
import useIntersectionObserver from '../../../../hooks/performance/useIntersectionObserver';

// Performance tracking
const performanceMetrics = {
  renderCount: 0,
  totalRenderTime: 0,
  averageRenderTime: 0,
  lastRenderTime: 0
};

const ChatContainer = memo(({ 
  leftSidebarOpen, 
  rightSidebarOpen,
  toggleLeftSidebar, 
  toggleRightSidebar,
  shouldReduceMotion,
  isLowPerformance
}) => {
  const renderStartTime = useRef(Date.now());
  const [metrics, setMetrics] = useState(null);
  
  // Track render performance
  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    performanceMetrics.renderCount++;
    performanceMetrics.totalRenderTime += renderTime;
    performanceMetrics.averageRenderTime = performanceMetrics.totalRenderTime / performanceMetrics.renderCount;
    performanceMetrics.lastRenderTime = Date.now();
    
    // Update metrics every 10 renders
    if (performanceMetrics.renderCount % 10 === 0) {
      setMetrics({
        renders: performanceMetrics.renderCount,
        avgRenderTime: Math.round(performanceMetrics.averageRenderTime * 100) / 100,
        lastRender: renderTime
      });
    }
  });

  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedToggleLeft = useCallback(toggleLeftSidebar, [toggleLeftSidebar]);
  const memoizedToggleRight = useCallback(toggleRightSidebar, [toggleRightSidebar]);
  
  if (!isVisible) {
    return (
      <div 
        ref={ref} 
        className="flex-1 flex flex-col relative bg-white dark:bg-gray-900"
        data-component="chat-container-loading"
      />
    );
  }
  
  return (
    <div 
      ref={ref} 
      className="flex-1 flex flex-col h-full overflow-hidden"
      data-component="chat-container"
      data-metrics={metrics ? JSON.stringify(metrics) : null}
    >
      <GeminiChat 
        key="optimized-chat-instance"
        shouldReduceMotion={Boolean(shouldReduceMotion)}
        isLowPerformance={Boolean(isLowPerformance)}
        toggleLeftSidebar={memoizedToggleLeft}
        toggleRightSidebar={memoizedToggleRight}
        leftSidebarOpen={Boolean(leftSidebarOpen)}
        rightSidebarOpen={Boolean(rightSidebarOpen)}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.leftSidebarOpen === nextProps.leftSidebarOpen &&
    prevProps.rightSidebarOpen === nextProps.rightSidebarOpen &&
    prevProps.shouldReduceMotion === nextProps.shouldReduceMotion &&
    prevProps.isLowPerformance === nextProps.isLowPerformance
  );
});

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;
