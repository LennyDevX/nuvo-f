import React, { useMemo } from "react";
import { m } from "framer-motion";

const NFTnomicsModel = () => {
  // Memoize card data
  const cardData = useMemo(() => [
    {
      title: "Seasonal Collections for Sustained Growth",
      description: "Our model is built on seasonal NFT collections, released every 4 months. This ensures continuous innovation, engagement, and fresh opportunities for the community."
    },
    {
      title: "NFTs as Keys to a Creator Economy",
      description: "Each NFT serves as a unique key, granting access to our DeFi ecosystem. This empowers creators to monetize their work and users to participate in a vibrant digital economy."
    },
    {
      title: "Real-World Utility and Value",
      description: "We bridge the digital and physical worlds. NFTs unlock tangible benefits like discounts, exclusive access, and physical rewards, creating lasting value for holders."
    },
    {
      title: "Transparent Value via Smart Contracts",
      description: "Our NFT-nomics are built on transparency. All utilities and benefits are encoded directly into smart contracts, ensuring trust and clarity for our entire community."
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
    <m.div 
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
    </m.div>
  ), []);

  // Memoize the cards grid with 2x2 mobile layout
  const cardsGrid = useMemo(() => (
    <m.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 lg:gap-4"
    >
      {cardData.map((card, index) => (
        <Card key={index} title={card.title} description={card.description} index={index} />
      ))}
    </m.div>
  ), [cardData, Card]);

  return (
    <m.div
      className="mx-2 sm:mx-4 nuvos-card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-3 
                       bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Understanding Our NFT-nomics Model
        </h2>
        <p className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed">
          NFT-nomics is the backbone of our ecosystem. It defines how our NFT collections create, deliver, and sustain value over time, ensuring a fair and thriving environment for all participants.
        </p>
      </div>
      {cardsGrid}
    </m.div>
  );
};

export default React.memo(NFTnomicsModel);
