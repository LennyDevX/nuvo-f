import { ethers } from 'ethers';
import { calculateContractBasedAPY, calculateEnhancedUserAPY, calculateUserAPY, calculateBaseAPY, formatAPY } from './apyCalculations';
import { 
  calculateExpandedScore, 
  calculateRiskMetrics, 
  generateBasicPredictions,
  calculateConsistencyIndex,
  calculateCapitalEfficiency,
  calculateTemporalDiversification,
  calculateSharpeRatio,
  calculateConcentrationRisk,
  calculateLiquidityRisk,
  calculateTimingRisk,
  calculateOverallRiskScore,
  getRiskLevel,
  calculateOptimalStakingAmount,
  identifyOptimalTiming,
  projectFutureRewards,
  generateRiskAdjustedRecommendations
} from './advancedMetrics';

/**
 * Utility function for safe BigInt/number parsing and formatting
 * @param {*} value - The value to parse
 * @returns {number} Parsed floating point number
 */
export const safeParseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  
  try {
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    
    if (typeof value === 'string') {
      // Check if it's a decimal or scientific notation
      if (value.includes('.') || value.includes('e')) {
        return parseFloat(value) || 0;      
      }
      // If it's a whole number string, treat it as wei and convert
      return parseFloat(ethers.formatEther(value)) || 0;
    }
    
    if (typeof value === 'bigint') {
      return parseFloat(ethers.formatEther(value.toString())) || 0;
    }
    
    // Handle objects with toString method
    if (value && typeof value.toString === 'function') {
      const stringValue = value.toString();
      if (stringValue.includes('.') || stringValue.includes('e')) {
        return parseFloat(stringValue) || 0;
      }
      return parseFloat(ethers.formatEther(stringValue)) || 0;
    }
    
    return 0;
  } catch (error) {
    console.error("Error parsing amount:", error, value);
    return 0;
  }
};

/**
 * Calculate time bonus based on staking duration
 * @param {number} daysStaked - Days user has been staking
 * @returns {number} Bonus multiplier (0.01 = 1%)
 */
export const calculateTimeBonus = (daysStaked) => {
  // REALITY FROM CONTRACT: No real bonuses
  // This function only exists for UI compatibility
  return 0; // Always 0 because contract doesn't have bonuses
};

/**
 * DEPRECATED: Replaced by calculateExpandedScore in advancedMetrics.js
 * Keeping for backward compatibility
 */
const calculateAdvancedScore = (stakingData, apyAnalysis) => {
  // Use the new expanded scoring system
  const expandedScore = calculateExpandedScore(stakingData, apyAnalysis);
  return expandedScore.totalScore;
};

/**
 * Generate enhanced intelligent recommendations with risk analysis and predictions
 * @param {Object} stakingData - User's staking data
 * @param {Object} apyAnalysis - APY analysis results
 * @param {number} score - Portfolio score
 * @param {Object} expandedScore - Detailed scoring breakdown
 * @param {Object} riskMetrics - Risk analysis results
 * @param {Object} predictions - Basic predictions
 * @returns {Array} Array of intelligent recommendations
 */
