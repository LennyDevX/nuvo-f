import { motion } from 'framer-motion';
import PolygonLogo from '../../../../public/PolygonLogo.png';

const getTimeBonusText = (days, percentage) => {
  return `${percentage}% bonus for staking ${days}+ days`;
};

const DashboardCards = ({
  depositAmount,
  roiProgress,
  totalWithdrawn,
  totalPoolBalance,
  getStakingDuration,
}) => {
  // Constants from smart contract
  const HOURLY_ROI_PERCENTAGE = 200; // 0.02% per hour
  const COMMISSION_PERCENTAGE = 6; // 6% commission
  const DAILY_HOURS = 24;

  // Calculate time bonus based on staking duration
  const calculateTimeBonus = (stakingDays) => {
    if (stakingDays >= 365) return 5; // 5%
    if (stakingDays >= 180) return 3; // 3%
    if (stakingDays >= 90) return 1;  // 1%
    return 0;
  };

  // Calculate daily returns with time bonus
  const calculateDailyReturn = () => {
    // Base hourly ROI converted to daily
    const dailyRoiPercentage = (HOURLY_ROI_PERCENTAGE / 1000000) * DAILY_HOURS; 
    
    // Get staking duration in days
    const stakingDuration = parseInt(getStakingDuration());
    
    // Calculate time bonus percentage
    const timeBonus = calculateTimeBonus(stakingDuration);
    
    // Calculate gross daily return with time bonus
    const baseDaily = depositAmount * dailyRoiPercentage;
    const bonusDaily = baseDaily * (1 + timeBonus / 100);
    
    // Apply commission
    const netDailyReturn = bonusDaily * (1 - COMMISSION_PERCENTAGE / 100);
    
    return netDailyReturn;
  };

  const netDailyReturn = calculateDailyReturn();

  return (
    <div className="flex flex-wrap gap-8">
      {/* Staking Stats Card */}
      <motion.div
        className="flex-1 min-w-[280px] rounded-2xl p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(139, 92, 246, 0.1)" }}
      >
        <div className="space-y-4">
          {/* ROI Progress */}
          <div className="flex justify-between items-center">
            <span className="text-purple-400 text-lg">ROI Progress</span>
            <div className="flex items-center">
              <span className="text-2xl text-white font-bold">{roiProgress.toFixed(2)}%</span>
              <span className="text-sm text-gray-400 ml-2">max 125%</span>
            </div>
          </div>

          {/* Daily Returns */}
          <div className="flex justify-between items-center">
            <span className="text-purple-400 text-lg">Daily Returns</span>
            <div className="flex items-center">
              <span className="text-2xl text-white font-bold">{netDailyReturn.toFixed(6)}</span>
              <img src={PolygonLogo} alt="Polygon" className="h-5 w-5 ml-2" />
            </div>
          </div>

          {/* Base APR */}
          <div className="flex justify-between items-center">
            <span className="text-purple-400 text-lg">Base APR</span>
            <span className="text-2xl text-white font-bold">25%</span>
          </div>
        </div>
      </motion.div>

      {/* Time Bonus Card */}
      <motion.div
        className="flex-1 min-w-[280px] rounded-2xl p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h3 className="text-purple-400 text-lg mb-4">Time Bonuses</h3>
        <ul className="space-y-3">
          {[
            { text: getTimeBonusText(365, 5), delay: 0.5 },
            { text: getTimeBonusText(180, 3), delay: 0.6 },
            { text: getTimeBonusText(90, 1), delay: 0.7 },
          ].map((bonus, index) => (
            <motion.li
              key={index}
              className="flex items-center text-white"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: bonus.delay }}
            >
              <span className="text-green-400 mr-2">•</span>
              {bonus.text}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Pool Stats Card */}
      <motion.div
        className="flex-1 min-w-[280px] rounded-2xl p-6 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 backdrop-blur-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="space-y-4">
          {/* Total Withdrawn */}
          <div className="flex justify-between items-center">
            <span className="text-purple-400 text-lg">Total Withdrawn</span>
            <div className="flex items-center">
              <span className="text-2xl text-white font-bold">
                {parseFloat(totalWithdrawn).toFixed(6)}
              </span>
              <img src={PolygonLogo} alt="Polygon" className="h-5 w-5 ml-2" />
            </div>
          </div>

          {/* Total Pool Balance */}
          <div className="flex justify-between items-center">
            <span className="text-purple-400 text-lg">Pool Balance</span>
            <div className="flex items-center">
              <span className="text-2xl text-white font-bold">
                {parseFloat(totalPoolBalance).toFixed(6)}
              </span>
              <img src={PolygonLogo} alt="Polygon" className="h-5 w-5 ml-2" />
            </div>
          </div>

          {/* Staking Duration */}
          <div className="flex justify-between items-center">
            <span className="text-purple-400 text-lg">Staking Duration</span>
            <span className="text-2xl text-white font-bold">{getStakingDuration()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardCards;