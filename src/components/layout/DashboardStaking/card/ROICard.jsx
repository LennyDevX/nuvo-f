import React, { useMemo } from 'react';
import { FaChartLine } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { calculateROIProgress, calculateTimeBonus } from '../../../../utils/roiCalculations';

const ROICard = ({ depositAmount, totalWithdrawn, firstDepositTime }) => {
  const roiProgress = useMemo(() => {
    console.log('ROICard calculating progress:', { depositAmount, totalWithdrawn });
    return calculateROIProgress(depositAmount, totalWithdrawn);
  }, [depositAmount, totalWithdrawn]);

  const timeBonus = useMemo(() => calculateTimeBonus(firstDepositTime), [firstDepositTime]);
  const formattedWithdrawn = formatBalance(totalWithdrawn || '0');

  console.log('ROICard rendered with:', { roiProgress, formattedWithdrawn });

  return (
    <BaseCard title="APY Stats" icon={<FaChartLine />}>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">APY Progress:</span>
          <span className="text-purple-400">{roiProgress ? roiProgress.toFixed(2) : '0.00'}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Total Withdrawn:</span>
          <span className="text-white">{formattedWithdrawn} POL</span>
        </div>
        
        <div className="bg-black/20 p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Time Bonus:</span>
            <span className="text-green-400">+{timeBonus.bonus}%</span>
          </div>
          <div className="text-xs text-gray-500">
            {timeBonus.period}
          </div>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(roiProgress, 100)}%` }}
          />
        </div>
      </div>
    </BaseCard>
  );
};

export default ROICard;
