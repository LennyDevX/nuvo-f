import React, { useEffect, useState, useContext, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaHistory, FaExternalLinkAlt, FaExclamationCircle, FaCoins, FaMoneyBillWave, FaShoppingCart, FaImage, FaExchangeAlt, FaArrowRight, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import { useStaking } from '../../../../context/StakingContext';
import { WalletContext } from '../../../../context/WalletContext';
import { ethers } from 'ethers';

const formatDate = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  
  const day = String(date.getDate()).padStart(2, '0');
  
  const year = date.getFullYear();
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${month} ${day}, ${year} ${hours}:${minutes}`;
};

const getTransactionStyles = (type) => {
  const styles = {
    'Stake Deposit': { icon: <FaCoins />, color: 'text-blue-400', bgColor: 'bg-blue-400' },
    'Stake Withdraw': { icon: <FaArrowLeft />, color: 'text-red-400', bgColor: 'bg-red-400' },
    'Claim Rewards': { icon: <FaMoneyBillWave />, color: 'text-green-400', bgColor: 'bg-green-400' },
    'NFT Purchase': { icon: <FaShoppingCart />, color: 'text-purple-400', bgColor: 'bg-purple-400' },
    'NFT Sale': { icon: <FaShoppingCart />, color: 'text-amber-400', bgColor: 'bg-amber-400' },
    'NFT Mint': { icon: <FaImage />, color: 'text-indigo-400', bgColor: 'bg-indigo-400' },
    'Asset Tokenization': { icon: <FaImage />, color: 'text-fuchsia-400', bgColor: 'bg-fuchsia-400' },
    'Token Purchase': { icon: <FaCoins />, color: 'text-cyan-400', bgColor: 'bg-cyan-400' },
    'Token Swap': { icon: <FaExchangeAlt />, color: 'text-amber-400', bgColor: 'bg-amber-400' },
    'Token Transfer': { icon: <FaArrowRight />, color: 'text-violet-400', bgColor: 'bg-violet-400' },
    'Token Receive': { icon: <FaArrowLeft />, color: 'text-emerald-400', bgColor: 'bg-emerald-400' },
    'default': { icon: <FaInfoCircle />, color: 'text-gray-400', bgColor: 'bg-gray-400' }
  };
  
  return styles[type] || styles['default'];
};

const formatAmount = (amount, asset) => {
  if (!amount) return '-';
  
  const formattedAmount = parseFloat(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  });
  
  return `${formattedAmount} ${asset || ''}`;
};

const TransactionsSection = () => {
  const { state, getPoolEvents } = useStaking();
  const { account } = useContext(WalletContext);
  const [stakingTransactions, setStakingTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_ADDRESS;
  const [rawEvents, setRawEvents] = useState(null);

  const processEvent = useCallback((event, type) => {
    if (!event || !event.args) {
      console.warn("Invalid event data:", event);
      return null;
    }

    try {
      let transactionHash = event.transactionHash;
      const isValidHash = typeof transactionHash === 'string' && transactionHash.startsWith('0x') && transactionHash.length === 66;

      if (!isValidHash) {
          console.warn(`Invalid or missing transaction hash for event type ${type}. Using placeholder. Hash received:`, transactionHash);
          transactionHash = `placeholder-${type}-${event.blockNumber}-${Math.random().toString(16).substring(2)}`;
      }

      const baseTransaction = {
        id: `${type.toLowerCase()}-${transactionHash}`,
        hash: transactionHash,
        type: type,
        status: 'Completed',
        blockNumber: event.blockNumber,
        isPlaceholder: !isValidHash
      };

      switch (type) {
        case 'Stake Deposit':
          return {
            ...baseTransaction,
            amount: ethers.formatEther(event.args.amount || '0'),
            asset: 'POL',
            timestamp: Number(event.args.timestamp || 0),
            description: 'Deposit to Smart Staking pool',
            commission: ethers.formatEther(event.args.commission || '0'),
          };
        case 'Claim Rewards':
          return {
            ...baseTransaction,
            amount: ethers.formatEther(event.args.amount || '0'),
            asset: 'POL',
            timestamp: Number(event.blockTimestamp || 0),
            description: 'Claimed rewards from Smart Staking',
            commission: ethers.formatEther(event.args.commission || '0'),
          };
        default:
          console.warn("Unknown event type in processEvent:", type);
          return {
              ...baseTransaction,
              amount: '0',
              asset: 'POL',
              timestamp: Number(event.args?.timestamp || event.blockTimestamp || 0),
              description: `Unknown Event: ${type}`,
              commission: '0'
          };
      }
    } catch (err) {
      console.error("Error processing event:", err, event);
      return null;
    }
  }, []);

  const fetchTransactionEvents = useCallback(async () => {
    if (!account) return [];
    setError(null);
    
    try {
      console.log("Fetching transaction events for account:", account);
      
      const events = await getPoolEvents();
      console.log("Raw events received in TransactionsSection:", events);
      setRawEvents(events);
      
      if (!events || (!events.deposits && !events.withdrawals)) {
        console.warn("No events data returned from getPoolEvents");
        return [];
      }
      
      const depositsArray = Array.isArray(events.deposits) ? events.deposits : [];
      const withdrawalsArray = Array.isArray(events.withdrawals) ? events.withdrawals : [];
      
      console.log("Raw events data:", { deposits: depositsArray, withdrawals: withdrawalsArray });
      
      const userDeposits = depositsArray
        .filter(event => 
          event.args?.user && 
          event.args.user.toLowerCase() === account.toLowerCase()
        )
        .map(event => {
          const processed = processEvent(
            event, 
            'Stake Deposit'
          );
          
          console.log("Processed deposit:", processed);
          return processed;
        })
        .filter(Boolean);
      
      const userWithdrawals = withdrawalsArray
        .filter(event => 
          event.args?.user && 
          event.args.user.toLowerCase() === account.toLowerCase()
        )
        .map(event => {
          const processed = processEvent(
            event, 
            'Claim Rewards'
          );
          
          console.log("Processed withdrawal:", processed);
          return processed;
        })
        .filter(Boolean);
      
      const allTransactions = [...userDeposits, ...userWithdrawals];
      console.log("All processed transactions:", allTransactions);
      
      return allTransactions;
    } catch (error) {
      console.error("Error fetching transaction events:", error);
      setError("Failed to fetch transactions: " + error.message);
      return [];
    }
  }, [account, getPoolEvents, processEvent]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const eventTransactions = await fetchTransactionEvents();
        
        if (eventTransactions && eventTransactions.length > 0) {
          console.log("Using real blockchain transactions:", eventTransactions);
          
          eventTransactions.sort((a, b) => b.timestamp - a.timestamp);
          setStakingTransactions(eventTransactions);
        } else {
          console.log("No real transactions found, using example data");
          
          const exampleTransactions = [
            {
              id: '1',
              hash: '0x6ec02efc923b884708abf750309c9d199084380daf7c6a15ed6f1015ae7f8dbc',
              type: 'Stake Deposit',
              amount: '5',
              asset: 'POL',
              timestamp: 1702530029,
              status: 'Completed',
              description: 'Example deposit to Smart Staking pool',
              blockNumber: 65459712,
              commission: '0.3'
            },
            {
              id: '2',
              hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              type: 'Stake Deposit',
              amount: '10',
              asset: 'POL',
              timestamp: Date.now() / 1000 - 86400,
              status: 'Completed',
              description: 'Example deposit to Smart Staking pool',
              commission: '0.6'
            },
            {
              id: '3',
              hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
              type: 'Claim Rewards',
              amount: '2.5',
              asset: 'POL',
              timestamp: Date.now() / 1000 - 43200,
              status: 'Completed',
              description: 'Example claimed rewards from Smart Staking',
              commission: '0.15'
            }
          ];
          
          setStakingTransactions(exampleTransactions);
        }
      } catch (error) {
        console.error("Error in fetchTransactions:", error);
        setError("Failed to load transactions: " + error.message);
        
        if (state.userDeposits && state.userDeposits.length > 0) {
          console.log("Using fallback data from userDeposits:", state.userDeposits);
          
          const fallbackTransactions = state.userDeposits.map((deposit, index) => {
            const commission = (parseFloat(deposit.amount) * 0.06).toFixed(6);
            
            return {
              id: `deposit-${index}`,
              hash: `0x${'0'.repeat(64)}`,
              type: 'Stake Deposit',
              amount: deposit.amount,
              asset: 'POL',
              timestamp: deposit.timestamp,
              status: 'Completed',
              description: 'Deposit to Smart Staking pool (fallback data)',
              commission: commission,
              isPlaceholder: true
            };
          });
          
          fallbackTransactions.sort((a, b) => b.timestamp - a.timestamp);
          setStakingTransactions(fallbackTransactions);
        } else {
          setStakingTransactions([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, [account, fetchTransactionEvents, state.userDeposits]);

  const getPolygonScanUrl = useCallback((hash, isPlaceholder) => {
    if (isPlaceholder || !hash || !hash.startsWith('0x') || hash.length !== 66) {
        console.log("Cannot generate PolygonScan URL for invalid/placeholder hash:", hash);
        return "#";
    }
    return `https://polygonscan.com/tx/${hash}`;
  }, []);
  
  const getContractPolygonScanUrl = useCallback(() => {
    return `https://polygonscan.com/address/${STAKING_CONTRACT_ADDRESS}`;
  }, [STAKING_CONTRACT_ADDRESS]);

  if (isLoading) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "400px" }}
      >
        <div className="w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin mb-4"></div>
        <h3 className="text-xl font-bold text-white mb-2">Loading Transactions</h3>
        <p className="text-gray-300 max-w-md">
          Fetching your transaction history from the blockchain...
        </p>
      </m.div>
    );
  }

  if (!stakingTransactions || stakingTransactions.length === 0) {
    return (
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="nuvos-card rounded-xl border border-purple-500/30 p-6 flex flex-col items-center justify-center text-center"
        style={{ minHeight: "400px" }}
      >
        <FaHistory className="text-5xl text-purple-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
        <p className="text-gray-300 max-w-md">
          We couldn't find any transactions associated with your wallet address yet.
          Start using NUVOS platform features to see your transaction history here.
        </p>
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaHistory className="text-purple-400" /> Transaction History
        </h2>
        <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
          {stakingTransactions.length} {stakingTransactions.length === 1 ? 'Transaction' : 'Transactions'}
        </span>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
          <div className="flex items-start gap-2">
            <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b border-purple-500/20">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Commission</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-purple-300">Status</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-purple-300">View</th>
            </tr>
          </thead>
          <tbody>
            {stakingTransactions.map((tx) => {
              const txStyle = getTransactionStyles(tx.type);
              const isValidHash = !tx.isPlaceholder; 
              
              return (
                <tr 
                  key={tx.id || tx.hash}
                  className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txStyle.color} bg-opacity-20`}>
                        {txStyle.icon}
                      </div>
                      <div>
                        <span className={`font-medium ${txStyle.color}`}>{tx.type}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {tx.description || '-'}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {formatAmount(tx.amount, tx.asset)}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {tx.commission ? formatAmount(tx.commission, tx.asset) : '-'}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      tx.status === 'Failed' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {isValidHash ? (
                      <a
                        href={getPolygonScanUrl(tx.hash, tx.isPlaceholder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded-lg"
                      >
                        <FaExternalLinkAlt size={12} />
                        <span className="text-xs">Explorer</span>
                      </a>
                    ) : (
                      <span 
                        className="text-gray-500 inline-flex items-center gap-1 bg-gray-800/40 px-2 py-1 rounded-lg cursor-not-allowed"
                        title="Transaction hash not available or invalid"
                      >
                        <FaExternalLinkAlt size={12} />
                        <span className="text-xs">Not Available</span>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-black/30 border border-purple-500/20 rounded-lg p-4 text-sm text-gray-300">
        <div className="flex items-start gap-2">
          <FaExclamationCircle className="mt-0.5 text-purple-400 flex-shrink-0" />
          <div>
            <p className="font-medium text-purple-300 mb-1">Transaction History</p>
            <p>This section displays your staking activities on the NUVOS platform, including deposits, withdrawals, and reward claims. Each transaction shows the exact amount, date, and commission.</p>
            <div className="mt-2">
              <a 
                href={getContractPolygonScanUrl()} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 mt-1"
              >
                <FaExternalLinkAlt size={10} /> View Smart Staking Contract
              </a>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default TransactionsSection;
