import { ethers } from 'ethers';
import { safeParseNumber, calculateTimeBonus, calculateVolumeBonus } from './apyCalculations';
import { STAKING_CONSTANTS } from './constants';

/**
 * FASE 1: MÉTRICAS AVANZADAS Y SISTEMA DE SCORING MEJORADO
 */

/**
 * Calcula el Sharpe Ratio para staking (retorno ajustado por riesgo)
 * @param {number} returns - Retornos obtenidos
 * @param {number} riskFreeRate - Tasa libre de riesgo (APY base)
 * @param {number} volatility - Volatilidad de los retornos
 * @returns {number} Sharpe Ratio
 */
export const calculateSharpeRatio = (returns, riskFreeRate, volatility) => {
  if (volatility === 0) return 0;
  return (returns - riskFreeRate) / volatility;
};

/**
 * Calcula el índice de consistencia basado en regularidad de depósitos
 * @param {Array} deposits - Array de depósitos del usuario
 * @returns {Object} Métricas de consistencia
 */
export const calculateConsistencyIndex = (deposits) => {
  if (!deposits || deposits.length < 2) {
    return {
      score: 0,
      frequency: 'irregular',
      averageInterval: 0,
      consistency: 'poor'
    };
  }

  // Calcular intervalos entre depósitos
  const intervals = [];
  for (let i = 1; i < deposits.length; i++) {
    const interval = deposits[i].timestamp - deposits[i-1].timestamp;
    intervals.push(interval / (24 * 3600)); // Convertir a días
  }

  const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - averageInterval, 2), 0) / intervals.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Calcular coeficiente de variación (menor = más consistente)
  const coefficientOfVariation = averageInterval > 0 ? standardDeviation / averageInterval : 1;
  
  // Score de consistencia (0-100)
  const consistencyScore = Math.max(0, 100 - (coefficientOfVariation * 50));
  
  let frequency = 'irregular';
  if (averageInterval <= 7) frequency = 'weekly';
  else if (averageInterval <= 30) frequency = 'monthly';
  else if (averageInterval <= 90) frequency = 'quarterly';
  
  let consistency = 'poor';
  if (consistencyScore >= 80) consistency = 'excellent';
  else if (consistencyScore >= 60) consistency = 'good';
  else if (consistencyScore >= 40) consistency = 'fair';
  
  return {
    score: Math.round(consistencyScore),
    frequency,
    averageInterval: Math.round(averageInterval),
    consistency,
    variance: Math.round(variance),
    coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100
  };
};

/**
 * Calcula la eficiencia de capital (ROI por unidad de tiempo)
 * @param {Object} stakingData - Datos de staking del usuario
 * @returns {Object} Métricas de eficiencia de capital
 */
export const calculateCapitalEfficiency = (stakingData) => {
  const totalStaked = safeParseNumber(stakingData.stakingStats?.totalStaked || 0);
  const totalRewards = safeParseNumber(stakingData.stakingStats?.pendingRewards || 0) + 
                      safeParseNumber(stakingData.rewardsClaimed || 0);
  const stakingDays = stakingData.stakingDays || 0;
  
  if (totalStaked === 0 || stakingDays === 0) {
    return {
      dailyROI: 0,
      capitalTurnover: 0,
      efficiencyRating: 'poor',
      timeWeightedReturn: 0
    };
  }
  
  const dailyROI = (totalRewards / totalStaked) / stakingDays;
  const annualizedROI = dailyROI * 365;
  const capitalTurnover = totalRewards / totalStaked;
  const timeWeightedReturn = (totalRewards / totalStaked) * (365 / stakingDays);
  
  let efficiencyRating = 'poor';
  if (annualizedROI >= 0.08) efficiencyRating = 'excellent'; // 8%+
  else if (annualizedROI >= 0.06) efficiencyRating = 'good'; // 6-8%
  else if (annualizedROI >= 0.04) efficiencyRating = 'fair'; // 4-6%
  
  return {
    dailyROI: dailyROI * 100,
    capitalTurnover: capitalTurnover * 100,
    efficiencyRating,
    timeWeightedReturn: timeWeightedReturn * 100,
    annualizedROI: annualizedROI * 100
  };
};

/**
 * Calcula el score de diversificación temporal
 * @param {Array} deposits - Array de depósitos del usuario
 * @returns {Object} Métricas de diversificación temporal
 */
