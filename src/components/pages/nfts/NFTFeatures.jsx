import React from 'react';
import { m } from 'framer-motion';
import { FaGem, FaFingerprint, FaShieldAlt, FaCoins, FaUserLock, FaUsers } from 'react-icons/fa';

const NFTFeatures = () => {
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
      icon: <FaUsers />, // Fixed: using correct FaUsers icon instead of duplicate FaUserLock
      title: "Community Engagement", 
      description: "Join a vibrant community of innovators and asset owners, sharing insights and opportunities."
    }
  ];

  return (
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
  );
};

export default NFTFeatures;
