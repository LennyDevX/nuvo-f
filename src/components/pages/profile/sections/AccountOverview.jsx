import React, { useState, useEffect } from 'react';
import { motion as m } from 'framer-motion';
import { FaUser, FaWallet, FaExternalLinkAlt, FaCopy, FaCheckCircle, FaCoins, FaImage, FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useStaking } from '../../../../context/StakingContext';

const AccountOverview = ({ account, balance, network, nfts = [] }) => {
  const [copied, setCopied] = useState(false);
  const { state } = useStaking();
  const { userDeposits = [] } = state;
  
  // Create a censored version of the wallet address
  const censoredAddress = account ? 
    `${account.substring(0, 6)}...${account.substring(account.length - 6)}` : 
    'Not Connected';
  
  // Filter to only include actual NFTs, not placeholder images
  const actualNfts = nfts.filter(nft => nft?.tokenId && !nft.isPlaceholder);
  
  const copyAddressToClipboard = () => {
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FaUser className="text-purple-400" /> Account Overview
      </h2>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Wallet Address Card */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-medium text-white mb-4">Wallet Address</h3>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-purple-900/30 p-3 rounded-lg">
              <FaWallet className="text-purple-400" />
            </div>
            <div>
              <div className="font-mono text-sm text-gray-300 break-all">{censoredAddress}</div>
              <div className="text-xs text-gray-400 mt-1">{network} Network</div>
            </div>
          </div>
          
          <div className="flex mt-4 gap-2">
            <button
              onClick={copyAddressToClipboard}
              className="flex items-center gap-1 text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 py-1 px-3 rounded-lg transition-colors"
            >
              {copied ? <FaCheckCircle /> : <FaCopy />} 
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <a
              href={`https://polygonscan.com/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 py-1 px-3 rounded-lg transition-colors"
            >
              <FaExternalLinkAlt /> View on Explorer
            </a>
          </div>
        </div>
        
        {/* Account Stats - Now with real data */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-medium text-white mb-4">Account Stats</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">MATIC Balance</span>
              <span className="text-white font-medium">{parseFloat(balance).toFixed(6)} MATIC</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Active Staking Deposits</span>
              <span className="text-white">{userDeposits.length || 0}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">NUVOS NFTs</span>
              <span className="text-white">{actualNfts.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Staking Summary */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <FaCoins className="text-purple-400" />
            Staking Summary
          </h3>
          
          {userDeposits && userDeposits.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                You have <span className="text-purple-400 font-medium">{userDeposits.length}</span> active staking deposits.
              </p>
              <Link 
                to="/staking"
                className="inline-block text-sm text-purple-400 hover:text-purple-300 underline mt-2"
              >
                View details in Smart Staking
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                You don't have any active staking positions.
              </p>
              <Link 
                to="/staking"
                className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm mt-2"
              >
                Start Staking Now
              </Link>
            </div>
          )}
        </div>
        
        {/* NFT Summary */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20">
          <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
            <FaImage className="text-purple-400" />
            NFT Collection
          </h3>
          
          {actualNfts.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                You own <span className="text-purple-400 font-medium">{actualNfts.length}</span> NUVOS NFTs.
              </p>
              <Link 
                to="/nfts"
                className="inline-block text-sm text-purple-400 hover:text-purple-300 underline mt-2"
              >
                View your NFT collection
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-300">
                Your NUVOS NFT collection is empty.
              </p>
              <Link 
                to="/nfts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm mt-2"
              >
                <FaShoppingCart /> Buy NFTs
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* User Guide */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-5 rounded-xl border border-purple-500/20">
        <h3 className="text-lg font-medium text-white mb-2">Your NUVOS Dashboard</h3>
        <p className="text-gray-300 text-sm mb-3">
          Use the navigation on the left to explore your portfolio:
        </p>
        <ul className="space-y-2 text-sm text-gray-300">
          <li>• <span className="text-purple-300">Tokens</span> - View your token balances and holdings</li>
          <li>• <span className="text-purple-300">NFTs</span> - Browse your NFT collection</li>
          <li>• <span className="text-purple-300">Staking</span> - Manage your staking positions</li>
          <li>• <span className="text-purple-300">Transactions</span> - See your transaction history</li>
        </ul>
      </div>
    </m.div>
  );
};

export default AccountOverview;
