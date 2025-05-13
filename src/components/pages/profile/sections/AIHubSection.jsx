import React, { useState, useMemo, useEffect } from 'react';
import { motion as m } from 'framer-motion';
import { FaRobot, FaChartLine, FaBrain, FaLightbulb, FaExclamationCircle, FaSpinner, FaCheckCircle, FaCoins, FaCalendarAlt, FaPercent, FaCubes } from 'react-icons/fa';
import { useStaking } from '../../../../context/StakingContext';
import { ethers } from 'ethers';
import { analyzeStakingPortfolio } from '../../../../utils/staking/stakingAnalytics';

// --- Component ---
const AIHubSection = ({ account }) => {
  const { state, getPoolEvents } = useStaking(); // Access staking state and methods
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [eventData, setEventData] = useState({
    totalWithdrawn: 0,
    rewardsClaimed: 0,
  });
  
  // Fetch event data when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getPoolEvents();
        
        // Process withdrawals to calculate total withdrawn and rewards claimed
        if (events && events.withdrawals) {
          let totalWithdrawn = 0;
          let rewardsClaimed = 0;
          
          events.withdrawals.forEach(withdrawal => {
            // Regular withdrawals are rewards
            if (withdrawal.args && withdrawal.args.amount) {
              rewardsClaimed += parseFloat(ethers.formatEther(withdrawal.args.amount));
            }
          });
          
          // For emergency withdrawals, these are stake withdrawals
          if (events.deposits) {
            totalWithdrawn = events.deposits
              .filter(deposit => deposit.args && deposit.args.amount && !deposit.active)
              .reduce((sum, deposit) => sum + parseFloat(ethers.formatEther(deposit.args.amount)), 0);
          }
          
          setEventData({
            totalWithdrawn,
            rewardsClaimed
          });
        }
      } catch (error) {
        console.error("Error fetching pool events:", error);
      }
    };
    
    if (account) {
      fetchEvents();
    }
  }, [account, getPoolEvents]);

  // Memoize necessary data from context to prevent unnecessary recalculations
  const stakingDataForAnalysis = useMemo(() => {
    return {
      userDeposits: state.userDeposits,
      stakingStats: {
        totalStaked: state.userInfo?.totalStaked || '0',
        pendingRewards: state.userInfo?.pendingRewards || '0'
      },
      totalWithdrawn: eventData.totalWithdrawn,
      rewardsClaimed: eventData.rewardsClaimed,
      stakingConstants: state.STAKING_CONSTANTS || {
        HOURLY_ROI: 0.0001, // 0.01% hourly
        MAX_ROI: 1.25, // 125%
        MAX_DEPOSITS_PER_USER: 300 // Using correct value from contract
      }
    };
  }, [state.userDeposits, state.userInfo, state.STAKING_CONSTANTS, eventData]);


  const runPortfolioAnalysis = () => {
    setAnalysisLoading(true);
    setAnalysisResults(null); // Clear previous results

    // Simulate AI analysis time + run the actual algorithm
    setTimeout(() => {
      try {
        const results = analyzeStakingPortfolio(stakingDataForAnalysis);
        setAnalysisResults(results);
      } catch (error) {
        console.error("Analysis failed:", error);
        // Set a fallback error state
        setAnalysisResults({
          score: 0,
          performanceSummary: "Analysis failed. Please try again.",
          recommendations: [],
          metrics: {}
        });
      } finally {
        setAnalysisLoading(false);
      }
    }, 1500); // Reduced delay
  };

  // Map score to color and icon
  const getScoreInfo = (score) => {
    if (score >= 80) {
      return { color: 'text-green-400', icon: <FaCheckCircle className="text-green-400" /> };
    } else if (score >= 50) {
      return { color: 'text-yellow-400', icon: <FaExclamationCircle className="text-yellow-400" /> };
    } else {
      return { color: 'text-red-400', icon: <FaExclamationCircle className="text-red-400" /> };
    }
  };

  // Get metric icon based on name
  const getMetricIcon = (metricName) => {
    const icons = {
      'Effective APY': <FaPercent className="text-purple-400" />,
      'Days Staked': <FaCalendarAlt className="text-blue-400" />,
      'Total Earnings': <FaCoins className="text-yellow-400" />,
      'Deposit Slots': <FaCubes className="text-green-400" />
    };
    return icons[metricName] || <FaChartLine className="text-purple-400" />;
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
        <h2 className="text-2xl font-bold text-white">AI Staking Analyzer</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Analysis Results */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">Analysis Summary</h3>
          {analysisLoading ? (
             <div className="flex flex-col items-center justify-center h-52 text-center">
               <FaSpinner className="text-3xl text-purple-400/50 mb-3 animate-spin" />
               <p className="text-gray-400">Running analysis...</p>
             </div>
          ) : analysisResults ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  {/* Fixed score display */}
                  <div className="w-28 h-28 rounded-full bg-black/50 border-4 border-gray-800 flex items-center justify-center">
                    <span className={`text-5xl font-bold ${getScoreInfo(analysisResults.score).color}`}>
                      {analysisResults.score}
                    </span>
                    <div className="absolute top-1 right-1">
                      {getScoreInfo(analysisResults.score).icon}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-black/80 px-2 py-0.5 rounded text-xs text-gray-400">
                    Score
                  </div>
                </div>
              </div>
               
              <p className="text-purple-300 text-sm text-center">{analysisResults.performanceSummary}</p>
               
              {/* Display Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  { name: 'Effective APY', value: analysisResults.metrics.effectiveAPY },
                  { name: 'Days Staked', value: analysisResults.metrics.daysStaked },
                  { name: 'Total Earnings', value: `${analysisResults.metrics.totalEarnings} POL` },
                  { name: 'Deposit Slots', value: analysisResults.metrics.depositUtilization }
                ].map((metric, index) => (
                  <div key={index} className="bg-black/20 p-3 rounded border border-purple-500/10 flex items-center gap-2">
                    {getMetricIcon(metric.name)}
                    <div>
                      <div className="text-gray-400 text-xs">{metric.name}</div>
                      <div className="text-white font-medium text-sm">{metric.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <FaBrain className="text-3xl text-purple-400/50 mb-3" />
              <p className="text-gray-400">Run an analysis to see insights</p>
            </div>
          )}
          <p className="text-xs text-purple-400 mt-4 text-center">
            {analysisResults ? 'Analysis complete based on your on-chain staking history.' : 'No recent analysis available'}
          </p>
        </div>

        {/* Recommendations */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">AI Recommendations</h3>
           {analysisLoading ? (
             <div className="flex flex-col items-center justify-center h-52 text-center">
               <FaSpinner className="text-3xl text-purple-400/50 mb-3 animate-spin" />
             </div>
           ) : analysisResults && analysisResults.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {analysisResults.recommendations.map((rec, index) => (
                 <li key={index} className="bg-black/20 p-3 rounded border border-purple-500/10 flex items-start gap-2">
                   <FaLightbulb className="text-yellow-400 mt-1 flex-shrink-0" />
                   <span className="text-purple-300 text-sm">{rec}</span>
                 </li>
              ))}
            </ul>
          ) : analysisResults && analysisResults.recommendations.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-52 text-center">
                <FaCheckCircle className="text-3xl text-green-400/70 mb-3" />
                <p className="text-gray-400">No specific recommendations at this time. Keep up the good work!</p>
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <FaExclamationCircle className="text-3xl text-purple-400/50 mb-3" />
              <p className="text-gray-400">Run analysis to get recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Analysis Button Section */}
      <div className="my-8 px-4 py-6 md:py-8 rounded-xl bg-gradient-to-b from-purple-900/10 to-black/10 border border-purple-500/10 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-purple-500/10 blur-xl"></div>
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-purple-500/10 blur-xl"></div>
        
        <p className="text-gray-300 mb-5 max-w-lg mx-auto">
          Our AI will analyze your staking portfolio and provide personalized insights to optimize your returns
        </p>
        
        <m.button
          onClick={runPortfolioAnalysis}
          disabled={analysisLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-4 md:min-w-[240px] bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-600/30 disabled:opacity-70 disabled:cursor-wait"
        >
          {analysisLoading ? (
            <span className="flex items-center justify-center gap-3">
              <FaSpinner className="animate-spin text-lg" />
              <span>Processing...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FaBrain className="text-lg" />
              <span>Analyze My Portfolio</span>
            </span>
          )}
        </m.button>
        
        <p className="text-xs text-purple-400/70 mt-4">
          {analysisLoading ? 
            "Running advanced analysis algorithms..." : 
            "Advanced neural networks will process your staking history"
          }
        </p>
      </div>

      {/* Premium Features section */}
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
