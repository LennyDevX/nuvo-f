import React, { useState } from 'react';
import { motion as m } from 'framer-motion';
import { FaRobot, FaChartLine, FaBrain, FaLightbulb, FaExclamationCircle } from 'react-icons/fa';

const AIHubSection = ({ account }) => {
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  const runPortfolioAnalysis = () => {
    setAnalysisLoading(true);
    
    // Simulating AI analysis
    setTimeout(() => {
      setAnalysisLoading(false);
      setAnalysisComplete(true);
    }, 2500);
  };

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-6"
    >
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
        <button 
          onClick={runPortfolioAnalysis}
          disabled={analysisLoading}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:transform-none"
        >
          {analysisLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
              Running Analysis...
            </span>
          ) : 'Analyze My Portfolio'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">Recent Analysis</h3>
          {analysisComplete ? (
            <div className="bg-purple-900/20 p-4 rounded-lg mb-2">
              <div className="flex items-center gap-2 mb-2">
                <FaChartLine className="text-purple-400" />
                <span className="text-white font-medium">Portfolio Performance</span>
              </div>
              <p className="text-purple-300 text-sm">Your portfolio is performing 12% better than average in similar market conditions.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FaBrain className="text-3xl text-purple-400/50 mb-3" />
              <p className="text-gray-400">Run an analysis to see insights</p>
            </div>
          )}
          <p className="text-xs text-purple-400 mt-2">
            {analysisComplete ? 'Last updated just now' : 'No recent analysis available'}
          </p>
        </div>
        
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">AI Recommendations</h3>
          {analysisComplete ? (
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-purple-300">
                <FaLightbulb className="text-purple-400 mt-1 flex-shrink-0" />
                <span>Consider increasing your staking position to maximize rewards during the current market conditions</span>
              </li>
              <li className="flex items-start gap-2 text-purple-300">
                <FaLightbulb className="text-purple-400 mt-1 flex-shrink-0" />
                <span>Explore NFT opportunities in the marketplace - 3 new collections match your interests</span>
              </li>
              <li className="flex items-start gap-2 text-purple-300">
                <FaLightbulb className="text-purple-400 mt-1 flex-shrink-0" />
                <span>Complete your profile for more personalized insights and higher accuracy</span>
              </li>
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <FaExclamationCircle className="text-3xl text-purple-400/50 mb-3" />
              <p className="text-gray-400">No recommendations available yet</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-3">Premium AI Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20 flex items-center gap-3">
            <div className="bg-purple-900/30 p-2 rounded-full">
              <FaBrain className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Trading Signals</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
          </div>
          <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20 flex items-center gap-3">
            <div className="bg-purple-900/30 p-2 rounded-full">
              <FaChartLine className="text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">Price Predictions</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default AIHubSection;
