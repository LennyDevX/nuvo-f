import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift } from 'react-icons/fa';

const AirdropBox = ({ isOpening, showReward, handleBoxClick, rewards, expandedReward, setExpandedReward }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative py-4 sm:py-0"
    >
      <div className="relative max-w-[320px] sm:max-w-md mx-auto">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <motion.div
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
        <motion.div
          className="relative w-52 h-52 sm:w-64 sm:h-64 mx-auto cursor-pointer"
          whileHover={{ scale: 1.05 }}
          onClick={!showReward ? handleBoxClick : undefined}
        >
          <AnimatePresence>
            {!isOpening && !showReward && (
              <motion.div
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
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="absolute top-0 left-1/2 w-8 h-full bg-white/10 -translate-x-1/2 transform rotate-45" />
                    <div className="absolute top-1/2 left-0 w-full h-8 bg-white/10 -translate-y-1/2" />
                  </motion.div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
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
                    </motion.div>
                  </div>

                  {/* Shine effect */}
                  <motion.div
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
              </motion.div>
            )}

            {isOpening && (
              <motion.div
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
                  <motion.div
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rewards Display with Improved Mobile Layout */}
          <AnimatePresence>
            {showReward && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4"
              >
                {rewards.map((reward, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <motion.div
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
                          <motion.div
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AirdropBox;
