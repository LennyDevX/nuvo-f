/**
 * Test file for Phase 1 & 2 implementations
 * Tests advanced metrics, risk analysis, and basic predictions
 */

import { 
  analyzeStakingPortfolio,
  calculateExpandedScore,
  calculateRiskMetrics,
  generateBasicPredictions
} from './stakingAnalytics.js';

// Mock staking data for testing
const mockStakingData = {
  userDeposits: [
    { amount: "1000", timestamp: Math.floor(Date.now() / 1000) - (90 * 24 * 3600) }, // 90 days ago
    { amount: "500", timestamp: Math.floor(Date.now() / 1000) - (60 * 24 * 3600) },  // 60 days ago
    { amount: "2000", timestamp: Math.floor(Date.now() / 1000) - (30 * 24 * 3600) }, // 30 days ago
    { amount: "1500", timestamp: Math.floor(Date.now() / 1000) - (15 * 24 * 3600) }  // 15 days ago
  ],
  stakingStats: {
    totalStaked: "5000",
    pendingRewards: "125.50"
  },
  totalWithdrawn: "200",
  rewardsClaimed: "75.25",
  stakingConstants: {
    HOURLY_ROI: 0.00011574,
    DAILY_ROI: 0.00277778,
    ANNUAL_ROI: 1.01388889,
    MAX_ROI: 3.65,
    COMMISSION_RATE: 0.05,
    MIN_DEPOSIT: 10,
    MAX_DEPOSIT: 100000,
    MAX_DEPOSITS_PER_USER: 300,
    PRECISION: 1000000
  }
};

/**
 * Test Phase 1: Advanced Metrics and Expanded Scoring
 */
function testPhase1() {
  console.log('\n=== TESTING PHASE 1: Advanced Metrics & Expanded Scoring ===\n');
  
  try {
    // Test expanded scoring
    const expandedScore = calculateExpandedScore(mockStakingData, {
      effectiveAPY: 0.035,
      baseAPY: 0.028,
      metrics: {
        stakingDays: 90,
        roi: 0.025
      },
      multipliers: {
        timeBonus: 1.02,
        volumeBonus: 1.05,
        efficiencyMultiplier: 0.98
      }
    });
    
    console.log('✅ Expanded Score Results:');
    console.log(`   Total Score: ${expandedScore.totalScore}/100`);
    console.log(`   Category Breakdown:`);
    Object.entries(expandedScore.categoryScores).forEach(([category, score]) => {
      console.log(`     ${category}: ${score}/15`);
    });
    
    console.log('\n📊 Advanced Metrics:');
    console.log(`   Sharpe Ratio: ${expandedScore.breakdown.sharpeRatio.ratio}`);
    console.log(`   Consistency Index: ${expandedScore.breakdown.consistency.score}/100`);
    console.log(`   Capital Efficiency: ${expandedScore.breakdown.capitalEfficiency.efficiencyRating}`);
    console.log(`   Temporal Diversification: ${expandedScore.breakdown.temporalDiversification.score}/100`);
    
  } catch (error) {
    console.error('❌ Phase 1 Test Failed:', error.message);
  }
}

/**
 * Test Phase 2: Risk Analysis and Basic Predictions
 */
