import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import useProvider from '../../hooks/useProvider';
import ABI from '../../Abi/StakingContract.json';

// Mover las constantes fuera del componente
export const STAKING_CONSTANTS = {
  HOURLY_ROI: 0.0001, // 0.01%
  MAX_ROI: 1.25, // 125%
  COMMISSION: 0.06, // 6%
  MAX_DEPOSIT: 10000,
  MIN_DEPOSIT: 5,
  MAX_DEPOSITS_PER_USER: 300,
  BASIS_POINTS: 10000,
  TIME_BONUSES: {
    YEAR: { days: 365, bonus: 0.05 }, // 5%
    HALF_YEAR: { days: 180, bonus: 0.03 }, // 3%
    QUARTER: { days: 90, bonus: 0.01 } // 1%
  }
};

const defaultState = {
  contract: null,
  isContractPaused: false,
  isMigrated: false,
  newContractAddress: null,
  uniqueUsersCount: 0,
  totalPoolBalance: '0',
  userDeposits: [],
  userInfo: {
    totalStaked: '0',
    timeBonus: 0,
    pendingRewards: '0',
    lastWithdraw: 0,
    roiProgress: 0
  },
  treasuryAddress: null,
  stakingStats: {
    totalDeposited: '0',
    pendingRewards: '0',
    lastWithdraw: 0,
    depositsCount: 0,
    remainingSlots: 300
  },
  isPending: false,
  poolMetrics: {
    totalStaked: '0',
    totalUsers: 0,
    rewardsDistributed: '0',
    dailyVolume: '0',
    totalWithdrawn: '0',
    lastUpdate: 0
  }
};

const StakingContext = createContext({
  state: defaultState,
  STAKING_CONSTANTS: {
    HOURLY_ROI: 0.0001,
    MAX_ROI: 1.25,
    COMMISSION: 0.06,
    MAX_DEPOSIT: 10000,
    MIN_DEPOSIT: 5,
    MAX_DEPOSITS_PER_USER: 300,
    BASIS_POINTS: 10000,
    TIME_BONUSES: {
      YEAR: { days: 365, bonus: 0.05 },
      HALF_YEAR: { days: 180, bonus: 0.03 },
      QUARTER: { days: 90, bonus: 0.01 }
    }
  }
});

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error('useStaking must be used within a StakingProvider');
  }
  return context;
};

