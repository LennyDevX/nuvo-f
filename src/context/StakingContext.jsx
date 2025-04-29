import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from '../hooks/useProvider';
import ABI from '../Abi/StakingContract.json';
import { globalRateLimiter } from '../utils/RateLimiter';
import { globalCache } from '../utils/CacheManager';

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
  const { provider, isInitialized } = useProvider();
  const [state, setState] = useState(defaultState);
  const CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
  const refreshTimeoutRef = useRef(null);

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
        
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at address');
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        
        contract.provider = provider;
        contract.callStatic = contract.connect(provider);
        
        setState(prev => ({ ...prev, contract }));

        try {
          await getContractStatus(contract);
        } catch (statusError) {
          console.warn("Initial status fetch failed:", statusError);
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
      
      await getContractStatus();
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  };

  const refreshUserInfo = useCallback(async (address) => {
    if (!state.contract || !address) {
      console.log("Missing dependencies for refreshUserInfo:", {
        hasContract: !!state.contract,
        address
      });
      return;
    }

    const rateLimiterKey = `user_info_${address}`;
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      console.log("Rate limited, skipping user info refresh");
      return;
    }

    console.log("Refreshing user info for:", address);
    
    try {
      const cacheKey = `user_info_${address}`;
      return await globalCache.get(
        cacheKey,
        async () => {
          const [userInfoResponse, depositsResponse] = await Promise.all([
            state.contract.callStatic.getUserInfo(address),
            state.contract.callStatic.getUserDeposits(address)
          ]);

          const formattedDeposits = Array.isArray(depositsResponse) ? depositsResponse.map(deposit => ({
            amount: ethers.formatEther(deposit.amount || '0'),
            timestamp: Number(deposit.timestamp || '0')
          })) : [];

          const now = Math.floor(Date.now() / 1000);
          let totalProgress = 0;

          formattedDeposits.forEach(deposit => {
            const timeStaked = now - deposit.timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            const dailyROI = 0.24;
            const progress = Math.min(daysStaked * dailyROI, 125);
            totalProgress += progress;
          });

          const roiProgress = formattedDeposits.length > 0 ? 
            totalProgress / formattedDeposits.length : 0;

          const formattedUserInfo = {
            totalStaked: ethers.formatEther(userInfoResponse.totalStaked || '0'),
            pendingRewards: ethers.formatEther(userInfoResponse.pendingRewards || '0'),
            lastWithdraw: Number(userInfoResponse.lastWithdraw || '0'),
            roiProgress: roiProgress,
            stakingDays: Math.floor((now - (formattedDeposits[0]?.timestamp || now)) / (24 * 3600))
          };

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
        },
        CACHE_CONFIG.USER_INFO.ttl
      );
    } catch (error) {
      console.error("Error in refreshUserInfo:", error);
      return null;
    }
  }, [state.contract]);

  const getContractStatus = async (contractInstance = state.contract) => {
    if (!contractInstance || !provider || !isInitialized) return;
    
    const rateLimiterKey = 'contract_status';
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      console.log("Rate limited, skipping contract status fetch");
      return;
    }
    
    try {
      return await globalCache.get(
        'contract_status',
        async () => {
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
        },
        CACHE_CONFIG.CONTRACT_STATUS.ttl
      );
    } catch (error) {
      console.error("Error getting contract status:", error);
      return null;
    }
  };

  // Helper function to fetch logs in chunks respecting the 500 block limit
  const fetchLogsInChunks = async (filter, maxRetries = 3) => {
    if (!provider) return [];
    
    try {
      const currentBlock = await provider.getBlockNumber();
      const startBlock = parseInt(filter.fromBlock) || 0;
      const endBlock = filter.toBlock === 'latest' ? currentBlock : parseInt(filter.toBlock);
      
      // Use a reasonable chunk size to avoid RPC errors (smaller than 500)
      const CHUNK_SIZE = 480;
      
      // If the request is already small enough, just make a direct request
      if (endBlock - startBlock <= CHUNK_SIZE) {
        return await provider.getLogs({
          ...filter,
          fromBlock: ethers.toQuantity(startBlock),
          toBlock: ethers.toQuantity(endBlock)
        });
      }
      
      // Otherwise, split into chunks and combine results
      console.log(`Chunking log requests from ${startBlock} to ${endBlock}`);
      const allLogs = [];
      
      // Start from a reasonable point in time to avoid fetching the entire chain history
      // For example, we could start from 7 days ago (~40,320 blocks on Polygon)
      // This is a compromise between data completeness and performance
      const effectiveStartBlock = Math.max(startBlock, endBlock - 40320);
      
      for (let from = effectiveStartBlock; from < endBlock; from += CHUNK_SIZE) {
        const to = Math.min(from + CHUNK_SIZE - 1, endBlock);
        
        let retryCount = 0;
        let success = false;
        
        while (!success && retryCount < maxRetries) {
          try {
            console.log(`Fetching logs from block ${from} to ${to} (attempt ${retryCount + 1})`);
            const chunkLogs = await provider.getLogs({
              ...filter,
              fromBlock: ethers.toQuantity(from),
              toBlock: ethers.toQuantity(to)
            });
            
            allLogs.push(...chunkLogs);
            success = true;
          } catch (error) {
            retryCount++;
            console.warn(`Error fetching logs for blocks ${from}-${to}:`, error);
            
            if (retryCount >= maxRetries) {
              console.error(`Failed to fetch logs after ${maxRetries} attempts`);
            } else {
              // Wait before retry with exponential backoff
              await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount)));
            }
          }
        }
        
        // Small delay between chunks to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
      
      return allLogs;
    } catch (error) {
      console.error('Error fetching logs in chunks:', error);
      return [];
    }
  };

  const getPoolMetrics = async () => {
    if (!state.contract || !provider) return null;
    
    return globalCache.get(
      'pool_metrics',
      async () => {
        try {
          const [totalStaked, uniqueUsersCount] = await Promise.all([
            state.contract.getContractBalance(),
            state.contract.uniqueUsersCount()
          ]);
    
          // Use chunking for logs retrieval
          const rewardWithdrawalFilter = {
            address: CONTRACT_ADDRESS,
            topics: [ethers.id("WithdrawalMade(address,uint256,uint256)")],
            fromBlock: 0
          };
          
          const emergencyWithdrawFilter = {
            address: CONTRACT_ADDRESS,
            topics: [ethers.id("EmergencyWithdraw(address,uint256,uint256)")],
            fromBlock: 0
          };
          
          const [rewardWithdrawals, emergencyWithdraws] = await Promise.all([
            fetchLogsInChunks(rewardWithdrawalFilter),
            fetchLogsInChunks(emergencyWithdrawFilter)
          ]);
    
          const withdrawInterface = new ethers.Interface([
            "event WithdrawalMade(address indexed user, uint256 amount, uint256 commission)",
            "event EmergencyWithdraw(address indexed user, uint256 amount, uint256 timestamp)"
          ]);
    
          let totalRewards = BigInt(0);
          let totalWithdrawn = BigInt(0);
    
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

  useEffect(() => {
    if (provider && state.contract) {
      getPoolMetrics();
      const interval = setInterval(getPoolMetrics, CACHE_CONFIG.POOL_METRICS.ttl);
      return () => clearInterval(interval);
    }
  }, [provider, state.contract]);

  const getTreasuryMetrics = async () => {
    if (!state.contract || !provider) return null;
    
    return globalCache.get(
      'treasury_metrics',
      async () => {
        const cacheKey = 'treasury_metrics';
        const now = Math.floor(Date.now() / 1000);
        
        try {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            if (now - parsed.lastUpdate < 120) {
              setState(prev => ({ ...prev, treasuryMetrics: parsed }));
              return parsed;
            }
          }
    
          const [treasuryAddress, contractBalance] = await Promise.all([
            state.contract.treasury(),
            state.contract.getContractBalance()
          ]);
    
          const treasuryBalance = await provider.getBalance(treasuryAddress);
    
          let metrics = {
            address: treasuryAddress,
            balance: treasuryBalance.toString(),
            dailyCommissions: '0',
            dailyGrowth: 0,
            healthScore: calculateTreasuryHealth(treasuryBalance, contractBalance),
            lastUpdate: now
          };
    
          try {
            const currentBlock = await provider.getBlockNumber();
            const blocksIn24Hours = 43200;
            const fromBlock = Math.max(0, currentBlock - blocksIn24Hours);
    
            const commissionFilter = {
              address: CONTRACT_ADDRESS,
              topics: [ethers.id("CommissionPaid(address,uint256,uint256)")],
              fromBlock
            };
    
            // Use the chunking function for fetching logs
            const logs = await fetchLogsInChunks(commissionFilter);
            
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
    
            metrics = {
              ...metrics,
              dailyCommissions: dailyCommissions.toString(),
              dailyGrowth: calculateDailyGrowth(treasuryBalance, dailyCommissions.toString())
            };
          } catch (error) {
            console.warn('Error getting commission events, using fallback:', error);
            if (cachedData) {
              const parsed = JSON.parse(cachedData);
              metrics.dailyCommissions = parsed.dailyCommissions;
              metrics.dailyGrowth = parsed.dailyGrowth;
            }
          }
    
          sessionStorage.setItem(cacheKey, JSON.stringify(metrics));
          setState(prev => ({
            ...prev,
            treasuryMetrics: metrics,
            treasuryAddress
          }));
    
          return metrics;
        } catch (error) {
          console.error('Error in getTreasuryMetrics:', error);
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
    const ratio = Number(treasuryBalance) / Number(contractBalance);
    return Math.min(ratio * 100, 100);
  };

  const formatWithdrawDate = useCallback((timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    try {
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  const getPoolEvents = async () => {
    const rateLimiterKey = 'pool_events';
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      console.log("Rate limited, skipping pool events fetch");
      
      const cachedEvents = await globalCache.get('pool_events', null);
      if (cachedEvents) return cachedEvents;
      
      return { deposits: [], withdrawals: [] };
    }
    
    if (!state.contract || !provider) {
      console.error("getPoolEvents: Contract or provider not available.");
      return { deposits: [], withdrawals: [] };
    }

    const signerAddress = await getSignerAddress();
    if (!signerAddress) {
      console.error("getPoolEvents: Could not get signer address.");
      return { deposits: [], withdrawals: [] };
    }
    console.log(`getPoolEvents: Fetching events for user: ${signerAddress}`);

    if (!ABI || !ABI.abi || !Array.isArray(ABI.abi) || ABI.abi.length === 0) {
       console.error("Staking Contract ABI is empty or invalid in StakingContract.json. Cannot parse logs correctly.");
       return { deposits: [], withdrawals: [] };
    }

    try {
      const depositTopic = ethers.id("DepositMade(address,uint256,uint256,uint256,uint256)");
      const withdrawalTopic = ethers.id("WithdrawalMade(address,uint256,uint256)");
      const userTopic = ethers.zeroPadValue(signerAddress, 32);
      
      // Use the fetchLogsInChunks function to avoid block range errors
      const [depositLogs, withdrawalLogs] = await Promise.all([
        fetchLogsInChunks({
          address: CONTRACT_ADDRESS,
          topics: [depositTopic, userTopic],
          fromBlock: 0,
          toBlock: 'latest'
        }),
        fetchLogsInChunks({
          address: CONTRACT_ADDRESS,
          topics: [withdrawalTopic, userTopic],
          fromBlock: 0,
          toBlock: 'latest'
        })
      ]);

      console.log(`getPoolEvents: Found ${depositLogs.length} deposit logs and ${withdrawalLogs.length} withdrawal logs.`);

      const iface = new ethers.Interface(ABI.abi);

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
              timestamp: Number(parsed.args.timestamp || 0),
              commission: parsed.args.commission?.toString() || '0',
              depositId: parsed.args.depositId?.toString() || '0'
            }
          };
        } catch (error) {
          console.error('Error parsing deposit log:', log, error);
          return null;
        }
      }).filter(Boolean);

      const processedWithdrawals = await Promise.all(withdrawalLogs.map(async (log) => {
        try {
          const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
          if (!parsed || !parsed.args) return null;

          const block = await provider.getBlock(log.blockNumber);
          const blockTimestamp = block ? block.timestamp : Math.floor(Date.now() / 1000);

          return {
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            blockTimestamp: blockTimestamp,
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
        withdrawals: processedWithdrawals.filter(Boolean)
      };

      console.log("getPoolEvents: Processed events:", result);
      
      globalCache.set('pool_events', result, CACHE_CONFIG.POOL_EVENTS.ttl);
      
      return result;
    } catch (error) {
      console.error('Error in getPoolEvents:', error);
      return { deposits: [], withdrawals: [] };
    }
  };

  const contextValue = {
    state,
    setState,
    STAKING_CONSTANTS,
    deposit,
    withdrawRewards,
    withdrawAll,
    refreshUserInfo,
    getContractStatus,
    formatWithdrawDate,
    getPoolMetrics,
    getPoolEvents, // Make sure this is included correctly
    getTreasuryMetrics,
    getSignerAddress
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) return STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) return STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus;
  if (daysStaked >= STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) return STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus;
  return 0;
};

const CACHE_CONFIG = {
  CONTRACT_STATUS: { ttl: 60000 },
  POOL_METRICS: { ttl: 300000 },
  TREASURY_METRICS: { ttl: 120000 },
  USER_INFO: { ttl: 30000 },
  POOL_EVENTS: { ttl: 600000 }
};
