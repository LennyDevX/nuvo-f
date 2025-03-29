import React, { useEffect, useState } from 'react';
import { FaPiggyBank, FaInfoCircle, FaChartLine, FaHistory, FaLock, FaChevronDown, FaChevronUp, FaExchangeAlt, FaShieldAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../../../ui/Tooltip';
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
      <BaseCard title="Treasury" icon={<FaPiggyBank className="text-fuchsia-400" />}>
        <div className="flex flex-col h-full space-y-4">
          {/* Main Balance */}
          <div className="bg-gradient-to-br from-violet-900/30 to-fuchsia-900/20 p-4 rounded-xl border border-fuchsia-700/20 shadow-sm hover:shadow-md hover:shadow-fuchsia-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-medium">Total Balance</span>
              <Tooltip content="Total funds secured in treasury contract for protocol operations">
                <FaInfoCircle className="text-slate-400 hover:text-fuchsia-400" />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-2xl font-medium text-slate-100">
                {formatBalance(treasuryMetrics?.balance)}
              </div>
              <div className="text-sm text-slate-400">POL</div>
            </div>
          </div>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
              <div className="flex items-center gap-2">
                <FaChartLine className="w-4 h-4 text-violet-400" />
                <span className="text-slate-400 text-xs font-medium">24h Revenue</span>
              </div>
              <div className="text-lg font-medium text-slate-100 mt-1">
                {formatBalance(treasuryMetrics?.dailyCommissions)}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
              <div className="flex items-center gap-2">
                <FaExchangeAlt className="w-4 h-4 text-violet-400" />
                <span className="text-slate-400 text-xs font-medium">24h Growth</span>
              </div>
              <div className={`text-lg font-medium mt-1 ${treasuryMetrics?.dailyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {treasuryMetrics?.dailyGrowth > 0 ? '+' : ''}{treasuryMetrics?.dailyGrowth?.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Treasury Health */}
          <div className="bg-gradient-to-br from-indigo-900/25 to-violet-900/15 p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaShieldAlt className={`w-4 h-4 text-purple-400 ${treasuryMetrics?.healthScore >= 80 ? 'animate-pulse' : ''}`} />
                <span className="text-slate-300 text-sm font-medium">Treasury Health</span>
              </div>
              <span className="text-xs px-2 py-0.5 bg-purple-900/40 text-purple-400 font-medium rounded-full">
                {getTreasuryStatus(treasuryMetrics?.healthScore)}
              </span>
            </div>
            
            <div className="mb-3">
              <div className="w-full bg-slate-800/60 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getHealthColor(treasuryMetrics?.healthScore)}`}
                  style={{ width: `${Number(treasuryMetrics?.healthScore).toFixed(2)}%` }}
                />
              </div>
            </div>
            
            <p className="text-xs text-slate-400 italic">
              {treasuryMetrics?.healthScore >= 80 ? 'Treasury is in excellent condition with strong growth indicators' :
              treasuryMetrics?.healthScore >= 50 ? 'Treasury is stable but monitoring is recommended' :
              'Treasury requires attention - funds are below optimal levels'}
            </p>
          </div>

          {/* Treasury Allocation Grid */}
          
          
          {/* Treasury Transactions - Button */}
          <div className="mt-auto">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-violet-900/30 to-fuchsia-900/20 border border-violet-700/20 hover:border-fuchsia-600/30 transition-all duration-300 text-slate-300 text-sm hover:shadow-md hover:shadow-fuchsia-900/5"
            >
              <FaFileInvoiceDollar className="text-fuchsia-400 text-sm" />
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
