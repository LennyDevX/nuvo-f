import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGift, FaChartLine, FaQuestionCircle, FaCheckCircle, FaTimes, FaArrowRight, FaShieldAlt, FaMoneyBillWave, FaDatabase, FaImage, FaPalette } from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';

// Componente Tab memoizado
const Tab = memoWithName(({ id, label, icon, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${
      active 
        ? 'bg-purple-600/30 text-white font-medium border border-purple-500/50' 
        : 'hover:bg-purple-600/10 text-gray-300'
    }`}
  >
    <span className="text-sm sm:text-base">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
    <span className="sm:hidden text-xs">{label.split(' ')[0]}</span>
  </button>
));

// Componente FaqItem memoizado
const FaqItem = memoWithName(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const reduceAnimations = shouldReduceMotion || isLowPerformance;
  
  // Optimizar animaciones para preferencias de usuario
  const animationProps = useMemo(() => {
    if (reduceAnimations) {
      return {
        initial: { height: 0, opacity: 0 },
        animate: { height: 'auto', opacity: 1 },
        exit: { height: 0, opacity: 0 },
        transition: { duration: 0.1 }
      };
    }
    
    return {
      initial: { height: 0, opacity: 0 },
      animate: { height: 'auto', opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: 0.3 }
    };
  }, [reduceAnimations]);
  
  return (
    <div className="border-b border-purple-500/20 last:border-b-0">
      <button
        className="flex justify-between items-center w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-white font-medium">{question}</h3>
        <span className={`text-purple-400 transform transition-transform duration-200 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
          {isOpen ? <FaTimes /> : <FaArrowRight />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...animationProps}
            className="overflow-hidden"
          >
            <p className="text-gray-300 pb-4">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const AirdropInfoTabs = ({ activeTab = 'about', setActiveTab }) => {
  // Si no se pasa setActiveTab desde el padre, crear uno local
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);
  const currentActiveTab = setActiveTab ? activeTab : localActiveTab;
  const updateActiveTab = setActiveTab || setLocalActiveTab;
  
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const reduceAnimations = shouldReduceMotion || isLowPerformance;

  // Memoizar datos estáticos
  const stakingBenefits = useMemo(() => [
    {
      icon: <FaChartLine className="text-green-400" />,
      title: "High APY",
      description: "Earn up to 125% APY on your staked NUVO tokens with our Smart Staking program."
    },
    {
      icon: <FaShieldAlt className="text-blue-400" />,
      title: "No Lock Period",
      description: "Enjoy flexible withdrawals without any lock period on your staked assets."
    },
    {
      icon: <FaMoneyBillWave className="text-amber-400" />,
      title: "Daily Rewards",
      description: "Receive staking rewards on a daily basis, automatically compounded for maximum growth."
    },
    {
      icon: <FaDatabase className="text-purple-400" />,
      title: "Governance Rights",
      description: "Staked tokens grant you voting rights in platform governance decisions."
    }
  ], []);

  const faqItems = useMemo(() => [
    {
      question: "What is the NUVO Airdrop?",
      answer: "The NUVO Airdrop is a distribution of NUVO tokens to early supporters and community members. These tokens can be used for governance, staking, and accessing premium features on the Nuvos platform."
    },
    {
      question: "How many tokens will I receive?",
      answer: "Eligible participants will receive 10 NUVO tokens during the initial airdrop phase. Additional token distributions may occur in future phases based on participation and contribution to the ecosystem."
    },
    {
      question: "When will I receive my tokens?",
      answer: "Tokens will be distributed within 14 days after the end of the registration period. You'll be notified via email when your tokens are ready to be claimed."
    },
    {
      question: "What can I do with my NUVO tokens?",
      answer: "NUVO tokens can be staked to earn rewards, used to vote on governance proposals, or held as an investment in the Nuvos ecosystem. The Smart Staking program offers up to 125% APY on staked tokens."
    },
    {
      question: "How do I start staking my tokens?",
      answer: "After receiving your tokens, visit the Staking dashboard, connect your wallet, and select the amount of tokens you wish to stake. You can choose from different staking plans based on your preference."
    }
  ], []);

  // Memoizar handlers con useCallback
  const handleTabChange = useCallback((tabId) => {
    updateActiveTab(tabId);
  }, [updateActiveTab]);

  const tabs = useMemo(() => [
    { 
      id: 'about', 
      label: 'About Airdrop', 
      icon: <FaGift />,
      onClick: () => handleTabChange('about')
    },
    { 
      id: 'staking', 
      label: 'Smart Staking', 
      icon: <FaChartLine />,
      onClick: () => handleTabChange('staking')
    },
    { 
      id: 'nft', 
      label: 'NFT Platform', 
      icon: <FaImage />,
      onClick: () => handleTabChange('nft')
    },
    { 
      id: 'faq', 
      label: 'FAQ', 
      icon: <FaQuestionCircle />,
      onClick: () => handleTabChange('faq')
    }
  ], [handleTabChange]);

  // Animar sólo si es visible y no hay preferencia de reducción de movimiento
  const motionProps = useMemo(() => {
    return reduceAnimations 
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } };
  }, [reduceAnimations]);

  // No renderizar contenido completo hasta que sea visible
  if (!isVisible) {
    return <div ref={ref} className="mb-24 min-h-[300px] scroll-mt-24"></div>;
  }

  return (
    <section ref={ref} id="info-section" className="mb-16 lg:mb-24 scroll-mt-24">
      <div className="nuvos-card rounded-2xl border border-purple-500/20 overflow-hidden shadow-lg">
        
        <div className="flex gap-1 sm:gap-2 p-2 sm:p-3 md:p-4 border-b border-purple-500/20 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <Tab 
              key={tab.id}
              id={tab.id} 
              label={tab.label} 
              icon={tab.icon} 
              active={currentActiveTab === tab.id} 
              onClick={tab.onClick}
            />
          ))}
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          {currentActiveTab === 'about' && (
            <motion.div {...motionProps}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 md:mb-6 text-white text-center">NUVOS Airdrop Program</h2>
              
              <div className="space-y-3 sm:space-y-4 md:space-y-6">
                <div className="rounded-xl p-3 sm:p-4 md:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-medium text-white mb-2 sm:mb-3 md:mb-4">About NUVO Tokens</h3>
                  <p className="text-gray-300 mb-2 sm:mb-3 md:mb-4 text-xs sm:text-sm md:text-base leading-relaxed">
                    NUVO is the utility and governance token of the Nuvos ecosystem. It enables holders to participate in platform decisions, access premium features, and earn rewards through staking.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-1 text-purple-400 flex-shrink-0">
                        <FaCheckCircle />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Governance Voting</h4>
                        <p className="text-xs md:text-sm text-gray-400 break-words">Vote on key platform decisions and feature implementations</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-1 text-purple-400 flex-shrink-0">
                        <FaCheckCircle />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Staking Rewards</h4>
                        <p className="text-xs md:text-sm text-gray-400 break-words">Stake tokens to earn high APY returns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-1 text-purple-400 flex-shrink-0">
                        <FaCheckCircle />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Fee Discounts</h4>
                        <p className="text-xs md:text-sm text-gray-400 break-words">Enjoy reduced fees on platform transactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-1 text-purple-400 flex-shrink-0">
                        <FaCheckCircle />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Premium Access</h4>
                        <p className="text-xs md:text-sm text-gray-400 break-words">Unlock exclusive platform features and benefits</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-medium text-white mb-2 sm:mb-3 md:mb-4">Airdrop Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <div className="p-2 sm:p-3 md:p-4 text-center">
                      <h4 className="text-purple-400 font-medium mb-1 text-xs sm:text-sm md:text-base">Total Token Supply</h4>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white break-all">21,000,000 NUVO</p>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 text-center">
                      <h4 className="text-purple-400 font-medium mb-1 text-xs sm:text-sm md:text-base">Airdrop Allocation</h4>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">100 NUVO</p>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4 text-center sm:col-span-2 lg:col-span-1">
                      <h4 className="text-purple-400 font-medium mb-1 text-xs sm:text-sm md:text-base">Per Wallet</h4>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-white">10 NUVO</p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-4 md:mt-6">
                    <p className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed">
                      The NUVOS airdrop is designed to distribute tokens to early supporters and community members. Each eligible wallet will receive 10 NUVO tokens, which can be staked immediately to start earning rewards at up to 125% APY.
                    </p>
                  </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6">
                  <h3 className="text-base sm:text-lg md:text-xl font-medium text-white mb-2 sm:mb-3 md:mb-4">Eligibility Requirements</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                      <span className="text-gray-300 text-xs sm:text-sm break-words">Have a valid Web3 wallet (MetaMask, WalletConnect, etc.)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                      <span className="text-gray-300 text-xs sm:text-sm break-words">Complete the airdrop registration form with valid information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0"></span>
                      <span className="text-gray-300 text-xs sm:text-sm break-words">Minimum wallet balance of 1 POL for transaction fees</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {currentActiveTab === 'staking' && (
            <motion.div {...motionProps}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white text-center">Smart Staking Program</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4">What is Smart Staking?</h3>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                    Smart Staking is Nuvos' innovative staking program that allows NUVOS token holders to earn high yields on their holdings. By locking your tokens in the staking contract, you contribute to the security and decentralization of the network while earning rewards.
                  </p>
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-600/20 rounded-2xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-2">
                      <h4 className="text-white font-medium text-sm sm:text-base">Smart Staking APY</h4>
                      <span className="text-xl sm:text-2xl font-bold text-green-400">Up to 125% APY</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-green-800 to-green-200 h-full" 
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {stakingBenefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="p-3 sm:p-6 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="p-2 sm:p-3 bg-purple-900/30 rounded-full flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-lg font-medium text-white mb-1 sm:mb-2">{benefit.title}</h3>
                          <p className="text-gray-300 text-xs sm:text-sm md:text-base break-words">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4">How to Stake Your NUVOS Tokens</h3>
                  <ol className="space-y-3 sm:space-y-4">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white">1</div>
                      <div className="mt-0.5 min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Receive your airdropped NUVOS tokens</h4>
                        <p className="text-gray-400 text-xs sm:text-sm break-words">After successful registration, you'll receive 10 NUVO tokens to your wallet</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white">2</div>
                      <div className="mt-0.5 min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Access the staking dashboard</h4>
                        <p className="text-gray-400 text-xs sm:text-sm break-words">Navigate to the "Staking" section in the Nuvos platform</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white">3</div>
                      <div className="mt-0.5 min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Connect your wallet</h4>
                        <p className="text-gray-400 text-xs sm:text-sm break-words">Use the same wallet where you received your airdrop tokens</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white">4</div>
                      <div className="mt-0.5 min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Choose your staking plan</h4>
                        <p className="text-gray-400 text-xs sm:text-sm break-words">Select from flexible staking or locked staking for higher APY</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs sm:text-sm font-medium text-white">5</div>
                      <div className="mt-0.5 min-w-0">
                        <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">Stake your tokens</h4>
                        <p className="text-gray-400 text-xs sm:text-sm break-words">Confirm the transaction in your wallet and start earning rewards</p>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-4 sm:mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gradient-to-r from-purple-700 to-pink-900 rounded-lg font-medium text-white flex items-center justify-center gap-2 text-xs sm:text-sm md:text-base"
                      onClick={() => window.location.href = '/staking'}
                    >
                      <FaChartLine /> Go to Staking Dashboard
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentActiveTab === 'nft' && (
            <motion.div {...motionProps}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white text-center">NUVOS NFT Platform</h2>
              
              <div className="space-y-4 sm:space-y-6">
                {/* What are NFTs Section */}
                <div className="p-3 sm:p-6 bg-black/20 rounded-xl">
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4 flex items-center gap-3">
                    <FaImage className="text-purple-400" />
                    What are NFTs?
                  </h3>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                    Non-Fungible Tokens (NFTs) are unique digital assets stored on the blockchain that represent ownership of digital or physical items. Unlike cryptocurrencies, each NFT is one-of-a-kind and cannot be exchanged on a like-for-like basis.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    { [
                      { title: "Unique Ownership", desc: "Verifiable proof of ownership on the blockchain" },
                      { title: "Digital Authenticity", desc: "Tamper-proof certificates of authenticity" },
                      { title: "Transferable", desc: "Easily trade, sell, or transfer to other users" },
                      { title: "Programmable", desc: "Smart contracts enable automatic royalties and features" }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <div className="mt-1 text-purple-400 flex-shrink-0">
                          <FaCheckCircle />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-medium text-xs sm:text-sm md:text-base">{item.title}</h4>
                          <p className="text-xs md:text-sm text-gray-400 break-words">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Create NFTs Section */}
                <div className="p-3 sm:p-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/20">
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4 flex items-center gap-3">
                    <FaPalette className="text-green-400" />
                    Create Your NFTs on NUVOS
                  </h3>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                    Our tokenization platform makes it easy to create, mint, and manage your NFTs. Transform your digital art, collectibles, or any unique asset into a blockchain-verified NFT.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Creation Process */}
                    <div>
                      <h4 className="text-white font-medium mb-4 text-sm md:text-base">🚀 NFT Creation Process:</h4>
                      <ol className="space-y-3">
                        { [
                          { step: "Upload Asset", desc: "Upload your image, video, or digital file" },
                          { step: "Add Metadata", desc: "Include name, description, and properties" },
                          { step: "Set Royalties", desc: "Configure creator royalties for future sales" },
                          { step: "Mint on Polygon", desc: "Deploy your NFT to the blockchain" },
                          { step: "List for Sale", desc: "Optional: List on marketplace immediately" }
                        ].map((item, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-start gap-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-xs font-medium text-white">
                              {index + 1}
                            </div>
                            <div>
                              <h5 className="text-white font-medium text-xs md:text-sm">{item.step}</h5>
                              <p className="text-gray-400 text-xs">{item.desc}</p>
                            </div>
                          </motion.li>
                        ))}
                      </ol>
                    </div>
                    
                    {/* Benefits */}
                    <div>
                      <h4 className="text-white font-medium mb-4 text-sm md:text-base">💎 Platform Benefits:</h4>
                      <div className="space-y-3">
                        { [
                          { icon: "⚡", title: "Low Gas Fees", desc: "Mint on Polygon for minimal costs" },
                          { icon: "🔒", title: "Secure Storage", desc: "IPFS integration for permanent storage" },
                          { icon: "🎨", title: "Easy Tools", desc: "User-friendly creation interface" },
                          { icon: "💰", title: "Instant Marketplace", desc: "Immediate access to our marketplace" }
                        ].map((item, index) => (
                          <motion.div 
                            key={index}
                            className="flex items-start gap-3 p-3 bg-black/30 rounded-lg"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="text-lg">{item.icon}</span>
                            <div>
                              <h5 className="text-white font-medium text-xs md:text-sm">{item.title}</h5>
                              <p className="text-gray-400 text-xs">{item.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full btn-nuvo-base bg-nuvo-gradient-button font-medium text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm"
                      onClick={() => window.location.href = '/tokenize'}
                    >
                      <FaPalette className="text-lg" /> Start Creating NFTs
                    </motion.button>
                  </div>
                </div>

                {/* Marketplace Section */}
                <div className="p-3 sm:p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/20">
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4 flex items-center gap-3">
                    <FaShieldAlt className="text-blue-400" />
                    NUVOS NFT Marketplace
                  </h3>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm md:text-base">
                    Buy, sell, and trade NFTs in our integrated marketplace. Discover unique digital assets and connect with creators and collectors worldwide.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* For Sellers */}
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="text-green-400 font-medium mb-3 text-sm md:text-base flex items-center gap-2">
                        <FaMoneyBillWave />
                        For Sellers
                      </h4>
                      <ul className="space-y-2 text-xs md:text-sm">
                        { [
                          "List your NFTs for fixed price sales",
                          "Set minimum bid for auction-style sales",
                          "Receive offers from interested buyers",
                          "Automatic royalty distribution",
                          "Real-time marketplace analytics"
                        ].map((item, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-start gap-2 text-gray-300"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <span className="text-green-400 mt-1">•</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* For Buyers */}
                    <div className="bg-black/30 rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-3 text-sm md:text-base flex items-center gap-2">
                        <FaDatabase />
                        For Buyers
                      </h4>
                      <ul className="space-y-2 text-xs md:text-sm">
                        { [
                          "Browse curated NFT collections",
                          "Make offers on any listed NFT",
                          "Instant purchase with POL tokens",
                          "Verify authenticity and ownership",
                          "Access to exclusive drops and launches"
                        ].map((item, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-start gap-2 text-gray-300"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <span className="text-blue-400 mt-1">•</span>
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-nuvo-outline py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 text-sm"
                      onClick={() => window.location.href = '/marketplace'}
                    >
                      <FaShieldAlt className="text-lg" /> Explore Marketplace
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-nuvo-outline py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center gap-2 text-sm"
                      onClick={() => window.location.href = '/my-nfts'}
                    >
                      <FaImage className="text-lg" /> My NFT Collection
                    </motion.button>
                  </div>
                </div>

                {/* Getting Started Guide */}
                <div className="p-3 sm:p-6 bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-xl border border-pink-500/20">
                  <h3 className="text-lg sm:text-xl font-medium text-white mb-3 sm:mb-4 flex items-center gap-3">
                    <FaArrowRight className="text-pink-400" />
                    Getting Started Guide
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    { [
                      {
                        step: "1",
                        title: "Connect Wallet",
                        description: "Link your MetaMask or compatible wallet to access all NFT features",
                        color: "purple"
                      },
                      {
                        step: "2", 
                        title: "Create or Browse",
                        description: "Either mint your own NFT or explore existing collections in the marketplace",
                        color: "pink"
                      },
                      {
                        step: "3",
                        title: "Trade & Collect",
                        description: "Buy, sell, make offers, and build your unique NFT collection",
                        color: "blue"
                      }
                    ].map((item, index) => (
                      <motion.div 
                        key={index}
                        className="text-center p-4 bg-black/30 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                      >
                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-${item.color}-500/20 flex items-center justify-center border border-${item.color}-500/30`}>
                          <span className={`text-${item.color}-400 font-bold text-lg`}>{item.step}</span>
                        </div>
                        <h4 className="text-white font-medium mb-2 text-sm md:text-base">{item.title}</h4>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{item.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentActiveTab === 'faq' && (
            <motion.div {...motionProps}>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white">Frequently Asked Questions</h2>
              
              <div className="space-y-1 bg-black/20 rounded-xl p-3 sm:p-6">
                {faqItems.map((item, index) => (
                  <FaqItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default memoWithName(AirdropInfoTabs);
