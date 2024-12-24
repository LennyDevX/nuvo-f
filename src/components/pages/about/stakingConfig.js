import { FaClock, FaChartLine, FaShieldAlt } from 'react-icons/fa';

export const stakingInfo = {
  features: [
    {
      title: "Hourly Rewards",
      description: "Earn 0.24% per day, automatically credited to your stake account",
      iconType: "clock"
    },
    {
      title: "Time Bonus",
      description: "Get up to 5% additional APR based on staking duration",
      iconType: "chart"
    },
    {
      title: "Security First",
      description: "Audited smart contracts with emergency withdrawal system",
      iconType: "shield"
    }
  ],
  details: {
    minStake: "5 POL",
    maxStake: "10,000 POL",
    baseAPR: "25%",
    maxAPR: "125%"
  }
};
