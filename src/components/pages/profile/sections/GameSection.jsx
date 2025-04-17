import React from 'react';
import { motion as m } from 'framer-motion';
import { FaGamepad, FaCoins, FaChartLine, FaLayerGroup, FaTrophy, FaExternalLinkAlt } from 'react-icons/fa';

const GameSection = ({ account }) => {
  const gameAchievements = [
    { 
      name: "Early Tester", 
      description: "Joined the platform during beta phase", 
      icon: <FaGamepad className="text-purple-400" />, 
      unlocked: true 
    },
    { 
      name: "First Win", 
      description: "Win your first game", 
      icon: <FaTrophy className="text-purple-400" />, 
      unlocked: false 
    }
  ];
  
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
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
        <a
          href="/game"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-0.5"
        >
          Visit Game Center <FaExternalLinkAlt size={12} />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Game Stats */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-4">Your Game Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Games Played</span>
              <span className="text-white font-bold">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Total Earnings</span>
              <span className="text-green-400 font-bold">0 NUVO</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Win Rate</span>
              <span className="text-white font-bold">0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-300">Leaderboard Position</span>
              <span className="text-white font-bold">-</span>
            </div>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-4">Achievements</h3>
          <div className="space-y-3">
            {gameAchievements.map((achievement, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg flex items-start gap-3 ${
                  achievement.unlocked ? 'bg-purple-900/20' : 'bg-black/30 opacity-70'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  achievement.unlocked ? 'bg-purple-900/30' : 'bg-gray-800/50'
                }`}>
                  {achievement.icon}
                </div>
                <div>
                  <h4 className={`font-medium ${
                    achievement.unlocked ? 'text-white' : 'text-gray-400'
                  }`}>{achievement.name}</h4>
                  <p className="text-xs text-gray-400">{achievement.description}</p>
                </div>
                {achievement.unlocked && (
                  <div className="ml-auto">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Game Features */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Upcoming Game Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20 text-center">
            <div className="w-12 h-12 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-3">
              <FaCoins className="text-xl text-purple-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Game Rewards</h4>
            <p className="text-purple-300 text-sm">Earn tokens by participating in games and competitions</p>
          </div>
          
          <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20 text-center">
            <div className="w-12 h-12 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-3">
              <FaChartLine className="text-xl text-purple-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">Tournaments</h4>
            <p className="text-purple-300 text-sm">Compete against other players for prizes and leaderboard positions</p>
          </div>
          
          <div className="bg-black/30 p-5 rounded-xl border border-purple-500/20 text-center">
            <div className="w-12 h-12 bg-purple-900/40 rounded-full mx-auto flex items-center justify-center mb-3">
              <FaLayerGroup className="text-xl text-purple-400" />
            </div>
            <h4 className="text-lg font-medium text-white mb-2">NFT Power-ups</h4>
            <p className="text-purple-300 text-sm">Use your NFTs to gain advantages and unique abilities in games</p>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default GameSection;
