// src/components/layout/DashboardStaking/DashboardCards.jsx
import React from "react";
import { motion } from "framer-motion";
import PolygonLogo from "/PolygonLogo.png";

const DashboardCards = ({
  depositAmount,
  roiProgress,
  totalWithdrawn,
  availableRewards,
  totalPoolBalance,
  getStakingDuration,
}) => {
  
  // Add helper function for time bonuses
  const getTimeBonusText = (days, bonus) => {
    return `${days} days staking: +${bonus}% APR bonus`;
  };

  // Calculate daily returns based on HOURLY_ROI_PERCENTAGE
  const HOURLY_ROI_PERCENTAGE = 200; // 0.02% per hour
  const DAILY_ROI_PERCENTAGE = (HOURLY_ROI_PERCENTAGE / 1000000) * 24; // 0.48% per day
  const COMMISSION_PERCENTAGE = 6; // 6% commission

  // Calculate net daily returns after commission
  const grossDailyReturn = (DAILY_ROI_PERCENTAGE / 100) * parseFloat(depositAmount);
  const netDailyReturn = grossDailyReturn * (1 - COMMISSION_PERCENTAGE / 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Staking Stats Card */}
      <motion.div
        className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
      >
        <div className="space-y-6">
          <div>
            <strong className="text-purple-400 text-xl font-medium">ROI Progress</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">
                {roiProgress.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-400 ml-2">of 125% Max ROI</span>
            </div>
          </div>

          <div>
            <strong className="text-purple-400 text-xl font-medium">Base APR</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">25%</span>
              <span className="text-sm text-gray-400 ml-2"></span>
            </div>
          </div>

          <div>
            <strong className="text-purple-400 text-xl font-medium">Daily Returns</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">
                {netDailyReturn.toFixed(6)}
              </span>
              <img src={PolygonLogo} alt="Polygon" className="h-5 w-5 ml-2" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rewards Card */}
      <motion.div
        className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
      >
        <div className="space-y-6">
          <div>
            <strong className="text-purple-400 text-xl font-medium">Total Withdrawn</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">
                {parseFloat(totalWithdrawn).toFixed(6)}
              </span>
              <img src={PolygonLogo} alt="Polygon" className="h-5 w-5 ml-2" />
            </div>
          </div>

          <div>
            <strong className="text-purple-400 text-xl font-medium">Total Pool Balance</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">
                {parseFloat(totalPoolBalance).toFixed(6)}
              </span>
              <img src={PolygonLogo} alt="Polygon" className="h-5 w-5 ml-2" />
            </div>
          </div>

          <div>
            <strong className="text-purple-400 text-xl font-medium">Staking Duration</strong>
            <div className="mt-2">
              <span className="text-3xl text-white font-bold">{getStakingDuration()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Update Bonus Opportunities Card */}
      <motion.div
        className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
      >
        <strong className="text-purple-400 text-xl font-medium">Time Bonus Rewards</strong>
        <ul className="space-y-4 mt-6">
          {[
            { text: getTimeBonusText(365, 5), delay: 0.5 },
            { text: getTimeBonusText(180, 3), delay: 0.6 },
            { text: getTimeBonusText(90, 1), delay: 0.7 },
            { text: "Base APR: 25% yearly", delay: 0.8 },
            { text: "Max ROI: 125% of deposit", delay: 0.9 }
          ].map((bonus, index) => (
            <motion.li
              key={index}
              className="flex items-center text-white text-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: bonus.delay }}
            >
              <span className="text-green-400 mr-3 text-xl">•</span>
              {bonus.text}
            </motion.li>
          ))}
        </ul>
        <div className="mt-6 text-sm text-gray-400">
          Time bonuses are automatically added to your rewards based on how long you stake your tokens.
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCards;