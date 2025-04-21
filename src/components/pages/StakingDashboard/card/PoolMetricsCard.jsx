import React, { useMemo, useEffect, useState, useCallback, useRef } from 'react';
import { FaChartBar, FaUsers, FaCoins, FaInfoCircle, FaGift, FaHistory, FaCalendarAlt, FaShieldAlt, FaLock, FaStar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { ethers } from 'ethers';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../../../ui/Tooltip';
import { globalRateLimiter } from '../../../../utils/RateLimiter';
import { globalCache } from '../../../../utils/CacheManager';

// Constantes para caché y actualización
const METRICS_CACHE_KEY = 'pool_metrics_card';
const METRICS_CACHE_TTL = 3 * 60 * 1000; // 3 minutos (increased to reduce refreshes)
const METRICS_UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutos (increased to reduce refreshes)
const METRICS_MIN_REFRESH_INTERVAL = 30 * 1000; // 30 segundos minimum between refreshes

const PoolMetricsCard = () => {
  const { state, getPoolMetrics } = useStaking();
  const [loading, setLoading] = useState(false);
  const lastUpdateRef = useRef(0);
  const isUpdatingRef = useRef(false);
  
  // Datos memoizados para evitar cálculos innecesarios
  const metrics = useMemo(() => ({
    totalStaked: state?.totalPoolBalance || '0',
    totalUsers: state?.uniqueUsersCount || 0,
    rewardsDistributed: state?.poolMetrics?.rewardsDistributed || '0',
    totalWithdrawn: state?.poolMetrics?.totalWithdrawn || '0',
  }), [state.totalPoolBalance, state.uniqueUsersCount, state.poolMetrics]);

  // Optimización: Función de actualización con caché y rate limiting mejorada
  const updatePoolMetrics = useCallback(async (force = false) => {
    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      return;
    }
    
    const now = Date.now();
    
    // Enforce minimum refresh interval unless forced
    if (!force && (now - lastUpdateRef.current < METRICS_MIN_REFRESH_INTERVAL)) {
      return;
    }
    
    // Check rate limiting
    if (!force && !globalRateLimiter.canMakeCall(METRICS_CACHE_KEY)) {
      console.log("Rate limited pool metrics update");
      return;
    }
    
    // Prevent UI flickering by not showing loading state for quick refreshes
    const loadingDelay = setTimeout(() => {
      if (isUpdatingRef.current) {
        setLoading(true);
      }
    }, 500);
    
    isUpdatingRef.current = true;
    
    try {
      // Intentar obtener de caché primero
      const cachedMetrics = !force && await globalCache.get(METRICS_CACHE_KEY, null);
      
      if (cachedMetrics) {
        console.log("Using cached pool metrics");
      } else {
        // Avoid repetitive logging to reduce console noise
        if (now - lastUpdateRef.current > METRICS_MIN_REFRESH_INTERVAL * 2) {
          console.log("Fetching fresh pool metrics");
        }
        
        await getPoolMetrics();
        lastUpdateRef.current = now;
        
        // Guardar en caché para futuros usos
        globalCache.set(METRICS_CACHE_KEY, true, METRICS_CACHE_TTL);
      }
    } catch (error) {
      console.error("Error updating pool metrics:", error);
    } finally {
      clearTimeout(loadingDelay);
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, [getPoolMetrics]);

  // Cargar datos en montaje y configurar intervalo de actualización
  useEffect(() => {
    // Actualización inicial con delay para no competir con otros componentes
    const initialTimeout = setTimeout(() => {
      updatePoolMetrics(true);
    }, 1000);
    
    // Configurar intervalo con limpieza adecuada
    const intervalId = setInterval(() => {
      updatePoolMetrics(false);
    }, METRICS_UPDATE_INTERVAL);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [updatePoolMetrics]);

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

  return (
    <BaseCard 
      title="Pool Statistics" 
      icon={<FaChartBar className="text-indigo-400" />}
      loading={loading}>
      <div className="flex flex-col h-full space-y-4">
        {/* TVL and Users Row */}
        <div className="grid grid-cols-3 gap-3">
          {/* TVL - 2/3 width */}
          <div className="col-span-2 p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs font-medium">Total Value Locked</span>
              <Tooltip content="Total amount of POL tokens currently staked in the staking pool">
                <FaInfoCircle className="text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <div className="text-2xl font-medium text-slate-100">
                {Number(formatBalance(metrics.totalStaked)).toFixed(3)}
              </div>
              <div className="text-sm text-slate-400">POL</div>
            </div>
          </div>

          {/* Users - 1/3 width */}
          <div className=" p-4 rounded-xl border border-indigo-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaUsers className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400 text-xs font-medium">Users</span>
            </div>
            <div className="text-xl font-medium text-slate-100 mt-1">
              {metrics.totalUsers}
            </div>
          </div>
        </div>

        {/* Rewards and Withdrawals Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <FaCoins className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400 text-xs font-medium">Rewards</span>
              <Tooltip content="Total rewards distributed to stakers since pool deployment">
                <FaInfoCircle className="text-slate-400 hover:text-indigo-400" />
              </Tooltip>
            </div>
            <div className="text-lg font-medium text-slate-100 mt-1">
              {formatBalance(metrics.rewardsDistributed)} POL
            </div>
          </div>

          <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-indigo-900/5 transition-all duration-300">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaHistory className="w-4 h-4 text-indigo-400" />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
              </div>
              <span className="text-slate-400 text-xs font-medium">Withdrawn</span>
            </div>
            <div className="text-lg font-medium text-slate-100 mt-1">
              {formatBalance(metrics.totalWithdrawn)} POL
            </div>
          </div>
        </div>

        {/* Community Goal Section */}
        <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaGift className={`w-4 h-4 text-fuchsia-400 ${goalMetrics.isCompleted ? 'animate-bounce' : ''}`} />
              <span className="text-slate-300 text-sm font-medium">Community Goal</span>
            </div>
            <span className="text-xs px-2 py-0.5 bg-fuchsia-900/30 text-fuchsia-400 font-medium rounded-full">
              {goalMetrics.progressPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="mb-3">
            <div className="w-full bg-slate-800/60 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ease-out
                  bg-gradient-to-r from-indigo-500 to-fuchsia-400`}
                style={{ width: `${goalMetrics.progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-slate-400">Current: <b className="text-slate-300">{Number(goalMetrics.currentAmount).toFixed(2)} POL</b></span>
              <span className="text-xs text-slate-400">Goal: <b className="text-slate-300">{Number(goalMetrics.goalAmount).toFixed(2)} POL</b></span>
            </div>
            
          </div>
        </div>

        {/* New Staking Information Section */}
        
      </div>
    </BaseCard>
  );
};

export default React.memo(PoolMetricsCard);