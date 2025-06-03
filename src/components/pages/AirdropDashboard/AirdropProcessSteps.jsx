import React from 'react';
import { motion } from 'framer-motion';
import { FaWallet, FaPaperPlane, FaShieldAlt, FaGift } from 'react-icons/fa';

const AirdropProcessSteps = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const processSteps = [
    {
      icon: <FaWallet className="text-purple-400" />,
      title: "Connect Wallet",
      description: "Connect your Web3 wallet to our platform. We support MetaMask, WalletConnect, Coinbase and more."
    },
    {
      icon: <FaPaperPlane className="text-blue-400" />,
      title: "Register",
      description: "Fill out the form with your details and submit to register for the airdrop."
    },
    {
      icon: <FaShieldAlt className="text-green-400" />,
      title: "Verification",
      description: "Your wallet will be verified to ensure eligibility for the airdrop."
    },
    {
      icon: <FaGift className="text-pink-400" />,
      title: "Receive Tokens",
      description: "Once verified, you will receive your NUVO tokens directly to your wallet."
    }
  ];

  return (
    <motion.section 
      className="mb-16 lg:mb-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
    >
      <div className="text-center mb-8 lg:mb-12 p-4 lg:p-6 rounded-xl shadow-lg border border-purple-500/30">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)]">
          How It Works
        </h2>
      </div>

      {/* Mobile: 2x2 grid, Tablet: 2x2, Desktop: 4x1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {processSteps.map((step, index) => (
          <motion.div
            key={index}
            variants={fadeInUp}
            className="nuvos-card p-3 md:p-4 lg:p-6 hover:border-purple-500/70 transition-all duration-300 shadow-lg"
          >
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-purple-900/70 flex items-center justify-center mb-3 md:mb-4 shadow-md mx-auto lg:mx-0">
              <div className="text-sm md:text-base lg:text-lg">
                {step.icon}
              </div>
            </div>
            <h3 className="text-sm md:text-lg lg:text-xl font-medium text-white mb-2 drop-shadow-sm text-center lg:text-left">
              {index + 1}. {step.title}
            </h3>
            <p className="text-xs md:text-sm lg:text-base text-gray-200 text-center lg:text-left">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default AirdropProcessSteps;
