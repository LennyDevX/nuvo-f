import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityDev = ({ expanded }) => {
  const category = {
    id: 'community',
    title: 'Community Development',
    icon: '🌐',
    description: 'Building and engaging our community',
    color: 'from-blue-500 to-green-500',
    timeline: [
      {
        phase: 'Phase 1',
        title: 'Awareness',
        items: [
          'Social media campaigns',
          'Community events',
          'Partnerships and collaborations',
          'Content creation'
        ]
      },
      {
        phase: 'Phase 2',
        title: 'Engagement',
        items: [
          'Community rewards',
          'Feedback loops',
          'AMA sessions',
          'Educational content'
        ]
      },
      {
        phase: 'Phase 3',
        title: 'Expansion',
        items: [
          'Global outreach',
          'Local meetups',
          'Ambassador programs',
          'Community-driven initiatives'
        ]
      }
    ]
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <span className="text-2xl">{category.icon}</span>
        <div>
          <h3 className="text-xl font-bold text-white">{category.title}</h3>
          <p className="text-gray-400 text-sm">{category.description}</p>
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
            <div className="px-6 pb-6">
              <div className="grid md:grid-cols-3 gap-6 mt-4">
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
                    className="bg-black/20 rounded-lg p-4 border border-blue-500/10"
                  >
                    <h4 className={`text-lg font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                      {phase.phase} - {phase.title}
                    </h4>
                    <ul className="mt-3 space-y-2">
                      {phase.items.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center text-gray-300"
                        >
                          <span className="text-blue-500 mr-2">•</span>
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

export default CommunityDev;