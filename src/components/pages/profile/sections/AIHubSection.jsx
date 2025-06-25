import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion as m } from 'framer-motion';
import { FaRobot, FaChartLine, FaBrain, FaLightbulb, FaExclamationCircle, FaSpinner, FaCheckCircle, FaCoins, FaCalendarAlt, FaPercent, FaCubes, FaTrophy, FaBullseye, FaClock } from 'react-icons/fa';
import { useStaking } from '../../../../context/StakingContext';
import { ethers } from 'ethers';
import { analyzeStakingPortfolio } from '../../../../utils/staking/stakingAnalytics';
import { calculateUserAPY, formatAPY } from '../../../../utils/staking/apyCalculations';

// Extract visualization components for better reuse and memoization
const MetricCard = React.memo(({ name, value, icon, trend, isHighlight }) => (
  <div className={`bg-black/20 p-3 rounded border transition-all duration-200 flex items-center gap-2 ${
    isHighlight ? 'border-purple-400/40 bg-purple-900/20' : 'border-purple-500/10'
  }`}>
    {icon}
    <div>
      <div className="text-gray-400 text-xs">{name}</div>
      <div className="text-white font-medium text-sm flex items-center gap-1">
        {value}
        {trend && <span className={`text-xs ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {trend > 0 ? '↗' : '↘'}
        </span>}
      </div>
    </div>
  </div>
));

const RecommendationItem = React.memo(({ recommendation, priority = 'normal' }) => {
  const priorityColors = {
    critical: 'text-red-300 border-red-500/20 bg-red-900/10',
    high: 'text-yellow-300 border-yellow-500/20 bg-yellow-900/10',
    normal: 'text-purple-300 border-purple-500/10 bg-black/20'
  };

  return (
    <li className={`p-3 rounded border flex items-start gap-2 ${priorityColors[priority]}`}>
      <FaLightbulb className="text-yellow-400 mt-1 flex-shrink-0" />
      <span className="text-sm">{recommendation}</span>
    </li>
  );
});

const ScoreDisplay = React.memo(({ score, apyAnalysis }) => {
  const getScoreInfo = useCallback((score) => {
    if (score >= 80) {
      return { 
        color: 'text-green-400', 
        icon: <FaTrophy className="text-green-400" />,
        bgColor: 'from-green-900/30 to-green-800/10',
        label: 'Excellent'
      };
    } else if (score >= 60) {
      return { 
        color: 'text-blue-400', 
        icon: <FaBullseye className="text-blue-400" />,
        bgColor: 'from-blue-900/30 to-blue-800/10',
        label: 'Good'
      };
    } else if (score >= 40) {
      return { 
        color: 'text-yellow-400', 
        icon: <FaChartLine className="text-yellow-400" />,
        bgColor: 'from-yellow-900/30 to-yellow-800/10',
        label: 'Fair'
      };
    } else {
      return { 
        color: 'text-red-400', 
        icon: <FaExclamationCircle className="text-red-400" />,
        bgColor: 'from-red-900/30 to-red-800/10',
        label: 'Needs Work'
      };
    }
  }, []);

  const scoreInfo = getScoreInfo(score);

  return (
    <div className="flex items-center justify-center mb-4">
      <div className="relative">
        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${scoreInfo.bgColor} border-4 border-gray-800 flex flex-col items-center justify-center`}>
          <span className={`text-3xl sm:text-4xl font-bold ${scoreInfo.color}`}>
            {score}
          </span>
          <span className="text-xs text-gray-400">{scoreInfo.label}</span>
          <div className="absolute -top-1 -right-1">
            {scoreInfo.icon}
          </div>
        </div>
        
      </div>
    </div>
  );
});

