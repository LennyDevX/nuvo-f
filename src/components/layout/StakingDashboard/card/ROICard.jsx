import React, { useMemo } from 'react';
import { FaInfoCircle, FaStar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import Tooltip from '../Tooltip';

function ROICard({ firstDepositTime }) {
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

  return (
    <BaseCard title="Staking Benefits" icon={<FaStar className="text-emerald-300" />}>
      <div className="space-y-4">
        {/* Current Staking Status */}
        <div className="bg-emerald-900/20 backdrop-blur-sm p-4 rounded-xl border border-emerald-600/20 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-emerald-100/70">Time Staking</span>
            <div className="text-2xl font-bold text-emerald-50">
              {stakingInfo.days} days
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-emerald-100/70 flex items-center gap-2">
              Daily Returns
              <Tooltip content="Includes base ROI and time bonus">
                <FaInfoCircle className="text-emerald-400/60 hover:text-emerald-300" />
              </Tooltip>
            </span>
            <div className="text-2xl font-bold text-emerald-300">
              +{(stakingInfo.totalROI * 24).toFixed(4)}%
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {stakingInfo.daysLeft > 0 && (
          <div className="bg-emerald-900/20 backdrop-blur-sm p-4 rounded-xl border border-emerald-600/20 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-emerald-100/90 font-medium">Next Milestone</span>
              <div className="text-right">
                <span className="text-lg font-bold text-emerald-300">
                  +{stakingInfo.nextBonus}% Bonus
                </span>
                <div className="text-sm text-emerald-400/80 mt-1 font-medium">
                  {((stakingInfo.baseROI + (stakingInfo.baseROI * (stakingInfo.nextBonus / 100))) * 24).toFixed(4)}% ROI
                </div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-sm text-emerald-100/70 font-medium">
                  {Math.floor((stakingInfo.days / stakingInfo.nextMilestone) * 100)}% Complete
                </div>
                <div className="text-sm text-emerald-100/70 font-medium">
                  {stakingInfo.daysLeft} days remaining
                </div>
              </div>
              <div className="w-full bg-emerald-900/30 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-2.5 rounded-full transition-all duration-1000"
                  style={{
                    width: `${(stakingInfo.days / stakingInfo.nextMilestone) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Bonus Tiers Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { days: 90, bonus: 1, roi: (0.01 * (1 + 1/100)) * 24, gradientFrom: 'from-emerald-400', gradientTo: 'to-emerald-300' },
            { days: 180, bonus: 3, roi: (0.01 * (1 + 3/100)) * 24, gradientFrom: 'from-emerald-500', gradientTo: 'to-emerald-400' },
            { days: 365, bonus: 5, roi: (0.01 * (1 + 5/100)) * 24, gradientFrom: 'from-emerald-600', gradientTo: 'to-emerald-500' }
          ].map((level) => (
            <div
              key={level.days}
              className="group bg-emerald-900/20 backdrop-blur-sm p-4 rounded-xl border border-emerald-600/20 
                 hover:border-emerald-500/40 transition-all duration-300 cursor-pointer shadow-lg"
            >
              <div className="text-lg font-bold text-emerald-50 mb-1">{level.days}d</div>
              <div className={`text-xl font-bold text-emerald-300`}>
                +{level.bonus}%
              </div>
              <div className="text-sm text-emerald-400/80 mt-2 font-medium group-hover:text-emerald-300">
                {level.roi.toFixed(3)}% 
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  );
}

export default ROICard;
