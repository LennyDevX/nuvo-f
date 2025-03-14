import React, { useMemo, useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaCoins, FaInfoCircle, FaGift, FaTrophy, FaArrowUp, FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { ethers } from 'ethers';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../Tooltip';

const PoolMetricsCard = () => {
  const { state, stakingContract } = useStaking();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topStakers, setTopStakers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const metrics = useMemo(() => ({
    totalStaked: state?.totalPoolBalance || '0',
    totalUsers: state?.uniqueUsersCount || 0,
    rewardsDistributed: state?.poolMetrics?.rewardsDistributed || '0',
    totalWithdrawn: state?.poolMetrics?.totalWithdrawn || '0',
  }), [state.totalPoolBalance, state.uniqueUsersCount, state.poolMetrics]);

  const goalMetrics = useMemo(() => {
    const goalAmount = '2000'; // 2000 POL tokens goal
    // Convert balance from wei to POL tokens (18 decimals)
    const currentAmount = state?.totalPoolBalance 
      ? Number(ethers.formatEther(state.totalPoolBalance))
      : 0;
    
    // Calculate percentage with proper decimal handling
    const progressPercentage = currentAmount > 0 
      ? Math.min((currentAmount / Number(goalAmount)) * 100, 100)
      : 0;

    const remainingAmount = Math.max(Number(goalAmount) - currentAmount, 0);
    const airdropReward = Number(goalAmount) * 0.30; // 30% of goal amount

    return {
      goalAmount,
      progressPercentage,
      currentAmount: currentAmount.toString(),
      remainingAmount: remainingAmount.toString(),
      isCompleted: currentAmount >= Number(goalAmount),
      airdropReward: airdropReward.toFixed(2)
    };
  }, [state.totalPoolBalance]);

  // Función para obtener actividad reciente del contrato
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!stakingContract || !state.provider) return;
      
      try {
        setLoading(true);
        
        // Obtener eventos recientes (últimos 10)
        const depositFilter = stakingContract.filters.DepositMade();
        const withdrawFilter = stakingContract.filters.WithdrawalMade();
        const rewardFilter = stakingContract.filters.RewardPaid();
        
        // Obtener el bloque actual
        const currentBlock = await state.provider.getBlockNumber();
        const blockRange = 10000; // Buscar en los últimos 10000 bloques
        
        // Consultar eventos
        const [depositEvents, withdrawEvents, rewardEvents] = await Promise.all([
          stakingContract.queryFilter(depositFilter, currentBlock - blockRange, currentBlock),
          stakingContract.queryFilter(withdrawFilter, currentBlock - blockRange, currentBlock),
          stakingContract.queryFilter(rewardFilter, currentBlock - blockRange, currentBlock)
        ]);
        
        // Procesar y combinar eventos
        let allEvents = [];
        
        // Procesar depósitos
        for (const event of depositEvents) {
          const block = await state.provider.getBlock(event.blockNumber);
          allEvents.push({
            type: 'deposit',
            amount: ethers.formatEther(event.args?.amount || 0).substring(0, 6),
            address: event.args?.user?.substring(0, 6) + '...' + event.args?.user?.substring(38),
            time: new Date(block.timestamp * 1000),
            timestamp: block.timestamp
          });
        }
        
        // Procesar retiros
        for (const event of withdrawEvents) {
          const block = await state.provider.getBlock(event.blockNumber);
          allEvents.push({
            type: 'withdraw',
            amount: ethers.formatEther(event.args?.amount || 0).substring(0, 6),
            address: event.args?.user?.substring(0, 6) + '...' + event.args?.user?.substring(38),
            time: new Date(block.timestamp * 1000),
            timestamp: block.timestamp
          });
        }
        
        // Procesar recompensas
        for (const event of rewardEvents) {
          const block = await state.provider.getBlock(event.blockNumber);
          allEvents.push({
            type: 'rewards',
            amount: ethers.formatEther(event.args?.reward || 0).substring(0, 6),
            address: event.args?.user?.substring(0, 6) + '...' + event.args?.user?.substring(38),
            time: new Date(block.timestamp * 1000),
            timestamp: block.timestamp
          });
        }
        
        // Ordenar por timestamp (más reciente primero)
        allEvents.sort((a, b) => b.timestamp - a.timestamp);
        
        // Tomar los 5 eventos más recientes
        const recentEvents = allEvents.slice(0, 5);
        
        // Formatear las horas para mostrar hace cuánto tiempo ocurrió
        const formatTime = (timestamp) => {
          const now = Math.floor(Date.now() / 1000);
          const diff = now - timestamp;
          
          if (diff < 60) return `${diff}s ago`;
          if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
          if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
          return `${Math.floor(diff / 86400)}d ago`;
        };
        
        // Actualizar formato de tiempo
        const formattedEvents = recentEvents.map(event => ({
          ...event,
          timeAgo: formatTime(event.timestamp)
        }));
        
        setRecentActivity(formattedEvents);
        
        // También podemos intentar obtener los top stakers
        // Esta lógica dependerá de cómo el contrato almacena esta información
        if (state.userDeposits && state.userDeposits.length > 0) {
          // Agrupar por dirección y sumar montos
          const userTotals = {};
          state.userDeposits.forEach(deposit => {
            const addr = deposit.user;
            if (!userTotals[addr]) {
              userTotals[addr] = 0;
            }
            userTotals[addr] += parseFloat(ethers.formatEther(deposit.amount));
          });
          
          // Convertir a array y ordenar
          const sortedUsers = Object.entries(userTotals)
            .map(([address, amount]) => ({ 
              address: address.substring(0, 6) + '...' + address.substring(38),
              amount: amount.toFixed(2)
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((user, index) => ({
              ...user,
              rank: index + 1
            }));
          
          setTopStakers(sortedUsers);
        }
        
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (showLeaderboard) {
      fetchRecentActivity();
    }
  }, [showLeaderboard, stakingContract, state.provider, state.userDeposits]);

  return (
    <BaseCard title="Pool Statistics" icon={<FaChartBar className="text-amber-400" />}>
      <div className="flex flex-col h-full space-y-5">
        {/* TVL and Users Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* TVL - 2/3 width */}
          <div className="col-span-2 bg-gradient-to-br from-amber-900/40 to-yellow-900/30 p-5 rounded-2xl border border-amber-600/20 shadow-lg backdrop-blur-md hover:shadow-amber-700/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-amber-100/70 text-sm font-medium tracking-wide">Total Value Locked</span>
              <Tooltip content="Total amount of POL tokens\ncurrently staked in the\nstaking pool">
                <FaInfoCircle className="text-amber-400/80 hover:text-amber-300" />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2 transform hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-amber-300 mt-1">
                {Number(formatBalance(metrics.totalStaked)).toFixed(4)}
              </div>
              <div className="text-sm text-amber-300/70">POL</div>
            </div>
          </div>

          {/* Users - 1/3 width */}
          <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/30 p-5 rounded-2xl border border-yellow-600/20 shadow-lg backdrop-blur-md hover:shadow-yellow-700/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaUsers className="w-4 h-4 text-yellow-400" />
              <span className="text-amber-100/70 text-sm font-medium tracking-wide">Users</span>
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1 transform hover:scale-105 transition-transform duration-300">
              {metrics.totalUsers}
            </div>
          </div>
        </div>

        {/* Rewards and Withdrawals Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 p-5 rounded-2xl border border-amber-600/20 shadow-lg backdrop-blur-md hover:shadow-amber-700/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaCoins className="w-4 h-4 text-yellow-400" />
              <span className="text-amber-100/70 text-sm font-medium tracking-wide">Rewards</span>
              <Tooltip content="Total rewards distributed\nto stakers since pool\ndeployment">
                <FaInfoCircle className="text-amber-400/80 hover:text-amber-300" />
              </Tooltip>
            </div>
            <div className="text-lg font-bold text-amber-300 mt-1">
              {formatBalance(metrics.rewardsDistributed)} POL
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 p-5 rounded-2xl border border-orange-600/20 shadow-lg backdrop-blur-md hover:shadow-orange-700/10 transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaHistory className="w-4 h-4 text-amber-400" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-amber-100/70 text-sm font-medium tracking-wide">Withdrawn</span>
            </div>
            <div className="text-lg font-bold text-amber-300 mt-1">
              {formatBalance(metrics.totalWithdrawn)} POL
            </div>
          </div>
        </div>

        {/* Community Goal Section */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 p-5 rounded-2xl border border-yellow-600/20 shadow-lg backdrop-blur-md hover:shadow-yellow-700/10 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaGift className={`w-4 h-4 text-yellow-400 ${goalMetrics.isCompleted ? 'animate-bounce' : ''}`} />
              <span className="text-amber-100/80 text-sm font-medium">Community Goal</span>
            </div>
            <span className="text-sm px-3 py-1 bg-amber-900/40 text-amber-300 font-medium rounded-full">
              {goalMetrics.progressPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="mb-3">
            <div className="w-full bg-amber-900/40 rounded-full h-3 p-0.5">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out
                  ${goalMetrics.isCompleted 
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse shadow-inner shadow-yellow-500/50' 
                    : 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-inner shadow-amber-500/30'}`}
                style={{ width: `${goalMetrics.progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-amber-100/70">Current: <b className="text-amber-300">{Number(goalMetrics.currentAmount).toFixed(2)} POL</b></span>
              <span className="text-xs text-amber-100/70">Goal: <b className="text-amber-300">{Number(goalMetrics.goalAmount).toFixed(2)} POL</b></span>
            </div>
            <div className="bg-amber-900/40 px-3 py-1 rounded-lg flex items-center gap-2">
              <span className="text-sm text-amber-100/80">Airdrop:</span>
              <span className="text-sm font-bold text-amber-300">
                {goalMetrics.airdropReward} POL
              </span>
            </div>
          </div>
        </div>

        {/* Nuevo elemento: Top Contributors y Recent Activity */}
        <div className="mt-auto">
          <button 
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-amber-900/40 to-yellow-900/30 border border-amber-500/30 hover:border-yellow-500/50 transition-all duration-300 text-amber-100 text-sm"
          >
            <FaTrophy className="text-yellow-400 text-sm" />
            {showLeaderboard ? "Hide Pool Insights" : "Show Pool Insights"}
            {showLeaderboard ? <FaChevronUp className="text-amber-300" /> : <FaChevronDown className="text-amber-300" />}
          </button>
          
          {showLeaderboard && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {/* Top Contributors */}
              <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 p-3 rounded-xl border border-amber-500/30 shadow-lg backdrop-blur-md">
                <h4 className="text-amber-200 font-medium text-xs mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <FaTrophy className="text-yellow-400 text-xs" /> Top Stakers
                </h4>
                <div className="space-y-1">
                  {loading && <div className="text-amber-100/60 text-xs text-center py-2">Loading...</div>}
                  
                  {!loading && topStakers.length === 0 && (
                    <div className="text-amber-100/60 text-xs text-center py-2">No data available</div>
                  )}
                  
                  {!loading && topStakers.map((user) => (
                    <div key={user.rank} className="flex justify-between items-center text-xs py-1 border-b border-amber-700/20 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center 
                          ${user.rank === 1 ? 'bg-yellow-500/80 text-yellow-900' : 
                            user.rank === 2 ? 'bg-amber-400/70 text-amber-900' : 'bg-orange-300/60 text-orange-900'} 
                          font-bold text-[10px]`}
                        >
                          {user.rank}
                        </span>
                        <span className="text-amber-100/80 font-medium">{user.address}</span>
                      </div>
                      <span className="text-amber-300 font-medium">{user.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 p-3 rounded-xl border border-yellow-500/30 shadow-lg backdrop-blur-md">
                <h4 className="text-amber-200 font-medium text-xs mb-2 flex items-center gap-1 uppercase tracking-wider">
                  <FaHistory className="text-yellow-400 text-xs" /> Recent Activity
                </h4>
                <div className="space-y-1">
                  {loading && <div className="text-amber-100/60 text-xs text-center py-2">Loading...</div>}
                  
                  {!loading && recentActivity.length === 0 && (
                    <div className="text-amber-100/60 text-xs text-center py-2">No recent activity</div>
                  )}
                  
                  {!loading && recentActivity.map((activity, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-amber-700/20 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center 
                          ${activity.type === 'deposit' ? 'bg-green-500/20 text-green-300' : 
                            activity.type === 'withdraw' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}
                        >
                          {activity.type === 'deposit' ? <FaArrowUp className="w-2 h-2" /> : 
                            activity.type === 'withdraw' ? "-" : "+"}
                        </span>
                        <span className="text-amber-100/80 font-medium capitalize">{activity.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-300 font-medium">{activity.amount}</span>
                        <span className="text-amber-100/50 text-[10px]">{activity.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};

export default React.memo(PoolMetricsCard);