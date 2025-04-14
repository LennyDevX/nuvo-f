import React from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaGift } from 'react-icons/fa';

const AirdropBox = ({ boxState, boxAnimationVariants, showReward, handleBoxClick, rewards, expandedReward, setExpandedReward }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative py-4 sm:py-0"
    >
      <div className="relative max-w-[300px] sm:max-w-md mx-auto">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <m.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.15), transparent 50%)',
                'radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.15), transparent 50%)',
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>

        {/* Gift Box Container */}
        <m.div
          className="relative w-48 h-48 sm:w-60 sm:h-60 mx-auto cursor-pointer"
          variants={boxAnimationVariants}
          animate={boxState}
          onClick={boxState === 'closed' ? handleBoxClick : undefined}
          whileHover={boxState === 'closed' ? { scale: 1.05, rotate: 2 } : {}}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-lg relative overflow-hidden">
            {/* Box decorative elements */}
            <div className="absolute top-0 left-1/2 w-6 sm:w-8 h-full bg-white/10 -translate-x-1/2 transform rotate-45 opacity-70" />
            <div className="absolute top-1/2 left-0 w-full h-6 sm:h-8 bg-white/10 -translate-y-1/2 opacity-70" />

            <div className="absolute inset-0 flex items-center justify-center">
              <m.div
                animate={boxState === 'closed' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={boxState === 'closed' ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : {}}
              >
                <FaGift className="text-white text-5xl sm:text-6xl filter drop-shadow-md" />
              </m.div>
            </div>

            {/* Shine effect */}
            <m.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={boxState === 'closed' ? { x: ['-150%', '150%'] } : { x: '-150%' }}
              transition={boxState === 'closed' ? { duration: 3, repeat: Infinity, ease: 'linear', repeatDelay: 1 } : {}}
            />
          </div>
        </m.div>

        {/* Rewards Display */}
        <AnimatePresence>
          {showReward && (
            <m.div
              key="rewards"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 150, delay: 0.1 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 sm:gap-3"
            >
              {rewards.map((reward, index) => (
                <m.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                >
                  <m.div
                    className={`bg-black/50 backdrop-blur-md rounded-lg sm:rounded-xl border border-purple-500/40
                              transition-all duration-300 overflow-hidden shadow-md
                              ${expandedReward === index ? 'w-[260px] sm:w-[280px]' : 'w-[220px] sm:w-[240px] hover:bg-black/70 cursor-pointer'}`}
                    layout
                    whileHover={expandedReward !== index ? { scale: 1.03, y: -2 } : {}}
                    onClick={() => setExpandedReward(index)}
                  >
                    {/* Reward Header */}
                    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5">
                      <span className={`text-lg sm:text-xl ${reward.color}`}>{reward.icon}</span>
                      <span className="text-xs sm:text-sm text-white font-medium flex-1 truncate">{reward.text}</span>
                      {expandedReward === index && (
                        <m.button
                          className="ml-auto text-gray-400 hover:text-white flex-shrink-0"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedReward(null);
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </m.button>
                      )}
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                      {expandedReward === index && (
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-3 sm:px-4 pb-2 sm:pb-3"
                        >
                          <div className="h-px w-full bg-purple-500/20 mb-2 sm:mb-3" />
                          <p className="text-gray-300 text-xs sm:text-sm mb-2">
                            {reward.description}
                          </p>
                          <p className={`${reward.color} text-xs sm:text-sm font-medium`}>
                            {reward.highlight}
                          </p>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.div>
                </m.div>
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.div>
  );
};

export default AirdropBox;
