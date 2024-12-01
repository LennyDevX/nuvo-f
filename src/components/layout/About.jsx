// About.jsx

import React, { useContext } from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen py-16 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-8 text-purple-600 tracking-tight">
            About Our Staking Protocol
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto">
            Empowering Your Crypto Investments Through Innovation and Transparency
          </p>
        </motion.div>

        <motion.div
          className="mt-12 space-y-16 max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <section className="bg-gray-800/50 rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-semibold text-purple-500 mb-6">
              How Our Smart Contract Works
            </h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              Our staking protocol operates through a secure and audited smart contract deployed on the blockchain. When you stake your tokens:
            </p>
            <ul className="list-disc list-inside text-gray-300 text-lg mt-4 space-y-2">
              <li>Your assets are safely locked in the smart contract</li>
              <li>Rewards are automatically calculated based on your staking period</li>
              <li>You maintain full control of your funds with unstaking flexibility</li>
              <li>All transactions are transparent and verifiable on-chain</li>
            </ul>
          </section>

          <section className="bg-gray-800/50 rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-semibold text-purple-500 mb-6">
              Benefits of Staking with Us
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-medium text-purple-400 mb-3">Competitive APY</h3>
                <p className="text-gray-300">Earn attractive returns on your staked tokens with our competitive annual percentage yield.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-purple-400 mb-3">Security First</h3>
                <p className="text-gray-300">Your assets are protected by industry-leading security measures and regular smart contract audits.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-purple-400 mb-3">Flexible Terms</h3>
                <p className="text-gray-300">Choose staking periods that suit your investment strategy, from short-term to long-term options.</p>
              </div>
              <div>
                <h3 className="text-xl font-medium text-purple-400 mb-3">Community Focused</h3>
                <p className="text-gray-300">Join a growing community of stakers and participate in governance decisions.</p>
              </div>
            </div>
          </section>

          <motion.div
            className="text-center mt-16 pb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <h2 className="text-3xl font-semibold text-purple-500 mb-6">
              Join Us in Shaping the Future of Finance
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-3xl mx-auto">
              Take part in the future of decentralized finance. Our staking protocol offers you a secure, 
              transparent, and rewarding way to grow your crypto assets while contributing to the network's stability.
            </p>
            <a
              href="/staking"
              className="px-10 py-4 text-lg font-medium rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 shadow-lg hover:shadow-purple-500/25"
            >
              Start Staking Now
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
