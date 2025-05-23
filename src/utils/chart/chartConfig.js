import { chartColors, getResponsiveConfig } from './chartSetup';

// Detect if running on mobile for responsive chart configs
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
const responsiveConfig = getResponsiveConfig(isMobile);

// Common chart styling with responsive adjustments
export const pieChartStyle = {
  outerRadius: responsiveConfig.pieOuterRadius,
  innerRadius: responsiveConfig.pieInnerRadius,
  paddingAngle: 2,
  cornerRadius: 4,
  startAngle: 90,
  endAngle: -270,
};

// Token distribution data transformed for recharts format
export const tokenDistributionData = [
  { name: 'Staking Rewards', value: 20, color: chartColors.purple.primary },
  { name: 'Treasury', value: 15, color: chartColors.blue.primary },
  { name: 'Community Incentives', value: 20, color: chartColors.pink.primary },
  { name: 'Marketing', value: 15, color: chartColors.amber.primary },
  { name: 'Development', value: 20, color: chartColors.teal.primary },
  { name: 'Founder & Team', value: 10, color: chartColors.purple.tertiary }
];

// Detailed info for token distribution tooltips
export const tokenDistributionDetails = {
  'Staking Rewards': 'Long-term holder incentives',
  'Treasury': 'Protocol development & security',
  'Community Incentives': 'Ecosystem growth initiatives',
  'Marketing': 'Marketing & partnerships',
  'Development': 'Technical improvements & innovation',
  'Founder & Team': 'Core team allocation'
};

// Revenue streams data transformed for recharts format
export const revenueStreamsData = [
  { name: 'Diversified Revenue', value: 20, color: chartColors.blue.primary },
  { name: 'Yield Generation', value: 22, color: chartColors.teal.primary },
  { name: 'Risk Management', value: 15, color: chartColors.amber.primary },
  { name: 'Strategic Partnerships', value: 18, color: chartColors.purple.primary },
  { name: 'Long Term Investment', value: 12, color: chartColors.pink.tertiary },
  { name: 'Strategic BTC Reserve', value: 13, color: chartColors.pink.primary }
];

// Detailed info for revenue streams tooltips
export const revenueStreamsDetails = {
  'Diversified Revenue': 'Multiple income streams',
  'Yield Generation': 'Sustainable protocol earnings',
  'Risk Management': 'Security-first approach',
  'Strategic Partnerships': 'High-value collaborations',
  'Long Term Investment': 'Value-accruing assets',
  'Strategic BTC Reserve': 'Bitcoin treasury holdings'
};

// Key metrics data for reuse
export const keyMetricsData = [
  {
    title: "Total Supply",
    value: "5,000,000",
    desc: "Fixed supply, no inflation",
  },
  {
    title: "Circulating Supply",
    value: "0",
    desc: "0% in circulation",
  },
  {
    title: "Treasury Holdings",
    value: "$n/a",
    desc: "For protocol stability",
  },
];

// Custom tooltip component configuration
export const getTooltipStyle = (isMobile) => ({
  backgroundColor: 'rgba(15, 15, 15, 0.85)',
  border: '1px solid rgba(139, 92, 246, 0.3)',
  borderRadius: '6px',
  padding: isMobile ? '8px 12px' : '12px 16px',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
  color: '#fff',
  fontSize: isMobile ? '12px' : '14px',
});
