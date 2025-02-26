import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { FaCode, FaCoins, FaStore, FaCrown, FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import useReducedMotion from '../../../hooks/useReducedMotion';

const phases = [
  {
    id: 1,
    title: "Open Source Dev",
    subtitle: "Join & Build",
    description: "Start your journey contributing to our open source ecosystem",
    icon: <FaCode />,
    color: "from-indigo-400 via-blue-500 to-cyan-500",
    stat: "Phase 1",
    progress: "25%",
    mobileColor: "bg-gradient-to-br from-blue-900 to-blue-800",
    textColor: "text-blue-200"
  },
  {
    id: 2,
    title: "Earn & Stake",
    subtitle: "Earn Rewards",
    description: "Convert your contributions into valuable assets",
    icon: <FaCoins />,
    color: "from-blue-500 via-indigo-500 to-violet-600",
    stat: "Phase 2",
    mobileColor: "bg-gradient-to-br from-violet-900 to-purple-800",
    textColor: "text-purple-200"
  },
  {
    id: 3,
    title: "NFT Access",
    subtitle: "Unlock Perks",
    description: "Get exclusive NFTs and marketplace benefits",
    icon: <FaStore />,
    color: "from-fuchsia-500 via-purple-600 to-purple-700",
    stat: "Phase 3",
    mobileColor: "bg-gradient-to-br from-fuchsia-900 to-pink-800",
    textColor: "text-pink-200"
  },
  {
    id: 4,
    title: "Elite Developer",
    subtitle: "Master Builder",
    description: "Reach the pinnacle of our developer ecosystem",
    icon: <FaCrown />,
    color: "from-amber-400 via-orange-500 to-rose-500",
    stat: "Phase 4",
    mobileColor: "bg-gradient-to-br from-amber-900 to-orange-800",
    textColor: "text-orange-200"
  }
];

const CircleDeveloper = ({ activePhase }) => {
  const [isDetailedView, setIsDetailedView] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion();

  // Touch gesture handling
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const angle = Math.atan2(touch.clientY - center.y, touch.clientX - center.x);
    const section = Math.floor((angle + Math.PI) / (Math.PI / 2)) % 4 + 1;
    setSelectedPhase(section);
  }, []);

  const handlePhaseClick = useCallback((phase) => {
    setSelectedPhase(phase.id);
    setIsDetailedView(true);
    
    if (!prefersReducedMotion) {
      controls.start({
        scale: [1, 1.05, 1],
        transition: { duration: 0.3 }
      });
    }
  }, [controls, prefersReducedMotion]);

  // Helper function for conditional animations
  const getConditionalAnimation = (animationObject) => {
    return prefersReducedMotion ? {} : animationObject;
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background effects with enhanced animations */}
      <motion.div 
        className="absolute inset-0 pointer-events-none overflow-hidden"
        initial={false}
      >
        <motion.div 
          className="absolute inset-0"
          animate={getConditionalAnimation({
            background: [
              'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15), transparent 50%)',
              'radial-gradient(circle at 70% 70%, rgba(99, 102, 241, 0.15), transparent 50%)',
              'radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15), transparent 50%)',
            ],
          })}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      
      {/* Main circle container with updated mobile dimensions */}
      <div className="relative w-[260px] h-[260px] sm:w-[500px] sm:h-[500px]">
        {/* Animated gradient border with enhanced effects */}
        <motion.div 
          className="absolute inset-0 rounded-full scale-90 sm:scale-100"
          style={{
            background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1))',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(8px)',
            overflow: 'hidden'
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={getConditionalAnimation({
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              scale: [1, 1.02, 1],
            })}
            transition={{ 
              backgroundPosition: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{
              background: 'linear-gradient(45deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2), rgba(99, 102, 241, 0.2))',
              backgroundSize: '200% 200%'
            }}
          />
        </motion.div>

        {/* Phase segments with hidden indicators on mobile */}
        <div className="absolute inset-0 hidden sm:block">
          {phases.map((phase, index) => (
            <motion.div
              key={phase.id}
              className="absolute inset-0 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: activePhase >= phase.id ? 1 : 0.1,
                scale: prefersReducedMotion ? 1 : (activePhase === phase.id ? 1.02 : 1)
              }}
              whileHover={prefersReducedMotion ? {} : { 
                scale: 1.03,
                filter: "brightness(1.2)",
                transition: { duration: 0.2 }
              }}
              onClick={() => handlePhaseClick(phase)}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className={`absolute inset-0 rounded-full overflow-hidden`}
                style={{
                  clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%)',
                  transform: `rotate(${index * 90}deg)`,
                }}
              >
                {/* Phase Number */}
                <motion.div
                  className="absolute"
                  style={{
                    top: '20%',
                    left: '75%',
                    transform: `translate(-50%, -50%) rotate(-${index * 90}deg)`,
                  }}
                >
                  <span className="text-4xl font-black opacity-50 text-white/80 
                                 bg-clip-text text-transparent bg-gradient-to-b from-white/80 to-white/20
                                 filter drop-shadow-lg">
                    0{phase.id}
                  </span>
                </motion.div>
                
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${phase.color}`}
                  animate={getConditionalAnimation({
                    backgroundPosition: ['0% 0%', '100% 100%'],
                    scale: activePhase === phase.id ? [1, 1.02, 1] : 1
                  })}
                  transition={{
                    backgroundPosition: { duration: 3, repeat: Infinity, repeatType: "reverse" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced center content with improved mobile spacing */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePhase}
            className="absolute inset-0 flex items-center justify-center"
            initial={!prefersReducedMotion ? { scale: 0.8, opacity: 0 } : { opacity: 0 }}
            animate={!prefersReducedMotion ? { scale: 1, opacity: 1 } : { opacity: 1 }}
            exit={!prefersReducedMotion ? { scale: 0.8, opacity: 0 } : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.5 }}
          >
            <motion.div 
              className={`w-40 h-40 sm:w-72 sm:h-72 rounded-full backdrop-blur-xl 
                        flex flex-col items-center justify-center p-3 sm:p-6
                        border border-white/10 sm:border-purple-500/30
                        ${phases[activePhase - 1].mobileColor} sm:bg-black/90`}
              animate={getConditionalAnimation({
                boxShadow: [
                  "0 0 20px rgba(0, 0, 0, 0.3)",
                  "0 0 30px rgba(0, 0, 0, 0.4)",
                  "0 0 20px rgba(0, 0, 0, 0.3)"
                ]
              })}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <motion.div
                  className={`text-lg sm:text-4xl ${phases[activePhase - 1].textColor} sm:text-current`}
                  style={{ color: phases[activePhase - 1].color.split(" ")[0].replace("from-", "") }}
                  animate={getConditionalAnimation({ 
                    rotateY: 360,
                    scale: [1, 1.1, 1]
                  })}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {phases[activePhase - 1].icon}
                </motion.div>
                
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <motion.span
                    className={`text-sm sm:text-xl font-bold leading-tight text-center 
                              ${phases[activePhase - 1].textColor} sm:text-current`}
                    style={{
                      background: undefined, // Remove gradient in mobile
                      WebkitBackgroundClip: undefined,
                      WebkitTextFillColor: undefined
                    }}
                  >
                    {phases[activePhase - 1].title}
                  </motion.span>
                  
                  <motion.span className="text-[10px] sm:text-base font-medium text-white/90 sm:text-gray-300 text-center">
                    {phases[activePhase - 1].subtitle}
                  </motion.span>

                  <motion.p className="text-[9px] sm:text-sm text-white/70 sm:text-gray-400 text-center 
                                     max-w-[110px] sm:max-w-[180px] leading-tight">
                    {phases[activePhase - 1].description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Add touch event handlers for mobile */}
        <div 
          className="absolute inset-0 sm:hidden" 
          onTouchStart={handleTouchStart}
          onTouchMove={(e) => e.preventDefault()}
        />
      </div>
      
      {/* Mobile progress indicator */}
      <div className="flex space-x-1.5 absolute -bottom-6 left-1/2 transform -translate-x-1/2 sm:hidden">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={`h-0.5 rounded-full transition-all duration-300 ${
              activePhase === phase.id 
                ? `w-6 ${phase.textColor}` 
                : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default CircleDeveloper;
