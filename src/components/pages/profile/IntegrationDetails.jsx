import React from 'react';
import { motion as m } from 'framer-motion';
import { 
  FaUser, 
  FaCoins, 
  FaLayerGroup, 
  FaRobot, 
  FaHistory, 
  FaChartLine, 
  FaExternalLinkAlt,
  FaGift,
  FaGamepad
} from 'react-icons/fa';

// Animation variants for smooth transitions
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const IntegrationDetails = ({ 
  activeIntegration, 
  nfts = [], 
  transactions = [],
  account = "",
  mintedNFTs = []
}) => {
  // Custom date formatter without date-fns dependency
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    
    // Get month name (3 letters)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    
    // Get day with leading zero if needed
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get year
    const year = date.getFullYear();
    
    // Get time
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    // Format: "MMM dd, yyyy HH:mm"
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Common card styling for better reusability
  const cardStyle = "nuvos-card rounded-xl border border-purple-500/30 p-6 h-full";
  
  // Helper to open Polygonscan in new tab
  const openPolygonscan = (hash) => {
    window.open(`https://polygonscan.com/tx/${hash}`, '_blank');
  };
  
  // Overview section
  if (activeIntegration === 'overview') {
    return (
      <m.div
        key="overview"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Overview Card */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <FaUser className="text-2xl text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Account Overview</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-sm text-purple-200 mb-1">Connected Wallet</h3>
                <div className="flex items-center justify-between">
                  <span className="text-white font-mono text-sm break-all">{account}</span>
                  <a 
                    href={`https://polygonscan.com/address/${account}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <FaExternalLinkAlt />
                  </a>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-300 mb-3">Account Status</h3>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Card */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <FaHistory className="text-2xl text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>
            
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.slice(0, 2).map(tx => (
                  <div 
                    key={tx.id} 
                    className="bg-black/30 p-3 rounded-lg border border-purple-500/20 cursor-pointer hover:bg-purple-900/20 transition-colors"
                    onClick={() => openPolygonscan(tx.hash)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-white font-medium">{tx.type}</p>
                        <p className="text-sm text-purple-300">{tx.amount}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          {tx.status}
                        </span>
                        <p className="text-xs text-purple-300 mt-1">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="mt-3 text-center">
                  <button 
                    onClick={() => setActiveIntegration('transactions')}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    View All Transactions
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <FaHistory className="text-4xl text-purple-500/40 mb-3" />
                <p className="text-purple-300">No recent activities found</p>
              </div>
            )}
          </div>
        </div>
        
        {/* NFTs Preview Card */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <FaLayerGroup className="text-2xl text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Your NFT Collection</h2>
            </div>
            
            <button 
              onClick={() => setActiveIntegration('nfts')}
              className="text-purple-400 hover:text-purple-300 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          {nfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {nfts.map(nft => (
                <div 
                  key={nft.id}
                  className="relative group overflow-hidden rounded-lg border border-purple-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:border-purple-500/50"
                >
                  <div className="aspect-square overflow-hidden bg-black/40">
                    <img 
                      src={nft.image} 
                      alt={nft.name} 
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="font-medium text-white truncate">{nft.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FaLayerGroup className="text-4xl text-purple-500/40 mb-3" />
              <p className="text-purple-300">No NFTs found in your collection</p>
            </div>
          )}
        </div>
      </m.div>
    );
  }
  
  // NFTs section with improved display
  if (activeIntegration === 'nfts') {
    return (
      <m.div
        key="nfts"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cardStyle}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <FaLayerGroup className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">NFT Collection</h2>
          </div>
          
          {nfts.length > 0 ? (
            <>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-white mb-4">Owned NFTs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nfts.map(nft => (
                    <div
                      key={nft.id}
                      className="bg-black/40 rounded-xl overflow-hidden border border-purple-500/30 group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300"
                    >
                      {/* Enhanced image container */}
                      <div className="aspect-square overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/0 via-purple-900/0 to-black/40 z-10"></div>
                        <img 
                          src={nft.image} 
                          alt={nft.name}
                          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                          style={{ imageRendering: 'high-quality' }}
                        />
                      </div>
                      
                      {/* NFT details */}
                      <div className="p-4">
                        <h3 className="text-xl font-bold text-white mb-2">{nft.name}</h3>
                        <p className="text-purple-300 text-sm mb-3">{nft.description}</p>
                        
                        {/* Attributes */}
                        <div className="grid grid-cols-2 gap-2">
                          {nft.attributes?.map((attr, index) => (
                            <div 
                              key={index}
                              className="bg-purple-900/30 px-3 py-2 rounded-lg border border-purple-500/20"
                            >
                              <p className="text-xs text-purple-400 font-medium">{attr.trait_type}</p>
                              <p className="text-sm text-white">{attr.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* NFT gallery showcase section */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">Showcase Gallery</h3>
                <div className="p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-purple-500/20 text-center">
                  <p className="text-purple-300 mb-4">
                    Curate and display your favorite NFTs in your personal showcase gallery
                  </p>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition-colors">
                    Create Gallery
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <FaLayerGroup className="text-4xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No NFTs Found</h3>
              <p className="text-purple-300 max-w-md mb-6">
                You don't have any NFTs in your collection yet. Explore our marketplace to find unique digital assets.
              </p>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-colors">
                Explore NFT Marketplace
              </button>
            </div>
          )}
        </div>
      </m.div>
    );
  }
  
  // Staking section
  if (activeIntegration === 'staking') {
    return (
      <m.div
        key="staking"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cardStyle}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <FaCoins className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Smart Staking</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-medium text-white mb-3">Staking Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Total Staked</span>
                  <span className="text-white font-bold text-xl">10.5 POL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Earned Rewards</span>
                  <span className="text-green-400 font-bold text-xl">1.2 POL</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Current APY</span>
                  <span className="text-purple-300 font-bold">125%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-medium text-white mb-3">Staking Progress</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-purple-300">Time Bonus</span>
                  <span className="text-purple-300">45%</span>
                </div>
                <div className="w-full h-2 bg-purple-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" style={{width: '45%'}}></div>
                </div>
                <p className="text-xs text-purple-400 mt-1">45/100 days to max bonus</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Days Staked</span>
                <span className="text-white font-medium">45 days</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-0.5">
              Go to Staking Dashboard
            </button>
            <button className="px-6 py-3 bg-black/40 border border-purple-500/30 rounded-lg text-white font-medium hover:bg-purple-900/20 transition-all">
              Claim Rewards
            </button>
          </div>
        </div>
      </m.div>
    );
  }
  
  // Transaction history using wallet context data
  if (activeIntegration === 'transactions') {
    return (
      <m.div
        key="transactions"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cardStyle}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <FaHistory className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Transaction History</h2>
          </div>
          
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="pb-3 text-left text-sm font-medium text-purple-300">Type</th>
                    <th className="pb-3 text-left text-sm font-medium text-purple-300">Amount</th>
                    <th className="pb-3 text-left text-sm font-medium text-purple-300">Date</th>
                    <th className="pb-3 text-left text-sm font-medium text-purple-300">Status</th>
                    <th className="pb-3 text-right text-sm font-medium text-purple-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id} className="border-b border-purple-500/10 hover:bg-purple-900/10">
                      <td className="py-4 text-sm text-white">{tx.type}</td>
                      <td className="py-4 text-sm text-white">{tx.amount}</td>
                      <td className="py-4 text-sm text-purple-300">{formatDate(tx.timestamp)}</td>
                      <td className="py-4">
                        <span className="inline-block px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => openPolygonscan(tx.hash)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <FaExternalLinkAlt />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <FaHistory className="text-3xl text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
              <p className="text-purple-300">Your transaction history will appear here.</p>
            </div>
          )}
        </div>
      </m.div>
    );
  }
  
  // AI Hub section
  if (activeIntegration === 'ai-hub') {
    return (
      <m.div
        key="ai-hub"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cardStyle}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <FaRobot className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">AI Hub</h2>
          </div>
          
          <div className="p-8 bg-gradient-to-br from-purple-900/30 to-black/60 backdrop-blur-sm rounded-xl border border-purple-500/30 mb-8 text-center">
            <m.div 
              className="w-24 h-24 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-6"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FaRobot className="text-4xl text-purple-400" />
            </m.div>
            <h3 className="text-2xl font-bold text-white mb-4">AI Assistant</h3>
            <p className="text-purple-300 max-w-lg mx-auto mb-6">
              Your personal AI assistant can help optimize your investments, provide market insights, and answer questions about the Nuvos ecosystem.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-0.5">
              Go to AI Hub
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-medium text-white mb-3">Recent Analysis</h3>
              <div className="bg-purple-900/20 p-4 rounded-lg mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartLine className="text-purple-400" />
                  <span className="text-white font-medium">Portfolio Performance</span>
                </div>
                <p className="text-purple-300 text-sm">Your portfolio is performing 12% better than average in similar market conditions.</p>
              </div>
              <p className="text-xs text-purple-400">Last updated 2 hours ago</p>
            </div>
            
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-medium text-white mb-3">AI Recommendations</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-purple-300">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Consider increasing your staking position</span>
                </li>
                <li className="flex items-center gap-2 text-purple-300">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Explore NFT opportunities in the marketplace</span>
                </li>
                <li className="flex items-center gap-2 text-purple-300">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Complete your profile for personalized insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </m.div>
    );
  }
  
  // Airdrops section
  if (activeIntegration === 'airdrops') {
    return (
      <m.div
        key="airdrops"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cardStyle}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <FaGift className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Airdrops</h2>
          </div>
          
          <div className="p-8 bg-gradient-to-br from-purple-900/30 to-black/60 backdrop-blur-sm rounded-xl border border-purple-500/30 mb-8 text-center">
            <m.div 
              className="w-24 h-24 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-6"
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <FaGift className="text-4xl text-purple-400" />
            </m.div>
            <h3 className="text-2xl font-bold text-white mb-4">Upcoming Airdrops</h3>
            <div className="inline-block bg-yellow-500/20 px-4 py-2 rounded-lg mb-4">
              <p className="text-yellow-300 font-medium">NUVO Token Pre-Launch Airdrop</p>
              <p className="text-yellow-200 text-sm">Q1 2026</p>
            </div>
            <p className="text-purple-300 max-w-lg mx-auto mb-6">
              Make sure your profile is complete to be eligible for our upcoming airdrops and token events.
            </p>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-0.5">
              Go to Airdrops Page
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-medium text-white mb-3">Eligibility Requirements</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-purple-300">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  </div>
                  <span>Connected Wallet</span>
                </li>
                <li className="flex items-center gap-3 text-purple-300">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  </div>
                  <span>Profile Completion</span>
                </li>
                <li className="flex items-center gap-3 text-purple-300">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  </div>
                  <span>Community Participation</span>
                </li>
                <li className="flex items-center gap-3 text-purple-300">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  </div>
                  <span>Staking Activity</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
              <h3 className="text-lg font-medium text-white mb-3">Past Airdrops</h3>
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-purple-300">No past airdrops found</p>
                <p className="text-sm text-purple-400 mt-2">Stay tuned for future opportunities!</p>
              </div>
            </div>
          </div>
        </div>
      </m.div>
    );
  }
  
  // Game section
  if (activeIntegration === 'game') {
    return (
      <m.div
        key="game"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
      >
        <div className={cardStyle}>
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <FaGamepad className="text-2xl text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Gaming Hub</h2>
          </div>
          
          <div className="p-8 bg-gradient-to-br from-purple-900/30 to-black/60 backdrop-blur-sm rounded-xl border border-purple-500/30 mb-8 text-center">
            <m.div 
              className="w-24 h-24 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            >
              <FaGamepad className="text-4xl text-purple-400" />
            </m.div>
            <div className="inline-block bg-yellow-500/20 px-4 py-2 rounded-lg mb-4">
              <p className="text-yellow-300 font-medium">Coming Soon</p>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Play & Earn Games</h3>
            <p className="text-purple-300 max-w-lg mx-auto mb-6">
              Our gaming platform is currently in development. Soon you'll be able to play games, earn rewards, and compete with others in the Nuvos ecosystem.
            </p>
            <button className="px-6 py-3 bg-gray-700/80 rounded-lg text-gray-300 font-medium cursor-not-allowed">
              Coming in Q3 2024
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20 text-center">
              <h3 className="text-lg font-medium text-white mb-3">Game Rewards</h3>
              <div className="w-12 h-12 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-3">
                <FaCoins className="text-xl text-purple-400" />
              </div>
              <p className="text-purple-300 text-sm">Earn tokens by participating in games and competitions</p>
            </div>
            
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20 text-center">
              <h3 className="text-lg font-medium text-white mb-3">Tournaments</h3>
              <div className="w-12 h-12 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-3">
                <FaChartLine className="text-xl text-purple-400" />
              </div>
              <p className="text-purple-300 text-sm">Compete against other players for prizes and leaderboard positions</p>
            </div>
            
            <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20 text-center">
              <h3 className="text-lg font-medium text-white mb-3">NFT Power-ups</h3>
              <div className="w-12 h-12 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-3">
                <FaLayerGroup className="text-xl text-purple-400" />
              </div>
              <p className="text-purple-300 text-sm">Use your NFTs to gain advantages and unique abilities in games</p>
            </div>
          </div>
        </div>
      </m.div>
    );
  }
  
  // Default section if no integration is selected
  return (
    <m.div
      key="default"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      className="bg-black/40 backdrop-blur-sm rounded-xl border border-purple-500/20 p-8 text-center"
    >
      <FaUser className="text-4xl text-purple-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Select a section</h2>
      <p className="text-purple-300">Choose a section from the sidebar to view your profile information</p>
    </m.div>
  );
};

export default IntegrationDetails;