export const calculateTemporalDiversification = (deposits) => {
  if (!deposits || deposits.length === 0) {
    return {
      score: 0,
      distribution: 'concentrated',
      timeSpread: 0,
      diversificationIndex: 0
    };
  }
  
  // Agrupar depósitos por períodos (semanas)
  const weeklyBuckets = {};
  deposits.forEach(deposit => {
    const week = Math.floor(deposit.timestamp / (7 * 24 * 3600));
    weeklyBuckets[week] = (weeklyBuckets[week] || 0) + safeParseNumber(deposit.amount);
  });
  
  const weeks = Object.keys(weeklyBuckets);
  const amounts = Object.values(weeklyBuckets);
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  
  // Calcular índice de Herfindahl para diversificación
  const herfindahlIndex = amounts.reduce((sum, amount) => {
    const share = amount / totalAmount;
    return sum + (share * share);
  }, 0);
  
  // Invertir el índice para que mayor diversificación = mayor score
  const diversificationIndex = 1 - herfindahlIndex;
  const diversificationScore = diversificationIndex * 100;
  
  const timeSpread = weeks.length > 1 ? 
    (Math.max(...weeks) - Math.min(...weeks)) * 7 : 0; // En días
  
  let distribution = 'concentrated';
  if (diversificationScore >= 70) distribution = 'well-diversified';
  else if (diversificationScore >= 40) distribution = 'moderately-diversified';
  
  return {
    score: Math.round(diversificationScore),
    distribution,
    timeSpread,
    diversificationIndex: Math.round(diversificationIndex * 100) / 100,
    weeklyBuckets: weeks.length
  };
};

/**
 * Sistema de scoring expandido con 8 categorías
 * @param {Object} stakingData - Datos de staking del usuario
 * @param {Object} apyAnalysis - Análisis APY del usuario
 * @returns {Object} Score detallado por categorías
 */
export const calculateExpandedScore = (stakingData, apyAnalysis) => {
  const scores = {
    apyPerformance: 0,    // 15 puntos
    stakingAmount: 0,     // 15 puntos
    timeCommitment: 0,    // 15 puntos
    efficiency: 0,        // 10 puntos
    consistency: 0,       // 15 puntos
    riskManagement: 0,    // 10 puntos
    capitalEfficiency: 0, // 10 puntos
    diversification: 0    // 10 puntos
  };
  
  // 1. APY Performance (15 puntos)
  if (apyAnalysis) {
    const apyRatio = apyAnalysis.effectiveAPY / apyAnalysis.baseAPY;
    if (apyRatio >= 1.1) scores.apyPerformance = 15;
    else if (apyRatio >= 1.05) scores.apyPerformance = 12;
    else if (apyRatio >= 1.0) scores.apyPerformance = 10;
    else if (apyRatio >= 0.95) scores.apyPerformance = 6;
    else scores.apyPerformance = 3;
  }
  
  // 2. Staking Amount (15 puntos)
  const totalStaked = safeParseNumber(stakingData.stakingStats?.totalStaked || 0);
  if (totalStaked >= 10000) scores.stakingAmount = 15;
  else if (totalStaked >= 5000) scores.stakingAmount = 12;
  else if (totalStaked >= 1000) scores.stakingAmount = 9;
  else if (totalStaked >= 500) scores.stakingAmount = 6;
  else if (totalStaked >= 100) scores.stakingAmount = 3;
  
  // 3. Time Commitment (15 puntos)
  const stakingDays = apyAnalysis?.metrics?.stakingDays || 0;
  if (stakingDays >= 365) scores.timeCommitment = 15;
  else if (stakingDays >= 180) scores.timeCommitment = 12;
  else if (stakingDays >= 90) scores.timeCommitment = 9;
  else if (stakingDays >= 30) scores.timeCommitment = 6;
  else if (stakingDays >= 7) scores.timeCommitment = 3;
  
  // 4. Strategy Efficiency (10 puntos)
  const depositCount = stakingData.userDeposits?.length || 0;
  const maxDeposits = stakingData.stakingConstants?.MAX_DEPOSITS_PER_USER || 300;
  const utilizationRatio = depositCount / maxDeposits;
  
  if (utilizationRatio <= 0.2) scores.efficiency = 10;
  else if (utilizationRatio <= 0.4) scores.efficiency = 8;
  else if (utilizationRatio <= 0.6) scores.efficiency = 6;
  else if (utilizationRatio <= 0.8) scores.efficiency = 4;
  else scores.efficiency = 2;
  
  // 5. Consistency (15 puntos)
  const consistencyMetrics = calculateConsistencyIndex(stakingData.userDeposits);
  scores.consistency = Math.round((consistencyMetrics.score / 100) * 15);
  
  // 6. Risk Management (10 puntos)
  const holdRatio = apyAnalysis?.metrics?.holdRatio || 0;
  if (holdRatio >= 90) scores.riskManagement = 10;
  else if (holdRatio >= 80) scores.riskManagement = 8;
  else if (holdRatio >= 70) scores.riskManagement = 6;
  else if (holdRatio >= 60) scores.riskManagement = 4;
  else scores.riskManagement = 2;
  
  // 7. Capital Efficiency (10 puntos)
  const capitalEfficiency = calculateCapitalEfficiency(stakingData);
  if (capitalEfficiency.efficiencyRating === 'excellent') scores.capitalEfficiency = 10;
  else if (capitalEfficiency.efficiencyRating === 'good') scores.capitalEfficiency = 8;
  else if (capitalEfficiency.efficiencyRating === 'fair') scores.capitalEfficiency = 6;
  else scores.capitalEfficiency = 3;
  
  // 8. Diversification (10 puntos)
  const diversification = calculateTemporalDiversification(stakingData.userDeposits);
  scores.diversification = Math.round((diversification.score / 100) * 10);
  
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  return {
    totalScore,
    categoryScores: scores,
    breakdown: {
      consistency: consistencyMetrics,
      capitalEfficiency,
      diversification
    }
  };
};