// --- Component ---
const AIHubSection = ({ account }) => {
  const { state, getPoolEvents, STAKING_CONSTANTS } = useStaking();
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [eventData, setEventData] = useState({
    totalWithdrawn: 0,
    rewardsClaimed: 0,
  });
  
  // Calculate user's APY analysis for enhanced metrics
  const userAPYAnalysis = useMemo(() => {
    if (!state.userDeposits?.length || !account) return null;

    const firstDepositTimestamp = state.userDeposits.reduce((earliest, deposit) =>
      deposit.timestamp < earliest ? deposit.timestamp : earliest,
      state.userDeposits[0].timestamp
    );
    const stakingDays = Math.floor((Date.now() / 1000 - firstDepositTimestamp) / (24 * 3600));

    const userData = {
      userDeposits: state.userDeposits,
      totalStaked: state.userInfo?.totalStaked || '0',
      stakingDays,
      totalWithdrawn: eventData.totalWithdrawn,
      rewardsClaimed: eventData.rewardsClaimed
    };

    return calculateUserAPY(userData, STAKING_CONSTANTS);
  }, [state.userDeposits, state.userInfo?.totalStaked, account, STAKING_CONSTANTS, eventData]);

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

  // Enhanced data for analysis with APY integration
  const stakingDataForAnalysis = useMemo(() => ({
    userDeposits: state.userDeposits,
    stakingStats: {
      totalStaked: state.userInfo?.totalStaked || '0',
      pendingRewards: state.userInfo?.pendingRewards || '0'
    },
    totalWithdrawn: eventData.totalWithdrawn,
    rewardsClaimed: eventData.rewardsClaimed,
    stakingConstants: STAKING_CONSTANTS,
    apyAnalysis: userAPYAnalysis // Include APY analysis in the data
  }), [
    state.userDeposits, 
    state.userInfo?.totalStaked,
    state.userInfo?.pendingRewards,
    STAKING_CONSTANTS,
    eventData,
    userAPYAnalysis
  ]);

  // Debounce portfolio analysis with enhanced APY integration
  const runPortfolioAnalysis = useCallback(() => {
    if (analysisLoading) return;
    
    setAnalysisLoading(true);
    setAnalysisResults(null);

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
    }, 800);
    
    return () => clearTimeout(analysisTimeoutId);
  }, [analysisLoading, stakingDataForAnalysis]);

  const getMetricIcon = useCallback((metricName) => {
    const icons = {
      'Effective APY': <FaPercent className="text-purple-400" />,
      'Base APY': <FaPercent className="text-gray-400" />,
      'APY Bonus': <FaPercent className="text-green-400" />,
      'Days Staked': <FaCalendarAlt className="text-blue-400" />,
      'Total Earnings': <FaCoins className="text-yellow-400" />,
      'Time Bonus': <FaClock className="text-blue-400" />,
      'Volume Bonus': <FaCoins className="text-green-400" />,
      'ROI': <FaChartLine className="text-purple-400" />
    };
    return icons[metricName] || <FaChartLine className="text-purple-400" />;
  }, []);

  // Enhanced metrics display with APY breakdown
  const enhancedMetrics = useMemo(() => {
    if (!analysisResults?.metrics) return [];
    
    return [
      { name: 'Effective APY', value: analysisResults.metrics.effectiveAPY, isHighlight: true },
      { name: 'Base APY', value: analysisResults.metrics.baseAPY },
      { name: 'APY Bonus', value: analysisResults.metrics.apyBonus, isHighlight: analysisResults.metrics.apyBonus !== '0.0%' },
      { name: 'Days Staked', value: analysisResults.metrics.daysStaked },
      { name: 'Total Earnings', value: `${analysisResults.metrics.totalEarnings} POL` },
      { name: 'ROI', value: analysisResults.metrics.roi }
    ];
  }, [analysisResults]);

  // Prioritize recommendations based on content
  const prioritizedRecommendations = useMemo(() => {
    if (!analysisResults?.recommendations) return [];
    
    return analysisResults.recommendations.map(rec => {
      let priority = 'normal';
      if (rec.includes('🚨 Critical')) priority = 'critical';
      else if (rec.includes('⚡') || rec.includes('⏰')) priority = 'high';
      
      return { text: rec, priority };
    });
  }, [analysisResults]);

  // Render with memoized components for better performance
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="nuvos-card rounded-xl border border-purple-500/30 p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="p-2 sm:p-3 bg-purple-500/20 rounded-full">
          <FaRobot className="text-xl sm:text-2xl text-purple-400" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">AI Staking Analyzer</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Enhanced Analysis Results */}
        <div className="bg-black/30 p-4 sm:p-5 rounded-xl border border-purple-500/30 order-2 xl:order-1">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3">Analysis Summary</h3>
          {analysisLoading ? (
             <div className="flex flex-col items-center justify-center h-40 sm:h-52 text-center">
               <FaSpinner className="text-2xl sm:text-3xl text-purple-400/50 mb-3 animate-spin" />
               <p className="text-sm text-gray-400">Running advanced APY analysis...</p>
             </div>
          ) : analysisResults ? (
            <div className="space-y-4">
              <ScoreDisplay score={analysisResults.score} apyAnalysis={userAPYAnalysis} />
               
              <p className="text-purple-300 text-sm text-center px-2 leading-relaxed">
                {analysisResults.performanceSummary}
              </p>
               
              {/* Enhanced metrics grid with APY focus */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                {enhancedMetrics.map((metric, index) => (
                  <MetricCard
                    key={index}
                    name={metric.name}
                    value={metric.value}
                    icon={getMetricIcon(metric.name)}
                    isHighlight={metric.isHighlight}
                  />
                ))}
              </div>

              {/* APY Performance Indicator */}
              {userAPYAnalysis && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/20">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">APY Performance</div>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-lg font-bold text-white">
                        {formatAPY(userAPYAnalysis.effectiveAPY)}
                      </span>
                      <span className="text-xs text-gray-400">vs</span>
                      <span className="text-sm text-gray-500">
                        {formatAPY(userAPYAnalysis.baseAPY)} base
                      </span>
                    </div>
                    <div className="text-xs text-purple-300 mt-1">
                      {userAPYAnalysis.effectiveAPY > userAPYAnalysis.baseAPY ? 
                        `+${((userAPYAnalysis.effectiveAPY / userAPYAnalysis.baseAPY - 1) * 100).toFixed(1)}% above base` :
                        'At base rate'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <FaBrain className="text-3xl text-purple-400/50 mb-3" />
              <p className="text-gray-400">Run an analysis to see APY insights</p>
            </div>
          )}
        </div>

        {/* Enhanced Recommendations with priorities */}
        <div className="bg-black/30 p-4 sm:p-5 rounded-xl border border-purple-500/30 order-1 xl:order-2">
          <h3 className="text-base sm:text-lg font-medium text-white mb-3">AI Recommendations</h3>
           {analysisLoading ? (
             <div className="flex flex-col items-center justify-center h-40 sm:h-52 text-center">
               <FaSpinner className="text-2xl sm:text-3xl text-purple-400/50 mb-3 animate-spin" />
               <p className="text-sm text-gray-400">Generating smart recommendations...</p>
             </div>
           ) : analysisResults && prioritizedRecommendations.length > 0 ? (
            <ul className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-none overflow-y-auto">
              {prioritizedRecommendations.map((rec, index) => (
                <RecommendationItem 
                  key={index} 
                  recommendation={rec.text} 
                  priority={rec.priority}
                />
              ))}
            </ul>
          ) : analysisResults && prioritizedRecommendations.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-52 text-center">
                <FaCheckCircle className="text-3xl text-green-400/70 mb-3" />
                <p className="text-gray-400">Perfect optimization! No recommendations needed.</p>
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-52 text-center">
              <FaExclamationCircle className="text-3xl text-purple-400/50 mb-3" />
              <p className="text-gray-400">Run analysis to get smart recommendations</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Analysis Button */}
      <div className="my-6 sm:my-8 px-3 sm:px-4 py-4 sm:py-6 md:py-8 rounded-xl bg-gradient-to-b from-purple-900/10 to-black/10 border border-purple-500/10 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-purple-500/10 blur-xl"></div>
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-purple-500/10 blur-xl"></div>
        
        <p className="text-gray-300 mb-4 sm:mb-5 max-w-lg mx-auto text-sm sm:text-base px-2">
          Advanced AI analysis of your staking strategy, APY optimization, and personalized recommendations
        </p>
        
        <m.button
          onClick={runPortfolioAnalysis}
          disabled={analysisLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto sm:min-w-[240px] bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-medium transition-all shadow-lg shadow-purple-900/20 hover:shadow-purple-600/30 disabled:opacity-70 disabled:cursor-wait"
        >
          {analysisLoading ? (
            <span className="flex items-center justify-center gap-2 sm:gap-3">
              <FaSpinner className="animate-spin text-base sm:text-lg" />
              <span className="text-sm sm:text-base">Analyzing APY...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FaBrain className="text-base sm:text-lg" />
              <span className="text-sm sm:text-base">Analyze My Portfolio</span>
            </span>
          )}
        </m.button>
        
        <p className="text-xs text-purple-400/70 mt-3 sm:mt-4 px-2">
          {analysisLoading ? 
            "Analyzing APY optimization and strategy..." : 
            "AI-powered APY analysis with smart optimization tips"
          }
        </p>
      </div>

      {/* Compact Premium Features section */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-900/20 border border-purple-500/20 rounded-lg">
        <h3 className="text-base sm:text-lg font-medium text-white mb-3">Premium AI Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-black/30 p-2 sm:p-3 rounded-lg border border-purple-500/20 flex items-center gap-2 sm:gap-3">
            <div className="bg-purple-900/30 p-1.5 sm:p-2 rounded-full">
              <FaBrain className="text-purple-400 text-sm sm:text-base" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Trading Signals</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
          </div>
          <div className="bg-black/30 p-2 sm:p-3 rounded-lg border border-purple-500/20 flex items-center gap-2 sm:gap-3">
            <div className="bg-purple-900/30 p-1.5 sm:p-2 rounded-full">
              <FaChartLine className="text-purple-400 text-sm sm:text-base" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Price Predictions</p>
              <p className="text-xs text-gray-400">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </m.div>
  );
};

export default React.memo(AIHubSection);
