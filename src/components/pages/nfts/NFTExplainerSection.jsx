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
          {/* Reduced from mb-16 to mb-10 */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-nuvo-gradient-text">
            How Asset Tokenization Works
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-300">
            Our NFTs form the bridge between your physical assets and their digital potential. Here's how 
            to start transforming tangible value into tokenized opportunities.
          </p>
        </m.div>

        {/* Process Steps with fluid animations */}
        <m.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Reduced from gap-6 to gap-4 */}
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
                className={`bg-gradient-to-br ${step.color} p-8 h-full rounded-xl`}
                initial={{ backgroundPosition: "0% 0%" }}
                animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <m.div 
                  className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white text-2xl"
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(255,255,255,0.3)", "0 0 0 10px rgba(255,255,255,0)", "0 0 0 0 rgba(255,255,255,0.3)"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                >
                  {step.icon}
                </m.div>
                <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-white/80">{step.description}</p>
                <div className="mt-4 flex items-center">
                  <m.span 
                    className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold"
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
