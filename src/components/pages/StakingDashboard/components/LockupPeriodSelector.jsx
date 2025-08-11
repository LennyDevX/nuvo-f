import React, { useState } from 'react';
import { FaClock, FaLock, FaChartLine, FaGift } from 'react-icons/fa';
import { STAKING_CONSTANTS } from '../../../../utils/staking/constants';

const LockupPeriodSelector = ({ selectedPeriod, onPeriodChange, stakingAmount }) => {
  const [hoveredPeriod, setHoveredPeriod] = useState(null);

  const calculateProjectedRewards = (period, amount) => {
    if (!amount || amount <= 0) return 0;
    const hourlyRate = period.roiPercentage / 100;
    const totalHours = period.days * 24;
    const baseRewards = amount * hourlyRate * totalHours;
    const bonusRewards = baseRewards * (period.bonus / 100);
    return baseRewards + bonusRewards;
  };

  const calculateAPY = (period) => {
    const hourlyRate = period.roiPercentage / 100;
    const dailyRate = hourlyRate * 24;
    const annualRate = dailyRate * 365;
    const bonusRate = annualRate * (period.bonus / 100);
    return ((annualRate + bonusRate) * 100).toFixed(2);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/30 p-4">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <FaClock className="text-indigo-400 mr-2" />
        Select Lockup Period
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {Object.entries(STAKING_CONSTANTS.LOCKUP_PERIODS).map(([key, period]) => {
          const isSelected = selectedPeriod?.days === period.days;
          const isHovered = hoveredPeriod === key;
          const projectedRewards = calculateProjectedRewards(period, parseFloat(stakingAmount || 0));
          const apy = calculateAPY(period);

          return (
            <div
              key={key}
              className={`
                relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                ${isSelected 
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/20' 
                  : 'border-slate-600/50 bg-slate-800/30 hover:border-indigo-400/50 hover:bg-slate-700/40'
                }
                ${isHovered ? 'transform scale-[1.02]' : ''}
              `}
              onClick={() => onPeriodChange(period)}
              onMouseEnter={() => setHoveredPeriod(key)}
              onMouseLeave={() => setHoveredPeriod(null)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                </div>
              )}

              {/* Period header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FaLock className={`mr-2 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="font-semibold text-white">{period.label}</span>
                </div>
                <div className="flex items-center text-xs text-slate-400">
                  <FaGift className="mr-1" />
                  +{period.bonus}%
                </div>
              </div>

              {/* ROI and APY */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center">
                  <div className="text-xs text-slate-400">Hourly ROI</div>
                  <div className="text-sm font-medium text-white">{period.roiPercentage}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400">Total APY</div>
                  <div className="text-sm font-medium text-green-400">{apy}%</div>
                </div>
              </div>

              {/* Projected rewards */}
              {stakingAmount && parseFloat(stakingAmount) > 0 && (
                <div className="border-t border-slate-600/30 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Projected Rewards:</span>
                    <div className="flex items-center">
                      <FaChartLine className="text-green-400 mr-1 text-xs" />
                      <span className="text-sm font-medium text-green-400">
                        {projectedRewards.toFixed(4)} POL
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="text-xs text-slate-500 mt-2">
                {period.description}
              </div>
            </div>
          );
        })}
      </div>

      {/* Compounding notice */}
      

      {/* Selected period summary */}
      {selectedPeriod && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
          <div className="text-sm font-medium text-white mb-2">Selected: {selectedPeriod.label}</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Base ROI: </span>
              <span className="text-white">{selectedPeriod.roiPercentage}% per hour</span>
            </div>
            <div>
              <span className="text-slate-400">Time Bonus: </span>
              <span className="text-green-400">+{selectedPeriod.bonus}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LockupPeriodSelector;