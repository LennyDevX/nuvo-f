import React from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaStar, FaPalette, FaMicrophone, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useAnimationConfig } from '../../animation/AnimationProvider';
import memoWithName from '../../../utils/performance/memoWithName';

const CategoryCard = memoWithName(({ category, index, animationEnabled }) => {
  // Simplificar animaciones para mejor rendimiento
  const cardVariants = React.useMemo(() => 
    animationEnabled ? {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.4, 
          delay: index * 0.05, // Reducir delay
          ease: "easeOut"
        }
      }
    } : { visible: { opacity: 1 } }
  , [animationEnabled, index]);

  // Hover effect más liviano
  const hoverEffect = React.useMemo(() => 
    animationEnabled ? {
      scale: 1.01,
      transition: { duration: 0.2 }
    } : {}
  , [animationEnabled]);

  return (
    <motion.div
      className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      whileHover={hoverEffect}
    >
      {/* Category header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg">
          {category.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{category.title}</h3>
          <p className="text-purple-300 font-medium text-sm">{category.subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-4 leading-relaxed text-sm">
        {category.description}
      </p>

      {/* Benefits list - Simplificado */}
      <div className="space-y-2 mb-6">
        <h4 className="text-base font-semibold text-white mb-3">Key Benefits:</h4>
        {category.benefits.slice(0, 3).map((benefit, idx) => ( // Mostrar solo 3 para mejor rendimiento
          <div key={idx} className="flex items-start gap-2">
            <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0 text-sm" />
            <span className="text-gray-300 text-xs leading-relaxed">{benefit}</span>
          </div>
        ))}
        {category.benefits.length > 3 && (
          <div className="text-purple-400 text-xs mt-2">
            +{category.benefits.length - 3} more benefits
          </div>
        )}
      </div>

      {/* NFT Collection info - Compactado */}
      <div className="bg-black/30 rounded-lg p-3 mb-4 border border-purple-500/10">
        <div className="flex justify-between items-center mb-1">
          <span className="text-purple-300 font-medium text-sm">NFT Collection</span>
          <span className="text-white font-bold text-sm">{category.nftCollection.supply}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-xs">Price: {category.nftCollection.price}</span>
          <span className="text-purple-400 font-semibold text-xs">{category.nftCollection.utility}</span>
        </div>
      </div>

      {/* Action button */}
      <button className="w-full btn-nuvo-base bg-nuvo-gradient-button text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 text-sm">
        Explore {category.title}
        <FaArrowRight className="text-xs" />
      </button>
    </motion.div>
  );
});

const Category = () => {
  const { shouldReduceMotion, isLowPerformance } = useAnimationConfig();
  const animationEnabled = !shouldReduceMotion && !isLowPerformance;

  const categories = [
    {
      title: "Photographers",
      subtitle: "Visual Storytellers",
      icon: <FaCamera />,
      description: "Transform your photography into valuable digital assets. Showcase your unique perspective and connect with collectors who appreciate your artistic vision.",
      benefits: [
        "Monetize your photography portfolio through exclusive NFT collections",
        "Retain copyright while creating scarcity for digital prints",
        "Access to premium photography equipment through NFT holder benefits",
        "Direct connection with collectors and photography enthusiasts",
        "Royalties from secondary market sales of your work",
        "Exclusive workshops and masterclasses with industry professionals"
      ],
      nftCollection: {
        supply: "1,000",
        price: "0.1 POL",
        utility: "Premium"
      }
    },
    {
      title: "Models",
      subtitle: "Digital Ambassadors",
      icon: <FaStar />,
      description: "Leverage your personal brand and create exclusive digital content for your community. Build deeper connections with your audience through unique NFT experiences.",
      benefits: [
        "Create exclusive behind-the-scenes content for NFT holders",
        "Personal meet-and-greet opportunities and virtual events",
        "Limited edition merchandise and fashion collaborations",
        "Priority access to casting calls and modeling opportunities",
        "Revenue sharing from brand partnerships and collaborations",
        "Professional portfolio development and career guidance"
      ],
      nftCollection: {
        supply: "500",
        price: "0.15 POL",
        utility: "Exclusive"
      }
    },
    {
      title: "Artists",
      subtitle: "Creative Visionaries",
      icon: <FaPalette />,
      description: "Showcase your artistic creations and build a sustainable income through digital art. Connect with art collectors and expand your creative possibilities.",
      benefits: [
        "Sell original digital artwork with provable authenticity",
        "Commission opportunities for custom NFT artwork",
        "Access to premium art supplies and digital tools",
        "Gallery exhibitions featuring NFT holder exclusive events",
        "Collaborative projects with other artists in the ecosystem",
        "Art education programs and creative development resources"
      ],
      nftCollection: {
        supply: "750",
        price: "0.12 POL",
        utility: "Creative"
      }
    },
    {
      title: "Communicators",
      subtitle: "Voice Leaders",
      icon: <FaMicrophone />,
      description: "Build your media empire and create valuable content experiences. From podcasters to influencers, monetize your communication skills and audience.",
      benefits: [
        "Exclusive podcast episodes and content for NFT community",
        "Direct messaging and consultation opportunities",
        "Early access to courses, books, and educational content",
        "VIP access to live events, conferences, and speaking engagements",
        "Revenue sharing from sponsored content and partnerships",
        "Professional development and personal branding assistance"
      ],
      nftCollection: {
        supply: "600",
        price: "0.08 POL",
        utility: "Community"
      }
    }
  ];

  // Simplificar container animation
  const containerVariants = React.useMemo(() => 
    animationEnabled ? {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05, // Reducir stagger
          delayChildren: 0.1
        }
      }
    } : { visible: { opacity: 1 } }
  , [animationEnabled]);

  return (
    <section className="py-12 lg:py-16 px-4 relative">
      {/* Background effect simplificado */}
      <div className="absolute inset-0">
        {animationEnabled && (
          <motion.div 
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/3 blur-3xl"
            animate={{ 
              scale: [1, 1.05, 1], 
              opacity: [0.05, 0.1, 0.05] 
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section header optimizado */}
        <motion.div 
          className="text-center mb-12"
          initial={animationEnabled ? { opacity: 0, y: 15 } : { opacity: 1 }}
          whileInView={animationEnabled ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-nuvo-gradient-text">
              Creator Categories
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover how NFTs can revolutionize your creative career.
          </p>
        </motion.div>

        {/* Categories grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {categories.map((category, index) => (
            <CategoryCard 
              key={category.title}
              category={category}
              index={index}
              animationEnabled={animationEnabled}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default memoWithName(Category);
