import React, { memo, useMemo, lazy, Suspense } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaBars, FaUser } from 'react-icons/fa';
import memoWithName from '../../../../utils/performance/memoWithName';
import useIntersectionObserver from '../../../../hooks/performance/useIntersectionObserver';

// Import GeminiChat directly, not lazily
import GeminiChat from '../../../GeminiChat';

// Simple loader component
const ChatLoader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
  </div>
);

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
  
  // Configurar animaciones basadas en preferencias
  const animationProps = useMemo(() => {
    const simpleAnims = shouldReduceMotion || isLowPerformance;
    
    return {
      initialAnim: simpleAnims ? { opacity: 0 } : { opacity: 0, scale: 0.8 },
      animateAnim: { opacity: 1, scale: 1 },
      exitAnim: simpleAnims ? { opacity: 0 } : { opacity: 0, scale: 0.8 },
      transitionAnim: {
        type: simpleAnims ? "tween" : "spring",
        stiffness: simpleAnims ? undefined : 500,
        damping: simpleAnims ? undefined : 30,
        duration: simpleAnims ? 0.2 : undefined
      },
      buttonAnimProps: simpleAnims ? {} : {
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 }
      }
    };
  }, [shouldReduceMotion, isLowPerformance]);
  
  // Solo renderizar el componente completo si es visible
  if (!isVisible) {
    return <div ref={ref} className="flex-1 flex flex-col relative overflow-hidden" />;
  }
  
  return (
    <div ref={ref} className="flex-1 flex flex-col relative overflow-hidden">
      {/* Toggle buttons - Fixed position to avoid overlapping with content */}
      <div className="fixed top-[calc(var(--header-height)+1rem)] left-6 z-30 pointer-events-none">
        <AnimatePresence>
          {!leftSidebarOpen && (
            <m.button
              initial={animationProps.initialAnim}
              animate={animationProps.animateAnim}
              exit={animationProps.exitAnim}
              transition={animationProps.transitionAnim}
              onClick={toggleLeftSidebar}
              className="p-3 mt-3 bg-gray-800/50 hover:bg-gray-700/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all pointer-events-auto"
              aria-label="Open tools panel"
              {...animationProps.buttonAnimProps}
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
              initial={animationProps.initialAnim}
              animate={animationProps.animateAnim}
              exit={animationProps.exitAnim}
              transition={animationProps.transitionAnim}
              onClick={toggleRightSidebar}
              className="hidden md:block p-3 bg-gray-800/50 hover:bg-gray-700/60 backdrop-blur-md rounded-xl border border-purple-500/30 shadow-lg hover:shadow-purple-500/20 transition-all pointer-events-auto"
              aria-label="Open profile panel"
              {...animationProps.buttonAnimProps}
            >
              <FaUser className="text-gray-200" />
            </m.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Chat area - Full height and width */}
      <div className="w-full h-full">
        <GeminiChat 
          key="chat-instance" 
          shouldReduceMotion={shouldReduceMotion}
          isLowPerformance={isLowPerformance}
        />
      </div>
    </div>
  );
};

export default memoWithName(ChatContainer);