/**
 * FASE 2: ANÁLISIS DE RIESGO Y PREDICCIONES BÁSICAS
 */

/**
 * Calcula métricas de riesgo del portfolio de staking
 * @param {Object} stakingData - Datos de staking del usuario
 * @returns {Object} Métricas de riesgo
 */
export const calculateRiskMetrics = (stakingData) => {
  const deposits = stakingData.userDeposits || [];
  const totalStaked = safeParseNumber(stakingData.stakingStats?.totalStaked || 0);
  const totalWithdrawn = safeParseNumber(stakingData.totalWithdrawn || 0);
  
  // 1. Riesgo de concentración
  const concentrationRisk = calculateConcentrationRisk(deposits);
  
  // 2. Riesgo de liquidez
  const liquidityRisk = calculateLiquidityRisk(stakingData);
  
  // 3. Riesgo de timing
  const timingRisk = calculateTimingRisk(deposits);
  
  // 4. Score de riesgo general
  const overallRiskScore = calculateOverallRiskScore({
    concentrationRisk,
    liquidityRisk,
    timingRisk
  });
  
  return {
    concentrationRisk,
    liquidityRisk,
    timingRisk,
    overallRiskScore,
    riskLevel: getRiskLevel(overallRiskScore)
  };
};

/**
 * Calcula el riesgo de concentración basado en distribución de depósitos
 * @param {Array} deposits - Array de depósitos
 * @returns {Object} Métricas de riesgo de concentración
 */
export const calculateConcentrationRisk = (deposits) => {
  if (!deposits || deposits.length === 0) {
    return { score: 100, level: 'high', description: 'No deposits found' };
  }
  
  const amounts = deposits.map(d => safeParseNumber(d.amount));
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0);
  
  if (totalAmount === 0) {
    return { score: 100, level: 'high', description: 'No staking amount' };
  }
  
  // Calcular índice de Herfindahl para concentración
  const herfindahlIndex = amounts.reduce((sum, amount) => {
    const share = amount / totalAmount;
    return sum + (share * share);
  }, 0);
  
  // Convertir a score de riesgo (0-100, donde 100 = máximo riesgo)
  const concentrationScore = herfindahlIndex * 100;
  
  let level = 'low';
  let description = 'Well diversified deposits';
  
  if (concentrationScore >= 80) {
    level = 'high';
    description = 'Highly concentrated in few large deposits';
  } else if (concentrationScore >= 50) {
    level = 'medium';
    description = 'Moderately concentrated deposits';
  }
  
  return {
    score: Math.round(concentrationScore),
    level,
    description,
    herfindahlIndex: Math.round(herfindahlIndex * 100) / 100
  };
};

/**
 * Calcula el riesgo de liquidez
 * @param {Object} stakingData - Datos de staking
 * @returns {Object} Métricas de riesgo de liquidez
 */
