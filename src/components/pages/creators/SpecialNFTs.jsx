import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaGem, 
  FaCrown, 
  FaRocket, 
  FaShieldAlt, 
  FaCoins, 
  FaUsers, 
  FaChartLine,
  FaGift,
  FaStar,
  FaLock
} from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';

const BenefitCard = memoWithName(({ benefit, index, animationEnabled }) => {
  const cardVariants = animationEnabled ? {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        delay: index * 0.05,
        ease: "easeOut"
      }
    }
  } : { visible: { opacity: 1, scale: 1 } };

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
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.gradient} flex items-center justify-center text-white shadow-lg`}>
          {benefit.icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">{benefit.description}</p>
    </motion.div>
  );
});

const UtilityTier = memoWithName(({ tier, index, animationEnabled }) => {
  const tierVariants = animationEnabled ? {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        delay: index * 0.1,
        ease: "easeOut"
      }
    }
  } : { visible: { opacity: 1 } };

  return (
    <motion.div
      className={`relative p-8 rounded-2xl border backdrop-blur-sm ${tier.highlighted 
        ? 'border-gradient-to-r from-purple-500 to-pink-500 bg-gradient-to-br from-purple-900/50 to-pink-900/30' 
        : 'border-purple-500/20 bg-black/30'
      } hover:border-purple-500/40 transition-all duration-300`}
      variants={tierVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={animationEnabled ? { 
        scale: 1.02,
        y: -5
      } : {}}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full">
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${tier.iconBg}`}>
          <span className="text-2xl">{tier.icon}</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
        <p className="text-gray-300">{tier.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white mb-1">{tier.price}</div>
        <div className="text-purple-300 text-sm">{tier.supply} available</div>
      </div>

      <div className="space-y-3 mb-8">
        {tier.features.map((feature, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <FaShieldAlt className="text-green-400 flex-shrink-0" />
            <span className="text-gray-300 text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <motion.button
        className={`w-full py-3 rounded-lg font-semibold transition-all ${
          tier.highlighted
            ? 'btn-nuvo-base bg-nuvo-gradient-button text-white'
            : 'btn-nuvo-base btn-nuvo-outline'
        }`}
        whileHover={animationEnabled ? { scale: 1.02 } : {}}
        whileTap={animationEnabled ? { scale: 0.98 } : {}}
      >
        {tier.buttonText || `Mint ${tier.name} NFT`}
      </motion.button>
    </motion.div>
  );
});

const SpecialNFTs = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const animationEnabled = !shouldReduceMotion && !isLowPerformance;

  const benefits = [
    {
      title: "Revenue Sharing",
      description: "Earn passive income from platform fees and creator collaborations through your NFT ownership.",
      icon: <FaCoins />,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      title: "Exclusive Access",
      description: "VIP access to events, workshops, and premium content from top creators in your field.",
      icon: <FaCrown />,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Professional Tools",
      description: "Access to premium software, equipment discounts, and professional development resources.",
      icon: <FaRocket />,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Community Network",
      description: "Connect with fellow creators, collaborate on projects, and expand your professional network.",
      icon: <FaUsers />,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "Brand Partnerships",
      description: "Priority consideration for brand deals, sponsorships, and commercial opportunities.",
      icon: <FaChartLine />,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "Legacy Protection",
      description: "Secure your digital legacy and maintain ownership rights across all platforms and markets.",
      icon: <FaShieldAlt />,
      gradient: "from-red-500 to-pink-500"
    }
  ];

  const utilityTiers = [
    {
      name: "Creator",
      description: "The perfect starting point for new creators to join our ecosystem.",
      price: "Free",
      supply: "Unlimited Access",
      icon: <FaStar />,
      iconBg: "bg-blue-500/20",
      highlighted: false,
      features: [
        "Access to the creator community",
        "Basic platform tools",
        "Entry to educational content",
        "Standard support",
        "A path to grow with us"
      ],
      buttonText: "Get Started"
    },
    {
      name: "VIP Member",
      description: "One-time payment for lifetime access to exclusive benefits and our creator fund.",
      price: "1000 POL",
      supply: "Limited Edition NFTs",
      icon: <FaGem />,
      iconBg: "bg-purple-500/20",
      highlighted: true,
      features: [
        "Special Edition Nuvos NFT",
        "Access to the Creator Fund",
        "Enhanced revenue sharing (5%)",
        "Priority partnership opportunities",
        "Exclusive community channels",
        "Advanced analytics dashboard"
      ],
      buttonText: "Mint VIP NFT"
    },
    {
      name: "Premium Creator",
      description: "Monthly subscription for dedicated support and collaboration with the Nuvos team.",
      price: "100 POL / month",
      supply: "Subscription-based",
      icon: <FaCrown />,
      iconBg: "bg-gold-500/20",
      highlighted: false,
      features: [
        "All VIP Member benefits",
        "Direct collaboration with Nuvos",
        "Personalized growth strategy support",
        "Featured on Nuvos platforms",
        "Top-tier support & consulting",
        "Influence platform development"
      ],
      buttonText: "Subscribe Now"
    },
    {
      name: "Selected",
      description: "For established influencers and brand ambassadors, by invitation or application.",
      price: "By Invitation",
      supply: "Exclusive Partnership",
      icon: <FaGift />,
      iconBg: "bg-cyan-500/20",
      highlighted: false,
      features: [
        "Highest level of benefits",
        "Official Brand Ambassador status",
        "Direct support from Nuvos Cloud",
        "Co-marketing campaigns",
        "Customized partnership terms",
        "Shape the future of Nuvos"
      ],
      buttonText: "Apply for Partnership"
    }
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
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-600/5 blur-3xl"
          animate={animationEnabled ? { 
            scale: [1, 1.2, 1], 
            opacity: [0.1, 0.2, 0.1] 
          } : {}}
          transition={{ duration: 10, repeat: Infinity }}
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
              Creator NFT Benefits
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            More than just digital collectibles - unlock real-world value and opportunities that grow with your creative career.
          </p>
        </motion.div>

        {/* Benefits grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {benefits.map((benefit, index) => (
            <BenefitCard 
              key={benefit.title}
              benefit={benefit}
              index={index}
              animationEnabled={animationEnabled}
            />
          ))}
        </motion.div>

        {/* Utility tiers section */}
        <motion.div 
          className="text-center mb-12"
          initial={animationEnabled ? { opacity: 0, y: 20 } : { opacity: 1 }}
          whileInView={animationEnabled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Choose Your <span className="text-transparent bg-clip-text bg-nuvo-gradient-text">Creator Tier</span>
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Each tier is designed to match your creator journey, providing increasingly valuable benefits as you grow.
          </p>
        </motion.div>

        {/* Utility tiers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {utilityTiers.map((tier, index) => (
            <UtilityTier 
              key={tier.name}
              tier={tier}
              index={index}
              animationEnabled={animationEnabled}
            />
          ))}
        </div>

        {/* Call to action */}
       
      </div>
    </section>
  );
};

export default memoWithName(SpecialNFTs);
