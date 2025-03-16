import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaPuzzlePiece, FaRocket, FaArrowRight, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AirdropBox from './AirdropBox';
import WhitelistModal from './WhitelistModal';

const AirdropInfo = () => {
  const [isOpening, setIsOpening] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [expandedReward, setExpandedReward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleBoxClick = () => {
    if (!isOpening) {
      setIsOpening(true);
      
      const sequence = async () => {
        // Initial shake animation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Glow effect before opening
        const giftBox = document.querySelector('.gift-box');
        if (giftBox) {
          giftBox.classList.add('pulse-glow');
        }
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setShowReward(true);
        setIsOpening(false);
      };
      
      sequence();
    }
  };

  const openWhitelistModal = () => {
    setShowModal(true);
  };

  const rewards = [
    {
      icon: <FaCoins />,
      text: "500 NUVO Tokens",
      color: "text-amber-400",
      description: "Reserve your NUVO tokens for the official launch in Q1 2026. Pre-sale will begin in Q4 2025. Early whitelist members receive an additional 20% bonus allocation.",
      highlight: "Available after official launch in 2026"
    },
    {
      icon: <FaPuzzlePiece />,
      text: "Exclusive NFT",
      color: "text-purple-400",
      description: "Join the whitelist now to secure a limited edition NFT that will grant special access to platform features and future token allocations.",
      highlight: "Priority access to pre-sale in Q4 2025"
    },
    {
      icon: <FaRocket />,
      text: "Staking Boost",
      color: "text-cyan-400",
      description: "Whitelist members will enjoy up to 5% bonus on staking rewards upon token launch. Plan ahead for maximum yield potential.",
      highlight: "Benefits available at launch in 2026"
    }
  ];

  return (
    <section className="relative w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-12 sm:pt-18 pb-6 sm:pb-16 lg:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start lg:items-center">
        <div className="order-2 lg:order-1">
          <AirdropBox
            isOpening={isOpening}
            showReward={showReward}
            handleBoxClick={handleBoxClick}
            rewards={rewards}
            expandedReward={expandedReward}
            setExpandedReward={setExpandedReward}
          />
        </div>

        <div className="space-y-4 sm:space-y-8 order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.2] tracking-tight">
              <span className="block mb-2">Prepare For</span>
              <span className="gradient-text block mb-2">Future Rewards</span>
              <span className="block">Join Our Whitelist</span>
            </h2>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl mt-4 sm:mt-6">
              Get ready for our token launch with pre-sale in Q4 2025 and official DEX launch in Q1 2026. 
              Join our whitelist now to secure your position for exclusive NUVO tokens, 
              rare NFTs, and special staking privileges when we launch.
            </p>
            
            <div className="bg-black/30 border border-purple-500/20 rounded-lg p-3 sm:p-4">
              <h3 className="text-amber-400 text-sm sm:text-base font-medium">Important Timeline:</h3>
              <p className="text-xs sm:text-sm text-white">• Token Pre-sale: Q4 2025</p>
              <p className="text-xs sm:text-sm text-white">• Official DEX Launch: Q1 2026</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-2 sm:gap-4"
          >
            {[
              { title: "NUVO Tokens", desc: "Future allocation" },
              { title: "Rare NFTs", desc: "Pre-launch access" },
              { title: "Priority Status", desc: "Guaranteed spots" },
              { title: "Early Benefits", desc: "Launch advantages" }
            ].map((item, index) => (
              <div
                key={index}
                className="p-3 sm:p-4 bg-black/20 rounded-lg sm:rounded-xl border border-purple-500/20"
              >
                <h3 className="text-base sm:text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-purple-300">{item.desc}</p>
              </div>
            ))}
          </motion.div>

          {showReward && (
            <motion.button
              onClick={openWhitelistModal}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full
                       text-sm sm:text-base text-white font-medium hover:from-purple-700 hover:to-pink-700
                       transition-all transform hover:-translate-y-1 flex items-center justify-center sm:justify-start gap-2
                       shadow-lg hover:shadow-xl mt-4 sm:mt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Whitelist <FaList className="ml-1" />
            </motion.button>
          )}
        </div>
      </div>

      {showModal && <WhitelistModal onClose={() => setShowModal(false)} />}
    </section>
  );
};

export default AirdropInfo;