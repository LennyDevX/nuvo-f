import React from 'react';
import { m } from 'framer-motion';
import { FaWallet, FaStore, FaKey, FaUserShield } from 'react-icons/fa';

const NFTExplainerSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  // Steps with enhanced colors for space theme
  const steps = [
    {
      icon: <FaWallet />,
      title: "Connect Your Wallet",
      description: "Link your compatible crypto wallet to our platform securely and easily.",
      color: "from-violet-600 to-indigo-600"
    },
    {
      icon: <FaStore />,
      title: "Browse Asset Options",
      description: "Explore ways to tokenize your physical assets with different utility levels and benefits.",
      color: "from-indigo-600 to-fuchsia-600"
    },
    {
      icon: <FaKey />,
      title: "Tokenize & Mint",
      description: "Transform your physical asset into a digital token with verifiable ownership and utility.",
      color: "from-fuchsia-600 to-violet-600"
    },
    {
      icon: <FaUserShield />,
      title: "Bridge Both Worlds",
      description: "Access the best of both physical and digital realms, unlocking new value and opportunities.",
      color: "from-violet-600 to-indigo-800"
    }
  ];

  return (
    <div className="py-10 mb-16 relative overflow-visible">
      {/* Remove local background elements to use global space background */}
      
      <m.div 
        className="container mx-auto px-4 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ 
          once: true, 
          amount: 0.2
        }}
        variants={containerVariants}
      >
        <m.div variants={itemVariants} className="text-center mb-10">
          {/* Enhanced title size for desktop */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-nuvo-gradient-text">
            How Asset Tokenization Works
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-300">
            Our NFTs form the bridge between your physical assets and their digital potential. Here's how 
            to start transforming tangible value into tokenized opportunities.
          </p>
        </m.div>

        {/* Process Steps - Improved mobile layout with 2 columns */}
        <m.div 
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {/* Reduced from gap-4 to gap-3 for tighter mobile layout */}
          {steps.map((step, index) => (
            <m.div 
              key={index} 
              variants={itemVariants}
              className="rounded-xl overflow-hidden"
              whileHover={{ 
                y: -5, 
                transition: { duration: 0.2 },
                boxShadow: "0 20px 40px -15px rgba(139, 92, 246, 0.3)" 
              }}
            >
              <m.div 
                className={`nuvos-card p-4 sm:p-6 h-full rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border border-violet-700/20`}
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                {/* Reduced size for mobile */}
                <m.div 
                  className="bg-white/10 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 sm:mb-6 text-white text-xl sm:text-2xl"
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(255,255,255,0.3)", "0 0 0 10px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0.3)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                >
                  {step.icon}
                </m.div>
                {/* Adjusted text sizes for mobile */}
                <h3 className="text-base sm:text-xl font-bold mb-2 sm:mb-4 text-white">{step.title}</h3>
                <p className="text-xs sm:text-sm text-white/80">{step.description}</p>
                <div className="mt-3 sm:mt-4 flex items-center">
                  <m.span 
                    className="bg-white/20 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white font-bold text-xs sm:text-base"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: index * 0.7 }}
                  >
                    {index + 1}
                  </m.span>
                </div>
              </m.div>
            </m.div>
          ))}
        </m.div>
      </m.div>
    </div>
  );
};

export default NFTExplainerSection;
