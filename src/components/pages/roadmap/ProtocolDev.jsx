import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProtocolDev = ({ expanded }) => {
  const category = {
    id: 'protocol',
    title: 'Protocol Development',
    icon: '🔧',
    description: 'Core protocol features and technical milestones',
    color: 'from-purple-500 to-pink-500',
    timeline: [
      {
        phase: 'Phase 1',
        title: 'Foundation',
        items: [
          'Smart contract development',
          'Security audits',
          'Testnet deployment',
          'Core features implementation'
        ]
      },
      {
        phase: 'Phase 2',
        title: 'Enhancement',
        items: [
          'Advanced staking mechanisms',
          'Cross-chain integration',
          'Yield optimization features',
          'Protocol governance implementation'
        ]
      },
      {
        phase: 'Phase 3',
        title: 'Scaling',
        items: [
          'Layer 2 integration',
          'Performance optimization',
          'Additional chain support',
          'Advanced security features'
        ]
      }
    ]
  };

  return (
    <>
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-xl sm:text-2xl">{category.icon}</span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">{category.title}</h3>
          <p className="text-xs sm:text-sm text-gray-400">{category.description}</p>
        </div>
      </div>
      <AnimatePresence mode="sync">
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, 
              height: "auto",
              transition: {
                height: {
                  duration: 0.3,
                  ease: "easeOut"
                },
                opacity: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }
            }}
            exit={{ 
              opacity: 0,
              height: 0,
              transition: {
                height: {
                  duration: 0.2,
                  ease: "easeIn"
                },
                opacity: {
                  duration: 0.1,
                  ease: "easeIn"
                }
              }
            }}
            className="overflow-hidden"
          >
            <div className="px-3 sm:px-6 pb-4 sm:pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
                {category.timeline.map((phase, index) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.3,
                        delay: index * 0.1
                      }
                    }}
                    exit={{ 
                      opacity: 0,
                      y: 10,
                      transition: {
                        duration: 0.2
                      }
                    }}
                    className="bg-black/20 rounded-lg p-3 sm:p-4 border border-purple-500/10"
                  >
                    <h4 className={`text-base sm:text-lg font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {phase.phase} - {phase.title}
                    </h4>
                    <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2">
                      {phase.items.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center text-sm sm:text-base text-gray-300"
                        >
                          <span className="text-purple-500 mr-2">•</span>
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProtocolDev;