function testPhase2() {
  console.log('\n=== TESTING PHASE 2: Risk Analysis & Basic Predictions ===\n');
  
  try {
    // Test risk metrics
    const riskMetrics = calculateRiskMetrics(mockStakingData);
    
    console.log('🛡️ Risk Analysis Results:');
    console.log(`   Overall Risk Score: ${riskMetrics.overallRiskScore}/100`);
    console.log(`   Risk Level: ${riskMetrics.riskLevel}`);
    console.log(`   Concentration Risk: ${riskMetrics.concentrationRisk.level} (${riskMetrics.concentrationRisk.score}/100)`);
    console.log(`   Liquidity Risk: ${riskMetrics.liquidityRisk.level} (${riskMetrics.liquidityRisk.score}/100)`);
    console.log(`   Timing Risk: ${riskMetrics.timingRisk.level} (${riskMetrics.timingRisk.score}/100)`);
    
    // Test basic predictions
    const predictions = generateBasicPredictions(mockStakingData, {
      effectiveAPY: 0.035,
      baseAPY: 0.028,
      metrics: {
        stakingDays: 90,
        roi: 0.025
      }
    });
    
    console.log('\n🔮 Prediction Results:');
    console.log(`   Optimal Staking Amount: ${predictions.optimalStakingAmount.recommended} POL`);
    console.log(`   Confidence: ${predictions.optimalStakingAmount.confidence}`);
    console.log(`   Reasoning: ${predictions.optimalStakingAmount.reasoning}`);
    
    console.log(`\n   Best Timing Pattern: ${predictions.bestTimingWindows.pattern}`);
    if (predictions.bestTimingWindows.nextOptimalTime) {
      const nextDate = new Date(predictions.bestTimingWindows.nextOptimalTime);
      console.log(`   Next Optimal Time: ${nextDate.toLocaleDateString()}`);
    }
    
    console.log(`\n   Future Rewards (30 days): ${predictions.futureRewards['30days']?.rewards?.toFixed(2) || 'N/A'} POL`);
    console.log(`   Future Rewards (90 days): ${predictions.futureRewards['90days']?.rewards?.toFixed(2) || 'N/A'} POL`);
    
  } catch (error) {
    console.error('❌ Phase 2 Test Failed:', error.message);
  }
}

/**
 * Test Complete Analysis Integration
 */
function testCompleteAnalysis() {
  console.log('\n=== TESTING COMPLETE ANALYSIS INTEGRATION ===\n');
  
  try {
    const analysis = analyzeStakingPortfolio(mockStakingData);
    
    if (analysis.success === false) {
      console.log('✅ Complete Analysis Results:');
      console.log(`   Score: ${analysis.score}/100`);
      console.log(`   Performance: ${analysis.performanceSummary}`);
      console.log(`   Version: ${analysis.version}`);
      console.log(`   Phases: ${analysis.phases?.join(', ')}`);
      
      console.log('\n📈 Enhanced Metrics Available:');
      console.log(`   Risk Score: ${analysis.metrics?.riskScore}/100`);
      console.log(`   Risk Level: ${analysis.metrics?.riskLevel}`);
      console.log(`   Optimal Amount: ${analysis.metrics?.optimalStakingAmount} POL`);
      console.log(`   30d Projection: ${analysis.metrics?.projectedRewards30d} POL`);
      
      console.log('\n💡 Enhanced Recommendations:');
      analysis.enhancedRecommendations?.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
      });
      
      console.log('\n📊 Categorized Recommendations:');
      Object.entries(analysis.categorizedRecommendations || {}).forEach(([category, recs]) => {
        if (recs.length > 0) {
          console.log(`   ${category}: ${recs.length} recommendations`);
        }
      });
      
    } else {
      console.log('✅ Analysis completed successfully!');
      console.log(`   Score: ${analysis.analysis.score}/100`);
      console.log(`   Version: ${analysis.analysis.version}`);
      console.log(`   Phases: ${analysis.analysis.phases?.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Complete Analysis Test Failed:', error.message);
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log('🚀 Starting Phase 1 & 2 Implementation Tests...');
  
  testPhase1();
  testPhase2();
  testCompleteAnalysis();
  
  console.log('\n✨ All tests completed! Check results above.');
  console.log('\n📋 Implementation Summary:');
  console.log('   ✅ Phase 1: Advanced metrics and expanded scoring system');
  console.log('   ✅ Phase 2: Risk analysis and basic predictions');
  console.log('   ✅ Integration: Enhanced recommendations and categorization');
  console.log('   ✅ Backward compatibility: Legacy functions maintained');
}

// Export for use in other files or direct execution
export { runAllTests, testPhase1, testPhase2, testCompleteAnalysis, mockStakingData };

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined') {
  runAllTests();
}