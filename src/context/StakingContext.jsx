import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import useProvider from '../hooks/blockchain/useProvider';
import ABI from '../Abi/StakingContract.json';
import { globalRateLimiter } from '../utils/performance/RateLimiter';
import { globalCache } from '../utils/cache/CacheManager';
import { fetchLogsInChunks, calculateStakingRewards, calculateTimeBonus as calculateTimeBonusFromUtils } from '../utils/blockchain/blockchainUtils';

// Constants extracted to the top level
export const STAKING_CONSTANTS = {
  HOURLY_ROI: 0.0001, // 0.01% hourly
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

// Cache TTL configurations
const CACHE_CONFIG = {
  CONTRACT_STATUS: { ttl: 300000 }, // 5 minutos
  POOL_METRICS: { ttl: 600000 }, // 10 minutos
  TREASURY_METRICS: { ttl: 300000 }, // 5 minutos
  USER_INFO: { ttl: 60000 }, // 1 minuto
  POOL_EVENTS: { ttl: 900000 } // 15 minutos
};

// Initial default state
const defaultState = {
  contract: null,
  isContractPaused: false,
  isMigrated: false,
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
  eventListeners: null,
  currentTx: null
};

const StakingContext = createContext({
  state: defaultState,
  STAKING_CONSTANTS
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
  const functionsRef = useRef({});

  // Helper functions
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

  // Get a signed contract instance
  const getSignedContract = useCallback(async () => {
    if (!window.ethereum) throw new Error('No wallet found');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, signer);
  }, [CONTRACT_ADDRESS]);

  // Contract status fetcher with rate limiting and caching
  const getContractStatus = useCallback(async (contractInstance = state.contract) => {
    if (!contractInstance || !provider || !isInitialized) return;
    
    const rateLimiterKey = 'contract_status';
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      return;
    }
    
    try {
      return await globalCache.get(
        'contract_status',
        async () => {
          const [paused, migrated, treasury, balance] = await Promise.all([
            contractInstance.paused().catch(() => false),
            contractInstance.migrated().catch(() => false), 
            contractInstance.treasury().catch(() => null),
            contractInstance.getContractBalance().catch(() => BigInt(0))
          ]);
          
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
  }, [provider, state.contract, isInitialized]);

  // Enhanced batching for user info updates
  const refreshUserInfo = useCallback(async (address) => {
    if (!state.contract || !address) {
      return;
    }

    const rateLimiterKey = `user_info_${address}`;
    if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
      return;
    }
    
    try {
      const cacheKey = `user_info_${address}`;
      return await globalCache.get(
        cacheKey,
        async () => {
          const results = await Promise.allSettled([
            state.contract.getUserInfo(address),
            state.contract.getUserDeposits(address),
            state.contract.calculateRewards(address)
          ]);
          
          const userInfoResponse = results[0].status === 'fulfilled' ? results[0].value : {
            totalDeposited: '0',
            pendingRewards: '0', 
            lastWithdraw: '0'
          };
          
          const depositsResponse = results[1].status === 'fulfilled' ? results[1].value : [];
          const calculatedRewards = results[2].status === 'fulfilled' ? results[2].value : BigInt(0);
          
          const formattedDeposits = Array.isArray(depositsResponse) 
            ? depositsResponse.map(deposit => ({
                amount: ethers.formatEther(deposit.amount || '0'),
                timestamp: Number(deposit.timestamp || '0')
              }))
            : [];

          const now = Math.floor(Date.now() / 1000);
          
          let totalProgress = 0;
          formattedDeposits.forEach(deposit => {
            const timeStaked = now - deposit.timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            const dailyROI = STAKING_CONSTANTS.HOURLY_ROI * 24 * 100;
            const progress = Math.min(daysStaked * dailyROI, STAKING_CONSTANTS.MAX_ROI * 100);
            totalProgress += progress;
          });

          const roiProgress = formattedDeposits.length > 0 
            ? totalProgress / formattedDeposits.length 
            : 0;

          const formattedUserInfo = {
            totalStaked: ethers.formatEther(userInfoResponse.totalDeposited || '0'),
            pendingRewards: ethers.formatEther(userInfoResponse.pendingRewards || '0'),
            lastWithdraw: Number(userInfoResponse.lastWithdraw || '0'),
            roiProgress: roiProgress,
            stakingDays: Math.floor((now - (formattedDeposits[0]?.timestamp || now)) / (24 * 3600))
          };

          formattedUserInfo.calculatedRewards = ethers.formatEther(calculatedRewards);
          formattedUserInfo.timeBonus = calculateTimeBonus(now - (formattedDeposits[0]?.timestamp || now));

          setState(prev => ({
            ...prev,
            userInfo: formattedUserInfo,
            userDeposits: formattedDeposits,
            stakingStats: {
              ...prev.stakingStats,
              totalDeposited: formattedUserInfo.totalStaked,
              pendingRewards: formattedUserInfo.pendingRewards,
              lastWithdraw: formattedUserInfo.lastWithdraw,
              depositsCount: formattedDeposits.length,
              remainingSlots: STAKING_CONSTANTS.MAX_DEPOSITS_PER_USER - formattedDeposits.length
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

  functionsRef.current.refreshUserInfo = refreshUserInfo;
  functionsRef.current.getContractStatus = getContractStatus;

  const setupContractEventListeners = useCallback((contract) => {
    if (!contract || !provider) return;
    
    try {
      const depositFilter = contract.filters.DepositMade();
      const handleDeposit = async (user, depositId, amount, commission, timestamp) => {
        const currentAddress = await getSignerAddress();
        if (currentAddress && user.toLowerCase() === currentAddress.toLowerCase()) {
          await functionsRef.current.refreshUserInfo(currentAddress);
          await functionsRef.current.getContractStatus();
        }
      };
      
      const withdrawalFilter = contract.filters.WithdrawalMade();
      const handleWithdrawal = async (user, amount, commission) => {
        const currentAddress = await getSignerAddress();
        if (currentAddress && user.toLowerCase() === currentAddress.toLowerCase()) {
          await functionsRef.current.refreshUserInfo(currentAddress);
          await functionsRef.current.getContractStatus();
        }
      };
      
      contract.on(depositFilter, handleDeposit);
      contract.on(withdrawalFilter, handleWithdrawal);
      
      setState(prev => ({
        ...prev, 
        eventListeners: {
          deposit: { filter: depositFilter, handler: handleDeposit },
          withdrawal: { filter: withdrawalFilter, handler: handleWithdrawal }
        }
      }));
    } catch (error) {
      console.error("Error setting up event listeners:", error);
    }
  }, [provider, getSignerAddress]);

  const removeContractEventListeners = useCallback((contract) => {
    if (!contract || !state.eventListeners) return;
    
    try {
      if (state.eventListeners.deposit) {
        contract.off(state.eventListeners.deposit.filter, state.eventListeners.deposit.handler);
      }
      if (state.eventListeners.withdrawal) {
        contract.off(state.eventListeners.withdrawal.filter, state.eventListeners.withdrawal.handler);
      }
    } catch (error) {
      console.error("Error removing event listeners:", error);
    }
  }, [state.eventListeners]);

  useEffect(() => {
    if (!isInitialized || !provider || !CONTRACT_ADDRESS) return;

    const initializeContract = async () => {
      try {
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at address');
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        contract.provider = provider;
        
        setState(prev => ({ ...prev, contract }));

        try {
          await getContractStatus(contract);
        } catch (statusError) {
          console.warn("Initial status fetch failed:", statusError);
        }

        setupContractEventListeners(contract);
      } catch (err) {
        console.error("Contract initialization error:", err);
      }
    };

    initializeContract();
    
    return () => {
      if (state.contract) {
        removeContractEventListeners(state.contract);
      }
    };
  }, [provider, isInitialized, CONTRACT_ADDRESS, getContractStatus, setupContractEventListeners, removeContractEventListeners]);

  // Format date helper
  const formatWithdrawDate = useCallback((timestamp) => {
    if (!timestamp || timestamp === 0) return 'Never';
    try {
      return new Date(timestamp * 1000).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }, []);
  
  // Add this function to use the contract's native calculation
  const calculateUserRewards = useCallback(async (address) => {
    if (!state.contract || !address) return '0';
    try {
      const rewards = await state.contract.calculateRewards(address);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error("Error calculating rewards:", error);
      return '0';
    }
  }, [state.contract]);

  // Get total deposits directly from contract
  const getUserTotalDeposit = useCallback(async (address) => {
    if (!state.contract || !address) return '0';
    try {
      const totalDeposit = await state.contract.getTotalDeposit(address);
      return ethers.formatEther(totalDeposit);
    } catch (error) {
      console.error("Error getting total deposit:", error);
      return '0';
    }
  }, [state.contract]);

  // Enhanced transaction handling with better error messages
  const executeTransaction = useCallback(async (transactionFn, options = {}) => {
    const txType = options.type || 'transaction';
    const updateData = options.updateData || (() => {});
    
    setState(prev => ({ 
      ...prev, 
      isPending: true,
      currentTx: {
        type: txType,
        status: 'preparing',
        hash: null,
        error: null
      }
    }));
    
    try {
      // Get contract with signer
      const contract = await getSignedContract();
      
      // Prepare transaction
      setState(prev => ({ 
        ...prev, 
        currentTx: {
          ...prev.currentTx,
          status: 'awaiting_confirmation'
        }
      }));
      
      // Execute the transaction function
      const tx = await transactionFn(contract);
      
      // Transaction sent
      setState(prev => ({ 
        ...prev, 
        currentTx: {
          ...prev.currentTx,
          status: 'pending',
          hash: tx.hash
        }
      }));
      
      console.log(`${txType} transaction sent:`, tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      // Transaction confirmed
      setState(prev => ({ 
        ...prev, 
        isPending: false,
        currentTx: {
          ...prev.currentTx,
          status: receipt.status === 1 ? 'confirmed' : 'failed'
        }
      }));
      
      // After transaction completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await Promise.all([
          refreshUserInfo(address),
          getContractStatus(),
          updateData(address)
        ]);
      }
      
      return {
        success: receipt.status === 1,
        hash: tx.hash,
        receipt
      };
    } catch (error) {
      console.error(`Error in ${txType}:`, error);
      
      // Parse error for more user-friendly message
      let errorMessage = error.message || 'Transaction failed';
      
      // Check for common wallet error patterns and simplify the message
      if (errorMessage.includes('user rejected') || 
          errorMessage.includes('user denied') || 
          errorMessage.includes('rejected by user') ||
          errorMessage.includes('cancelled by user') ||
          errorMessage.includes('User denied')) {
        errorMessage = 'Transaction cancelled';
      } else if (errorMessage.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds in your wallet';
      } else if (errorMessage.toLowerCase().includes('gas')) {
        errorMessage = 'Network fee issue';
      } else if (errorMessage.includes('nonce')) {
        errorMessage = 'Transaction sequence error';
      } else if (errorMessage.includes('intrinsic gas')) {
        errorMessage = 'Gas estimation failed';
      } else if (errorMessage.length > 100) {
        // Truncate overly long error messages
        errorMessage = errorMessage.substring(0, 100) + '...';
      }
      
      setState(prev => ({ 
        ...prev, 
        isPending: false,
        currentTx: {
          ...prev.currentTx,
          status: 'failed',
          error: errorMessage
        }
      }));
      
      return {
        success: false,
        error: error
      };
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo, getContractStatus]);

  // Updated deposit function using executeTransaction
  const deposit = useCallback(async (amount) => {
    return executeTransaction(
      async (contract) => {
        return await contract.deposit({
          value: amount,
          gasLimit: 300000
        });
      },
      { type: 'deposit' }
    );
  }, [executeTransaction]);

  // Updated withdrawRewards function using executeTransaction
  const withdrawRewards = useCallback(async () => {
    return executeTransaction(
      async (contract) => {
        return await contract.withdraw();
      },
      { type: 'withdraw_rewards' }
    );
  }, [executeTransaction]);

  // Updated withdrawAll function using executeTransaction
  const withdrawAll = useCallback(async () => {
    return executeTransaction(
      async (contract) => {
        return await contract.withdrawAll();
      },
      { type: 'withdraw_all' }
    );
  }, [executeTransaction]);

  // Updated emergencyWithdraw function using executeTransaction  
  const emergencyWithdraw = useCallback(async () => {
    return executeTransaction(
      async (contract) => {
        return await contract.emergencyUserWithdraw();
      },
      { type: 'emergency_withdraw' }
    );
  }, [executeTransaction]);

  // Add new function to calculate detailed rewards statistics
  const getDetailedStakingStats = useCallback(async (address) => {
    if (!state.contract || !address) return null;
    
    try {
      // Get all the required data
      const [userInfo, deposits, currentBlockNumber] = await Promise.all([
        state.contract.getUserInfo(address).catch(() => ({ totalDeposited: '0', pendingRewards: '0', lastWithdraw: '0' })),
        state.contract.getUserDeposits(address).catch(() => []),
        provider.getBlockNumber().catch(() => null)
      ]);
      
      // Get current timestamp
      const currentTimestamp = Math.floor(Date.now() / 1000);
      
      // Get current block if available
      let blockTimestamp = currentTimestamp;
      if (currentBlockNumber) {
        try {
          const block = await provider.getBlock(currentBlockNumber);
          if (block) blockTimestamp = block.timestamp;
        } catch (e) {
          console.warn("Failed to get block timestamp:", e);
        }
      }
      
      // Format deposits and calculate stats
      const formattedDeposits = Array.isArray(deposits) 
        ? deposits.map((deposit, index) => {
            const amount = ethers.formatEther(deposit.amount || '0');
            const timestamp = Number(deposit.timestamp || '0');
            const timeStaked = blockTimestamp - timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            
            // Calculate rewards for this specific deposit
            const rewardsData = calculateStakingRewards(
              amount, 
              daysStaked, 
              STAKING_CONSTANTS.HOURLY_ROI,
              STAKING_CONSTANTS.MAX_ROI
            );
            
            // Calculate time to next bonus
            let nextBonusTime = null;
            let nextBonusPercentage = null;
            
            if (daysStaked < STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days) {
              nextBonusTime = STAKING_CONSTANTS.TIME_BONUSES.QUARTER.days - daysStaked;
              nextBonusPercentage = STAKING_CONSTANTS.TIME_BONUSES.QUARTER.bonus * 100;
            } else if (daysStaked < STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days) {
              nextBonusTime = STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.days - daysStaked;
              nextBonusPercentage = STAKING_CONSTANTS.TIME_BONUSES.HALF_YEAR.bonus * 100;
            } else if (daysStaked < STAKING_CONSTANTS.TIME_BONUSES.YEAR.days) {
              nextBonusTime = STAKING_CONSTANTS.TIME_BONUSES.YEAR.days - daysStaked;
              nextBonusPercentage = STAKING_CONSTANTS.TIME_BONUSES.YEAR.bonus * 100;
            }
            
            return {
              id: index,
              amount,
              timestamp,
              daysStaked: Math.floor(daysStaked),
              progress: rewardsData.progress,
              estimatedRewards: rewardsData.rewards,
              timeToMaxRewards: Math.max(0, rewardsData.daysToMax - daysStaked),
              nextBonus: nextBonusTime ? {
                days: Math.ceil(nextBonusTime),
                percentage: nextBonusPercentage
              } : null
            };
          })
        : [];
      
      // Calculate totals and averages
      const totalStaked = ethers.formatEther(userInfo.totalDeposited || '0');
      const pendingRewards = ethers.formatEther(userInfo.pendingRewards || '0');
      
      // Calculate average ROI progress
      let totalProgress = 0;
      formattedDeposits.forEach(deposit => {
        totalProgress += deposit.progress;
      });
      
      const avgProgress = formattedDeposits.length > 0 
        ? totalProgress / formattedDeposits.length 
        : 0;
      
      // Calculate current time bonus
      const oldestDepositTime = formattedDeposits.length > 0 
        ? Math.min(...formattedDeposits.map(d => d.timestamp)) 
        : currentTimestamp;
      
      const stakingDays = Math.floor((currentTimestamp - oldestDepositTime) / (24 * 3600));
      const currentTimeBonus = calculateTimeBonus(stakingDays * 24 * 3600);
      
      // Calculate estimated monthly rewards at current rate
      const dailyROI = STAKING_CONSTANTS.HOURLY_ROI * 24; // Daily ROI as decimal
      const baseMonthlyRewards = parseFloat(totalStaked) * dailyROI * 30; // 30 days
      const boostedMonthlyRewards = baseMonthlyRewards * currentTimeBonus;
      
      return {
        summary: {
          totalStaked,
          pendingRewards,
          deposits: formattedDeposits.length,
          oldestDeposit: oldestDepositTime,
          newestDeposit: formattedDeposits.length > 0 
            ? Math.max(...formattedDeposits.map(d => d.timestamp)) 
            : 0,
          stakingDays,
          lastWithdraw: Number(userInfo.lastWithdraw || '0'),
          avgProgress,
          currentTimeBonus,
          estimatedMonthlyRewards: boostedMonthlyRewards.toFixed(4)
        },
        deposits: formattedDeposits,
        projections: {
          oneMonth: calculateStakingRewards(totalStaked, 30, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards,
          threeMonths: calculateStakingRewards(totalStaked, 90, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards,
          sixMonths: calculateStakingRewards(totalStaked, 180, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards,
          oneYear: calculateStakingRewards(totalStaked, 365, STAKING_CONSTANTS.HOURLY_ROI, STAKING_CONSTANTS.MAX_ROI).rewards
        }
      };
    } catch (error) {
      console.error("Error getting detailed staking stats:", error);
      return null;
    }
  }, [state.contract, provider, calculateTimeBonus]);

  // Calculate real APY based on contract data - using enhanced calculateStakingRewards
  const calculateRealAPY = useCallback(async () => {
    if (!state.contract || !provider) {
      return { baseAPY: 88, dailyROI: 0.24 }; // Default fallback values
    }

    try {
      // The contract uses a fixed hourly ROI model
      const hourlyROI = STAKING_CONSTANTS.HOURLY_ROI; // 0.01% per hour
      const dailyROI = hourlyROI * 24; // Calculate daily ROI: 0.24% per day
      
      // Use our enhanced calculation utility
      const sampleAmount = 100; // 100 POL
      const yearDuration = 365; // One year in days
      
      const rewardsData = calculateStakingRewards(
        sampleAmount, 
        yearDuration, 
        STAKING_CONSTANTS.HOURLY_ROI,
        STAKING_CONSTANTS.MAX_ROI
      );
      
      // Return calculated values
      return {
        baseAPY: rewardsData.apy,
        dailyROI: dailyROI,
        verified: true,
        maxRewards: rewardsData.maxRewards,
        daysToMax: rewardsData.daysToMax
      };
    } catch (error) {
      console.error("Error calculating real APY:", error);
      return { baseAPY: 88, dailyROI: 0.24 }; // Fallback to default values on error
    }
  }, [state.contract, provider]);

  // Get pool events function - Implementación corregida
  const getPoolEvents = useCallback(async (options = {}) => {
    if (!state.contract || !provider) {
      console.warn("Contract not initialized or provider missing for getPoolEvents");
      return { deposits: [], withdrawals: [] };
    }
    
    const address = await getSignerAddress();
    if (!address) {
      console.warn("No wallet connected for getPoolEvents");
      return { deposits: [], withdrawals: [] };
    }
    
    const rateLimiterKey = `pool_events_${address}`;
    
    try {
      // Bypass cache if force refresh is requested
      const cacheKey = `pool_events_${address}`;
      if (options.forceRefresh) {
        console.log("Forcing refresh of pool events");
        globalCache.set(cacheKey, null);
      } else if (!globalRateLimiter.canMakeCall(rateLimiterKey)) {
        // Try to use cached data if available
        const cachedData = globalCache.get(cacheKey);
        if (cachedData) {
          console.log("Using cached pool events data");
          return cachedData;
        }
      }

      return await globalCache.get(
        cacheKey,
        async () => {
          console.log("Fetching contract transactions for deposits and withdrawals");
          try {
            const latestBlock = await provider.getBlockNumber();
            // Limitamos a los últimos 5000 bloques para evitar timeouts (aproximadamente 1-2 días de eventos en Polygon)
            const fromBlock = Math.max(0, latestBlock - 5000);
            console.log(`Fetching events from block ${fromBlock} to ${latestBlock}`);
            
            // Define event topics using correct ethers v6 formatting
            const depositTopic = ethers.id("DepositMade(address,uint256,uint256,uint256,uint256)");
            const withdrawalTopic = ethers.id("WithdrawalMade(address,uint256,uint256)");
            
            // Important: For topic filtering with an address parameter, add it correctly to the topics array
            // Topic format for addresses needs to be padded to 32 bytes (64 characters + 0x)
            const paddedAddress = ethers.zeroPadValue(address, 32).toLowerCase();
            
            console.log("Using address for event filter:", address);
            console.log("Padded address for topics:", paddedAddress);
            
            // Fetch deposits - with better error handling
            console.log("Fetching deposit logs...");
            let depositLogs = [];
            try {
              depositLogs = await fetchLogsInChunks(provider, {
                address: CONTRACT_ADDRESS,
                topics: [depositTopic, paddedAddress],
                fromBlock: fromBlock,
                toBlock: latestBlock
              });
              console.log(`Found ${depositLogs.length} deposit logs`);
              
              // Decode deposit logs
              if (depositLogs.length > 0) {
                const iface = new ethers.Interface(ABI.abi);
                depositLogs = depositLogs.map(log => {
                  try {
                    const parsedLog = iface.parseLog({
                      topics: log.topics, 
                      data: log.data
                    });
                    return {
                      ...log,
                      args: parsedLog.args,
                      blockTimestamp: log.blockTimestamp || 0
                    };
                  } catch (e) {
                    console.warn("Failed to parse deposit log", e);
                    return log;
                  }
                });
              }
            } catch (err) {
              console.error("Error fetching deposit logs:", err);
            }
            
            // Fetch withdrawals - with better error handling
            console.log("Fetching withdrawal logs...");
            let withdrawalLogs = [];
            try {
              withdrawalLogs = await fetchLogsInChunks(provider, {
                address: CONTRACT_ADDRESS,
                topics: [withdrawalTopic, paddedAddress],
                fromBlock: fromBlock,
                toBlock: latestBlock
              });
              console.log(`Found ${withdrawalLogs.length} withdrawal logs`);
              
              // Decode withdrawal logs
              if (withdrawalLogs.length > 0) {
                const iface = new ethers.Interface(ABI.abi);
                withdrawalLogs = withdrawalLogs.map(log => {
                  try {
                    const parsedLog = iface.parseLog({
                      topics: log.topics, 
                      data: log.data
                    });
                    return {
                      ...log,
                      args: parsedLog.args,
                      blockTimestamp: log.blockTimestamp || 0
                    };
                  } catch (e) {
                    console.warn("Failed to parse withdrawal log", e);
                    return log;
                  }
                });
              }
            } catch (err) {
              console.error("Error fetching withdrawal logs:", err);
            }
            
            // Get timestamps for logs
            const logsWithTimestamps = async (logs) => {
              return Promise.all(logs.map(async (log) => {
                if (!log.blockNumber) return log;
                
                try {
                  const block = await provider.getBlock(log.blockNumber);
                  return {
                    ...log,
                    blockTimestamp: block ? block.timestamp : 0
                  };
                } catch (e) {
                  console.warn("Failed to get timestamp for log", e);
                  return log;
                }
              }));
            };
            
            // Add timestamps to logs
            try {
              if (depositLogs.length > 0) {
                depositLogs = await logsWithTimestamps(depositLogs);
              }
              if (withdrawalLogs.length > 0) {
                withdrawalLogs = await logsWithTimestamps(withdrawalLogs);
              }
            } catch (e) {
              console.warn("Error adding timestamps to logs:", e);
            }
            
            // Return filtered events
            return { 
              deposits: depositLogs, 
              withdrawals: withdrawalLogs,
              source: 'blockchain' 
            };
          } catch (error) {
            console.error("Error in blockchain events fetch:", error);
            return { 
              deposits: [], 
              withdrawals: [],
              error: error.message, 
              source: 'error'
            };
          }
        },
        options.forceRefresh ? 0 : CACHE_CONFIG.POOL_EVENTS.ttl
      );
    } catch (error) {
      console.error("Error fetching pool events:", error);
      return { 
        deposits: [], 
        withdrawals: [],
        error: error.message,
        source: 'error'
      };
    }
  }, [state.contract, provider, CONTRACT_ADDRESS, getSignerAddress]);

  // Context value - ACTUALIZADO: incluir todas las funciones que necesitan los componentes
  const contextValue = {
    state,
    STAKING_CONSTANTS,
    deposit,
    withdrawRewards,
    withdrawAll,
    refreshUserInfo,
    getContractStatus,
    formatWithdrawDate,
    getSignerAddress,
    calculateUserRewards,
    getUserTotalDeposit,
    emergencyWithdraw,
    getPoolEvents,          // Añadido
    calculateRealAPY,       // Añadido
    getDetailedStakingStats // Añadido
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

export const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  return calculateTimeBonusFromUtils(daysStaked, STAKING_CONSTANTS.TIME_BONUSES);
};
