import { motion } from 'framer-motion';
import { FaArrowUp, FaBolt, FaServer, FaStar, FaChartLine, FaCog, FaExclamationTriangle } from 'react-icons/fa';
import Tooltip from '../../common/Tooltip';

const UserPCs = ({ userPCs, upgradePC, calculateUpgradeCost }) => {
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return { border: 'border-gray-500/30', bg: 'from-gray-600/50 to-gray-700/50' };
      case 'rare': return { border: 'border-blue-500/30', bg: 'from-blue-600/50 to-blue-700/50' };
      case 'epic': return { border: 'border-purple-500/30', bg: 'from-purple-600/50 to-purple-700/50' };
      default: return { border: 'border-gray-500/30', bg: 'from-gray-600/50 to-gray-700/50' };
    }
  };

  const getEfficiencyColor = (level) => {
    const efficiency = 100 - (level * 0.5);
    if (efficiency >= 80) return 'text-green-400';
    if (efficiency >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {userPCs.map((pc, index) => {
        const colors = getRarityColor(pc.rarity);
        const efficiency = 100 - (pc.level * 0.5);
        
        return (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            className={`bg-gradient-to-br from-purple-800/30 to-blue-800/30 p-6 rounded-lg border ${colors.border}`}
          >
            {/* NFT Header */}
            <div className="relative mb-4">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${colors.bg} flex items-center gap-2`}>
                <FaStar className="text-yellow-400" />
                <span className="text-white">{pc.rarity.toUpperCase()}</span>
              </div>
              <div className="text-4xl text-center filter drop-shadow-lg">{pc.image}</div>
            </div>

            {/* NFT Info */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-1">{pc.name}</h3>
              <div className="text-sm text-purple-300 mb-2">NFT Generation {pc.nftMetadata.attributes[1].value}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Tooltip text="Current mining performance">
                <div className="bg-purple-900/20 p-2 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-1 text-xs">
                    <FaBolt />
                    <span>Mining Rate</span>
                  </div>
                  <span className="text-white font-mono">{(pc.miningRate * pc.level).toFixed(6)}/s</span>
                </div>
              </Tooltip>

              <Tooltip text="Power consumption increases with level">
                <div className="bg-purple-900/20 p-2 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-400 mb-1 text-xs">
                    <FaServer />
                    <span>Power Draw</span>
                  </div>
                  <span className="text-white font-mono">{(pc.powerConsumption * pc.level).toFixed(6)} kW/s</span>
                </div>
              </Tooltip>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2 mb-4">
              <Tooltip text="Mining efficiency decreases with higher levels">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FaChartLine className={getEfficiencyColor(pc.level)} />
                    <span className="text-purple-300Zxc45">Efficiency</span> 
                  </div>
                  <span className={`font-medium gap-2 ${getEfficiencyColor(pc.level)}`}>
                    {efficiency.toFixed(1)}%
                  </span>
                </div>
              </Tooltip>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FaCog className="text-purple-400" />
                  <span className="text-purple-300">Level Progress</span>
                </div>
                <span className="text-white font-medium">
                  {pc.level}/{pc.maxLevel}
                </span>
              </div>
            </div>

            {/* Warnings & Status */}
            {efficiency < 60 && (
              <div className="bg-red-900/20 text-red-400 text-sm p-2 rounded-lg mb-4 flex items-center gap-2">
                <FaExclamationTriangle />
                <span>Low efficiency warning</span>
              </div>
            )}

            {/* Upgrade Button */}
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              {pc.level >= pc.maxLevel ? (
                <div className="text-center text-purple-300 text-sm mb-2">Maximum Level Reached</div>
              ) : (
                <div className="text-center mb-2">
                  <span className="text-sm text-purple-300">Upgrade Cost</span>
                  <div className="text-lg font-bold text-yellow-400">
                    {calculateUpgradeCost(pc.level).toFixed(3)} POL
                  </div>
                </div>
              )}

              <button
                onClick={() => upgradePC(index)}
                className={`w-full px-4 py-2 rounded-lg text-white flex items-center justify-center gap-2 transition-all ${
                  pc.level >= pc.maxLevel
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }`}
                disabled={pc.level >= pc.maxLevel}
              >
                <FaArrowUp className={pc.level >= pc.maxLevel ? '' : 'animate-bounce'} />
                {pc.level >= pc.maxLevel ? 'Max Level' : 'Upgrade Rig'}
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default UserPCs;
