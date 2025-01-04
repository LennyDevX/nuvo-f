import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCoins, FaPuzzlePiece, FaRocket, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AirdropBox from './AirdropBox';

const AirdropInfo = () => {
  const [isOpening, setIsOpening] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [expandedReward, setExpandedReward] = useState(null);
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

  const handleAirdropNavigation = () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
      navigate('/airdrops');
      window.scrollTo({ top: 0, behavior: 'instant' });
      
      requestAnimationFrame(() => {
        document.body.style.opacity = '1';
      });
    }, 300);
  };

  const rewards = [
    {
      icon: <FaCoins />,
      text: "500 NUVO Tokens",
      color: "text-amber-400",
      description: "Get 500 NUVO tokens instantly credited to your wallet. Use them for staking, governance, or trading. Early participants receive additional 20% bonus.",
      highlight: "With incredib rewards and benefits"
    },
    {
      icon: <FaPuzzlePiece />,
      text: "Exclusive NFT",
      color: "text-purple-400",
      description: "Receive a limited edition NFT that grants special access to platform features and future airdrops. Only available during launch phase.",
      highlight: "Includes governance voting rights"
    },
    {
      icon: <FaRocket />,
      text: "Staking Boost",
      color: "text-cyan-400",
      description: "Enjoy up to 5% bonus on your staking rewards for the first 3 months. Stack with other bonuses for maximum yield.",
      highlight: "Up to 125% APY boost"
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
              <span className="block mb-2">Claim Your</span>
              <span className="gradient-text block mb-2">Exclusive Rewards</span>
              <span className="block">In Our Airdrop</span>
            </h2>
            
            <p className="text-sm sm:text-lg text-gray-300 max-w-xl mt-4 sm:mt-6">
              Join our community and unlock exclusive rewards including NUVO tokens, 
              rare NFTs, and special staking privileges. Don't miss out on this 
              limited-time opportunity.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-2 sm:gap-4"
          >
            {[
              { title: "NUVO Tokens", desc: "Get instant tokens" },
              { title: "Rare NFTs", desc: "Exclusive collectibles" },
              { title: "Staking Boost", desc: "Enhanced APY rates" },
              { title: "Early Access", desc: "Platform features" }
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
              onClick={handleAirdropNavigation}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full
                       text-sm sm:text-base text-white font-medium hover:from-purple-700 hover:to-pink-700
                       transition-all transform hover:-translate-y-1 flex items-center justify-center sm:justify-start gap-2
                       shadow-lg hover:shadow-xl mt-4 sm:mt-6"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Register for Airdrop <FaArrowRight className="animate-bounce-x" />
            </motion.button>
          )}
        </div>
      </div>
    </section>
  );
};

export default AirdropInfo;