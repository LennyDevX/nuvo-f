import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StakingCalculator = ({ mobileOptimized = false }) => {
  const [stakingAmount, setStakingAmount] = useState('5');

  const calculateReturns = (amount) => {
    const daily = (amount * 0.24) / 100;
    const monthly = daily * 30;
    const yearly = monthly * 12;
    return { daily, monthly, yearly };
  };

  const { daily, monthly, yearly } = calculateReturns(parseFloat(stakingAmount) || 0);

  const formatCurrency = (value) => value.toFixed(2);

  if (mobileOptimized) {
    return (
      <div className="bg-black/30 border border-purple-500/30 rounded-xl p-4 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-3">Staking Calculator</h2>
        
        <div className="mb-4">
          <label className="block text-gray-300 text-sm mb-1">
            Stake Amount (POL)
          </label>
          <input
            type="number"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(e.target.value)}
            className="w-full bg-black/40 border border-purple-500/30 rounded p-2 text-white"
          />
        </div>
        
        <div className="p-3 bg-purple-900/20 rounded-lg">
          <h3 className="text-lg font-medium text-white">Estimated Rewards</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <div className="text-xs text-gray-400">Monthly</div>
              <div className="text-sm text-white">{formatCurrency(monthly)} POL</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Yearly</div>
              <div className="text-sm text-white">{formatCurrency(yearly)} POL</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-black/40 rounded-2xl p-4 xs:p-5 sm:p-6 border border-purple-500/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl xs:text-2xl font-bold text-white mb-4 sm:mb-6">Calculate Returns</h3>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-gray-300 mb-2">
            Staking Amount (POL)
          </label>
          <input
            type="number"
            min="5"
            max="10000"
            value={stakingAmount}
            onChange={(e) => setStakingAmount(e.target.value)}
            className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:border-purple-500 focus:outline-none"
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Daily', value: daily },
            { label: 'Monthly', value: monthly },
            { label: 'Yearly', value: yearly }
          ].map((item, index) => (
            <div key={index} className="bg-purple-900/20 rounded-lg p-3">
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className="text-xl font-bold text-purple-400">
                {item.value.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        
        <p className="text-gray-400 text-sm text-center">
          *Based on 0.24% daily ROI
        </p>
      </div>
    </motion.div>
  );
};

export default StakingCalculator;