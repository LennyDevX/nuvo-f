import React, { useMemo } from 'react';
import { motion as m } from 'framer-motion';
import { FaChartLine, FaCoins, FaImage, FaStar } from 'react-icons/fa';

const ActivitySection = ({ mintedNFTs = [], transactions = [], account }) => {
  // Calculate stats based on transactions and NFTs
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalMinted = mintedNFTs.length;
    
    // Calculate transaction value
    const transactionValue = transactions.reduce((acc, tx) => {
      // Parse the amount (assuming format like "10.5 POL")
      const match = tx.amount?.match(/(\d+\.?\d*)/);
      const amount = match ? parseFloat(match[1]) : 0;
      return acc + amount;
    }, 0);
    
    // Determine status level based on activity
    let statusLevel = "Newcomer";
    let statusColor = "text-blue-400";
    
    if (totalTransactions > 10 || totalMinted >= 3) {
      statusLevel = "Active User";
      statusColor = "text-green-400";
    } else if (totalTransactions > 5 || totalMinted >= 1) {
      statusLevel = "Regular User";
      statusColor = "text-purple-400";
    }
    
    return {
      totalTransactions,
      totalMinted,
      transactionValue,
      statusLevel,
      statusColor
    };
  }, [transactions, mintedNFTs]);
  
  // Get user join date (first transaction)
  const joinDate = useMemo(() => {
    if (!transactions || transactions.length === 0) return "Unknown";
    
    const timestamps = transactions.map(tx => tx.timestamp || 0);
    const oldestTimestamp = Math.min(...timestamps);
    
    if (!oldestTimestamp) return "Unknown";
    
    const date = new Date(oldestTimestamp * 1000);
    return date.toLocaleDateString();
  }, [transactions]);
  
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaChartLine className="text-purple-400" /> Activity Dashboard
        </h2>
        <div className="bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/20">
          <span className={`font-medium ${stats.statusColor}`}>
            {stats.statusLevel}
          </span>
        </div>
      </div>
      
      {/* Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <FaCoins className="text-purple-400" />
            </div>
            <span className="text-gray-300">Transactions</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats.totalTransactions}
          </div>
        </div>
        
        <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <FaImage className="text-purple-400" />
            </div>
            <span className="text-gray-300">Minted NFTs</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats.totalMinted}
          </div>
        </div>
        
        <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <FaStar className="text-purple-400" />
            </div>
            <span className="text-gray-300">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {stats.transactionValue.toFixed(2)} POL
          </div>
        </div>
        
        <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-purple-900/30 p-2 rounded-lg">
              <FaChartLine className="text-purple-400" />
            </div>
            <span className="text-gray-300">Joined</span>
          </div>
          <div className="font-medium text-white mt-2">
            {joinDate}
          </div>
        </div>
      </div>
      
      {/* Recent Activity Feed */}
      <div className="bg-black/20 border border-purple-500/20 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.slice(0, 5).map((tx, index) => (
              <div 
                key={tx.id || index}
                className="flex items-start gap-3 pb-3 border-b border-purple-500/10 last:border-0"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'Stake' ? 'bg-blue-500/20' : 
                  tx.type === 'Claim' ? 'bg-green-500/20' :
                  tx.type === 'Withdraw' ? 'bg-red-500/20' :
                  'bg-yellow-500/20'
                }`}>
                  <FaCoins className={`text-sm ${
                    tx.type === 'Stake' ? 'text-blue-400' : 
                    tx.type === 'Claim' ? 'text-green-400' :
                    tx.type === 'Withdraw' ? 'text-red-400' :
                    'text-yellow-400'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{tx.type} Transaction</p>
                      <p className="text-sm text-gray-400">{tx.amount}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">No recent activity to display</p>
          )}
          
          {transactions.length > 5 && (
            <div className="text-center pt-2">
              <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View More Activity
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* User Badges */}
      <div className="bg-black/20 border border-purple-500/20 rounded-xl p-5">
        <h3 className="text-lg font-medium text-white mb-4">Platform Badges</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stats.totalTransactions > 0 && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-2">
                <FaCoins className="text-white" />
              </div>
              <p className="text-white font-medium">Transaction Pioneer</p>
              <p className="text-xs text-gray-400">First transaction completed</p>
            </div>
          )}
          
          {stats.totalMinted > 0 && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-2">
                <FaImage className="text-white" />
              </div>
              <p className="text-white font-medium">NFT Creator</p>
              <p className="text-xs text-gray-400">Successfully minted an NFT</p>
            </div>
          )}
          
          {stats.transactionValue > 10 && (
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3 text-center">
              <div className="w-12 h-12 mx-auto bg-gradient-to-br from-yellow-600 to-amber-600 rounded-full flex items-center justify-center mb-2">
                <FaStar className="text-white" />
              </div>
              <p className="text-white font-medium">Whale Status</p>
              <p className="text-xs text-gray-400">High value transactions</p>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
};

export default ActivitySection;
