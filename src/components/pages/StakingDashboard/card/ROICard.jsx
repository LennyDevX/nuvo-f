import React, { useMemo, useState } from 'react';
import { FaInfoCircle, FaStar, FaCalendarAlt, FaPercent, FaLightbulb, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import BaseCard from './BaseCard';
import Tooltip from '../Tooltip';

function ROICard({ firstDepositTime }) {
  const [showDetails, setShowDetails] = useState(false);

  // Calcular el progreso del ROI
  const calculateProgress = useMemo(() => {
    if (!firstDepositTime) return 0;
    
    const now = new Date();
    const deposit = new Date(firstDepositTime * 1000);
    const daysStaked = Math.floor((now - deposit) / (1000 * 60 * 60 * 24));
    const dailyROI = 0.24; // 0.24% daily
    const progress = Math.min(daysStaked * dailyROI, 125); // Max 125%
    
    return progress;
  }, [firstDepositTime]);

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
    <BaseCard title="Staking Benefits" icon={<FaStar className="text-purple-400" />}>
      <div className="space-y-5 h-full flex flex-col">
        {/* Current Staking Status */}
        <div className="bg-gradient-to-br from-violet-900/40 to-fuchsia-900/30 p-5 rounded-2xl border border-violet-600/20 shadow-lg backdrop-blur-md hover:shadow-violet-700/10 transition-all duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-violet-100/70 text-sm font-medium tracking-wide">Time Staking</span>
            <div className="text-2xl font-bold text-fuchsia-300 transform hover:scale-105 transition-transform duration-300">
              {stakingInfo.days} days
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-violet-100/70 flex items-center gap-2 text-sm font-medium tracking-wide">
              Daily Returns
              <Tooltip content={`Base ROI: 0.24% daily\nTime Bonus: +${stakingInfo.bonus}%\nTotal Daily ROI: ${(stakingInfo.totalROI * 24).toFixed(2)}%\nDays Staked: ${stakingInfo.days}`}>
                <FaInfoCircle className="text-fuchsia-400/80 hover:text-fuchsia-300" />
              </Tooltip>
            </span>
            <div className="text-2xl font-bold text-fuchsia-300 transform hover:scale-105 transition-transform duration-300">
              +{(stakingInfo.totalROI * 24).toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {stakingInfo.daysLeft > 0 && (
          <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/20 p-5 rounded-2xl border border-indigo-500/20 shadow-lg backdrop-blur-md hover:shadow-indigo-700/10 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-violet-100/80 flex items-center gap-2 font-medium">
                <FaCalendarAlt className="text-purple-400/70" /> Next Milestone
              </span>
              <div className="text-right">
                <span className="text-lg font-bold text-fuchsia-300">
                  +{stakingInfo.nextBonus}% Bonus
                </span>
                <div className="text-sm text-purple-400/80 mt-1 font-medium">
                  {((stakingInfo.baseROI + (stakingInfo.baseROI * (stakingInfo.nextBonus / 100))) * 24).toFixed(4)}% ROI
                </div>
              </div>
            </div>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-sm text-violet-100/70 font-medium px-3 py-1 bg-violet-900/30 rounded-full">
                  {Math.floor((stakingInfo.days / stakingInfo.nextMilestone) * 100)}% Complete
                </div>
                <div className="text-sm text-violet-100/70 font-medium">
                  {stakingInfo.daysLeft} days remaining
                </div>
              </div>
              <div className="w-full bg-indigo-900/40 rounded-full h-3 p-0.5">
                <div
                  className="bg-gradient-to-r from-violet-400 to-fuchsia-400 h-2 rounded-full transition-all duration-1000 shadow-inner shadow-fuchsia-500/50"
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
            { days: 90, bonus: 1, roi: (0.01 * (1 + 1/100)) * 24 },
            { days: 180, bonus: 3, roi: (0.01 * (1 + 3/100)) * 24 },
            { days: 365, bonus: 5, roi: (0.01 * (1 + 5/100)) * 24 }
          ].map((level, index) => (
            <div
              key={level.days}
              className={`group bg-gradient-to-br from-indigo-900/20 to-violet-900/20 p-4 rounded-2xl border border-violet-600/20 
                 hover:border-fuchsia-500/40 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md 
                 ${stakingInfo.days >= level.days ? 'ring-2 ring-fuchsia-500/30' : ''}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="text-lg font-bold text-violet-50 flex items-center gap-2">
                  {level.days}d
                  {stakingInfo.days >= level.days && (
                    <span className="bg-fuchsia-900/40 text-fuchsia-300 text-xs px-2 py-0.5 rounded-full">Active</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <FaPercent className="text-purple-400/70" />
                <div className="text-xl font-bold text-fuchsia-300">
                  +{level.bonus}%
                </div>
              </div>
              
              <div className="text-sm text-purple-400/80 mt-2 font-medium group-hover:text-fuchsia-300 transition-colors duration-300">
                {level.roi.toFixed(3)}% ROI 
              </div>
            </div>
          ))}
        </div>

        {/* Bonus Info Button - Reemplaza la sección informativa con un botón */}
        <div className="mt-auto">
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-900/40 to-fuchsia-900/30 border border-violet-500/30 hover:border-fuchsia-500/50 transition-all duration-300 text-violet-100 text-sm"
          >
            <FaLightbulb className="text-yellow-400 text-sm" />
            {showDetails ? "Hide Bonus Details" : "How Time Bonuses Work"}
            {showDetails ? <FaChevronUp className="text-fuchsia-300" /> : <FaChevronDown className="text-fuchsia-300" />}
          </button>
          
          {/* Información condensada que aparece solo cuando se expande */}
          {showDetails && (
            <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/20 p-3 rounded-xl border border-violet-500/30 shadow-lg backdrop-blur-md mt-2 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></div>
                  <span><b className="text-fuchsia-300">90d:</b> +1% (0.242%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></div>
                  <span><b className="text-fuchsia-300">180d:</b> +3% (0.247%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></div>
                  <span><b className="text-fuchsia-300">365d:</b> +5% (0.252%)</span>
                </div>
              </div>
              <div className="text-violet-100/70 text-xs mt-2 leading-tight border-l-2 border-fuchsia-400/30 pl-2">
                Bonuses apply automatically at each milestone. The longer you stake, the higher your returns!
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
}

export default ROICard;
