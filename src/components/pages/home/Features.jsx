import React from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaLock, FaTrophy } from 'react-icons/fa';

const Features = () => {
  return (
    <>
      {/* How It Works Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          How It Works
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaLock className="w-12 h-12 text-purple-400" />,
              title: "Connect & Deposit",
              description: "Connect your wallet and deposit a minimum of 5 POL to start earning rewards."
            },
            {
              icon: <FaClock className="w-12 h-12 text-purple-400" />,
              title: "Earn Hourly",
              description: "Receive 0.025% returns every hour, automatically credited to your stake."
            },
            {
              icon: <FaTrophy className="w-12 h-12 text-purple-400" />,
              title: "Maximize Returns",
              description: "Earn up to 130% ROI through consistent staking and bonus rewards."
            }
          ].map((step, index) => (
            <motion.div
              key={step.title}
              className="bg-black/30 rounded-xl p-8 text-center border border-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="flex justify-center mb-6">{step.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-4">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Community Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Community Benefits
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: "Holding Bonus", reward: "Up to 5% APR", requirement: "Hold 1000+ tokens" },
            { title: "Airdrops", reward: "Free Tokens", requirement: "Every 2 month (coming soon)" },
            { title: "NFT", reward: "Exclusive benefits", requirement: "Mint Your NFT (coming soon)" },
            { title: "Token NCT", reward: "Get Tokens every month", requirement: "Stakes above 200 POL" }
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">{benefit.title}</h3>
              <p className="text-purple-400 mb-2">{benefit.reward}</p>
              <p className="text-gray-300 text-sm">{benefit.requirement}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Features;
             