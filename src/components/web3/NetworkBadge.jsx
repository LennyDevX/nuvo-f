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

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md 
                    border border-slate-700/40 bg-slate-800/50 backdrop-blur-sm
                    shadow-sm transition-all duration-300
                    text-sm font-medium">
      <span className={`h-2 w-2 rounded-full ${getStatusColor()} 
                       shadow-sm shadow-${getStatusColor()}/50`}></span>
      <span className="text-slate-300">
        {isConnected ? networkName : 'Not Connected'}
      </span>
    </div>
  );
};

export default NetworkBadge;