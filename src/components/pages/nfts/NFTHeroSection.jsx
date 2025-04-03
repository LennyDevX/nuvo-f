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

  // Features para los NFTs
  const nftFeatures = [
    { 
      icon: <FaGem />, 
      title: "Premium Access", 
      description: "Exclusive access to premium features and advanced platform capabilities."
    },
    { 
      icon: <FaFingerprint />, 
      title: "Unique & Verifiable", 
      description: "Each NFT is cryptographically unique and verifiable on the blockchain."
    },
    { 
      icon: <FaShieldAlt />, 
      title: "Utility-Focused", 
      description: "Real utility within the Nuvos ecosystem, not just collectibles."
    },
    { 
      icon: <FaCoins />, 
      title: "Staking Benefits", 
      description: "Enhanced staking rewards and priority in yield distribution."
    },
    { 
      icon: <FaUserLock />, 
      title: "Governance Rights", 
      description: "Voting power in platform decisions and future development."
    }
  ];

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Enhanced background with animated effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/60"></div>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        
        {/* Animated accent elements */}
        <m.div 
          className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.2, 0.3, 0.2],
            x: [0, 10, 0],
            y: [0, -10, 0]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <m.div 
          className="absolute bottom-1/4 right-1/3 w-56 h-56 rounded-full bg-pink-500/10 blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1], 
            opacity: [0.1, 0.2, 0.1],
            x: [0, -15, 0],
            y: [0, 15, 0]
          }}
          transition={{ duration: 9, delay: 1, repeat: Infinity }}
        />
      </div>
      
      <m.div 
        className="max-w-7xl mx-auto text-center z-20 space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Enhanced title animation word by word */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 md:mb-8">
          <m.span 
            className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
          >
            NUVOS NFT
          </m.span>
          <br />
          <m.span 
            className="inline-block bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
          >
            Collection
          </m.span>
        </h1>

        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4">
          <m.p 
            className="text-xl sm:text-2xl md:text-3xl text-gray-200 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Exclusive digital assets that unlock real utility within the Nuvos ecosystem.
          </m.p>
          
          <m.p 
            className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            Own a piece of the future with our limited-edition collection that delivers genuine value, platform benefits, and governance rights.
          </m.p>
        </div>

        {/* Grid de características con efectos hover */}
        <m.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {nftFeatures.map((feature, index) => (
            <m.div 
              key={index} 
              className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-6 rounded-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/10"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 20px 0 rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
              transition={{ duration: 0.2 }}
            >
              <m.div 
                className="text-purple-400 text-3xl mb-4"
                whileHover={{ scale: 1.1, color: "#a855f7" }}
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
