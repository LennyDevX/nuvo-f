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

  // Memoize the card component
  const Card = useMemo(() => ({ title, description }) => (
    <div className="nuvos-card p-4">
      <h3 className="text-lg font-semibold text-purple-400 mb-2">
        {title}
      </h3>
      <p className="text-gray-300">
        {description}
      </p>
    </div>
  ), []);

  // Memoize the cards grid to prevent re-rendering
  const cardsGrid = useMemo(() => (
    <div className="grid md:grid-cols-2 gap-6">
      {cardData.map((card, index) => (
        <Card key={index} title={card.title} description={card.description} />
      ))}
    </div>
  ), [cardData, Card]);

  return (
    <motion.div
      className="nuvos-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        Understanding the Importance of Tokenomics
      </h2>
      <p className="text-gray-300 mb-6">
        Tokenomics is the backbone of any blockchain ecosystem. It defines how tokens are distributed, utilized, and sustained over time, ensuring a fair and thriving environment for all participants.
      </p>
      {cardsGrid}
    </motion.div>
  );
};

export default React.memo(TokenomicsExplanation);
