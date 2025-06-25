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

const SideBar = ({ activeIntegration, onSelectIntegration, isMobile = false, isExpanded = false, isCompact = false }) => {
  const integrations = [
    {
      id: 'overview',
      name: 'Overview',
      shortName: 'Home',
      icon: <FaHome className="text-lg" />,
      description: 'Account summary',
      isBeta: false
    },
    {
      id: 'nfts',
      name: 'NFTs',
      shortName: 'NFTs',
      icon: <FaLayerGroup className="text-lg" />,
      description: 'Your digital assets',
      isBeta: true
    },
    {
      id: 'staking',
      name: 'Smart Staking',
      shortName: 'Staking',
      icon: <FaCoins className="text-lg" />,
      description: 'Earn rewards',
      isBeta: false
    },
    {
      id: 'ai-hub',
      name: 'AI Hub',
      shortName: 'AI Hub',
      icon: <FaRobot className="text-lg" />,
      description: 'AI services',
      isBeta: true
    },
    {
      id: 'airdrops',
      name: 'Airdrops',
      shortName: 'Drops',
      icon: <FaGift className="text-lg" />,
      description: 'Free tokens',
      isBeta: true
    },
    {
      id: 'game',
      name: 'Game',
      shortName: 'Game',
      icon: <FaGamepad className="text-lg" />,
      description: 'Play & earn',
      isBeta: true
    },
    
  ];

  if (isMobile) {
    // Compact mobile version for profile page header
    if (isCompact) {
      return (
        <div className="grid grid-cols-2 gap-2">
          {integrations.map((integration, index) => (
            <m.button
              key={integration.id}
              onClick={() => onSelectIntegration(integration.id)}
              className={`
                flex items-center gap-2 p-2 rounded-lg transition-all duration-200
                border text-left
                ${activeIntegration === integration.id 
                  ? 'bg-gradient-to-r from-purple-600/40 to-purple-500/30 border-purple-400/50 text-white shadow-md' 
                  : 'bg-purple-900/20 border-purple-500/20 text-gray-300 hover:bg-purple-500/20'
                }
              `}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Icon */}
              <span className={`
                w-6 h-6 flex items-center justify-center rounded flex-shrink-0
                ${activeIntegration === integration.id 
                  ? 'text-purple-200' 
                  : 'text-purple-400'
                }
              `}>
                {React.cloneElement(integration.icon, { className: "text-sm" })}
              </span>
              
              {/* Title */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium truncate">
                  {integration.name}
                </h4>
              </div>

              {/* Beta Badge */}
              {integration.isBeta && (
                <span className="bg-purple-600/80 text-purple-100 text-xs px-1 py-0.5 rounded flex-shrink-0">
                  β
                </span>
              )}
            </m.button>
          ))}
        </div>
      );
    }

    // Full mobile version (existing code for expanded menu)
    return (
      <div className="grid grid-cols-2 gap-3">
        {integrations.map((integration, index) => (
          <m.button
            key={integration.id}
            onClick={() => onSelectIntegration(integration.id)}
            className={`
              flex flex-col items-start p-3 rounded-xl transition-all duration-200 relative
              border text-left
              ${activeIntegration === integration.id 
                ? 'bg-gradient-to-br from-purple-600/30 to-purple-500/20 border-purple-400/50 text-white shadow-lg' 
                : 'bg-purple-900/10 border-purple-500/20 text-gray-300 hover:bg-purple-500/15'
              }
            `}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Icon and Beta Badge Row */}
            <div className="flex items-center justify-between w-full mb-2">
              <span className={`
                w-8 h-8 flex items-center justify-center rounded-lg
                ${activeIntegration === integration.id 
                  ? 'bg-purple-500/30 text-purple-200' 
                  : 'bg-purple-900/40 text-purple-400'
                }
              `}>
                {React.cloneElement(integration.icon, { className: "text-sm" })}
              </span>
              {integration.isBeta && (
                <span className="bg-purple-600/80 text-purple-100 text-xs px-1.5 py-0.5 rounded-full leading-none font-medium">
                  β
                </span>
              )}
            </div>
            
            {/* Title and Description */}
            <div className="w-full">
              <h4 className="text-sm font-semibold mb-1 leading-tight">
                {integration.name}
              </h4>
              <p className="text-xs opacity-75 leading-tight">
                {integration.description}
              </p>
            </div>
          </m.button>
        ))}
      </div>
    );
  }

  // Desktop version (unchanged)
  return (
    <div className="space-y-2">
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
