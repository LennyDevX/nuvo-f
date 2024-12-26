import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StakingCalculator = () => {
  const [stakingAmount, setStakingAmount] = useState('5');

  const calculateReturns = (amount) => {
    const daily = (amount * 0.24) / 100;
    const monthly = daily * 30;
    const sixMonths = daily * 180;
    const yearly = monthly * 12;
    return { daily, monthly, sixMonths, yearly };
  };

  const { daily, monthly, sixMonths } = calculateReturns(parseFloat(stakingAmount) || 0);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <motion.div
        className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-6 sm:p-8 border border-purple-500/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-bold text-white mb-12 text-center">
          Calculate Your Potential Returns
        </h2>
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <label className="block text-gray-200 mb-4 text-xl font-medium">
              Staking Amount (POL)
            </label>
            <input
              type="number"
              min="5"
              max="10000"
              value={stakingAmount}
              onChange={(e) => setStakingAmount(e.target.value)}
              className="w-full bg-black/30 border-2 border-purple-500/30 rounded-xl px-6 py-4 text-white text-2xl mb-8 focus:border-purple-500 focus:outline-none transition-colors"
              placeholder="Enter amount..."
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-black/40 rounded-xl p-6 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-gray-300 text-lg mb-2">Daily Returns</p>
                <p className="text-3xl font-bold text-purple-400">
                  {daily.toFixed(2)} POL
                </p>
              </motion.div>
              <motion.div 
                className="bg-black/40 rounded-xl p-6 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-gray-300 text-lg mb-2">Monthly Returns</p>
                <p className="text-3xl font-bold text-purple-400">
                  {monthly.toFixed(2)} POL
                </p>
              </motion.div>
              <motion.div 
                className="bg-black/40 rounded-xl p-6 backdrop-blur-sm hover:bg-purple-900/40 transition-all duration-300 transform hover:-translate-y-1"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-gray-300 text-lg mb-2">6 Months Returns</p>
                <p className="text-3xl font-bold text-purple-400">
                  {sixMonths.toFixed(2)} POL
                </p>
              </motion.div>
            </div>
          </div>
          <p className="text-gray-300 text-base mt-6 text-center">
            *Calculations based on 0.24% daily ROI
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default StakingCalculator;