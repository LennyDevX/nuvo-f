import React from 'react';
import { m } from 'framer-motion';
import { FaWallet, FaStore, FaKey, FaUserShield } from 'react-icons/fa';

const NFTExplainerSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  // Steps to explain the NFT process
  const steps = [
    {
      icon: <FaWallet />,
      title: "Connect Your Wallet",
      description: "Link your compatible crypto wallet to our platform securely and easily.",
      color: "from-purple-600 to-blue-600"
    },
    {
      icon: <FaStore />,
      title: "Browse the Collection",
      description: "Explore our limited-edition NUVOS NFTs with different utility levels and benefits.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <FaKey />,
      title: "Purchase & Mint",
      description: "Secure your NFT with a simple transaction. Each is minted directly to your wallet.",
      color: "from-cyan-600 to-purple-600"
    },
    {
      icon: <FaUserShield />,
      title: "Enjoy the Benefits",
      description: "Immediately access exclusive features, discounts, and opportunities within the Nuvos ecosystem.",
      color: "from-purple-600 to-blue-800"
    }
  ];

  return (
    <div className="py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -right-64 -top-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -left-64 top-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      
      <m.div 
        className="container mx-auto px-4 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <m.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
            How NUVOS NFTs Work
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-gray-300">
            Our NFTs combine digital collectibility with real utility. Here's how to get started and what 
            you can expect when you own a NUVOS NFT.
          </p>
        </m.div>

        {/* Process Steps */}
        <m.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step, index) => (
            <m.div 
              key={index} 
              variants={itemVariants}
              className="rounded-xl overflow-hidden"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={`bg-gradient-to-br ${step.color} p-8 h-full rounded-xl`}>
                <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white text-2xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                <p className="text-white/80">{step.description}</p>
                <div className="mt-4 flex items-center">
                  <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </span>
                </div>
              </div>
            </m.div>
          ))}
        </m.div>
      </m.div>
    </div>
  );
};

// Asegúrate de incluir esta exportación default
export default NFTExplainerSection;
