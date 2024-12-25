import React, { useEffect } from 'react';
import { FaPiggyBank, FaInfoCircle, FaChartLine, FaHistory, FaLock } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../../StakingDashboard/Tooltip';

const TreasuryCard = () => {
  const { state, getTreasuryMetrics } = useStaking();
  const { treasuryMetrics } = state;

  // Estilo para los números
  const numberContainerStyle = "text-amber-100 font-medium text-base mt-1 text-center";

  useEffect(() => {
    getTreasuryMetrics();
  }, []);

  // Función para determinar el color del indicador de salud
  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-green-400';
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  // Función para determinar el estado del treasury
  const getTreasuryStatus = (score) => {
    if (score >= 80) return 'Profits';
    if (score >= 50) return 'Estable';
    return 'Low Funds';
  };

  return (
    <BaseCard title="Treasury" icon={<FaPiggyBank className="text-amber-300" />}>
      <div className="space-y-4">
        {/* Main Balance */}
        <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-amber-100/70">Total Balance</span>
            <Tooltip content="Total funds secured in treasury contract">
              <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-4 h-4" />
            </Tooltip>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <div className="text-3xl font-bold text-amber-50">
              {formatBalance(treasuryMetrics?.balance)}
            </div>
            <div className="text-lg text-amber-300">POL</div>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-amber-100/70">24h Revenue</span>
              <Tooltip content="Total commissions collected in the last 24 hours">
                <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5" />
              </Tooltip>
            </div>
            <div className="text-xl font-bold text-amber-50 mt-1">
              {formatBalance(treasuryMetrics?.dailyCommissions)}
            </div>
          </div>
          
          <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-amber-100/70">24h Growth</span>
              <Tooltip content="Percentage change in treasury balance over last 24h">
                <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5" />
              </Tooltip>
            </div>
            <div className={`text-xl font-bold mt-1 ${treasuryMetrics?.dailyGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {treasuryMetrics?.dailyGrowth > 0 ? '+' : ''}{treasuryMetrics?.dailyGrowth.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Treasury Health */}
        <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${getHealthColor(treasuryMetrics?.healthScore)} animate-pulse`}></div>
              <span className="text-amber-100/90 font-medium">{getTreasuryStatus(treasuryMetrics?.healthScore)}</span>
              <Tooltip content="Overall treasury health based on multiple metrics">
                <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5" />
              </Tooltip>
            </div>
            <a 
              href={`https://polygonscan.com/address/${treasuryMetrics?.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 text-sm rounded-lg transition-all duration-300"
            >
              View Contract →
            </a>
          </div>
        </div>

        {/* Treasury Allocation */}
        <div className="grid grid-cols-3 gap-3">
          {['Locked', 'Funds', 'Airdrop'].map((label, index) => (
            <div 
              key={index} 
              className="bg-amber-900/20 backdrop-blur-sm p-2.5 rounded-xl border border-amber-600/20 shadow-lg"
            >
              <div className="flex flex-col items-center">
                {index === 0 && <FaLock className="w-4 h-4 mt-2 text-amber-300" />}
                {index === 1 && <FaChartLine className="w-4 h-4 mt-2 text-amber-300" />}
                {index === 2 && <FaHistory className="w-4 h-4 mt-2 text-amber-300" />}
                <span className="text-amber-100/70 text-xs mt-1">{label}</span>
                <div className="text-amber-50 font-medium text-base mt-1 text-center">
                  {index === 0 ? '30%' : index === 1 ? '50%' : '20%'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(TreasuryCard);
