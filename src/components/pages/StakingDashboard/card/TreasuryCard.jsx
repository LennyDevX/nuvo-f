import React, { useEffect } from 'react';
import { FaPiggyBank, FaInfoCircle, FaChartLine, FaHistory, FaLock } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../Tooltip';

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
          <div className="flex items-center">
            <span className="text-amber-100/70">Total Balance</span>
            <div className="ml-1.5 flex items-center">
              <Tooltip content="Total funds secured in\ntreasury contract for\nprotocol operations">
                <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5 cursor-help" />
              </Tooltip>
            </div>
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
          <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg relative">
            <div className="flex items-center">
              <span className="text-amber-100/70">24h Revenue</span>
              <div className="ml-1.5 flex items-center">
                <Tooltip content={`Revenue collected in the last 24h`}>
                  <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <div className="text-xl font-bold text-amber-50 mt-1">
              {formatBalance(treasuryMetrics?.dailyCommissions)}
            </div>
          </div>
          
          <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg relative">
            <div className="flex items-center">
              <span className="text-amber-100/70">24h Growth</span>
              <div className="ml-1.5 flex items-center">
                <Tooltip content={`Net treasury balance change \nin the last 24 hours\n${treasuryMetrics?.dailyGrowth >= 0 ? 'Positive growth 📈' : 'Negative growth 📉'}`}>
                  <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <div className={`text-xl font-bold mt-1 ${treasuryMetrics?.dailyGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {treasuryMetrics?.dailyGrowth > 0 ? '+' : ''}{treasuryMetrics?.dailyGrowth.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Treasury Health */}
        <div className="bg-amber-900/20 backdrop-blur-sm p-4 rounded-xl border border-amber-600/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className={`w-2.5 h-2.5 rounded-full ${getHealthColor(treasuryMetrics?.healthScore)} animate-pulse`}></div>
              <span className="text-amber-100/90 font-medium ml-2">{getTreasuryStatus(treasuryMetrics?.healthScore)}</span>
              <div className="ml-1.5">
                <Tooltip content="Treasury health indicates the overall stability and sustainability of the protocol's reserves">
                  <FaInfoCircle className="text-amber-400/60 hover:text-amber-300 w-3.5 h-3.5 cursor-help" />
                </Tooltip>
              </div>
            </div>
            <span className="text-amber-50 font-bold">
              {Number(treasuryMetrics?.healthScore).toFixed(2)}%
            </span>
          </div>
          
          {/* Health Progress Bar */}
          <div className="w-full h-2 bg-amber-900/40 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getHealthColor(treasuryMetrics?.healthScore)} transition-all duration-500`}
              style={{ width: `${Number(treasuryMetrics?.healthScore).toFixed(2)}%` }}
            />
          </div>
          
          {/* Status Description */}
          <p className="text-xs text-amber-100/70 mt-2">
            {treasuryMetrics?.healthScore >= 80 ? 'Treasury is in excellent condition with strong growth indicators' :
             treasuryMetrics?.healthScore >= 50 ? 'Treasury is stable but monitoring is recommended' :
             'Treasury requires attention - funds are below optimal levels'}
          </p>
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