const generateEnhancedRecommendations = (stakingData, apyAnalysis, score, expandedScore, riskMetrics, predictions) => {
  const recommendations = [];
  const stakingDays = apyAnalysis?.metrics.stakingDays || 0;
  const totalStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
  const depositCount = stakingData.userDeposits?.length || 0;
  const maxDeposits = stakingData.stakingConstants?.MAX_DEPOSITS_PER_USER || 300;
  
  // FASE 1: Recomendaciones basadas en scoring expandido
  
  // Critical recommendations (score < 30)
  if (score < 30) {
    if (expandedScore.categoryScores.stakingAmount < 5) {
      recommendations.push({
        type: 'critical',
        priority: 'high',
        message: "🚨 Crítico: Aumenta tu stake a al menos 100 POL para mejorar significativamente las recompensas",
        category: 'staking_amount',
        impact: 'high'
      });
    }
    if (expandedScore.categoryScores.timeCommitment < 5) {
      recommendations.push({
        type: 'critical',
        priority: 'high',
        message: "🚨 Crítico: Mantén el staking por al menos 30 días para establecer una base sólida",
        category: 'time_commitment',
        impact: 'high'
      });
    }
    if (expandedScore.categoryScores.efficiency < 3) {
      recommendations.push({
        type: 'critical',
        priority: 'high',
        message: "🚨 Crítico: Estás usando demasiados slots de depósito. Consolida en depósitos más grandes",
        category: 'efficiency',
        impact: 'medium'
      });
    }
  }
  
  // FASE 2: Recomendaciones basadas en análisis de riesgo
  
  // Risk-based recommendations
  if (riskMetrics.overallRiskScore >= 60) {
    recommendations.push({
      type: 'risk_management',
      priority: 'high',
      message: `🛡️ Tu portfolio tiene un riesgo ${riskMetrics.riskLevel}. Score de riesgo: ${riskMetrics.overallRiskScore}/100`,
      category: 'risk',
      impact: 'high'
    });
  }
  
  if (riskMetrics.concentrationRisk.level === 'high') {
    recommendations.push({
      type: 'diversification',
      priority: 'medium',
      message: "📊 Diversifica tus depósitos para reducir el riesgo de concentración",
      category: 'risk',
      impact: 'medium'
    });
  }
  
  if (riskMetrics.liquidityRisk.level === 'high') {
    recommendations.push({
      type: 'liquidity',
      priority: 'medium',
      message: "💧 Reduce los retiros frecuentes para mejorar la eficiencia APY",
      category: 'risk',
      impact: 'medium'
    });
  }
  
  // Consistency-based recommendations
  if (expandedScore.breakdown.consistency.score < 50) {
    recommendations.push({
      type: 'consistency',
      priority: 'medium',
      message: `📅 Mejora la consistencia de tus depósitos. Patrón actual: ${expandedScore.breakdown.consistency.frequency}`,
      category: 'strategy',
      impact: 'medium'
    });
  }
  
  // Capital efficiency recommendations
  if (expandedScore.breakdown.capitalEfficiency.efficiencyRating === 'poor') {
    recommendations.push({
      type: 'efficiency',
      priority: 'medium',
      message: "⚡ Optimiza la eficiencia de capital. ROI anualizado actual: " + 
               expandedScore.breakdown.capitalEfficiency.annualizedROI.toFixed(2) + "%",
      category: 'efficiency',
      impact: 'high'
    });
  }
  
  // FASE 2: Recomendaciones predictivas
  
  // Optimal amount recommendations
  if (predictions.optimalStakingAmount.confidence === 'high') {
    const currentStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
    if (predictions.optimalStakingAmount.recommended > currentStaked * 1.2) {
      recommendations.push({
        type: 'optimization',
        priority: 'medium',
        message: `🎯 Cantidad óptima recomendada: ${predictions.optimalStakingAmount.recommended} POL. ${predictions.optimalStakingAmount.reasoning}`,
        category: 'optimization',
        impact: 'high'
      });
    }
  }
  
  // Timing recommendations
  if (predictions.bestTimingWindows.pattern !== 'insufficient_data') {
    const nextOptimalDate = new Date(predictions.bestTimingWindows.nextOptimalTime);
    recommendations.push({
      type: 'timing',
      priority: 'low',
      message: `⏰ Próximo momento óptimo para depositar: ${nextOptimalDate.toLocaleDateString()}`,
      category: 'timing',
      impact: 'low'
    });
  }
  
  // Future rewards projections
  const monthlyProjection = predictions.futureRewards['30days'];
  if (monthlyProjection && monthlyProjection.rewards > 0) {
    recommendations.push({
      type: 'projection',
      priority: 'info',
      message: `📈 Proyección 30 días: +${monthlyProjection.rewards.toFixed(2)} POL en recompensas`,
      category: 'projection',
      impact: 'low'
    });
  }
  
  // Medium priority recommendations (score 30-70)
  if (score >= 30 && score < 70) {
    if (apyAnalysis?.multipliers.timeBonus < 1) {
      const daysToNext = stakingDays < 90 ? 90 - stakingDays : 
                        stakingDays < 180 ? 180 - stakingDays : 365 - stakingDays;
      const nextBonus = stakingDays < 90 ? "1%" : stakingDays < 180 ? "3%" : "5%";
      recommendations.push({
        type: 'bonus',
        priority: 'medium',
        message: `⏰ Mantén el staking por ${daysToNext} días más para desbloquear ${nextBonus} de bono temporal`,
        category: 'bonus',
        impact: 'medium'
      });
    }
    
    if (totalStaked < 1000 && apyAnalysis?.multipliers.volumeBonus === 0) {
      recommendations.push({
        type: 'volume',
        priority: 'medium',
        message: "📈 Considera aumentar tu stake a 1000+ POL para desbloquear bonos de volumen",
        category: 'bonus',
        impact: 'medium'
      });
    }
  }
  
  // Optimization recommendations (score 70+)
  if (score >= 70) {
    if (stakingDays >= 90 && stakingDays < 180) {
      recommendations.push({
        type: 'milestone',
        priority: 'low',
        message: "🎯 ¡Excelente progreso! Continúa hasta los 180 días para el bono del 3%",
        category: 'milestone',
        impact: 'low'
      });
    } else if (stakingDays >= 180 && stakingDays < 365) {
      recommendations.push({
        type: 'milestone',
        priority: 'low',
        message: "🎯 ¡Buen trabajo! Vas camino al bono máximo del 5% a los 365 días",
        category: 'milestone',
        impact: 'low'
      });
    }
    
    if (totalStaked >= 5000 && apyAnalysis?.multipliers.volumeBonus < 2) {
      recommendations.push({
        type: 'volume',
        priority: 'low',
        message: "💎 Considera hacer staking de 10,000+ POL para maximizar bonos de volumen",
        category: 'bonus',
        impact: 'medium'
      });
    }
  }
  
  // Universal recommendations
  const pendingRewards = safeParseAmount(stakingData.stakingStats.pendingRewards);
  if (pendingRewards > totalStaked * 0.1) {
    recommendations.push({
      type: 'compound',
      priority: 'medium',
      message: "💰 Considera reclamar y re-stakear las recompensas para capitalizar las ganancias",
      category: 'compound',
      impact: 'medium'
    });
  }
  
  // Advanced strategy recommendations
  if (score >= 80) {
    recommendations.push({
      type: 'achievement',
      priority: 'info',
      message: "🏆 ¡Portfolio excelente! Considera compartir tu estrategia con la comunidad",
      category: 'achievement',
      impact: 'low'
    });
    
    if (apyAnalysis?.effectiveAPY > apyAnalysis?.baseAPY * 1.05) {
      recommendations.push({
        type: 'achievement',
        priority: 'info',
        message: "🚀 ¡Optimización APY sobresaliente! Estás ganando 5%+ sobre la tasa base",
        category: 'achievement',
        impact: 'low'
      });
    }
  }
  
  // Sort recommendations by priority
  const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'info': 0 };
  return recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