export const calculateLiquidityRisk = (stakingData) => {
  const totalStaked = safeParseNumber(stakingData.stakingStats?.totalStaked || 0);
  const totalWithdrawn = safeParseNumber(stakingData.totalWithdrawn || 0);
  const pendingRewards = safeParseNumber(stakingData.stakingStats?.pendingRewards || 0);
  
  const totalValue = totalStaked + totalWithdrawn;
  const liquidityRatio = totalValue > 0 ? totalWithdrawn / totalValue : 0;
  
  // Score de riesgo basado en ratio de liquidez
  let riskScore = 0;
  let level = 'low';
  let description = 'Good liquidity management';
  
  if (liquidityRatio >= 0.5) {
    riskScore = 80;
    level = 'high';
    description = 'High withdrawal ratio indicates liquidity pressure';
  } else if (liquidityRatio >= 0.3) {
    riskScore = 60;
    level = 'medium';
    description = 'Moderate withdrawal activity';
  } else if (liquidityRatio >= 0.1) {
    riskScore = 30;
    level = 'low';
    description = 'Conservative withdrawal pattern';
  }
  
  // Ajustar por rewards pendientes (mayor liquidez disponible = menor riesgo)
  const rewardsRatio = totalStaked > 0 ? pendingRewards / totalStaked : 0;
  if (rewardsRatio > 0.1) riskScore = Math.max(0, riskScore - 10);
  
  return {
    score: riskScore,
    level,
    description,
    liquidityRatio: Math.round(liquidityRatio * 100),
    rewardsRatio: Math.round(rewardsRatio * 100)
  };
};

/**
 * Calcula el riesgo de timing basado en patrones de depósito
 * @param {Array} deposits - Array de depósitos
 * @returns {Object} Métricas de riesgo de timing
 */
export const calculateTimingRisk = (deposits) => {
  if (!deposits || deposits.length < 2) {
    return {
      score: 50,
      level: 'medium',
      description: 'Insufficient data for timing analysis'
    };
  }
  
  // Analizar distribución temporal de depósitos
  const timestamps = deposits.map(d => d.timestamp).sort((a, b) => a - b);
  const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];
  const averageInterval = timeSpan / (timestamps.length - 1);
  
  // Calcular variabilidad en timing
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i-1]);
  }
  
  const intervalVariance = intervals.reduce((sum, interval) => {
    return sum + Math.pow(interval - averageInterval, 2);
  }, 0) / intervals.length;
  
  const coefficientOfVariation = averageInterval > 0 ? 
    Math.sqrt(intervalVariance) / averageInterval : 1;
  
  // Score de riesgo basado en variabilidad
  let riskScore = Math.min(100, coefficientOfVariation * 50);
  let level = 'low';
  let description = 'Consistent timing pattern';
  
  if (riskScore >= 70) {
    level = 'high';
    description = 'Highly irregular deposit timing';
  } else if (riskScore >= 40) {
    level = 'medium';
    description = 'Moderate timing variability';
  }
  
  return {
    score: Math.round(riskScore),
    level,
    description,
    coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100
  };
};

/**
 * Calcula el score de riesgo general
 * @param {Object} risks - Métricas de riesgo individuales
 * @returns {number} Score de riesgo general (0-100)
 */
export const calculateOverallRiskScore = (risks) => {
  const weights = {
    concentrationRisk: 0.4,
    liquidityRisk: 0.4,
    timingRisk: 0.2
  };
  
  return Math.round(
    risks.concentrationRisk.score * weights.concentrationRisk +
    risks.liquidityRisk.score * weights.liquidityRisk +
    risks.timingRisk.score * weights.timingRisk
  );
};

/**
 * Determina el nivel de riesgo basado en el score
 * @param {number} riskScore - Score de riesgo (0-100)
 * @returns {string} Nivel de riesgo
 */
export const getRiskLevel = (riskScore) => {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
};

/**
 * Genera predicciones básicas basadas en datos históricos
 * @param {Object} stakingData - Datos de staking del usuario
 * @param {Object} apyAnalysis - Análisis APY actual
 * @returns {Object} Predicciones y proyecciones
 */
export const generateBasicPredictions = (stakingData, apyAnalysis) => {
  const predictions = {
    optimalStakingAmount: calculateOptimalStakingAmount(stakingData),
    bestTimingWindows: identifyOptimalTiming(stakingData),
    futureRewards: projectFutureRewards(stakingData, apyAnalysis),
    riskAdjustedRecommendations: generateRiskAdjustedRecommendations(stakingData)
  };
  
  return predictions;
};

/**
 * Calcula la cantidad óptima de staking basada en patrones históricos
 * @param {Object} stakingData - Datos de staking
 * @returns {Object} Recomendación de cantidad óptima
 */
