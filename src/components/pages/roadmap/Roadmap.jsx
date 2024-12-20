import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtocolDev from './ProtocolDev';
import CommunityDev from './communityDev';
import ProductDev from './ProductDev';
import HeroSection from './HeroSection';

const Roadmap = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [expandedCategory, setExpandedCategory] = useState(null);

  const categories = [
    {
      id: 'protocol',
      component: ProtocolDev
    },
    {
      id: 'community',
      component: CommunityDev
    },
    {
      id: 'product',
      component: ProductDev
    }
  ];

  const containerVariants = {
    normal: {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
    expanded: {
      gridTemplateColumns: "1fr"
    }
  };

  const cardVariants = {
    normal: {
      scale: 1,
      flex: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
        when: "afterChildren" // Asegura que el contenido se anime primero
      }
    },
    expanded: {
      scale: 1,
      flex: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        when: "beforeChildren" // Asegura que el contenedor se expanda primero
      }
    },
    exit: {
      scale: 0.97,
      opacity: 0.7,
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900">
      <HeroSection />
      
      <div className="px-4 pb-12 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-3 sm:mb-4">
            Development Roadmap
          </h2>
          <p className="text-sm sm:text-base text-gray-300 text-center max-w-2xl mx-auto mb-8 sm:mb-16 px-4">
            Track our progress and find opportunities to contribute
          </p>

          <motion.div
            variants={containerVariants}
            initial="normal"
            animate={expandedCategory ? "expanded" : "normal"}
            className="grid gap-4 sm:gap-6"
            style={{ 
              gridAutoRows: "min-content",
              transition: "all 0.5s ease-in-out"
            }}
          >
            <AnimatePresence mode="sync">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  layout
                  variants={cardVariants}
                  initial="normal"
                  animate={expandedCategory === category.id ? "expanded" : "normal"}
                  exit="exit"
                  className={`bg-black/30 rounded-xl backdrop-blur-sm border border-purple-500/20
                            transform transition-all duration-300 ease-in-out
                            ${expandedCategory === category.id ? 'z-10' : 'z-0'}
                            ${expandedCategory && expandedCategory !== category.id ? 'opacity-50 scale-95' : ''}`}
                >
                  <motion.button
                    layout
                    onClick={() => setExpandedCategory(
                      expandedCategory === category.id ? null : category.id
                    )}
                    className="w-full p-6 text-left"
                    whileHover={{ scale: expandedCategory ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <category.component expanded={expandedCategory === category.id} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Roadmap;