import React from 'react';
import { m } from 'framer-motion';
import { FaGem, FaFingerprint, FaShieldAlt, FaCoins, FaUserLock } from 'react-icons/fa';

const NFTHeroSection = () => {
  // Animación de palabras individuales
  const wordVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, delay: i * 0.1 }
    })
  };

  // Features para los NFTs with enhanced descriptions
  const nftFeatures = [
    { 
      icon: <FaGem />, 
      title: "Premium Access", 
      description: "Exclusive access to premium features and advanced tokenization capabilities for your physical assets."
    },
    { 
      icon: <FaFingerprint />, 
      title: "Unique & Verifiable", 
      description: "Each NFT is cryptographically unique and verifiable, creating a secure bridge between physical and digital."
    },
    { 
      icon: <FaShieldAlt />, 
      title: "Utility-Focused", 
      description: "Real-world utility that transforms your physical assets into digital opportunities with tangible benefits."
    },
    { 
      icon: <FaCoins />, 
      title: "Staking Benefits", 
      description: "Enhanced staking rewards and priority in yield distribution across the Nuvos Cloud ecosystem."
    },
    { 
      icon: <FaUserLock />, 
      title: "Governance Rights", 
      description: "Shape the future of asset tokenization with weighted voting power in protocol decisions."
    },
    
    { 
      icon: <FaUserLock />, 
      title: "Community Engagement", 
      description: "Join a vibrant community of innovators and asset owners, sharing insights and opportunities."
    }
  ];

  return (
    <section className="relative p-4 overflow-hidden">
      
      <m.div 
        className="max-w-7xl mx-auto text-center z-20 space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Enhanced title animation with better contrast against space background */}
        <div className="relative">
          <m.div 
            className="absolute inset-0 w-full h-full bg-black/30 rounded-3xl blur-xl -z-10"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
          ></m.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 text-transparent bg-clip-text bg-nuvo-gradient-text">
            <m.span 
              className="inline-block"
              custom={0}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
            >
              NUVOS NFT
            </m.span>
            <br />
            <m.span 
              className="inline-block"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
            >
              Collection
            </m.span>
          </h1>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 px-4">
          <m.p 
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Tokenize your physical assets and unlock their digital potential in the Nuvos ecosystem.
          </m.p>
          
          <m.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Bridge the physical and digital worlds with our tokenization platform. Transform tangible objects into verified digital assets with real utility, ownership benefits, and interoperable value.
          </m.p>
        </div>

        <m.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8" 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {nftFeatures.map((feature, index) => (
            <m.div 
              key={index} 
              className="bg-gradient-to-br from-violet-900/50 to-indigo-900/50 backdrop-blur-md p-6 rounded-xl border border-violet-500/30 shadow-xl hover:shadow-violet-500/10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.9 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 20px 0 rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
            >
              <m.div 
                className="text-fuchsia-400 text-3xl mb-4"
                whileHover={{ scale: 1.1, color: "#d946ef" }}
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: index * 0.2 }}
              >
                {feature.icon}
              </m.div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </m.div>
          ))}
        </m.div>
      </m.div>
    </section>
  );
};

export default NFTHeroSection;
