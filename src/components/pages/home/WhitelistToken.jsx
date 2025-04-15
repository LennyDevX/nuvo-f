import React, { useState, useCallback, useMemo } from 'react';
import { m, useReducedMotion, AnimatePresence } from 'framer-motion';
import { FaCoins, FaPuzzlePiece, FaRocket, FaList } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AirdropBox from './AirdropBox';
import WhitelistModal from './WhitelistModal';
import { buttonVariants } from '../../../utils/animationVariants'; // Removed unused fadeIn

// Simpler animation variants for the box
const boxAnimationVariants = {
  closed: { scale: 1, opacity: 1, rotate: 0 },
  opening: { 
    scale: 0.8, 
    opacity: 0, 
    rotate: 10, 
    transition: { duration: 0.4, ease: "easeIn" } 
  },
  opened: { scale: 0.8, opacity: 0 }
};

const AirdropInfo = () => {
  const [boxState, setBoxState] = useState('closed'); // 'closed', 'opening', 'opened'
  const [showReward, setShowReward] = useState(false);
  const [expandedReward, setExpandedReward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const rewards = useMemo(() => [
    {
      icon: <FaCoins />,
      text: "500 NUVOS Tokens",
      color: "text-amber-400",
      description: "Reserve your NUVOS tokens for the official launch in Q1 2027. Pre-sale will begin in Q1 2026. Early whitelist members receive an additional 20% bonus allocation.",
      highlight: "Available after official launch in 2027"
    },
    {
      icon: <FaPuzzlePiece />,
      text: "Exclusive NFT",
      color: "text-purple-400",
      description: "Join the whitelist now to secure a limited edition NFT that will grant special access to platform features and future token allocations.",
      highlight: "Priority access to pre-sale in Q1 2026"
    },
    {
      icon: <FaRocket />,
      text: "Staking Boost",
      color: "text-cyan-400",
      description: "Whitelist members will enjoy up to 5% bonus on staking rewards upon token launch. Plan ahead for maximum yield potential.",
      highlight: "Benefits available at launch in 2027"
    }
  ], []);

  // Simplified box click handler
  const handleBoxClick = useCallback(() => {
    if (boxState === 'closed') {
      setBoxState('opening');
      
      setTimeout(() => {
        setShowReward(true);
        setBoxState('opened');
      }, 250);
    }
  }, [boxState]);

  const openWhitelistModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeWhitelistModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const setExpandedRewardHandler = useCallback((index) => {
    setExpandedReward(expandedReward === index ? null : index);
  }, [expandedReward]);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-6 sm:pb-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Text content - Now on the left for desktop */}
        <m.div 
          initial={prefersReducedMotion ? {} : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="space-y-5 sm:space-y-6 order-1 lg:order-1"
        >
          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3 sm:space-y-4"
          >
            <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              <span className="block mb-1 sm:mb-2">Prepare For</span>
              <span className="gradient-text block mb-1 sm:mb-2 text-transparent bg-clip-text bg-nuvo-gradient-text">Future Rewards</span>
              <span className="block">Join Our Whitelist</span>
            </h2>
            
            <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-xl mt-3 sm:mt-4">
              Get ready for our token launch with pre-sale in Q1 2026 and official DEX launch in Q1 2027. 
              Join our whitelist now to secure your position for exclusive NUVOS tokens, 
              rare NFTs, and special staking privileges when we launch.
            </p>
            
            <div className="bg-black/30 border border-purple-500/20 rounded-lg p-3 sm:p-4 mt-4">
              <h3 className="text-amber-400 text-sm sm:text-base font-medium">Important Timeline:</h3>
              <p className="text-xs sm:text-sm text-white">• Token Pre-sale: Q1 2026</p>
              <p className="text-xs sm:text-sm text-white">• Official DEX Launch: Q1 2027</p>
            </div>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            {[
              { title: "NUVOS Tokens", desc: "Future allocation" },
              { title: "Rare NFTs", desc: "Pre-launch access" },
              { title: "Priority Status", desc: "Guaranteed spots" },
              { title: "Early Benefits", desc: "Launch advantages" }
            ].map((item, index) => (
              <div
                key={index}
                className="p-2.5 sm:p-4 bg-black/20 rounded-lg sm:rounded-xl border border-purple-500/20"
              >
                <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs sm:text-sm text-purple-300">{item.desc}</p>
              </div>
            ))}
          </m.div>

          <AnimatePresence>
            {showReward && (
              <m.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.4 }}
                onClick={openWhitelistModal}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full
                         text-sm sm:text-base text-white font-medium hover:from-purple-700 hover:to-pink-700
                         transition-all transform flex items-center justify-center gap-2
                         shadow-lg hover:shadow-xl mt-4 sm:mt-6 hover:scale-105"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Join Whitelist <FaList className="ml-1" />
              </m.button>
            )}
          </AnimatePresence>
        </m.div>

        {/* AirdropBox - Now on the right for desktop */}
        <m.div 
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7 }}
          className="order-2 lg:order-2 flex justify-center"
        >
          <div className="w-full max-w-xs sm:max-w-sm">
            <AirdropBox
              boxState={boxState}
              boxAnimationVariants={boxAnimationVariants}
              showReward={showReward}
              handleBoxClick={handleBoxClick}
              rewards={rewards}
              expandedReward={expandedReward}
              setExpandedReward={setExpandedRewardHandler}
            />
          </div>
        </m.div>
      </div>

      {showModal && <WhitelistModal onClose={closeWhitelistModal} />}
    </section>
  );
};

export default AirdropInfo;