export const calculateOptimalStakingAmount = (stakingData) => {
  const deposits = stakingData.userDeposits || [];
  const currentStaked = safeParseNumber(stakingData.stakingStats?.totalStaked || 0);
  
  if (deposits.length === 0) {
    return {
      recommended: 1000,
      reasoning: 'Start with 1000 POL for optimal volume bonuses',
      confidence: 'medium'
    };
  }
  
  // Analizar eficiencia por tamaño de depósito
  const depositSizes = deposits.map(d => safeParseNumber(d.amount));
  const averageDeposit = depositSizes.reduce((sum, size) => sum + size, 0) / depositSizes.length;
  
  // Recomendar basado en patrones de eficiencia
  let recommended = Math.max(averageDeposit * 1.2, 500);
  let reasoning = 'Based on your historical deposit patterns';
  let confidence = 'high';
  
  // Ajustar por bonos de volumen
  if (currentStaked < 1000) {
    recommended = Math.max(recommended, 1000);
    reasoning = 'Increase to 1000+ POL to unlock volume bonuses';
  } else if (currentStaked < 5000) {
    recommended = Math.max(recommended, 5000);
    reasoning = 'Scale to 5000+ POL for enhanced volume bonuses';
  }
  
  return {
    recommended: Math.round(recommended),
    reasoning,
    confidence
  };
};

/**
 * Identifica ventanas de timing óptimas
 * @param {Object} stakingData - Datos de staking
 * @returns {Object} Recomendaciones de timing
 */
export const identifyOptimalTiming = (stakingData) => {
  const deposits = stakingData.userDeposits || [];
  
  if (deposits.length < 3) {
    return {
      pattern: 'insufficient_data',
      recommendation: 'Make deposits consistently every 30 days',
      nextOptimalTime: Date.now() + (30 * 24 * 60 * 60 * 1000)
    };
  }
  
  // Analizar patrones temporales
  const consistencyMetrics = calculateConsistencyIndex(deposits);
  
  let recommendation = 'Continue your current pattern';
  let nextOptimalTime = Date.now() + (consistencyMetrics.averageInterval * 24 * 60 * 60 * 1000);
  
  if (consistencyMetrics.consistency === 'poor') {
    recommendation = 'Establish a more regular deposit schedule';
    nextOptimalTime = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 días
  }
  
  return {
    pattern: consistencyMetrics.frequency,
    recommendation,
    nextOptimalTime,
    confidence: consistencyMetrics.consistency
  };
};

/**
 * Proyecta rewards futuros basado en tendencias actuales
 * @param {Object} stakingData - Datos de staking
 * @param {Object} apyAnalysis - Análisis APY
 * @returns {Object} Proyecciones de rewards
 */
export const projectFutureRewards = (stakingData, apyAnalysis) => {
  const currentStaked = safeParseNumber(stakingData.stakingStats?.totalStaked || 0);
  const effectiveAPY = apyAnalysis?.effectiveAPY || 8.76;
  
  const periods = [30, 90, 180, 365];
  const projections = {};
  
  periods.forEach(days => {
    const dailyRate = effectiveAPY / 365 / 100;
    const projectedRewards = currentStaked * dailyRate * days;
    
    projections[`${days}days`] = {
      rewards: Math.round(projectedRewards * 100) / 100,
      total: Math.round((currentStaked + projectedRewards) * 100) / 100,
      apy: effectiveAPY
    };
  });
  
  return projections;
};

/**
 * Genera recomendaciones ajustadas por riesgo
 * @param {Object} stakingData - Datos de staking
 * @returns {Array} Recomendaciones ajustadas por riesgo
 */
export const generateRiskAdjustedRecommendations = (stakingData) => {
  const riskMetrics = calculateRiskMetrics(stakingData);
  const recommendations = [];
  
  // Recomendaciones basadas en riesgo de concentración
  if (riskMetrics.concentrationRisk.level === 'high') {
    recommendations.push({
      type: 'risk_reduction',
      priority: 'high',
      message: '🚨 Diversifica tus depósitos para reducir el riesgo de concentración',
      action: 'Make smaller, more frequent deposits'
    });
  }
  
  // Recomendaciones basadas en riesgo de liquidez
  if (riskMetrics.liquidityRisk.level === 'high') {
    recommendations.push({
      type: 'liquidity_management',
      priority: 'medium',
      message: '⚠️ Considera reducir los retiros para mejorar la eficiencia APY',
      action: 'Hold positions longer to maximize returns'
    });
  }
  
  // Recomendaciones basadas en riesgo de timing
  if (riskMetrics.timingRisk.level === 'high') {
    recommendations.push({
      type: 'timing_optimization',
      priority: 'medium',
      message: '📅 Establece un cronograma regular de depósitos',
      action: 'Create a consistent deposit schedule'
    });
  }
  
  // Recomendación general de riesgo
  if (riskMetrics.overallRiskScore >= 60) {
    recommendations.push({
      type: 'overall_risk',
      priority: 'high',
      message: '🛡️ Tu portfolio tiene un riesgo elevado. Considera optimizar tu estrategia',
      action: 'Review and adjust your staking strategy'
    });
  }
  
  return recommendations;
};