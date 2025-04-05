import React from 'react';
import { m } from 'framer-motion';
import { FaGift, FaRocket } from 'react-icons/fa';
import { airdropInfo } from './AirdropConfig';

const AirdropSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const updatedCategories = [
    {
      title: "Early Tokenizers",
      amount: "250 NUVO Tokens",
      requirements: "For users who join our beta program and tokenize their first physical asset through our platform."
    },
    {
      title: "Digital Bridge Builders",
      amount: "500 NUVO Tokens",
      requirements: "For developers and creators who build experiences that utilize tokenized physical assets in innovative ways."
    }
  ];

  const updatedEligibility = [
    "Connect your wallet to Nuvos Cloud",
    "Complete profile verification",
    "Participate in the tokenization beta",
    "Provide feedback on the tokenization process",
    "Share your tokenized asset on social media",
    "Join our community discussions"
  ];

  return (
    <section className="relative py-32 px-4">
      {/* Enhanced background design - Remove dots pattern */}
      <div className="absolute inset-0 bg-transparent"></div>
      {/* Remove the dots pattern that causes grid effect */}
      
      {/* Animated accent elements */}
      <m.div 
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-purple-600/5 blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1], 
          opacity: [0.1, 0.2, 0.1],
          x: [0, -20, 0],
          y: [0, 20, 0] 
        }}
        transition={{ duration: 10, repeat: Infinity }}
      ></m.div>

      <div className="max-w-6xl mx-auto relative z-10">
        <m.h2 
          className="text-5xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
            Tokenization Pioneers
          </span>
        </m.h2>
        
        <m.p
          className="text-xl text-center text-gray-300 max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          Join our early adopter program to start tokenizing your physical assets and earn NUVO tokens as you help build the bridge between worlds.
        </m.p>

        <m.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
          }}
        >
          {updatedCategories.map((category, index) => (
            <m.div
              key={index}
              variants={cardVariants}
              className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
              whileHover={{ 
                scale: 1.02, 
                boxShadow: "0 0 25px 0 rgba(168, 85, 247, 0.3)",
                borderColor: "rgba(168, 85, 247, 0.5)"
              }}
            >
              <m.div 
                className="text-purple-400 text-4xl mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaGift />
              </m.div>
              <h3 className="text-2xl font-bold text-white mb-4">{category.title}</h3>
              <p className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                  {category.amount}
                </span>
              </p>
              <p className="text-gray-300">{category.requirements}</p>
            </m.div>
          ))}
        </m.div>

        <m.div 
          className="bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-md p-8 rounded-xl border border-purple-500/20 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">Tokenization Program Requirements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {updatedEligibility.map((requirement, index) => (
              <m.div 
                key={index} 
                className="flex items-center gap-4 text-gray-300"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <m.div
                  className="text-purple-400 text-xl flex-shrink-0"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  <FaRocket />
                </m.div>
                <span>{requirement}</span>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
};

export default AirdropSection;
