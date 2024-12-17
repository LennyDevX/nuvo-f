import React from 'react';
import { FaPiggyBank } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';

const TreasuryCard = ({ treasuryBalance }) => {
  return (
    <BaseCard title="Treasury Balance" icon={<FaPiggyBank />}>
      <div className="space-y-3">
        <div className="text-2xl font-bold text-purple-400">
          {formatBalance(treasuryBalance)} POL
        </div>
        <div className="text-xs text-gray-400">
          Total value locked in treasury
        </div>
      </div>
    </BaseCard>
  );
};

export default TreasuryCard;
