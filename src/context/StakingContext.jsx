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
  isPending: false
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

  // Initialize the contract
  useEffect(() => {
    if (!isInitialized || !provider || !CONTRACT_ADDRESS) return;

    const initializeContract = async () => {
      try {
        // Verify contract exists at address
        const code = await provider.getCode(CONTRACT_ADDRESS);
        if (code === '0x') {
          throw new Error('Contract not deployed at address');
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI.abi, provider);
        contract.provider = provider;
        
        setState(prev => ({ ...prev, contract }));

        // Initial status fetch
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
          // Use Promise.all for parallel execution
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

  // User info fetcher with rate limiting and caching
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
          // Use Promise.all for parallel execution
          const [userInfoResponse, depositsResponse] = await Promise.all([
            state.contract.getUserInfo(address),
            state.contract.getUserDeposits(address)
          ]);

          // Format deposits array
          const formattedDeposits = Array.isArray(depositsResponse) 
            ? depositsResponse.map(deposit => ({
                amount: ethers.formatEther(deposit.amount || '0'),
                timestamp: Number(deposit.timestamp || '0')
              }))
            : [];

          const now = Math.floor(Date.now() / 1000);
          
          // Calculate ROI progress for each deposit using contract data
          let totalProgress = 0;
          formattedDeposits.forEach(deposit => {
            const timeStaked = now - deposit.timestamp;
            const daysStaked = timeStaked / (24 * 3600);
            const dailyROI = STAKING_CONSTANTS.HOURLY_ROI * 24 * 100; // Convert to percentage
            const progress = Math.min(daysStaked * dailyROI, STAKING_CONSTANTS.MAX_ROI * 100);
            totalProgress += progress;
          });

          const roiProgress = formattedDeposits.length > 0 
            ? totalProgress / formattedDeposits.length 
            : 0;

          // Format user info using proper field names from contract
          const formattedUserInfo = {
            totalStaked: ethers.formatEther(userInfoResponse.totalDeposited || '0'),
            pendingRewards: ethers.formatEther(userInfoResponse.pendingRewards || '0'),
            lastWithdraw: Number(userInfoResponse.lastWithdraw || '0'),
            roiProgress: roiProgress,
            stakingDays: Math.floor((now - (formattedDeposits[0]?.timestamp || now)) / (24 * 3600))
          };

          // Update state with the accurate contract data
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

  // Deposit function
  const deposit = useCallback(async (amount) => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.deposit({
        value: amount,
        gasLimit: 300000
      });
      
      await tx.wait();
      
      // After deposit completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo]);

  // Withdraw rewards function
  const withdrawRewards = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdraw();
      await tx.wait();
      
      // After withdrawal completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo]);

  // Withdraw all function (principal + rewards)
  const withdrawAll = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.withdrawAll();
      await tx.wait();
      
      // After withdrawal completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
        await getContractStatus();
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo, getContractStatus]);

  // Emergency withdraw function
  const emergencyWithdraw = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isPending: true }));
      const contract = await getSignedContract();
      
      const tx = await contract.emergencyUserWithdraw();
      await tx.wait();
      
      // After emergency withdrawal completes, refresh user info
      const address = await getSignerAddress();
      if (address) {
        await refreshUserInfo(address);
        await getContractStatus();
      }
      
      setState(prev => ({ ...prev, isPending: false }));
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isPending: false }));
      throw error;
    }
  }, [getSignedContract, getSignerAddress, refreshUserInfo, getContractStatus]);

  // Get pool events function - enhanced with improved fetchLogsInChunks utility
  const getPoolEvents = useCallback(async (options = {}) => {
    if (!state.contract) {
      console.warn("Contract not initialized for getPoolEvents");
      return { deposits: [], withdrawals: [] };
    }
    const address = await getSignerAddress();
    if (!address) {
      console.warn("No wallet connected for getPoolEvents");
      return { deposits: [], withdrawals: [] };
    }
    
    const rateLimiterKey = `pool_events_${address}`;
    
    // Skip rate limiter if forced refresh
    if (!options.forceRefresh && !globalRateLimiter.canMakeCall(rateLimiterKey)) {
      const cachedEvents = globalCache.get(`pool_events_${address}`, null);
      if (cachedEvents) {
        console.log("Using cached pool events");
        return cachedEvents;
      }
      return { deposits: [], withdrawals: [] };
    }
    
    try {
      // Allow bypassing cache for forced refresh
      const cacheKey = `pool_events_${address}`;
      if (options.forceRefresh) {
        console.log("Forcing refresh of pool events, bypassing cache");
        globalCache.remove(cacheKey);
      }
      
      return await globalCache.get(
        cacheKey,
        async () => {
          console.log("Fetching contract transactions for deposits and withdrawals");
          try {
            const latestBlock = await provider.getBlockNumber();
            const fromBlock = Math.max(0, latestBlock - 30000);
            
            console.log(`Fetching events from block ${fromBlock} to ${latestBlock}`);
            
            // Define default event signatures - we'll use these if we can't find them in the ABI
            let depositTopic = ethers.id("DepositMade(address,uint256,uint256,uint256)");
            let withdrawalTopic = ethers.id("WithdrawalMade(address,uint256,uint256)");
            
            // Safely check the contract interface events
            try {
              if (state.contract && state.contract.interface && state.contract.interface.events) {
                // Debug: Output available events safely
                console.log("Contract has events dictionary:", 
                  Object.keys(state.contract.interface.events).length, 
                  "event types available"
                );
                
                // Try to find deposit and withdrawal events in the contract ABI
                for (const eventSig in state.contract.interface.events) {
                  const event = state.contract.interface.events[eventSig];
                  if (event && event.name) {
                    const eventName = event.name.toLowerCase();
                    if (eventName.includes('deposit')) {
                      console.log(`Found deposit event: ${event.name}`);
                      depositTopic = event.topicHash;
                    }
                    if (eventName.includes('withdraw')) {
                      console.log(`Found withdrawal event: ${event.name}`);
                      withdrawalTopic = event.topicHash;
                    }
                  }
                }
              } else {
                console.warn("Contract interface events not accessible, using default event signatures");
              }
            } catch (e) {
              console.error("Error accessing contract events:", e);
              // We'll use the default signatures defined above
            }
            
            // Format address for topics
            const encodedAddress = ethers.zeroPadValue(address, 32);
            
            console.log('Using event topics:', { 
              depositTopic, 
              withdrawalTopic, 
              encodedAddress, 
              contractAddress: CONTRACT_ADDRESS
            });
            
            // Fetch logs with error handling
            console.log("Fetching deposit logs...");
            let depositLogs = [];
            try {
              depositLogs = await fetchLogsInChunks(provider, {
                address: CONTRACT_ADDRESS,
                topics: [depositTopic, encodedAddress],
                fromBlock,
                toBlock: latestBlock,
                chunkSize: 250 
              });
              console.log(`Found ${depositLogs.length} deposit logs`);
            } catch (err) {
              console.error("Error fetching deposit logs:", err);
            }
            
            console.log("Fetching withdrawal logs...");
            let withdrawalLogs = [];
            try {
              withdrawalLogs = await fetchLogsInChunks(provider, {
                address: CONTRACT_ADDRESS,
                topics: [withdrawalTopic, encodedAddress],
                fromBlock,
                toBlock: latestBlock,
                chunkSize: 250
              });
              console.log(`Found ${withdrawalLogs.length} withdrawal logs`);
            } catch (err) {
              console.error("Error fetching withdrawal logs:", err);
            }
            
            // Process deposit logs with defensive coding
            const deposits = [];
            for (const log of depositLogs) {
              try {
                // Try to parse using interface if available
                let parsed;
                if (state.contract && state.contract.interface) {
                  parsed = state.contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                  });
                }
                
                // If parsing failed, create a simple object with the basics
                if (!parsed) {
                  console.log("Could not parse deposit log, using raw data");
                  parsed = {
                    args: {
                      user: address,
                      amount: log.data ? ethers.toBeHex(log.data) : '0',
                      timestamp: Math.floor(Date.now() / 1000) - 86400,
                      commission: '0'
                    }
                  };
                }
                
                deposits.push({
                  transactionHash: log.transactionHash || `deposit-${Date.now()}-${Math.random()}`,
                  blockNumber: log.blockNumber || 0,
                  args: parsed.args,
                  blockTimestamp: null // Will be filled later
                });
              } catch (err) {
                console.error("Failed to process deposit log:", err);
              }
            }
            
            // Process withdrawal logs with defensive coding
            const withdrawals = [];
            for (const log of withdrawalLogs) {
              try {
                // Try to parse using interface if available
                let parsed;
                if (state.contract && state.contract.interface) {
                  parsed = state.contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data
                  });
                }
                
                // If parsing failed, create a simple object with the basics
                if (!parsed) {
                  console.log("Could not parse withdrawal log, using raw data");
                  parsed = {
                    args: {
                      user: address,
                      amount: log.data ? ethers.toBeHex(log.data) : '0',
                      commission: '0'
                    }
                  };
                }
                
                withdrawals.push({
                  transactionHash: log.transactionHash || `withdrawal-${Date.now()}-${Math.random()}`,
                  blockNumber: log.blockNumber || 0,
                  args: parsed.args,
                  blockTimestamp: null // Will be filled later
                });
              } catch (err) {
                console.error("Failed to process withdrawal log:", err);
              }
            }
            
            console.log(`Successfully processed ${deposits.length} deposits and ${withdrawals.length} withdrawals`);
            
            // Get timestamps for all events
            const allLogs = [...deposits, ...withdrawals];
            const uniqueBlockNumbers = [...new Set(
              allLogs
                .filter(e => e.blockNumber && e.blockNumber > 0)
                .map(e => e.blockNumber)
            )];
            
            if (uniqueBlockNumbers.length > 0) {
              // Fetch blocks in smaller batches to avoid timeouts
              const batchSize = 20;
              const blockMap = {};
              
              for (let i = 0; i < uniqueBlockNumbers.length; i += batchSize) {
                const batch = uniqueBlockNumbers.slice(i, i + batchSize);
                try {
                  const blocks = await Promise.all(
                    batch.map(bn => provider.getBlock(bn).catch(() => null))
                  );
                  blocks.forEach(b => {
                    if (b) blockMap[b.number] = b;
                  });
                } catch (e) {
                  console.warn("Error fetching blocks batch:", e);
                }
                
                // Small delay between batches
                if (i + batchSize < uniqueBlockNumbers.length) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }
              
              // Add timestamps to all events
              for (const deposit of deposits) {
                if (!deposit.blockTimestamp) {
                  deposit.blockTimestamp = 
                    blockMap[deposit.blockNumber]?.timestamp || 
                    Math.floor(Date.now() / 1000) - 86400;
                }
              }
              
              for (const withdrawal of withdrawals) {
                if (!withdrawal.blockTimestamp) {
                  withdrawal.blockTimestamp = 
                    blockMap[withdrawal.blockNumber]?.timestamp || 
                    Math.floor(Date.now() / 1000) - 3600;
                }
              }
            }
            
            // Check if we found any real events
            if (deposits.length > 0 || withdrawals.length > 0) {
              console.log("Successfully retrieved blockchain events");
              return { deposits, withdrawals, source: 'blockchain' };
            }
            
            // If we get here, we couldn't find any events via logs or direct contract calls
            throw new Error("No events found for this address");
            
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
  }, [state.contract, provider, CONTRACT_ADDRESS, state.userDeposits, state.userInfo, getSignerAddress]);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Context value
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
    getPoolEvents,
    calculateRealAPY,
    emergencyWithdraw,
    calculateUserRewards,
    getUserTotalDeposit
  };

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

// Helper function to calculate time bonus - renamed to avoid conflict
export const calculateTimeBonus = (stakingTime) => {
  const daysStaked = Math.floor(stakingTime / (24 * 3600));
  return calculateTimeBonusFromUtils(daysStaked, STAKING_CONSTANTS.TIME_BONUSES);
};
