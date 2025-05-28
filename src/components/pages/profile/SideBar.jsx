import React from 'react';
import { motion as m } from 'framer-motion';
import { 
  FaHome, 
  FaLayerGroup, 
  FaRobot, 
  FaCoins, 
  FaGift, 
  FaGamepad,
  FaHistory 
} from 'react-icons/fa';

const SideBar = ({ activeIntegration, onSelectIntegration }) => {
  const integrations = [
    {
      id: 'overview',
      name: 'Overview',
      icon: <FaHome className="text-lg" />,
      isBeta: false
    },
    {
      id: 'nfts',
      name: 'NFTs',
      icon: <FaLayerGroup className="text-lg" />,
      isBeta: true
    },
    {
      id: 'staking',
      name: 'Smart Staking',
      icon: <FaCoins className="text-lg" />,
      isBeta: false
    },
    
    {
      id: 'ai-hub',
      name: 'AI Hub',
      icon: <FaRobot className="text-lg" />,
      isBeta: true
    },
    {
      id: 'airdrops',
      name: 'Airdrops',
      icon: <FaGift className="text-lg" />,
      isBeta: true
    },
    {
      id: 'game',
      name: 'Game',
      icon: <FaGamepad className="text-lg" />,
      isBeta: true
    }
  ];

  return (
    <div className="space-y-1">
      {integrations.map((integration) => (
        <m.button
          key={integration.id}
          onClick={() => onSelectIntegration(integration.id)}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300
            ${activeIntegration === integration.id 
              ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-white shadow-lg shadow-purple-900/20 border border-purple-500/40' 
              : 'text-gray-300 hover:bg-purple-500/10 border border-transparent'}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
              ${activeIntegration === integration.id 
                ? 'bg-purple-900/60 text-purple-300' 
                : 'bg-purple-900/30 text-gray-400'}`}>
              {integration.icon}
            </span>
            <span className="text-sm font-medium">{integration.name}</span>
          </div>
          {integration.isBeta && (
            <span className="bg-purple-600/40 text-purple-200 text-xs px-2 py-0.5 rounded-full">
              Beta
            </span>
          )}
        </m.button>
      ))}
    </div>
  );
};

export default SideBar;
