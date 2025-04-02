import React from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FaGift } from 'react-icons/fa';

const AirdropBox = ({ isOpening, showReward, handleBoxClick, rewards, expandedReward, setExpandedReward }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative py-4 sm:py-0"
    >
      <div className="relative max-w-[320px] sm:max-w-md mx-auto">
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

        {/* Enhanced Gift Box Container */}
        <m.div
          className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={!showReward ? handleBoxClick : undefined}
        >
          <AnimatePresence>
            {!isOpening && !showReward && (
              <m.div
                className="absolute inset-0 gift-box"
                initial={{ scale: 0.9 }}
                animate={{
                  scale: [0.9, 1],
                  rotate: [0, 1, -1, 0],
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 4, repeat: Infinity },
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl
                              relative overflow-hidden">
                  {/* Animated ribbon */}
                  <m.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute top-0 left-1/2 w-8 h-full bg-white/10 -translate-x-1/2 transform rotate-45" />
                    <div className="absolute top-1/2 left-0 w-full h-8 bg-white/10 -translate-y-1/2" />
                  </m.div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <m.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <FaGift className="text-white text-6xl filter drop-shadow-lg" />
                    </m.div>
                  </div>

                  {/* Shine effect */}
                  <m.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              </m.div>
            )}

            {isOpening && (
              <m.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{
                  scale: [1, 1.2, 0.8, 0],
                  rotate: [0, 15, -15, 20, -20, 0],
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeInOut",
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaGift className="text-white text-6xl animate-pulse" />
                  </div>
                  <m.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Rewards Display with Improved Mobile Layout */}
          <AnimatePresence>
            {showReward && (
              <m.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4"
              >
                {rewards.map((reward, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <m.div
                      className={`bg-black/40 backdrop-blur-sm rounded-lg sm:rounded-xl border border-purple-500/30
                                transition-all duration-300 overflow-hidden
                                ${expandedReward === index ? 'w-[280px] sm:w-[300px]' : 'hover:bg-black/60 cursor-pointer'}`}
                      onClick={() => setExpandedReward(expandedReward === index ? null : index)}
                    >
                      {/* Reward Header */}
                      <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3">
                        <span className={`text-xl sm:text-2xl ${reward.color}`}>{reward.icon}</span>
                        <span className="text-sm sm:text-base text-white font-medium">{reward.text}</span>
                      </div>

                      {/* Expanded Content */}
                      <AnimatePresence>
                        {expandedReward === index && (
                          <m.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 sm:px-6 pb-3 sm:pb-4"
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
        </m.div>
      </div>
    </m.div>
  );
};

export default AirdropBox;