/**
 * Legacy function for backward compatibility
 */
const generateIntelligentRecommendations = (stakingData, apyAnalysis, score) => {
  // Calculate additional metrics for enhanced recommendations
  const expandedScore = calculateExpandedScore(stakingData, apyAnalysis);
  const riskMetrics = calculateRiskMetrics(stakingData);
  const predictions = generateBasicPredictions(stakingData, apyAnalysis);
  
  // Get enhanced recommendations
  const enhancedRecs = generateEnhancedRecommendations(
    stakingData, apyAnalysis, score, expandedScore, riskMetrics, predictions
  );
  
  // Convert to legacy format (simple strings)
  return enhancedRecs.map(rec => rec.message);
};

/**
 * Analyze staking portfolio with enhanced metrics, risk analysis, and AI-powered recommendations
 * @param {Object} stakingData - Complete staking data from the user
 * @returns {Object} Comprehensive analysis results with Phase 1 & 2 enhancements
 */
const analyzeStakingPortfolio = (stakingData) => {
  // Initialize results object at the beginning
  const results = {
    score: 0,
    performanceSummary: "",
    recommendations: [],
    metrics: {},
    // FASE 1 & 2: New enhanced analysis fields
    expandedScore: null,
    riskAnalysis: null,
    predictions: null,
    enhancedRecommendations: [],
    categorizedRecommendations: {}
  };

  if (!stakingData || !stakingData.userDeposits || stakingData.userDeposits.length === 0) {
    results.score = 0;
    results.performanceSummary = "No staking activity found. Start staking to get an analysis.";
    results.recommendations = ["Visit the Staking Dashboard to make your first deposit."];
    results.metrics = {};
    return results;
  }

  try {
    // Parse values safely
    const totalStaked = safeParseAmount(stakingData.stakingStats.totalStaked);
    const pendingRewards = safeParseAmount(stakingData.stakingStats.pendingRewards);
    const depositCount = stakingData.userDeposits.length;
    const safeWithdrawn = safeParseAmount(stakingData.totalWithdrawn);
    const safeClaimed = safeParseAmount(stakingData.rewardsClaimed);
    
    // Calculate comprehensive APY analysis
    const firstDepositTimestamp = stakingData.userDeposits.reduce((earliest, deposit) =>
      deposit.timestamp < earliest ? deposit.timestamp : earliest,
      stakingData.userDeposits[0].timestamp
    );
    const stakingDays = Math.floor((Date.now() / 1000 - firstDepositTimestamp) / (24 * 3600));
    
    const userData = {
      userDeposits: stakingData.userDeposits,
      totalStaked: stakingData.stakingStats.totalStaked,
      stakingDays,
      totalWithdrawn: safeWithdrawn,
      rewardsClaimed: safeClaimed
    };
    
    const apyAnalysis = calculateUserAPY(userData, stakingData.stakingConstants);
    const baseAPYData = calculateBaseAPY(stakingData.stakingConstants);
    
    // FASE 1: Calculate expanded score with detailed breakdown
    const expandedScore = calculateExpandedScore(stakingData, apyAnalysis);
    results.expandedScore = expandedScore;
    
    // Legacy score for backward compatibility
    results.score = expandedScore.totalScore;
    
    // FASE 2: Calculate risk metrics and predictions
    const riskMetrics = calculateRiskMetrics(stakingData);
    const predictions = generateBasicPredictions(stakingData, apyAnalysis);
    
    results.riskAnalysis = riskMetrics;
    results.predictions = predictions;
    
    // Generate enhanced recommendations with risk analysis
    const enhancedRecommendations = generateEnhancedRecommendations(
      stakingData, apyAnalysis, results.score, expandedScore, riskMetrics, predictions
    );
    
    results.enhancedRecommendations = enhancedRecommendations;
    
    // Legacy recommendations for backward compatibility
    results.recommendations = enhancedRecommendations.map(rec => rec.message);
    
    // Category-based recommendations for better organization
    results.categorizedRecommendations = {
      critical: enhancedRecommendations.filter(rec => rec.type === 'critical'),
      risk: enhancedRecommendations.filter(rec => rec.category === 'risk'),
      optimization: enhancedRecommendations.filter(rec => rec.category === 'optimization'),
      strategy: enhancedRecommendations.filter(rec => rec.category === 'strategy'),
      achievements: enhancedRecommendations.filter(rec => rec.type === 'achievement')
    };
    
    // Enhanced performance summary using APY data and risk analysis
    const apyComparison = apyAnalysis.effectiveAPY / baseAPYData.cappedAPY;
    const totalEarnings = safeClaimed + pendingRewards;
    
    if (results.score >= 80) {
      results.performanceSummary = riskMetrics.riskLevel === 'high' ? 
        `🏆 Excelente rendimiento pero con alto riesgo! Tu APY efectivo de ${formatAPY(apyAnalysis.effectiveAPY)} es ${((apyComparison - 1) * 100).toFixed(1)}% ${apyComparison >= 1 ? 'sobre' : 'bajo'} la tasa base. Score de riesgo: ${riskMetrics.overallRiskScore}/100` :
        `🏆 ¡Rendimiento excepcional! Tu APY efectivo de ${formatAPY(apyAnalysis.effectiveAPY)} es ${((apyComparison - 1) * 100).toFixed(1)}% ${apyComparison >= 1 ? 'sobre' : 'bajo'} la tasa base. ¡Has dominado la optimización de staking!`;
    } else if (results.score >= 60) {
      results.performanceSummary = `📈 ¡Buen rendimiento! Tu APY efectivo de ${formatAPY(apyAnalysis.effectiveAPY)} muestra buena optimización. Con ${stakingDays} días en staking, estás construyendo retornos sólidos. Riesgo: ${riskMetrics.riskLevel}`;
    } else if (results.score >= 40) {
      results.performanceSummary = `⚡ Rendimiento moderado. Tu APY es ${formatAPY(apyAnalysis.effectiveAPY)}, con espacio para mejoras. Enfócate en bonos de tiempo y eficiencia de depósitos. Riesgo: ${riskMetrics.riskLevel}`;
    } else {
      results.performanceSummary = `🎯 Portfolio en etapa temprana. Tu APY actual es ${formatAPY(apyAnalysis.effectiveAPY)}. Sigue las recomendaciones para optimizar tu estrategia. Riesgo: ${riskMetrics.riskLevel}`;
    }
    
    // Enhanced metrics with APY breakdown and Phase 1 & 2 additions
    results.metrics = {
      // Existing metrics
      totalStaked: totalStaked.toFixed(2),
      pendingRewards: pendingRewards.toFixed(4),
      totalEarnings: totalEarnings.toFixed(4),
      effectiveAPY: formatAPY(apyAnalysis.effectiveAPY),
      baseAPY: formatAPY(baseAPYData.cappedAPY),
      apyBonus: formatAPY((apyAnalysis.effectiveAPY - baseAPYData.cappedAPY)),
      daysStaked: stakingDays,
      timeBonus: formatAPY(apyAnalysis.multipliers.timeBonus),
      volumeBonus: formatAPY(apyAnalysis.multipliers.volumeBonus),
      efficiencyScore: formatAPY(apyAnalysis.multipliers.efficiencyMultiplier),
      depositUtilization: ((depositCount / (stakingData.stakingConstants?.MAX_DEPOSITS_PER_USER || 300)) * 100).toFixed(0) + '%',
      totalWithdrawn: safeWithdrawn.toFixed(2),
      rewardsClaimed: safeClaimed.toFixed(4),
      holdRatio: formatAPY(apyAnalysis.metrics.holdRatio),
      roi: formatAPY(apyAnalysis.metrics.roi),
      
      // FASE 1: Advanced metrics
      sharpeRatio: calculateSharpeRatio(stakingData, apyAnalysis),
      consistencyIndex: calculateConsistencyIndex(stakingData),
      capitalEfficiency: calculateCapitalEfficiency(stakingData, apyAnalysis),
      temporalDiversification: calculateTemporalDiversification(stakingData),
      
      // FASE 2: Risk metrics summary
      riskScore: riskMetrics.overallRiskScore,
      riskLevel: riskMetrics.riskLevel,
      concentrationRisk: riskMetrics.concentrationRisk.level,
      liquidityRisk: riskMetrics.liquidityRisk.level,
      timingRisk: riskMetrics.timingRisk.level,
      
      // FASE 2: Prediction highlights
      optimalStakingAmount: predictions.optimalStakingAmount.recommended,
      nextOptimalTiming: predictions.bestTimingWindows.nextOptimalTime,
      projectedRewards30d: predictions.futureRewards['30days']?.rewards || 0
    };
    
  } catch (error) {
    console.error("Error in analysis algorithm:", error);
    results.performanceSummary = "An error occurred during analysis. Please try again.";
    results.score = 0;
    results.metrics = {
      totalStaked: "0.00",
      pendingRewards: "0.00",
      totalEarnings: "0.00",
      effectiveAPY: "0.0%",
      baseAPY: "0.0%",
      apyBonus: "0.0%",
      daysStaked: 0,
      timeBonus: "0.0%",
      volumeBonus: "0.0%",
      efficiencyScore: "0.0%",
      depositUtilization: "0%",
      totalWithdrawn: "0.00",
      rewardsClaimed: "0.00",
      holdRatio: "0.0%",
      roi: "0.0%",
      riskScore: 0,
      riskLevel: 'unknown'
    };
  }

  // Add metadata for version tracking
  results.timestamp = new Date().toISOString();
  results.version = '2.0'; // Indicates Phase 1 & 2 implementation
  results.phases = ['expanded_metrics', 'risk_analysis', 'basic_predictions'];

  return results;
};

// Export the main analysis function and new Phase 1 & 2 functions
export { 
  analyzeStakingPortfolio,
  // FASE 1: Advanced metrics functions
  calculateExpandedScore,
  calculateSharpeRatio,
  calculateConsistencyIndex,
  calculateCapitalEfficiency,
  calculateTemporalDiversification,
  // FASE 2: Risk analysis functions
  calculateRiskMetrics,
  calculateConcentrationRisk,
  calculateLiquidityRisk,
  calculateTimingRisk,
  calculateOverallRiskScore,
  getRiskLevel,
  // FASE 2: Prediction functions
  generateBasicPredictions,
  calculateOptimalStakingAmount,
  identifyOptimalTiming,
  projectFutureRewards,
  generateRiskAdjustedRecommendations,
  // Enhanced recommendation functions
  generateEnhancedRecommendations,
  generateIntelligentRecommendations // Legacy compatibility
};

