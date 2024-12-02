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
              <span className="text-sm text-gray-400 ml-2">of 130% Max ROI</span>
            </div>
          </div>

          <div>
            <strong className="text-purple-400 text-xl font-medium">Base APR</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">30%</span>
              <span className="text-sm text-gray-400 ml-2">yearly</span>
            </div>
          </div>

          <div>
            <strong className="text-purple-400 text-xl font-medium">Daily Returns</strong>
            <div className="flex items-center mt-2">
              <span className="text-3xl text-white font-bold">
                {((30 / 365) * parseFloat(depositAmount)).toFixed(6)}
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

      {/* Bonus Opportunities Card */}
      <motion.div
        className="rounded-2xl p-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
      >
        <strong className="text-purple-400 text-xl font-medium">Extra Bonus Opportunities</strong>
        <ul className="space-y-4 mt-6">
          {[
            { text: "Hold 1000+ tokens: +2% APR bonus", delay: 0.5 },
            { text: "Refer friends: +1% per referral (max 5%)", delay: 0.6 },
            { text: "Community participation: +3% monthly bonus", delay: 0.7 },
            { text: "Long-term staking: +1% every 90 days", delay: 0.8 }
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
      </motion.div>
    </div>
  );
};

export default DashboardCards;