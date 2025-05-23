import React, { useMemo } from 'react';
import { m } from 'framer-motion';
import { FaGem, FaFingerprint, FaShieldAlt, FaCoins, FaUserLock, FaUsers } from 'react-icons/fa';

// Move animation variants outside component
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

// Move features data outside component to prevent recreation on each render
const getNFTFeatures = () => [
  { 
    icon: <FaGem />, 
    title: "Premium Access", 
    description: "Exclusive access to premium features and advanced tokenization capabilities for your physical assets.",
    iconColor: "text-emerald-400"
  },
  { 
    icon: <FaFingerprint />, 
    title: "Unique & Verifiable", 
    description: "Each NFT is cryptographically unique and verifiable, creating a secure bridge between physical and digital.",
    iconColor: "text-blue-400"
  },
  { 
    icon: <FaShieldAlt />, 
    title: "Utility-Focused", 
    description: "Real-world utility that transforms your physical assets into digital opportunities with tangible benefits.",
    iconColor: "text-purple-400"
  },
  { 
    icon: <FaCoins />, 
    title: "Staking Benefits", 
    description: "Enhanced staking rewards and priority in yield distribution across the Nuvos Cloud ecosystem.",
    iconColor: "text-amber-400"
  },
  { 
    icon: <FaUserLock />, 
    title: "Governance Rights", 
    description: "Shape the future of asset tokenization with weighted voting power in protocol decisions.",
    iconColor: "text-indigo-400"
  },
  { 
    icon: <FaUsers />,
    title: "Community Engagement", 
    description: "Join a vibrant community of innovators and asset owners, sharing insights and opportunities.",
    iconColor: "text-fuchsia-400"
  }
];

const NFTFeatures = () => {
  // Memoize features data
  const nftFeatures = useMemo(() => getNFTFeatures(), []);
  
  return (
    <m.div 
      className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6" 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={containerVariants}
    >
      {nftFeatures.map((feature, index) => (
        <m.div 
          key={index} 
          className="nuvos-card p-4 sm:p-5 rounded-xl backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 border border-slate-700/20"
          variants={itemVariants}
          // Use will-change for better animation performance
          style={{ willChange: "opacity, transform" }}
        >
          <div className={`${feature.iconColor} text-2xl sm:text-3xl mb-3 sm:mb-4`}>
            {feature.icon}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-gray-300 text-xs sm:text-sm">{feature.description}</p>
        </m.div>
      ))}
    </m.div>
  );
};

export default React.memo(NFTFeatures);
