import React, { useEffect, useRef, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSearch, FaCode, FaRobot } from 'react-icons/fa';

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

    // Different animations for mobile and desktop
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
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
    } else {
      // Desktop: fade in with slight scale
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { 
          duration: 0.2,
          ease: "easeOut"
        }
      };
    }
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
      {/* Backdrop with blur effect for desktop */}
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
      
      {/* Desktop blur overlay for main content */}
      <AnimatePresence>
        {isOpen && (
          <m.div 
            className="hidden md:block fixed inset-0 backdrop-blur-sm z-[150] pointer-events-none"
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
              md:top-22 md:left-6 md:bottom-24 md:right-auto md:h-[calc(100vh-8rem)] md:w-100 md:max-w-[340px] md:rounded-2xl
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

            {/* Header - Fixed height and proper positioning */}
            <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 md:bg-gray-800/95 border-b border-purple-500/20 p-6 md:p-5 relative flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 
                    id="left-sidebar-title"
                    className="text-white font-bold flex items-center gap-4 md:gap-3 text-xl md:text-lg leading-tight mb-3 md:mb-2"
                  >
                    <div className="w-10 h-10 md:w-9 md:h-9 rounded-2xl md:rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <FaRobot className="text-white text-lg md:text-sm" />
                    </div>
                    AI Tools
                  </h2>
                  <p 
                    id="left-sidebar-description" 
                    className="text-base md:text-sm text-gray-300 leading-relaxed font-medium"
                  >
                    Enhance your workflow with AI assistance
                  </p>
                </div>
                <button 
                  ref={firstFocusableRef}
                  onClick={toggleSidebar}
                  className="
                    w-12 h-12 md:w-9 md:h-9 rounded-2xl md:rounded-xl
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
                  <FaTimes className="w-5 h-5 md:w-4 md:h-4 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Content with optimized desktop spacing */}
            <div className="flex-1 bg-gray-900/30 md:bg-transparent overflow-hidden">
              <div 
                className="h-full overflow-y-auto overflow-x-hidden"
                style={{ 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(139, 92, 246, 0.3) transparent'
                }}
              >
                <div className="p-6 md:p-5 space-y-8 md:space-y-5">
                  {/* Tools Section - Optimized desktop spacing */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                      Available Tools
                    </h3>
                    <div className="space-y-6 md:space-y-4">
                      <button 
                        className="
                          btn-nuvo-base btn-nuvo-secondary
                          w-full text-left min-h-[auto] rounded-3xl md:rounded-xl
                          border-2 border-gray-600/30 hover:border-purple-500/60 active:border-purple-500/80
                          bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                          transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                          transform hover:scale-[1.02] active:scale-[0.98]
                          p-6 md:p-4 
                        "
                        aria-label="Web Search - Coming soon"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-bold text-lg md:text-base block mb-1 md:mb-0.5 truncate">Web Search</span>
                            <span className="text-gray-400 text-sm md:text-xs truncate block">Real-time web information</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs md:text-[10px] bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30 font-medium flex-shrink-0">
                              Soon
                            </span>
                            <div className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30 shadow-md">
                              <FaSearch className="text-blue-400 text-lg md:text-sm" />
                            </div>
                          </div>
                        </div>
                      </button>
                      
                      <button 
                        className="
                          btn-nuvo-base btn-nuvo-secondary
                          w-full text-left min-h-[auto] rounded-3xl md:rounded-xl
                          border-2 border-gray-600/30 hover:border-purple-500/60 active:border-purple-500/80
                          bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm
                          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900
                          transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/20
                          transform hover:scale-[1.02] active:scale-[0.98]
                          p-6 md:p-4
                        "
                        aria-label="Image Generator - Coming soon"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-white font-bold text-lg md:text-base block mb-1 md:mb-0.5 truncate">Image Generator</span>
                            <span className="text-gray-400 text-sm md:text-xs truncate block">Create AI-powered visuals</span>
                          </div>
                           <div className="flex items-center gap-3">
                            <span className="text-xs md:text-[10px] bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30 font-medium flex-shrink-0">
                              Soon
                            </span>
                            <div className="w-10 h-10 md:w-8 md:h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30 shadow-md">
                              <FaRobot className="text-purple-400 text-lg md:text-sm" />
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Model Information - Optimized desktop spacing and text overflow fix */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                      AI Models
                    </h3>
                    
                    {/* Gemini 2.5 Flash Experimental */}
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-amber-500/30 p-6 md:p-4 rounded-3xl md:rounded-xl shadow-lg mb-6 md:mb-4">
                      <div className="flex items-center gap-3 md:gap-2 mb-4 md:mb-3">
                        <h4 className="font-bold text-white text-xl md:text-sm truncate">Gemini 2.5 Flash</h4>
                        <div className="text-xs md:text-[10px] bg-amber-600/20 text-amber-300 px-3 py-1 md:px-2 md:py-0.5 rounded-full border border-amber-500/30 font-medium flex-shrink-0">
                          Experimental
                        </div>
                      </div>
                      <p className="text-base md:text-xs text-gray-300 mb-6 md:mb-3 leading-relaxed font-medium">
                        Latest experimental model with enhanced reasoning, multimodal capabilities, and advanced code understanding.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-2 text-sm md:text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Context:</span>
                          <span className="text-amber-300 font-bold">1M tokens</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Speed:</span>
                          <span className="text-green-300 font-bold">Ultra Fast</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Multimodal:</span>
                          <span className="text-green-300 font-bold">Advanced</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Reasoning:</span>
                          <span className="text-purple-300 font-bold">Enhanced</span>
                        </div>
                      </div>
                    </div>

                    {/* Gemini 2.0 Flash Stable - Fixed text overflow */}
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-green-500/30 p-6 md:p-4 rounded-3xl md:rounded-xl shadow-lg">
                      <div className="flex items-center gap-3 md:gap-2 mb-4 md:mb-3">
                        <h4 className="font-bold text-white text-xl md:text-sm truncate">Gemini 2.0 Flash</h4>
                        <div className="text-xs md:text-[10px] bg-green-600/20 text-green-300 px-3 py-1 md:px-2 md:py-0.5 rounded-full border border-green-500/30 font-medium flex-shrink-0">
                          Stable
                        </div>
                      </div>
                      <p className="text-base md:text-xs text-gray-300 mb-6 md:mb-3 leading-relaxed font-medium">
                        Production-ready model optimized for reliability, consistent performance, and blockchain expertise.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 md:gap-2 text-sm md:text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Context:</span>
                          <span className="text-green-300 font-bold">128K tokens</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Reliability:</span>
                          <span className="text-green-300 font-bold">99.9%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Streaming:</span>
                          <span className="text-green-300 font-bold">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-medium">Specialization:</span>
                          <span className="text-purple-300 font-bold truncate">Crypto/Web3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features - Optimized desktop spacing */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                      Capabilities
                    </h3>
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 p-6 md:p-4 rounded-3xl md:rounded-xl shadow-lg">
                      {/* Mobile: Grid layout for compact display */}
                      <div className="grid grid-cols-1 md:hidden gap-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Blockchain explanations</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Market insights</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">NFT & DeFi protocols</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Smart contracts</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Token economics</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Web3 development</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Cross-chain protocols</span>
                        </div>
                        <div 
                          ref={lastFocusableRef}
                          className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl"
                        >
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Real-time data</span>
                        </div>
                      </div>

                      {/* Desktop: Compact grid layout with proper spacing */}
                      <div className="hidden md:grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Blockchain explanations</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Market insights</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">NFT & DeFi protocols</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Smart contracts</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Token economics</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Web3 development</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Cross-chain protocols</span>
                        </div>
                        <div 
                          ref={lastFocusableRef}
                          className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg"
                        >
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Real-time data</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom spacing - Proper spacing for desktop */}
                  <div className="h-8 md:h-6"></div>
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
