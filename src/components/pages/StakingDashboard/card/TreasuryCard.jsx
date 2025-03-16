import React, { useEffect, useState } from 'react';
import { FaPiggyBank, FaInfoCircle, FaChartLine, FaHistory, FaLock, FaChevronDown, FaChevronUp, FaExchangeAlt, FaShieldAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/Formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../Tooltip';
// Corrigiendo la importación para asegurarnos que sea correctaal';
import TreasuryActivityModal from '../../../modals/TreasuryActivityModal';

const TreasuryCard = () => {
  const { state, getTreasuryMetrics } = useStaking();
  const { treasuryMetrics } = state;
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getTreasuryMetrics();
  }, []);

  // Función para determinar el color del indicador de salud
  const getHealthColor = (score) => {
    if (score >= 80) return 'from-teal-400 to-teal-300';
    if (score >= 50) return 'from-blue-400 to-teal-400';
    return 'from-red-400 to-red-300';
  };

  // Función para determinar el estado del treasury
  const getTreasuryStatus = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Stable';
    return 'Caution';
  };

  // Estos datos ya no son necesarios aquí porque se muestran en el modal
  // Se mantiene una versión simplificada para la vista previa en la tarjeta
  const recentTransactions = [
    { type: 'Revenue', amount: '45.32', date: '2d ago' },
    { type: 'Expense', amount: '18.75', date: '4d ago' },
  ];

  return (
    <>
      <BaseCard title="Treasury" icon={<FaPiggyBank className="text-teal-400" />}>
        <div className="flex flex-col h-full space-y-5">
          {/* Main Balance */}
          <div className="bg-gradient-to-br from-blue-900/40 to-teal-900/30 p-5 rounded-2xl border border-teal-600/20 shadow-lg backdrop-blur-md hover:shadow-teal-700/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-teal-100/70 text-sm font-medium tracking-wide">Total Balance</span>
              <Tooltip content="Total funds secured in treasury contract for protocol operations">
                <FaInfoCircle className="text-teal-400/80 hover:text-teal-300" />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2 transform hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-teal-300 mt-1">
                {formatBalance(treasuryMetrics?.balance)}
              </div>
              <div className="text-sm text-teal-300/70">POL</div>
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-900/30 to-teal-900/20 p-5 rounded-2xl border border-blue-500/20 shadow-lg backdrop-blur-md hover:shadow-blue-700/10 transition-all duration-300">
              <div className="flex items-center gap-2">
                <FaChartLine className="w-4 h-4 text-teal-400" />
                <span className="text-teal-100/70 text-sm font-medium tracking-wide">24h Revenue</span>
              </div>
              <div className="text-lg font-bold text-teal-300 mt-1">
                {formatBalance(treasuryMetrics?.dailyCommissions)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-teal-900/30 to-blue-900/20 p-5 rounded-2xl border border-teal-500/20 shadow-lg backdrop-blur-md hover:shadow-teal-700/10 transition-all duration-300">
              <div className="flex items-center gap-2">
                <FaExchangeAlt className="w-4 h-4 text-teal-400" />
                <span className="text-teal-100/70 text-sm font-medium tracking-wide">24h Growth</span>
              </div>
              <div className={`text-lg font-bold mt-1 ${treasuryMetrics?.dailyGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {treasuryMetrics?.dailyGrowth > 0 ? '+' : ''}{treasuryMetrics?.dailyGrowth?.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Treasury Health */}
          <div className="bg-gradient-to-br from-blue-900/30 to-teal-900/20 p-5 rounded-2xl border border-blue-600/20 shadow-lg backdrop-blur-md hover:shadow-blue-700/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className={`w-4 h-4 text-teal-400 ${treasuryMetrics?.healthScore >= 80 ? 'animate-pulse' : ''}`} />
                <span className="text-teal-100/80 text-sm font-medium">Treasury Health</span>
              </div>
              <span className="text-sm px-3 py-1 bg-teal-900/40 text-teal-300 font-medium rounded-full">
                {getTreasuryStatus(treasuryMetrics?.healthScore)}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="w-full bg-blue-900/40 rounded-full h-3 p-0.5">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getHealthColor(treasuryMetrics?.healthScore)} shadow-inner shadow-teal-500/30`}
                  style={{ width: `${Number(treasuryMetrics?.healthScore).toFixed(2)}%` }}
                />
              </div>
            </div>
            
            <p className="text-xs text-teal-100/70 italic">
              {treasuryMetrics?.healthScore >= 80 ? 'Treasury is in excellent condition with strong growth indicators' :
              treasuryMetrics?.healthScore >= 50 ? 'Treasury is stable but monitoring is recommended' :
              'Treasury requires attention - funds are below optimal levels'}
            </p>
          </div>

          {/* Treasury Allocation - Grid de 3 columnas más moderna */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Locked', icon: <FaLock />, value: '30%', tooltip: 'Funds locked for long-term stability' },
              { label: 'Operational', icon: <FaChartLine />, value: '50%', tooltip: 'Funds for day-to-day operations' },
              { label: 'Rewards', icon: <FaHistory />, value: '20%', tooltip: 'Funds reserved for airdrops and rewards' }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-gradient-to-br from-blue-900/20 to-teal-900/20 p-4 rounded-2xl border border-teal-600/20 
                   hover:border-teal-500/40 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md"
              >
                <div className="flex flex-col items-center">
                  <div className="text-teal-400 mb-1">
                    {item.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-teal-100/70 text-xs">{item.label}</span>
                    <Tooltip content={item.tooltip}>
                      <FaInfoCircle className="text-teal-400/60 hover:text-teal-300 w-3 h-3" />
                    </Tooltip>
                  </div>
                  <div className="text-teal-300 font-bold text-lg mt-1">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Recent Transactions Preview */}
          
          
          {/* Treasury Transactions - Botón para abrir modal */}
          <div className="mt-auto">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-blue-900/40 to-teal-900/30 border border-blue-500/30 hover:border-teal-500/50 transition-all duration-300 text-teal-100 text-sm"
            >
              <FaFileInvoiceDollar className="text-teal-400 text-sm" />
              Show Treasury Activity
            </button>
          </div>
        </div>
      </BaseCard>

      {/* Modal de actividad del tesoro */}
      <TreasuryActivityModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
};

export default React.memo(TreasuryCard);
