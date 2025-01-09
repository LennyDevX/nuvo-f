import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { FaCoins, FaBolt, FaChartLine, FaClock, FaServer } from 'react-icons/fa';
import { WalletContext } from '../../../context/WalletContext';
import StoreSection from './StoreSection';
import UserPCs from './UserPCs';
import Tooltip from '../../common/Tooltip';

const MINING_PCS = [
  {
    id: 1,
    name: 'Basic Mining Rig',
    basePrice: '0.05',
    baseMiningRate: 0.0001,
    image: '🖥️',
    rarity: 'common',
    maxLevel: 50,
    powerConsumption: 0.00001,
    reliability: 98, // 98% uptime
    nftMetadata: {
      description: "Basic mining rig with stable performance",
      attributes: [
        { trait_type: "Rarity", value: "Common" },
        { trait_type: "Generation", value: "1" }
      ]
    }
  },
  {
    id: 2,
    name: 'Advanced Mining Rig',
    basePrice: '0.15',
    baseMiningRate: 0.0003,
    image: '💻',
    rarity: 'rare',
    maxLevel: 75,
    powerConsumption: 0.00002,
    reliability: 95,
    nftMetadata: {
      description: "Advanced mining rig with enhanced capabilities",
      attributes: [
        { trait_type: "Rarity", value: "Rare" },
        { trait_type: "Generation", value: "1" }
      ]
    }
  },
  {
    id: 3,
    name: 'Pro Mining Rig',
    basePrice: '0.4',
    baseMiningRate: 0.0008,
    image: '🖥️💪',
    rarity: 'epic',
    maxLevel: 100,
    powerConsumption: 0.00004,
    reliability: 92,
    nftMetadata: {
      description: "Professional grade mining rig for serious miners",
      attributes: [
        { trait_type: "Rarity", value: "Epic" },
        { trait_type: "Generation", value: "1" }
      ]
    }
  }
];