export const StakingProvider = ({ children }) => {
  const provider = useProvider();
  const [state, setState] = useState(defaultState);
  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;

  useEffect(() => {
    if (provider && CONTRACT_ADDRESS) {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
      setState(prev => ({ ...prev, contract }));
      
      // Initial contract status fetch
      getContractStatus(contract);
    }
  }, [provider]);

  const getSignedContract = async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
  };

  const deposit = async (amount) => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.deposit({
        value: amount,
        gasLimit: 300000
      });
      
      await tx.wait();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  const withdrawRewards = async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdraw();
      await tx.wait();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  const withdrawAll = async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdrawAll();
      await tx.wait();
      
      // Refresh state after withdrawal
      await getContractStatus();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  // Helper functions
  const refreshUserInfo = async (address) => {
    if (!state.contract || !address) return;
    
    return getCachedOrFetch(
      `user_info_${address}`,
      async () => {
        try {
          const [userInfoResponse, depositsResponse] = await Promise.all([
            state.contract.getUserInfo(address).then(info => ({
              totalDeposited: info.totalDeposited.toString(),
              pendingRewards: info.pendingRewards.toString(),
              lastWithdraw: Number(info.lastWithdraw || 0)
            })).catch(() => ({
              totalDeposited: '0',
              pendingRewards: '0',
              lastWithdraw: 0
            })),
            state.contract.getUserDeposits(address).then(deps => 
              deps.map(d => ({
                amount: d.amount.toString(),
                timestamp: Number(d.timestamp)
              }))
            ).catch(() => [])
          ]);
    
          const timeBonus = calculateTimeBonus((depositsResponse[0]?.timestamp || 0) * 1000);
          const roiProgress = calculateROIProgress(depositsResponse);
    
          const data = {
            userInfo: {
              totalStaked: userInfoResponse.totalDeposited,
              timeBonus,
              pendingRewards: userInfoResponse.pendingRewards,
              lastWithdraw: userInfoResponse.lastWithdraw,
              roiProgress
            },
            userDeposits: depositsResponse,
            stakingStats: {
              totalDeposited: userInfoResponse.totalDeposited,
              pendingRewards: userInfoResponse.pendingRewards,
              lastWithdraw: userInfoResponse.lastWithdraw,
              depositsCount: depositsResponse.length,
              remainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - depositsResponse.length
            }
          };
    
          setState(prev => ({ ...prev, ...data }));
          return data;
        } catch (error) {
          console.error('Error refreshing user info:', error);
          setState(prev => ({
            ...prev,
            userInfo: defaultState.userInfo,
            stakingStats: defaultState.stakingStats
          }));
          throw error;
        }
      },
      CACHE_CONFIG.USER_INFO.ttl
    );
  };

  // Update getContractStatus to accept contract parameter
  const getContractStatus = async (contractInstance = state.contract) => {
    if (!contractInstance) return;
    
    return getCachedOrFetch(
      'contract_status',
      async () => {
        try {
          const [paused, migrated, treasury, balance] = await Promise.all([
            contractInstance.paused(),
            contractInstance.migrated(),
            contractInstance.treasury(),
            contractInstance.getContractBalance()
          ]);
          
          const data = {
            isContractPaused: paused,
            isMigrated: migrated,
            treasuryAddress: treasury,
            totalPoolBalance: balance.toString()
          };
          
          setState(prev => ({ ...prev, ...data }));
          return data;
        } catch (error) {
          console.error('Error getting contract status:', error);
          throw error;
        }
      },
      CACHE_CONFIG.CONTRACT_STATUS.ttl
    );
  };

  // Format date helper function
  const formatWithdrawDate = useCallback((timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    try {
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  const calculateROIProgress = useCallback((deposits) => {
    if (!deposits || deposits.length === 0) return 0;
    const now = Math.floor(Date.now() / 1000);
    
    const progress = deposits.reduce((acc, deposit) => {
      const timeStaked = now - Number(deposit.timestamp);
      const hourlyProgress = (timeStaked / 3600) * STAKING_CONSTANTS.HOURLY_ROI;
      return acc + Math.min(hourlyProgress, STAKING_CONSTANTS.MAX_ROI);
    }, 0);

    return (progress / deposits.length) * 100;
  }, []);

  const getPoolEvents = async () => {
    if (!state.contract || !provider) return { deposits: [], withdrawals: [] };
    
    return getCachedOrFetch(
      'pool_events',
      async () => {
        try {
          // Obtener el bloque actual y calcular el rango
          const currentBlock = await provider.getBlockNumber();
          const fromBlock = Math.max(0, currentBlock - 1000); // Definir fromBlock aquí
  
          // Verificar cache
          const cacheKey = `pool_events_${fromBlock}`;
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            return JSON.parse(cached);
          }
  
          // Definir interfaces de eventos
          const depositEventSignature = "event DepositMade(address indexed user, uint256 indexed depositId, uint256 amount, uint256 commission, uint256 timestamp)";
          const withdrawEventSignature = "event WithdrawalMade(address indexed user, uint256 amount, uint256 commission)";
  
          const iface = new ethers.Interface([
            depositEventSignature,
            withdrawEventSignature
          ]);
  
          // Obtener logs usando el fromBlock definido
          const [depositLogs, withdrawalLogs] = await Promise.all([
            provider.getLogs({
              address: CONTRACT_ADDRESS,
              topics: [ethers.id("DepositMade(address,uint256,uint256,uint256,uint256)")],
              fromBlock, // Usar el fromBlock definido
              toBlock: 'latest'
            }),
            provider.getLogs({
              address: CONTRACT_ADDRESS,
              topics: [ethers.id("WithdrawalMade(address,uint256,uint256)")],
              fromBlock, // Usar el fromBlock definido
              toBlock: 'latest'
            })
          ]);
  
          // Procesar logs con el formato correcto
          const processedDeposits = depositLogs.map(log => {
            try {
              const parsed = iface.parseLog({
                topics: log.topics,
                data: log.data
              });
              
              return {
                args: {
                  user: parsed.args.user,
                  amount: parsed.args.amount.toString(),
                  timestamp: Number(parsed.args.timestamp || 0),
                  commission: parsed.args.commission.toString(),
                  depositId: parsed.args.depositId.toString()
                }
              };
            } catch (error) {
              console.error('Error parsing deposit:', error);
              return null;
            }
          }).filter(Boolean);
  
          const processedWithdrawals = withdrawalLogs.map(log => {
            try {
              const parsed = iface.parseLog({
                topics: log.topics,
                data: log.data
              });
              
              return {
                args: {
                  user: parsed.args.user,
                  amount: parsed.args.amount.toString(),
                  commission: parsed.args.commission.toString()
                }
              };
            } catch (error) {
              console.error('Error parsing withdrawal:', error);
              return null;
            }
          }).filter(Boolean);
  
          // Guardar en cache
          const result = {
            deposits: processedDeposits,
            withdrawals: processedWithdrawals
          };
          sessionStorage.setItem(cacheKey, JSON.stringify(result));
          return result;
        } catch (error) {
          console.error('Error getting pool events:', error);
          return { deposits: [], withdrawals: [] };
        }
      },
      CACHE_CONFIG.POOL_EVENTS.ttl
    );
  };

  const getPoolMetrics = async () => {
    if (!state.contract || !provider) return null;
    
    return getCachedOrFetch(
      'pool_metrics',
      async () => {
        try {
          // 1. Obtener datos básicos del contrato
          const [totalStaked, uniqueUsersCount] = await Promise.all([
            state.contract.getContractBalance(),
            state.contract.uniqueUsersCount()
          ]);
    
          // 2. Obtener eventos desde el inicio
          const filter = {
            address: CONTRACT_ADDRESS,
            fromBlock: 0,
            toBlock: 'latest'
          };
    
          // 3. Obtener todos los eventos relevantes
          const [rewardWithdrawals, emergencyWithdraws] = await Promise.all([
            provider.getLogs({
              ...filter,
              topics: [ethers.id("WithdrawalMade(address,uint256,uint256)")]
            }),
            provider.getLogs({
              ...filter,
              topics: [ethers.id("EmergencyWithdraw(address,uint256,uint256)")]
            })
          ]);
    
          // 4. Crear interfaces para decodificar eventos
          const withdrawInterface = new ethers.Interface([
            "event WithdrawalMade(address indexed user, uint256 amount, uint256 commission)",
            "event EmergencyWithdraw(address indexed user, uint256 amount, uint256 timestamp)"
          ]);
    
          // 5. Calcular totales
          let totalRewards = BigInt(0);
          let totalWithdrawn = BigInt(0);
    
          // Procesar retiros de recompensas
          rewardWithdrawals.forEach(log => {
            try {
              const decoded = withdrawInterface.parseLog({
                topics: log.topics,
                data: log.data
              });
              totalRewards += BigInt(decoded.args.amount);
            } catch (error) {
              console.error('Error processing reward withdrawal:', error);
            }
          });
    
          // Procesar retiros totales (emergency + withdrawAll)
          emergencyWithdraws.forEach(log => {
            try {
              const decoded = withdrawInterface.parseLog({
                topics: log.topics,
                data: log.data
              });
              totalWithdrawn += BigInt(decoded.args.amount);
            } catch (error) {
              console.error('Error processing emergency withdrawal:', error);
            }
          });
    
          const metrics = {
            totalStaked: totalStaked.toString(),
            totalUsers: Number(uniqueUsersCount),
            rewardsDistributed: totalRewards.toString(),
            totalWithdrawn: totalWithdrawn.toString(),
            lastUpdate: Math.floor(Date.now() / 1000)
          };
    
          setState(prev => ({
            ...prev,
            poolMetrics: metrics,
            uniqueUsersCount: Number(uniqueUsersCount)
          }));
    
          return metrics;
        } catch (error) {
          console.error('Error getting pool metrics:', error);
          return null;
        }
      },
      CACHE_CONFIG.POOL_METRICS.ttl
    );
  };

  // Ajustar el intervalo de actualización
  useEffect(() => {
    if (provider && state.contract) {
      getPoolMetrics();
      const interval = setInterval(getPoolMetrics, CACHE_CONFIG.POOL_METRICS.ttl);
      return () => clearInterval(interval);
    }
  }, [provider, state.contract]);

  const getTreasuryMetrics = async () => {
    if (!state.contract || !provider) return null;
    
    return getCachedOrFetch(
      'treasury_metrics',
      async () => {
        const cacheKey = 'treasury_metrics';
        const now = Math.floor(Date.now() / 1000);
        
        // Intentar usar cache primero
        try {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            // Usar cache si tiene menos de 2 minutos
            if (now - parsed.lastUpdate < 120) {
              setState(prev => ({ ...prev, treasuryMetrics: parsed }));
              return parsed;
            }
          }
    
          // Obtener datos básicos primero
          const [treasuryAddress, contractBalance] = await Promise.all([
            state.contract.treasury(),
            state.contract.getContractBalance()
          ]);
    
          // Obtener balance del treasury
          const treasuryBalance = await provider.getBalance(treasuryAddress);
    
          // Calcular métricas iniciales
          let metrics = {
            address: treasuryAddress,
            balance: treasuryBalance.toString(),
            dailyCommissions: '0',
            dailyGrowth: 0,
            healthScore: calculateTreasuryHealth(treasuryBalance, contractBalance),
            lastUpdate: now
          };
    
          // Intentar obtener comisiones con retry y fallback
          try {
            const currentBlock = await provider.getBlockNumber();
            const blocksIn24Hours = 43200; // Aproximadamente en Polygon
            const fromBlock = Math.max(0, currentBlock - blocksIn24Hours);
    
            const getComissions = async (retryCount = 0) => {
              try {
                const commissionFilter = {
                  address: CONTRACT_ADDRESS,
                  topics: [ethers.id("CommissionPaid(address,uint256,uint256)")],
                  fromBlock,
                  toBlock: 'latest'
                };
    
                const logs = await provider.getLogs(commissionFilter);
                const iface = new ethers.Interface([
                  "event CommissionPaid(address indexed receiver, uint256 amount, uint256 timestamp)"
                ]);
    
                let dailyCommissions = BigInt(0);
                logs.forEach(log => {
                  try {
                    const decoded = iface.parseLog({
                      topics: log.topics,
                      data: log.data
                    });
                    dailyCommissions += BigInt(decoded.args.amount || 0);
                  } catch (err) {
                    console.warn('Error decoding commission log:', err);
                  }
                });
    
                return dailyCommissions.toString();
              } catch (error) {
                if (error.code === 429 && retryCount < 3) {
                  await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
                  return getComissions(retryCount + 1);
                }
                throw error;
              }
            };
    
            const dailyCommissions = await getComissions();
            metrics = {
              ...metrics,
              dailyCommissions,
              dailyGrowth: calculateDailyGrowth(treasuryBalance, dailyCommissions)
            };
          } catch (error) {
            console.warn('Error getting commission events, using fallback:', error);
            // Usar valores anteriores del cache si existen
            if (cachedData) {
              const parsed = JSON.parse(cachedData);
              metrics.dailyCommissions = parsed.dailyCommissions;
              metrics.dailyGrowth = parsed.dailyGrowth;
            }
          }
    
          // Guardar en cache y actualizar estado
          sessionStorage.setItem(cacheKey, JSON.stringify(metrics));
          setState(prev => ({
            ...prev,
            treasuryMetrics: metrics,
            treasuryAddress
          }));
    
          return metrics;
        } catch (error) {
          console.error('Error in getTreasuryMetrics:', error);
          // Usar cache completo como fallback
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            setState(prev => ({
              ...prev,
              treasuryMetrics: parsed
            }));
            return parsed;
          }
          return null;
        }
      },
      CACHE_CONFIG.TREASURY_METRICS.ttl
    );
  };

    // Add cache implementation
  const requestCache = new Map();
  
  const getCachedOrFetch = async (key, fetchFn, ttl = 60000) => {
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    
    const data = await fetchFn();
    requestCache.set(key, {
      timestamp: Date.now(),
      data
    });
    return data;
  };

  // Optimizar el intervalo de actualización
  useEffect(() => {
    if (provider && state.contract) {
      getTreasuryMetrics();
      const interval = setInterval(getTreasuryMetrics, CACHE_CONFIG.TREASURY_METRICS.ttl);
      return () => clearInterval(interval);
    }
  }, [provider, state.contract]);

  const calculateDailyGrowth = (currentBalance, dailyCommissions) => {
    if (!currentBalance || !dailyCommissions) return 0;
    return (Number(dailyCommissions) / Number(currentBalance)) * 100;
  };

  const calculateTreasuryHealth = (treasuryBalance, contractBalance) => {
    if (!treasuryBalance || !contractBalance) return 0;
    // Score basado en la proporción treasury/contract
    const ratio = Number(treasuryBalance) / Number(contractBalance);
    return Math.min(ratio * 100, 100); // Score de 0 a 100
  };

  const contextValue = {
    state,
    setState,
    STAKING_CONSTANTS,
    deposit,
    withdrawRewards,
    withdrawAll,        // Add withdrawAll to context
    refreshUserInfo,
    getContractStatus,
    formatWithdrawDate,  // Add this to context
    calculateROIProgress, // Add this to context
    getPoolMetrics,
    getPoolEvents,
    getTreasuryMetrics,
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

// Funciones de utilidad para cálculos
const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) return STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) return STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) return STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus;
  return 0;
};

const CACHE_CONFIG = {
  CONTRACT_STATUS: { ttl: 60000 }, // 1 minute
  POOL_METRICS: { ttl: 300000 }, // 5 minutes
  TREASURY_METRICS: { ttl: 120000 }, // 2 minutes
  USER_INFO: { ttl: 30000 }, // 30 seconds
  POOL_EVENTS: { ttl: 600000 } // 10 minutes
};
