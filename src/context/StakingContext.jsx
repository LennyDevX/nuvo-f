import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from '../hooks/useProvider';
import ABI from '../Abi/StakingContract.json';

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

const createCache = () => {
  const cache = new Map();
  
  return {
    get: (key) => {
      const item = cache.get(key);
      if (!item) return null;
      
      if (Date.now() - item.timestamp > item.ttl) {
        cache.delete(key);
        return null;
      }
      
      return item.data;
    },
    set: (key, data, ttl) => {
      cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    },
    clear: () => cache.clear()
  };
};

export const StakingProvider = ({ children }) => {
  const { provider, isInitialized } = useProvider();
  const [state, setState] = useState(defaultState);
  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
  const cache = useRef(createCache());
  const refreshTimeoutRef = useRef(null);

  // Define getSignerAddress as a useCallback within the provider scope
  const getSignerAddress = useCallback(async () => {
    if (!window.ethereum) return null;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return await signer.getAddress();
    } catch (error) {
      console.error("Error getting signer address:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || !provider || !CONTRACT_ADDRESS) return;

    const initializeContract = async () => {
      try {
        console.log("Initializing contract with address:", CONTRACT_ADDRESS);
        
        // Verificar que el contrato existe antes de inicializarlo
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at address');
        }

        // Crear el contrato con un proveedor listo
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        
        // Agregar funciones de ayuda al contrato
        contract.provider = provider;
        contract.callStatic = contract.connect(provider);
        
        setState(prev => ({ ...prev, contract }));

        // Intentar obtener estado inicial con manejo de errores
        try {
          await getContractStatus(contract);
        } catch (statusError) {
          console.warn("Initial status fetch failed:", statusError);
          // No fallar completamente si el status inicial falla
        }

      } catch (err) {
        console.error("Contract initialization error:", err);
      }
    };

    initializeContract();
  }, [provider, isInitialized, CONTRACT_ADDRESS]);

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
  const refreshUserInfo = useCallback(async (address) => {
    if (!state.contract || !address) {
      console.log("Missing dependencies for refreshUserInfo:", {
        hasContract: !!state.contract,
        address
      });
      return;
    }

      console.log("Refreshing user info for:", address);
    
    try {
      // Use callStatic for read operations
      const [userInfoResponse, depositsResponse] = await Promise.all([
        state.contract.callStatic.getUserInfo(address),
        state.contract.callStatic.getUserDeposits(address)
      ]);

      console.log("Raw user data:", {
        userInfo: userInfoResponse,
        deposits: depositsResponse
      });

      // Process and format the data
      const formattedDeposits = Array.isArray(depositsResponse) ? depositsResponse.map(deposit => ({
        amount: ethers.formatEther(deposit.amount || '0'),
        timestamp: Number(deposit.timestamp || '0')
      })) : [];

      // Process user info
      // Calcular ROI progress
      const now = Math.floor(Date.now() / 1000);
      let totalProgress = 0;

      formattedDeposits.forEach(deposit => {
        const timeStaked = now - deposit.timestamp;
        const daysStaked = timeStaked / (24 * 3600);
        const dailyROI = 0.24; // 0.24% daily
        const progress = Math.min(daysStaked * dailyROI, 125);
        totalProgress += progress;
      });

      const roiProgress = formattedDeposits.length > 0 ? 
        totalProgress / formattedDeposits.length : 0;

      // Declare formattedUserInfo with let or const
      const formattedUserInfo = {
        totalStaked: ethers.formatEther(userInfoResponse.totalStaked || '0'),
        pendingRewards: ethers.formatEther(userInfoResponse.pendingRewards || '0'),
        lastWithdraw: Number(userInfoResponse.lastWithdraw || '0'),
        roiProgress: roiProgress,
        stakingDays: Math.floor((now - (formattedDeposits[0]?.timestamp || now)) / (24 * 3600))
      };

      console.log("Processed user data:", {
        userInfo: formattedUserInfo,
        deposits: formattedDeposits,
        roiProgress
      });

      setState(prev => ({
        ...prev,
        userInfo: formattedUserInfo,
        userDeposits: formattedDeposits,
        stakingStats: {
          ...prev.stakingStats,
          pendingRewards: formattedUserInfo.pendingRewards,
          lastWithdraw: formattedUserInfo.lastWithdraw,
          depositsCount: formattedDeposits.length,
          roiProgress: roiProgress
        }
      }));

      return { userInfo: formattedUserInfo, deposits: formattedDeposits };
    } catch (error) {
      console.error("Error in refreshUserInfo:", error);
      return null;
    }
  }, [state.contract]);

  // Update getContractStatus to accept contract parameter
  const getContractStatus = async (contractInstance = state.contract) => {
    if (!contractInstance || !provider || !isInitialized) return;
    
    return getCachedOrFetch(
      'contract_status',
      async () => {
        try {
          const [paused, migrated, treasury, balance] = await Promise.all([
            contractInstance.callStatic.paused().catch(() => false),
            contractInstance.callStatic.migrated().catch(() => false),
            contractInstance.callStatic.treasury().catch(() => null),
            contractInstance.callStatic.getContractBalance().catch(() => BigInt(0))
          ].map(p => p.catch(e => {
            console.warn('Contract call failed:', e);
            return null;
          })));
          
          const data = {
            isContractPaused: !!paused,
            isMigrated: !!migrated,
            treasuryAddress: treasury,
            totalPoolBalance: balance?.toString() || '0'
          };
          
          setState(prev => ({ ...prev, ...data }));
          return data;
        } catch (error) {
          console.error('Error getting contract status:', error);
          return null;
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
    // Ensure contract and provider are available
    if (!state.contract || !provider) {
      console.error("getPoolEvents: Contract or provider not available.");
      return { deposits: [], withdrawals: [] };
    }

    // Get the current user's address using the correctly defined function
    const signerAddress = await getSignerAddress(); // Now calls the function defined above
    if (!signerAddress) {
      console.error("getPoolEvents: Could not get signer address.");
      return { deposits: [], withdrawals: [] };
    }
    console.log(`getPoolEvents: Fetching events for user: ${signerAddress}`);

    // --- CRITICAL ABI CHECK ---
    if (!ABI || !ABI.abi || !Array.isArray(ABI.abi) || ABI.abi.length === 0) {
       console.error("Staking Contract ABI is empty or invalid in StakingContract.json. Cannot parse logs correctly.");
       return { deposits: [], withdrawals: [] }; // Stop processing if ABI is missing
    }
    // --- END ABI CHECK ---

    try {
      // Define event topics using ethers.id
      const depositTopic = ethers.id("DepositMade(address,uint256,uint256,uint256,uint256)");
      const withdrawalTopic = ethers.id("WithdrawalMade(address,uint256,uint256)");

      // Filter by user address (indexed parameter)
      const userTopic = ethers.zeroPadValue(signerAddress, 32);

      // Query logs from block 0 (adjust if deployment block is known and preferred)
      const fromBlock = 0; // Or contract deployment block
      console.log(`getPoolEvents: Querying logs from block ${fromBlock} for user ${signerAddress}`);

      const [depositLogs, withdrawalLogs] = await Promise.all([
        provider.getLogs({
          address: CONTRACT_ADDRESS,
          topics: [depositTopic, userTopic],
          fromBlock: fromBlock,
          toBlock: 'latest'
        }),
        provider.getLogs({
          address: CONTRACT_ADDRESS,
          topics: [withdrawalTopic, userTopic],
          fromBlock: fromBlock,
          toBlock: 'latest'
        })
      ]);

      console.log(`getPoolEvents: Found ${depositLogs.length} deposit logs and ${withdrawalLogs.length} withdrawal logs.`);

      // Define interfaces for parsing using the validated ABI
      const iface = new ethers.Interface(ABI.abi);

      // Process deposit logs (they have a timestamp)
      const processedDeposits = depositLogs.map(log => {
        try {
          const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
          if (!parsed || !parsed.args) return null;
          return {
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            args: {
              user: parsed.args.user,
              amount: parsed.args.amount?.toString() || '0',
              timestamp: Number(parsed.args.timestamp || 0), // Use emitted timestamp
              commission: parsed.args.commission?.toString() || '0',
              depositId: parsed.args.depositId?.toString() || '0'
            }
          };
        } catch (error) {
          console.error('Error parsing deposit log:', log, error);
          return null;
        }
      }).filter(Boolean);

      // Process withdrawal logs (fetch block timestamp)
      const processedWithdrawals = await Promise.all(withdrawalLogs.map(async (log) => {
        try {
          const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
          if (!parsed || !parsed.args) return null;

          // Fetch the block to get the timestamp
          const block = await provider.getBlock(log.blockNumber);
          const blockTimestamp = block ? block.timestamp : Math.floor(Date.now() / 1000); // Fallback to now if block fetch fails

          return {
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            blockTimestamp: blockTimestamp, // Add the block timestamp here
            args: {
              user: parsed.args.user,
              amount: parsed.args.amount?.toString() || '0',
              commission: parsed.args.commission?.toString() || '0'
            }
          };
        } catch (error) {
          console.error('Error parsing withdrawal log or fetching block:', log, error);
          return null;
        }
      }));

      const result = {
        deposits: processedDeposits,
        // Filter out nulls after Promise.all resolves
        withdrawals: processedWithdrawals.filter(Boolean)
      };

      console.log("getPoolEvents: Processed events:", result);

      return result;
    } catch (error) {
      console.error('Error in getPoolEvents:', error);
      return { deposits: [], withdrawals: [] };
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
      cache.current.clear();
    };
  }, []);

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
    getSignerAddress // Keep it in context value if needed elsewhere
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
