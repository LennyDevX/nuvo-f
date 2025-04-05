import React, { useState } from 'react';
import { FaRobot, FaTools, FaChartLine, FaBrain, FaServer, FaGem, FaArrowRight, FaTshirt, FaGift, FaCoins, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';
import SpaceBackground from '../effects/SpaceBackground';

const AITool = ({ title, description, icon: Icon, link }) => (
  <div className="p-8 rounded-xl bg-purple-900/20 border border-purple-500/30 
       hover:border-purple-500/50 transition-all duration-300
       hover:shadow-[0_0_2rem_-0.5rem_#8b5cf6] backdrop-blur-sm">
    <div className="flex items-center gap-4 mb-6">
      <div className="p-4 rounded-lg bg-purple-500/20 transform hover:scale-110 transition-transform duration-300">
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
        <FaArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
      </a>
    )}
  </div>
);

const FeatureCard = ({ title, description, icon: Icon }) => (
  <div className="flex gap-4 p-5 rounded-lg bg-purple-900/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
    <div className="p-3 rounded-lg bg-purple-500/20 h-fit">
      <Icon className="w-6 h-6 text-purple-400" />
    </div>
    <div>
      <h4 className="text-xl font-medium text-white mb-2">{title}</h4>
      <p className="text-gray-300">{description}</p>
    </div>
  </div>
);

const AIHub = () => {
  const [activeTab, setActiveTab] = useState('nuv-os');
  
  // Letter-by-letter animation variants
  const letterVariants = {
    hidden: { opacity: 0, x: 3 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.2,
        ease: "easeIn"
      }
    })
  };

  // Container animation for title
  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.10,
        delayChildren: 0.2
      }
    }
  };
  
  const aiTools = [
    {
      title: "Reward Optimizer",
      description: "AI-powered tool to help you optimize your staking strategy and maximize your NUVO rewards.",
      icon: FaChartLine,
      link: "#reward-optimizer"
    },
    {
      title: "Trading Assistant",
      description: "Smart analysis and recommendations for NUVO token trading based on market conditions.",
      icon: FaTools,
      link: "#trading-assistant"
    },
    {
      title: "Community Insights",
      description: "AI-driven analysis of community sentiment and trending topics in the NUVO ecosystem.",
      icon: FaRobot,
      link: "#community-insights"
    }
  ];

  const nuvOsFeatures = [
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
  ];

  const nuvAiFeatures = [
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
  ];

  const nuvX1Features = [
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
  ];

  return (
    <div className="relative min-h-screen pt-28 pb-16 flex flex-col items-center">
      <SpaceBackground customClass="opacity-80" />
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          {/* Title with letter-by-letter animation */}
          <motion.div
            variants={titleContainerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 overflow-hidden"
          >
            {Array.from("NUVOS AI Ecosystem").map((char, index) => (
              <motion.span
                key={index}
                custom={index}
                variants={letterVariants}
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 
                         drop-shadow-[2px_3px_1px_rgba(139,92,246,0.8)] 
                         transition-all duration-600 text-5xl md:text-6xl font-bold"
                style={{
                  textShadow: "0 0 0 rgba(139, 92, 246, 0.5), 0 0 5px rgba(139, 92, 246, 0.3)"
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
          
          
          <motion.p 
            initial={{ opacity: 0, y: 0, x: 5 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ delay: 2.0, duration: 1 }}
            className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed"
          >
            Experience the power of artificial intelligence within the Nuvos ecosystem. Our AI-driven solutions 
            enhance every aspect of your journey, from optimizing rewards to personalized assistance and exclusive benefits.
          </motion.p>
        </div>

        {/* AI Tools Grid - Core Products */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          style={{ perspective: '1000px' }}
        >
          {aiTools.map((tool, index) => (
            <div
              key={index}
              className="transform hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <AITool {...tool} />
            </div>
          ))}
        </div>

        {/* Tabs for Nuv-OS, Nuv-AI, Nuv-X1 */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              { id: 'nuv-os', label: 'Nuv-OS', icon: FaServer },
              { id: 'nuv-ai', label: 'Nuv-AI', icon: FaBrain },
              { id: 'nuv-x1', label: 'Nuv-X1', icon: FaGem }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                    : 'bg-purple-900/20 text-gray-300 hover:bg-purple-900/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Nuv-OS Content */}
          <div className={`transition-all duration-500 ${activeTab === 'nuv-os' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Nuv-OS: The Core Intelligence</h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Nuv-OS is the central brain of our ecosystem, connecting all capabilities through a decentralized 
                  governance structure. This core system enables transparent, secure development while allowing 
                  community members to participate in decision-making.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {nuvOsFeatures.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                  ))}
                </div>
              </div>
              <div className="bg-purple-900/20 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <div className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center">
                  <FaServer className="w-32 h-32 text-purple-400 animate-pulse" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#1a002a_100%)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Nuv-AI Content */}
          <div className={`transition-all duration-500 ${activeTab === 'nuv-ai' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 bg-purple-900/20 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <div className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center">
                  <FaBrain className="w-32 h-32 text-purple-400 animate-pulse" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#1a002a_100%)]" />
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Nuv-AI: Your Intelligent Assistant</h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Nuv-AI is your personal guide through the Nuvos ecosystem. This advanced AI agent answers your questions, 
                  optimizes your strategies, and helps you maximize your benefits within Nuvos Cloud and beyond.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {nuvAiFeatures.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Nuv-X1 Content */}
          <div className={`transition-all duration-500 ${activeTab === 'nuv-x1' ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Nuv-X1: Elite NFT Collection</h2>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Nuv-X1 is our premium NFT collection, created 100% using AI-generated digital art. Holders gain exclusive 
                  advantages within Nuvos Cloud, increasing earning potential and unlocking special rewards like airdrops, 
                  additional NFTs, merchandise, and much more.
                </p>
                <div className="grid grid-cols-1 gap-4">
                  {nuvX1Features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                  ))}
                </div>
              </div>
              <div className="bg-purple-900/20 p-8 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
                <div className="aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br from-purple-900/80 to-pink-900/80 flex items-center justify-center">
                  <FaGem className="w-32 h-32 text-purple-400 animate-pulse" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle,_transparent_25%,_#1a002a_100%)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 p-8 rounded-xl bg-gradient-to-r from-purple-900/20 to-purple-800/20 border border-purple-500/30 transform hover:scale-[1.02] transition-transform duration-300 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Join the AI Revolution
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-8">
            Become part of our growing community and experience the benefits of AI-powered solutions in the Nuvos ecosystem.
            Whether you're interested in optimizing rewards, getting personalized assistance, or accessing exclusive benefits, 
            our AI technologies are designed to enhance your journey.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25">
            Get Started with Nuvos AI
          </button>
        </div>
      </div>
    </div>
  );
};

// Add this animation to your CSS or Tailwind config
// '@keyframes fadeIn': {
//   from: { opacity: 0, transform: 'translateY(20px)' },
//   to: { opacity: 1, transform: 'translateY(0)' }
// },
// '.animate-fade-in': {
//   animation: 'fadeIn 0.6s ease-out forwards'
// }

export default AIHub;