const MiningGame = () => {
  const { walletConnected } = useContext(WalletContext);

  const [userPCs, setUserPCs] = useState([]);
  const [tokens, setTokens] = useState('1'); // Reduced initial balance
  const [progress, setProgress] = useState(0);
  const [totalMined, setTotalMined] = useState(0); // Nuevo estado para tracking
  const [stats, setStats] = useState({
    totalMined: 0,
    efficiency: 0,
    totalPower: 0, // Changed from uptime
    dailyEstimate: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (userPCs.length > 0) { // Only progress if user has PCs
        setProgress(prev => {
          if (prev >= 100) {
            setUserPCs(pcs => {
              const newTokens = pcs.reduce((acc, pc) => acc + pc.miningRate * pc.level, 0);
              setTokens(prevTokens => (Number(prevTokens) + newTokens).toFixed(6));
              setTotalMined(prev => prev + newTokens); // Actualizar total minado
              return pcs;
            });
            return 0;
          }
          return prev + 1;
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [userPCs]);

  useEffect(() => {
    const calculateStats = () => {
      const totalMiningRate = userPCs.reduce((acc, pc) => {
        const efficiency = (100 - (pc.level * 0.5)) / 100; // Efficiency decreases with level
        return acc + (pc.miningRate * pc.level * efficiency * (pc.reliability / 100));
      }, 0);

      const totalPowerConsumption = userPCs.reduce((acc, pc) => 
        acc + (pc.powerConsumption * pc.level), 0
      );

      setStats({
        totalMined: totalMined, // Usar el valor trackeado
        efficiency: userPCs.length ? (totalMiningRate / userPCs.length) * 100 : 0,
        totalPower: totalPowerConsumption,
        dailyEstimate: userPCs.length > 0 ? totalMiningRate * 864 : 0 // Solo calcular si hay PCs
      });
    };

    calculateStats();
  }, [userPCs, totalMined]); // Agregar totalMined como dependencia

  const buyPC = (pcType) => {
    const cost = ethers.parseEther(pcType.basePrice);
    if (Number(tokens) >= Number(ethers.formatEther(cost))) {
      setTokens(prev => (Number(prev) - Number(ethers.formatEther(cost))).toFixed(6));
      setUserPCs(prev => [
        ...prev,
        {
          ...pcType,
          level: 1,
          miningRate: pcType.baseMiningRate
        }
      ]);
    }
  };

  const upgradePC = (pcIndex) => {
    const pc = userPCs[pcIndex];
    const upgradeCost = calculateUpgradeCost(pc.level);
    if (Number(tokens) >= upgradeCost && pc.level < 100) {
      setTokens(prev => (Number(prev) - upgradeCost).toFixed(6));
      setUserPCs(prev =>
        prev.map((p, i) => {
          if (i === pcIndex) {
            return {
              ...p,
              level: p.level + 1,
              miningRate: p.baseMiningRate * (p.level + 1)
            };
          }
          return p;
        })
      );
    }
  };

  const calculateUpgradeCost = (level) => {
    return 0.05 * Math.pow(1.2, level); // Adjusted upgrade cost formula
  };

  if (!walletConnected) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-white">
        <p>Por favor conecta tu wallet para acceder al juego.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      {/* Header Section with integrated balance */}
      <div className="text-center mb-12 relative">
        <div className="absolute right-0 top-0 bg-gradient-to-r from-purple-900/60 to-blue-900/60 px-6 py-3 rounded-lg border border-purple-500/30 flex items-center gap-2">
          <Tooltip text="Your current token balance">
            <div className="flex items-center gap-2">
              <FaCoins className="text-yellow-400" />
              <span className="font-bold text-xl text-white">{tokens} POL</span>
            </div>
          </Tooltip>
        </div>
        
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Mining Simulator
        </h1>
        <p className="text-xl text-purple-300 mt-4">
          Mine, upgrade, and earn tokens in the virtual mining world
        </p>
        <span className="inline-block px-3 py-1 mt-3 text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-white">
          Beta 1.0
        </span>
      </div>

      {/* Updated Stats Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Tooltip text="Total POL tokens mined by your rigs">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/20 cursor-help">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <FaCoins />
              <span className="text-sm text-purple-300">Mining Rewards</span>
            </div>
            <span className="text-xl font-bold text-white">
              {userPCs.length > 0 ? stats.totalMined.toFixed(6) : '0.000000'} POL
            </span>
          </div>
        </Tooltip>
        
        <Tooltip text="Overall mining efficiency of your rigs">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/20 cursor-help">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <FaBolt />
              <span className="text-sm text-purple-300">Hash Power</span>
            </div>
            <span className="text-xl font-bold text-white">{stats.efficiency.toFixed(2)}%</span>
          </div>
        </Tooltip>

        <Tooltip text="Total power consumption of your mining farm">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/20 cursor-help">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <FaServer />
              <span className="text-sm text-purple-300">Power Usage</span>
            </div>
            <span className="text-xl font-bold text-white">{stats.totalPower.toFixed(6)} kW/s</span>
          </div>
        </Tooltip>

        <Tooltip text="Estimated tokens you can mine in 24 hours">
          <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 p-4 rounded-xl border border-purple-500/20 cursor-help">
            <div className="flex items-center gap-2 text-pink-400 mb-1">
              <FaChartLine />
              <span className="text-sm text-purple-300">Daily Estimate</span>
            </div>
            <span className="text-xl font-bold text-white">{stats.dailyEstimate.toFixed(6)} POL</span>
          </div>
        </Tooltip>
      </div>

      {/* Store Section */}
      <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl p-8 mb-8 border border-purple-500/20 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Available Mining Rigs</h2>
        <StoreSection MINING_PCS={MINING_PCS} buyPC={buyPC} />
      </div>

      {/* Mining Farm Section */}
      {userPCs.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-8 border border-purple-500/20 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Mining Farm</h2>
          <UserPCs 
            userPCs={userPCs}
            upgradePC={upgradePC}
            calculateUpgradeCost={calculateUpgradeCost}
          />

          {/* Improved Progress Bar */}
          <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="flex justify-between text-sm text-purple-300 mb-2">
              <span>Mining Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="relative h-4 bg-purple-900/30 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/20">
              <motion.div
                className="absolute left-0 h-full bg-gradient-to-r from-green-500 via-emerald-400 to-green-500 shadow-lg"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s linear infinite',
                }}
                animate={{
                  width: `${progress}%`,
                  background: progress > 80 
                    ? 'linear-gradient(to right, #22c55e, #10b981, #22c55e)'
                    : 'linear-gradient(to right, #22c55e, #10b981, #22c55e)',
                }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MiningGame;