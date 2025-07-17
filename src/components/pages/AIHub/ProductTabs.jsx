import React, { useState, useMemo, useCallback } from 'react';
import { FaBrain, FaServer, FaGem, FaUsers, FaTools, FaRobot, FaChartLine, FaCoins, FaGift, FaTshirt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';

// Memoizar el componente FeatureCard
const FeatureCard = memoWithName(({ title, description, icon: Icon, animationEnabled = true }) => (
  <div className="flex gap-4 p-5 rounded-lg nuvos-card border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
    <div className="p-3 rounded-lg bg-purple-500/20 h-fit">
      <Icon className="w-6 h-6 text-purple-400" />
    </div>
    <div>
      <h4 className="text-xl font-medium text-white mb-2">{title}</h4>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
));

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState('nuv-os');
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  // Determinar si las animaciones deben estar habilitadas
  const animationEnabled = !shouldReduceMotion && !isLowPerformance;
  
  const tabs = useMemo(() => [
    { id: 'nuv-os', label: 'Nuv-OS', icon: FaServer },
    { id: 'nuv-ai', label: 'Nuv-AI', icon: FaBrain },
    { id: 'nuv-x1', label: 'Nuv-NFTs', icon: FaGem }
  ], []);

  const nuvOsFeatures = useMemo(() => [
    {
      title: "Decentralized Governance",
      description: "Transparent community-driven development using our governance token",
      icon: FaUsers
    },
    {
      title: "Ecosystem Integration",
      description: "Central hub connecting all Nuvos technologies and platforms",
      icon: FaServer
    },
    {
      title: "Secure Infrastructure",
      description: "Built with enterprise-grade security to protect user assets and data",
      icon: FaTools
    }
  ], []);

  const nuvAiFeatures = useMemo(() => [
    {
      title: "Personal Assistant",
      description: "Get instant answers to all your questions about the Nuvos ecosystem",
      icon: FaRobot
    },
    {
      title: "Strategy Optimization",
      description: "Personalized recommendations to maximize your benefits in Nuvos Cloud",
      icon: FaChartLine
    },
    {
      title: "Market Intelligence",
      description: "Real-time analysis of trends and opportunities within the ecosystem",
      icon: FaBrain
    }
  ], []);

  const nuvX1Features = useMemo(() => [
    {
      title: "Enhanced Earnings",
      description: "Significantly boost your profit potential on Nuvos Cloud with special privileges",
      icon: FaCoins
    },
    {
      title: "Exclusive Rewards",
      description: "Access to airdrops, NFTs, and limited edition merchandise",
      icon: FaGift
    },
    {
      title: "Collectible Digital Art",
      description: "Own unique, AI-generated digital art with utility in our ecosystem",
      icon: FaTshirt
    }
  ], []);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  // Simplificar animaciones si se requiere
  const tabContentVariants = useMemo(() => {
    if (!animationEnabled) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
    
    return {
      hidden: { 
        opacity: 0,
        y: 20,
        transition: { 
          duration: 0.3,
          ease: "easeInOut" 
        }
      },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.4,
          ease: "easeOut" 
        }
      },
      exit: { 
        opacity: 0,
        y: -20,
        transition: { 
          duration: 0.3,
          ease: "easeIn" 
        }
      }
    };
  }, [animationEnabled]);

  const cardVariants = useMemo(() => {
    if (!animationEnabled) {
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
      };
    }
    
    return {
      hidden: { opacity: 0, y: 15 },
      visible: i => ({
        opacity: 1,
        y: 0,
        transition: {
          delay: i * 0.1,
          duration: 0.3,
          ease: "easeOut"
        }
      })
    };
  }, [animationEnabled]);

  // Simplificar la animación del ícono
  const iconAnimation = animationEnabled ? { 
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: { 
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : { scale: 1 };

  const renderFeatureCards = useCallback((features) => {
    return features.map((feature, index) => (
      <motion.div 
        key={index}
        custom={index} 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <FeatureCard {...feature} animationEnabled={animationEnabled} />
      </motion.div>
    ));
  }, [cardVariants, animationEnabled]);

  // Solo renderizar el contenido si es visible en el viewport
  if (!isVisible) {
    return <div ref={ref} className="mb-12 min-h-[400px]"></div>;
  }

  return (
    <div ref={ref} className="mb-12">
      <AnimatePresence mode="wait">
        {activeTab === 'nuv-os' && (
          <motion.div
            key="nuv-os"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div>
              <motion.h2 
                initial={animationEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: animationEnabled ? 0.3 : 0 }}
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
              >
                Nuv-OS: The Core Intelligence
              </motion.h2>
              <motion.p 
                initial={animationEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: animationEnabled ? 0.3 : 0, delay: animationEnabled ? 0.1 : 0 }}
                className="text-gray-300 text-lg mb-6 leading-relaxed"
              >
                Nuv-OS is the central brain of our ecosystem, connecting all capabilities through a decentralized 
                governance structure. This core system enables transparent, secure development while allowing 
                community members to participate in decision-making.
              </motion.p>
              <motion.div 
                className="grid grid-cols-1 gap-4"
              >
                {renderFeatureCards(nuvOsFeatures)}
              </motion.div>
            </div>
            <motion.div 
              initial={animationEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
              animate={animationEnabled ? { opacity: 1, scale: 1 } : { opacity: 1 }}
              transition={{ duration: animationEnabled ? 0.5 : 0, delay: animationEnabled ? 0.2 : 0 }}
              className="nuvos-card p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm hidden sm:block"
            >
              <div className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center">
                <motion.div animate={iconAnimation}>
                  <FaServer className="w-24 md:w-32 h-24 md:h-32 text-purple-400" />
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#1a002a_100%)]" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'nuv-ai' && (
          <motion.div
            key="nuv-ai"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <motion.div 
              initial={animationEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
              animate={animationEnabled ? { opacity: 1, scale: 1 } : { opacity: 1 }}
              transition={{ duration: animationEnabled ? 0.5 : 0, delay: animationEnabled ? 0.2 : 0 }}
              className="order-2 lg:order-1 bg-purple-900/20 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm hidden sm:block"
            >
              <div className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center">
                <motion.div animate={iconAnimation}>
                  <FaBrain className="w-24 md:w-32 h-24 md:h-32 text-purple-400" />
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#1a002a_100%)]" />
              </div>
            </motion.div>
            <div className="order-1 lg:order-2">
              <motion.h2 
                initial={animationEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: animationEnabled ? 0.3 : 0 }}
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
              >
                Nuv-AI: Your Intelligent Assistant
              </motion.h2>
              <motion.p 
                initial={animationEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: animationEnabled ? 0.3 : 0, delay: animationEnabled ? 0.1 : 0 }}
                className="text-gray-300 text-lg mb-6 leading-relaxed"
              >
                Nuv-AI is your personal guide through the Nuvos ecosystem. This advanced AI agent answers your questions, 
                optimizes your strategies, and helps you maximize your benefits within Nuvos Cloud and beyond.
              </motion.p>
              <motion.div 
                className="grid grid-cols-1 gap-4"
              >
                {renderFeatureCards(nuvAiFeatures)}
              </motion.div>
            </div>
          </motion.div>
        )}

        {activeTab === 'nuv-x1' && (
          <motion.div
            key="nuv-x1"
            variants={tabContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div>
              <motion.h2 
                initial={animationEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: animationEnabled ? 0.3 : 0 }}
                className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text"
              >
                Nuv-NFTs: The Future of Digital Collectibles
              </motion.h2>
              <motion.p 
                initial={animationEnabled ? { opacity: 0 } : { opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: animationEnabled ? 0.3 : 0, delay: animationEnabled ? 0.1 : 0 }}
                className="text-gray-300 text-lg mb-6 leading-relaxed"
              >
                Nuv-NFTs are more than just digital art. They represent a new era of collectibles with real utility in the Nuvos ecosystem.
                From exclusive rewards to enhanced earnings, these NFTs are designed to elevate your experience and engagement.
              </motion.p>
              <motion.div 
                className="grid grid-cols-1 gap-4"
              >
                {renderFeatureCards(nuvX1Features)}
              </motion.div>
            </div>
            <motion.div 
              initial={animationEnabled ? { opacity: 0, scale: 0.9 } : { opacity: 1 }}
              animate={animationEnabled ? { opacity: 1, scale: 1 } : { opacity: 1 }}
              transition={{ duration: animationEnabled ? 0.5 : 0, delay: animationEnabled ? 0.2 : 0 }}
              className="bg-purple-900/20 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm hidden sm:block"
            >
              <div className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center">
                <motion.div animate={iconAnimation}>
                  <FaGem className="w-24 md:w-32 h-24 md:h-32 text-purple-400" />
                </motion.div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#1a002a_100%)]" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab buttons moved to bottom for better mobile navigation */}
      <div className="flex flex-wrap justify-center gap-4 mt-10 pt-6 border-t border-purple-500/20">
        {tabs.map(tab => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'nuvos-card shadow-lg'
                : 'bg-purple-900/20 text-gray-300 hover:bg-purple-900/30'
            }`}
            whileTap={animationEnabled ? { scale: 0.95 } : {}}
            whileHover={animationEnabled ? { scale: 1.05 } : {}}
            transition={{ type: "spring", stiffness: animationEnabled ? 400 : 0, damping: 17 }}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default memoWithName(ProductTabs);
