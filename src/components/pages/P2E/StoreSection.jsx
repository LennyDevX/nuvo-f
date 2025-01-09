import { motion } from 'framer-motion';
import { FaBolt, FaServer, FaCog, FaStar, FaCheckCircle } from 'react-icons/fa';
import Tooltip from '../../common/Tooltip';

const StoreSection = ({ MINING_PCS, buyPC }) => {
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return { border: 'border-gray-500/30', bg: 'from-gray-600/50 to-gray-700/50' };
      case 'rare': return { border: 'border-blue-500/30', bg: 'from-blue-600/50 to-blue-700/50' };
      case 'epic': return { border: 'border-purple-500/30', bg: 'from-purple-600/50 to-purple-700/50' };
      default: return { border: 'border-gray-500/30', bg: 'from-gray-600/50 to-gray-700/50' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {MINING_PCS.map(pc => {
        const colors = getRarityColor(pc.rarity);
        return (
          <motion.div
            key={pc.id}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`bg-gradient-to-br from-purple-800/30 to-blue-800/30 p-6 rounded-lg border ${colors.border} hover:border-opacity-50`}
          >
            {/* Rarity Badge */}
            <div className="relative mb-6">
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${colors.bg} flex items-center gap-2`}>
                <FaStar className="text-yellow-400" />
                <span className="text-white">{pc.rarity.toUpperCase()}</span>
              </div>
              <div className="text-5xl text-center filter drop-shadow-lg">{pc.image}</div>
            </div>
            
            {/* Title and Description */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">{pc.name}</h3>
              <p className="text-sm text-purple-300">{pc.nftMetadata.description}</p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Tooltip text="Mining power of your rig">
                <div className="bg-purple-900/20 p-2 rounded-lg cursor-help">
                  <div className="flex items-center gap-2 text-green-400 mb-1 text-xs">
                    <FaBolt />
                    <span>Hash Rate</span>
                  </div>
                  <span className="text-white font-mono">{pc.baseMiningRate}/s</span>
                </div>
              </Tooltip>
              
              <Tooltip text="Energy required to operate">
                <div className="bg-purple-900/20 p-2 rounded-lg cursor-help">
                  <div className="flex items-center gap-2 text-blue-400 mb-1 text-xs">
                    <FaServer />
                    <span>Power Use</span>
                  </div>
                  <span className="text-white font-mono">{pc.powerConsumption} kW/s</span>
                </div>
              </Tooltip>
            </div>

            {/* Features List */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <FaCheckCircle className="text-green-400" />
                <span>Max Level: {pc.maxLevel}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <FaCheckCircle className="text-green-400" />
                <span>Reliability: {pc.reliability}%</span>
              </div>
            </div>

            {/* Price and Buy Button */}
            <div className="mt-4 pt-4 border-t border-purple-500/20">
              <div className="text-center mb-3">
                <span className="text-sm text-purple-300">Price</span>
                <div className="text-2xl font-bold text-yellow-400">
                  {pc.basePrice} POL
                </div>
              </div>

              <button
                onClick={() => buyPC(pc)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all rounded-lg text-white font-semibold flex items-center justify-center gap-2"
              >
                <FaCog className="animate-spin" />
                Buy Mining Rig
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StoreSection;
