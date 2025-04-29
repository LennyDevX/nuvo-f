import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FaPiggyBank, FaInfoCircle, FaChartLine, FaHistory, FaLock, FaChevronDown, FaChevronUp, FaExchangeAlt, FaShieldAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import BaseCard from './BaseCard';
import { formatBalance } from '../../../../utils/formatters';
import { useStaking } from '../../../../context/StakingContext';
import Tooltip from '../../../ui/Tooltip';
import { globalRateLimiter } from '../../../../utils/RateLimiter';
import { globalCache } from '../../../../utils/CacheManager';

// Constantes para la gestión de datos de tesorería - increased to reduce API pressure
const TREASURY_CACHE_KEY = 'treasury_metrics_card';
const TREASURY_CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const TREASURY_UPDATE_INTERVAL = 3 * 60 * 1000; // 3 minutos
const TREASURY_MIN_REFRESH_INTERVAL = 60 * 1000; // 60 segundos minimum between refreshes
const MAX_RETRY_ATTEMPTS = 3;

const TreasuryCard = () => {
  const { state, getTreasuryMetrics } = useStaking();
  const { treasuryMetrics } = state;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastUpdateRef = useRef(0);
  const isUpdatingRef = useRef(false);
  const retryCountRef = useRef(0);

  // Optimización: Función para actualizar métricas de tesorería con caché y retry logic
  const updateTreasuryMetrics = useCallback(async (force = false) => {
    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      return;
    }
    
    const now = Date.now();
    
    // Enforce minimum refresh interval unless forced
    if (!force && (now - lastUpdateRef.current < TREASURY_MIN_REFRESH_INTERVAL)) {
      return;
    }
    
    // Verificar rate limiting excepto si es forzado
    if (!force && !globalRateLimiter.canMakeCall(TREASURY_CACHE_KEY)) {
      console.log("Rate limited treasury metrics update");
      return;
    }
    
    // Reset error state on new attempt
    setError(null);
    
    // Prevent UI flickering by not showing loading state for quick refreshes
    const loadingDelay = setTimeout(() => {
      if (isUpdatingRef.current) {
        setLoading(true);
      }
    }, 500);
    
    isUpdatingRef.current = true;
    
    try {
      // Intentar obtener de caché primero si no es forzado
      const cachedMetrics = !force && await globalCache.get(TREASURY_CACHE_KEY, null);
      
      if (cachedMetrics) {
        console.log("Using cached treasury metrics");
      } else {
        // Si no hay caché o es forzado, obtener datos frescos
        if (now - lastUpdateRef.current > TREASURY_MIN_REFRESH_INTERVAL * 2) {
          console.log("Fetching fresh treasury metrics");
        }
        
        try {
          await getTreasuryMetrics();
          // Reset retry counter on success
          retryCountRef.current = 0;
          lastUpdateRef.current = now;
          
          // Guardar en caché para futuros usos
          globalCache.set(TREASURY_CACHE_KEY, true, TREASURY_CACHE_TTL);
        } catch (fetchError) {
          // Detect the block range error
          const isBlockRangeError = fetchError.message && 
            (fetchError.message.includes("block range") || 
             fetchError.message.includes("-32600"));
          
          console.warn("Error fetching treasury metrics:", 
            isBlockRangeError ? "Block range limit exceeded" : fetchError.message);
          
          if (retryCountRef.current < MAX_RETRY_ATTEMPTS) {
            retryCountRef.current++;
            
            // Implement exponential backoff for retries
            const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
            console.log(`Will retry in ${backoffDelay/1000} seconds (attempt ${retryCountRef.current}/${MAX_RETRY_ATTEMPTS})`);
            
            setTimeout(() => {
              updateTreasuryMetrics(true);
            }, backoffDelay);
          } else {
            setError("Unable to fetch latest metrics. Using cached data.");
            // Still use what we have in the state
            console.log("Using fallback metrics from state");
            // Cache the error state to prevent frequent retries
            globalCache.set(TREASURY_CACHE_KEY, true, TREASURY_CACHE_TTL / 2);
          }
        }
      }
    } catch (error) {
      console.error("Error updating treasury metrics:", error);
      setError("Unable to update treasury data");
    } finally {
      clearTimeout(loadingDelay);
      setLoading(false);
      isUpdatingRef.current = false;
    }
  }, [getTreasuryMetrics]);

  // Optimización: Carga inicial y configuración de intervalo
  useEffect(() => {
    // Actualización inicial con delay para no competir con otros componentes
    const initialTimeout = setTimeout(() => {
      updateTreasuryMetrics(true);
    }, 2500); // Increased to 2.5 seconds to reduce initial load and avoid conflicts
    
    // Configurar intervalo con frecuencia adecuada
    const intervalId = setInterval(() => {
      updateTreasuryMetrics(false);
    }, TREASURY_UPDATE_INTERVAL);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [updateTreasuryMetrics]);

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
      <BaseCard 
        title="Treasury" 
        icon={<FaPiggyBank className="text-fuchsia-400" />}
        loading={loading}>
        {error && (
          <div className="text-amber-400 text-xs mb-2 flex items-center">
            <FaInfoCircle className="mr-1" /> {error}
          </div>
        )}
        <div className="flex flex-col h-full space-y-4">
          {/* Main Balance */}
          <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-fuchsia-900/5 transition-all duration-300">
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
            <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
              <div className="flex items-center gap-2">
                <FaChartLine className="w-4 h-4 text-violet-400" />
                <span className="text-slate-400 text-xs font-medium">24h Revenue</span>
              </div>
              <div className="text-lg font-medium text-slate-100 mt-1">
                {formatBalance(treasuryMetrics?.dailyCommissions)}
              </div>
            </div>
            
            <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
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
          <div className=" p-4 rounded-xl border border-violet-700/20 shadow-sm hover:shadow-md hover:shadow-violet-900/5 transition-all duration-300">
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
          
          
          
          {/* Modificamos o eliminamos el botón que abría el modal */}
          
        </div>
      </BaseCard>
    </>
  );
};

export default React.memo(TreasuryCard);
