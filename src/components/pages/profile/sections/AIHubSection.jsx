import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaRobot, FaChartLine, FaBrain, FaLightbulb, FaExclamationCircle, FaSpinner, FaCheckCircle, FaCoins, FaCalendarAlt, FaPercent, FaCubes } from 'react-icons/fa';
import { useStaking } from '../../../../context/StakingContext';
import { ethers } from 'ethers';
import { analyzeStakingPortfolio } from '../../../../utils/staking/stakingAnalytics';

// Extract visualization components for better reuse and memoization
const MetricCard = React.memo(({ name, value, icon }) => (
  <div className="bg-black/20 p-3 rounded border border-purple-500/10 flex items-center gap-2">
    {icon}
    <div>
      <div className="text-gray-400 text-xs">{name}</div>
      <div className="text-white font-medium text-sm">{value}</div>
    </div>
  </div>
));

const RecommendationItem = React.memo(({ recommendation }) => (
  <li className="bg-black/20 p-3 rounded border border-purple-500/10 flex items-start gap-2">
    <FaLightbulb className="text-yellow-400 mt-1 flex-shrink-0" />
    <span className="text-purple-300 text-sm">{recommendation}</span>
  </li>
));

// --- Component ---
const AIHubSection = ({ account }) => {
  const { state, getPoolEvents } = useStaking();
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [eventData, setEventData] = useState({
    totalWithdrawn: 0,
    rewardsClaimed: 0,
  });
  
  // Use AbortController for cleanup in data fetching
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchEvents = async () => {
      try {
        const events = await getPoolEvents({ signal: controller.signal });
        
        if (!isMounted || !events) return;
        
        // Optimize processing with early returns and efficient calculations
        let totalWithdrawn = 0;
        let rewardsClaimed = 0;
        
        // Process withdrawals efficiently
        if (events.withdrawals?.length) {
          rewardsClaimed = events.withdrawals.reduce((sum, withdrawal) => {
            if (withdrawal.args?.amount) {
              return sum + parseFloat(ethers.formatEther(withdrawal.args.amount));
            }
            return sum;
          }, 0);
        }
        
        // Process deposits efficiently 
        if (events.deposits?.length) {
          totalWithdrawn = events.deposits
            .filter(deposit => deposit.args?.amount && !deposit.active)
            .reduce((sum, deposit) => {
              return sum + parseFloat(ethers.formatEther(deposit.args.amount));
            }, 0);
        }
        
        if (isMounted) {
          setEventData({ totalWithdrawn, rewardsClaimed });
        }
      } catch (error) {
        if (!controller.signal.aborted && isMounted) {
          console.error("Error fetching pool events:", error);
        }
      }
    };
    
    if (account) {
      fetchEvents();
    }
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [account, getPoolEvents]);

  // Memoize data for analysis to prevent unnecessary recalculations
  const stakingDataForAnalysis = useMemo(() => ({
    userDeposits: state.userDeposits,
    stakingStats: {
      totalStaked: state.userInfo?.totalStaked || '0',
      pendingRewards: state.userInfo?.pendingRewards || '0'
    },
    totalWithdrawn: eventData.totalWithdrawn,
    rewardsClaimed: eventData.rewardsClaimed,
    stakingConstants: state.STAKING_CONSTANTS || {
      HOURLY_ROI: 0.0001,
      MAX_ROI: 1.25,
      MAX_DEPOSITS_PER_USER: 300
    }
  }), [
    state.userDeposits, 
    state.userInfo?.totalStaked,
    state.userInfo?.pendingRewards,
    state.STAKING_CONSTANTS,
    eventData
  ]);

  // Debounce portfolio analysis to prevent rapid re-executions
  const runPortfolioAnalysis = useCallback(() => {
    if (analysisLoading) return; // Prevent multiple simultaneous analyses
    
    setAnalysisLoading(true);
    setAnalysisResults(null);

    // Use a worker or setTimeout for heavy calculations to not block the UI
    const analysisTimeoutId = setTimeout(() => {
      try {
        const results = analyzeStakingPortfolio(stakingDataForAnalysis);
        setAnalysisResults(results);
      } catch (error) {
        console.error("Analysis failed:", error);
        setAnalysisResults({
          score: 0,
          performanceSummary: "Analysis failed. Please try again.",
          recommendations: [],
          metrics: {}
        });
      } finally {
        setAnalysisLoading(false);
      }
    }, 800); // Reduced delay for better UX
    
    return () => clearTimeout(analysisTimeoutId);
  }, [analysisLoading, stakingDataForAnalysis]);

  // Use stable functions for visual helpers
  const getScoreInfo = useCallback((score) => {
    if (score >= 80) {
      return { color: 'text-green-400', icon: <FaCheckCircle className="text-green-400" /> };
    } else if (score >= 50) {
      return { color: 'text-yellow-400', icon: <FaExclamationCircle className="text-yellow-400" /> };
    } else {
      return { color: 'text-red-400', icon: <FaExclamationCircle className="text-red-400" /> };
    }
  }, []);

  const getMetricIcon = useCallback((metricName) => {
    const icons = {
      'Effective APY': <FaPercent className="text-purple-400" />,
      'Days Staked': <FaCalendarAlt className="text-blue-400" />,
      'Total Earnings': <FaCoins className="text-yellow-400" />,
      'Deposit Slots': <FaCubes className="text-green-400" />
    };
    return icons[metricName] || <FaChartLine className="text-purple-400" />;
  }, []);

  // Render with memoized components for better performance
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
        {/* Analysis Results - now with memoized components */}
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
                {!analysisLoading && analysisResults && (
                  [
                    { name: 'Effective APY', value: analysisResults.metrics.effectiveAPY },
                    { name: 'Days Staked', value: analysisResults.metrics.daysStaked },
                    { name: 'Total Earnings', value: `${analysisResults.metrics.totalEarnings} POL` },
                    { name: 'Deposit Slots', value: analysisResults.metrics.depositUtilization }
                  ].map((metric, index) => (
                    <MetricCard
                      key={index}
                      name={metric.name}
                      value={metric.value}
                      icon={getMetricIcon(metric.name)}
                    />
                  ))
                )}
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

        {/* Recommendations - now with memoized list items */}
        <div className="bg-black/30 p-5 rounded-xl border border-purple-500/30">
          <h3 className="text-lg font-medium text-white mb-3">AI Recommendations</h3>
           {analysisLoading ? (
             <div className="flex flex-col items-center justify-center h-52 text-center">
               <FaSpinner className="text-3xl text-purple-400/50 mb-3 animate-spin" />
             </div>
           ) : analysisResults && analysisResults.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {analysisResults.recommendations.map((rec, index) => (
                 <RecommendationItem key={index} recommendation={rec} />
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

export default React.memo(AIHubSection);
