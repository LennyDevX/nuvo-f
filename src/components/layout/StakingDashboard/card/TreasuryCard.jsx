import React, { useEffect } from 'react';
import { FaPiggyBank } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../context/StakingContext';

const TreasuryCard = () => {
  const { state, getTreasuryMetrics } = useStaking();
  const { treasuryMetrics } = state;

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
    if (score >= 80) return 'Excelente';
    if (score >= 50) return 'Estable';
    return 'Bajo';
  };

  return (
    <BaseCard title="Treasury" icon={<FaPiggyBank />}>
      <div className="space-y-4">
        <div className="text-2xl font-bold text-purple-400">
          {formatBalance(treasuryMetrics?.balance)} POL
        </div>
        
        <div className="space-y-2 bg-black/20 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">24h Comisiones:</span>
            <span className="text-green-400">
              {formatBalance(treasuryMetrics?.dailyCommissions)} POL
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Crecimiento 24h:</span>
            <span className={treasuryMetrics?.dailyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}>
              {treasuryMetrics?.dailyGrowth > 0 ? '+' : ''}{treasuryMetrics?.dailyGrowth.toFixed(2)}%
            </span>
          </div>
          
          {/* Estado del Treasury */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Estado:</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getHealthColor(treasuryMetrics?.healthScore)}`} />
                <span className="text-gray-300">
                  {getTreasuryStatus(treasuryMetrics?.healthScore)}
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                style={{ width: `${treasuryMetrics?.healthScore || 0}%` }}
              />
            </div>
          </div>

          {/* Dirección del Treasury */}
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Dirección:</span>
              <a 
                href={`https://polygonscan.com/address/${treasuryMetrics?.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 truncate"
              >
                {treasuryMetrics?.address}
              </a>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(TreasuryCard);
