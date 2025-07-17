import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaGem, 
  FaShieldAlt, 
  FaCoins, 
  FaUsers, 
  FaCrown,
  FaRocket,
  FaCheckCircle,
  FaArrowRight,
  FaPalette,
  FaLock,
  FaStar,
  FaGift
} from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';

const FeatureCard = memoWithName(({ feature, index, animationEnabled }) => {
  const cardVariants = animationEnabled ? {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  } : { visible: { opacity: 1 } };

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-900/30 to-black/40 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      whileHover={animationEnabled ? { 
        scale: 1.02,
        boxShadow: "0 10px 30px rgba(168, 85, 247, 0.15)"
      } : {}}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg`}>
          {feature.icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  );
});

const BenefitStep = memoWithName(({ step, index, animationEnabled }) => {
  const stepVariants = animationEnabled ? {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        delay: index * 0.15,
        ease: "easeOut"
      }
    }
  } : { visible: { opacity: 1 } };

  return (
    <motion.div
      className="flex items-start gap-4 p-4 bg-black/20 rounded-lg border border-purple-500/10"
      variants={stepVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {index + 1}
      </div>
      <div>
        <h4 className="text-white font-medium mb-2">{step.title}</h4>
        <p className="text-gray-300 text-sm">{step.description}</p>
      </div>
    </motion.div>
  );
});

const NFTsInfo = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const animationEnabled = !shouldReduceMotion && !isLowPerformance;

  const nftFeatures = [
    {
      title: "Verifiable Digital Ownership",
      description: "Every Nuvos NFT is registered on blockchain, guaranteeing authenticity and unique ownership of your digital asset.",
      icon: <FaShieldAlt />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Continuous Monetization",
      description: "Receive automatic royalties every time your NFT is resold, creating permanent passive income streams.",
      icon: <FaCoins />,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Exclusive Access",
      description: "Nuvos NFTs grant VIP access to events, premium tools and exclusive opportunities in our ecosystem.",
      icon: <FaCrown />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Global Community",
      description: "Connect with other creators, collaborate on projects and expand your professional network through our NFT community.",
      icon: <FaUsers />,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Scalability",
      description: "Your NFT grows with you, unlocking new functionalities and benefits as your audience expands.",
      icon: <FaRocket />,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Interoperability",
      description: "Use your Nuvos NFT across multiple platforms and services within our ecosystem and beyond.",
      icon: <FaGem />,
      gradient: "from-red-500 to-pink-500"
    }
  ];

  const howItWorks = [
    {
      title: "Connect Your Wallet",
      description: "Connect your crypto wallet (MetaMask, WalletConnect, etc.) to access all NFT features."
    },
    {
      title: "Choose Your Exclusive NFT",
      description: "Select the unique Nuvos Cloud NFT specially designed for content creators like you."
    },
    {
      title: "Mint Your NFT",
      description: "Confirm the transaction and receive your unique NFT directly in your digital wallet."
    },
    {
      title: "Unlock Benefits",
      description: "Immediately enjoy premium access, exclusive tools and the Nuvos creators community."
    }
  ];

  const nuvosAdvantages = [
    "🎨 Access to advanced creation tools",
    "💰 2% revenue sharing on all platform transactions",
    "🎯 Priority in collaborations and brand partnerships",
    "📊 Advanced analytics to optimize your content and rewards",
    "🎪 Exclusive invitations to events and workshops",
    "🤝 Personalized mentoring with established creators",
    "🔮 Early access to new platform features",
    "👑 Verified badge as Premium Creator on all platforms"
  ];

  const containerVariants = animationEnabled ? {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } : { visible: { opacity: 1 } };

  return (
    <section className="py-16 lg:py-24 px-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl"
          animate={animationEnabled ? { 
            scale: [1, 1.1, 1], 
            opacity: [0.1, 0.15, 0.1] 
          } : {}}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div 
          className="text-center mb-16"
          initial={animationEnabled ? { opacity: 0, y: 20 } : { opacity: 1 }}
          whileInView={animationEnabled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-nuvo-gradient-text">
              Nuvos NFTs Special Edition
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover how our unique NFTs can revolutionize your career as a digital creator and 
            give you access to a complete ecosystem of tools and opportunities.
          </p>
        </motion.div>

        {/* What is an NFT explanation */}
        <motion.div 
          className="mb-20"
          initial={animationEnabled ? { opacity: 0, y: 20 } : { opacity: 1 }}
          whileInView={animationEnabled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaPalette className="text-purple-400" />
                  What is an NFT?
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  An NFT (Non-Fungible Token) is a unique digital asset that represents ownership 
                  of digital content on the blockchain. Unlike cryptocurrencies, each NFT 
                  is unique and irreplaceable.
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Nuvos NFTs go beyond: they are your access key to a complete ecosystem 
                  of tools, benefits and opportunities designed specifically for 
                  content creators like you.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-white">Blockchain authenticity certificate</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-white">Verifiable and transferable ownership</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaCheckCircle className="text-green-400" />
                    <span className="text-white">Real utility in the Nuvos ecosystem</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                    <FaGem className="text-6xl text-white" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <FaCrown className="text-2xl text-white" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <FaStar className="text-2xl text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nuvos Exclusive Benefits */}
        <motion.div 
          className="mb-16"
          initial={animationEnabled ? { opacity: 0, y: 20 } : { opacity: 1 }}
          whileInView={animationEnabled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-black/40 to-purple-900/40 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/20">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-nuvo-gradient-text">
                  Your Exclusive Digital Work Of Art
                </span>
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                As a token of support for your creative work, you'll be able to acquire a unique and special NFT 
                that will grant you full access to our ecosystem and make you part of the 
                exclusive Nuvos Digital Creators program.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaGift className="text-purple-400" />
                  Exclusive Benefits Included:
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {nuvosAdvantages.map((advantage, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-purple-500/10"
                    >
                      <span className="text-sm">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 p-6 rounded-xl border border-purple-500/30 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaLock className="text-3xl text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">NFT Premium Creator</h4>
                  <p className="text-gray-300 mb-4">
                    Limited edition for verified creators
                  </p>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-nuvo-gradient-text mb-4">
                    0.25 POL
                  </div>
                  <p className="text-sm text-purple-300 mb-6">
                    Only 1,000 NFTs available
                  </p>
                  <motion.button
                    className="w-full btn-nuvo-base bg-nuvo-gradient-button text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
                    whileHover={animationEnabled ? { scale: 1.02 } : {}}
                    whileTap={animationEnabled ? { scale: 0.98 } : {}}
                  >
                    <FaGem />
                    Get My Exclusive NFT
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        
          
        
      </div>
    </section>
  );
};
export default NFTsInfo;