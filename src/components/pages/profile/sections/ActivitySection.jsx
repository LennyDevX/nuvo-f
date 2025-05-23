import React, { useMemo, lazy, Suspense } from 'react';
import { motion as m } from 'framer-motion';
import { FaChartLine, FaCoins, FaImage, FaStar, FaSpinner } from 'react-icons/fa';

// Extract ActivityMetricCard as memoized component
const ActivityMetricCard = React.memo(({ icon, title, value, bgColorClass = "bg-purple-900/30" }) => (
  <div className="bg-black/30 border border-purple-500/20 rounded-xl p-4">
    <div className="flex items-center gap-3 mb-1">
      <div className={`${bgColorClass} p-2 rounded-lg`}>
        {icon}
      </div>
      <span className="text-gray-300">{title}</span>
    </div>
    <div className="text-2xl font-bold text-white mt-2">
      {value}
    </div>
  </div>
));

// Extract BadgeCard component
const BadgeCard = React.memo(({ icon, title, subtitle, gradient }) => (
  <div className="bg-purple-900/20 border border-purple-500/20 rounded-lg p-3 text-center">
    <div className={`w-12 h-12 mx-auto ${gradient} rounded-full flex items-center justify-center mb-2`}>
      {icon}
    </div>
    <p className="text-white font-medium">{title}</p>
    <p className="text-xs text-gray-400">{subtitle}</p>
  </div>
));

// Extract ActivityItem component to optimize list rendering
const ActivityItem = React.memo(({ transaction, index }) => {
  // Skip rendering for non-existant items
  if (!transaction) return null;
  
  let bgColorClass = 'bg-yellow-500/20';
  let textColorClass = 'text-yellow-400';
  
  if (transaction.type === 'Stake') {
    bgColorClass = 'bg-blue-500/20';
    textColorClass = 'text-blue-400';
  } else if (transaction.type === 'Claim') {
    bgColorClass = 'bg-green-500/20';
    textColorClass = 'text-green-400';
  } else if (transaction.type === 'Withdraw') {
    bgColorClass = 'bg-red-500/20';
    textColorClass = 'text-red-400';
  }
  
  const formattedDate = transaction.timestamp ? 
    new Date(transaction.timestamp * 1000).toLocaleDateString() : 
    'Unknown date';
  
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-purple-500/10 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${bgColorClass}`}>
        <FaCoins className={`text-sm ${textColorClass}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-white font-medium">{transaction.type} Transaction</p>
            <p className="text-sm text-gray-400">{transaction.amount}</p>
          </div>
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
});

const ActivitySection = ({ mintedNFTs = [], transactions = [], account }) => {
  // Avoid recalculations with useMemo for all calculated values
  const stats = useMemo(() => {
    const totalTransactions = transactions.length;
    const totalMinted = mintedNFTs.length;
    
    // Parse with regex only once and handle errors better
    const transactionValue = transactions.reduce((acc, tx) => {
      try {
        const match = tx.amount?.match(/(\d+\.?\d*)/);
        return acc + (match ? parseFloat(match[1]) : 0);
      } catch (e) {
        console.warn("Error parsing amount:", e);
        return acc;
      }
    }, 0);
    
    // Determine status once
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
  
  // Memoize join date calculation
  const joinDate = useMemo(() => {
    if (!transactions || transactions.length === 0) return "Unknown";
    
    // Find oldest timestamp efficiently
    let oldestTimestamp = Infinity;
    for (let i = 0; i < transactions.length; i++) {
      const timestamp = transactions[i].timestamp || 0;
      if (timestamp && timestamp < oldestTimestamp) {
        oldestTimestamp = timestamp;
      }
    }
    
    if (!oldestTimestamp || oldestTimestamp === Infinity) return "Unknown";
    
    const date = new Date(oldestTimestamp * 1000);
    return date.toLocaleDateString();
  }, [transactions]);
  
  // Memoize badges availability
  const badgesData = useMemo(() => [
    {
      id: 'transaction',
      isEarned: stats.totalTransactions > 0,
      icon: <FaCoins className="text-white" />,
      title: "Transaction Pioneer",
      subtitle: "First transaction completed",
      gradient: "bg-gradient-to-br from-blue-600 to-purple-600"
    },
    {
      id: 'nft',
      isEarned: stats.totalMinted > 0,
      icon: <FaImage className="text-white" />,
      title: "NFT Creator",
      subtitle: "Successfully minted an NFT",
      gradient: "bg-gradient-to-br from-purple-600 to-pink-600"
    },
    {
      id: 'whale',
      isEarned: stats.transactionValue > 10,
      icon: <FaStar className="text-white" />,
      title: "Whale Status",
      subtitle: "High value transactions",
      gradient: "bg-gradient-to-br from-yellow-600 to-amber-600"
    }
  ], [stats.totalTransactions, stats.totalMinted, stats.transactionValue]);
  
  // Only render earned badges for efficiency
  const earnedBadges = useMemo(() => 
    badgesData.filter(badge => badge.isEarned),
  [badgesData]);
  
  // Limit transactions for performance
  const recentTransactions = useMemo(() => 
    transactions.slice(0, 5),
  [transactions]);
  
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      {/* Header with stats */}
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
      
      {/* Activity Stats using memoized components */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ActivityMetricCard
          icon={<FaCoins className="text-purple-400" />}
          title="Transactions" 
          value={stats.totalTransactions}
        />
        <ActivityMetricCard 
          icon={<FaImage className="text-purple-400" />}
          title="Minted NFTs"
          value={stats.totalMinted}
        />
        <ActivityMetricCard
          icon={<FaStar className="text-purple-400" />}
          title="Total Value"
          value={`${stats.transactionValue.toFixed(2)} POL`}
        />
        <ActivityMetricCard
          icon={<FaChartLine className="text-purple-400" />}
          title="Joined"
          value={joinDate}
        />
      </div>
      
      {/* Recent Activity Feed with optimized rendering */}
      <div className="bg-black/20 border border-purple-500/20 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx, index) => (
              <ActivityItem 
                key={tx.id || index}
                transaction={tx}
                index={index}
              />
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
      
      {/* User Badges - only render if badges exist */}
      {earnedBadges.length > 0 && (
        <div className="bg-black/20 border border-purple-500/20 rounded-xl p-5">
          <h3 className="text-lg font-medium text-white mb-4">Platform Badges</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <BadgeCard 
                key={badge.id}
                icon={badge.icon}
                title={badge.title}
                subtitle={badge.subtitle}
                gradient={badge.gradient}
              />
            ))}
          </div>
        </div>
      )}
    </m.div>
  );
};

export default React.memo(ActivitySection);
