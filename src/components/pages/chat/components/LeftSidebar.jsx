import React, { useEffect, useRef, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaPuzzlePiece, FaCode, FaRobot } from 'react-icons/fa';

const LeftSidebar = ({ isOpen, toggleSidebar }) => {
  const focusTrapRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Performance and accessibility optimizations
  const shouldReduceMotion = useMemo(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const isLowPerformance = useMemo(() => {
    // Check for low-end devices
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const hasSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
    const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2;
    const hasSlowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;
    
    return hasSlowConnection || hasLowMemory || hasSlowCPU || shouldReduceMotion;
  }, [shouldReduceMotion]);

  // Optimized animation configurations
  const getBackdropAnimationConfig = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 }
      };
    }

    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    };
  }, [shouldReduceMotion]);

  const getSidebarAnimationConfig = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      };
    }

    return {
      initial: { y: "100%", x: 0 },
      animate: { y: 0, x: 0 },
      exit: { y: "100%", x: 0 },
      transition: { 
        type: 'spring', 
        damping: isLowPerformance ? 40 : 30, 
        stiffness: isLowPerformance ? 200 : 300,
        mass: isLowPerformance ? 1.2 : 0.8
      }
    };
  }, [shouldReduceMotion, isLowPerformance]);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        firstFocusableRef.current?.focus();
        // Remove focus immediately to prevent persistent focus styling
        setTimeout(() => {
          firstFocusableRef.current?.blur();
        }, 100);
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      toggleSidebar();
    }
    
    // Tab trapping
    if (e.key === 'Tab') {
      const firstElement = firstFocusableRef.current;
      const lastElement = lastFocusableRef.current;
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
            {...getBackdropAnimationConfig}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isOpen && (
          <m.div
            ref={focusTrapRef}
            onKeyDown={handleKeyDown}
            className="
              fixed z-[200] md:z-[300] shadow-2xl
              bottom-0 left-0 right-0 h-[90vh] rounded-t-3xl
              md:top-20 md:left-8 md:right-auto md:h-[calc(100vh-6rem)] md:w-96 md:max-w-[400px] md:rounded-3xl
              bg-gray-900/95 md:bg-gray-900/98 backdrop-blur-xl
              border-purple-500/20
              border-t-2 md:border md:border-purple-500/20
              flex flex-col
              md:shadow-2xl md:shadow-purple-900/30
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="left-sidebar-title"
            aria-describedby="left-sidebar-description"
            {...getSidebarAnimationConfig}
          >
            {/* Mobile drag indicator */}
            <div className="md:hidden flex justify-center pt-4 pb-3 flex-shrink-0">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
            </div>

            {/* Header - Redesigned with proper spacing */}
            <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 md:bg-gray-800/95 border-b border-purple-500/20 p-6 md:p-8 relative flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 
                    id="left-sidebar-title"
                    className="text-white font-bold flex items-center gap-4 text-xl md:text-2xl leading-tight mb-3"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FaRobot className="text-white text-lg md:text-xl" />
                    </div>
                    AI Tools
                  </h2>
                  <p 
                    id="left-sidebar-description" 
                    className="text-base md:text-lg text-gray-300 leading-relaxed font-medium"
                  >
                    Enhance your workflow with AI assistance
                  </p>
                </div>
                <button 
                  ref={firstFocusableRef}
                  onClick={toggleSidebar}
                  className="
                    w-12 h-12 md:w-14 md:h-14 rounded-2xl
                    bg-gray-700/90 hover:bg-gray-600 active:bg-gray-500
                    border border-gray-600/50 hover:border-purple-500/60
                    text-gray-300 hover:text-white 
                    transition-all duration-200 ease-out
                    flex items-center justify-center
                    backdrop-filter blur(8px)
                    shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                    group flex-shrink-0
                  "
                  aria-label="Close AI tools panel"
                  onFocus={(e) => e.target.blur()}
                >
                  <FaTimes className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content with proper spacing */}
            <div className="flex-1 bg-gray-900/30 md:bg-transparent overflow-hidden">
              <div 
                className="h-full overflow-y-auto overflow-x-hidden"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
                }}
              >
                <div className="p-6 md:p-8 space-y-8 md:space-y-12">
                  {/* Tools Section - Enhanced spacing */}
                  <div>
                    <h3 className="text-sm md:text-base uppercase tracking-wider text-gray-400 mb-6 md:mb-8 font-bold">
                      Available Tools
                    </h3>
                    <div className="space-y-6 md:space-y-8">
                      <button 
                        className="
                          btn-nuvo-base btn-nuvo-secondary
                          w-full text-left min-h-[100px] md:min-h-[120px] rounded-3xl
                          border-2 border-gray-600/30 hover:border-purple-500/60 active:border-purple-500/80
                          bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                          transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                          transform hover:scale-[1.02] active:scale-[0.98]
                          p-6 md:p-8
                        "
                        aria-label="Code Assistant - Coming soon"
                      >
                        <div className="flex items-center gap-5 mb-4">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30 shadow-lg">
                            <FaCode className="text-purple-400 text-2xl md:text-3xl" />
                          </div>
                          <div className="flex-1">
                            <span className="text-white font-bold text-lg md:text-xl block mb-2">Code Assistant</span>
                            <span className="text-gray-400 text-sm md:text-base">AI-powered coding help</span>
                          </div>
                        </div>
                        <div className="text-sm md:text-base bg-yellow-600/20 text-yellow-300 px-6 py-3 rounded-2xl inline-block border border-yellow-500/30 font-medium">
                          Coming soon
                        </div>
                      </button>
                      
                      <button 
                        className="
                          btn-nuvo-base btn-nuvo-secondary
                          w-full text-left min-h-[100px] md:min-h-[120px] rounded-3xl
                          border-2 border-gray-600/30 hover:border-purple-500/60 active:border-purple-500/80
                          bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                          transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                          transform hover:scale-[1.02] active:scale-[0.98]
                          p-6 md:p-8
                        "
                        aria-label="Image Generator - Coming soon"
                      >
                        <div className="flex items-center gap-5 mb-4">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30 shadow-lg">
                            <FaRobot className="text-purple-400 text-2xl md:text-3xl" />
                          </div>
                          <div className="flex-1">
                            <span className="text-white font-bold text-lg md:text-xl block mb-2">Image Generator</span>
                            <span className="text-gray-400 text-sm md:text-base">Create AI-powered visuals</span>
                          </div>
                        </div>
                        <div className="text-sm md:text-base bg-yellow-600/20 text-yellow-300 px-6 py-3 rounded-2xl inline-block border border-yellow-500/30 font-medium">
                          Coming soon
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Model Information - Enhanced spacing */}
                  <div>
                    <h3 className="text-sm md:text-base uppercase tracking-wider text-gray-400 mb-6 md:mb-8 font-bold">
                      AI Model Info
                    </h3>
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 p-6 md:p-8 rounded-3xl shadow-lg">
                      <h4 className="font-bold text-white mb-4 text-xl md:text-2xl">Google Gemini Pro</h4>
                      <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed font-medium">
                        Advanced language model optimized for blockchain and crypto conversations with real-time information.
                      </p>
                      <div className="space-y-6 text-base md:text-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Model:</span>
                          <span className="text-purple-300 font-bold">Gemini Pro</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Context:</span>
                          <span className="text-purple-300 font-bold">32K tokens</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Streaming:</span>
                          <span className="text-green-300 font-bold">Enabled</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features - Enhanced spacing */}
                  <div>
                    <h3 className="text-sm md:text-base uppercase tracking-wider text-gray-400 mb-6 md:mb-8 font-bold">
                      Capabilities
                    </h3>
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 p-6 md:p-8 rounded-3xl shadow-lg">
                      <ul className="space-y-6 text-base md:text-lg" role="list">
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Blockchain technology explanations</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Cryptocurrency market insights</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">NFT and DeFi protocols</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Smart contract guidance</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Token economics analysis</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Web3 development best practices</span>
                        </li>
                        <li className="flex items-start gap-5 text-gray-300">
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Cross-chain protocol understanding</span>
                        </li>
                        <li 
                          ref={lastFocusableRef}
                          className="flex items-start gap-5 text-gray-300"
                        >
                          <div className="w-4 h-4 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="leading-relaxed font-medium">Real-time market data integration</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Bottom spacing */}
                  <div className="h-8 md:h-12"></div>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LeftSidebar;
