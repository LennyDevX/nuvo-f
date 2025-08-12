import React, { useEffect, useRef, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSearch, FaRobot } from 'react-icons/fa';

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
                    className="bg-nuvo-gradient-text font-bold flex items-center gap-4 md:gap-3 text-xl md:text-2xl leading-tight mb-3 md:mb-2"
                  >
                    <div className="w-10 h-10 md:w-9 md:h-9 rounded-2xl md:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg ">
                      <FaRobot className="text-white text-lg md:text-sm s" />
                    </div>
                    Nuvim AI
                  </h2>
                  <p 
                    id="left-sidebar-description" 
                    className="text-base md:text-sm text-gray-300 leading-relaxed font-medium"
                  >
                    Powered by Gemini 2.5 Flash
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
                  {/* Current Capabilities */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                      Current Capabilities
                    </h3>
                    <div className="space-y-4 md:space-y-3">
                      <div className="bg-gradient-to-br from-green-800/30 to-emerald-700/30 border border-green-500/30 p-4 md:p-3 rounded-2xl md:rounded-xl">
                        <div className="flex items-center gap-3 mb-3 md:mb-2">
                          <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-green-600/30 flex items-center justify-center border border-green-500/40">
                            <span className="text-green-400 text-sm md:text-xs">📷</span>
                          </div>
                          <h4 className="text-white font-bold text-base md:text-sm">Image Analysis</h4>
                          <span className="text-xs md:text-[10px] bg-green-600/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30 font-medium">
                            Active
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm md:text-xs leading-relaxed">
                          Upload images for detailed analysis, content description, text extraction and advanced visual understanding.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-800/30 to-pink-700/30 border border-purple-500/30 p-4 md:p-3 rounded-2xl md:rounded-xl">
                        <div className="flex items-center gap-3 mb-3 md:mb-2">
                          <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-purple-600/30 flex items-center justify-center border border-purple-500/40">
                            <span className="text-purple-400 text-sm md:text-xs">🚀</span>
                          </div>
                          <h4 className="text-white font-bold text-base md:text-sm">Nuvos Queries</h4>
                          <span className="text-xs md:text-[10px] bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 font-medium">
                            Active
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm md:text-xs leading-relaxed">
                          Ask about the Nuvos platform, tokenomics, staking, NFTs, marketplace and all ecosystem functionalities.
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-800/30 to-cyan-700/30 border border-blue-500/30 p-4 md:p-3 rounded-2xl md:rounded-xl">
                         <div className="flex items-center gap-3 mb-3 md:mb-2">
                           <div className="w-8 h-8 md:w-6 md:h-6 rounded-lg bg-blue-600/30 flex items-center justify-center border border-blue-500/40">
                             <FaSearch className="text-blue-400 text-sm md:text-xs" />
                           </div>
                           <h4 className="text-white font-bold text-base md:text-sm">Web Search</h4>
                           <span className="text-xs md:text-[10px] bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-500/30 font-medium">
                             Coming Soon
                           </span>
                         </div>
                         <p className="text-gray-300 text-sm md:text-xs leading-relaxed">
                           Real-time web information search and retrieval for up-to-date answers and current data.
                         </p>
                       </div>
                    </div>
                  </div>
                  
                  {/* Gemini 2.5 Flash Information */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                       AI Model
                     </h3>
                    
                    <div className="bg-gradient-to-br from-blue-800/40 to-purple-700/40 backdrop-blur-sm border border-blue-500/40 p-6 md:p-4 rounded-3xl md:rounded-xl shadow-lg mb-6 md:mb-4">
                      <div className="flex items-center gap-3 md:gap-2 mb-4 md:mb-3">
                        <div className="w-10 h-10 md:w-8 md:h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg md:text-sm">G</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-lg md:text-sm">Gemini 2.5 Flash</h4>
                          <div className="text-xs md:text-[10px] bg-blue-600/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30 font-medium inline-block mt-1">
                            Experimental
                          </div>
                        </div>
                      </div>
                      <p className="text-base md:text-xs text-gray-200 mb-4 md:mb-3 leading-relaxed font-medium">
                         Google's most advanced AI model, optimized for speed and multimodal capabilities.
                       </p>
                      
                      {/* Specifications */}
                      <div className="grid grid-cols-2 gap-3 md:gap-2 text-sm md:text-xs mb-4">
                        <div className="bg-gray-800/50 p-3 md:p-2 rounded-xl">
                           <div className="text-gray-400 font-medium mb-1">Context</div>
                           <div className="text-blue-300 font-bold">1M tokens</div>
                         </div>
                         <div className="bg-gray-800/50 p-3 md:p-2 rounded-xl">
                           <div className="text-gray-400 font-medium mb-1">Speed</div>
                           <div className="text-green-300 font-bold">Ultra Fast</div>
                         </div>
                         <div className="bg-gray-800/50 p-3 md:p-2 rounded-xl">
                           <div className="text-gray-400 font-medium mb-1">Multimodal</div>
                           <div className="text-purple-300 font-bold">Advanced</div>
                         </div>
                         <div className="bg-gray-800/50 p-3 md:p-2 rounded-xl">
                           <div className="text-gray-400 font-medium mb-1">Reasoning</div>
                           <div className="text-orange-300 font-bold">Enhanced</div>
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Specialized Knowledge */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                       Specialized Knowledge
                     </h3>
                    <div className="bg-gradient-to-br from-gray-800/90 to-gray-700/80 backdrop-blur-sm border border-purple-500/20 p-6 md:p-4 rounded-3xl md:rounded-xl shadow-lg">
                      {/* Mobile: Grid layout for compact display */}
                      <div className="grid grid-cols-1 md:hidden gap-3 text-sm">
                        <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                          <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium">Nuvos Ecosystem</span>
                         </div>
                         <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">Blockchain & Web3</span>
                         </div>
                         <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">NFTs & Marketplace</span>
                         </div>
                         <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">Smart Contracts</span>
                         </div>
                         <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">Staking & Rewards</span>
                         </div>
                         <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">Tokenomics</span>
                         </div>
                         <div className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl">
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">DeFi Protocols</span>
                         </div>
                         <div 
                           ref={lastFocusableRef}
                           className="flex items-center gap-3 text-gray-300 p-3 bg-gray-700/30 rounded-xl"
                         >
                           <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium">Programming</span>
                        </div>
                      </div>

                      {/* Desktop: Compact grid layout with proper spacing */}
                      <div className="hidden md:grid grid-cols-1 gap-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                          <span className="font-medium truncate">Nuvos Ecosystem</span>
                         </div>
                         <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">Blockchain & Web3</span>
                         </div>
                         <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">NFTs & Marketplace</span>
                         </div>
                         <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">Smart Contracts</span>
                         </div>
                         <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">Staking & Rewards</span>
                         </div>
                         <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">Tokenomics</span>
                         </div>
                         <div className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg">
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">DeFi Protocols</span>
                         </div>
                         <div 
                           ref={lastFocusableRef}
                           className="flex items-center gap-2 text-gray-300 p-2 bg-gray-700/30 rounded-lg"
                         >
                           <div className="w-1.5 h-1.5 bg-purple-400 rounded-full flex-shrink-0"></div>
                           <span className="font-medium truncate">Programming</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tips for Better Interaction */}
                  <div>
                    <h3 className="text-sm md:text-xs uppercase tracking-wider text-gray-400 mb-6 md:mb-4 font-bold">
                       Usage Tips
                     </h3>
                    <div className="space-y-4 md:space-y-3">
                      <div className="bg-gradient-to-br from-amber-800/20 to-orange-700/20 border border-amber-500/20 p-4 md:p-3 rounded-2xl md:rounded-xl">
                        <h4 className="text-amber-300 font-bold text-sm md:text-xs mb-2 md:mb-1">💡 Specific Questions</h4>
                         <p className="text-gray-300 text-xs md:text-[10px] leading-relaxed">
                           Be specific in your questions to get more precise and useful answers.
                         </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-cyan-800/20 to-blue-700/20 border border-cyan-500/20 p-4 md:p-3 rounded-2xl md:rounded-xl">
                        <h4 className="text-cyan-300 font-bold text-sm md:text-xs mb-2 md:mb-1">🖼️ Visual Analysis</h4>
                         <p className="text-gray-300 text-xs md:text-[10px] leading-relaxed">
                           Upload images for detailed analysis, text extraction or visual explanations.
                         </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-emerald-800/20 to-green-700/20 border border-emerald-500/20 p-4 md:p-3 rounded-2xl md:rounded-xl">
                        <h4 className="text-emerald-300 font-bold text-sm md:text-xs mb-2 md:mb-1">🔗 Nuvos Context</h4>
                         <p className="text-gray-300 text-xs md:text-[10px] leading-relaxed">
                           Ask about any aspect of the Nuvos platform for up-to-date information.
                         </p>
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
