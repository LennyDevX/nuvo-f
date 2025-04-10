import React, { useMemo, useState, useCallback } from 'react';
import { FaInfoCircle, FaStar, FaCalendarAlt } from 'react-icons/fa';
import BaseCard from './BaseCard';
import Tooltip from '../../../ui/Tooltip';

function ROICard({ firstDepositTime }) {
  const [showDetails, setShowDetails] = useState(false);

  // Optimized toggle function
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  // Memoized progress calculation
  const calculateProgress = useMemo(() => {
    if (!firstDepositTime) return 0;
    
    const now = new Date();
    const deposit = new Date(firstDepositTime * 1000);
    const daysStaked = Math.floor((now - deposit) / (1000 * 60 * 60 * 24));
    const dailyROI = 0.24; // 0.24% daily
    const progress = Math.min(daysStaked * dailyROI, 125); // Max 125%
    
    return progress;
  }, [firstDepositTime]);

  // Memoized staking info calculation
  const stakingInfo = useMemo(() => {
    if (!firstDepositTime) return {
      days: 0,
      bonus: 0,
      nextMilestone: 90,
      daysLeft: 90,
      nextBonus: 1,
      baseROI: 0.01,
      totalROI: 0.01
    };
    
    const now = new Date();
    const deposit = new Date(firstDepositTime * 1000);
    const days = Math.floor((now - deposit) / (1000 * 60 * 60 * 24));
    
    let bonus = 0;
    let nextMilestone = 90;
    let daysLeft = 90 - days;
    let nextBonus = 1;
    const baseROI = 0.01;

    if (days >= 365) {
      bonus = 5;
      nextMilestone = 365;
      daysLeft = 0;
      nextBonus = 5;
    } else if (days >= 180) {
      bonus = 3;
      nextMilestone = 365;
      daysLeft = 365 - days;
      nextBonus = 5;
    } else if (days >= 90) {
      bonus = 1;
      nextMilestone = 180;
      daysLeft = 180 - days;
      nextBonus = 3;
    }

    const totalROI = baseROI + (baseROI * (bonus / 100));
    return { days, bonus, nextMilestone, daysLeft, nextBonus, baseROI, totalROI };
  }, [firstDepositTime]);

  // Memoized tier visualization components
  const tierCompletion = useMemo(() => {
    if (!stakingInfo.daysLeft || stakingInfo.daysLeft <= 0) return null;
    
    const progressPercentage = Math.floor((stakingInfo.days / stakingInfo.nextMilestone) * 100);
    
    return (
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-sm text-violet-100/70 font-medium px-3 py-1 bg-violet-900/30 rounded-full">
            {progressPercentage}% Complete
          </div>
          <div className="text-sm text-violet-100/70 font-medium">
            {stakingInfo.daysLeft} days remaining
          </div>
        </div>
        <div className="w-full bg-indigo-900/40 rounded-full h-3 p-0.5">
          <div
            className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-2 rounded-full transition-all duration-1000 shadow-inner shadow-fuchsia-500/50"
            style={{
              width: `${progressPercentage}%`
            }}
          />
        </div>
      </div>
    );
  }, [stakingInfo.days, stakingInfo.nextMilestone, stakingInfo.daysLeft]);

  return (
    <BaseCard title="Staking Benefits" icon={<FaStar className="text-purple-400" />}>
      <div className="space-y-5 h-full flex flex-col">
        {/* Current Staking Status */}
        <div className=" p-5 rounded-2xl border border-violet-600/20 shadow-lg backdrop-blur-md hover:shadow-violet-700/10 transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium tracking-wide">Time Staking</span>
            <div className="text-2xl font-bold transform hover:scale-105 transition-transform duration-300">
              {stakingInfo.days} days
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className=" flex items-center gap-2 text-sm font-medium tracking-wide">
              Daily Returns
              <Tooltip content={`Base ROI: 0.24% daily\nTime Bonus: +${stakingInfo.bonus}%\nTotal Daily ROI: ${(stakingInfo.totalROI * 24).toFixed(2)}%\nDays Staked: ${stakingInfo.days}`}>
                <FaInfoCircle className=" hover:text-fuchsia-300" />
              </Tooltip>
            </span>
            <div className="text-2xl font-bold transform hover:scale-105 transition-transform duration-300">
              +{(stakingInfo.totalROI * 24).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Progress to Next Tier - Conditionally rendered */}
        {stakingInfo.daysLeft > 0 && (
          <div className=" p-5 rounded-2xl border border-indigo-700/20 shadow-lg backdrop-blur-md hover:shadow-indigo-700/10 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className=" flex items-center gap-2 font-medium">
                <FaCalendarAlt className="text-purple-400/70" /> Next Milestone
              </span>
              <div className="text-right">
                <span className="text-lg font-bold">
                  +{stakingInfo.nextBonus}% Bonus
                </span>
                <div className="text-sm mt-1 font-medium">
                  {((stakingInfo.baseROI + (stakingInfo.baseROI * (stakingInfo.nextBonus / 100))) * 24).toFixed(4)}% ROI
                </div>
              </div>
            </div>
            
            {tierCompletion}
          </div>
        )}
      </div>
    </BaseCard>
  );
}

export default React.memo(ROICard);
