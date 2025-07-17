import React, { memo } from 'react';
import { FaChartLine, FaComments, FaRobot, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';
import useIntersectionObserver from '../../../hooks/performance/useIntersectionObserver';

// Memoize AITool component for performance
const AITool = memo(({ title, description, icon: Icon, link, animationEnabled = true }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  // Variants condicionados por animación habilitada
  const containerVariants = animationEnabled ? {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  } : { visible: { opacity: 1 } };

  return (
    <motion.div 
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className="p-8 rounded-xl nuvos-card 
           hover:border-purple-500/50 transition-all duration-300
           hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6] backdrop-blur-sm"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-4 rounded-lg bg-purple-500/20 ${animationEnabled ? 'transform hover:scale-110 transition-transform duration-300' : ''}`}>
          <Icon className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-2xl font-semibold text-white bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
          {title}
        </h3>
      </div>
      <p className="text-gray-300 mb-6 text-lg leading-relaxed">{description}</p>
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 
                   transition-colors group text-lg"
        >
          Learn more
          <FaArrowRight className={`w-4 h-4 ${animationEnabled ? 'transform group-hover:translate-x-1 transition-transform duration-300' : ''}`} />
        </a>
      )}
    </motion.div>
  );
});

// Asegurar que el componente tenga un displayName para DevTools
AITool.displayName = 'AITool';

const FeatureCards = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  
  // Deshabilitar animaciones si el usuario prefiere reducción de movimiento o tiene dispositivo de bajo rendimiento
  const animationEnabled = !shouldReduceMotion && !isLowPerformance;

  const aiTools = [
    {
      title: "Reward Optimizer",
      description: "AI-powered tool to help you optimize your staking strategy and maximize your NUVOS rewards.",
      icon: FaChartLine,
      link: "#reward-optimizer"
    },
    {
      title: "Chat Assistant",
      description: "AI-driven chat assistant for personalized support and information about the NUVOS ecosystem.",
      icon: FaComments, // changed from FaChat to FaComments
      link: "#trading-assistant"
    },
    {
      title: "NFTs Utility",
      description: "AI-driven analysis of NFT trends and market insights in the NUVOS ecosystem.",
      icon: FaRobot,
      link: "#nfts-utility"
    }
  ];

  // Stagger container animation
  const containerVariants = animationEnabled ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  } : { visible: { opacity: 1 } };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
      style={{ perspective: animationEnabled ? '1000px' : 'none' }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {aiTools.map((tool, index) => (
        <div
          key={index}
          className={animationEnabled ? "transform hover:scale-105 transition-transform duration-300" : ""}
          style={{ animationDelay: animationEnabled ? `${index * 150}ms` : '0ms' }}
        >
          <AITool {...tool} animationEnabled={animationEnabled} />
        </div>
      ))}
    </motion.div>
  );
};

// Usar memoWithName para mejorar rendimiento y debugging
export default memoWithName(FeatureCards);
