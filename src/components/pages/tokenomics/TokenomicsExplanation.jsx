import React from "react";
import { motion } from "framer-motion";

const TokenomicsExplanation = () => {
  return (
    <motion.div
      className="card-purple-gradient card-purple-wrapper"
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
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-purple-gradient card-purple-wrapper p-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">
            Driving Ecosystem Growth
          </h3>
          <p className="text-gray-300">
            Our tokenomics model ensures that resources are allocated to foster innovation, incentivize participation, and drive the growth of the ecosystem.
          </p>
        </div>
        <div className="card-purple-gradient card-purple-wrapper p-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">
            Empowering the Community
          </h3>
          <p className="text-gray-300">
            By dedicating 60% of tokens to community rewards and ecosystem development, we align the success of the protocol with the value delivered to our users.
          </p>
        </div>
        <div className="card-purple-gradient card-purple-wrapper p-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">
            Ensuring Long-Term Sustainability
          </h3>
          <p className="text-gray-300">
            A carefully designed token distribution model ensures the protocol remains sustainable, balancing rewards with ongoing development and operational needs.
          </p>
        </div>
        <div className="card-purple-gradient card-purple-wrapper p-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">
            Transparency and Trust
          </h3>
          <p className="text-gray-300">
            Our tokenomics strategy is built on transparency, providing clear insights into token allocation and usage to build trust with our community.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TokenomicsExplanation;
