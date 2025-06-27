import React from 'react';
import { useContext } from 'react';
import { WalletContext } from '../../context/WalletContext';

const NetworkBadge = () => {
  const { network, account } = useContext(WalletContext);

  // Get network name based on chainId
  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 137:
        return 'Polygon';
      case 80001:
        return 'Mumbai';
      case 56:
        return 'BSC';
      case 97:
        return 'BSC Testnet';
      case 43114:
        return 'Avalanche';
      case 42161:
        return 'Arbitrum';
      case 10:
        return 'Optimism';
      default:
        return `Chain ${chainId}`;
    }
  };

  // Handle different network object structures
  let chainId = null;
  let networkName = 'Not Connected';
  
  if (network) {
    if (typeof network === 'string') {
      networkName = network;
    } else if (network.chainId) {
      chainId = typeof network.chainId === 'string' 
        ? parseInt(network.chainId, 16)
        : network.chainId;
      networkName = getNetworkName(chainId);
    } else if (network.name) {
      networkName = network.name;
    }
  }

  const isCorrectNetwork = chainId === 137; // Polygon is the expected network
  const isConnected = !!account;
  
  // Determine status dot color
  const getStatusColor = () => {
    if (!isConnected) return 'bg-gray-400';
    return isCorrectNetwork ? 'bg-green-400' : 'bg-red-400';
  };

  // Use styles similar to "Live Protocol" badge
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-slate-800/50 border border-slate-700/30 text-slate-300 text-xs rounded-full backdrop-blur-sm">
      <span className={`w-2 h-2 rounded-full ${getStatusColor()} mr-1`} />
      <span>
        {isConnected ? networkName : 'Not Connected'}
      </span>
    </div>
  );
};

export default NetworkBadge;