import React, { useMemo } from "react";
import { motion } from "framer-motion";

const TokenomicsExplanation = () => {
  // Memoize card data
  const cardData = useMemo(() => [
    {
      title: "Driving Ecosystem Growth",
      description: "Our tokenomics model ensures that resources are allocated to foster innovation, incentivize participation, and drive the growth of the ecosystem."
    },
    {
      title: "Empowering the Community",
      description: "By dedicating 60% of tokens to community rewards and ecosystem development, we align the success of the protocol with the value delivered to our users."
    },
    {
      title: "Ensuring Long-Term Sustainability",
      description: "A carefully designed token distribution model ensures the protocol remains sustainable, balancing rewards with ongoing development and operational needs."
    },
    {
      title: "Transparency and Trust",
      description: "Our tokenomics strategy is built on transparency, providing clear insights into token allocation and usage to build trust with our community."
    }
  ], []);

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Card animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  // Memoize the card component with improved mobile styling
  const Card = useMemo(() => ({ title, description, index }) => (
    <motion.div 
      variants={cardVariants}
      className="p-3 sm:p-4 lg:p-5 bg-gradient-to-br from-purple-900/25 to-purple-800/15 
                 rounded-xl border border-purple-500/25 hover:border-purple-400/50 
                 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10
                 hover:scale-[1.02] group"
    >
      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-purple-300 mb-2 sm:mb-3 
                     group-hover:text-purple-200 transition-colors leading-tight">
        {title}
      </h3>
      <p className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed 
                    group-hover:text-gray-200 transition-colors">
        {description}
      </p>
    </motion.div>
  ), []);

  // Memoize the cards grid with 2x2 mobile layout
  const cardsGrid = useMemo(() => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4"
    >
      {cardData.map((card, index) => (
        <Card key={index} title={card.title} description={card.description} index={index} />
      ))}
    </motion.div>
  ), [cardData, Card]);

  return (
    <motion.div
      className="mx-2 sm:mx-4 nuvos-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 
                       bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Understanding the Importance of Tokenomics
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed">
          Tokenomics is the backbone of any blockchain ecosystem. It defines how tokens are distributed, 
          utilized, and sustained over time, ensuring a fair and thriving environment for all participants.
        </p>
      </div>
      {cardsGrid}
    </motion.div>
  );
};

export default React.memo(TokenomicsExplanation);
